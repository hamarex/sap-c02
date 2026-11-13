#!/usr/bin/env python3
"""ページ分割: 1ページの「項目」(箇条書きの li + 表のデータ行)を MIN_ITEMS〜MAX_ITEMS 個に収める。

手本 (gaimuin/app) は1ページ 3〜6 項目・重要用語 3〜6 個。work/ch1〜4.json の pages を読み、
超過ページを h4 / 表 / リストの境目で分割して書き戻す。冪等（条件を満たすページは変更しない）。

使い方: python3 work/split_pages.py [--dry-run]
  ch*_build.py を再実行して ch*.json を作り直した場合は、その後でこれを再実行すること。
分割後のページ ID は '<lesson>-p<連番>' に振り直す。oxIds は本文との語の重なりで子ページへ振り分ける。
"""
import itertools
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
MIN_ITEMS, MAX_ITEMS = 3, 6
MIN_KEY, MAX_KEY = 3, 6
BLOCK = re.compile(r"<h4>.*?</h4>|<table>.*?</table>|<ul>.*?</ul>|<ol>.*?</ol>|<p>.*?</p>", re.S)
KEY = re.compile(r'<b\s+class=["\']key["\']')


def plain(s):
    return re.sub(r"<[^>]+>", "", s)


def elements(html):
    """html を要素列にする。要素: dict(kind, html, items, key, ctx)。ctx は所属コンテナの識別子。"""
    blocks = BLOCK.findall(html)
    if "".join(blocks) != html:
        raise ValueError("未対応のHTML構造")
    out, head = [], None
    for bi, b in enumerate(blocks):
        if b.startswith("<h4>"):
            head = plain(b)
            out.append(dict(kind="h4", html=b, items=0, key=len(KEY.findall(b)), ctx=None, head=head))
        elif b.startswith("<table>"):
            rows = re.findall(r"<tr>.*?</tr>", b, re.S)
            header = rows[0] if "<th>" in rows[0] else None
            for r in rows[1:] if header else rows:
                out.append(dict(kind="row", html=r, items=1, key=len(KEY.findall(r)), ctx=bi, header=header, head=head))
        elif b.startswith(("<ul>", "<ol>")):
            tag = b[1:3]
            for li in re.findall(r"<li>.*?</li>", b, re.S):
                out.append(dict(kind="li", html=li, items=1, key=len(KEY.findall(li)), ctx=bi, tag=tag, head=head))
        else:
            out.append(dict(kind="p", html=b, items=0, key=len(KEY.findall(b)), ctx=None, head=head))
    return out


def render(els, all_els, start):
    """els = all_els[start:start+len(els)] を HTML に戻す。途中から始まるコンテナには「（続き）」見出しを補う。"""
    out, i = [], 0
    first = els[0]
    if first["kind"] in ("li", "row") and start > 0 and all_els[start - 1]["ctx"] == first["ctx"] and first["head"]:
        out.append("<h4>%s（続き）</h4>" % first["head"])
    while i < len(els):
        e = els[i]
        if e["kind"] in ("h4", "p"):
            out.append(e["html"]); i += 1; continue
        j = i
        while j < len(els) and els[j]["ctx"] == e["ctx"]:
            j += 1
        group = els[i:j]
        if e["kind"] == "row":
            out.append("<table>" + (e["header"] or "") + "".join(g["html"] for g in group) + "</table>")
        else:
            attr = ""
            if e["tag"] == "ol":  # 番号を連続させる
                done = sum(1 for x in all_els[:start + i] if x["ctx"] == e["ctx"])
                if done:
                    attr = ' start="%d"' % (done + 1)
            out.append("<%s%s>%s</%s>" % (e["tag"], attr, "".join(g["html"] for g in group), e["tag"]))
        i = j
    return "".join(out)


def stats(html):
    els = elements(html)
    return sum(e["items"] for e in els), sum(e["key"] for e in els)


def plan_cuts(els):
    """DP で分割位置を決める。返り値: チャンクの (start, end) のリスト。"""
    m = len(els)
    pre_i, pre_k = [0], [0]
    for e in els:
        pre_i.append(pre_i[-1] + e["items"]); pre_k.append(pre_k[-1] + e["key"])

    def cut_ok(i):  # i の直前で切ってよいか
        return not (els[i - 1]["kind"] == "h4" or els[i]["kind"] == "p")

    def cut_pen(i):  # コンテナの途中で切るペナルティ
        a, b = els[i - 1], els[i]
        return 3 if (a["ctx"] is not None and a["ctx"] == b["ctx"]) else 0

    total = pre_i[-1]
    target = total / max(1, -(-total // MAX_ITEMS))
    INF = float("inf")
    best = [INF] * (m + 1); prev = [-1] * (m + 1); best[0] = 0
    for j in range(1, m + 1):
        for i in range(j):
            if best[i] == INF or (i > 0 and not cut_ok(i)):
                continue
            n, k = pre_i[j] - pre_i[i], pre_k[j] - pre_k[i]
            if n > MAX_ITEMS:
                continue
            cost = best[i] + 100 + (cut_pen(i) if i > 0 else 0) + (n - target) ** 2
            if n < MIN_ITEMS and total >= MIN_ITEMS:
                cost += 1000
            if k < MIN_KEY:
                cost += 40 * (MIN_KEY - k)
            if k > MAX_KEY:
                cost += 40 * (k - MAX_KEY)
            if cost < best[j]:
                best[j], prev[j] = cost, i
    if best[m] == INF:
        raise ValueError("分割できません")
    cuts, j = [], m
    while j > 0:
        cuts.append((prev[j], j)); j = prev[j]
    return cuts[::-1]


def grams(s):
    s = re.sub(r"\s+", "", plain(s))
    return {s[i:i + 2] for i in range(len(s) - 1)}


def assign_ox(chunks_html, ox_ids, ox_by_id):
    """oxIds を子ページへ。各子ページに最低1問（問題数が足りる限り）で、本文との重なりが最大の割当を選ぶ。"""
    n = len(chunks_html)
    cg = [grams(h) for h in chunks_html]
    sc = {}
    for o in ox_ids:
        g = grams(ox_by_id[o]["text"] + ox_by_id[o].get("explain", ""))
        sc[o] = [len(g & c) / (len(g) or 1) for c in cg]
    best, best_s = None, -1
    for combo in itertools.product(range(n), repeat=len(ox_ids)):
        if len(ox_ids) >= n and len(set(combo)) < n:
            continue
        s = sum(sc[o][c] for o, c in zip(ox_ids, combo))
        if s > best_s:
            best, best_s = combo, s
    return [[o for o, c in zip(ox_ids, best) if c == k] for k in range(n)]


def title_for(base, k):
    return base if k == 0 else base + "（続き）" if k == 1 else "%s（続き%d）" % (base, k)


def split_chapter(ch, report):
    ox_by_id = {o["id"]: o for o in ch["ox"]}
    for les in ch["lessons"]:
        new_pages = []
        for pg in les["pages"]:
            els = elements(pg["html"])
            n, k = sum(e["items"] for e in els), sum(e["key"] for e in els)
            if n <= MAX_ITEMS:
                new_pages.append(dict(pg)); continue
            cuts = plan_cuts(els)
            htmls = [render(els[a:b], els, a) for a, b in cuts]
            oxs = assign_ox(htmls, pg["oxIds"], ox_by_id)
            for idx, (h, oi) in enumerate(zip(htmls, oxs)):
                new_pages.append(dict(id="", title=title_for(pg["title"], idx), html=h, oxIds=oi))
            report.append("%s: items=%d key=%d -> %s" % (pg["id"], n, k, [stats(h) for h in htmls]))
        for i, p in enumerate(new_pages, 1):
            p["id"] = "%s-p%d" % (les["id"], i)
        les["pages"] = new_pages
    return ch


def main():
    dry = "--dry-run" in sys.argv
    report, summary = [], []
    for n in range(1, 5):
        path = HERE / ("ch%d.json" % n)
        ch = split_chapter(json.loads(path.read_text(encoding="utf-8")), report)
        pages = [p for l in ch["lessons"] for p in l["pages"]]
        summary.append((n, len(pages), [stats(p["html"]) for p in pages]))
        if not dry:
            path.write_text(json.dumps(ch, ensure_ascii=False, indent=1), encoding="utf-8")
    print("\n".join(report))
    allst = [s for _, _, ss in summary for s in ss]
    print("章別ページ数:", {n: c for n, c, _ in summary}, "合計", len(allst))
    bad_i = [s for s in allst if not MIN_ITEMS <= s[0] <= MAX_ITEMS]
    bad_k = [s for s in allst if not MIN_KEY <= s[1] <= MAX_KEY]
    print("項目数が%d〜%d外: %d ページ / キー用語が%d〜%d外: %d ページ" % (MIN_ITEMS, MAX_ITEMS, len(bad_i), MIN_KEY, MAX_KEY, len(bad_k)), bad_i[:10], bad_k[:10])
    print("(dry-run: 書き込みなし)" if dry else "ch*.json を更新しました")


if __name__ == "__main__":
    main()
