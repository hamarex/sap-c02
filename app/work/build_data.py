#!/usr/bin/env python3
"""work/ch1.json〜ch4.json (各 chapters 要素1つ) を検証して ../data.js を生成する。

使い方: python3 work/build_data.py [--allow-missing]
  --allow-missing : 存在しない章ファイルを許可(部分ビルド)。
  --allow-key-range : page の <b class="key"> 個数(3〜6)違反をエラーでなく警告にする。
mc の answer / answers は 1 始まりの選択肢番号 (answer:2 は B)。
"""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data.js"
VOID = {"br", "hr", "img", "input", "meta", "link", "wbr", "col"}


class TagChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack, self.errors = [], []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack or self.stack[-1] != tag:
            self.errors.append("</%s> が対応しない（開いている: %s）" % (tag, self.stack[-1] if self.stack else "なし"))
            if tag in self.stack:
                while self.stack and self.stack.pop() != tag:
                    pass
        else:
            self.stack.pop()


def check_html(html):
    p = TagChecker()
    p.feed(html)
    p.close()
    errs = list(p.errors)
    if p.stack:
        errs.append("閉じられていないタグ: " + ",".join(p.stack))
    return errs


def build():
    errors = []
    err = errors.append
    allow_missing = "--allow-missing" in sys.argv
    allow_key_range = "--allow-key-range" in sys.argv
    chapters = []
    for n in range(1, 5):
        f = HERE / ("ch%d.json" % n)
        if not f.exists():
            if not allow_missing:
                err("%s が見つかりません" % f.name)
            continue
        try:
            c = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            err("%s: JSONとして不正 (行%d 列%d: %s)" % (f.name, e.lineno, e.colno, e.msg))
            continue
        if isinstance(c, dict) and "chapters" in c:
            c = c["chapters"][0]
        chapters.append((f.name, n, c))

    seen = {}

    def uniq(fn, kind, id_):
        if not isinstance(id_, str) or not id_:
            err("%s: %s の id が空/文字列でない: %r" % (fn, kind, id_))
            return
        if id_ in seen:
            err("%s: ID重複 %s (%s と %s)" % (fn, id_, seen[id_], fn))
        seen[id_] = fn

    def req(fn, where, obj, fields):
        for k, t in fields.items():
            if k not in obj:
                err("%s: %s に必須フィールド '%s' がありません" % (fn, where, k))
            elif not isinstance(obj[k], t) or (t is int and isinstance(obj[k], bool)):
                err("%s: %s の '%s' の型が不正です (期待: %s)" % (fn, where, k, t.__name__))

    out = []
    for fn, n, c in chapters:
        req(fn, "章", c, {"no": int, "title": str, "lessons": list, "ox": list, "mc": list})
        if c.get("no") != n:
            err("%s: no=%r ですがファイル番号は %d" % (fn, c.get("no"), n))
        oxmap = {}
        lesson_ids = set()
        referenced = set()
        for l in c.get("lessons", []):
            req(fn, "lesson", l, {"id": str, "title": str, "pages": list})
            uniq(fn, "lesson", l.get("id"))
            lesson_ids.add(l.get("id"))
            if not l.get("pages"):
                err("%s: lesson %s に pages がありません" % (fn, l.get("id")))
            for pg in l.get("pages", []):
                w = "page %s" % pg.get("id")
                req(fn, w, pg, {"id": str, "title": str, "html": str, "oxIds": list})
                uniq(fn, "page", pg.get("id"))
                for e in check_html(pg.get("html", "")):
                    err("%s: %s の html: %s" % (fn, w, e))
                html = pg.get("html", "") if isinstance(pg.get("html"), str) else ""
                nkey = len(re.findall(r'<b\s+class=["\']key["\']', html))
                if not 3 <= nkey <= 6:
                    msg = "page %s の <b class=\"key\"> が %d 個です (3〜6個にしてください)" % (pg.get("id"), nkey)
                    if allow_key_range:
                        print("警告: %s: %s" % (fn, msg))
                    else:
                        err("%s: %s" % (fn, msg))
                ntrap = len(re.findall(r'class=["\']trap["\']', html))
                if ntrap > 2:
                    print("警告: %s: page %s の trap が %d 個です (最大2個が目安)" % (fn, pg.get("id"), ntrap))
                for oid in pg.get("oxIds", []):
                    if oid in referenced:
                        err("%s: %s の oxIds %s が複数ページから参照されています" % (fn, w, oid))
                    referenced.add(oid)
        for q in c.get("ox", []):
            w = "ox %s" % q.get("id")
            req(fn, w, q, {"id": str, "lesson": str, "text": str, "answer": bool, "explain": str})
            uniq(fn, "ox", q.get("id"))
            oxmap[q.get("id")] = q
            if q.get("lesson") not in lesson_ids:
                err("%s: %s の lesson '%s' が存在しません" % (fn, w, q.get("lesson")))
            for k in ("text", "explain"):
                for e in check_html(q.get(k, "") if isinstance(q.get(k), str) else ""):
                    err("%s: %s の %s: %s" % (fn, w, k, e))
        for r in sorted(referenced - set(oxmap)):
            err("%s: oxIds が参照する %s が ox に存在しません" % (fn, r))
        for r in sorted(set(oxmap) - referenced):
            err("%s: ox %s がどのページの oxIds からも参照されていません" % (fn, r))
        for l in c.get("lessons", []):
            for pg in l.get("pages", []):
                for oid in pg.get("oxIds", []):
                    if oid in oxmap and oxmap[oid].get("lesson") != l.get("id"):
                        err("%s: ox %s の lesson(%s) が属するレッスン(%s) と一致しません" % (fn, oid, oxmap[oid].get("lesson"), l.get("id")))
                if not 2 <= len(pg.get("oxIds", [])) <= 3:
                    print("警告: %s page %s の ox が %d 問です (2〜3問が目安)" % (fn, pg.get("id"), len(pg.get("oxIds", []))))
        for q in c.get("mc", []):
            w = "mc %s" % q.get("id")
            req(fn, w, q, {"id": str, "stem": str, "choices": list, "explain": list, "tip": str, "domain": int})
            uniq(fn, "mc", q.get("id"))
            m = re.match(r"^mc-(\d+)-\d+$", q.get("id", "") if isinstance(q.get("id"), str) else "")
            if not m or int(m.group(1)) != n:
                err("%s: %s のIDは mc-%d-NNN 形式にしてください" % (fn, w, n))
            if q.get("domain") != n:
                err("%s: %s の domain=%r (章番号 %d と不一致)" % (fn, w, q.get("domain"), n))
            if "items" in q and not isinstance(q["items"], list):
                err("%s: %s の items は配列にしてください" % (fn, w))
            ch = q.get("choices", [])
            if not all(isinstance(x, str) and x for x in ch):
                err("%s: %s の choices に空/非文字列があります" % (fn, w))
            if len(set(ch)) != len(ch):
                err("%s: %s の choices に同一文面があります" % (fn, w))
            if len(q.get("explain", [])) != len(ch):
                err("%s: %s の explain 数(%d) が choices 数(%d) と一致しません" % (fn, w, len(q.get("explain", [])), len(ch)))
            if "answers" in q:
                a = q["answers"]
                if "answer" in q:
                    err("%s: %s は複数選択なので answer を持たせないでください" % (fn, w))
                if not isinstance(a, list) or not a or not all(isinstance(x, int) and not isinstance(x, bool) and 1 <= x <= len(ch) for x in a):
                    err("%s: %s の answers が不正です (1〜%d の整数配列): %r" % (fn, w, len(ch), a))
                elif len(set(a)) != len(a):
                    err("%s: %s の answers に重複があります" % (fn, w))
                elif q.get("select") != len(a) or q.get("select") not in (2, 3):
                    err("%s: %s の select=%r は answers 数(%d)・2or3 と一致が必要です" % (fn, w, q.get("select"), len(a)))
                if len(ch) < 5:
                    err("%s: %s 複数選択は choices 5つ以上が必要です (現在 %d)" % (fn, w, len(ch)))
            else:
                a = q.get("answer")
                if not isinstance(a, int) or isinstance(a, bool) or not 1 <= a <= len(ch):
                    err("%s: %s の answer=%r が範囲外です (1〜%d)" % (fn, w, a, len(ch)))
                if len(ch) != 4:
                    err("%s: %s 択一は choices 4つが必要です (現在 %d)" % (fn, w, len(ch)))
            for e in check_html(q.get("stem", "") if isinstance(q.get("stem"), str) else ""):
                err("%s: %s の stem: %s" % (fn, w, e))
            for i, ex in enumerate(q.get("explain", [])):
                for e in check_html(ex if isinstance(ex, str) else ""):
                    err("%s: %s の explain[%d]: %s" % (fn, w, i, e))
        out.append(c)

    if errors:
        print("検証エラー %d 件:" % len(errors), file=sys.stderr)
        for e in errors:
            print("  - " + e, file=sys.stderr)
        sys.exit(1)

    data = {"chapters": out}
    OUT.write_text("window.DATA = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    for c in out:
        print("第%d章: lessons=%d pages=%d ox=%d mc=%d(複数選択%d)" % (
            c["no"], len(c["lessons"]), sum(len(l["pages"]) for l in c["lessons"]), len(c["ox"]), len(c["mc"]),
            sum(1 for q in c["mc"] if "answers" in q)))
    print("書き出し: %s" % OUT)


if __name__ == "__main__":
    build()
