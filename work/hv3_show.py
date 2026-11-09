import json,sys
d=json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))
a,b=int(sys.argv[1]),int(sys.argv[2])
for q in d:
    if a<=q['no']<=b:
        ans=q['answer'] if isinstance(q['answer'],list) else list(q['answer'])
        print('##',q['no'],'ans',q['answer'],'HINT:',q.get('hint'))
        for c in q['choices']:
            m='*' if c['key'] in ans else ' '
            print(m,c['key'],c['text'])
