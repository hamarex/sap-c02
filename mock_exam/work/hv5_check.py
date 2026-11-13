import json,sys,re
d={q['no']:q for q in json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))}
h=json.load(open('/Users/hiroshi.ohama/develop/jpn/work/hv5_work.json'))
ns=[int(k) for k in h]
if len(sys.argv)>1: ns=[n for n in ns if int(sys.argv[1])<=n<=int(sys.argv[2])]
for n in sorted(ns):
    q=d[n]; hint=h[str(n)]; parts=hint.split(' / ')
    if len(parts)!=len(q['answer']): print(n,'PARTS',len(parts),len(q['answer']),hint)
    ans=[c['text'] for c in q['choices'] if c['key'] in q['answer']]
    for i,p in enumerate(parts):
        t=ans[i] if len(ans)==len(parts) else ' '.join(ans)
        pos=t.find(p)
        if pos<0: print(n,'NOTFOUND',repr(p),'|',hint)
        elif pos>40: print(n,'POS',pos,repr(p))
        if len(p)>14: print(n,'LEN',len(p),repr(p))
