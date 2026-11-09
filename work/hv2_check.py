import json,glob,re
W='/Users/hiroshi.ohama/develop/jpn/work/'
d={q['no']:q for q in json.load(open('/Users/hiroshi.ohama/develop/jpn/questions.json'))}
h={}
for f in sorted(glob.glob(W+'hv2_p*.json')): h.update({int(k):v for k,v in json.load(open(f)).items()})
miss=[n for n in range(157,314) if n not in h]; print('count',len(h),'missing',miss)
n_=lambda s:re.sub(r'[\s⏎]','',s)
for n in range(157,314):
    if n not in h: continue
    q=d[n]; parts=[p.strip() for p in h[n].split(' / ')]
    if len(parts)!=len(q['answer']): print('PARTCOUNT',n,h[n],q['answer'])
    ch={c['key']:n_(c['text']) for c in q['choices']}
    for i,p in enumerate(parts):
        k=q['answer'][i] if i<len(q['answer']) and len(parts)==len(q['answer']) else None
        pn=n_(p)
        cand=[k] if k else q['answer']
        pos=[ch[c].find(pn) for c in cand]
        if k and pos[0]<0: print('NOTINCORRECT',n,p); continue
        if pos[0]>40: print('LATE',n,p,pos)
        # wrong choices containing it
        wrong=[c for c in ch if c not in q['answer'] and pn in ch[c]]
        if wrong: print('INWRONG',n,p,wrong)
        # other correct choices (for multi) containing
        oc=[c for c in q['answer'] if c!=k and pn in ch[c]]
        if k and oc: print('INOTHERCORRECT',n,p,oc)
    if n==257: assert h[n]=='増やす / 拡張 / 減らす'
