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
    if no==351: continue
    for i,p in enumerate(parts):
        txts={c['key']:c['text'] for c in q['choices']}
        own=ans[i] if (len(ans)>1 and len(parts)==len(ans)) else None
        hits=[kk for kk,t in txts.items() if p in t]
        owns=[own] if own else ans
        if not any(o in hits for o in owns): print(no,'NOTFOUND',repr(p)); continue
        wrong=[kk for kk in hits if kk not in ans]
        off=min(txts[o].find(p) for o in owns if o in hits)
        flag=[]
        if wrong: flag.append('also-in-wrong:'+','.join(wrong))
        if off>40: flag.append('late%d'%off)
        if flag: print(no,repr(p),' '.join(flag))
