import json,sys
d=json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))
a,b=int(sys.argv[1]),int(sys.argv[2])
def n(s): return s.replace('\n','').replace('​','')
for q in d:
    if a<=q['no']<=b:
        print('=== ',q['no'],'ANS',q['answer'],'CUR:',q['hint'])
        for c in q['choices']:
            if c['key'] in q['answer']:
                t=n(c['text'])
                oth=[n(x['text']) for x in q['choices'] if x['key'] not in q['answer']]
                # first diff index vs each other
                ds=[]
                for o in oth:
                    i=0
                    while i<min(len(t),len(o)) and t[i]==o[i]: i+=1
                    ds.append(i)
                k=max(ds); print('*',c['key'],'diff@',k,'|',t[:k]+'⟦'+t[k:k+60])
            else:
                print(' ',c['key'],n(c['text'])[:50])
