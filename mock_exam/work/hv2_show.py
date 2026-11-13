import json,sys
d=json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))
a,b=int(sys.argv[1]),int(sys.argv[2])
for q in d:
    if a<=q['no']<=b:
        print('###',q['no'],'ANS',q['answer'],'HINT',q['hint'])
        for c in q['choices']: print(c['key'],c['text'][:int(sys.argv[3]) if len(sys.argv)>3 else 400].replace('\n','⏎'))
