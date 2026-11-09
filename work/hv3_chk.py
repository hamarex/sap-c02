import json,sys
d={q['no']:q for q in json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))}
h=json.load(open(sys.argv[1]))
a,b=int(sys.argv[2]),int(sys.argv[3])
for no in range(a,b+1):
    q=d[no]; ans=q['answer'] if isinstance(q['answer'],list) else list(q['answer'])
    k=str(no)
    if k not in h: print(no,'MISSING'); continue
    parts=h[k].split(' / ')
    if len(ans)>1 and len(parts)!=len(ans): print(no,'PARTS MISMATCH',h[k])
    if len(ans)==1 and len(parts)>1: print(no,'single-multi',h[k])
    for i,p in enumerate(parts):
        txts=[c['text'] for c in q['choices'] if c['key'] in ans]
        t = txts[i] if len(ans)>1 and len(parts)==len(ans) else None
        cand=[t] if t else txts
        offs=[x.find(p) for x in cand if p in x]
        if not offs: print(no,'NOTFOUND',repr(p)); continue
        if min(offs)>40: print(no,'LATE',min(offs),p)
