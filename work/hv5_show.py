import json,sys
d=json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))
s=[q for q in d if 627<=q['no']<=782]
a=int(sys.argv[1]);b=int(sys.argv[2])
def lcp(x,y):
    n=0
    for i,j in zip(x,y):
        if i!=j:break
        n+=1
    return n
for q in s[a:b]:
    print('='*5,q['no'],q['answer'],'HINT:',q['hint'])
    ch=q['choices']
    for c in ch:
        if c['key'] in q['answer']:
            others=[o['text'] for o in ch if o['key'] not in q['answer']] or ['']
            L=max(lcp(c['text'],o) for o in others)
            t=c['text'].replace('\n',' ')
            print('*',c['key'],'L=%d'%L,t[:L]+'|'+t[L:L+90])
    for c in ch:
        if c['key'] not in q['answer']:
            print(' ',c['key'],c['text'].replace('\n',' ')[:50])
