import json
W='/Users/hiroshi.ohama/develop/jpn/work/'
out={}
for f in ['hv4_p1.json','hv4_p2.json','hv4_p3.json','hv4_p4.json','hv4_p5.json','hv4_fix.json']:
    out.update(json.load(open(W+f)))
out=dict(sorted(out.items(),key=lambda x:int(x[0])))
json.dump(out,open(W+'hint_v4.json','w'),ensure_ascii=False,indent=0)
d={q['no']:q for q in json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))}
exp=[n for n in range(470,627) if n in d]
print(len(out),len(exp),set(map(int,out))==set(exp))
bad=0
for k,v in out.items():
    q=d[int(k)];ans=q['answer']
    parts=v.split(' / ')
    if len(parts)!=len(ans): print('PARTS',k)
    ch={c['key']:c['text'].replace('\n',' ').replace(' ','') for c in q['choices']}
    for i,p in enumerate(parts):
        pn=p.replace(' ','')
        key=ans[i] if len(parts)==len(ans) else None
        if key and pn not in ch[key]: print('MISSING',k,p)
        others=[kk for kk,t in ch.items() if kk not in ans and pn in t]
        if others: print('ALSO-IN-WRONG',k,p,others)
    if len(v)>45: print('LONG',k,len(v),v)
