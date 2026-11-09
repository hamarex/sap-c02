import json,sys
d=json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))
a,b=int(sys.argv[1]),int(sys.argv[2])
for q in d:
    if a<=q['no']<=b:
        print('#%d hint=[%s] ans=%s'%(q['no'],q['hint'],''.join(q['answer'])))
        for c in q['choices']:
            m='*' if c['key'] in q['answer'] else ' '
            t=c['text'].replace('\n',' ')
            print(' %s%s %s'%(m,c['key'],t if m=='*' else t[:60]))
