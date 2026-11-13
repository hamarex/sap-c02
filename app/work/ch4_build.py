import json,importlib,re
KEY=re.compile(r'<b class="key">(.*?)</b>',re.S)
KEEP={
'1-1':['要件(期間・コスト・改修可否)から最適な R を選ぶ','Rehost','Replatform','Refactor / Re-architect','Relocate'],
'1-2':['AWS Application Discovery Service (ADS)','ネットワーク依存関係','Migration Evaluator','ビジネスケース(TCO 比較・適正サイズ見積り)','Agentless Collector','Discovery Agent'],
'1-3':['Migration Hub Strategy Recommendations','推奨する 7R 戦略','Migration Hub Refactor Spaces','Strangler Fig パターン','MAP (Migration Acceleration Program)'],
'1-4':['AWS Control Tower','Account Factory','SCP','AWS Config ルール','Organizations が前提'],
'2-1':['ブロックレベルで継続レプリケーション','AWS Server Migration Service (SMS) の後継','ステージングエリア(低コストなレプリケーションサーバー + EBS)','テストカットオーバー','数分程度','エージェントレス'],
'2-2':['帯域スロットリング','暗号化 EBS','Private Link / VPC エンドポイント','VM Import/Export','移行(一度きり)'],
'2-3':['VMware Cloud on AWS','HCX','Amazon Elastic VMware Service (EVS)','MGN で EC2 へ','変更なし・IP も維持可能(L2 拡張)'],
'3-1':['Full load + CDC','DMS Serverless','バイナリログ有効・ROW 形式','ARCHIVELOG モード + 補足ロギング','稼働させたまま'],
'3-2':['同種(Homogeneous)','異種(Heterogeneous)','スキーマ変換 + データ移行','評価レポート','Snowball Edge','アプリ変更最小で'],
'3-3':['最大 15 リードレプリカ','Aurora Global Database','Aurora リードレプリカ作成 → 昇格','DMS(full load + CDC)'],
'3-4':['個ミリ秒の低レイテンシ','オブジェクトマッピング','S3 からのインポート','テーブル書き込み容量を消費せず','Amazon DocumentDB'],
'4-1':['100TB を 1Gbps で全帯域使うと約 9〜10 日','Snowball Edge','Direct Connect','数週間〜','VPN over DX','S3 Transfer Acceleration'],
'4-2':['S3・EFS・FSx','帯域制限','SFTP / FTPS / FTP / AS2','S3 または EFS','Active Directory/カスタム IdP'],
'4-3':['Snowball Edge Storage Optimized','Snowball Edge Compute Optimized','自動で暗号化','S3 File Gateway','Cached','Stored'],
'4-4':['DataSync','Snowball Edge','Tape Gateway','往復の配送日数'],
'5-1':['コンテナ化','サーバーレス化','一括書き換えせず','ALB / API Gateway / CloudFront','Migration Hub Refactor Spaces'],
'5-2':['.NET (Windows) / Java アプリ','コンテナ化を最小努力で','ECS on Fargate','EKS','App Runner','Elastic Beanstalk'],
'5-3':['Lambda + EventBridge / S3 / SQS','API Gateway + Lambda','Step Functions','Amazon MQ','15 分'],
'5-4':['Replatform','ほぼそのまま','Automated Refactor','Java','Multi-AZ・自動スケーリング'],
'6-1':['BYOL','Dedicated Host','ソケット・コア・ホスト ID が可視化','Dedicated Instance','AWS License Manager','License Included のみ'],
'6-2':['アウトバウンド','二重稼働期間','Migration Evaluator','ライトサイジング','インターネットへのアウトバウンドは有料','人件費'],
'6-3':['TLS/暗号化','ソースとターゲットに到達可能な VPC・SG','ロールバック計画','最優先の制約'],
}
def trim(html,key):
    keep=set(KEEP[key]);seen=set()
    def f(m):
        t=m.group(1)
        if t in keep and t not in seen:
            seen.add(t);return m.group(0)
        return t
    return KEY.sub(f,html)
ls=[importlib.import_module(f'ch4_l{i}').LESSON for i in range(1,7)]
lessons=[];ox=[]
for L in ls:
    pages=[]
    for pi,p in enumerate(L['pages'],1):
        pid=f"{L['id']}-p{pi}";ids=[]
        for oi,(t,a,e) in enumerate(p['ox']):
            i=f"ox-{pid}-{'abc'[oi]}";ids.append(i)
            ox.append(dict(id=i,lesson=L['id'],text=t,answer=a,explain=e))
        pages.append(dict(id=pid,title=p['title'],html=trim(p['html'],f"{L['id'][2:]}-{pi}"),oxIds=ids))
    lessons.append(dict(id=L['id'],title=L['title'],pages=pages))
from ch4_mc1 import MC
from ch4_mc2 import MCM
mc=[];n=0
for stem,ch,ans,ex,tip in MC+MCM:
    n+=1;d=dict(id=f'mc-4-{n:03d}',stem=stem,items=[],choices=ch,explain=ex,tip=tip,domain=4)
    if isinstance(ans,list):
        d['answers']=[a+1 for a in ans];d['select']=len(ans)
    else: d['answer']=ans+1
    mc.append(d)
ch=dict(no=4,title='ワークロードの移行とモダナイゼーションの加速',lessons=lessons,ox=ox,mc=mc)
json.dump(ch,open('ch4.json','w'),ensure_ascii=False,indent=1)
# verify
ids=[x['id'] for x in ox];assert len(ids)==len(set(ids))
for l in lessons:
    for p in l['pages']:
        assert all(i in ids for i in p['oxIds']);assert 2<=len(p['oxIds'])<=3
for m in mc:
    assert len(m['explain'])==len(m['choices'])
    aa=m.get('answers',[m.get('answer')])
    assert all(1<=a<=len(m['choices']) for a in aa)
    if 'select' in m: assert len(m['choices'])>=5 and len(aa)==m['select']
    else: assert len(m['choices'])==4
print(len(lessons),sum(len(l['pages']) for l in lessons),len(ox),len(mc),sum(len(p['html']) for l in lessons for p in l['pages']))

for l in lessons:
    for p in l['pages']:
        k=len(KEY.findall(p['html']));t=p['html'].count('class="trap"')
        print(p['id'],k,t)
        assert 3<=k<=6 and t<=2,(p['id'],k,t)
