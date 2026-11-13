def K(s): return f'<b class="key">{s}</b>'
def T(s): return f'<span class="trap">{s}</span>'
def page(lid, n, title, html, oxs):
    pid=f'{lid}-p{n}'
    ids=[];ox=[]
    for i,(t,a,e) in enumerate(oxs):
        oid=f'ox-{pid}-{"abc"[i]}'
        ids.append(oid); ox.append(dict(id=oid,lesson=lid,text=t,answer=a,explain=e))
    return dict(id=pid,title=title,html=html,oxIds=ids), ox
def lesson(lid,title,pages):
    ps=[];oxs=[]
    for i,(t,h,o) in enumerate(pages,1):
        p,ox=page(lid,i,t,h,o); ps.append(p); oxs+=ox
    return dict(id=lid,title=title,pages=ps), oxs
