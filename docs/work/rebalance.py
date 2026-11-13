import json,random,collections
rng=random.Random(20260)
glob=collections.Counter()
for c in range(1,5):
    p=f'ch{c}.json'; d=json.load(open(p)); ch=d['chapters'][0] if 'chapters' in d else d
    singles=[m for m in ch['mc'] if 'answer' in m]
    targets=[(i%4)+1 for i in range(len(singles))]; rng.shuffle(targets)
    for m,t in zip(singles,targets):
        n=len(m['choices']); a=m['answer']-1; t-=1
        others=[i for i in range(n) if i!=a]; rng.shuffle(others)
        order=[];it=iter(others)
        for pos in range(n): order.append(a if pos==t else next(it))
        m['choices']=[m['choices'][i] for i in order]; m['explain']=[m['explain'][i] for i in order]; m['answer']=t+1
        glob[t+1]+=1
    json.dump(d,open(p,'w'),ensure_ascii=False,indent=1)
print(sorted(glob.items()))
