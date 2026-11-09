import json,sys
d=json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))
s=[q for q in d if 470<=q['no']<=626]
a,b=int(sys.argv[1]),int(sys.argv[2])
for q in s[a:b]:
    print('##',q['no'],q['answer'],'HINT=',q['hint'])
    for c in q['choices']:
        print(' ',c['key'],c['text'].replace('\n',' '))
