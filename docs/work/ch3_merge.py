import json, importlib
chap = {'no': 3, 'title': '既存ソリューションの継続的改善', 'lessons': [], 'ox': [], 'mc': []}
for i in range(1, 9):
    m = importlib.import_module(f'ch3_l{i}')
    chap['lessons'].append(m.LESSON); chap['ox'] += m.OX
from ch3_mc1 import MC as A
from ch3_mc2 import MC as B
for n, q in enumerate(A + B, 1):
    q = dict(q); q = {'id': f'mc-3-{n:03d}', **q}
    chap['mc'].append(q)
json.dump(chap, open('ch3.json', 'w'), ensure_ascii=False, indent=1)
# validate
ids = set(); oxids = {o['id'] for o in chap['ox']}
assert len(oxids) == len(chap['ox'])
pc = 0
for L in chap['lessons']:
    for p in L['pages']:
        pc += 1
        assert 2 <= len(p['oxIds']) <= 3, p['id']
        for o in p['oxIds']: assert o in oxids
for q in chap['mc']:
    assert q['id'] not in ids; ids.add(q['id'])
    n = len(q['choices']); assert len(q['explain']) == n, q['id']
    if 'answers' in q:
        assert n >= 5 and all(1 <= a <= n for a in q['answers']) and q['select'] == len(q['answers']), q['id']
    else:
        assert n == 4 and 1 <= q['answer'] <= n, q['id']
    assert '<' not in ''.join(q['choices'])
print('lessons', len(chap['lessons']), 'pages', pc, 'ox', len(chap['ox']), 'mc', len(chap['mc']),
      'multi', sum('answers' in q for q in chap['mc']))
import collections
print(collections.Counter(q.get('answer') for q in chap['mc']))

# ---- post-process: limit key/trap, rebalance answers
import re, random
KEY = re.compile(r'<b class="key">(.*?)</b>', re.S)
TRAP = re.compile(r'<span class="trap">(.*?)</span>', re.S)
def limit(html, rx, maxn, minkeep=None):
    ms = list(rx.finditer(html))
    n = len(ms)
    if n <= maxn: return html
    keep = {round(i * (n - 1) / (maxn - 1)) for i in range(maxn)} if maxn > 1 else {0}
    out, last = [], 0
    for i, m in enumerate(ms):
        out.append(html[last:m.start()])
        out.append(m.group(0) if i in keep else m.group(1))
        last = m.end()
    out.append(html[last:])
    return ''.join(out)
for L in chap['lessons']:
    for p in L['pages']:
        h = limit(p['html'], KEY, 6)
        h = limit(h, TRAP, 2) if False else h
        # traps: keep first 2
        cnt = [0]
        def tr(m):
            cnt[0] += 1
            return m.group(0) if cnt[0] <= 2 else m.group(1)
        h = TRAP.sub(tr, h)
        p['html'] = h
        k = len(KEY.findall(h)); assert 3 <= k <= 6, (p['id'], k)
rnd = random.Random(3)
t = 0
for q in chap['mc']:
    n = len(q['choices'])
    if 'answers' in q:
        order = list(range(n)); rnd.shuffle(order)
    else:
        target = [3, 1, 4, 2][t % 4]; t += 1
        a = q['answer'] - 1
        rest = [i for i in range(n) if i != a]
        order = rest[:target - 1] + [a] + rest[target - 1:]
    pos = {old: new for new, old in enumerate(order)}
    q['choices'] = [q['choices'][i] for i in order]
    q['explain'] = [q['explain'][i] for i in order]
    if 'answers' in q: q['answers'] = sorted(pos[a - 1] + 1 for a in q['answers'])
    else: q['answer'] = pos[q['answer'] - 1] + 1
json.dump(chap, open('ch3.json', 'w'), ensure_ascii=False, indent=1)
print('keys per page', [len(KEY.findall(p['html'])) for L in chap['lessons'] for p in L['pages']])
print(collections.Counter(q.get('answer') for q in chap['mc']), [q['answers'] for q in chap['mc'] if 'answers' in q])
