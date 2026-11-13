import json,sys,os
w='/Users/hiroshi.ohama/develop/jpn/work/hv5_work.json'
cur=json.load(open(w)) if os.path.exists(w) else {}
cur.update(json.load(open(sys.argv[1])))
json.dump(cur,open(w,'w'),ensure_ascii=False,indent=0)
print(len(cur))
