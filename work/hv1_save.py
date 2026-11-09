import json,sys,os
W='/Users/hiroshi.ohama/develop/jpn/work/hv1_work.json'
d=json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))
if os.path.exists(W): w=json.load(open(W))
else: w={str(q['no']):q['hint'] for q in d if q['no']<=156}
upd=json.loads(sys.stdin.read())
w.update({str(k):v for k,v in upd.items()})
json.dump(w,open(W,'w'),ensure_ascii=False,indent=0)
print(len(w),len(upd))
