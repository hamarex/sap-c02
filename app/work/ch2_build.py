import json, importlib, re
lessons=[];ox=[];mc=[]
for i in range(1,11):
    L=importlib.import_module(f'ch2_l{i}').L
    pages=[]
    for pi,(title,html,oxs) in enumerate(L['pages'],1):
        pid=f"{L['id']}-p{pi}"; ids=[]
        for k,(t,a,e) in enumerate(oxs):
            oid=f"ox-{L['id']}-p{pi}-{'abcde'[k]}"; ids.append(oid)
            ox.append(dict(id=oid,lesson=L['id'],text=t,answer=a,explain=e))
        pages.append(dict(id=pid,title=title,html=html.replace('\n',''),oxIds=ids))
    lessons.append(dict(id=L['id'],title=L['title'],pages=pages))
n=0
for m in ('ch2_mc1','ch2_mc2','ch2_mc3'):
    for d in importlib.import_module(m).M:
        n+=1
        stem=d['stem'].replace('ある企業のメディア会社が','あるメディア会社が')
        o=dict(id=f'mc-2-{n:03d}',stem=stem,items=[],choices=d['choices'])
        if isinstance(d['ans'],list): o['answers']=d['ans']; o['select']=len(d['ans'])
        else: o['answer']=d['ans']
        o.update(explain=d['explain'],tip=d['tip'],domain=2)
        mc.append(o)
ch=dict(no=2,title='新規ソリューションの設計',lessons=lessons,ox=ox,mc=mc)
json.dump(ch,open('ch2.json','w'),ensure_ascii=False,indent=1)
# validate
c=json.load(open('ch2.json'))
oid={o['id'] for o in c['ox']}; assert len(oid)==len(c['ox'])
refs=[x for l in c['lessons'] for p in l['pages'] for x in p['oxIds']]
assert set(refs)==oid and len(refs)==len(set(refs))
pids=[p['id'] for l in c['lessons'] for p in l['pages']]; assert len(pids)==len(set(pids))
ids=[m['id'] for m in c['mc']]; assert len(ids)==len(set(ids))
for m in c['mc']:
    k=len(m['choices']); assert len(m['explain'])==k,m['id']
    a=m.get('answers',[m.get('answer')]); assert all(1<=x<=k for x in a),m['id']
    if 'select' in m: assert m['select']==len(a) and k>=5,m['id']
    assert not re.search('<[a-z]',''.join(m['choices']))
print(len(c['lessons']),len(pids),len(c['ox']),len(c['mc']),sum('answers' in m for m in c['mc']))
print(sum(len(m['stem']) for m in c['mc'])//len(c['mc']), sum(c['ox'][i]['answer'] for i in range(len(c['ox']))), len(c['ox']))
