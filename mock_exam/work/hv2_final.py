import json,glob
W='/Users/hiroshi.ohama/develop/jpn/work/'
d={q['no']:q for q in json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))}
h={}
for f in sorted(glob.glob(W+'hv2_p*.json')): h.update({int(k):v for k,v in json.load(open(f)).items()})
img=[n for n in range(157,314) if any(not c['text'].strip() for c in d[n]['choices'])]
print('imageonly',img)
ch=[n for n in range(157,314) if h[n]!=d[n]['hint']]
print('changed',len(ch),'unchanged',157-len(ch),[n for n in range(157,314) if n not in ch])
json.dump({str(n):h[n] for n in range(157,314)},open(W+'hint_v2.json','w'),ensure_ascii=False,indent=1)
