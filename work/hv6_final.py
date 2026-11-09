import json
d={q['no']:q for q in json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))}
def n(s): return s.replace('\n','').replace('​','').replace(' ','')
h=json.load(open('/Users/hiroshi.ohama/develop/jpn/work/hint_v6.json'))
print(len(h))
for k,v in h.items():
    q=d[int(k)]
    if int(k)==905: continue
    ps=v.split(' / ')
    if len(q['answer'])>1 and len(ps)!=len(q['answer']): print('PARTS',k)
    if len(q['answer'])==1 and len(ps)>1: print('SINGLE2',k)
    cor=[n(c['text']) for c in q['choices'] if c['key'] in q['answer']]
    wrong=[(c['key'],n(c['text'])) for c in q['choices'] if c['key'] not in q['answer']]
    for i,p in enumerate(ps):
        t=cor[i] if len(cor)==len(ps) else ''.join(cor)
        pos=t.find(n(p))
        if pos<0: print('NOTFOUND',k,p)
        hit=[key for key,w in wrong if n(p) in w]
        if hit: print('INWRONG',k,p,hit)
