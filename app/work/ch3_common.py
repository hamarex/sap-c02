import re
def fmt(s):
    s = re.sub(r'\{k\|(.*?)\}', r'<b class="key">\1</b>', s, flags=re.S)
    s = re.sub(r'\{t\|(.*?)\}', r'<span class="trap">\1</span>', s, flags=re.S)
    return s
def build(lid, title, pages):
    """pages: list of (title, html, [(text, ans, explain)])"""
    L = {'id': lid, 'title': title, 'pages': []}
    ox = []
    for i, (pt, html, oxs) in enumerate(pages, 1):
        pid = f'{lid}-p{i}'
        ids = []
        for j, (t, a, e) in enumerate(oxs):
            oid = f'ox-{lid}-p{i}-{"abc"[j]}'
            ids.append(oid)
            ox.append({'id': oid, 'lesson': lid, 'text': t, 'answer': a, 'explain': fmt(e)})
        L['pages'].append({'id': pid, 'title': pt, 'html': fmt(html), 'oxIds': ids})
    return L, ox
