import json,sys
W='/Users/hiroshi.ohama/develop/jpn/work/'
d={q['no']:q for q in json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))}
h=json.load(open(W+sys.argv[1]))
for k,v in h.items():
    q=d[int(k)]; ans=q['answer']
    parts=[p.strip() for p in v.split(' / ')]
    texts=[c['text'].replace('\n',' ') for c in q['choices'] if c['key'] in ans]
    res=[]
    for i,p in enumerate(parts):
        t=texts[i] if len(texts)==len(parts) else ' '.join(texts)
        pos=t.find(p)
        if pos<0:
            pos2=t.replace(' ','').find(p.replace(' ',''))
            pos=('ns',pos2) if pos2>=0 else None
        res.append(pos)
    flag=''
    if len(parts)!=len(ans): flag+=' PARTS!'
    if any(r is None for r in res): flag+=' MISSING'
    if any((r if isinstance(r,int) else (r[1] if r else 0))>40 for r in res): flag+=' >40'
    print(k,v,res,flag)
