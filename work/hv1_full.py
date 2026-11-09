import json,sys
d={q['no']:q for q in json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))}
for a in sys.argv[1:]:
    n,ks=a.split(':')
    for c in d[int(n)]['choices']:
        if c['key'] in ks: print(n,c['key'],c['text'].replace('\n',' ')[:int(300)]);print()
