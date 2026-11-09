import json,sys,glob
d={q['no']:q for q in json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))}
def n(s): return s.replace('\n','').replace('​','')
h={}
for f in sorted(glob.glob('/Users/hiroshi.ohama/develop/jpn/work/hv6_b*.json')):
    h.update(json.load(open(f)))
bad=0
for k,v in h.items():
    q=d[int(k)]
    parts=v.split(' / ')
    if len(q['answer'])>1 and len(parts)!=len(q['answer']): print('PARTS',k,v); bad+=1
    if len(q['answer'])==1 and len(parts)>1: print('SINGLE-MULTI',k,v)
    txt=[n(c['text']) for c in q['choices'] if c['key'] in q['answer']]
    for i,p in enumerate(parts):
        # find in corresponding answer text (by order), else any
        t=txt[i] if len(txt)==len(parts) else ' '.join(txt)
        pos=t.find(p)
        if pos<0:
            pos2=' '.join(txt).find(p)
            print('NOTFOUND',k,p,'(anywhere)' if pos2>=0 else ''); bad+=1
        elif pos>40: print('LATE',k,p,pos)
        if len(p)>14: print('LONG',k,p,len(p))
print(len(h),'checked',bad,'bad')
