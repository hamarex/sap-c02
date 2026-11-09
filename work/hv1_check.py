import json,re,unicodedata
d={q['no']:q for q in json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json')) if q['no']<=156}
w=json.load(open('/Users/hiroshi.ohama/develop/jpn/work/hv1_work.json'))
def norm(s): return re.sub(r'\s+','',unicodedata.normalize('NFKC',s)).lower()
print(len(w), sorted(set(range(1,157))-set(int(k) for k in w)))
for n in range(1,157):
    q=d[n];h=w[str(n)];parts=h.split(' / ')
    if len(q['answer'])>1 and len(parts)!=len(q['answer']): print('PARTS',n,h,q['answer'])
    if len(q['answer'])==1 and len(parts)>1: print('SINGLE-SLASH',n,h)
    keys=q['answer']
    ch={c['key']:norm(c['text']) for c in q['choices']}
    for i,p in enumerate(parts):
        k=keys[i] if i<len(keys) else keys[0]
        t=q['choices'][[c['key'] for c in q['choices']].index(k)]['text']
        pos=norm(t).find(norm(p))
        rawpos=re.sub(r'\s+','',t)  # not used
        others=[kk for kk,v in ch.items() if kk!=k and norm(p) in v]
        flag=[]
        if pos<0: flag.append('NOTFOUND')
        elif pos>40: flag.append('POS%d'%pos)
        if others: flag.append('ALSO:'+''.join(others))
        if flag: print(n,'['+p+']',k,' '.join(flag))
