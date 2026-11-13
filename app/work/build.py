import json,l1,l2,l3,m1
ls=[];ox=[]
for l,o in l1.L+l2.L+l3.L: ls.append(l); ox+=o
mc=[]
for i,m in enumerate(m1.M,1):
    d=dict(id=f'mc-1-{i:03d}',stem=m['stem'],items=[],choices=m['ch'])
    if isinstance(m['ans'],list):
        d['answers']=[a+1 for a in m['ans']]; d['select']=len(m['ans'])
    else: d['answer']=m['ans']+1
    d.update(explain=m['ex'],tip=m['tip'],domain=1); mc.append(d)
import re
KEEP={
'1-1-p1':['全機能（All features）','SCP','委任管理者','OrganizationAccountAccessRole'],
'1-1-p2':['最大権限の境界（ガードレール）','SCP ∩ IAM（ID/リソースポリシー・権限境界）','FullAWSAccess','管理アカウントのユーザー/ロールには効かない','ルートユーザーにも効く','サービスリンクロール'],
'1-1-p3':['リージョン制限','aws:RequestedRegion','aws:PrincipalOrgID','IAM権限境界（Permissions Boundary）'],
'1-1-p4':['信頼されたアクセス','委任管理者アカウント','管理アカウントを日常運用から切り離す'],
'1-2-p1':['爆発半径の分離','サービスクォータの分離','コスト可視化','ワークロード別 × 環境別'],
'1-2-p2':['AWS Control Tower','ログアーカイブアカウント','監査アカウント','Account Factory','Account Factory for Terraform (AFT)'],
'1-2-p3':['登録（enroll）','ホームリージョン','Customizations for AWS Control Tower (CfCT)','CloudFormation StackSets','自動デプロイ'],
'1-2-p4':['AWS Resource Access Manager (RAM)','コピーせず共有','VPCサブネット','Transit Gateway','サブネットを他アカウントと共有','自分のVPCアタッチメント'],
'1-3-p1':['ID ソース','許可セット（Permission Set）','短期の認証情報','個人ではなくグループ単位','属性ベースアクセス制御（ABAC）','外部IdP（SAML 2.0、SCIMで自動プロビジョニング）'],
'1-3-p2':['信頼ポリシー','sts:AssumeRole を許可するIDポリシー','一時的な認証情報','混乱した代理（confused deputy）問題'],
'1-3-p3':['自分のアイデンティティを一時的に手放し','元のアイデンティティのまま','キーポリシー','バケット所有者強制（BucketOwnerEnforced）'],
'1-3-p4':['SCIM','ターゲットのロールをAssumeRole','IAM Roles Anywhere','ブレークグラス（緊急用）'],
'1-4-p1':['プライベートIPで1対1接続','CIDRが重複していると作成できない','IGW・NAT・VPNやDirect Connect','低コスト・低レイテンシ・帯域上限なし','Transit Gateway'],
'1-4-p2':['推移的','ルートテーブルを複数','リージョン間はTGWピアリング','ECMP','RAM共有','アプライアンスモード'],
'1-4-p3':['ゲートウェイ型','S3とDynamoDBのみ','インターフェイス型','NLB（またはGWLB）','一方向・CIDR重複OK・数千VPCに公開可','プライベートDNS'],
'1-4-p4':['エグレスVPCに集約','Egress-only インターネットゲートウェイ','Amazon VPC Lattice'],
'1-5-p1':['IPsecトンネル','冗長な2本のトンネル','TGW+ECMP','BGP（動的）','アクセラレートVPN'],
'1-5-p2':['専用接続','プライベートVIF','トランジットVIF','DX上のSite-to-Site VPN（パブリックVIFまたはトランジットVIF上のIPsec）','数週間以上','グローバルなリソース'],
'1-5-p3':['異なる2つ以上のDXロケーション','DX + Site-to-Site VPN','DXを優先','BFD（双方向フォワーディング検出）'],
'1-5-p4':['AWS Client VPN','TGW Connect（GRE+BGP）','ホストDX接続'],
'1-6-p1':['プライベートホストゾーン（PHZ）','enableDnsHostnames と enableDnsSupport','関連付け承認','バイアス'],
'1-6-p2':['インバウンドエンドポイント','オンプレ → AWS','アウトバウンドエンドポイント','AWS → オンプレ','複数AZのENI','RAMでルールを共有'],
'1-6-p3':['PHZを複数VPCに関連付け','DNSSEC署名','Route 53 Profiles'],
'1-7-p1':['組織の証跡（Organization trail）','ログファイルの整合性検証','ログアーカイブアカウント','S3 Object Lock（コンプライアンスモード）','サブスクリプションフィルタ','Amazon Security Lake'],
'1-7-p2':['自動修復','コンフォーマンスパック','Config アグリゲーター','組織のConfigルール'],
'1-7-p3':['集約と準拠スコア','脆弱性スキャン','機密データ（PII）検出','新規アカウントを自動有効化','集約リージョン','EventBridge'],
'1-7-p4':['組織全体へ一括適用・準拠監視','Firewall Manager管理者アカウント','自動適用','セルフサービス提供'],
'1-8-p1':['有効化（アクティブ化）','タグポリシー','コストカテゴリ','リザベーション/Savings Plansの利用率・カバレッジ','異常な支出'],
'1-8-p2':['予算アクション','実績値と予測値','一括請求','RI/Savings Plansの割引共有','請求コンソールへのアクセス'],
'1-8-p3':['詳細','Athena統合','CUR 2.0 / Data Exports'],
}
TRAP_MAX=2
def apply(pid,html):
    keep=list(KEEP[pid])
    def rk(m):
        t=m.group(1)
        if t in keep: keep.remove(t); return m.group(0)
        return t
    html=re.sub(r'<b class="key">(.*?)</b>',rk,html)
    assert not keep,(pid,keep)
    n=[0]
    def rt(m):
        n[0]+=1
        return m.group(0) if n[0]<=TRAP_MAX else m.group(1)
    return re.sub(r'<span class="trap">(.*?)</span>',rt,html)
for l in ls:
    for p in l['pages']:
        p['html']=apply(p['id'],p['html'])
ch=dict(no=1,title='組織の複雑性に対応するソリューション設計',lessons=ls,ox=ox,mc=mc)
json.dump(ch,open('ch1.json','w'),ensure_ascii=False,indent=1)
ids=[x['id'] for x in ox]; assert len(ids)==len(set(ids))
for l in ls:
    for p in l['pages']:
        assert all(i in ids for i in p['oxIds']) and 2<=len(p['oxIds'])<=3
for m in mc:
    n=len(m['choices']); assert len(m['explain'])==n,m['id']
    a=m.get('answers') or [m['answer']]
    assert all(1<=x<=n for x in a) and len(set(a))==len(a)
    assert '<' not in ''.join(m['choices'])
    if 'select' in m: assert m['select']==len(a)>=2 and n>=5
assert len({m['id'] for m in mc})==len(mc)
print(len(ls),sum(len(l['pages']) for l in ls),len(ox),len(mc),sum('select' in m for m in mc))

for l in ls:
    for p in l['pages']:
        k=p['html'].count('class="key"');t=p['html'].count('class="trap"')
        assert 3<=k<=6 and t<=2,(p['id'],k,t)
print('key/trap ok')
