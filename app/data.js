window.DATA = {
 "chapters": [
  {
   "no": 1,
   "title": "組織の複雑性に対応するソリューション設計",
   "lessons": [
    {
     "id": "1-1",
     "title": "AWS Organizations と SCP",
     "pages": [
      {
       "id": "1-1-p1",
       "title": "Organizations の基本構造",
       "html": "<h4>Organizations とは</h4><ul><li>AWS Organizations：複数のAWSアカウントを一元管理するサービス。管理アカウント（旧マスターアカウント）、メンバーアカウント、OU（組織単位）、ルートで階層を作る</li><li>OUは最大5階層まで入れ子にできる。アカウントは常に1つの親（ルート or OU）にだけ属する</li><li>機能セットは<b class=\"key\">全機能（All features）</b>と一括請求のみ。SCPや委任管理者など統制機能を使うには全機能が必須</li></ul><h4>主な機能</h4><ul><li>一括請求（Consolidated Billing）：全メンバーの料金を管理アカウントへ集約。ボリューム割引、RI/Savings Plansの割引共有が可能</li><li><b class=\"key\">SCP</b>：アカウントが使える権限の上限をガードレールとして設定</li><li>タグポリシー、バックアップポリシー、AIサービスのオプトアウトポリシー等の管理ポリシー</li><li>AWSサービスとの統合（信頼されたアクセス）と<b class=\"key\">委任管理者</b></li></ul><h4>試験の引っ掛け</h4><ul><li><span class=\"trap\">管理アカウントには本番ワークロードを置かない</span>：管理アカウントはSCPの対象外なので、最小限の用途（請求・組織管理）に限る</li><li>新規アカウントは組織内で作成すると<b class=\"key\">OrganizationAccountAccessRole</b>が自動作成され、管理アカウントから引き受けられる（招待で参加したアカウントには自動では作られない）</li></ul>",
       "oxIds": [
        "ox-1-1-p1-a",
        "ox-1-1-p1-b",
        "ox-1-1-p1-c"
       ]
      },
      {
       "id": "1-1-p2",
       "title": "SCP の仕組みと評価ロジック",
       "html": "<h4>SCPは「許可の上限」</h4><ul><li>SCP（サービスコントロールポリシー）自体は権限を<span class=\"trap\">付与しない</span>。IAMポリシーが許可する範囲に対する<b class=\"key\">最大権限の境界（ガードレール）</b></li><li>実効権限 ＝ <b class=\"key\">SCP ∩ IAM（ID/リソースポリシー・権限境界）</b>。どちらかが拒否・未許可なら不可</li><li>ルート→OU→アカウントの各階層で、すべての階層で許可されているアクションだけが通る</li></ul><h4>拒否リスト方式と許可リスト方式</h4><table><tr><th>方式</th><th>内容</th></tr><tr><td>拒否リスト（deny list）</td><td>デフォルトの <b class=\"key\">FullAWSAccess</b> SCPを残し、禁止したい操作に明示Denyを書く。運用が楽で推奨</td></tr><tr><td>許可リスト（allow list）</td><td>FullAWSAccessを外し、許可するサービスだけをAllowで列挙。厳格だが管理が重い</td></tr></table><h4>重要な適用範囲</h4><ul><li><b class=\"key\">管理アカウントのユーザー/ロールには効かない</b></li><li>メンバーアカウントの<b class=\"key\">ルートユーザーにも効く</b></li><li><b class=\"key\">サービスリンクロール</b>には効かない</li><li>リソースベースポリシーで他アカウントのプリンシパルに付与された権限は、そのプリンシパル側アカウントのSCPで制限される</li></ul>",
       "oxIds": [
        "ox-1-1-p2-a",
        "ox-1-1-p2-b",
        "ox-1-1-p2-c"
       ]
      },
      {
       "id": "1-1-p3",
       "title": "SCP の設計パターンと条件キー",
       "html": "<h4>典型的なガードレール</h4><ul><li><b class=\"key\">リージョン制限</b>：<b class=\"key\">aws:RequestedRegion</b>条件で許可リージョン以外を拒否。IAM・Organizations・CloudFront・Route 53などグローバルサービスは除外（NotAction）する</li><li>セキュリティサービスの無効化禁止：CloudTrail停止、Config停止、GuardDuty無効化を拒否</li><li>組織からの離脱禁止：organizations:LeaveOrganization を拒否</li><li>ルートユーザー操作禁止：aws:PrincipalArn がルートの場合に拒否</li><li>暗号化必須：暗号化なしのEBS/S3作成を拒否、特定インスタンスタイプ以外の起動を拒否</li><li><b class=\"key\">aws:PrincipalOrgID</b>：リソースポリシーで「自組織内のみ許可」と書く（アカウントID列挙より運用が楽）</li></ul><h4>判断のコツ</h4><ul><li>「個別アカウントに入れ替わり管理者がいても、全員に絶対許さない」→ SCP</li><li>「開発者が自分で作るロールに権限の天井を設けたい」→ <b class=\"key\">IAM権限境界（Permissions Boundary）</b>。SCPは組織側、権限境界はアカウント内の委任管理用</li><li><span class=\"trap\">SCPのDenyは条件付きでも強い</span>：例外が必要なときは条件キーで管理ロールだけ除外する</li></ul>",
       "oxIds": [
        "ox-1-1-p3-a",
        "ox-1-1-p3-b",
        "ox-1-1-p3-c"
       ]
      },
      {
       "id": "1-1-p4",
       "title": "委任管理者・信頼されたアクセス・ポリシー種別",
       "html": "<h4>委任管理者</h4><ul><li>多くのサービス（GuardDuty、Security Hub、Config、IAM Identity Center、Firewall Manager、CloudFormation StackSets等）は、Organizationsと統合し<b class=\"key\">信頼されたアクセス</b>を有効化した上で<b class=\"key\">委任管理者アカウント</b>を指定できる</li><li>目的：<b class=\"key\">管理アカウントを日常運用から切り離す</b>。セキュリティ専用アカウントなどに管理を移す</li></ul><h4>Organizations の管理ポリシー</h4><table><tr><th>種類</th><th>用途</th></tr><tr><td>SCP</td><td>権限の上限</td></tr><tr><td>タグポリシー</td><td>タグキー・値の標準化（付与の強制ではなく、準拠評価。強制オプションあり）</td></tr><tr><td>バックアップポリシー</td><td>AWS Backupプランを組織全体に適用</td></tr><tr><td>AIサービスオプトアウト</td><td>AIサービスによるコンテンツ利用の拒否</td></tr><tr><td>RCP（リソースコントロールポリシー）</td><td>リソース側の権限上限（データ境界の実装など）</td></tr></table><ul><li><span class=\"trap\">RCPはリソースに対するアクセスの上限</span>を設定。SCPがプリンシパル側、RCPがリソース側と覚える</li></ul>",
       "oxIds": [
        "ox-1-1-p4-a",
        "ox-1-1-p4-b",
        "ox-1-1-p4-c"
       ]
      }
     ]
    },
    {
     "id": "1-2",
     "title": "Control Tower とマルチアカウント戦略",
     "pages": [
      {
       "id": "1-2-p1",
       "title": "なぜマルチアカウントか",
       "html": "<h4>マルチアカウント戦略の目的</h4><ul><li><b class=\"key\">爆発半径の分離</b>：障害・侵害・誤操作の影響を1アカウントに閉じ込める</li><li><b class=\"key\">サービスクォータの分離</b>：アカウント／リージョン単位のクォータを環境別に確保</li><li><b class=\"key\">コスト可視化</b>：アカウント単位で請求を分離</li><li>権限・コンプライアンス境界：PCI対象環境などを独立させる</li></ul><h4>推奨OU構成（AWS推奨の例）</h4><table><tr><th>OU</th><th>用途</th></tr><tr><td>Security</td><td>ログアーカイブ、セキュリティツール（監査）アカウント</td></tr><tr><td>Infrastructure</td><td>ネットワーク（Transit Gateway等）、共有サービス</td></tr><tr><td>Workloads (Prod / Non-Prod)</td><td>本番／開発のワークロードアカウント</td></tr><tr><td>Sandbox</td><td>実験用。予算上限と厳しいSCP</td></tr><tr><td>Policy Staging / Suspended</td><td>ポリシー検証用／閉鎖予定アカウント</td></tr></table><h4>判断</h4><ul><li>「環境別」ではなく<b class=\"key\">ワークロード別 × 環境別</b>にアカウントを分ける</li><li><span class=\"trap\">単一アカウント内でIAMだけで分離</span>は、爆発半径・クォータ・請求の面で不足と判断される</li></ul>",
       "oxIds": [
        "ox-1-2-p1-a",
        "ox-1-2-p1-b",
        "ox-1-2-p1-c"
       ]
      },
      {
       "id": "1-2-p2",
       "title": "Control Tower のランディングゾーン",
       "html": "<h4>Control Tower とは</h4><ul><li><b class=\"key\">AWS Control Tower</b>：Organizations、IAM Identity Center、Config、CloudTrail、Service Catalog等を組み合わせ、ベストプラクティス準拠のマルチアカウント環境（ランディングゾーン）を自動構築・運用するサービス</li><li>作成されるもの：Security OU（<b class=\"key\">ログアーカイブアカウント</b>と<b class=\"key\">監査アカウント</b>）、Sandbox OU、組織CloudTrail、Config集約、IAM Identity Centerなど</li><li><b class=\"key\">Account Factory</b>：Service Catalogベースでアカウントを標準化して払い出す。<b class=\"key\">Account Factory for Terraform (AFT)</b>やAccount Factory Customization (AFC)でカスタマイズ可能</li></ul><h4>ガードレール（コントロール）</h4><table><tr><th>種類</th><th>実装</th><th>動き</th></tr><tr><td>予防的</td><td>SCP</td><td>違反操作を拒否</td></tr><tr><td>発見的</td><td>AWS Config ルール</td><td>違反を検出（Dashboardに非準拠表示）</td></tr><tr><td>プロアクティブ</td><td>CloudFormation Hooks</td><td>デプロイ前にテンプレートを検査</td></tr></table><ul><li><span class=\"trap\">予防的=SCP、発見的=Config、プロアクティブ=CFn Hooks</span>は頻出の対応表</li><li>ドリフト検知：ガードレールや構成が手動変更された場合に検出し、修復（再登録・更新）する</li></ul>",
       "oxIds": [
        "ox-1-2-p2-a",
        "ox-1-2-p2-b",
        "ox-1-2-p2-c"
       ]
      },
      {
       "id": "1-2-p3",
       "title": "Control Tower と Organizations の使い分け",
       "html": "<h4>選択基準</h4><table><tr><th>状況</th><th>選択</th></tr><tr><td>新規にベストプラクティスの環境を素早く作りたい</td><td>Control Tower</td></tr><tr><td>既存のOrganizationsに統制を足したい</td><td>Control Towerで既存OU/アカウントを<b class=\"key\">登録（enroll）</b>、または必要に応じ個別にSCP</td></tr><tr><td>独自の細かいガードレールを自作したい</td><td>Organizations SCP + Config + StackSets を直接構成</td></tr></table><h4>押さえどころ</h4><ul><li>Control Towerは<b class=\"key\">ホームリージョン</b>を持ち、後から変更できない。ガバナンス対象リージョンは追加可能</li><li>Control Towerが管理するリソース（StackSetで作成されたConfigやロール等）を<span class=\"trap\">手動で変更するとドリフト</span>となる</li><li>既存アカウントは、前提条件を満たした上で個別に、またはOU単位で登録（enroll）できる</li><li>追加で自作のカスタム統制が必要なら、<b class=\"key\">Customizations for AWS Control Tower (CfCT)</b>やAFTを使う</li></ul><h4>StackSets との関係</h4><ul><li><b class=\"key\">CloudFormation StackSets</b>は、Organizationsと統合したサービス管理の権限で、OU指定により新規アカウントへ<b class=\"key\">自動デプロイ</b>できる</li></ul>",
       "oxIds": [
        "ox-1-2-p3-a",
        "ox-1-2-p3-b",
        "ox-1-2-p3-c"
       ]
      },
      {
       "id": "1-2-p4",
       "title": "AWS RAM とリソース共有",
       "html": "<h4>RAMとは</h4><ul><li><b class=\"key\">AWS Resource Access Manager (RAM)</b>：リソースをアカウント間（または組織・OU単位）で<b class=\"key\">コピーせず共有</b>する。追加料金なし</li><li>共有できる主な例：<b class=\"key\">VPCサブネット</b>、<b class=\"key\">Transit Gateway</b>、Route 53 Resolverルール、License Manager設定、Aurora DBクラスター、プライベートCA、Systems Manager OpsItem等</li><li>OrganizationsでRAMの共有を有効化すると、招待の承諾なしで組織内に共有される</li></ul><h4>VPC共有（共有サブネット）</h4><ul><li>ネットワークアカウントがVPCを所有し、<b class=\"key\">サブネットを他アカウントと共有</b>。参加アカウントはそのサブネットにEC2/RDS等を起動できる</li><li>参加アカウントは自分のリソースを管理するが、<span class=\"trap\">VPC、サブネット、ルートテーブル、TGWアタッチメントは所有者のみ変更可</span></li><li>メリット：VPC数・VPC間接続・NATの削減、IP管理の集約。同一AZは物理AZ ID（use1-az1等）で揃える</li></ul><h4>注意</h4><ul><li><span class=\"trap\">S3やSQSなどはRAMではなく、リソースポリシーで共有</span>する</li><li>Transit Gatewayは共有しても、各アカウントが<b class=\"key\">自分のVPCアタッチメント</b>を作成する（承諾は自動承諾設定もあり）</li></ul>",
       "oxIds": [
        "ox-1-2-p4-a",
        "ox-1-2-p4-b",
        "ox-1-2-p4-c"
       ]
      }
     ]
    },
    {
     "id": "1-3",
     "title": "IAM Identity Center とクロスアカウントアクセス",
     "pages": [
      {
       "id": "1-3-p1",
       "title": "IAM Identity Center による集中ID管理",
       "html": "<h4>IAM Identity Center（旧 AWS SSO）</h4><ul><li>組織全体のワークフォース認証・認可を一元化。複数アカウントと業務アプリへのシングルサインオンを提供</li><li><b class=\"key\">ID ソース</b>は1つだけ選ぶ：Identity Centerディレクトリ（内蔵）／AD Connector / AWS Managed Microsoft AD／<b class=\"key\">外部IdP（SAML 2.0、SCIMで自動プロビジョニング）</b></li><li><b class=\"key\">許可セット（Permission Set）</b>：IAMポリシーの集合。ユーザー/グループ×アカウント×許可セットを割り当てると、対象アカウントにIAMロール（AWSReservedSSO_...）が自動作成される</li><li>ユーザーはポータルからアカウントとロールを選び、<b class=\"key\">短期の認証情報</b>で操作。IAMユーザーとアクセスキーの配布が不要になる</li></ul><h4>設計のコツ</h4><ul><li>割り当ては<b class=\"key\">個人ではなくグループ単位</b>にする</li><li><b class=\"key\">属性ベースアクセス制御（ABAC）</b>：IdPの属性をセッションタグとして渡し、タグ条件でリソースへのアクセスを制御</li><li>Identity Centerは1つのリージョンにインスタンスを持つ。委任管理者を使えば管理アカウント外で運用可能</li><li><span class=\"trap\">アプリケーションのエンドユーザー（顧客）認証はCognito</span>。Identity Centerは従業員向け</li></ul>",
       "oxIds": [
        "ox-1-3-p1-a",
        "ox-1-3-p1-b",
        "ox-1-3-p1-c"
       ]
      },
      {
       "id": "1-3-p2",
       "title": "クロスアカウントアクセス（STS AssumeRole）",
       "html": "<h4>AssumeRoleの仕組み</h4><ul><li>ターゲットアカウントにIAMロールを作り、<b class=\"key\">信頼ポリシー</b>で「誰が引き受けられるか」を指定（プリンシパルにアカウントやロールを指定）</li><li>呼び出し側には<b class=\"key\">sts:AssumeRole を許可するIDポリシー</b>が必要。<span class=\"trap\">信頼ポリシーと呼び出し側の許可の両方が必要</span>（同一アカウント内では片方で足りる場合があるが、クロスアカウントは両方必須）</li><li>STSが<b class=\"key\">一時的な認証情報</b>（デフォルト1時間、ロールチェーンは最大1時間）を発行</li></ul><h4>関連機能</h4><table><tr><th>機能</th><th>用途</th></tr><tr><td>ExternalId</td><td><b class=\"key\">混乱した代理（confused deputy）問題</b>対策。サードパーティSaaSにロールを引き受けさせる時に信頼ポリシーへ条件として設定</td></tr><tr><td>aws:PrincipalOrgID</td><td>信頼ポリシーで自組織内のみに限定</td></tr><tr><td>MFA条件</td><td>aws:MultiFactorAuthPresent で引き受けにMFAを要求</td></tr><tr><td>SourceIdentity / セッションタグ</td><td>監査性の向上、ABAC</td></tr></table><ul><li>Webフェデレーション/SAMLフェデレーション：AssumeRoleWithWebIdentity / AssumeRoleWithSAML</li></ul>",
       "oxIds": [
        "ox-1-3-p2-a",
        "ox-1-3-p2-b",
        "ox-1-3-p2-c"
       ]
      },
      {
       "id": "1-3-p3",
       "title": "リソースベースポリシーとクロスアカウント",
       "html": "<h4>2つの方式の違い</h4><table><tr><th>方式</th><th>動き</th><th>向く場面</th></tr><tr><td>ロール引き受け</td><td>呼び出し元は<b class=\"key\">自分のアイデンティティを一時的に手放し</b>ターゲットのロールで動く</td><td>多数のサービスをまたぐ操作、監査をロール単位にしたい</td></tr><tr><td>リソースベースポリシー</td><td>呼び出し元は<b class=\"key\">元のアイデンティティのまま</b>リソースにアクセス</td><td>S3、SQS、SNS、KMS、Lambda、Secrets Managerなど。ロールの切替が不要</td></tr></table><h4>押さえるポイント</h4><ul><li>S3にクロスアカウントで書き込む場合：バケットポリシーとIDポリシーの両方が必要（別アカウントのプリンシパルの場合）</li><li>KMSキーは<b class=\"key\">キーポリシー</b>が主。クロスアカウントではキーポリシーで許可し、利用側もIDポリシーで許可</li><li><span class=\"trap\">別アカウントから書き込まれたS3オブジェクトの所有者</span>は書き込み側のままになる場合がある → <b class=\"key\">バケット所有者強制（BucketOwnerEnforced）</b>のACL無効化で解決</li><li>Lambdaを別アカウントから呼ぶ：関数のリソースベースポリシーで許可</li></ul>",
       "oxIds": [
        "ox-1-3-p3-a",
        "ox-1-3-p3-b",
        "ox-1-3-p3-c"
       ]
      },
      {
       "id": "1-3-p4",
       "title": "ID フェデレーションと実務の判断",
       "html": "<h4>よくあるシナリオと答え</h4><table><tr><th>要件</th><th>答え</th></tr><tr><td>社内ADの従業員が複数アカウントへSSO</td><td>IAM Identity Center + AD（AD Connector / Managed AD / 外部IdP）</td></tr><tr><td>外部IdP（Entra ID、Okta）からのユーザー/グループ自動同期</td><td><b class=\"key\">SCIM</b>プロビジョニング</td></tr><tr><td>EC2上アプリが他アカウントのS3へアクセス</td><td>インスタンスプロファイルのロールが<b class=\"key\">ターゲットのロールをAssumeRole</b>。アクセスキーは埋め込まない</td></tr><tr><td>オンプレのサーバーがAWSにアクセス</td><td><b class=\"key\">IAM Roles Anywhere</b>（X.509証明書で一時認証情報）／SSMハイブリッドアクティベーション</td></tr><tr><td>モバイルアプリのユーザーが自分のS3領域にアクセス</td><td>Cognito ID プール</td></tr></table><h4>引っ掛け</h4><ul><li><span class=\"trap\">長期のアクセスキーをアカウント間で配る</span>選択肢はほぼ誤り</li><li>緊急時のため管理アカウントに<b class=\"key\">ブレークグラス（緊急用）</b>アクセスを用意し、利用をアラート対象とする設計も出る</li></ul>",
       "oxIds": [
        "ox-1-3-p4-a",
        "ox-1-3-p4-b",
        "ox-1-3-p4-c"
       ]
      }
     ]
    },
    {
     "id": "1-4",
     "title": "VPC間接続と Transit Gateway・PrivateLink",
     "pages": [
      {
       "id": "1-4-p1",
       "title": "VPC ピアリングの特徴と限界",
       "html": "<h4>VPCピアリング</h4><ul><li>2つのVPC間を<b class=\"key\">プライベートIPで1対1接続</b>。同一／別アカウント、同一／別リージョン（リージョン間ピアリング）が可能</li><li><span class=\"trap\">推移的ルーティング不可</span>：A-B、B-C をピアリングしても A と C は通信できない</li><li><b class=\"key\">CIDRが重複していると作成できない</b></li><li>双方のルートテーブルにピア宛ルートが必要。セキュリティグループ/NACLでも許可する</li><li>ピア先VPCの<b class=\"key\">IGW・NAT・VPNやDirect Connect</b>をエッジルーティングで借りることはできない</li><li>データ転送：同一AZ内は無料、AZ跨ぎやリージョン間は課金</li></ul><h4>使いどころ</h4><ul><li>少数VPCの単純な接続、<b class=\"key\">低コスト・低レイテンシ・帯域上限なし</b>（TGWにはアタッチメントあたりの帯域上限がある）</li><li>VPC数が増えると接続数が n(n-1)/2 で爆発 → <b class=\"key\">Transit Gateway</b>へ</li></ul>",
       "oxIds": [
        "ox-1-4-p1-a",
        "ox-1-4-p1-b",
        "ox-1-4-p1-c"
       ]
      },
      {
       "id": "1-4-p2",
       "title": "Transit Gateway（TGW）",
       "html": "<h4>ハブ＆スポーク</h4><ul><li>AWS Transit Gateway：リージョン単位のマネージドなクラウドルーター。VPC、VPN、Direct Connect Gateway、TGWピアリング、Connectをアタッチして<b class=\"key\">推移的</b>に接続</li><li><b class=\"key\">ルートテーブルを複数</b>持てる → アタッチメントごとに関連付け（association）と伝播（propagation）を制御してセグメンテーション（本番と開発の分離など）</li><li><b class=\"key\">リージョン間はTGWピアリング</b>（静的ルートのみ、動的伝播は不可）</li><li><b class=\"key\">ECMP</b>：複数のVPN接続を束ねて帯域を拡大（VPNアタッチメントで利用可）</li><li><b class=\"key\">RAM共有</b>で組織全体のVPCが同じTGWを利用。アタッチメントはVPCごと、AZごとにサブネットを指定</li><li>マルチキャストをサポート</li></ul><h4>代表パターン：集中型エグレス/検査</h4><ul><li>検査VPC（ファイアウォール、Network Firewall、Gateway Load Balancerのアプライアンス）をTGWに接続し、スポークの出入口トラフィックを集約</li><li><span class=\"trap\">非対称ルーティング回避</span>のため<b class=\"key\">アプライアンスモード</b>を有効化（同一フローを同じAZに固定）</li></ul><h4>選択基準</h4><table><tr><th>要件</th><th>答え</th></tr><tr><td>数十〜数千VPC、推移的接続、オンプレ統合</td><td>Transit Gateway</td></tr><tr><td>2〜3VPCの単純接続、最低コスト</td><td>VPCピアリング</td></tr></table>",
       "oxIds": [
        "ox-1-4-p2-a",
        "ox-1-4-p2-b",
        "ox-1-4-p2-c"
       ]
      },
      {
       "id": "1-4-p3",
       "title": "AWS PrivateLink と VPC エンドポイント",
       "html": "<h4>エンドポイントの種類</h4><table><tr><th>種類</th><th>特徴</th></tr><tr><td><b class=\"key\">ゲートウェイ型</b></td><td><b class=\"key\">S3とDynamoDBのみ</b>。ルートテーブルにプレフィックスリストで経路追加。無料。VPC外（オンプレ・別リージョン・ピア先）からは使えない</td></tr><tr><td><b class=\"key\">インターフェイス型</b>（PrivateLink）</td><td>サブネットにENIを作成。多くのAWSサービス・自社サービス・Marketplaceサービス。時間とデータ処理で課金。オンプレからDX/VPN経由でも利用可</td></tr><tr><td>GWLB エンドポイント</td><td>サードパーティアプライアンスへ透過的にトラフィックを送る</td></tr></table><h4>自社サービスの公開（エンドポイントサービス）</h4><ul><li>提供側：<b class=\"key\">NLB（またはGWLB）</b>の前にエンドポイントサービスを作成。利用側VPCにインターフェイスエンドポイントを作る</li><li><b class=\"key\">一方向・CIDR重複OK・数千VPCに公開可</b>・VPC全体ではなく特定サービスのみを公開できる</li><li><span class=\"trap\">VPC全体のネットワーク接続が必要ならPeering/TGW、特定サービスだけをプライベート公開するならPrivateLink</span></li></ul><h4>追加ポイント</h4><ul><li>インターフェイスエンドポイントの<b class=\"key\">プライベートDNS</b>を有効にすると、標準のサービス名がVPC内でエンドポイントのIPに解決される</li><li>エンドポイントポリシーでアクセス可能なプリンシパル/リソースを制限（例：自組織のバケットだけ）</li><li>S3には、オンプレから使えるインターフェイス型エンドポイントもある</li></ul>",
       "oxIds": [
        "ox-1-4-p3-a",
        "ox-1-4-p3-b",
        "ox-1-4-p3-c"
       ]
      },
      {
       "id": "1-4-p4",
       "title": "接続方式の選択と VPC 共有",
       "html": "<h4>判断フロー</h4><table><tr><th>要件</th><th>選択</th></tr><tr><td>特定の1サービスだけを多数のアカウント/VPCに公開、CIDR重複あり</td><td>PrivateLink</td></tr><tr><td>多数のVPCを全体接続、オンプレも接続</td><td>Transit Gateway</td></tr><tr><td>2つのVPCだけ、安価・高帯域</td><td>VPCピアリング</td></tr><tr><td>ネットワークを集約し、各チームはサブネット内にリソースだけ置きたい</td><td>VPC共有（RAM）</td></tr><tr><td>AWSサービス（S3等）へインターネットを経由せず接続</td><td>VPCエンドポイント</td></tr></table><h4>集中型エグレス</h4><ul><li>NATゲートウェイを<b class=\"key\">エグレスVPCに集約</b>し、スポークからはTGW経由。NAT数とコストを削減</li><li>ただし<span class=\"trap\">NATゲートウェイはAZ単位</span>：可用性のためAZごとに配置する</li><li>IPv6のみのエグレスには<b class=\"key\">Egress-only インターネットゲートウェイ</b></li></ul><h4>VPC Lattice</h4><ul><li><b class=\"key\">Amazon VPC Lattice</b>：サービス間（アプリ層）の接続・認可を、VPC/アカウントをまたいで簡素化するアプリケーションネットワーク。CIDR重複でも可、認証ポリシー（IAM）でサービス単位の制御</li></ul>",
       "oxIds": [
        "ox-1-4-p4-a",
        "ox-1-4-p4-b",
        "ox-1-4-p4-c"
       ]
      }
     ]
    },
    {
     "id": "1-5",
     "title": "ハイブリッド接続：Direct Connect と VPN",
     "pages": [
      {
       "id": "1-5-p1",
       "title": "Site-to-Site VPN",
       "html": "<h4>基本</h4><ul><li>AWS Site-to-Site VPN：インターネット経由の<b class=\"key\">IPsecトンネル</b>。1接続あたり<b class=\"key\">冗長な2本のトンネル</b>（AZ別のエンドポイント）</li><li>AWS側終端：仮想プライベートゲートウェイ（VGW）／Transit Gateway／（アクセラレートVPNはTGWのみ）</li><li>1トンネルあたりの帯域は最大約1.25Gbps。<b class=\"key\">TGW+ECMP</b>で複数接続を束ねて帯域拡大（VGWはECMP非対応）</li><li>ルーティング：<b class=\"key\">BGP（動的）</b>または静的。冗長性・フェイルオーバーにはBGP推奨</li><li><b class=\"key\">アクセラレートVPN</b>：Global Acceleratorを使いエッジ経由でトンネルの品質を改善</li></ul><h4>用途</h4><ul><li>即時に使える、低コスト、DXのバックアップ、暗号化が必要な経路</li><li><span class=\"trap\">レイテンシ・帯域が安定しない</span>ため、大容量や安定性要件にはDirect Connect</li></ul>",
       "oxIds": [
        "ox-1-5-p1-a",
        "ox-1-5-p1-b",
        "ox-1-5-p1-c"
       ]
      },
      {
       "id": "1-5-p2",
       "title": "AWS Direct Connect",
       "html": "<h4>特徴</h4><ul><li>専用線でオンプレミスとAWSを接続。安定した低レイテンシ、大容量、データ転送料の低減</li><li>接続形態：<b class=\"key\">専用接続</b>（1/10/100Gbps、顧客がロケーションで物理接続）、ホスト接続（パートナー経由、より小さな帯域）</li><li>仮想インターフェイス（VIF）：<b class=\"key\">プライベートVIF</b>（VPC）、パブリックVIF（パブリックサービスのIP）、<b class=\"key\">トランジットVIF</b>（Direct Connect GatewayからTGWへ）</li><li><span class=\"trap\">DXそのものは暗号化されない</span>：暗号化には<b class=\"key\">DX上のSite-to-Site VPN（パブリックVIFまたはトランジットVIF上のIPsec）</b>か、MACsec（専用接続）を使う</li><li>開通までに<b class=\"key\">数週間以上</b>かかることがある → 即時要件にはVPN</li></ul><h4>Direct Connect Gateway</h4><ul><li><b class=\"key\">グローバルなリソース</b>。1つのDX接続から、複数リージョン・複数アカウントのVPC（VGW）やTGWに接続可能</li><li><span class=\"trap\">DX Gateway同士やVPC間の通信を仲介はしない</span>（VPC間通信は不可）</li><li>プライベートVIF→DX Gateway→VGW／トランジットVIF→DX Gateway→TGW</li></ul>",
       "oxIds": [
        "ox-1-5-p2-a",
        "ox-1-5-p2-b",
        "ox-1-5-p2-c"
       ]
      },
      {
       "id": "1-5-p3",
       "title": "高可用性設計と組み合わせ",
       "html": "<h4>冗長性の段階（レジリエンシー）</h4><table><tr><th>構成</th><th>SLA観点</th></tr><tr><td>最大レジリエンス</td><td><b class=\"key\">異なる2つ以上のDXロケーション</b>、それぞれに別デバイスで2本以上</td></tr><tr><td>高レジリエンス</td><td>2つのロケーションに1本ずつ</td></tr><tr><td>開発/テスト</td><td>1ロケーションに別デバイスで2本</td></tr></table><h4>バックアップ構成</h4><ul><li><b class=\"key\">DX + Site-to-Site VPN</b>をバックアップ：BGPで<b class=\"key\">DXを優先</b>（AS PATHやローカル優先度）。DXが選好されるのは最長プレフィックス一致が同じ場合の既定動作</li><li>DX + DX：二重化。コストは高いが帯域保証</li><li><span class=\"trap\">最長プレフィックス一致が最優先</span>：DX側に長いプレフィックスを広告すればDX、VPN側を短くすれば確実にDX優先にできる</li></ul><h4>BFD</h4><ul><li><b class=\"key\">BFD（双方向フォワーディング検出）</b>を有効化すると障害検知とフェイルオーバーが速くなる</li></ul>",
       "oxIds": [
        "ox-1-5-p3-a",
        "ox-1-5-p3-b",
        "ox-1-5-p3-c"
       ]
      },
      {
       "id": "1-5-p4",
       "title": "ハイブリッド接続の選択問題パターン",
       "html": "<h4>要件別の答え</h4><table><tr><th>要件</th><th>答え</th></tr><tr><td>数日以内の接続、暗号化必須、予算小</td><td>Site-to-Site VPN</td></tr><tr><td>大容量、安定、低遅延、暗号化も必要</td><td>DX + その上のIPsec VPN</td></tr><tr><td>複数アカウント/リージョンのVPCをDXでつなぐ</td><td>DX Gateway + TGW（トランジットVIF）</td></tr><tr><td>DXの帯域が足りない（1Gbps回線のみ）</td><td>LAG（リンク集約）、または追加回線／上位帯域の接続</td></tr><tr><td>数千のリモートPCやクライアント</td><td><b class=\"key\">AWS Client VPN</b>（OpenVPNベース）</td></tr><tr><td>拠点のSD-WAN等</td><td><b class=\"key\">TGW Connect（GRE+BGP）</b></td></tr><tr><td>大規模データ移行（TB〜PB）</td><td>Snowball／DataSync。回線だけに頼らない</td></tr></table><ul><li><span class=\"trap\">DX回線は1本ではSPOF</span>。「高可用性」と書かれていたら冗長化が答え</li><li><b class=\"key\">ホストDX接続</b>はパートナー経由で小帯域も可</li></ul>",
       "oxIds": [
        "ox-1-5-p4-a",
        "ox-1-5-p4-b",
        "ox-1-5-p4-c"
       ]
      }
     ]
    },
    {
     "id": "1-6",
     "title": "Route 53 とハイブリッド DNS",
     "pages": [
      {
       "id": "1-6-p1",
       "title": "Route 53 ホストゾーンとルーティングポリシー",
       "html": "<h4>ホストゾーン</h4><ul><li>パブリックホストゾーン：インターネット向け。<b class=\"key\">プライベートホストゾーン（PHZ）</b>：関連付けたVPC内のみで解決</li><li>PHZ利用には、VPCの<b class=\"key\">enableDnsHostnames と enableDnsSupport</b>を有効にする</li><li>別アカウントのVPCをPHZに関連付けるには、まず所有側で<b class=\"key\">関連付け承認</b>を作成し、VPC側アカウントがAPI/CLIで関連付ける（CLI/API操作が必要）</li></ul><h4>ルーティングポリシー</h4><table><tr><th>ポリシー</th><th>用途</th></tr><tr><td>シンプル</td><td>1レコード</td></tr><tr><td>加重</td><td>割合配分、カナリア</td></tr><tr><td>レイテンシー</td><td>最も低遅延のリージョン</td></tr><tr><td>フェイルオーバー</td><td>ヘルスチェックでアクティブ/パッシブ</td></tr><tr><td>位置情報</td><td>ユーザーの地域で振り分け（規制・言語）</td></tr><tr><td>地理的近接性</td><td>距離と<b class=\"key\">バイアス</b>で調整（Traffic Flow）</td></tr><tr><td>複数値回答</td><td>ヘルスチェック付きで複数IP返却</td></tr><tr><td>IPベース</td><td>クライアントCIDRで振り分け</td></tr></table><ul><li><span class=\"trap\">エイリアスレコード</span>：Zone Apex（ルートドメイン）に使える。ALB/CloudFront/S3静的サイト等を指す。AWSリソース宛のエイリアスクエリは無料。CNAMEは apex に使えない</li></ul>",
       "oxIds": [
        "ox-1-6-p1-a",
        "ox-1-6-p1-b",
        "ox-1-6-p1-c"
       ]
      },
      {
       "id": "1-6-p2",
       "title": "Route 53 Resolver とハイブリッド DNS",
       "html": "<h4>仕組み</h4><ul><li>VPC内ではRoute 53 Resolver（.2アドレス／AmazonProvidedDNS）が自動的に利用可能</li><li>デフォルトではオンプレのDNSとVPCのDNSは<span class=\"trap\">相互に名前解決できない</span></li><li><b class=\"key\">インバウンドエンドポイント</b>：<b class=\"key\">オンプレ → AWS</b>の名前解決。オンプレDNSからPHZ等をVPCのENI IPへ転送</li><li><b class=\"key\">アウトバウンドエンドポイント</b>＋転送ルール：<b class=\"key\">AWS → オンプレ</b>。例：corp.example.com をオンプレDNSへ転送</li><li>エンドポイントは<b class=\"key\">複数AZのENI</b>で冗長化（最低2つのIPを推奨）。DX/VPN経由で到達できること</li><li>Resolverルールの共有：RAMで組織内に共有し、他アカウントVPCに関連付ける（エンドポイントは1アカウントに集約）</li></ul><h4>集中型DNSの例</h4><ul><li>共有サービスアカウントにエンドポイントと転送ルール、PHZをVPCに関連付け、<b class=\"key\">RAMでルールを共有</b></li><li>Route 53 Resolver DNS Firewall：ドメインの許可/拒否リストでVPCからのDNS解決を制御（DNSトンネリング対策）</li><li>Resolver クエリログ：VPCからのDNSクエリをS3/CloudWatch Logs/Firehoseへ</li></ul>",
       "oxIds": [
        "ox-1-6-p2-a",
        "ox-1-6-p2-b",
        "ox-1-6-p2-c"
       ]
      },
      {
       "id": "1-6-p3",
       "title": "マルチアカウント環境の DNS 設計",
       "html": "<h4>パターン</h4><table><tr><th>要件</th><th>設計</th></tr><tr><td>多数のVPCで同じプライベートゾーンを使う</td><td><b class=\"key\">PHZを複数VPCに関連付け</b>（アカウント跨ぎは承認＋関連付け）</td></tr><tr><td>オンプレ⇔AWSの双方向</td><td>インバウンド＋アウトバウンドのエンドポイントを共有サービスVPCに集約、転送ルールをRAM共有</td></tr><tr><td>VPCエンドポイントのDNS名を他VPCから解決</td><td>PHZのレコードをVPC関連付け、またはTGW経由で共有。インターフェイスエンドポイントのプライベートDNSは<span class=\"trap\">そのVPC内のみ</span>有効</td></tr><tr><td>DNS通信の可用性</td><td>Route 53は100%可用性SLA。ヘルスチェックはエンドポイントやCloudWatchアラームに基づく</td></tr></table><h4>DNSSEC / 機密性</h4><ul><li>パブリックホストゾーンでは<b class=\"key\">DNSSEC署名</b>が可能（KMSの非対称キー、us-east-1）</li><li><b class=\"key\">Route 53 Profiles</b>：複数VPCにDNS設定（PHZ関連付け、Resolverルール、DNS Firewallルールグループ）を一括適用し、RAMで共有できる</li></ul>",
       "oxIds": [
        "ox-1-6-p3-a",
        "ox-1-6-p3-b",
        "ox-1-6-p3-c"
       ]
      }
     ]
    },
    {
     "id": "1-7",
     "title": "集中ログとセキュリティガバナンス",
     "pages": [
      {
       "id": "1-7-p1",
       "title": "組織 CloudTrail と集中ログ",
       "html": "<h4>CloudTrail</h4><ul><li><b class=\"key\">組織の証跡（Organization trail）</b>：管理アカウント（または委任管理者）で作成すると、全メンバーアカウント・全リージョンのイベントを1つのS3バケットに記録。メンバーは証跡を変更・削除できない</li><li>管理イベントはデフォルト記録、データイベント（S3オブジェクト、Lambda実行等）は追加設定</li><li><b class=\"key\">ログファイルの整合性検証</b>（ダイジェストファイル）で改ざん検知</li><li>CloudTrail Lake：イベントデータストアに対しSQLでクエリ（組織イベントデータストア可）</li></ul><h4>ログ集約の設計</h4><ul><li><b class=\"key\">ログアーカイブアカウント</b>に集中S3バケット：バケットポリシーで書き込みを許可し、SSE-KMS、バージョニング、<b class=\"key\">S3 Object Lock（コンプライアンスモード）</b>、MFA Delete、ライフサイクル（Glacierへ移行）</li><li>CloudWatch Logsのクロスアカウント集約：<b class=\"key\">サブスクリプションフィルタ</b>→Kinesis Data Streams／Firehose／Lambda。CloudWatch ログのクロスアカウント/リージョン監視アカウント機能（Observability Access Manager）もある</li><li><span class=\"trap\">ログ改ざん防止</span>の要件 → Object Lock + 別アカウントに隔離 + SCPで削除禁止</li><li>分析：Athena、OpenSearch、<b class=\"key\">Amazon Security Lake</b>（OCSF形式でセキュリティデータを集約、組織全体）</li></ul>",
       "oxIds": [
        "ox-1-7-p1-a",
        "ox-1-7-p1-b",
        "ox-1-7-p1-c"
       ]
      },
      {
       "id": "1-7-p2",
       "title": "AWS Config による構成管理",
       "html": "<h4>Configの役割</h4><ul><li>リソース構成の記録、変更履歴、ルールによる準拠評価（マネージドルール／Lambdaカスタムルール／Guard）</li><li><b class=\"key\">自動修復</b>：SSM Automationランブックで非準拠リソースを修正</li><li><b class=\"key\">コンフォーマンスパック</b>：ルールと修復のセットを一括配備（組織単位でも可）</li><li><b class=\"key\">Config アグリゲーター</b>：複数アカウント・リージョンの構成と準拠状況を1つのアカウントに集約（Organizations連携で自動的に全アカウントを対象に）。<span class=\"trap\">アグリゲーターは参照用の集約で、ルール適用そのものではない</span></li><li><b class=\"key\">組織のConfigルール</b>：管理アカウント／委任管理者から全アカウントへルールを展開</li><li>高度なクエリでSQL風に構成情報を検索</li></ul><h4>使い分け</h4><table><tr><th>知りたいこと</th><th>サービス</th></tr><tr><td>誰がAPIを呼んだか</td><td>CloudTrail</td></tr><tr><td>リソースが今どんな構成で、準拠しているか</td><td>Config</td></tr><tr><td>性能・メトリクス</td><td>CloudWatch</td></tr><tr><td>脅威の検知</td><td>GuardDuty</td></tr></table>",
       "oxIds": [
        "ox-1-7-p2-a",
        "ox-1-7-p2-b",
        "ox-1-7-p2-c"
       ]
      },
      {
       "id": "1-7-p3",
       "title": "GuardDuty・Security Hub・Inspector・Macie",
       "html": "<h4>役割の整理</h4><table><tr><th>サービス</th><th>役割</th></tr><tr><td>GuardDuty</td><td>脅威検出。CloudTrail、VPCフローログ、DNSログ、S3データイベント、EKS監査ログ、Lambda、マルウェア保護などを分析</td></tr><tr><td>Security Hub</td><td>検出結果の<b class=\"key\">集約と準拠スコア</b>。CIS/PCI/AWS基礎セキュリティのベストプラクティス基準、ASFF形式。GuardDuty、Inspector、Macie、Firewall Managerなどの結果を統合</td></tr><tr><td>Inspector</td><td>EC2、ECRコンテナイメージ、Lambdaの<b class=\"key\">脆弱性スキャン</b></td></tr><tr><td>Macie</td><td>S3の<b class=\"key\">機密データ（PII）検出</b></td></tr><tr><td>Detective</td><td>検出結果の根本原因を調査（グラフ分析）</td></tr><tr><td>IAM Access Analyzer</td><td>外部（組織外）に公開されたリソースや未使用アクセスの検出、ポリシー検証</td></tr></table><h4>組織での展開</h4><ul><li>GuardDuty／Security Hub／Macie／Inspectorは委任管理者を設定し、<b class=\"key\">新規アカウントを自動有効化</b>。<b class=\"key\">集約リージョン</b>でマルチリージョンの結果を集約（Security Hub）</li><li><span class=\"trap\">Security Hubは検出そのものではなく集約。有効化にはConfigの記録が前提</span></li><li>自動対処：<b class=\"key\">EventBridge</b>でSecurity Hub／GuardDutyの検出結果を受け、Lambda/SSM/Step Functionsで修復</li></ul>",
       "oxIds": [
        "ox-1-7-p3-a",
        "ox-1-7-p3-b",
        "ox-1-7-p3-c"
       ]
      },
      {
       "id": "1-7-p4",
       "title": "Firewall Manager・Audit Manager・その他統制",
       "html": "<h4>AWS Firewall Manager</h4><ul><li>Organizationsと連携し、WAFルール、Shield Advanced、セキュリティグループ、Network Firewall、Route 53 Resolver DNS Firewall等のポリシーを<b class=\"key\">組織全体へ一括適用・準拠監視</b></li><li>前提：Organizationsの全機能、<b class=\"key\">Firewall Manager管理者アカウント</b>、Config有効化</li><li>新規アカウント・新規リソースにも<b class=\"key\">自動適用</b></li></ul><h4>その他のガバナンスサービス</h4><table><tr><th>サービス</th><th>ポイント</th></tr><tr><td>AWS Artifact</td><td>AWSのコンプライアンスレポートの入手</td></tr><tr><td>Audit Manager</td><td>監査証拠の継続収集と監査レポート作成</td></tr><tr><td>Service Catalog</td><td>承認済みの製品（CFnテンプレート）の<b class=\"key\">セルフサービス提供</b>、制約・ポートフォリオ共有</td></tr><tr><td>Trusted Advisor</td><td>コスト・セキュリティ等の推奨チェック（フルチェックはBusiness/Enterprise以上のサポート）</td></tr><tr><td>Systems Manager</td><td>パッチ、Session Manager、Quick Setupで組織展開</td></tr><tr><td>Health Dashboard</td><td>組織ビューでAWSの障害・計画イベントを集約</td></tr></table><ul><li><span class=\"trap\">「承認済み構成だけをユーザーが選んで作れる」</span>→ Service Catalog。<span class=\"trap\">「新規アカウントにも自動でWAFを強制」</span>→ Firewall Manager</li></ul>",
       "oxIds": [
        "ox-1-7-p4-a",
        "ox-1-7-p4-b",
        "ox-1-7-p4-c"
       ]
      }
     ]
    },
    {
     "id": "1-8",
     "title": "コスト管理とタグ戦略",
     "pages": [
      {
       "id": "1-8-p1",
       "title": "コスト配分タグと Cost Explorer",
       "html": "<h4>コスト配分タグ</h4><ul><li>AWS生成タグ（aws:createdBy等）とユーザー定義タグ。コスト配分タグとして<b class=\"key\">有効化（アクティブ化）</b>して初めてCost Explorer／CURに反映</li><li><span class=\"trap\">有効化前の過去分には遡って反映されない</span>（有効化以降）</li><li><b class=\"key\">タグポリシー</b>（Organizations）でキー名・値の表記ゆれを防止。SCPで必須タグなしのリソース作成を拒否（aws:RequestTag条件）</li><li>タグ未対応のコストや共有コストは<b class=\"key\">コストカテゴリ</b>（ルールで分類）や分割コスト配分データ（ECS/EKS）で配分</li></ul><h4>Cost Explorer</h4><ul><li>標準で過去13か月分(設定で期間拡張も可)＋予測（最大12か月）の可視化・フィルタ・グループ化。<b class=\"key\">リザベーション/Savings Plansの利用率・カバレッジ</b>レポートと購入推奨</li><li>組織の管理アカウントでは全メンバーが見える。メンバーの閲覧は設定で可否を制御</li></ul><h4>Cost Anomaly Detection</h4><ul><li>機械学習で<b class=\"key\">異常な支出</b>を検知し、SNS/Eメールで通知</li></ul>",
       "oxIds": [
        "ox-1-8-p1-a",
        "ox-1-8-p1-b",
        "ox-1-8-p1-c"
       ]
      },
      {
       "id": "1-8-p2",
       "title": "AWS Budgets と請求の統制",
       "html": "<h4>AWS Budgets</h4><ul><li>種類：コスト予算、使用量予算、RI/Savings Plansの利用率・カバレッジ予算</li><li><b class=\"key\">実績値と予測値</b>の両方でしきい値アラート（SNS/Eメール/Chatbot）</li><li><b class=\"key\">予算アクション</b>：しきい値超過時にIAM/SCPポリシーの適用、EC2/RDSインスタンスの停止などを自動実行</li><li><span class=\"trap\">Budgetsは通知・アクションであり、課金を自動的に止めるハードリミットではない</span></li></ul><h4>組織の請求</h4><ul><li><b class=\"key\">一括請求</b>：使用量の合算によりボリューム割引（S3、データ転送など）、<b class=\"key\">RI/Savings Plansの割引共有</b>を組織全体で適用（共有を無効にするアカウント設定も可）</li><li>Sandbox OU用に、アカウント単位の予算と予算アクションを設定し、超過時にSCPで操作を拒否するパターンが定番</li><li><b class=\"key\">請求コンソールへのアクセス</b>はIAMで明示的に有効化が必要（IAMユーザー/ロール向けアクセス）</li></ul>",
       "oxIds": [
        "ox-1-8-p2-a",
        "ox-1-8-p2-b",
        "ox-1-8-p2-c"
       ]
      },
      {
       "id": "1-8-p3",
       "title": "Cost and Usage Report（CUR）と分析",
       "html": "<h4>CUR（Cost and Usage Report）</h4><ul><li>最も<b class=\"key\">詳細</b>なコスト・使用量データ。リソースID・タグ・時間単位まで含む。S3に定期出力</li><li>形式：CSV／Parquet。<b class=\"key\">Athena統合</b>（Glueクローラ、CloudFormationテンプレート自動生成）でSQL分析、QuickSightで可視化、Redshift連携</li><li><b class=\"key\">CUR 2.0 / Data Exports</b>：新しいデータエクスポート（カラムを選択可能）</li><li>管理アカウントで作成すれば組織全体を含む</li></ul><h4>使い分け</h4><table><tr><th>目的</th><th>ツール</th></tr><tr><td>手軽な傾向把握・予測</td><td>Cost Explorer</td></tr><tr><td>しきい値監視・アクション</td><td>Budgets</td></tr><tr><td>リソース単位の詳細分析、チャージバック</td><td>CUR + Athena + QuickSight</td></tr><tr><td>異常検知</td><td>Cost Anomaly Detection</td></tr><tr><td>右サイジング推奨</td><td>Compute Optimizer</td></tr><tr><td>購入オプション</td><td>Savings Plans（Compute SPは柔軟）/ RI</td></tr></table><ul><li><span class=\"trap\">部署別請求（チャージバック）</span>：アカウント分離（最も確実）＋タグ＋コストカテゴリ</li></ul>",
       "oxIds": [
        "ox-1-8-p3-a",
        "ox-1-8-p3-b",
        "ox-1-8-p3-c"
       ]
      }
     ]
    }
   ],
   "ox": [
    {
     "id": "ox-1-1-p1-a",
     "lesson": "1-1",
     "text": "SCPおよびタグポリシーなどの統制機能を利用するには、Organizationsを「全機能」で有効化する必要がある。",
     "answer": true,
     "explain": "一括請求のみのモードでは統制機能は使えません。全機能にする必要があります。"
    },
    {
     "id": "ox-1-1-p1-b",
     "lesson": "1-1",
     "text": "OUは1階層のみで、入れ子にはできない。",
     "answer": false,
     "explain": "OUは最大5階層まで入れ子にできます。"
    },
    {
     "id": "ox-1-1-p1-c",
     "lesson": "1-1",
     "text": "管理アカウントには本番ワークロードを置くのが推奨である。",
     "answer": false,
     "explain": "管理アカウントはSCPの対象外で影響範囲が大きいため、本番ワークロードは置かないのがベストプラクティスです。"
    },
    {
     "id": "ox-1-1-p2-a",
     "lesson": "1-1",
     "text": "SCPはIAMポリシーと同様にプリンシパルへ権限を付与できる。",
     "answer": false,
     "explain": "SCPは許可の上限を定めるだけで、権限を付与しません。IAM側の許可も必要です。"
    },
    {
     "id": "ox-1-1-p2-b",
     "lesson": "1-1",
     "text": "SCPはメンバーアカウントのルートユーザーにも適用される。",
     "answer": true,
     "explain": "メンバーアカウントのルートユーザーはSCPの対象です（管理アカウントは対象外）。"
    },
    {
     "id": "ox-1-1-p2-c",
     "lesson": "1-1",
     "text": "SCPは管理アカウントのIAMロールの操作も制限できる。",
     "answer": false,
     "explain": "管理アカウントにはSCPは適用されません。"
    },
    {
     "id": "ox-1-1-p3-a",
     "lesson": "1-1",
     "text": "特定リージョン以外の利用を禁止するには、SCPでaws:RequestedRegion条件を使うのが一般的である。",
     "answer": true,
     "explain": "リージョン制限の定番です。グローバルサービスはNotActionで除外します。"
    },
    {
     "id": "ox-1-1-p3-b",
     "lesson": "1-1",
     "text": "リソースポリシーで自組織のアカウントだけにアクセスを許可するには、aws:PrincipalOrgID条件キーが使える。",
     "answer": true,
     "explain": "アカウントIDを列挙せず組織単位で許可できます。"
    },
    {
     "id": "ox-1-1-p3-c",
     "lesson": "1-1",
     "text": "開発者が作成するIAMロールの権限の天井を、アカウント内で委任管理するにはSCPが最適である。",
     "answer": false,
     "explain": "その用途はIAM権限境界です。SCPは組織レベルのガードレールです。"
    },
    {
     "id": "ox-1-1-p4-a",
     "lesson": "1-1",
     "text": "GuardDutyなどのセキュリティサービスは、管理アカウント以外を委任管理者に指定できる。",
     "answer": true,
     "explain": "セキュリティ専用アカウントを委任管理者にするのが推奨構成です。"
    },
    {
     "id": "ox-1-1-p4-b",
     "lesson": "1-1",
     "text": "タグポリシーはタグのないリソースの作成を常に自動で拒否する。",
     "answer": false,
     "explain": "基本は準拠評価です。作成拒否はサポート対象リソースで強制設定した場合に限られます。"
    },
    {
     "id": "ox-1-1-p4-c",
     "lesson": "1-1",
     "text": "RCPはIAMプリンシパルに対する権限の上限を設定するポリシーである。",
     "answer": false,
     "explain": "RCPはリソースに対する権限の上限です。プリンシパル側はSCPです。"
    },
    {
     "id": "ox-1-2-p1-a",
     "lesson": "1-2",
     "text": "マルチアカウント構成の利点には、爆発半径の限定と請求の分離が含まれる。",
     "answer": true,
     "explain": "どちらも主要な目的です。"
    },
    {
     "id": "ox-1-2-p1-b",
     "lesson": "1-2",
     "text": "ログアーカイブアカウントは、通常Workloads OUに置く。",
     "answer": false,
     "explain": "ログやセキュリティ関連はSecurity OUに置くのが推奨です。"
    },
    {
     "id": "ox-1-2-p1-c",
     "lesson": "1-2",
     "text": "Sandbox OUには本番並みの広い権限を与え、予算制限は設けない。",
     "answer": false,
     "explain": "Sandboxは予算上限と厳しいSCPで統制するのが一般的です。"
    },
    {
     "id": "ox-1-2-p2-a",
     "lesson": "1-2",
     "text": "Control Towerの予防的ガードレールはAWS Configルールで実装される。",
     "answer": false,
     "explain": "予防的はSCP、発見的がConfigルールで実装されます。"
    },
    {
     "id": "ox-1-2-p2-b",
     "lesson": "1-2",
     "text": "Control Towerのランディングゾーンには、ログアーカイブアカウントと監査アカウントが含まれる。",
     "answer": true,
     "explain": "Security OUに作成されます。"
    },
    {
     "id": "ox-1-2-p2-c",
     "lesson": "1-2",
     "text": "プロアクティブコントロールは、CloudFormationテンプレートのデプロイ前に違反を検査する。",
     "answer": true,
     "explain": "CloudFormation Hooksで実装されます。"
    },
    {
     "id": "ox-1-2-p3-a",
     "lesson": "1-2",
     "text": "Control Towerのホームリージョンは、構築後に自由に変更できる。",
     "answer": false,
     "explain": "ホームリージョンは後から変更できません。"
    },
    {
     "id": "ox-1-2-p3-b",
     "lesson": "1-2",
     "text": "StackSetsをOrganizationsと統合すると、OUに追加された新しいアカウントへ自動的にスタックを展開できる。",
     "answer": true,
     "explain": "サービス管理の権限と自動デプロイを使います。"
    },
    {
     "id": "ox-1-2-p3-c",
     "lesson": "1-2",
     "text": "Control Tower管理下のリソースを手動で変更すると、ドリフトとして検出されることがある。",
     "answer": true,
     "explain": "管理リソースの手動変更はドリフトの原因です。"
    },
    {
     "id": "ox-1-2-p4-a",
     "lesson": "1-2",
     "text": "RAMを使うと、VPCのサブネットを組織内の他アカウントと共有できる。",
     "answer": true,
     "explain": "VPC共有はRAMの代表例です。"
    },
    {
     "id": "ox-1-2-p4-b",
     "lesson": "1-2",
     "text": "共有サブネットを利用する参加アカウントは、そのサブネットのルートテーブルを変更できる。",
     "answer": false,
     "explain": "ルートテーブルやサブネット自体は所有者のみ管理できます。"
    },
    {
     "id": "ox-1-2-p4-c",
     "lesson": "1-2",
     "text": "S3バケットのアカウント間共有には、RAMの利用が必須である。",
     "answer": false,
     "explain": "S3はバケットポリシー等のリソースポリシーで共有します。"
    },
    {
     "id": "ox-1-3-p1-a",
     "lesson": "1-3",
     "text": "IAM Identity Centerでは、複数のIDソースを同時に有効化できる。",
     "answer": false,
     "explain": "IDソースは同時に1つだけ選択します。"
    },
    {
     "id": "ox-1-3-p1-b",
     "lesson": "1-3",
     "text": "IAM Identity Centerに許可セットを割り当てると、対象アカウントにIAMロールが自動的に作成される。",
     "answer": true,
     "explain": "AWSReservedSSO_で始まるロールが作られます。"
    },
    {
     "id": "ox-1-3-p1-c",
     "lesson": "1-3",
     "text": "Webアプリの一般消費者のサインアップ・サインインには、IAM Identity Centerが適している。",
     "answer": false,
     "explain": "顧客向けIDはAmazon Cognitoの領域です。"
    },
    {
     "id": "ox-1-3-p2-a",
     "lesson": "1-3",
     "text": "クロスアカウントのAssumeRoleでは、ロールの信頼ポリシーと呼び出し元側の許可の両方が必要になる。",
     "answer": true,
     "explain": "クロスアカウントでは両側の許可が必要です。"
    },
    {
     "id": "ox-1-3-p2-b",
     "lesson": "1-3",
     "text": "サードパーティにロールを引き受けさせる際、confused deputy問題の対策としてExternalIdを使う。",
     "answer": true,
     "explain": "信頼ポリシーにExternalIdの条件を設定します。"
    },
    {
     "id": "ox-1-3-p2-c",
     "lesson": "1-3",
     "text": "STSで発行される一時認証情報は、有効期限がなく失効させるまで使える。",
     "answer": false,
     "explain": "一時認証情報には有効期限があります。"
    },
    {
     "id": "ox-1-3-p3-a",
     "lesson": "1-3",
     "text": "S3バケットポリシーでクロスアカウントを許可すれば、呼び出し元はロールを引き受けずに直接アクセスできる。",
     "answer": true,
     "explain": "リソースベースポリシーは元のアイデンティティのままアクセスできます。"
    },
    {
     "id": "ox-1-3-p3-b",
     "lesson": "1-3",
     "text": "別アカウントから書き込まれたS3オブジェクトの所有権問題は、BucketOwnerEnforcedで解決できる。",
     "answer": true,
     "explain": "ACLを無効化し、バケット所有者が所有者となります。"
    },
    {
     "id": "ox-1-3-p3-c",
     "lesson": "1-3",
     "text": "クロスアカウントでKMSキーを使うには、利用側のIDポリシーのみで足りる。",
     "answer": false,
     "explain": "キーポリシーでの許可が必須です。"
    },
    {
     "id": "ox-1-3-p4-a",
     "lesson": "1-3",
     "text": "オンプレミスのサーバーがAWSリソースにアクセスする際、長期アクセスキーの代わりにIAM Roles Anywhereを使える。",
     "answer": true,
     "explain": "X.509証明書で一時認証情報を取得します。"
    },
    {
     "id": "ox-1-3-p4-b",
     "lesson": "1-3",
     "text": "外部IdPのユーザーとグループをIAM Identity Centerへ自動同期するには、SCIMを使う。",
     "answer": true,
     "explain": "SCIMで自動プロビジョニングされます。"
    },
    {
     "id": "ox-1-3-p4-c",
     "lesson": "1-3",
     "text": "他アカウントのS3へアクセスするEC2アプリには、IAMユーザーのアクセスキーをアプリへ埋め込むのが推奨される。",
     "answer": false,
     "explain": "インスタンスプロファイルとAssumeRoleによる一時認証情報が推奨です。"
    },
    {
     "id": "ox-1-4-p1-a",
     "lesson": "1-4",
     "text": "A-B間とB-C間をVPCピアリングすれば、AとCは直接通信できる。",
     "answer": false,
     "explain": "ピアリングは推移的ではありません。"
    },
    {
     "id": "ox-1-4-p1-b",
     "lesson": "1-4",
     "text": "CIDRが重複するVPC同士はピアリングできない。",
     "answer": true,
     "explain": "重複CIDRではピアリング接続を作成できません。"
    },
    {
     "id": "ox-1-4-p1-c",
     "lesson": "1-4",
     "text": "VPCピアリングでは、ピア先VPCのNATゲートウェイを経由してインターネットへ出られる。",
     "answer": false,
     "explain": "エッジ間ルーティングは不可です。"
    },
    {
     "id": "ox-1-4-p2-a",
     "lesson": "1-4",
     "text": "Transit Gatewayはリージョンリソースであり、リージョン間接続にはTGWピアリングを使う。",
     "answer": true,
     "explain": "TGWピアリングで別リージョンのTGWと接続します。"
    },
    {
     "id": "ox-1-4-p2-b",
     "lesson": "1-4",
     "text": "TGWピアリングでは、BGPによる動的ルート伝播が使える。",
     "answer": false,
     "explain": "TGWピアリングは静的ルートのみです。"
    },
    {
     "id": "ox-1-4-p2-c",
     "lesson": "1-4",
     "text": "検査用VPCを経由させる構成では、非対称ルーティング回避にTGWのアプライアンスモードを有効化する。",
     "answer": true,
     "explain": "フローを同じAZのアプライアンスに固定します。"
    },
    {
     "id": "ox-1-4-p3-a",
     "lesson": "1-4",
     "text": "S3のゲートウェイエンドポイントは、オンプレミスからDirect Connect経由で利用できる。",
     "answer": false,
     "explain": "ゲートウェイ型はVPC外からは利用できません。オンプレ経由ならインターフェイス型を使います。"
    },
    {
     "id": "ox-1-4-p3-b",
     "lesson": "1-4",
     "text": "PrivateLinkは、CIDRが重複するVPC間でもサービスを公開できる。",
     "answer": true,
     "explain": "特定サービスの公開であり、CIDR重複の影響を受けません。"
    },
    {
     "id": "ox-1-4-p3-c",
     "lesson": "1-4",
     "text": "自社サービスをPrivateLinkで公開するには、提供側にNLB（またはGWLB）が必要である。",
     "answer": true,
     "explain": "エンドポイントサービスはNLB/GWLBに紐付けます。"
    },
    {
     "id": "ox-1-4-p4-a",
     "lesson": "1-4",
     "text": "NATゲートウェイを1つのエグレスVPCに集約し、TGW経由で利用するとNATの数とコストを減らせる。",
     "answer": true,
     "explain": "集中型エグレスの典型例です。"
    },
    {
     "id": "ox-1-4-p4-b",
     "lesson": "1-4",
     "text": "IPv6のみのサブネットからのアウトバウンド専用通信には、NATゲートウェイを使う。",
     "answer": false,
     "explain": "IPv6にはEgress-only インターネットゲートウェイを使います。"
    },
    {
     "id": "ox-1-4-p4-c",
     "lesson": "1-4",
     "text": "全てのVPCの全体接続が必要な場合、PrivateLinkが最適である。",
     "answer": false,
     "explain": "PrivateLinkは特定サービスの公開向けです。全体接続はTGWです。"
    },
    {
     "id": "ox-1-5-p1-a",
     "lesson": "1-5",
     "text": "Site-to-Site VPN接続は、冗長のため2本のトンネルで構成される。",
     "answer": true,
     "explain": "AWS側の2つのエンドポイントに対して2本張られます。"
    },
    {
     "id": "ox-1-5-p1-b",
     "lesson": "1-5",
     "text": "VGWを使ったVPNでも、ECMPによって複数接続の帯域を束ねられる。",
     "answer": false,
     "explain": "ECMPはTransit Gatewayで利用できます。VGWは非対応です。"
    },
    {
     "id": "ox-1-5-p1-c",
     "lesson": "1-5",
     "text": "Site-to-Site VPNは、安定したレイテンシと帯域を保証する。",
     "answer": false,
     "explain": "インターネット経由のため、保証されません。"
    },
    {
     "id": "ox-1-5-p2-a",
     "lesson": "1-5",
     "text": "Direct Connectの回線は標準でIPsecにより暗号化される。",
     "answer": false,
     "explain": "標準では暗号化されません。VPN上乗せやMACsecで暗号化します。"
    },
    {
     "id": "ox-1-5-p2-b",
     "lesson": "1-5",
     "text": "Direct Connect Gatewayを使えば、1本のDXから複数リージョンのVPCに接続できる。",
     "answer": true,
     "explain": "グローバルなリソースとして複数リージョンに接続可能です。"
    },
    {
     "id": "ox-1-5-p2-c",
     "lesson": "1-5",
     "text": "即日で接続したい場合、Direct Connectの方がSite-to-Site VPNよりも適している。",
     "answer": false,
     "explain": "DXは開通に時間がかかるため、即時要件にはVPNが適しています。"
    },
    {
     "id": "ox-1-5-p3-a",
     "lesson": "1-5",
     "text": "最大レジリエンスの構成では、少なくとも2つの異なるDXロケーションを使う。",
     "answer": true,
     "explain": "ロケーション障害にも耐えるために分けます。"
    },
    {
     "id": "ox-1-5-p3-b",
     "lesson": "1-5",
     "text": "DXのバックアップにVPNを使う場合、同一プレフィックスならBGPでDX経路が優先される。",
     "answer": true,
     "explain": "既定動作でDXが優先されます。"
    },
    {
     "id": "ox-1-5-p3-c",
     "lesson": "1-5",
     "text": "1ロケーションに2本の回線を引けば、ロケーション全体の障害にも耐えられる。",
     "answer": false,
     "explain": "ロケーション障害には耐えられません。"
    },
    {
     "id": "ox-1-5-p4-a",
     "lesson": "1-5",
     "text": "数千台のリモートクライアントから安全にVPCへ接続する用途には、AWS Client VPNが適している。",
     "answer": true,
     "explain": "クライアント向けマネージドVPNです。"
    },
    {
     "id": "ox-1-5-p4-b",
     "lesson": "1-5",
     "text": "TGW Connectは、GREトンネルとBGPを使ってSD-WAN機器などをTGWへ接続する。",
     "answer": true,
     "explain": "TGW ConnectアタッチメントはGREを使います。"
    },
    {
     "id": "ox-1-5-p4-c",
     "lesson": "1-5",
     "text": "DXを1本引けば、高可用性要件は満たされる。",
     "answer": false,
     "explain": "1本では単一障害点です。冗長化が必要です。"
    },
    {
     "id": "ox-1-6-p1-a",
     "lesson": "1-6",
     "text": "ゾーンの頂点（example.com）にはCNAMEを設定でき、ALBを指せる。",
     "answer": false,
     "explain": "apexにはCNAMEは使えません。エイリアスレコードを使います。"
    },
    {
     "id": "ox-1-6-p1-b",
     "lesson": "1-6",
     "text": "位置情報ルーティングは、ユーザーの地理的な所在地に基づいて回答を切り替える。",
     "answer": true,
     "explain": "規制や言語対応の用途で使います。"
    },
    {
     "id": "ox-1-6-p1-c",
     "lesson": "1-6",
     "text": "別アカウントのVPCをプライベートホストゾーンに関連付けるには、関連付け承認の作成が必要である。",
     "answer": true,
     "explain": "CLI/APIで承認と関連付けを行います。"
    },
    {
     "id": "ox-1-6-p2-a",
     "lesson": "1-6",
     "text": "オンプレミスからAWS側のプライベートホストゾーンのレコードを引くには、Route 53 Resolverのインバウンドエンドポイントを使う。",
     "answer": true,
     "explain": "オンプレからAWSへの解決はインバウンドです。"
    },
    {
     "id": "ox-1-6-p2-b",
     "lesson": "1-6",
     "text": "AWSからオンプレのDNSゾーンを解決するには、インバウンドエンドポイントを作成する。",
     "answer": false,
     "explain": "AWSからオンプレはアウトバウンドエンドポイントと転送ルールです。"
    },
    {
     "id": "ox-1-6-p2-c",
     "lesson": "1-6",
     "text": "Resolverの転送ルールは、RAMで他アカウントへ共有できる。",
     "answer": true,
     "explain": "ルールをRAM共有し、各VPCに関連付けます。"
    },
    {
     "id": "ox-1-6-p3-a",
     "lesson": "1-6",
     "text": "Route 53 Profilesを使うと、PHZやResolverルールの関連付けを複数VPCへまとめて適用できる。",
     "answer": true,
     "explain": "DNS設定をプロファイルにまとめて共有します。"
    },
    {
     "id": "ox-1-6-p3-b",
     "lesson": "1-6",
     "text": "インターフェイスエンドポイントのプライベートDNS名は、エンドポイントを作成していない他のVPCでも自動的に解決される。",
     "answer": false,
     "explain": "そのVPC内のみ有効です。"
    },
    {
     "id": "ox-1-6-p3-c",
     "lesson": "1-6",
     "text": "ResolverエンドポイントはENIを複数AZに配置して冗長化する。",
     "answer": true,
     "explain": "最低2つのIPアドレスが必要です。"
    },
    {
     "id": "ox-1-7-p1-a",
     "lesson": "1-7",
     "text": "組織の証跡をOrganizationsで作成すると、メンバーアカウントは証跡を削除できない。",
     "answer": true,
     "explain": "組織の証跡はメンバーから変更できません。"
    },
    {
     "id": "ox-1-7-p1-b",
     "lesson": "1-7",
     "text": "ログの改ざん防止には、ログアーカイブ用S3バケットにObject Lockを設定するのが有効である。",
     "answer": true,
     "explain": "WORMにより上書き・削除を防ぎます。"
    },
    {
     "id": "ox-1-7-p1-c",
     "lesson": "1-7",
     "text": "CloudTrailのデータイベントは、デフォルトで記録される。",
     "answer": false,
     "explain": "既定では管理イベントのみです。データイベントは追加設定が必要です。"
    },
    {
     "id": "ox-1-7-p2-a",
     "lesson": "1-7",
     "text": "Configアグリゲーターを使うと、複数アカウントの準拠状況を1つのアカウントで確認できる。",
     "answer": true,
     "explain": "集約ビューを提供します。"
    },
    {
     "id": "ox-1-7-p2-b",
     "lesson": "1-7",
     "text": "「誰がセキュリティグループを変更したか」を知る最初のデータソースはConfigのみである。",
     "answer": false,
     "explain": "APIの呼び出し主体はCloudTrailで確認します。Configは変更前後の構成を示します。"
    },
    {
     "id": "ox-1-7-p2-c",
     "lesson": "1-7",
     "text": "Configの自動修復には、SSM Automationのランブックが使える。",
     "answer": true,
     "explain": "修復アクションとして指定します。"
    },
    {
     "id": "ox-1-7-p3-a",
     "lesson": "1-7",
     "text": "GuardDutyは、VPCフローログやDNSログを分析して脅威を検出できる。",
     "answer": true,
     "explain": "有効化すれば独自にこれらを分析します。"
    },
    {
     "id": "ox-1-7-p3-b",
     "lesson": "1-7",
     "text": "S3バケット内の機密データ（PII）を検出するには、Inspectorを使う。",
     "answer": false,
     "explain": "PII検出はMacieです。Inspectorは脆弱性スキャンです。"
    },
    {
     "id": "ox-1-7-p3-c",
     "lesson": "1-7",
     "text": "Security Hubは、複数サービスの検出結果をASFF形式で集約し、標準に基づく準拠スコアを提供する。",
     "answer": true,
     "explain": "集約と準拠チェックがSecurity Hubの役割です。"
    },
    {
     "id": "ox-1-7-p4-a",
     "lesson": "1-7",
     "text": "Firewall Managerを使うと、組織内の全アカウントにWAFルールやセキュリティグループポリシーを一括適用できる。",
     "answer": true,
     "explain": "中央のポリシー適用と準拠監視が目的です。"
    },
    {
     "id": "ox-1-7-p4-b",
     "lesson": "1-7",
     "text": "Service Catalogは、承認済みのCloudFormationテンプレートをユーザーがセルフサービスで起動できるようにする。",
     "answer": true,
     "explain": "ガバナンスを保ちながら標準化できます。"
    },
    {
     "id": "ox-1-7-p4-c",
     "lesson": "1-7",
     "text": "Firewall Managerは、Organizationsを使わない単一アカウントでも全機能が利用できる。",
     "answer": false,
     "explain": "Organizationsとの統合が前提です。"
    },
    {
     "id": "ox-1-8-p1-a",
     "lesson": "1-8",
     "text": "コスト配分タグは、有効化した時点より前のコストにも遡って自動的に反映される。",
     "answer": false,
     "explain": "有効化以降のデータが対象です。"
    },
    {
     "id": "ox-1-8-p1-b",
     "lesson": "1-8",
     "text": "SCPで、特定のタグが付いていないリソースの作成を拒否できる。",
     "answer": true,
     "explain": "aws:RequestTagなどの条件キーを使います。"
    },
    {
     "id": "ox-1-8-p1-c",
     "lesson": "1-8",
     "text": "Cost Anomaly Detectionは、機械学習で通常と異なる支出を検知して通知できる。",
     "answer": true,
     "explain": "SNSやメールで通知できます。"
    },
    {
     "id": "ox-1-8-p2-a",
     "lesson": "1-8",
     "text": "AWS Budgetsは、予算超過時にSCPやIAMポリシーを自動でアタッチする予算アクションを実行できる。",
     "answer": true,
     "explain": "予算アクションで対応が可能です。"
    },
    {
     "id": "ox-1-8-p2-b",
     "lesson": "1-8",
     "text": "AWS Budgetsは、予算上限に達するとAWSリソースの課金を必ず自動停止する。",
     "answer": false,
     "explain": "通知とアクションが中心で、ハードリミットではありません。"
    },
    {
     "id": "ox-1-8-p2-c",
     "lesson": "1-8",
     "text": "一括請求によって、組織全体の使用量が合算されボリューム割引が適用される。",
     "answer": true,
     "explain": "一括請求の主要な利点です。"
    },
    {
     "id": "ox-1-8-p3-a",
     "lesson": "1-8",
     "text": "リソース単位・時間単位の最も詳細なコスト分析にはCURを使う。",
     "answer": true,
     "explain": "CURが最も詳細なデータセットです。"
    },
    {
     "id": "ox-1-8-p3-b",
     "lesson": "1-8",
     "text": "CURをS3に出力してAthenaでクエリする構成が可能である。",
     "answer": true,
     "explain": "Athena統合が公式にサポートされています。"
    },
    {
     "id": "ox-1-8-p3-c",
     "lesson": "1-8",
     "text": "Cost Explorerは、リソース単位のコストを時間単位でSQLクエリできる。",
     "answer": false,
     "explain": "それはCUR+Athenaの用途です。"
    }
   ],
   "mc": [
    {
     "id": "mc-1-001",
     "stem": "ある金融会社は、AWS Organizationsで200以上のアカウントを運用しています。コンプライアンス部門は、どのアカウントの管理者であっても、AWS CloudTrailの証跡の停止・削除、およびAWS Configのレコーダー停止を行えないようにしたいと考えています。ただし、セキュリティチームが管理する専用ロールだけは例外的に操作できる必要があります。運用負荷を最小限にしてこの要件を満たすソリューションはどれですか。",
     "items": [],
     "choices": [
      "Organizationsの管理アカウントで、CloudTrail・Configの停止/削除操作を拒否し、セキュリティチームのロールのみ条件で除外するSCPをルートに適用する。",
      "各アカウントのIAMロールに権限境界を設定し、CloudTrailとConfigの停止を拒否する。",
      "AWS Configルールで証跡の停止を検出し、Lambdaで再有効化する。",
      "各メンバーアカウントのIAMポリシーに、CloudTrailとConfigの停止操作を拒否するステートメントを追加し、StackSetsで配布する。"
     ],
     "answer": 1,
     "explain": [
      "正解。SCPは全メンバーアカウントのプリンシパル（ルートユーザー含む）に強制され、aws:PrincipalArn条件で特定ロールだけ除外できます。",
      "権限境界はアカウント管理者が外せる場合があり、組織レベルの強制にはなりません。",
      "検出と再有効化は事後対応であり、停止を防ぐ要件を満たしません。",
      "IAMポリシーの配布は個別アカウントの管理者が自分で変更・削除できるため、強制力がありません。"
     ],
     "tip": "「全アカウントで誰にも許さない」は予防的統制=SCP。例外は条件キーで除外する。",
     "domain": 1
    },
    {
     "id": "mc-1-002",
     "stem": "ある企業はAWS Organizationsの管理アカウントで、承認されたリージョン（東京とバージニア北部）以外のリージョンでのリソース作成を禁止するSCPを作成しました。適用後、開発者から「IAMロールの作成やCloudFrontディストリビューションの設定ができなくなった」という報告がありました。原因と最適な対処はどれですか。",
     "items": [],
     "choices": [
      "管理アカウントでFullAWSAccessのSCPがデタッチされている。FullAWSAccessを再アタッチする。",
      "CloudFrontとIAMはリージョンの概念を持たないため、SCPの対象外である。Support に問い合わせる。",
      "SCPはIAMの操作に対して適用されない仕様のため、IAM側のポリシーの不具合である。",
      "IAMやCloudFrontなどのグローバルサービスは特定リージョンのエンドポイントを使うため、aws:RequestedRegion条件で拒否される。これらのグローバルサービスのアクションをNotActionで除外するようSCPを修正する。"
     ],
     "answer": 4,
     "explain": [
      "FullAWSAccessがない場合は全面拒否となり、報告された症状とは異なります。リージョン拒否の副作用が原因です。",
      "SCPはグローバルサービスにも適用され、エンドポイントのリージョンが評価されます。",
      "SCPはIAM操作にも適用されます。",
      "正解。グローバルサービスはus-east-1等で処理されるため、リージョン拒否SCPでは例外が必要です。"
     ],
     "tip": "リージョン制限SCPはグローバルサービスをNotActionで除外するのが定石。",
     "domain": 1
    },
    {
     "id": "mc-1-003",
     "stem": "ソリューションアーキテクトが、新規にマルチアカウント環境を構築します。要件は、(1)ベストプラクティスに沿ったOU・ログアーカイブ・監査アカウントの自動構築、(2)新規アカウントを標準構成で素早く払い出すセルフサービス、(3)予防的・発見的ガードレールの提供です。カスタム開発を最小にする方法はどれですか。",
     "items": [],
     "choices": [
      "AWS Service Catalogのみを使い、アカウント作成をLambdaで自動化する。",
      "IAM Identity Centerで各アカウントを作成し、権限セットでガードレールを実装する。",
      "AWS Control Towerでランディングゾーンを構築し、Account Factoryでアカウントを払い出す。",
      "Organizationsを手動で構成し、CloudFormationでSCPとConfigルールを作成する。"
     ],
     "answer": 3,
     "explain": [
      "Service Catalog単体ではランディングゾーンやガードレールは提供されません。",
      "Identity Centerはアクセス管理で、アカウント払い出しやガードレールの機能は持ちません。",
      "正解。Control Towerは要件を標準機能で満たします。",
      "手動構成は可能ですが、開発・運用の負荷が大きくなります。"
     ],
     "tip": "『最小のカスタム開発でマルチアカウント基盤』=Control Tower。",
     "domain": 1
    },
    {
     "id": "mc-1-004",
     "stem": "ある会社はAWS Control Towerでランディングゾーンを運用しています。CloudFormationテンプレートがデプロイされる前に、暗号化されていないEBSボリュームを含むスタックを検出して拒否したいと考えています。どのタイプのコントロールを有効化すべきですか。",
     "items": [],
     "choices": [
      "予防的コントロール（SCPによる実装）",
      "IAM Access Analyzerによるポリシー検証",
      "プロアクティブコントロール（CloudFormation Hooksによる実装）",
      "発見的コントロール（AWS Configルールによる実装）"
     ],
     "answer": 3,
     "explain": [
      "SCPはAPI呼び出しを拒否しますが、デプロイ前のテンプレート検査ではありません。",
      "Access Analyzerはポリシーや外部公開の分析用です。",
      "正解。プロアクティブコントロールはプロビジョニング前にテンプレートを評価し、違反なら失敗させます。",
      "Configルールは作成後に違反を検出します。"
     ],
     "tip": "『デプロイ前に』=プロアクティブ(CFn Hooks)。『作成後に検出』=発見的(Config)。",
     "domain": 1
    },
    {
     "id": "mc-1-005",
     "stem": "ある組織は、20のアカウントのVPCにあるEC2からオンプレミスのActive Directoryへ名前解決を行う必要があります。オンプレミスとはDirect Connectで接続済みです。オンプレミスのDNSからもAWS側のプライベートホストゾーンのレコードを解決させたいと考えています。DNSの運用を最小にする設計はどれですか。",
     "items": [],
     "choices": [
      "共有サービスVPCにRoute 53 Resolverのインバウンド/アウトバウンドエンドポイントを作成し、転送ルールをRAMで組織に共有して各VPCに関連付ける。",
      "各VPCにDNSサーバーのEC2を立て、条件付きフォワーダーを設定する。",
      "オンプレミスのホストファイルに全レコードを登録する。",
      "各VPCのDHCPオプションセットでオンプレミスDNSのIPを指定する。"
     ],
     "answer": 1,
     "explain": [
      "正解。双方向解決をマネージドで集約でき、ルール共有で多数VPCに展開できます。",
      "EC2のDNSサーバーは運用・可用性の負荷が高くなります。",
      "運用が非現実的で動的な更新に対応できません。",
      "DHCPオプションでオンプレDNSを指すと、AWS側のプライベートゾーン解決ができなくなる懸念があり、双方向の要件を満たしません。"
     ],
     "tip": "AWS→オンプレ=アウトバウンド+転送ルール、オンプレ→AWS=インバウンド。ルールはRAM共有。",
     "domain": 1
    },
    {
     "id": "mc-1-006",
     "stem": "ある企業のSaaSベンダーのアカウントが、顧客のAWSアカウント内のリソースを読み取るためにクロスアカウントロールを引き受けます。セキュリティ担当者は、他の顧客がベンダーを経由して自分のロールARNを推測し不正に引き受けさせる「confused deputy」問題を防止したいと考えています。最も適切な対策はどれですか。",
     "items": [],
     "choices": [
      "ベンダーにIAMユーザーとアクセスキーを発行する。",
      "ロールの信頼ポリシーに、ベンダーが顧客ごとに一意に割り当てるExternalIdの条件を追加する。",
      "ロールにAdministratorAccessを付与し、MFAを必須にする。",
      "ロールの最大セッション時間を12時間に延長する。"
     ],
     "answer": 2,
     "explain": [
      "長期認証情報は避けるべきで、問題の解決にもなりません。",
      "正解。ExternalIdにより、ベンダーが正しい顧客コンテキストでのみロールを引き受けられます。",
      "過剰権限であり、混乱した代理問題の解決にもなりません。",
      "セッション時間の延長は関係がなく、セキュリティを下げます。"
     ],
     "tip": "サードパーティにロールを渡す=ExternalId。",
     "domain": 1
    },
    {
     "id": "mc-1-007",
     "stem": "ある会社は数百のVPCを複数のアカウントとリージョンに持ち、オンプレミスとも接続する必要があります。本番VPCと開発VPCは互いに通信させず、どちらも共有サービスVPCとオンプレミスにだけ通信できるようにしたいと考えています。運用の簡素さとセグメンテーションを両立する設計はどれですか。",
     "items": [],
     "choices": [
      "各VPCをPrivateLinkで接続する。",
      "全VPC間をフルメッシュのVPCピアリングで接続し、セキュリティグループで本番と開発を分離する。",
      "全VPCを1つのTransit VPC上のソフトウェアVPNで接続する。",
      "Transit Gatewayに全VPCを接続し、本番用・開発用の2つのルートテーブルを作成して、関連付けと伝播を制御する。"
     ],
     "answer": 4,
     "explain": [
      "PrivateLinkは特定サービスの公開向けで、全体のネットワーク接続には不向きです。",
      "フルメッシュは管理が破綻し、ルートでの分離もできません。",
      "Transit VPCは運用負荷が高く、現在はTGWが推奨です。",
      "正解。TGWの複数ルートテーブルでセグメンテーションができます。"
     ],
     "tip": "TGWの関連付け(association)と伝播(propagation)でセグメント化。",
     "domain": 1
    },
    {
     "id": "mc-1-008",
     "stem": "あるSaaS企業は、自社のAPIサービスを数百の顧客AWSアカウントのVPCからプライベートに利用できるようにしたいと考えています。顧客VPCのCIDRはしばしば重複しており、顧客VPCから自社VPCの他のリソースへは到達させたくありません。最も適切な方法はどれですか。",
     "items": [],
     "choices": [
      "顧客VPCごとにVPCピアリングを作成する。",
      "Transit Gatewayを共有し、全顧客VPCを接続する。",
      "自社サービスの前にNLBを配置してエンドポイントサービスを作成し、顧客がインターフェイスVPCエンドポイントで接続する。",
      "パブリックALBを公開し、顧客のIPをセキュリティグループで許可する。"
     ],
     "answer": 3,
     "explain": [
      "CIDR重複ではピアリングできず、VPC全体が見える懸念があります。",
      "TGWはCIDR重複に不向きで、ネットワーク全体を接続する形になります。",
      "正解。PrivateLinkはCIDR重複に影響されず、特定サービスのみ一方向に公開できます。",
      "インターネット経由であり、プライベート要件を満たしません。"
     ],
     "tip": "『CIDR重複』『サービスのみ公開』『多数の顧客』=PrivateLink。",
     "domain": 1
    },
    {
     "id": "mc-1-009",
     "stem": "ある企業のオンプレミスのデータセンターとAWSを接続します。要件は、(1)安定した帯域と低レイテンシ、(2)転送中のデータの暗号化、(3)複数のリージョンにある複数のVPCへの接続です。最も適切な構成はどれですか。",
     "items": [],
     "choices": [
      "Direct Connect接続のパブリックVIF上でIPsec VPNを構成し、AWS側はVGWで終端する。",
      "Direct Connect Gatewayとトランジットゲートウェイを使い、トランジットVIF上でSite-to-Site VPN（IPsec）を構成する。",
      "インターネット経由のSite-to-Site VPNを各VPCのVGWへ作成する。",
      "Direct Connect接続にプライベートVIFを作成し、1つのVPCに接続する。"
     ],
     "answer": 2,
     "explain": [
      "VGW宛のパブリックVIF上VPNは構成が異なり、複数リージョン接続の要件には不適です。",
      "正解。DX Gateway+TGWで複数リージョンのVPCに接続でき、DX上VPNで暗号化できます。",
      "安定した帯域・低レイテンシを満たしません。",
      "暗号化と複数リージョンの要件を満たしません。"
     ],
     "tip": "DXは暗号化なし。暗号化=DX上のIPsec VPN(またはMACsec)。",
     "domain": 1
    },
    {
     "id": "mc-1-010",
     "stem": "ある企業はDirect Connectの専用線を1本、東京のロケーションに引いています。ビジネス上、接続は重要で、ロケーション障害にも耐え、DXの障害時は自動的にインターネットVPNに切り替えたいと考えています。最も適切な設計はどれですか。",
     "items": [],
     "choices": [
      "VPNだけに切り替える。",
      "別のDXロケーションに2本目のDX回線を追加し、さらにSite-to-Site VPNをバックアップとして構成し、BGPでDXを優先する。",
      "同じロケーションにもう1本回線を追加する。",
      "DXの帯域を10Gbpsに増速する。"
     ],
     "answer": 2,
     "explain": [
      "DX の利点が失われます。",
      "正解。ロケーション分散とVPNバックアップで要件を満たします。",
      "同一ロケーション障害に耐えられません。",
      "帯域の増強は可用性の対策になりません。"
     ],
     "tip": "『高可用性』=ロケーション分散。DX障害のバックアップ=VPN。",
     "domain": 1
    },
    {
     "id": "mc-1-011",
     "stem": "組織内の全アカウントでGuardDutyを有効にし、検出結果を1つのセキュリティアカウントに集約したいと考えています。今後作成されるアカウントにも自動で有効化したい場合、最も運用負荷の低い方法はどれですか。",
     "items": [],
     "choices": [
      "各アカウントのCloudWatch LogsにGuardDutyの結果を出力する。",
      "Organizationsの管理アカウントでGuardDutyの委任管理者としてセキュリティアカウントを指定し、新規アカウントの自動有効化を設定する。",
      "各アカウントで手動でGuardDutyを有効化し、招待を送る。",
      "Lambdaで毎日全アカウントをスキャンして有効化する。"
     ],
     "answer": 2,
     "explain": [
      "集約・自動有効化の要件を満たしません。",
      "正解。委任管理者と自動有効化が標準的な方法です。",
      "手動作業はスケールせず、漏れが出ます。",
      "独自実装が不要です。"
     ],
     "tip": "組織統合サービスは『委任管理者＋自動有効化』が定石。",
     "domain": 1
    },
    {
     "id": "mc-1-012",
     "stem": "セキュリティチームは、複数アカウント・複数リージョンにある、GuardDuty、Inspector、Macieの検出結果をまとめて確認し、CIS基準への準拠状況をスコアで把握したいと考えています。どのサービスを使うべきですか。",
     "items": [],
     "choices": [
      "AWS Artifact",
      "AWS Trusted Advisor",
      "AWS Security Hub",
      "Amazon Detective"
     ],
     "answer": 3,
     "explain": [
      "Artifactはコンプライアンスレポートの入手用です。",
      "Trusted Advisorは推奨事項チェックで、検出結果の集約ではありません。",
      "正解。Security Hubは検出結果の集約と標準に基づく準拠チェックを提供します。",
      "Detectiveは調査・根本原因分析のサービスです。"
     ],
     "tip": "『集約＋準拠スコア』=Security Hub。『調査』=Detective。",
     "domain": 1
    },
    {
     "id": "mc-1-013",
     "stem": "ある会社は、全アカウントで、新規作成されるすべてのセキュリティグループに特定のポートの公開を禁止するルールを強制し、違反を自動で修復したいと考えています。新規アカウントにも自動適用される必要があります。最適なサービスはどれですか。",
     "items": [],
     "choices": [
      "アカウントごとのNACL",
      "AWS Firewall Managerのセキュリティグループ監査/使用ポリシー",
      "AWS WAF",
      "AWS Shield Standard"
     ],
     "answer": 2,
     "explain": [
      "NACLは組織への一括適用機能を持ちません。",
      "正解。Firewall Managerはセキュリティグループポリシーを組織に適用し、自動修復も可能です。",
      "WAFはHTTP層の保護です。",
      "Shield StandardはDDoS保護で、SGの統制とは関係ありません。"
     ],
     "tip": "組織へのSG/WAF/DNS Firewallの一括強制=Firewall Manager。",
     "domain": 1
    },
    {
     "id": "mc-1-014",
     "stem": "開発・テスト用のSandbox OUには50個のアカウントがあり、開発者が自由にリソースを作成できます。月次予算を超えると、予期せぬ高額請求につながっています。予算超過時に、さらなるリソース作成を人手を介さず自動的に防止したいと考えています。運用負荷を最小限にする最も適切な方法はどれですか。",
     "items": [],
     "choices": [
      "Cost Explorerで毎日確認する。",
      "Trusted Advisorのコスト最適化チェックを有効にする。",
      "Cost and Usage Reportを生成する。",
      "AWS Budgetsで予算アクションを設定し、しきい値超過時にSCPまたはIAMポリシーを適用して作成を拒否する。"
     ],
     "answer": 4,
     "explain": [
      "手動確認は自動防止になりません。",
      "Trusted Advisorは推奨の提示のみです。",
      "CURは分析用のデータです。",
      "正解。予算アクションでポリシー適用や停止を自動実行できます。"
     ],
     "tip": "『超過時に自動で制限』=Budgetsの予算アクション。",
     "domain": 1
    },
    {
     "id": "mc-1-015",
     "stem": "財務部門は、各事業部のAWSコストを、アカウントを横断して「事業部」タグで集計したいと考えています。タグはすでにリソースに付与されていますが、Cost Explorerで事業部タグによる分割ができません。原因として最も可能性が高いものはどれですか。",
     "items": [],
     "choices": [
      "タグがコスト配分タグとして有効化されていない。",
      "一括請求が有効でない。",
      "Cost Explorerはタグをサポートしていない。",
      "タグの値が大文字ではない。"
     ],
     "answer": 1,
     "explain": [
      "正解。コスト配分タグは有効化して初めて請求データに反映されます。",
      "一括請求の有無とは別の問題です。",
      "Cost Explorerはタグによるグループ化をサポートします。",
      "大文字小文字は問題ではなく、有効化の問題です。"
     ],
     "tip": "タグが付いていても『コスト配分タグの有効化』が必要。遡及しない。",
     "domain": 1
    },
    {
     "id": "mc-1-016",
     "stem": "ある会社は、個々のEC2インスタンスやS3プレフィックス単位の時間別コスト分析を行い、事業部へチャージバックするためのデータをSQLで分析したいと考えています。データは数十アカウント分で月々増加し続けるため、サーバー管理を避けつつ、経営層向けのダッシュボードも提供する必要があります。最も適切な構成はどれですか。",
     "items": [],
     "choices": [
      "Cost and Usage ReportをS3に出力し、Athenaでクエリし、QuickSightで可視化する",
      "Cost ExplorerのCSVエクスポート",
      "AWS Budgetsのレポート",
      "Trusted Advisor"
     ],
     "answer": 1,
     "explain": [
      "正解。CURは最も詳細で、Athena統合が標準でサポートされます。",
      "Cost Explorerは粒度や分析の柔軟性に限界があります。",
      "Budgetsは予算監視用です。",
      "Trusted Advisorは推奨チェックです。"
     ],
     "tip": "最も詳細・SQL分析=CUR+Athena。",
     "domain": 1
    },
    {
     "id": "mc-1-017",
     "stem": "社内の従業員がAWS管理コンソールとCLIで複数アカウントを利用します。ユーザーは既存の外部IdP（SAML 2.0）で管理されており、ユーザーとグループの変更を自動で反映し、長期のアクセスキーを使わせたくありません。最も適切な方法はどれですか。",
     "items": [],
     "choices": [
      "各アカウントにIAMユーザーを作成する。",
      "各アカウントにSAML IdPを個別に登録し、ロールを手動で作成する。",
      "Cognitoユーザープールを使用する。",
      "IAM Identity Centerに外部IdPを接続し、SCIMで同期し、許可セットをグループに割り当てる。"
     ],
     "answer": 4,
     "explain": [
      "IAMユーザーは長期認証情報となり管理負荷が高くなります。",
      "個別構成は運用負荷が大きく、同期もされません。",
      "Cognitoは顧客向けアプリの認証です。",
      "正解。SSOと自動プロビジョニングを実現できます。"
     ],
     "tip": "従業員のSSO+自動同期=Identity Center+SCIM。",
     "domain": 1
    },
    {
     "id": "mc-1-018",
     "stem": "あるデータ分析会社は、アカウントAのLambdaがアカウントBのS3バケットのオブジェクトを読み取り、KMSカスタマー管理キーで暗号化されたデータを復号する必要があります。AccessDeniedが発生しています。必要な設定を満たす最も適切な対応はどれですか。",
     "items": [],
     "choices": [
      "SCPで許可する。",
      "アカウントBのバケットポリシーでAのロールを許可するのみで十分である。",
      "バケットポリシーとKMSキーポリシーでAのロールを許可し、Aのロールのidポリシーにも許可を付与する。",
      "アカウントAのKMSキーでデータを再暗号化する必要はなく、S3のACLを公開にする。"
     ],
     "answer": 3,
     "explain": [
      "SCPは権限を付与できません。",
      "KMS側の許可も必要です。",
      "正解。S3・KMS・呼び出し側のIDポリシーの許可が必要です。",
      "バケットのパブリック化は不適切です。"
     ],
     "tip": "クロスアカウント+KMS=キーポリシー側の許可も忘れずに。",
     "domain": 1
    },
    {
     "id": "mc-1-019",
     "stem": "ある企業のネットワークチームは、VPCを一元管理し、各アプリケーションチームのアカウントは共有されたサブネットにEC2とRDSだけを起動できるようにしたいと考えています。VPC数、NAT、VPN接続を減らしたい状況です。最適な方法はどれですか。",
     "items": [],
     "choices": [
      "VPCピアリングで接続する。",
      "PrivateLinkで接続する。",
      "アカウントごとにVPCを作成しTGWで接続する。",
      "ネットワークアカウントのVPCサブネットをAWS RAMで組織に共有する。"
     ],
     "answer": 4,
     "explain": [
      "VPC数や管理が増えます。",
      "サービス公開向けの機能です。",
      "要件のVPC削減を満たしません。",
      "正解。VPC共有によりネットワーク構成を集約できます。"
     ],
     "tip": "VPC共有=RAM。参加アカウントはルート/サブネットを変更できない。",
     "domain": 1
    },
    {
     "id": "mc-1-020",
     "stem": "オンプレミスのサーバー（AWS外）から、AWS APIを呼び出す必要があります。長期のアクセスキーをサーバーに保存したくありません。X.509証明書の基盤（PKI）が社内にあります。最も適切な方法はどれですか。",
     "items": [],
     "choices": [
      "IAM Roles Anywhereに信頼アンカーとして社内CAを登録し、一時認証情報を取得する。",
      "EC2インスタンスプロファイルをオンプレミスに設定する。",
      "IAMユーザーを作成しアクセスキーを保存する。",
      "Cognito IDプールを使う。"
     ],
     "answer": 1,
     "explain": [
      "正解。証明書で一時認証情報を取得できます。",
      "インスタンスプロファイルはEC2用です。",
      "要件に反します。",
      "モバイル/Webアプリ向けです。"
     ],
     "tip": "オンプレのワークロード+証明書=IAM Roles Anywhere。",
     "domain": 1
    },
    {
     "id": "mc-1-021",
     "stem": "ある会社は、全リージョン・全アカウントのAPIアクティビティを、改ざん不可能な形で1年間保持し、監査人がSQLで調査できるようにしたいと考えています。アカウント数は100を超え、新規アカウントにも自動で適用されること、運用負荷を抑えることも求められています。最も適切な構成はどれですか。",
     "items": [],
     "choices": [
      "組織の証跡をログアーカイブアカウントのS3バケット（SSE-KMS、Object Lock、ログ検証有効）に出力し、Athenaで分析する。",
      "EC2に保存する。",
      "CloudWatch Logsにのみ保存する。",
      "各アカウントで個別の証跡を作成する。"
     ],
     "answer": 1,
     "explain": [
      "正解。要件を標準機能で満たします。",
      "耐久性・管理の面で不適切です。",
      "保持・改ざん防止・SQL要件に十分ではありません。",
      "統一管理・改ざん防止になりません。"
     ],
     "tip": "改ざん防止=Object Lock+別アカウント隔離+ログ検証。",
     "domain": 1
    },
    {
     "id": "mc-1-022",
     "stem": "あるグローバル企業が、ユーザーの所在国に応じて異なるリージョンのALBへ振り分け、データ主権を満たしたいと考えています。ユーザーはどの国からアクセスするかで確実に固定されるべきです。どのルーティングポリシーを使うべきですか。",
     "items": [],
     "choices": [
      "レイテンシールーティング",
      "加重ルーティング",
      "位置情報ルーティング",
      "フェイルオーバールーティング"
     ],
     "answer": 3,
     "explain": [
      "レイテンシは遅延が最小のリージョンで、国の固定ではありません。",
      "割合配分用です。",
      "正解。位置情報ルーティングは国・大陸等のユーザー所在地に基づきます。",
      "アクティブ/パッシブ用です。"
     ],
     "tip": "『所在国で固定』=位置情報。『最速』=レイテンシー。",
     "domain": 1
    },
    {
     "id": "mc-1-023",
     "stem": "アカウントが急増しており、新しいアカウントを作成するたびに、標準のネットワーク（VPC、TGWアタッチメント）、ロール、ログ設定を一貫して適用したいと考えています。Control Towerを使用しています。追加のカスタマイズに最も適した方法はどれですか。",
     "items": [],
     "choices": [
      "IAM Identity Centerの許可セットを使用する。",
      "手動で各アカウントを設定する。",
      "新しいOrganizationsを作成する。",
      "Account Factory for Terraform（AFT）またはAccount Factory Customizationを利用し、カスタマイズをコードで自動適用する。"
     ],
     "answer": 4,
     "explain": [
      "アクセス制御であり、アカウント設定の配布ではありません。",
      "再現性がありません。",
      "不必要で、既存構成を捨てることになります。",
      "正解。Control Towerのアカウント払い出しにカスタマイズを自動適用できます。"
     ],
     "tip": "Control Towerのカスタマイズ=AFT/AFC/CfCT。",
     "domain": 1
    },
    {
     "id": "mc-1-024",
     "stem": "ある会社は、複数のアカウントのVPCから、ゲートウェイ型エンドポイントを使ってS3にアクセスしています。オンプレミスからDirect Connect経由でも、インターネットを経由せずにS3へアクセスしたいと考えています。最も適切な方法はどれですか。",
     "items": [],
     "choices": [
      "ゲートウェイエンドポイントのルートをオンプレミスにアドバタイズする。",
      "S3のインターフェイスVPCエンドポイントを作成し、オンプレミスからDirect Connect経由でそのエンドポイントのDNS名/IPへ接続する。",
      "S3のパブリックエンドポイントを使う。",
      "VPCピアリングを追加する。"
     ],
     "answer": 2,
     "explain": [
      "ゲートウェイ型はVPC外から利用できません。",
      "正解。S3にはオンプレから使えるインターフェイスエンドポイントがあります。",
      "要件に反します。",
      "ピアリングはオンプレからのアクセスを解決しません。"
     ],
     "tip": "ゲートウェイ型=VPC内のみ。オンプレ経由=インターフェイス型。",
     "domain": 1
    },
    {
     "id": "mc-1-025",
     "stem": "ある企業は、DXで接続した本社とAWSの複数アカウントのVPCの間を、できるだけ少ない構成要素で接続したいと考えています。VPCは3リージョンにまたがり、100以上のVPCがあります。最適な構成はどれですか。",
     "items": [],
     "choices": [
      "リージョンごとにTransit Gatewayを作成してVPCを接続し、TGW同士をピアリングし、Direct Connect Gatewayとトランジットゲートウェイを関連付ける。",
      "各VPCにVGWを作成し、プライベートVIFを100本作成する。",
      "全VPCをフルメッシュでピアリングする。",
      "VPNを100本作成する。"
     ],
     "answer": 1,
     "explain": [
      "正解。TGWとDX Gatewayの組み合わせでスケールします。",
      "VIFの数や管理が現実的でありません。",
      "オンプレミス接続を解決しません。",
      "運用が破綻します。"
     ],
     "tip": "多数VPC+DX=TGW+DX Gateway(トランジットVIF)。",
     "domain": 1
    },
    {
     "id": "mc-1-026",
     "stem": "ある企業はOrganizationsを使用しています。今後、本番OUのアカウントで、セキュリティ要件を満たすために、SCPの設計を行います。SCPの動作について正しい記述を2つ選択してください。",
     "items": [],
     "choices": [
      "SCPはメンバーアカウントのルートユーザーにも適用される。",
      "SCPは管理アカウントのIAMユーザーにも適用される。",
      "SCPはサービスリンクロールには適用されない。",
      "SCPは許可を付与し、IAMポリシーが不要になる。",
      "SCPをOUにアタッチすると、そのOUの子OUには適用されない。"
     ],
     "answers": [
      1,
      3
     ],
     "select": 2,
     "explain": [
      "正解。メンバーのルートユーザーにも適用されます。",
      "管理アカウントには適用されません。",
      "正解。サービスリンクロールはSCPの影響を受けません。",
      "SCPは許可を付与しません。",
      "子OUにも継承されます。"
     ],
     "tip": "SCP：管理アカウントには効かない、メンバーのrootには効く、SLRには効かない。",
     "domain": 1
    },
    {
     "id": "mc-1-027",
     "stem": "ある企業はハイブリッドDNSを設計しています。VPCのEC2はオンプレミスの「corp.example.com」を解決でき、オンプレミスのクライアントはAWSのプライベートホストゾーン「aws.example.internal」を解決できる必要があります。必要な構成を2つ選択してください。",
     "items": [],
     "choices": [
      "Route 53 Resolverのアウトバウンドエンドポイントと、corp.example.com向けの転送ルールを作成する。",
      "Route 53 Resolverのインバウンドエンドポイントを作成し、オンプレミスDNSからaws.example.internalをそのIPへ条件付き転送する。",
      "VPCのDHCPオプションセットでオンプレミスDNSのみを指定する。",
      "パブリックホストゾーンにプライベートIPを登録する。",
      "Transit Gatewayのマルチキャストを有効化する。"
     ],
     "answers": [
      1,
      2
     ],
     "select": 2,
     "explain": [
      "正解。AWS→オンプレにはアウトバウンド+ルール。",
      "正解。オンプレ→AWSにはインバウンドを使います。",
      "AWS側のプライベート名の解決が失われます。",
      "不適切で、情報漏えいの懸念もあります。",
      "DNSとは関係ありません。"
     ],
     "tip": "方向とエンドポイントの対応を即答できるようにする。",
     "domain": 1
    },
    {
     "id": "mc-1-028",
     "stem": "ある会社は、新規アカウントにも自動的に適用されるセキュリティ統制を設計しています。要件は、(a)すべてのアカウントでConfigルールによる準拠評価を行う、(b)組織全体でEBSの暗号化なしボリューム作成を防止する、(c)セキュリティ検出結果の集約です。適切な組み合わせを3つ選択してください。",
     "items": [],
     "choices": [
      "組織のConfigルールまたはコンフォーマンスパックを展開する。",
      "SCPで、暗号化されていないEBSボリュームの作成を拒否する。",
      "Security Hubの委任管理者を設定し、自動有効化と集約リージョンを設定する。",
      "各アカウントで手動でConfigを有効化する。",
      "IAMユーザーごとに権限境界を設定する。",
      "メンバーアカウントのCloudWatchダッシュボードを作成する。"
     ],
     "answers": [
      1,
      2,
      3
     ],
     "select": 3,
     "explain": [
      "正解。組織単位で展開できます。",
      "正解。予防的統制としてSCPを使います。",
      "正解。集約と自動有効化に対応します。",
      "手動で、新規アカウントへの自動適用になりません。",
      "組織全体の統制になりません。",
      "統制や集約の要件を満たしません。"
     ],
     "tip": "『新規アカウントにも自動』=組織統合の機能（委任管理者・自動有効化・組織ルール）。",
     "domain": 1
    },
    {
     "id": "mc-1-029",
     "stem": "ある企業は、Transit Gatewayを使った集中型エグレス検査アーキテクチャを構築しています。スポークVPCのトラフィックは、検査VPCのファイアウォールアプライアンスを経由してインターネットへ出ます。アプライアンスが複数のAZにあり、戻りのトラフィックが別のAZのアプライアンスへ送られてフローが破棄される問題が発生しています。解決策を2つ選択してください。",
     "items": [],
     "choices": [
      "検査VPCのTGWアタッチメントでアプライアンスモードを有効にする。",
      "スポークVPCのCIDRを変更する。",
      "TGWのルートテーブルを、検査VPCへ向けた0.0.0.0/0のスタティックルートで構成し、検査VPCのアタッチメントにスポークの伝播をする。",
      "ECMPを無効にする。",
      "NATゲートウェイをすべて削除する。"
     ],
     "answers": [
      1,
      3
     ],
     "select": 2,
     "explain": [
      "正解。同じフローを同じAZに固定します。",
      "CIDRは非対称ルーティングの原因ではありません。",
      "正解。スポーク側からのデフォルトルートで検査VPCへ集約し、戻りのためのルーティングを整えます。",
      "ECMPは関係がありません。",
      "エグレスが成立しなくなります。"
     ],
     "tip": "TGW検査でフローが落ちる=アプライアンスモード。",
     "domain": 1
    },
    {
     "id": "mc-1-030",
     "stem": "ある企業は、組織全体のコストを管理するために、次の施策を検討しています。コスト管理の観点で有効な施策を3つ選択してください。",
     "items": [],
     "choices": [
      "コスト配分タグを有効化し、タグポリシーとSCPで必須タグを統制する。",
      "AWS Budgetsで部門ごとの予算と実績・予測のアラートを設定する。",
      "Cost Anomaly Detectionを有効化する。",
      "管理アカウントでワークロードを実行し、一括請求を無効にする。",
      "すべてのアカウントでルートユーザーのアクセスキーを使用する。",
      "Savings Plansの共有を一切禁止する。"
     ],
     "answers": [
      1,
      2,
      3
     ],
     "select": 3,
     "explain": [
      "正解。タグ統制はコスト配分の基礎です。",
      "正解。予算と予測アラートを設定できます。",
      "正解。異常を自動検知できます。",
      "ベストプラクティスに反し、割引面でも不利です。",
      "重大なセキュリティ違反です。",
      "コスト最適化に不利です。"
     ],
     "tip": "コスト：タグ（有効化）→Budgets→Anomaly→CUR の流れで考える。",
     "domain": 1
    },
    {
     "id": "mc-1-031",
     "stem": "ある会社は、アカウントBのS3バケットにアカウントAのアプリケーションがオブジェクトを書き込むようにしています。その結果、バケット所有者であるアカウントBがオブジェクトを読めない問題があります。適切な対処を2つ選択してください。",
     "items": [],
     "choices": [
      "バケットのオブジェクト所有権をBucketOwnerEnforced（ACL無効化）に設定する。",
      "アカウントAのアプリに、PutObject時にbucket-owner-full-controlのACLを付与するよう変更する（ACLを有効のままにする場合）。",
      "アカウントBのバケットをパブリックにする。",
      "アカウントBのルートユーザーのアクセスキーをAに共有する。",
      "S3バージョニングを無効にする。"
     ],
     "answers": [
      1,
      2
     ],
     "select": 2,
     "explain": [
      "正解。ACLを無効化すると所有者がオブジェクトを所有します。",
      "正解。ACL運用を継続する場合は、所有者へのフルコントロールを付与します。",
      "セキュリティ上不適切です。",
      "重大なセキュリティ違反です。",
      "問題と無関係です。"
     ],
     "tip": "クロスアカウント書込み後の所有権=BucketOwnerEnforced。",
     "domain": 1
    },
    {
     "id": "mc-1-032",
     "stem": "ある企業は、新設するアカウントのネットワークを標準化するために、AWS RAMを使います。RAMで共有可能なリソースとして、正しいものを2つ選択してください。",
     "items": [],
     "choices": [
      "VPCのサブネット",
      "Transit Gateway",
      "S3バケット（バケット全体）",
      "SQSキュー",
      "IAMユーザー"
     ],
     "answers": [
      1,
      2
     ],
     "select": 2,
     "explain": [
      "正解。VPC共有の対象です。",
      "正解。TGWはRAM共有できます。",
      "S3はリソースポリシーで共有します（RAMのリソースではありません）。",
      "SQSはリソースポリシーで共有します。",
      "IAMユーザーは共有対象ではありません。"
     ],
     "tip": "RAM=サブネット/TGW/Resolverルール等。S3/SQS/SNS等はリソースポリシー。",
     "domain": 1
    }
   ]
  },
  {
   "no": 2,
   "title": "新規ソリューションの設計",
   "lessons": [
    {
     "id": "2-1",
     "title": "DR戦略とRTO/RPO",
     "pages": [
      {
       "id": "2-1-p1",
       "title": "RTOとRPO、DR4戦略の全体像",
       "html": "<h4>RTO と RPO</h4><ul><li>RTO(Recovery Time Objective)＝障害発生から<b class=\"key\">サービス復旧までに許容される時間</b></li><li>RPO(Recovery Point Objective)＝<b class=\"key\">許容できるデータ損失の時間幅</b>(最後の復旧可能時点から障害までの時間)</li><li>RPOが小さい → レプリケーションの頻度/同期性が重要。RTOが小さい → 待機環境の準備度が重要</li></ul><h4>DR 4戦略(コストが低い順＝復旧が遅い順)</h4><table><tr><th>戦略</th><th>RTO/RPO目安</th><th>内容</th></tr><tr><td>Backup &amp; Restore</td><td>時間〜日</td><td>バックアップを別リージョンへコピー。障害時にIaC等で環境を再構築</td></tr><tr><td>Pilot Light</td><td>数十分〜時間</td><td>DBなど<b class=\"key\">コアのみ常時稼働・レプリケーション</b>。アプリ層は停止/最小。障害時に起動・拡張</td></tr><tr><td>Warm Standby</td><td>分</td><td><b class=\"key\">縮小版のフル環境</b>が常時稼働。障害時にスケールアウトして切替</td></tr><tr><td>Multi-site Active/Active</td><td>ほぼゼロ</td><td>複数リージョンが<b class=\"key\">同時に本番トラフィック</b>を処理。最高コスト</td></tr></table><p><span class=\"trap\">引っ掛け：Pilot Lightは「アプリサーバーも動いている」のではなく、データ層だけが動いている状態。Warm Standbyは「すでに処理できる縮小環境」がある点で異なる。</span></p>",
       "oxIds": [
        "ox-2-1-p1-a",
        "ox-2-1-p1-b",
        "ox-2-1-p1-c"
       ]
      },
      {
       "id": "2-1-p2",
       "title": "サービス別のDR機能(RDS/Aurora/DynamoDB/S3/EBS)",
       "html": "<h4>データ層のクロスリージョン複製</h4><table><tr><th>サービス</th><th>機能</th><th>特徴</th></tr><tr><td>Aurora</td><td><b class=\"key\">Aurora Global Database</b></td><td>ストレージレベルで複製、通常<b class=\"key\">1秒未満のレイテンシ</b>。リージョン障害時にセカンダリを昇格(RTO 通常1分未満を目安に分単位)。RPOは秒単位</td></tr><tr><td>RDS</td><td>クロスリージョンリードレプリカ</td><td>非同期。昇格して単独DBにできる(昇格後は元に戻せない)</td></tr><tr><td>DynamoDB</td><td><b class=\"key\">Global Tables</b></td><td>マルチリージョン・マルチアクティブ。どのリージョンでも書き込み可、最終的に整合(同一項目の競合は最終書き込み勝ち)</td></tr><tr><td>S3</td><td>CRR(クロスリージョンレプリケーション)</td><td>非同期。<b class=\"key\">S3 Replication Time Control(RTC)</b>で15分以内に99.99%のオブジェクトを複製するSLA</td></tr><tr><td>EBS</td><td>スナップショットのコピー</td><td>Data Lifecycle Managerで自動化、クロスリージョンコピー可</td></tr></table><ul><li>AWS Elastic Disaster Recovery(DRS)：オンプレ/他クラウド/AWSのサーバーをブロックレベルで継続レプリケーションし、<b class=\"key\">数分のRTO・秒単位のRPO</b>でAWSへフェイルオーバー。Pilot Light的な低コスト構成</li><li>AWS Backup：クロスリージョン/クロスアカウントのバックアップ集中管理、<b class=\"key\">Backup Vault Lock</b>でWORM保護(ランサムウェア対策)</li></ul>",
       "oxIds": [
        "ox-2-1-p2-a",
        "ox-2-1-p2-b",
        "ox-2-1-p2-c"
       ]
      },
      {
       "id": "2-1-p3",
       "title": "フェイルオーバーの仕組みとDR設計の判断基準",
       "html": "<h4>トラフィック切替</h4><ul><li>Route 53 フェイルオーバールーティング：ヘルスチェックで障害検知しDNSをセカンダリへ。DNSのため<b class=\"key\">TTLとクライアントキャッシュの影響</b>を受ける</li><li>Global Accelerator：Anycast<b class=\"key\">固定IP</b>で、DNSキャッシュに依存せず<b class=\"key\">数十秒で別リージョンのエンドポイントへ切替</b>。固定IPが必要/切替を速くしたい場面で有利</li><li><b class=\"key\">Route 53 Application Recovery Controller(ARC)</b>：ルーティングコントロールとレディネスチェックで、安全にフェイルオーバーを実施(データプレーンの高可用な制御)</li></ul><h4>判断の流れ</h4><ol><li>RTO/RPOを確認 → 戦略を決定(RPOがほぼ0ならスナップショットでなく同期/準同期レプリケーション)</li><li>コスト制約が強く、RTOが時間単位OK → Backup&amp;Restore/Pilot Light</li><li>分単位のRTO → Warm Standby、ほぼ無停止 → Multi-site</li></ol><p><span class=\"trap\">引っ掛け：「マルチAZ」はAZ障害対策であり、リージョン障害の備えではない。リージョン障害に備える要件があるときは必ずクロスリージョン構成を選ぶ。また、DR構成は定期的なフェイルオーバー訓練をしないと有効性を保証できない。</span></p>",
       "oxIds": [
        "ox-2-1-p3-a",
        "ox-2-1-p3-b",
        "ox-2-1-p3-c"
       ]
      }
     ]
    },
    {
     "id": "2-2",
     "title": "高可用性とデータ層のマルチAZ設計",
     "pages": [
      {
       "id": "2-2-p1",
       "title": "RDSとAuroraの可用性設計",
       "html": "<h4>RDS Multi-AZ の種類</h4><table><tr><th>構成</th><th>特徴</th></tr><tr><td>Multi-AZ DBインスタンス</td><td>別AZにスタンバイを同期レプリケーション。<b class=\"key\">スタンバイは読み取り不可</b>。自動フェイルオーバー(通常60〜120秒)。エンドポイントのDNSが切り替わる</td></tr><tr><td><b class=\"key\">Multi-AZ DBクラスター</b>(MySQL/PostgreSQL)</td><td>読み取り可能なスタンバイ2台(計3AZ)。フェイルオーバー通常35秒未満、書き込みレイテンシ改善</td></tr><tr><td>リードレプリカ</td><td>非同期。読み取りスケール用が主目的。DR用に昇格も可</td></tr></table><h4>Aurora</h4><ul><li>ストレージは<b class=\"key\">3AZに6コピー</b>、クラスターボリュームを共有。書き込み4/6、読み取り3/6のクォーラム</li><li>リーダー(最大15)がそのままフェイルオーバー先。通常30秒以内に昇格</li><li><b class=\"key\">RDS Proxy</b>：接続プールでフェイルオーバー時間を短縮(最大66%短縮と説明される)し、Lambdaからの大量接続も吸収</li><li><b class=\"key\">Aurora Serverless v2</b>：ACU単位で秒単位にスケール。変動の大きいワークロード向け</li></ul><p><span class=\"trap\">引っ掛け：RDSのMulti-AZ(インスタンス型)は「読み取りスケール」には使えない。読み取り分散が要件ならリードレプリカかAuroraリーダー。</span></p>",
       "oxIds": [
        "ox-2-2-p1-a",
        "ox-2-2-p1-b",
        "ox-2-2-p1-c"
       ]
      },
      {
       "id": "2-2-p2",
       "title": "グローバルデータ設計：Aurora Global / DynamoDB / ElastiCache",
       "html": "<ul><li>Aurora Global Database：1プライマリ+複数のセカンダリリージョン(上限数はリージョン数の拡大により変わるため最新ドキュメントで確認)。セカンダリは読み取り専用で、リージョン障害時に昇格(手動/マネージドフェイルオーバー)。<b class=\"key\">リージョンをまたぐ低遅延リード</b>とDRの両方に使う。書き込み転送(write forwarding)でセカンダリから書き込みを転送できる</li><li>DynamoDB Global Tables：マルチリージョン・<b class=\"key\">マルチアクティブ</b>。書き込みを各リージョンのローカルで受けたい要件はこちら。SLAは99.999%</li><li>ElastiCache for Redis(Valkey)：Multi-AZ+自動フェイルオーバーのレプリケーショングループ。<b class=\"key\">Global Datastore</b>でクロスリージョン複製</li><li>MemoryDB：Redis互換の<b class=\"key\">耐久性のあるプライマリDB</b>(マルチAZトランザクションログ)。キャッシュではなくDBとして使う場合</li></ul><h4>使い分け</h4><table><tr><th>要件</th><th>選択</th></tr><tr><td>リレーショナル+リージョン間DR/低遅延読み取り</td><td>Aurora Global Database</td></tr><tr><td>各リージョンでローカル書き込み(アクティブ-アクティブ)</td><td>DynamoDB Global Tables</td></tr><tr><td>耐久性ありのマイクロ秒読み取り+インメモリDB</td><td>MemoryDB</td></tr><tr><td>DBの前段キャッシュ</td><td>ElastiCache / DAX(DynamoDB専用)</td></tr></table>",
       "oxIds": [
        "ox-2-2-p2-a",
        "ox-2-2-p2-b",
        "ox-2-2-p2-c"
       ]
      },
      {
       "id": "2-2-p3",
       "title": "Auto Scalingと疎結合による耐障害設計",
       "html": "<h4>Auto Scaling グループ(ASG)</h4><ul><li>複数AZのサブネットにまたがらせ、AZ障害時は残りのAZで自動的に再均衡</li><li>ヘルスチェック：EC2ステータス＋<b class=\"key\">ELBヘルスチェックを有効化</b>するとアプリ層の異常も置換できる</li><li>スケーリングポリシー：ターゲット追跡(推奨：CPU 50%維持など)、ステップ、スケジュール(予測可能な負荷)、<b class=\"key\">予測スケーリング</b>(周期的な負荷を機械学習で事前増強)</li><li><b class=\"key\">ウォームプール</b>：事前初期化済みインスタンスを待機させ、起動の遅いアプリのスケールアウトを高速化</li><li>ライフサイクルフック：終了/起動前に処理を挟む(ログ退避など)</li><li>混合インスタンスポリシー：オンデマンド+スポットを組み合わせ</li></ul><h4>疎結合の原則</h4><ul><li>状態を持たせない(セッションはElastiCache/DynamoDBへ)</li><li>同期呼び出しの間に<b class=\"key\">SQS</b>を挟んでバッファ。キュー長でスケール(<b class=\"key\">バックログ/インスタンス</b>のカスタム指標)</li><li>単一障害点(SPOF)を排除：NAT GatewayはAZごと、など</li></ul><p><span class=\"trap\">引っ掛け：「負荷の急増に対して間に合わない」ときは、スケーリング指標の見直しよりキューでバッファする、またはウォームプール・予測スケーリングが答えになることが多い。</span></p>",
       "oxIds": [
        "ox-2-2-p3-a",
        "ox-2-2-p3-b",
        "ox-2-2-p3-c"
       ]
      }
     ]
    },
    {
     "id": "2-3",
     "title": "ELB・CloudFront・Global Accelerator・Route 53",
     "pages": [
      {
       "id": "2-3-p1",
       "title": "ELBの種類と使い分け",
       "html": "<table><tr><th>種類</th><th>層</th><th>特徴</th></tr><tr><td><b class=\"key\">ALB</b></td><td>L7</td><td>パス/ホスト/ヘッダー/クエリのルーティング、Lambda・IPターゲット、Cognito/OIDC認証、AWS WAF連携、gRPC、ECSの動的ポート</td></tr><tr><td><b class=\"key\">NLB</b></td><td>L4</td><td>超低レイテンシ・高スループット、<b class=\"key\">AZごとに固定(Elastic)IP</b>可、送信元IP保持、TCP/UDP/TLS、<b class=\"key\">PrivateLink(エンドポイントサービス)の前段</b>。現在はセキュリティグループもサポート</td></tr><tr><td><b class=\"key\">GWLB</b></td><td>L3</td><td>サードパーティ仮想アプライアンス(FW/IDS)を透過的に挿入。GENEVE(6081)</td></tr><tr><td>CLB</td><td>-</td><td>旧世代。新規設計では選ばない</td></tr></table><ul><li>クロスゾーン負荷分散：ALBは常に有効(無料)、NLBは既定で無効(有効時はAZ間データ転送料)</li><li>スティッキーセッション・接続ドレイニング(登録解除の遅延)・低速開始(slow start)</li><li>ALBは固定IPを持たない → 固定IPが必要ならNLB、またはALBの前にGlobal Accelerator、あるいはNLB→ALBターゲット構成</li></ul><p><span class=\"trap\">引っ掛け：「パスベースルーティング」→ALB。「固定IP/静的IPをクライアントがホワイトリスト」→NLBかGlobal Accelerator。「FWアプライアンスを透過的に挿入」→GWLB。</span></p>",
       "oxIds": [
        "ox-2-3-p1-a",
        "ox-2-3-p1-b",
        "ox-2-3-p1-c"
       ]
      },
      {
       "id": "2-3-p2",
       "title": "CloudFrontとGlobal Accelerator",
       "html": "<h4>CloudFront(CDN)</h4><ul><li>エッジでキャッシュ。S3・ALB・API Gateway・任意のオリジン。静的/動的コンテンツの配信高速化、DDoS/WAFの前段としても有効</li><li><b class=\"key\">OAC(Origin Access Control)</b>でS3オリジンへのアクセスをCloudFront経由のみに制限(旧OAIの後継、SSE-KMS対応)</li><li><b class=\"key\">署名付きURL/署名付きCookie</b>：有料コンテンツ等の限定配信。署名付きURLは単一ファイル、Cookieは複数ファイル/URL変更不可の場合</li><li><b class=\"key\">オリジンフェイルオーバー</b>(オリジングループ)：プライマリが5xx等のとき自動でセカンダリへ</li><li>Lambda@Edge / CloudFront Functions：軽量(ヘッダー書換等)はFunctions、複雑処理・ネットワーク/ボディ参照はLambda@Edge</li><li>フィールドレベル暗号化、地理的制限、HTTPSの強制</li></ul><h4>Global Accelerator</h4><ul><li>AWSグローバルネットワークへ最寄りエッジから入り、<b class=\"key\">2つの固定Anycast IP</b>でエンドポイント(ALB/NLB/EC2/EIP)へ</li><li><b class=\"key\">キャッシュはしない</b>。TCP/UDP、ゲーム・IoT・VoIP、HTTPでも固定IPや高速フェイルオーバーが必要な場合</li><li>トラフィックダイヤル・エンドポイント重みでブルー/グリーンやリージョン間の段階移行</li></ul><table><tr><th>要件</th><th>選択</th></tr><tr><td>静的コンテンツのキャッシュ、グローバル配信</td><td>CloudFront</td></tr><tr><td>非HTTP(UDP等)、固定IP、速いリージョンフェイルオーバー</td><td>Global Accelerator</td></tr></table>",
       "oxIds": [
        "ox-2-3-p2-a",
        "ox-2-3-p2-b",
        "ox-2-3-p2-c"
       ]
      },
      {
       "id": "2-3-p3",
       "title": "Route 53のルーティングポリシーとハイブリッド/マルチリージョン",
       "html": "<table><tr><th>ポリシー</th><th>用途</th></tr><tr><td>シンプル</td><td>1つの宛先</td></tr><tr><td>加重</td><td>割合で分散、カナリア/段階移行</td></tr><tr><td><b class=\"key\">レイテンシー</b></td><td>ユーザーに最もレイテンシの低いリージョンへ</td></tr><tr><td><b class=\"key\">フェイルオーバー</b></td><td>ヘルスチェックでActive-Passive</td></tr><tr><td><b class=\"key\">地理的位置情報</b></td><td>ユーザーの国・大陸で決定(コンプライアンス・言語)</td></tr><tr><td>地理的近接性</td><td>位置情報+バイアスで調整(Traffic Flowが必要)</td></tr><tr><td>複数値回答</td><td>ヘルスチェック付き最大8レコードを返す(ELBの代替ではない)</td></tr></table><ul><li><b class=\"key\">エイリアスレコード</b>：ゾーンAPEX(example.com)に使え、ALB/CloudFront/S3等を指す。<b class=\"key\">CNAMEはAPEXに作成不可</b>。エイリアスへのクエリは無料</li><li>ヘルスチェックはエンドポイント/他のヘルスチェック(計算)/CloudWatchアラームを監視可能(プライベートリソースはCloudWatchアラーム経由)</li><li><b class=\"key\">Route 53 Resolver</b>：ハイブリッドDNS。インバウンドEP(オンプレ→AWS)・アウトバウンドEP(AWS→オンプレ)+ルール</li><li>プライベートホストゾーン：VPC関連付け。複数VPC/アカウントで共有可</li></ul><p><span class=\"trap\">引っ掛け：「レイテンシー」と「地理的位置情報」は混同しやすい。法規制で国別に振り分けるなら地理的位置情報、最速を狙うならレイテンシー。</span></p>",
       "oxIds": [
        "ox-2-3-p3-a",
        "ox-2-3-p3-b",
        "ox-2-3-p3-c"
       ]
      }
     ]
    },
    {
     "id": "2-4",
     "title": "ストレージ設計(S3・EBS・EFS・FSx)",
     "pages": [
      {
       "id": "2-4-p1",
       "title": "S3のクラス・ライフサイクル・整合性",
       "html": "<table><tr><th>クラス</th><th>特徴</th></tr><tr><td>Standard</td><td>頻繁アクセス</td></tr><tr><td><b class=\"key\">Intelligent-Tiering</b></td><td>アクセスパターン不明・変動。自動で階層移動(取り出し料金なし、オブジェクト単位の監視料金あり)</td></tr><tr><td>Standard-IA / One Zone-IA</td><td>低頻度。最小保存30日、128KB未満は128KB課金。One Zoneは<b class=\"key\">単一AZ</b>(再作成可能なデータ向け)</td></tr><tr><td>Glacier Instant Retrieval</td><td>四半期に1回程度、<b class=\"key\">ミリ秒取り出し</b>。最小90日</td></tr><tr><td>Glacier Flexible Retrieval</td><td>数分〜12時間。最小90日</td></tr><tr><td>Glacier Deep Archive</td><td>最安。標準12時間・バルク48時間。最小180日</td></tr></table><ul><li>ライフサイクルルールで移行・有効期限、不完全なマルチパートアップロードの削除</li><li>S3は<b class=\"key\">強い読み取り整合性(strong read-after-write)</b>を全リクエストで提供</li><li>バージョニング+MFA Delete、<b class=\"key\">Object Lock</b>(WORM：ガバナンス/コンプライアンスモード、リーガルホールド)、Glacier Vault Lock</li><li>大容量アップロード：マルチパートアップロード(100MB超で推奨・5GB超は必須)、S3 Transfer Acceleration(遠隔地からエッジ経由)</li><li>レプリケーション：SRR/CRR。<b class=\"key\">既存オブジェクトにはS3バッチレプリケーション</b>。バージョニング必須</li></ul><p><span class=\"trap\">引っ掛け：ライフサイクルでIntelligent-Tieringや各IAへ移すとき、小さいオブジェクトが多いと最小サイズ課金で逆に高くなる。</span></p>",
       "oxIds": [
        "ox-2-4-p1-a",
        "ox-2-4-p1-b",
        "ox-2-4-p1-c"
       ]
      },
      {
       "id": "2-4-p2",
       "title": "EBS・インスタンスストア・EFS",
       "html": "<h4>EBS</h4><ul><li><b class=\"key\">gp3</b>：汎用SSD、容量と独立してIOPS(3,000〜16,000)/スループット指定。gp2より約20%安価。大半の用途の既定</li><li>io2 / io2 Block Express：高耐久(99.999%)、最大256,000 IOPS、<b class=\"key\">マルチアタッチ</b>(io1/io2、同一AZ内のNitro)。ミッションクリティカルDB</li><li>st1(スループット最適化HDD)・sc1(コールドHDD)：ブート不可、ビッグデータ/ログ向け</li><li>EBSは<b class=\"key\">AZ固定</b>。AZ間移動はスナップショット経由。スナップショットはS3に増分保存、高速スナップショット復元(FSR)</li></ul><h4>インスタンスストア</h4><ul><li>物理ホスト直結の超高IOPS。<b class=\"key\">停止/終了/故障でデータ消失</b>。バッファ・キャッシュ・一時データ向け</li></ul><h4>EFS</h4><ul><li>NFSv4、<b class=\"key\">Linux専用</b>、マルチAZ、数千のインスタンスから同時マウント、自動伸縮</li><li>ストレージクラス：Standard / IA / Archive(ライフサイクルで自動移行)、One Zone</li><li>スループット：Elastic(推奨・自動)/Provisioned/Bursting。パフォーマンスモード：General Purpose(既定)/Max I/O</li><li>クロスリージョンはEFSレプリケーション、AWS Backup。EFSはLambda・ECS・Fargateからもマウント可</li></ul>",
       "oxIds": [
        "ox-2-4-p2-a",
        "ox-2-4-p2-b",
        "ox-2-4-p2-c"
       ]
      },
      {
       "id": "2-4-p3",
       "title": "FSxファミリーとデータ転送サービス",
       "html": "<table><tr><th>サービス</th><th>選ぶ場面</th></tr><tr><td>FSx for Windows File Server</td><td>SMB、<b class=\"key\">Active Directory統合</b>、NTFS、DFS、Windowsワークロード。Multi-AZ可</td></tr><tr><td>FSx for Lustre</td><td>HPC・ML・動画処理の高スループット。<b class=\"key\">S3と連携</b>(データリポジトリ関連付け)。スクラッチ(一時・最高性能)/永続</td></tr><tr><td>FSx for NetApp ONTAP</td><td>NFS/SMB/iSCSIのマルチプロトコル、オンプレNetApp移行、スナップショット、SnapMirror、重複排除</td></tr><tr><td>FSx for OpenZFS</td><td>オンプレZFSの移行、低レイテンシNFS、スナップショット/クローン</td></tr></table><h4>オンプレ→AWSのデータ移行</h4><ul><li>DataSync：オンライン転送(NFS/SMB/HDFS/S3等 ↔ AWS)。スケジュール・検証付き</li><li><b class=\"key\">Storage Gateway</b>：ハイブリッド。S3 File / FSx File / Volume(キャッシュ型/保管型) / Tape。オンプレから継続的にクラウドへ</li><li><b class=\"key\">Snowball Edge / Snowcone</b>：大容量でネットワーク帯域が不足するオフライン転送、エッジコンピューティング</li><li><b class=\"key\">AWS Transfer Family</b>：SFTP/FTPS/FTP/AS2をS3/EFSへ。既存パートナーのSFTPを維持したい場合</li></ul><p><span class=\"trap\">引っ掛け：「Windows+AD+SMB」→FSx for Windows。「HPC+S3連携」→FSx for Lustre。「ファイルプロトコルを維持したままオンプレから段階的に移行・キャッシュ」→Storage Gateway。「週単位の大量初期転送で回線が細い」→Snowball。</span></p>",
       "oxIds": [
        "ox-2-4-p3-a",
        "ox-2-4-p3-b",
        "ox-2-4-p3-c"
       ]
      }
     ]
    },
    {
     "id": "2-5",
     "title": "サーバーレスとイベント駆動アーキテクチャ",
     "pages": [
      {
       "id": "2-5-p1",
       "title": "Lambdaの設計ポイントとAPI Gateway",
       "html": "<h4>Lambda</h4><ul><li>最大実行時間<b class=\"key\">15分</b>、メモリ128MB〜10,240MB(CPUはメモリに比例)、一時ストレージ最大10GB(/tmp)、ペイロード同期6MB</li><li>同時実行数：アカウント既定1,000(リージョン)。<b class=\"key\">予約済み同時実行</b>＝その関数の上限確保/保護、<b class=\"key\">プロビジョニング済み同時実行</b>＝コールドスタート回避(課金あり)。SnapStart(Java等)で起動高速化</li><li>VPC内のリソースにアクセスするにはVPC設定。インターネットへはNAT Gatewayが必要</li><li>非同期呼び出し：自動リトライ2回、<b class=\"key\">DLQ</b>/On-failure宛先。SQSトリガーはバッチ+部分的バッチ失敗報告。ストリーム(Kinesis/DynamoDB)はシャード単位の順序</li><li>15分超・大規模バッチ → Fargate/AWS Batch/Step Functions</li></ul><h4>API Gateway</h4><table><tr><th>種類</th><th>特徴</th></tr><tr><td>REST API</td><td>機能豊富：キャッシュ、使用量プラン/APIキー、リクエスト検証、WAF、リソースポリシー、カナリアリリース、Cognito/Lambdaオーソライザー</td></tr><tr><td>HTTP API</td><td>低コスト・低レイテンシ。JWTオーソライザー。機能は少ない</td></tr><tr><td>WebSocket API</td><td>双方向リアルタイム通信</td></tr></table><ul><li>統合タイムアウトは通常<b class=\"key\">29秒</b>(既定)。長時間処理は非同期化(202+SQS/Step Functions)</li><li>スロットリング(既定10,000 rps/アカウント)。REST APIは<b class=\"key\">使用量プランでクライアント別制限</b>。エッジ最適化/リージョン/プライベートのエンドポイント</li></ul><p><span class=\"trap\">引っ掛け：Lambdaがリトライして重複処理が起きうる → 冪等性設計が必須。</span></p>",
       "oxIds": [
        "ox-2-5-p1-a",
        "ox-2-5-p1-b",
        "ox-2-5-p1-c"
       ]
      },
      {
       "id": "2-5-p2",
       "title": "メッセージング：SQS・SNS・EventBridge・Kinesisの使い分け",
       "html": "<table><tr><th>サービス</th><th>モデル</th><th>ポイント</th></tr><tr><td>SQS標準</td><td>キュー(プル)</td><td>ほぼ無制限スループット、少なくとも1回、順序保証なし</td></tr><tr><td><b class=\"key\">SQS FIFO</b></td><td>キュー</td><td>順序保証(メッセージグループ)・重複排除(5分)。高スループットモードあり</td></tr><tr><td>SNS</td><td>Pub/Sub(プッシュ)</td><td>ファンアウト。SQS/Lambda/HTTP/Email/SMS。<b class=\"key\">フィルターポリシー</b>、FIFOトピック</td></tr><tr><td>EventBridge</td><td>イベントバス</td><td>ルールで<b class=\"key\">コンテンツベースのルーティング</b>、SaaS/AWSイベント、スケジュール、<b class=\"key\">アーカイブ&amp;リプレイ</b>、スキーマレジストリ、Pipes</td></tr><tr><td>Kinesis Data Streams</td><td>ストリーム</td><td>順序(シャード単位)・<b class=\"key\">複数コンシューマの再読込</b>(保持24時間〜365日)</td></tr></table><ul><li>SQSの可視性タイムアウトはコンシューマ処理時間より長く。ロングポーリングでコスト削減。DLQ＋maxReceiveCount。メッセージ最大256KB(大きいものはS3へ)</li><li><b class=\"key\">SNS+SQSのファンアウト</b>：1イベントを複数の独立処理へ。SQSの前にSNSを置く典型構成</li></ul><p><span class=\"trap\">引っ掛け：「複数の消費者が同じデータを再読込したい／リプレイ」→Kinesis(またはEventBridgeアーカイブ)。SQSはメッセージが消費されると消える。「順序+重複排除」→SQS FIFO。</span></p>",
       "oxIds": [
        "ox-2-5-p2-a",
        "ox-2-5-p2-b",
        "ox-2-5-p2-c"
       ]
      },
      {
       "id": "2-5-p3",
       "title": "Step Functionsと典型パターン",
       "html": "<h4>Step Functions</h4><ul><li>サーバーレスのワークフロー(ステートマシン)。分岐・並列・Map・待機・リトライ/Catchによるエラー処理・<b class=\"key\">人手承認(コールバック)</b></li><li>Standard：<b class=\"key\">最長1年</b>、正確に1回実行、実行履歴。<b class=\"key\">Express</b>：最長5分、高スループット・大量、少なくとも1回(非同期)/同期もあり、低コスト</li><li>Lambda、ECS、SDK統合(200以上のサービス)を直接呼び出し。「Lambdaで待機・ポーリング」を避けられる</li><li><b class=\"key\">Sagaパターン</b>：補償トランザクションで分散処理の失敗をロールバック</li></ul><h4>典型パターン</h4><ul><li>S3 → EventBridge/SQS → Lambda：ファイルアップロード処理</li><li>API Gateway → SQS：スパイクのバッファ、非同期受付</li><li><b class=\"key\">DynamoDB Streams → Lambda</b>：変更データキャプチャ(24時間保持)</li><li>クロスアカウントイベント：EventBridgeで別アカウントのバスへ転送(リソースポリシー)</li></ul><p><span class=\"trap\">引っ掛け：Lambda関数から別のLambdaを同期的に直列呼び出し(チェイン)するのはアンチパターン(待機課金・失敗管理が複雑)。ステートマシンで調整する。</span></p>",
       "oxIds": [
        "ox-2-5-p3-a",
        "ox-2-5-p3-b",
        "ox-2-5-p3-c"
       ]
      }
     ]
    },
    {
     "id": "2-6",
     "title": "コンテナ設計(ECS・EKS・Fargate)",
     "pages": [
      {
       "id": "2-6-p1",
       "title": "ECS・EKS・Fargate・App Runnerの選択",
       "html": "<table><tr><th>サービス</th><th>選ぶ場面</th></tr><tr><td><b class=\"key\">ECS</b></td><td>AWSネイティブ。シンプル、IAM統合、運用負荷が低い。Kubernetes知識不要</td></tr><tr><td><b class=\"key\">EKS</b></td><td>Kubernetes標準API、既存K8sの移行・マルチクラウド可搬性、OSSエコシステム。EKS Anywhere/ハイブリッド</td></tr><tr><td>Fargate</td><td>サーバーレスのコンピュート(ECS/EKS共通)。<b class=\"key\">EC2ノード管理不要</b>、タスク単位に分離</td></tr><tr><td>App Runner</td><td>ソース/イメージから最小設定でWebアプリ/APIを公開</td></tr><tr><td>ECR</td><td>コンテナレジストリ。脆弱性スキャン、<b class=\"key\">クロスリージョン/クロスアカウントレプリケーション</b>、ライフサイクルポリシー</td></tr></table><h4>起動タイプの判断</h4><ul><li>Fargate：運用最小化、変動負荷、小〜中規模</li><li>EC2起動タイプ：GPU、特殊インスタンス、Savings Plans/スポットで大規模常時稼働コスト最適化、Daemon、ホストレベル制御、Windowsの一部要件</li><li><b class=\"key\">Fargate Spot</b>：中断許容のバッチで最大70%程度の割引</li></ul><p><span class=\"trap\">引っ掛け：「Kubernetesの運用を避けたい」→ECS。「既にKubernetesマニフェスト/Helmを使っている」→EKS。「サーバー管理をなくしたい」→Fargate(ECSでもEKSでも可)。</span></p>",
       "oxIds": [
        "ox-2-6-p1-a",
        "ox-2-6-p1-b",
        "ox-2-6-p1-c"
       ]
      },
      {
       "id": "2-6-p2",
       "title": "ECS/EKSのネットワーク・IAM・スケーリング",
       "html": "<h4>ECS</h4><ul><li><b class=\"key\">タスクロール</b>(コンテナ内アプリがAWS APIを呼ぶ権限)と<b class=\"key\">タスク実行ロール</b>(ECR pull・ログ送信・Secrets取得)を区別</li><li>ネットワークモード<b class=\"key\">awsvpc</b>：タスクごとにENI。タスク単位のセキュリティグループ(Fargateは必須)</li><li>サービスのオートスケーリング(Application Auto Scaling)：ターゲット追跡。キャパシティプロバイダーでEC2のASGもスケール</li><li>デプロイ：ローリング、<b class=\"key\">CodeDeployによるBlue/Green</b>(カナリア/線形)</li><li>ECS Service Connect / Cloud Map：サービスディスカバリ</li><li>機密値はSecrets Manager / SSM Parameter Storeから環境変数/シークレットとして注入(平文埋め込み禁止)</li></ul><h4>EKS</h4><ul><li><b class=\"key\">IRSA</b>(IAM Roles for Service Accounts)またはEKS Pod Identityで、Pod単位に最小権限</li><li>スケーリング：Pod＝HPA、ノード＝Cluster Autoscalerまたは<b class=\"key\">Karpenter</b>(高速・多様なインスタンスを自動選択)</li><li>VPC CNIはPodにVPCのIPを割り当て → サブネットのIP枯渇に注意</li><li>ノード種別：マネージドノードグループ / セルフマネージド / Fargate</li><li>コントロールプレーンは複数AZで管理され、AWSが運用</li></ul>",
       "oxIds": [
        "ox-2-6-p2-a",
        "ox-2-6-p2-b",
        "ox-2-6-p2-c"
       ]
      },
      {
       "id": "2-6-p3",
       "title": "コンテナ移行・モダナイズの判断",
       "html": "<ul><li><b class=\"key\">AWS App2Container(A2C)</b>：既存のJava/.NETアプリをコンテナ化しECS/EKSへ</li><li><b class=\"key\">Lift &amp; Shift(Rehost)</b>＝MGN / <b class=\"key\">Replatform</b>＝RDS化など小改修 / <b class=\"key\">Refactor</b>＝サーバーレス/マイクロサービス化</li><li>マイクロサービス間通信：同期＝ALB/ECS Service Connect/VPC Lattice、非同期＝SQS/SNS/EventBridge</li><li>ログ/監視：Container Insights、FireLens(Fluent Bit)でログルーティング、X-Ray/OpenTelemetry</li></ul><h4>サーバーレス vs コンテナ</h4><table><tr><th>観点</th><th>Lambda</th><th>コンテナ(Fargate)</th></tr><tr><td>実行時間</td><td>最大15分</td><td>制限なし(常駐可)</td></tr><tr><td>起動</td><td>ms〜(コールドスタート)</td><td>数十秒</td></tr><tr><td>課金</td><td>呼び出し/実行時間</td><td>vCPU・メモリの稼働時間</td></tr><tr><td>適性</td><td>イベント駆動・短時間・スパイク</td><td>常駐サービス・長時間・既存コンテナ</td></tr></table><p><span class=\"trap\">引っ掛け：コンテナイメージを使うだけならLambdaコンテナイメージ(最大10GB)もある。「15分超」「常時稼働」「ポート待受サーバー」はLambdaでは不向き。</span></p>",
       "oxIds": [
        "ox-2-6-p3-a",
        "ox-2-6-p3-b",
        "ox-2-6-p3-c"
       ]
      }
     ]
    },
    {
     "id": "2-7",
     "title": "データベース設計の使い分け",
     "pages": [
      {
       "id": "2-7-p1",
       "title": "RDS・Aurora・DynamoDBの選択基準",
       "html": "<table><tr><th>要件</th><th>選択</th></tr><tr><td>既存RDB(Oracle/SQL Server等)のライセンス・機能を維持</td><td>RDS(<b class=\"key\">RDS Custom</b>はOS/DBカスタマイズ要件)</td></tr><tr><td>MySQL/PostgreSQL互換、高性能・高可用性、15リーダー、サーバーレス</td><td>Aurora</td></tr><tr><td>キー/バリュー、ミリ秒の一桁、無制限スケール、サーバーレス</td><td>DynamoDB</td></tr><tr><td>ドキュメント(MongoDB互換)</td><td>DocumentDB</td></tr><tr><td>グラフ</td><td>Neptune</td></tr><tr><td>時系列</td><td>Timestream</td></tr><tr><td>台帳(暗号学的に検証可能な履歴)</td><td>QLDB(提供終了方向。Auroraへの移行推奨)</td></tr><tr><td>ワイドカラム(Cassandra互換)</td><td>Keyspaces</td></tr></table><ul><li>Aurora：<b class=\"key\">Aurora Serverless v2</b>(予測困難な負荷)、<b class=\"key\">Aurora I/O-Optimized</b>(I/O課金が高い場合に定額)、Backtrack(MySQL互換、巻き戻し)、クローン(コピーオンライト、高速)、Aurora Machine Learning統合</li><li>RDSのストレージ暗号化は<b class=\"key\">作成時のみ指定</b>(既存の暗号化なしDBは、スナップショットコピー→暗号化→復元で暗号化済みに移行)</li><li><b class=\"key\">Blue/Green Deployments</b>でバージョンアップ/スキーマ変更のダウンタイム最小化</li></ul><p><span class=\"trap\">引っ掛け：暗号化されていない既存RDSを暗号化 → スナップショットを暗号化コピーして復元(その場で有効化は不可)。</span></p>",
       "oxIds": [
        "ox-2-7-p1-a",
        "ox-2-7-p1-b",
        "ox-2-7-p1-c"
       ]
      },
      {
       "id": "2-7-p2",
       "title": "DynamoDB設計の要点",
       "html": "<ul><li><b class=\"key\">パーティションキー設計</b>：高カーディナリティで均等分散。ホットパーティションを避ける(書き込みシャーディングなど)</li><li>容量モード：<b class=\"key\">オンデマンド</b>(予測不能、スパイク)／プロビジョンド+Auto Scaling(予測可能。リザーブドキャパシティで割引)。Standard-IAテーブルクラスで保存コスト削減</li><li>セカンダリインデックス：<b class=\"key\">LSI</b>(テーブル作成時のみ、同一パーティションキー、強い整合性可)／<b class=\"key\">GSI</b>(後から追加可、別パーティションキー、結果整合性のみ)</li><li>一貫性：既定は結果整合性、強い整合性読み取りは指定可(GSIは不可、Global Tablesは別リージョンでは不可)</li><li><b class=\"key\">DAX</b>：DynamoDB専用のインメモリキャッシュ(マイクロ秒、API互換)。読み取り集中の高速化。強い整合性読み取りはキャッシュされない</li><li>TTL：期限切れ項目の自動削除(書き込み容量を消費しない)</li><li>DynamoDB Streams：24時間の変更履歴 → Lambda。Kinesis Data Streams統合も可</li><li>バックアップ：<b class=\"key\">PITR</b>(35日)、オンデマンドバックアップ、S3へのエクスポート</li><li>トランザクション(TransactWriteItems)、1項目最大400KB → 大きなデータはS3に置きポインタを保持</li></ul><p><span class=\"trap\">引っ掛け：LSIは後から追加できない。GSIは強い整合性が選べない。複雑なアドホック結合クエリ・集計が主目的ならDynamoDBでなくRDB/Athena/Redshift。</span></p>",
       "oxIds": [
        "ox-2-7-p2-a",
        "ox-2-7-p2-b",
        "ox-2-7-p2-c"
       ]
      },
      {
       "id": "2-7-p3",
       "title": "キャッシュ戦略とDB移行",
       "html": "<h4>ElastiCache の使い分け</h4><ul><li>Redis(Valkey)：データ構造(ソート済セット等)、永続化、レプリケーション、Multi-AZ、Pub/Sub、リーダーボード、セッション</li><li><b class=\"key\">Memcached</b>：単純、マルチスレッド、シャーディングで水平分割、レプリケーション・永続化なし</li><li>戦略：<b class=\"key\">Lazy loading</b>(キャッシュミス時にロード、古いデータの可能性)／<b class=\"key\">Write-through</b>(書き込み時に更新、常に最新だが書き込み負荷・未使用データ増)／TTL併用</li></ul><h4>DB移行</h4><ul><li><b class=\"key\">DMS</b>：移行+CDCで継続レプリケーション、ほぼダウンタイムなし。同種移行（Oracle→Oracle）は不要な変換なし、異種移行はスキーマ変換に<b class=\"key\">AWS SCT</b>(またはDMS Schema Conversion)を併用</li><li>同種のMySQL/PostgreSQL → ネイティブツール(mysqldump、pg_dump、ネイティブレプリケーション)や、Auroraへのリードレプリカ作成→昇格も選択肢</li><li>DMSレプリケーションインスタンスは大規模時にMulti-AZ化、ソースDBの負荷に注意</li></ul><table><tr><th>要件</th><th>選択</th></tr><tr><td>Oracle → Aurora PostgreSQL</td><td>SCT+DMS(CDC)</td></tr><tr><td>オンプレMySQL → Aurora MySQL (停止最小)</td><td>DMS CDC、またはバイナリログレプリケーション</td></tr></table>",
       "oxIds": [
        "ox-2-7-p3-a",
        "ox-2-7-p3-b",
        "ox-2-7-p3-c"
       ]
      }
     ]
    },
    {
     "id": "2-8",
     "title": "分析・データレイク・ストリーミング",
     "pages": [
      {
       "id": "2-8-p1",
       "title": "Redshift・Athena・EMR・OpenSearchの使い分け",
       "html": "<table><tr><th>サービス</th><th>選ぶ場面</th></tr><tr><td>Redshift</td><td>DWH。大規模・複雑なSQL結合/集計、BI。RA3(コンピュートとストレージ分離)、<b class=\"key\">Redshift Spectrum</b>でS3を直接クエリ、Serverless、同時実行スケーリング、マテリアライズドビュー、データ共有、ゼロETL統合(Aurora/DynamoDB等)</td></tr><tr><td><b class=\"key\">Athena</b></td><td>S3上のデータにアドホックSQL(サーバーレス・スキャン量課金)。<b class=\"key\">Parquet/ORC圧縮・パーティション</b>でコストと速度を改善。Glue Data Catalog使用</td></tr><tr><td><b class=\"key\">EMR</b></td><td>Spark/Hadoop/Hive/Presto等のビッグデータ処理。細かな制御、スポット活用、EMR Serverless/on EKS</td></tr><tr><td>OpenSearch Service</td><td>全文検索、ログ分析、ダッシュボード</td></tr><tr><td>QuickSight</td><td>BI。SPICEインメモリ、行レベルセキュリティ</td></tr></table><ul><li>Redshiftの暗号化・スナップショットのクロスリージョンコピー、Multi-AZ(RA3)</li><li>Redshiftは<b class=\"key\">OLAP</b>、RDS/AuroraはOLTP。大量の小さなトランザクション更新にRedshiftは不向き</li></ul><p><span class=\"trap\">引っ掛け：「S3に置いたままアドホック／頻度が低い」→Athena。「複雑な結合を高頻度に、多数の同時BIユーザー」→Redshift。「S3のデータとDWHテーブルをまとめて結合」→Redshift Spectrum。</span></p>",
       "oxIds": [
        "ox-2-8-p1-a",
        "ox-2-8-p1-b",
        "ox-2-8-p1-c"
       ]
      },
      {
       "id": "2-8-p2",
       "title": "データレイクとETL：Glue・Lake Formation・DataZone",
       "html": "<ul><li>S3データレイク：Raw/Curated/Processed層、パーティション設計、Parquet変換</li><li>AWS Glue：サーバーレスETL(Spark/Python)。<b class=\"key\">Glue Data Catalog</b>(Athena/EMR/Redshift Spectrum共通のメタデータ)、<b class=\"key\">クローラー</b>でスキーマ自動検出、ジョブブックマークで差分処理、Glue Studio、DataBrew(ノーコード整形)、Glue Data Quality</li><li><b class=\"key\">Lake Formation</b>：データレイクの集中アクセス制御。データベース/テーブル/<b class=\"key\">列・行・セルレベル</b>の権限、タグベース(LF-TBAC)、<b class=\"key\">クロスアカウント共有</b>。Athena/Redshift Spectrum/EMR/Glueが権限を強制</li><li>Amazon DataZone / SageMaker Unified Studio：データ共有・カタログ・ガバナンスのポータル</li><li>S3 Tables(Apache Iceberg形式のマネージドテーブル)でレイクハウス</li></ul><h4>ポイント</h4><ul><li>IAM・S3バケットポリシーだけでは列レベル制御が困難 → Lake Formation</li><li>機密データの検出：<b class=\"key\">Macie</b>(S3のPII検出)</li></ul><p><span class=\"trap\">引っ掛け：Athenaで列を隠したい → Lake Formation列フィルター(データ自体のコピー不要)。スキーマ変更のたびに手作業でDDLを書かず、クローラーで自動化。</span></p>",
       "oxIds": [
        "ox-2-8-p2-a",
        "ox-2-8-p2-b",
        "ox-2-8-p2-c"
       ]
      },
      {
       "id": "2-8-p3",
       "title": "ストリーミングとリアルタイム処理",
       "html": "<table><tr><th>サービス</th><th>特徴</th></tr><tr><td><b class=\"key\">Kinesis Data Streams</b></td><td>シャード(書込1MB/s・1,000件/s、読取2MB/s)。オンデマンド/プロビジョンド。拡張ファンアウト(EFO)でコンシューマごとに2MB/s。保持24h〜365日。順序はパーティションキー単位</td></tr><tr><td><b class=\"key\">Amazon Data Firehose</b></td><td>配信専用のマネージド。S3/Redshift/OpenSearch/Splunk/HTTPへ。バッファ(サイズ/時間)のニアリアルタイム。Lambda変換、Parquet変換</td></tr><tr><td><b class=\"key\">Managed Service for Apache Flink</b></td><td>ストリームに対するSQL/Flinkのリアルタイム分析・ウィンドウ集計</td></tr><tr><td><b class=\"key\">MSK</b></td><td>マネージドKafka。既存Kafkaアプリの互換性。MSK Serverless</td></tr><tr><td>IoT Core</td><td>デバイス接続(MQTT)・ルールでKinesis/Lambda等へ</td></tr></table><ul><li>典型：Producers → Kinesis Data Streams → (Lambda / Flink) → Firehose → S3 → Athena/Redshift</li><li>ホットシャード：パーティションキー偏り → キー設計見直し、シャード分割。<b class=\"key\">ProvisionedThroughputExceeded</b>はリトライ+バックオフ</li><li>順序保証が不要で任意のコンシューマが独立並列処理 → SQS。順序+複数コンシューマ+再読込 → Kinesis。Kafka互換 → MSK</li></ul><p><span class=\"trap\">引っ掛け：Firehoseは「ニアリアルタイム」(バッファ最短で数秒〜60秒)でありリアルタイムではない。また複数のコンシューマが再読込するならFirehoseでなくData Streams。</span></p>",
       "oxIds": [
        "ox-2-8-p3-a",
        "ox-2-8-p3-b",
        "ox-2-8-p3-c"
       ]
      }
     ]
    },
    {
     "id": "2-9",
     "title": "セキュリティ設計(KMS・WAF・Shield・Cognito等)",
     "pages": [
      {
       "id": "2-9-p1",
       "title": "KMSと暗号化設計",
       "html": "<ul><li>KMSキーの種類：AWS所有キー／AWSマネージドキー(aws/s3等：キーポリシー編集不可、自動ローテーション1年)／<b class=\"key\">カスタマーマネージドキー(CMK)</b>(キーポリシー制御、自動ローテーション有効化可、オンデマンドローテーション可、削除は待機期間7〜30日)</li><li>キーポリシーが基本。<b class=\"key\">キーポリシーで許可がなければIAMだけでは使えない</b>(IAMで制御するにはキーポリシーでIAM委任を許可)。グラントで一時的委任</li><li><b class=\"key\">エンベロープ暗号化</b>：データキーでデータを暗号化し、KMSキーでデータキーを暗号化。KMS直接暗号化は4KBまで</li><li><b class=\"key\">マルチリージョンキー</b>：同一キーID/素材を別リージョンで利用 → クロスリージョンの暗号化DR/Global Tables/Auroraなど。通常のKMSキーはリージョン固有</li><li>クロスアカウント：キーポリシーで別アカウントを許可＋利用側のIAMでも許可</li><li><b class=\"key\">CloudHSM</b>：専有HSM、FIPS 140-2 Level 3、鍵を顧客が完全管理。KMSカスタムキーストアとして連携可。規制でシングルテナントHSMが必須の場合</li><li>暗号化のS3：SSE-S3(既定で全オブジェクトに適用)、SSE-KMS(監査/鍵制御、リクエスト数制限に注意、S3バケットキーでKMSコスト削減)、SSE-C、DSSE-KMS、クライアント側暗号化</li><li>転送中：TLS。ACM証明書(無料・自動更新、ALB/CloudFront/API Gatewayに紐付け。<b class=\"key\">CloudFront用は us-east-1</b>)。EC2に直接インストールはできない</li></ul><p><span class=\"trap\">引っ掛け：「KMS鍵の素材を自社で管理」→鍵素材のインポート(BYOK)またはCloudHSM。「暗号化したEBS/スナップショットを別アカウントに共有」→CMKのキー共有が必須(AWSマネージドキーは共有不可)。</span></p>",
       "oxIds": [
        "ox-2-9-p1-a",
        "ox-2-9-p1-b",
        "ox-2-9-p1-c"
       ]
      },
      {
       "id": "2-9-p2",
       "title": "エッジ・アプリケーション防御：WAF・Shield・Firewall Manager",
       "html": "<ul><li><b class=\"key\">AWS WAF</b>：L7。ALB、CloudFront、API Gateway(REST)、AppSync、Cognito等にアタッチ。マネージドルール(OWASP Top10、ボット制御)、<b class=\"key\">レートベースルール</b>、IP/地理/文字列マッチ、SQLi/XSS対策、CAPTCHA。NLBには直接アタッチ不可</li><li>Shield Standard：全顧客に無料、L3/L4のDDoS。<b class=\"key\">Shield Advanced</b>：有料、L7含む高度な検知、DRT(Shield Response Team)支援、DDoSによるコスト急増の補償、WAFの追加料金なし(対象リソース)。CloudFront・Route 53・GA・ELB・EIPを保護</li><li><b class=\"key\">Network Firewall</b>：VPC境界の状態保持/ステートレスFW、ドメインフィルタ、IPS(Suricata互換)。Route 53 Resolver DNS Firewall：DNSレベルの悪意あるドメインのブロック</li><li><b class=\"key\">Firewall Manager</b>：Organizations全体でWAF・SG・Network Firewall・Shield Advancedのポリシーを一元適用</li><li>GuardDuty(脅威検出)、Inspector(脆弱性)、Security Hub(集約)、Macie(S3機密データ)、Detective(調査)</li></ul><table><tr><th>脅威</th><th>対策</th></tr><tr><td>SQLインジェクション/XSS</td><td>WAF</td></tr><tr><td>大規模DDoS(L3/4/7)</td><td>Shield Advanced+CloudFront+WAF</td></tr><tr><td>特定IPからの過剰リクエスト</td><td>WAFレートベースルール</td></tr><tr><td>VPC外向き通信のドメイン制限</td><td>Network Firewall / DNS Firewall</td></tr></table><p><span class=\"trap\">引っ掛け：セキュリティグループは「拒否」ルールを作れない。特定IPの拒否はNACL(ステートレス)かWAF。</span></p>",
       "oxIds": [
        "ox-2-9-p2-a",
        "ox-2-9-p2-b",
        "ox-2-9-p2-c"
       ]
      },
      {
       "id": "2-9-p3",
       "title": "認証認可・シークレット：Cognito・Secrets Manager・IAM",
       "html": "<ul><li><b class=\"key\">Cognito ユーザープール</b>：ユーザーディレクトリ・サインイン、JWT発行、ソーシャル/SAML/OIDC連携、MFA、ホストUI。ALBやAPI Gatewayのオーソライザーとして利用</li><li><b class=\"key\">Cognito ID プール</b>(フェデレーテッドID)：認証済み/ゲストに一時的なAWS認証情報を発行(S3等に直接アクセス)</li><li>IAM Identity Center：ワークフォース(社員)のSSO、複数アカウント・SAMLアプリ。外部IdP(Entra ID/Okta)と連携</li><li>Secrets Manager：<b class=\"key\">自動ローテーション</b>(RDS/Aurora等はLambdaで)、マルチリージョンレプリケーション、有料。SSM Parameter Store：安価(標準は無料)、ローテーションは自前、階層構造</li><li>IAMの原則：最小権限、ロール利用(長期キーを避ける)、<b class=\"key\">権限境界</b>(委任された管理者の上限)、<b class=\"key\">SCP</b>(Organizationsのガードレール：許可の上限であり付与はしない)、条件キー(aws:SourceIp, aws:PrincipalOrgID, aws:RequestedRegion)</li><li>VPCエンドポイント：ゲートウェイ型(S3/DynamoDB、無料)／インターフェース型(PrivateLink、その他多数、時間+データ課金)。エンドポイントポリシー・S3バケットポリシーの<b class=\"key\">aws:SourceVpce</b>で閉域化</li></ul><p><span class=\"trap\">引っ掛け：「モバイルアプリのユーザーにS3へ直接アクセスさせる」→Cognito IDプール(ユーザープール単体ではAWS認証情報は得られない)。「DBパスワードの自動ローテーション」→Secrets Manager。</span></p>",
       "oxIds": [
        "ox-2-9-p3-a",
        "ox-2-9-p3-b",
        "ox-2-9-p3-c"
       ]
      }
     ]
    },
    {
     "id": "2-10",
     "title": "コスト最適化とパフォーマンス設計",
     "pages": [
      {
       "id": "2-10-p1",
       "title": "コンピュートの購入オプションとコスト設計",
       "html": "<table><tr><th>オプション</th><th>特徴</th></tr><tr><td>オンデマンド</td><td>柔軟、最も高い。短期・予測不能</td></tr><tr><td><b class=\"key\">Compute Savings Plans</b></td><td>1年/3年の時間あたり金額コミット。EC2(リージョン・ファミリー・OS不問)・Fargate・Lambdaに適用。最大66%程度の割引</td></tr><tr><td><b class=\"key\">EC2 Instance Savings Plans</b></td><td>特定リージョン・ファミリーに限定、割引率が高い(最大72%程度)</td></tr><tr><td>リザーブドインスタンス</td><td>Standard(変更制限、最大72%)/Convertible(ファミリー変更可)。RDS/ElastiCache/Redshift/OpenSearchは主にRIで割引(Compute/EC2 Instance Savings Plansの対象外。データベース向けの割引プランが提供される場合があるため最新仕様も確認)</td></tr><tr><td><b class=\"key\">スポット</b></td><td>最大90%引き。<b class=\"key\">2分前通知で中断</b>。ステートレス・耐障害・バッチ/CI/ビッグデータ向け</td></tr><tr><td>Dedicated Host/Instance</td><td>BYOL(ソケット/コア単位ライセンス)・コンプライアンス</td></tr><tr><td>Capacity Reservation</td><td>AZ内の容量確保(割引なし。SPと併用)</td></tr></table><ul><li>Auto Scaling+混合インスタンスポリシー(ベースをオンデマンド/RI、上乗せをスポット、複数ファミリーで中断リスク分散。capacity-optimized)</li><li><b class=\"key\">Graviton</b>(Arm)：同等性能で価格性能比が良い(約20〜40%向上)。対応ソフトのみ</li><li><b class=\"key\">Compute Optimizer</b>：EC2/EBS/Lambda/ASGのライトサイジング推奨。Cost Explorer・Budgets・Cost Anomaly Detection・コスト配分タグ・Cost and Usage Report</li></ul><p><span class=\"trap\">引っ掛け：「予測可能な常時稼働＋インスタンスファミリー変更の可能性」→Compute Savings PlansまたはConvertible RI。「中断してはいけない」ワークロードにスポットは不可。</span></p>",
       "oxIds": [
        "ox-2-10-p1-a",
        "ox-2-10-p1-b",
        "ox-2-10-p1-c"
       ]
      },
      {
       "id": "2-10-p2",
       "title": "データ転送・ストレージ・ネットワークのコスト",
       "html": "<ul><li>データ転送の原則：インバウンド無料、同一AZ内プライベートIPは無料、<b class=\"key\">AZ間・リージョン間・インターネット送信は課金</b></li><li>NAT Gatewayは時間+処理GB課金 → S3/DynamoDBへは<b class=\"key\">ゲートウェイエンドポイント(無料)</b>を使い、NATを経由させない</li><li><b class=\"key\">CloudFront</b>：オリジン→CloudFront間の転送は無料。インターネット直接送信より割安になることが多い、プライスクラスでさらに削減</li><li>S3：ライフサイクル/Intelligent-Tiering、S3 Storage Lens、リクエスター支払い、Gateway Endpoint</li><li>EBS：未アタッチボリューム・古いスナップショットの削除、gp2→gp3</li><li><b class=\"key\">Direct Connect</b>(大量・継続的転送は割安・安定)vs VPN(迅速・低コスト)。Transit Gatewayは時間+データ処理課金、<b class=\"key\">VPCピアリング</b>は同一AZなら転送無料・推移的ルーティング不可</li><li>AZ間転送の最小化：AZ認識ルーティング(NLB/ALBクロスゾーン無効)、トポロジ認識ルーティング(EKS)</li></ul><h4>サーバーレス/マネージドのコスト特性</h4><ul><li>低頻度・変動 → Lambda/Fargate/Aurora Serverless/DynamoDBオンデマンド</li><li>常時高負荷で安定 → RIやSPが効くEC2/プロビジョンドが安い場合が多い</li></ul><p><span class=\"trap\">引っ掛け：プライベートサブネットのEC2からS3へ大量転送しNAT料金が高い → S3ゲートウェイVPCエンドポイント。</span></p>",
       "oxIds": [
        "ox-2-10-p2-a",
        "ox-2-10-p2-b",
        "ox-2-10-p2-c"
       ]
      },
      {
       "id": "2-10-p3",
       "title": "パフォーマンス設計のチェックポイント",
       "html": "<ul><li>EC2：ワークロードに合わせたファミリー(C=計算、M=汎用、R=メモリ、I=ストレージIO、G/P=GPU、Inf/Trn=推論/学習)、<b class=\"key\">配置グループ</b>(クラスター=低遅延HPC、パーティション=大規模分散、スプレッド=少数の重要インスタンスの分離)、<b class=\"key\">拡張ネットワーキング/ENA/EFA</b>(HPC・MPI)</li><li>ストレージ：IOPS要求→io2/ストライピング、スループット→st1/FSx Lustre、インスタンスストア</li><li>DB：リードレプリカ・Auroraリーダーで読み取り分散、<b class=\"key\">キャッシュ</b>(ElastiCache/DAX)、RDS Proxy、パーティション設計</li><li>配信：CloudFront、Global Accelerator、S3 Transfer Acceleration、<b class=\"key\">API Gatewayキャッシュ</b></li><li>非同期化/バッファ：SQS・Kinesis・Lambda同時実行制御で背圧</li><li>リージョン選択：ユーザー近接・サービス提供状況・コンプライアンス・コスト</li><li>観測：CloudWatch(メトリクス・ログ・アラーム)、X-Ray、Performance Insights、Compute Optimizer</li></ul><h4>Well-Architected 6本柱</h4><p>運用上の優秀性／セキュリティ／信頼性／パフォーマンス効率／コスト最適化／<b class=\"key\">持続可能性</b>。トレードオフ(例：信頼性↑はコスト↑)の中で要件優先度に沿って選ぶのがSAPの核心。</p><p><span class=\"trap\">引っ掛け：問題文の「最もコスト効率が高い」「運用オーバーヘッド最小」「最小限の変更」という修飾語で答えが変わる。要件をすべて満たす選択肢のうち、修飾語に最も合致するものを選ぶ。</span></p>",
       "oxIds": [
        "ox-2-10-p3-a",
        "ox-2-10-p3-b",
        "ox-2-10-p3-c"
       ]
      }
     ]
    }
   ],
   "ox": [
    {
     "id": "ox-2-1-p1-a",
     "lesson": "2-1",
     "text": "RPOとは、障害発生から復旧完了までに許容される時間のことである。",
     "answer": false,
     "explain": "それはRTO。RPOは許容できるデータ損失の時間幅。"
    },
    {
     "id": "ox-2-1-p1-b",
     "lesson": "2-1",
     "text": "Pilot Lightでは、データ層を常時レプリケーションし、アプリ層は障害時に起動・拡張する。",
     "answer": true,
     "explain": "コアのみ稼働させる戦略で、Warm Standbyより低コスト・復旧は遅い。"
    },
    {
     "id": "ox-2-1-p1-c",
     "lesson": "2-1",
     "text": "Multi-site Active/Activeは4戦略の中で最もコストが低い。",
     "answer": false,
     "explain": "複数リージョンで本番を同時稼働するため最もコストが高い。"
    },
    {
     "id": "ox-2-1-p2-a",
     "lesson": "2-1",
     "text": "Aurora Global Databaseはセカンダリリージョンへ通常1秒未満の遅延でストレージレベル複製する。",
     "answer": true,
     "explain": "低RPO・低RTOのリージョン間DRに適する。"
    },
    {
     "id": "ox-2-1-p2-b",
     "lesson": "2-1",
     "text": "DynamoDB Global Tablesは書き込みをプライマリリージョンだけに限定する。",
     "answer": false,
     "explain": "マルチアクティブで、どのレプリカリージョンでも書き込み可能。"
    },
    {
     "id": "ox-2-1-p2-c",
     "lesson": "2-1",
     "text": "S3 RTCを有効にすると、複製のSLAとして15分以内に99.99%のオブジェクトが複製される。",
     "answer": true,
     "explain": "RTCは追加料金で複製時間のSLAとメトリクスを提供する。"
    },
    {
     "id": "ox-2-1-p3-a",
     "lesson": "2-1",
     "text": "マルチAZ配置だけで、リージョン全体の障害に備えたことになる。",
     "answer": false,
     "explain": "AZ障害には有効だが、リージョン障害にはクロスリージョン構成が必要。"
    },
    {
     "id": "ox-2-1-p3-b",
     "lesson": "2-1",
     "text": "DNSキャッシュに左右されずに素早くリージョン間で切り替えたい場合、Global Acceleratorが有効である。",
     "answer": true,
     "explain": "固定のAnycast IPを使うため、クライアントのDNSキャッシュの影響を受けない。"
    },
    {
     "id": "ox-2-1-p3-c",
     "lesson": "2-1",
     "text": "AWS Elastic Disaster Recoveryは、サーバーを継続的にレプリケーションしAWSへ迅速にフェイルオーバーできる。",
     "answer": true,
     "explain": "ブロックレベルの継続レプリケーションで低RPO・数分のRTOを実現する。"
    },
    {
     "id": "ox-2-2-p1-a",
     "lesson": "2-2",
     "text": "RDS Multi-AZ DBインスタンス構成のスタンバイは読み取りクエリに利用できる。",
     "answer": false,
     "explain": "インスタンス型のスタンバイは読み取り不可。読み取り可能なのはMulti-AZ DBクラスターやリードレプリカ。"
    },
    {
     "id": "ox-2-2-p1-b",
     "lesson": "2-2",
     "text": "Auroraのストレージは3つのAZにまたがって6コピー保持される。",
     "answer": true,
     "explain": "AZ1つ障害でも書き込み継続、AZ+1障害でも読み取り可能なクォーラム設計。"
    },
    {
     "id": "ox-2-2-p1-c",
     "lesson": "2-2",
     "text": "RDS ProxyはLambdaなど大量の短命接続からDBを保護するのに役立つ。",
     "answer": true,
     "explain": "接続をプールして再利用し、DBの接続数枯渇を防ぐ。"
    },
    {
     "id": "ox-2-2-p2-a",
     "lesson": "2-2",
     "text": "Aurora Global Databaseのセカンダリリージョンは通常、読み取り専用である。",
     "answer": true,
     "explain": "書き込み転送を使えば書き込みをプライマリへ転送可能だが、セカンダリ自体は読み取り専用。"
    },
    {
     "id": "ox-2-2-p2-b",
     "lesson": "2-2",
     "text": "各リージョンで同時にローカル書き込みを受けるリレーショナルDBにはAurora Global Databaseが最適である。",
     "answer": false,
     "explain": "マルチリージョンのマルチアクティブ書き込みはDynamoDB Global Tablesの特徴。"
    },
    {
     "id": "ox-2-2-p2-c",
     "lesson": "2-2",
     "text": "MemoryDBはキャッシュ専用で、データの耐久性は保証されない。",
     "answer": false,
     "explain": "MemoryDBはマルチAZトランザクションログにより耐久性を持つプライマリDBとして使える。"
    },
    {
     "id": "ox-2-2-p3-a",
     "lesson": "2-2",
     "text": "ASGでELBヘルスチェックを有効にすると、アプリケーションレベルの異常を検知したインスタンスも置き換えられる。",
     "answer": true,
     "explain": "デフォルトのEC2ヘルスチェックはインスタンスの稼働状態のみを見る。"
    },
    {
     "id": "ox-2-2-p3-b",
     "lesson": "2-2",
     "text": "周期的に繰り返す負荷パターンには予測スケーリングが利用できる。",
     "answer": true,
     "explain": "過去の負荷から予測し、事前にキャパシティを確保する。"
    },
    {
     "id": "ox-2-2-p3-c",
     "lesson": "2-2",
     "text": "NAT GatewayはリージョンあたりAZに関係なく1台で高可用性が確保される。",
     "answer": false,
     "explain": "NAT GatewayはAZ内で冗長だが、AZ障害に備えるには各AZに配置し、AZごとのルートテーブルで向ける。"
    },
    {
     "id": "ox-2-3-p1-a",
     "lesson": "2-3",
     "text": "ALBはAZごとに固定のElastic IPを割り当てられる。",
     "answer": false,
     "explain": "固定IPを割り当てられるのはNLB。ALBはIPが変動する。"
    },
    {
     "id": "ox-2-3-p1-b",
     "lesson": "2-3",
     "text": "Gateway Load Balancerはサードパーティ製の仮想アプライアンスを透過的に挿入する用途に使う。",
     "answer": true,
     "explain": "GENEVEカプセル化でトラフィックをアプライアンス群へ分散する。"
    },
    {
     "id": "ox-2-3-p1-c",
     "lesson": "2-3",
     "text": "パスベースのルーティングが必要な場合はNLBを選ぶ。",
     "answer": false,
     "explain": "L7のパス/ホストベースのルーティングはALBの機能。"
    },
    {
     "id": "ox-2-3-p2-a",
     "lesson": "2-3",
     "text": "CloudFrontのOACは、S3バケットへのアクセスをCloudFront経由のみに制限する用途に使う。",
     "answer": true,
     "explain": "バケットポリシーでCloudFrontサービスプリンシパル+ディストリビューションARNを許可する。"
    },
    {
     "id": "ox-2-3-p2-b",
     "lesson": "2-3",
     "text": "Global Acceleratorはエッジでコンテンツをキャッシュして配信を高速化する。",
     "answer": false,
     "explain": "キャッシュは行わない。ネットワーク経路の最適化と固定IPが特徴。"
    },
    {
     "id": "ox-2-3-p2-c",
     "lesson": "2-3",
     "text": "UDPベースのゲームトラフィックをグローバルに高速化したい場合、Global Acceleratorが適する。",
     "answer": true,
     "explain": "GAはTCP/UDPに対応。CloudFrontはHTTP/HTTPS(WebSocket含む)中心。"
    },
    {
     "id": "ox-2-3-p3-a",
     "lesson": "2-3",
     "text": "example.com(ゾーンAPEX)にCNAMEレコードを作成してALBを指すことができる。",
     "answer": false,
     "explain": "APEXにはCNAMEを作れない。AエイリアスレコードでALBを指す。"
    },
    {
     "id": "ox-2-3-p3-b",
     "lesson": "2-3",
     "text": "ユーザーの国ごとにコンテンツを制限して振り分ける要件には地理的位置情報ルーティングを使う。",
     "answer": true,
     "explain": "ユーザーの所在地に基づく。レイテンシーは速度基準。"
    },
    {
     "id": "ox-2-3-p3-c",
     "lesson": "2-3",
     "text": "Route 53のヘルスチェックはCloudWatchアラームの状態を監視対象にできる。",
     "answer": true,
     "explain": "プライベートVPC内のリソースの監視などで使える。"
    },
    {
     "id": "ox-2-4-p1-a",
     "lesson": "2-4",
     "text": "S3 Standard-IAは単一AZにのみデータを保存する。",
     "answer": false,
     "explain": "単一AZなのはOne Zone-IA。Standard-IAは3AZ以上に保存。"
    },
    {
     "id": "ox-2-4-p1-b",
     "lesson": "2-4",
     "text": "S3 Object Lockのコンプライアンスモードでは、保持期間中は root ユーザーでも削除・上書きできない。",
     "answer": true,
     "explain": "ガバナンスモードは特別権限で解除できるが、コンプライアンスモードは不可。"
    },
    {
     "id": "ox-2-4-p1-c",
     "lesson": "2-4",
     "text": "レプリケーションを設定する前から存在するオブジェクトを複製するには、S3バッチレプリケーションを使う。",
     "answer": true,
     "explain": "通常のレプリケーションは設定後の新規オブジェクトが対象。"
    },
    {
     "id": "ox-2-4-p2-a",
     "lesson": "2-4",
     "text": "EBSボリュームは作成したAZ内でのみアタッチでき、AZ間移動にはスナップショットを使う。",
     "answer": true,
     "explain": "EBSはAZ固定のブロックストレージ。"
    },
    {
     "id": "ox-2-4-p2-b",
     "lesson": "2-4",
     "text": "インスタンスストアのデータは、インスタンスを停止してもそのまま保持される。",
     "answer": false,
     "explain": "停止・終了・ハード障害でデータは失われる。"
    },
    {
     "id": "ox-2-4-p2-c",
     "lesson": "2-4",
     "text": "EFSはWindowsインスタンスからSMBでマウントできる。",
     "answer": false,
     "explain": "EFSはNFS(Linux)専用。WindowsにはFSx for Windows File Server。"
    },
    {
     "id": "ox-2-4-p3-a",
     "lesson": "2-4",
     "text": "S3と連携して高速に処理するHPCワークロードにはFSx for Lustreが適する。",
     "answer": true,
     "explain": "Lustreは高スループット並列FSで、S3バケットをデータリポジトリとして連携できる。"
    },
    {
     "id": "ox-2-4-p3-b",
     "lesson": "2-4",
     "text": "SFTPで外部パートナーとファイル交換を行い、保存先をS3にしたい場合はAWS Transfer Familyが利用できる。",
     "answer": true,
     "explain": "SFTP/FTPS/FTP/AS2をマネージドで提供する。"
    },
    {
     "id": "ox-2-4-p3-c",
     "lesson": "2-4",
     "text": "Active Directory統合が必要なSMBファイル共有にはEFSを使う。",
     "answer": false,
     "explain": "AD統合のSMBはFSx for Windows File Server。"
    },
    {
     "id": "ox-2-5-p1-a",
     "lesson": "2-5",
     "text": "Lambdaの最大実行時間は15分である。",
     "answer": true,
     "explain": "それを超える処理はFargate、Batch、Step Functions等を検討する。"
    },
    {
     "id": "ox-2-5-p1-b",
     "lesson": "2-5",
     "text": "プロビジョニング済み同時実行は、関数のコールドスタートを減らすために使う。",
     "answer": true,
     "explain": "事前に初期化済みの実行環境を確保する。"
    },
    {
     "id": "ox-2-5-p1-c",
     "lesson": "2-5",
     "text": "API Gateway REST APIのキャッシュや使用量プランはHTTP APIでも同等に使える。",
     "answer": false,
     "explain": "これらはREST APIの機能。HTTP APIは低コストだが機能が限定される。"
    },
    {
     "id": "ox-2-5-p2-a",
     "lesson": "2-5",
     "text": "SQSはコンシューマが処理して削除するとメッセージが消えるため、同じメッセージを複数の独立コンシューマが再読込する用途には向かない。",
     "answer": true,
     "explain": "再読込・複数コンシューマにはKinesis等を使う。"
    },
    {
     "id": "ox-2-5-p2-b",
     "lesson": "2-5",
     "text": "SNSのFIFOトピックは順序保証と重複排除を提供する。",
     "answer": true,
     "explain": "SQS FIFOキューをサブスクライバーにできる。"
    },
    {
     "id": "ox-2-5-p2-c",
     "lesson": "2-5",
     "text": "SQSの可視性タイムアウトは、コンシューマの処理時間より短く設定するのが望ましい。",
     "answer": false,
     "explain": "短いと処理中に再配信され重複処理が起きる。処理時間より長くする。"
    },
    {
     "id": "ox-2-5-p3-a",
     "lesson": "2-5",
     "text": "Step Functions Standardワークフローは最長1年間実行できる。",
     "answer": true,
     "explain": "Expressは最長5分。長時間・人手承認を含むならStandard。"
    },
    {
     "id": "ox-2-5-p3-b",
     "lesson": "2-5",
     "text": "複雑な多段処理を、Lambda関数から別のLambdaを同期的に呼び出して連鎖させるのが推奨設計である。",
     "answer": false,
     "explain": "待機分の課金やエラー処理が複雑になる。Step Functionsでオーケストレーションする。"
    },
    {
     "id": "ox-2-5-p3-c",
     "lesson": "2-5",
     "text": "EventBridgeはイベントのアーカイブとリプレイをサポートする。",
     "answer": true,
     "explain": "過去イベントを再送して再処理やテストに使える。"
    },
    {
     "id": "ox-2-6-p1-a",
     "lesson": "2-6",
     "text": "Fargateを使うと、コンテナを実行するEC2インスタンスのパッチ適用やスケーリング管理が不要になる。",
     "answer": true,
     "explain": "サーバーレスコンピュートでタスク単位に起動する。"
    },
    {
     "id": "ox-2-6-p1-b",
     "lesson": "2-6",
     "text": "FargateはECSでのみ利用でき、EKSでは利用できない。",
     "answer": false,
     "explain": "EKSもFargateプロファイルでPodをFargate上で実行できる。"
    },
    {
     "id": "ox-2-6-p1-c",
     "lesson": "2-6",
     "text": "既存のKubernetes資産(Helmチャート)を最小変更で移行するにはEKSが適する。",
     "answer": true,
     "explain": "Kubernetes互換のため。"
    },
    {
     "id": "ox-2-6-p2-a",
     "lesson": "2-6",
     "text": "ECSのタスク実行ロールは、コンテナ内のアプリがS3にアクセスするための権限を付与するロールである。",
     "answer": false,
     "explain": "それはタスクロール。実行ロールはECRのpullやログ出力、シークレット取得などECSエージェント用。"
    },
    {
     "id": "ox-2-6-p2-b",
     "lesson": "2-6",
     "text": "EKSでPod単位に最小権限を付与するには、IRSAまたはEKS Pod Identityを使う。",
     "answer": true,
     "explain": "ノードのインスタンスプロファイルを共有すると権限が過剰になる。"
    },
    {
     "id": "ox-2-6-p2-c",
     "lesson": "2-6",
     "text": "KarpenterはEKSのノードを需要に応じて迅速にプロビジョニングするオートスケーラーである。",
     "answer": true,
     "explain": "Cluster Autoscalerの代替として使える。"
    },
    {
     "id": "ox-2-6-p3-a",
     "lesson": "2-6",
     "text": "Lambdaは15分を超える長時間バッチ処理を単一の実行で完了できる。",
     "answer": false,
     "explain": "上限15分。それ以上はFargate/Batch等。"
    },
    {
     "id": "ox-2-6-p3-b",
     "lesson": "2-6",
     "text": "既存の.NETアプリをコンテナ化してECSやEKSへ移行する支援にAWS App2Containerが利用できる。",
     "answer": true,
     "explain": "アプリ検出からコンテナ化、デプロイ成果物生成までを支援。"
    },
    {
     "id": "ox-2-6-p3-c",
     "lesson": "2-6",
     "text": "Fargate Spotは中断が許容されるバッチ処理のコスト削減に適する。",
     "answer": true,
     "explain": "中断に備えてチェックポイント/再実行可能な設計にする。"
    },
    {
     "id": "ox-2-7-p1-a",
     "lesson": "2-7",
     "text": "Oracleのライセンスや機能を維持したままマネージド運用したい場合、Auroraを選ぶのが適切である。",
     "answer": false,
     "explain": "AuroraはMySQL/PostgreSQL互換。Oracleの維持はRDS for Oracle(あるいはRDS Custom)。"
    },
    {
     "id": "ox-2-7-p1-b",
     "lesson": "2-7",
     "text": "作成済みの非暗号化RDSインスタンスを暗号化するには、スナップショットを暗号化コピーして復元する。",
     "answer": true,
     "explain": "既存インスタンスのその場での暗号化は不可。"
    },
    {
     "id": "ox-2-7-p1-c",
     "lesson": "2-7",
     "text": "Aurora Serverless v2は予測が難しい変動負荷に向く。",
     "answer": true,
     "explain": "ACU単位で細かく自動スケールする。"
    },
    {
     "id": "ox-2-7-p2-a",
     "lesson": "2-7",
     "text": "DynamoDBのLSIは、テーブル作成後にいつでも追加できる。",
     "answer": false,
     "explain": "LSIはテーブル作成時のみ定義可能。後から追加できるのはGSI。"
    },
    {
     "id": "ox-2-7-p2-b",
     "lesson": "2-7",
     "text": "DAXは読み取り集中のDynamoDBワークロードにマイクロ秒レイテンシを提供する。",
     "answer": true,
     "explain": "DynamoDB API互換のインメモリキャッシュ。"
    },
    {
     "id": "ox-2-7-p2-c",
     "lesson": "2-7",
     "text": "DynamoDBの1項目の最大サイズは400KBであり、それを超える大きなデータはS3に格納してポインタを保持する設計がよく使われる。",
     "answer": true,
     "explain": "標準的なパターン。"
    },
    {
     "id": "ox-2-7-p3-a",
     "lesson": "2-7",
     "text": "異なるエンジン間のDB移行(例：Oracle→Aurora PostgreSQL)では、スキーマ変換にAWS SCTを併用する。",
     "answer": true,
     "explain": "DMSはデータ移行・CDC、SCTはスキーマ・コードの変換。"
    },
    {
     "id": "ox-2-7-p3-b",
     "lesson": "2-7",
     "text": "Memcachedはレプリケーションと永続化をサポートし、Multi-AZの自動フェイルオーバーが可能である。",
     "answer": false,
     "explain": "それはRedis(Valkey)の特徴。Memcachedはレプリケーション・永続化なし。"
    },
    {
     "id": "ox-2-7-p3-c",
     "lesson": "2-7",
     "text": "Lazy loading戦略では、キャッシュのデータが古くなる可能性がある。",
     "answer": true,
     "explain": "TTLを併用して鮮度を管理する。"
    },
    {
     "id": "ox-2-8-p1-a",
     "lesson": "2-8",
     "text": "Athenaはスキャンしたデータ量に応じて課金されるため、列指向形式(Parquet)とパーティショニングでコストを下げられる。",
     "answer": true,
     "explain": "読み込む量が減る。"
    },
    {
     "id": "ox-2-8-p1-b",
     "lesson": "2-8",
     "text": "Redshiftは大量の小さなOLTPトランザクション処理に最適である。",
     "answer": false,
     "explain": "RedshiftはOLAP向け。OLTPはRDS/Aurora/DynamoDB。"
    },
    {
     "id": "ox-2-8-p1-c",
     "lesson": "2-8",
     "text": "Redshift SpectrumはS3上のデータを、Redshiftクラスターにロードせずにクエリできる。",
     "answer": true,
     "explain": "DWHとデータレイクの横断クエリが可能。"
    },
    {
     "id": "ox-2-8-p2-a",
     "lesson": "2-8",
     "text": "Lake Formationでは、テーブルの列レベルや行レベルでのアクセス制御を一元的に設定できる。",
     "answer": true,
     "explain": "クエリエンジン側がLake Formationの権限を適用する。"
    },
    {
     "id": "ox-2-8-p2-b",
     "lesson": "2-8",
     "text": "Glue Data Catalogは、Glueだけでなく、AthenaやRedshift Spectrumからも参照できる。",
     "answer": true,
     "explain": "共通のメタデータリポジトリとして機能する。"
    },
    {
     "id": "ox-2-8-p2-c",
     "lesson": "2-8",
     "text": "S3バケット内のPII(個人情報)を自動検出するにはGlueクローラーを使う。",
     "answer": false,
     "explain": "PII検出はAmazon Macieの役割。クローラーはスキーマ検出。"
    },
    {
     "id": "ox-2-8-p3-a",
     "lesson": "2-8",
     "text": "Amazon Data Firehoseは、ストリームデータをS3やRedshiftなどへ配信するマネージドサービスである。",
     "answer": true,
     "explain": "バッファリングによるニアリアルタイム配信。"
    },
    {
     "id": "ox-2-8-p3-b",
     "lesson": "2-8",
     "text": "Kinesis Data Streamsは、1シャードあたりの書き込みが1MB/sまたは1,000件/sに制限される。",
     "answer": true,
     "explain": "超える場合はシャード追加またはオンデマンドモード。"
    },
    {
     "id": "ox-2-8-p3-c",
     "lesson": "2-8",
     "text": "既存のApache Kafkaアプリケーションをコード変更を最小にして移行するには、Kinesis Data Streamsが最適である。",
     "answer": false,
     "explain": "Kafka互換のAmazon MSKが適する。"
    },
    {
     "id": "ox-2-9-p1-a",
     "lesson": "2-9",
     "text": "AWSマネージドキーのキーポリシーは、利用者が自由に編集できる。",
     "answer": false,
     "explain": "編集できるのはカスタマーマネージドキー。"
    },
    {
     "id": "ox-2-9-p1-b",
     "lesson": "2-9",
     "text": "CloudFrontで使うACM証明書は、us-east-1リージョンで発行する必要がある。",
     "answer": true,
     "explain": "CloudFront用証明書はバージニア北部のACMに置く。"
    },
    {
     "id": "ox-2-9-p1-c",
     "lesson": "2-9",
     "text": "暗号化EBSスナップショットを別アカウントと共有するには、AWSマネージドキーで暗号化されている必要がある。",
     "answer": false,
     "explain": "共有にはカスタマーマネージドキーで暗号化し、キーポリシーで共有先を許可する。AWSマネージドキーは共有できない。"
    },
    {
     "id": "ox-2-9-p2-a",
     "lesson": "2-9",
     "text": "AWS WAFは、ネットワークロードバランサー(NLB)に直接アタッチしてL7保護を行える。",
     "answer": false,
     "explain": "WAFはALB、CloudFront、API Gateway等が対象。NLBは不可。"
    },
    {
     "id": "ox-2-9-p2-b",
     "lesson": "2-9",
     "text": "AWS Firewall Managerを使うと、Organizations配下の複数アカウントにWAFルールを一元適用できる。",
     "answer": true,
     "explain": "ポリシーで新規アカウント/リソースにも自動適用できる。"
    },
    {
     "id": "ox-2-9-p2-c",
     "lesson": "2-9",
     "text": "Shield Standardは追加料金なしで全AWS顧客に自動適用される。",
     "answer": true,
     "explain": "L3/L4の一般的なDDoSから保護する。"
    },
    {
     "id": "ox-2-9-p3-a",
     "lesson": "2-9",
     "text": "Cognito ユーザープールだけで、ユーザーにAWSリソースへアクセスするための一時的なIAM認証情報を直接付与できる。",
     "answer": false,
     "explain": "AWS認証情報の発行にはCognito IDプールが必要。"
    },
    {
     "id": "ox-2-9-p3-b",
     "lesson": "2-9",
     "text": "Secrets Managerは、RDSの認証情報の自動ローテーションをサポートする。",
     "answer": true,
     "explain": "Lambdaによるローテーション関数を使う。"
    },
    {
     "id": "ox-2-9-p3-c",
     "lesson": "2-9",
     "text": "SCPはアカウントのIAMユーザーに対して権限を付与する。",
     "answer": false,
     "explain": "SCPは許可の上限(ガードレール)を設定するだけで、権限自体を付与しない。"
    },
    {
     "id": "ox-2-10-p1-a",
     "lesson": "2-10",
     "text": "Compute Savings Plansは、EC2だけでなくFargateとLambdaの利用にも適用される。",
     "answer": true,
     "explain": "柔軟性が高い。"
    },
    {
     "id": "ox-2-10-p1-b",
     "lesson": "2-10",
     "text": "RDSの利用料金はCompute Savings Plansで割引できる。",
     "answer": false,
     "explain": "RDSなどのDBサービスはリザーブドインスタンスで割引。"
    },
    {
     "id": "ox-2-10-p1-c",
     "lesson": "2-10",
     "text": "スポットインスタンスは中断の通知が約2分前に行われる。",
     "answer": true,
     "explain": "中断を許容でき、再試行可能な処理に使う。"
    },
    {
     "id": "ox-2-10-p2-a",
     "lesson": "2-10",
     "text": "S3へのアクセスにはゲートウェイ型VPCエンドポイントを使うことで、NAT Gatewayのデータ処理料金を回避できる。",
     "answer": true,
     "explain": "ゲートウェイエンドポイントは追加料金なし。"
    },
    {
     "id": "ox-2-10-p2-b",
     "lesson": "2-10",
     "text": "AZ間のデータ転送はAWSでは無料である。",
     "answer": false,
     "explain": "同一AZ内のプライベートIP通信は無料だが、AZ間は課金される。"
    },
    {
     "id": "ox-2-10-p2-c",
     "lesson": "2-10",
     "text": "インターフェースエンドポイントはS3とDynamoDB専用で、時間課金はない。",
     "answer": false,
     "explain": "S3/DynamoDB用の無料はゲートウェイ型。インターフェース型は時間+データ課金で多数のサービスに対応。"
    },
    {
     "id": "ox-2-10-p3-a",
     "lesson": "2-10",
     "text": "クラスター配置グループは、単一AZ内で低遅延・高スループットのノード間通信を必要とするHPC向けである。",
     "answer": true,
     "explain": "同一AZ内でラックを近接させる。"
    },
    {
     "id": "ox-2-10-p3-b",
     "lesson": "2-10",
     "text": "EFAはTCP通信の一般的なWebアプリのスループットを高めるための機能である。",
     "answer": false,
     "explain": "EFAはHPC/MLのノード間通信(OSバイパス)向け。"
    },
    {
     "id": "ox-2-10-p3-c",
     "lesson": "2-10",
     "text": "Well-Architectedフレームワークの6本柱には持続可能性が含まれる。",
     "answer": true,
     "explain": "2021年末に追加された。"
    }
   ],
   "mc": [
    {
     "id": "mc-2-001",
     "stem": "ある金融会社はオンプレミスのOracleデータベースとWebアプリケーションをAWSへ移行し、東京リージョンで稼働させます。規制対応のため、大阪リージョンへのDR構成が必要です。要件はRTO 15分以内、RPO 5秒以内ですが、通常時のコストは可能な限り抑えたいと考えています。データベースはAurora PostgreSQLへ移行済みで、アプリケーションはAuto Scalingグループ上のEC2で稼働しています。どの構成が要件を最も費用対効果よく満たしますか。",
     "items": [],
     "choices": [
      "東京のAuroraの自動スナップショットを1時間ごとに大阪へコピーし、障害時にスナップショットから復元する。",
      "大阪リージョンにAuroraのクロスリージョンリードレプリカを作成し、ASGは最大台数を東京と同じ設定で常時稼働させる。",
      "大阪リージョンにAurora Global Databaseのセカンダリクラスターを作成し、アプリ層はAMIとCloudFormationテンプレートを準備して、障害時に大阪でスタックを作成する。",
      "大阪リージョンにAurora Global Databaseのセカンダリクラスターと、最小台数に縮小したASGおよびALBを常時稼働させ、障害時にデータベースを昇格しASGを拡張してRoute 53のフェイルオーバーで切り替える。"
     ],
     "answer": 4,
     "explain": [
      "不正解。スナップショットのコピーは1時間ごとのためRPO 5秒を満たせない。",
      "不正解。Auroraは通常のクロスリージョンレプリカよりGlobal Databaseが適切で、フルサイズ常時稼働は不要でコストが高い。",
      "不正解。アプリ層を障害時にゼロから作成すると、RTO 15分以内を満たせない可能性が高い。",
      "正解。Aurora Globalで秒単位のRPO、縮小したアプリ層で分単位のRTO(Warm Standby)を、低コストで実現できる。"
     ],
     "tip": "RPOが秒単位ならストレージレベル複製(Aurora Global)。RTOが分単位ならWarm Standby。コスト条件で「フル構成の常時稼働」は外す。",
     "domain": 2
    },
    {
     "id": "mc-2-002",
     "stem": "グローバルに展開するゲーム企業が、プレイヤーのスコアを保存するバックエンドを設計しています。プレイヤーは世界各地にいて、各リージョンで書き込みを最小のレイテンシで処理し、リージョン障害時にも他リージョンで書き込みを継続できる必要があります。データモデルはキーと値のアクセスが中心で、運用負荷は最小にしたいと考えています。最適な選択はどれですか。",
     "items": [],
     "choices": [
      "Amazon ElastiCache for Redisのグローバルデータストアを使い、全リージョンに書き込む。",
      "Amazon DynamoDBグローバルテーブルを複数リージョンで構成する。",
      "各リージョンにRDS for MySQLを作成し、アプリケーションでデータを同期する。",
      "Amazon Aurora Global Databaseを構成し、書き込みはすべてプライマリリージョンに送る。"
     ],
     "answer": 2,
     "explain": [
      "不正解。グローバルデータストアでは書き込みはプライマリのみで、耐久DBでもない。",
      "正解。マルチリージョン・マルチアクティブで、各リージョンでローカル書き込みができ、フルマネージドで運用負荷が低い。",
      "不正解。アプリケーション側の同期は運用負荷が高く整合性管理も複雑。",
      "不正解。書き込みがプライマリのみのため、要件の各リージョンでの低遅延書き込みを満たさない。"
     ],
     "tip": "「各リージョンでローカル書き込み＋キー/バリュー」はDynamoDB Global Tablesの定番シグナル。",
     "domain": 2
    },
    {
     "id": "mc-2-003",
     "stem": "小売企業のEコマースサイトは、ALBの背後のEC2(Auto Scaling)とRDS for MySQLのMulti-AZ構成で稼働しています。セール時にはレポート機能の重いSELECTクエリによりデータベースのCPUが高騰し、注文処理が遅延します。アプリケーションの大きな変更は避けたいと考えています。コストを抑えつつ最も効果的な対策を2つ選択してください。",
     "items": [],
     "choices": [
      "リードレプリカを作成し、レポート機能の接続先をレプリカのエンドポイントに変更する。",
      "Multi-AZのスタンバイインスタンスにレポートクエリを向ける。",
      "頻繁に参照される結果をElastiCacheにキャッシュする。",
      "RDSインスタンスを別リージョンにコピーして参照させる。",
      "RDSの代わりにDynamoDBにすべてを移行する。"
     ],
     "answers": [
      1,
      3
     ],
     "select": 2,
     "explain": [
      "正解。読み取りトラフィックを分離でき、変更は接続先のみ。",
      "不正解。インスタンス型Multi-AZのスタンバイは読み取り不可。",
      "正解。繰り返しの読み取りをキャッシュすることでDB負荷を低減できる。",
      "不正解。レイテンシ・コストが増え、同期の遅延も課題。",
      "不正解。大規模な再設計が必要で、「大きな変更を避ける」という要件に反する。"
     ],
     "tip": "select数が指定されたら必ずその数だけ選ぶ。「Multi-AZ＝読み取りスケール」は典型的な罠。",
     "domain": 2
    },
    {
     "id": "mc-2-004",
     "stem": "ある企業は、ユーザーがアップロードした画像をS3に保存し、サムネイル作成と3種類のメタデータ抽出(それぞれ独立したチーム管理のシステム)を行います。アップロードは日中に急増し、処理の一部が失敗しても他の処理に影響させたくありません。失敗したイベントは後で再処理できる必要があります。最も疎結合で耐障害性の高い設計はどれですか。",
     "items": [],
     "choices": [
      "S3イベント通知から1つのLambdaを呼び出し、その中で全処理を順番に実行する。",
      "S3からEventBridgeへのイベントを1つのLambdaで受け、失敗時はログに記録するだけにする。",
      "S3イベントでEC2上のアプリを呼び出し、ローカルでキューを管理する。",
      "S3イベントをSNSトピックに送信し、処理ごとに専用のSQSキュー(DLQ付き)をサブスクライブして、各キューからコンシューマが処理する。"
     ],
     "answer": 4,
     "explain": [
      "不正解。単一障害点で、1処理の失敗が全体に波及する。",
      "不正解。再処理の仕組みがなく、疎結合でもない。",
      "不正解。可用性が低く運用負荷が高い。",
      "正解。SNS+SQSのファンアウトで独立処理・バッファリング・DLQによる再処理が実現できる。"
     ],
     "tip": "「複数の独立した処理」「一部の失敗が影響しない」「再処理」→SNS+SQS(+DLQ)ファンアウト。",
     "domain": 2
    },
    {
     "id": "mc-2-005",
     "stem": "ある会社はS3バケットに保存した多数の顧客ドキュメントを、規制により7年間、いかなるユーザー(root含む)も削除・変更できない状態で保管する必要があります。最初の1年間は月に数回のアクセスがあり、その後はほぼアクセスされません。コストを最小化するソリューションを選択してください。",
     "items": [],
     "choices": [
      "S3 Object Lockをコンプライアンスモードで7年に設定し、ライフサイクルルールで1年後にGlacier Deep Archiveへ移行する。",
      "S3バージョニングを有効化し、MFA Deleteを設定してStandard-IAに保存する。",
      "バケットポリシーで削除を拒否し、Intelligent-Tieringを使用する。",
      "S3 Object Lockをガバナンスモードで設定し、1年後にGlacier Flexible Retrievalへ移行する。"
     ],
     "answer": 1,
     "explain": [
      "正解。コンプライアンスモードはrootでも保持期間中は削除不可。ほぼ未アクセスならDeep Archiveが最安。",
      "不正解。MFA DeleteではMFA保有者が削除でき、要件を満たさない。",
      "不正解。バケットポリシーはrootのポリシー変更で解除でき、不変性を保証しない。",
      "不正解。ガバナンスモードは特別な権限を持つユーザーが解除できる。"
     ],
     "tip": "「rootでも削除不可」＝Object Lockコンプライアンスモード(またはVault Lock)。長期低頻度＋コスト最小＝Glacier系。",
     "domain": 2
    },
    {
     "id": "mc-2-006",
     "stem": "あるメディア会社が、世界中の視聴者へ動画ファイルを配信しています。動画はS3に保存され、有料会員のみがアクセスできるようにする必要があります。S3バケットへ直接アクセスされないようにし、視聴者ごとに期限付きでアクセスを許可したいと考えています。複数のファイルにまたがるHLS形式の配信です。最適な構成はどれですか。",
     "items": [],
     "choices": [
      "S3の署名付きURLを使い、バケットはパブリックにする。",
      "CloudFrontの署名付きURLを1ファイルずつ発行し、HLSのセグメントごとにURLを書き換える。",
      "Global Acceleratorを使用し、S3バケットポリシーでIP制限を行う。",
      "CloudFrontを前面に置き、OACでS3への直接アクセスを禁止し、CloudFrontの署名付きCookieで会員に期限付きアクセスを許可する。"
     ],
     "answer": 4,
     "explain": [
      "不正解。バケットをパブリックにすると直接アクセスを防げない。",
      "不正解。HLSは多数のファイルで、URL個別発行は非現実的。Cookieが適切。",
      "不正解。GAはS3を直接エンドポイントにできずキャッシュもしない。",
      "正解。OACで直接アクセス禁止、複数ファイル(HLSセグメント)には署名付きCookieが適する。"
     ],
     "tip": "「複数ファイル/URLを変えたくない」→署名付きCookie。「単一ファイル」→署名付きURL。",
     "domain": 2
    },
    {
     "id": "mc-2-007",
     "stem": "ある企業がWindowsベースのアプリケーションサーバー群で使うファイル共有基盤をAWSに移行します。ファイル共有はActive Directoryによる認証とNTFSのアクセス許可、DFS名前空間を使用しています。AZ障害に耐える高可用性が必要で、運用管理は最小限にしたいと考えています。最適なソリューションはどれですか。",
     "items": [],
     "choices": [
      "Amazon EFSを作成し、各サーバーにNFSでマウントする。",
      "Amazon FSx for Windows File ServerをMulti-AZ構成で作成し、AWS Managed Microsoft ADまたは既存ADに参加させる。",
      "EC2上にWindows Serverのファイルサーバーを構築し、EBSでデータを保存する。",
      "Amazon FSx for Lustreを作成し、S3バケットと連携する。"
     ],
     "answer": 2,
     "explain": [
      "不正解。EFSはNFS(Linux)専用でAD/NTFS要件を満たさない。",
      "正解。SMB・AD統合・NTFS・DFS対応のフルマネージドでMulti-AZにも対応。",
      "不正解。可用性構成や運用の負担が大きい。",
      "不正解。LustreはHPC向けでWindows SMB/AD要件に合わない。"
     ],
     "tip": "Windows＋AD＋SMB＝FSx for Windows。Multi-AZ指定の有無を確認。",
     "domain": 2
    },
    {
     "id": "mc-2-008",
     "stem": "ある企業のアプリケーションはAPI Gateway(REST)からLambdaを呼び出して注文を処理し、Lambdaはさらに外部の決済APIを呼びます。決済APIの応答が遅く、ピーク時にAPIのタイムアウトが発生し、顧客が重複して注文ボタンを押してしまう問題が出ています。注文受付の信頼性を高め、重複処理を避けたいと考えています。最適な改善策はどれですか。",
     "items": [],
     "choices": [
      "Lambdaのプロビジョニング済み同時実行を増やす。",
      "API GatewayからSQS(FIFOキュー)へ直接統合して注文を受け付け即時に応答し、Lambdaがキューを処理して、冪等キーで重複を排除する。",
      "API Gatewayの前段にCloudFrontを置いて応答をキャッシュする。",
      "LambdaのタイムアウトとAPI Gatewayのタイムアウトを延ばす。"
     ],
     "answer": 2,
     "explain": [
      "不正解。コールドスタート対策であり、外部APIの遅さは解決しない。",
      "正解。受付を非同期化し即応答、FIFO・冪等性で重複を排除。外部APIの遅延から分離できる。",
      "不正解。POSTの注文処理はキャッシュできない。",
      "不正解。待ち時間が長くなり根本解決にならず、重複注文も防げない。"
     ],
     "tip": "外部依存の遅延＋重複→非同期化(SQS)＋冪等性。タイムアウト延長は答えになりにくい。",
     "domain": 2
    },
    {
     "id": "mc-2-009",
     "stem": "ある企業がバッチ処理のワークフローをAWSで構築します。ワークフローは、データ検証、複数の並列変換、人による承認(最大3日待ち)、その後の本番ロードで構成されます。各ステップの失敗時はリトライし、最終的に失敗した場合は補償処理を実行する必要があります。サーバー管理は避けたいと考えています。最適な選択はどれですか。",
     "items": [],
     "choices": [
      "AWS Step Functions Expressワークフローを使用する。",
      "Lambda関数から別のLambda関数を順番に呼び出す。",
      "AWS Step Functions Standardワークフローで、Lambda/SDK統合と承認待ち(タスクトークン)を実装する。",
      "EC2上のcronでシェルスクリプトを実行する。"
     ],
     "answer": 3,
     "explain": [
      "不正解。Expressは最長5分で3日の待機は不可。",
      "不正解。待機できず、エラーハンドリングも複雑で課金も無駄。",
      "正解。Standardは最長1年、人手承認のコールバック、エラー処理(Retry/Catch)・補償にも対応。",
      "不正解。サーバー管理が必要。"
     ],
     "tip": "「長時間・人手承認」→Step Functions Standard。Expressは5分まで。",
     "domain": 2
    },
    {
     "id": "mc-2-010",
     "stem": "SaaS企業がマルチテナントのWebアプリケーションをEKS上で運用しています。各テナントのPodがS3の特定プレフィックスのみにアクセスできるよう、最小権限を実現したいと考えています。ノードのIAMロールは全Podで共有されるため、権限が過剰になるという監査指摘を受けました。最小の運用負荷で指摘に対応できる方法はどれですか。",
     "items": [],
     "choices": [
      "S3バケットをテナントごとにパブリックにし、クエリ文字列で認可する。",
      "IRSAまたはEKS Pod Identityを使い、テナントごとのサービスアカウントに専用のIAMロールを関連付ける。",
      "ノードのIAMロールにすべてのテナントのS3権限を追加する。",
      "Podごとに長期のIAMユーザーアクセスキーを発行してSecrets Managerに保存する。"
     ],
     "answer": 2,
     "explain": [
      "不正解。セキュリティ上不適切。",
      "正解。Pod単位に一時認証情報で最小権限を付与できる。",
      "不正解。権限がさらに過剰になる。",
      "不正解。長期キーは漏えい・ローテーションの課題がある。"
     ],
     "tip": "EKSのPod単位権限＝IRSA/Pod Identity。長期アクセスキーの選択肢は基本的に誤り。",
     "domain": 2
    },
    {
     "id": "mc-2-011",
     "stem": "ある企業はS3に保存された数百TBのログデータを、データアナリストがアドホックなSQLで調べられるようにしたいと考えています。クエリの頻度は低く、事前のインフラ管理は避けたいと考えています。さらに、部門ごとに参照できる列と行を制限する必要があります。最適な構成はどれですか。",
     "items": [],
     "choices": [
      "Glue Data CatalogとAthenaを使い、Lake Formationで列・行レベルの権限を部門別に付与する。",
      "EMRクラスターを常時稼働させ、Hiveで集計する。",
      "OpenSearch Serviceに全ログを取り込み、ロールで制限する。",
      "データをRedshiftクラスターにロードし、ビューで制限する。"
     ],
     "answer": 1,
     "explain": [
      "正解。サーバーレスでS3を直接クエリ、Lake Formationで列/行レベルの一元制御ができる。",
      "不正解。常時稼働は運用/コスト負荷が高い。",
      "不正解。SQLのアドホック分析には最適でなく、コストも高い。",
      "不正解。低頻度のため常時稼働DWHはコスト効率が悪い。"
     ],
     "tip": "「S3上＋低頻度アドホック＋サーバーレス」＝Athena。「列・行レベルの制御」＝Lake Formation。",
     "domain": 2
    },
    {
     "id": "mc-2-012",
     "stem": "ある企業のIoTプラットフォームは、数万台のデバイスが毎秒データを送信します。データは (1) リアルタイムの異常検知と (2) S3への長期保存(Parquet形式)の両方に使われます。複数のチームが同じストリームを独立して読み取りたい場合があります。運用負荷を抑えた構成を選択してください。",
     "items": [],
     "choices": [
      "Kinesis Data Streamsに取り込み、Managed Service for Apache Flinkで異常検知し、Amazon Data FirehoseでParquet変換してS3に配信する。",
      "デバイスから直接S3へPUTして、Lambdaで定期的に処理する。",
      "Kinesis Data Firehoseのみを使用し、異常検知もFirehoseで行う。",
      "デバイスからSQS標準キューに送信し、2つのコンシューマが同じキューを読む。"
     ],
     "answer": 1,
     "explain": [
      "正解。複数コンシューマが読めるストリーム、リアルタイム分析、Parquet変換付きのS3配信をすべて満たす。",
      "不正解。リアルタイム性に欠ける。",
      "不正解。Firehoseは配信サービスでリアルタイム分析はできない。",
      "不正解。メッセージは1つのコンシューマにしか配信されず、複数チームの独立した読み取りに向かない。"
     ],
     "tip": "複数コンシューマ・順序・リアルタイム→Kinesis Data Streams。S3への加工配信→Firehose。",
     "domain": 2
    },
    {
     "id": "mc-2-013",
     "stem": "あるWebアプリケーションがALBの背後で稼働し、SQLインジェクション攻撃と特定のIPアドレスからの大量リクエストによる負荷に悩まされています。さらに、大規模DDoS攻撃時のコスト急増に備えたいと考えています。これらすべてに対処する最適な組み合わせを2つ選択してください。",
     "items": [],
     "choices": [
      "AWS WAFをALBに関連付け、マネージドルールとレートベースルールを設定する。",
      "セキュリティグループで特定IPを拒否ルールに追加する。",
      "AWS Shield Advancedを有効にしてALBを保護対象に登録する。",
      "Network Load BalancerにWAFをアタッチする。",
      "VPCフローログを有効にする。"
     ],
     "answers": [
      1,
      3
     ],
     "select": 2,
     "explain": [
      "正解。SQLi対策とレート制限を提供する。",
      "不正解。セキュリティグループに拒否ルールは作れない。",
      "正解。高度なDDoS保護、DRT支援、コスト急増の保護がある。",
      "不正解。NLBにはWAFをアタッチできない。",
      "不正解。可視化のみで防御にならない。"
     ],
     "tip": "SQLi＝WAF、DDoS＋コスト保護＝Shield Advanced。SGは拒否ルールを持たない。",
     "domain": 2
    },
    {
     "id": "mc-2-014",
     "stem": "ある企業は、規制によりリージョン内でも暗号化キーの素材を自社で厳格に管理し、専有のハードウェアセキュリティモジュールで暗号化操作を実施する必要があります。アプリケーションはEC2上で稼働し、標準的なAWSサービスの暗号化統合(S3、EBS)も利用したいと考えています。運用負荷を抑えつつ要件を満たす方法はどれですか。",
     "items": [],
     "choices": [
      "AWS KMSのAWSマネージドキーを使用する。",
      "EC2にソフトウェアHSMをインストールする。",
      "AWS CloudHSMクラスターを作成し、KMSのカスタムキーストアとして構成して、CloudHSM内のキーでS3やEBSを暗号化する。",
      "S3のSSE-S3を使用する。"
     ],
     "answer": 3,
     "explain": [
      "不正解。専有HSMの要件を満たさない。",
      "不正解。専有ハードウェアではなく、運用負荷が高い。",
      "正解。専有HSMとKMS統合を両立でき、S3/EBSのSSE-KMS統合も使える。",
      "不正解。キー管理はAWSが行い要件に合わない。"
     ],
     "tip": "「専有HSM」「シングルテナント」→CloudHSM。AWSサービス統合も欲しいならKMSカスタムキーストア。",
     "domain": 2
    },
    {
     "id": "mc-2-015",
     "stem": "ある企業は、世界中のユーザーが利用するTCPベースのリアルタイムコミュニケーションアプリを東京とフランクフルトのNLB背後で運用しています。クライアント側のファイアウォールで許可するため固定IPアドレスが必要で、リージョン障害時には30秒以内に別リージョンへ切り替えたいと考えています。DNSキャッシュに依存しない方法を選択してください。",
     "items": [],
     "choices": [
      "CloudFrontディストリビューションを作成し、両NLBをオリジンにする。",
      "Route 53のフェイルオーバールーティングでTTLを1秒に設定する。",
      "各NLBにElastic IPを割り当て、クライアントに両方のIPを通知する。",
      "AWS Global Acceleratorを作成し、両リージョンのNLBをエンドポイントとして登録する。"
     ],
     "answer": 4,
     "explain": [
      "不正解。CloudFrontは固定IPを提供せず、TCP任意プロトコルのアプリに向かない。",
      "不正解。固定IPを提供せず、TTLを無視するクライアントやリゾルバのキャッシュの影響を受ける。",
      "不正解。クライアント側の切替実装が必要で自動フェイルオーバーにならない。",
      "正解。固定のAnycast IPとヘルスチェックによる高速フェイルオーバーでDNSに依存しない。"
     ],
     "tip": "固定IP＋非HTTP＋DNS非依存の素早い切替＝Global Accelerator。",
     "domain": 2
    },
    {
     "id": "mc-2-016",
     "stem": "ある企業のレガシーアプリは、EC2インスタンス内にユーザーのセッション情報を保持しています。Auto Scalingによるスケールイン時にユーザーがログアウトされる問題が発生し、また1つのインスタンス障害でセッションが失われます。コードの変更は最小限に抑えつつ、可用性を向上させたいと考えています。最適な解決策はどれですか。",
     "items": [],
     "choices": [
      "ALBのスティッキーセッションを有効にする。",
      "ASGの最小台数を増やしてスケールインを防ぐ。",
      "セッションデータをインスタンスストアに保存する。",
      "セッションデータをElastiCache for Redis(Multi-AZ)に外出しする。"
     ],
     "answer": 4,
     "explain": [
      "不正解。スケールインやインスタンス障害時にはセッションは失われる。",
      "不正解。コストが増え、障害時の消失は解決しない。",
      "不正解。インスタンス終了で消失する。",
      "正解。ステートレス化により、どのインスタンスが落ちてもセッションを維持できる。"
     ],
     "tip": "セッション保持の問題＝状態の外出し(ElastiCache/DynamoDB)。スティッキーは障害耐性を高めない。",
     "domain": 2
    },
    {
     "id": "mc-2-017",
     "stem": "ある企業は、1日1回の夜間バッチで数千のEC2スポットインスタンスを使用して解析ジョブを実行しています。ジョブは再実行可能で、中断を許容できますが、全体で6時間以内に完了する必要があります。スポットの容量不足による中断が頻繁に起き、完了が遅れることがあります。コスト効率を維持しつつ信頼性を高める方法を2つ選択してください。",
     "items": [],
     "choices": [
      "複数のインスタンスファミリー・サイズ・AZを指定し、capacity-optimized割り当て戦略を使用する。",
      "すべてオンデマンドインスタンスに切り替える。",
      "ジョブの途中結果をS3などにチェックポイントとして保存し、中断時は再開できるようにする。",
      "単一のインスタンスタイプでスポットリクエストを固定する。",
      "リザーブドインスタンスを数千台購入する。"
     ],
     "answers": [
      1,
      3
     ],
     "select": 2,
     "explain": [
      "正解。多様化と容量の深いプールを選択することで中断を減らせる。",
      "不正解。コスト効率が失われる。",
      "正解。中断時の再実行コストを減らせる。",
      "不正解。中断リスクが高まる。",
      "不正解。1日1回のバッチには稼働率が低く、コスト効率が悪い。"
     ],
     "tip": "スポット対策＝多様化(複数タイプ/AZ)＋capacity-optimized＋チェックポイント。",
     "domain": 2
    },
    {
     "id": "mc-2-018",
     "stem": "ある企業のプライベートサブネットにあるEC2インスタンス群が、毎日数十TBのデータをS3へアップロードしています。インターネットゲートウェイへのトラフィックはNAT Gateway経由で、データ処理料金が非常に高額になっています。セキュリティ要件としてトラフィックはAWSネットワーク内に留めたいと考えています。最もコスト効率の高い解決策はどれですか。",
     "items": [],
     "choices": [
      "Direct Connectを導入する。",
      "インターフェース型VPCエンドポイント(PrivateLink)をS3用に作成する。",
      "NAT Gatewayを増やして負荷分散する。",
      "S3用のゲートウェイ型VPCエンドポイントを作成し、プライベートサブネットのルートテーブルに追加する。"
     ],
     "answer": 4,
     "explain": [
      "不正解。AWS内のEC2→S3通信に不要で高コスト。",
      "不正解。S3のインターフェースエンドポイントは時間とデータ処理で課金され、要件に対してゲートウェイ型より高コスト。",
      "不正解。NATのコストが増える。",
      "正解。ゲートウェイ型は追加料金なしでNATを経由せずAWSネットワーク内で転送できる。"
     ],
     "tip": "EC2→S3/DynamoDBでNAT料金が問題→ゲートウェイ型VPCエンドポイント(無料)。",
     "domain": 2
    },
    {
     "id": "mc-2-019",
     "stem": "ある企業は、既存のオンプレミスMySQLデータベース(3TB)をAurora MySQLに移行します。業務は24時間稼働しており、切り替え時のダウンタイムは5分以内にする必要があります。ネットワークはDirect Connectで接続済みです。最も適切な移行方法はどれですか。",
     "items": [],
     "choices": [
      "mysqldumpでエクスポートし、停止してAuroraにインポートする。",
      "AWS DMSで初回フルロードと継続的なCDCレプリケーションを実施し、同期完了後にアプリケーションを切り替える。",
      "Snowball Edgeでデータをコピーし、Auroraに復元する。",
      "AWS SCTでスキーマ変換のみを実施して切り替える。"
     ],
     "answer": 2,
     "explain": [
      "不正解。3TBのダンプ/インポートで長時間のダウンタイムが発生する。",
      "正解。CDCにより変更を継続的に同期でき、切り替え時のダウンタイムを最小化できる。",
      "不正解。オフライン転送で停止時間の要件を満たさず、継続的な差分同期もない。",
      "不正解。同種のMySQL→Aurora MySQLではSCTは不要で、データ移行にならない。"
     ],
     "tip": "ダウンタイム最小＝DMS(フルロード＋CDC)。同種移行ならSCTは必須ではない。",
     "domain": 2
    },
    {
     "id": "mc-2-020",
     "stem": "ある企業は、世界各地のユーザーが利用する静的なWebサイトをS3でホストしています。レイテンシを削減し、S3バケットを直接公開せずにアクセスさせ、独自ドメインでHTTPS配信したいと考えています。ACM証明書を使用します。必要な構成はどれですか。",
     "items": [],
     "choices": [
      "ALBを作成してS3をターゲットに設定し、ACM証明書をALBにアタッチする。",
      "Global AcceleratorにS3バケットをエンドポイントとして登録する。",
      "CloudFrontを前面に置いてOACでS3を保護し、ACM証明書をバージニア北部(us-east-1)で発行してCloudFrontに関連付ける。",
      "S3静的ウェブサイトホスティングを有効化しバケットをパブリックにし、ACM証明書をS3にアタッチする。"
     ],
     "answer": 3,
     "explain": [
      "不正解。ALBのターゲットにS3は設定できない。",
      "不正解。GAはS3を直接エンドポイントにできない。",
      "正解。CloudFrontでキャッシュ、OACでバケットを非公開にし、証明書はus-east-1で発行する。",
      "不正解。S3ウェブサイトエンドポイントはHTTPSをサポートせず、ACMの直接アタッチはできない。"
     ],
     "tip": "S3静的サイト＋HTTPS＋独自ドメイン＝CloudFront+OAC+ACM(us-east-1)。",
     "domain": 2
    },
    {
     "id": "mc-2-021",
     "stem": "ある企業のアプリケーションは、DynamoDBテーブルに商品情報を保存しており、読み取りが全体の95%を占め、同じ商品の読み取りが集中しています。ピーク時にReadThrottleが発生しています。アプリケーションコードの変更を最小限にして、読み取りレイテンシをマイクロ秒単位に改善する必要があります。最適な解決策はどれですか。",
     "items": [],
     "choices": [
      "ElastiCache for Redisを導入し、アプリでキャッシュロジックを実装する。",
      "DynamoDB Accelerator(DAX)クラスターを作成し、アプリケーションをDAXクライアントに変更する。",
      "DynamoDBの読み取りキャパシティを大幅に増やす。",
      "グローバルセカンダリインデックスを追加する。"
     ],
     "answer": 2,
     "explain": [
      "不正解。実現可能だがキャッシュロジックの実装が必要で、変更が大きい。",
      "正解。API互換のインメモリキャッシュで、最小限の変更でマイクロ秒の読み取りを実現する。",
      "不正解。マイクロ秒の遅延にはならず、コストが増加する。",
      "不正解。同じ項目の読み取り集中を解決しない。"
     ],
     "tip": "DynamoDB＋読み取り集中＋コード変更最小＋マイクロ秒＝DAX。",
     "domain": 2
    },
    {
     "id": "mc-2-022",
     "stem": "あるヘルスケア企業は、複数のAWSアカウント(AWS Organizations)にまたがる機密データに対し、すべてのS3バケットでKMSによる暗号化を強制し、暗号化されていないオブジェクトのアップロードを防止したいと考えています。管理者が個別アカウントでポリシーを変更しても回避できないようにする必要があります。最適な方法はどれですか。",
     "items": [],
     "choices": [
      "OrganizationsのSCPで、x-amz-server-side-encryptionがaws:kmsでないs3:PutObjectを拒否する。",
      "AWS Configでチェックし、メールで通知する。",
      "各アカウントのS3バケットにバケットポリシーを手動で設定する。",
      "IAMユーザーの権限境界を各アカウントで設定する。"
     ],
     "answer": 1,
     "explain": [
      "正解。SCPはアカウント管理者でも回避できないガードレール。",
      "不正解。検出のみで、アップロードを防止しない。",
      "不正解。管理者が変更でき、強制力が弱い。",
      "不正解。ユーザー/ロール単位で、全アカウントで強制する方法ではなく変更も可能。"
     ],
     "tip": "「管理者でも回避不可」「組織全体」＝SCP。Configは検出、SCPは予防。",
     "domain": 2
    },
    {
     "id": "mc-2-023",
     "stem": "ある企業のAuroraデータベースクラスターに、Lambda関数から多数の短命な接続が発生し、フェイルオーバー時に接続エラーが多発し、「Too many connections」エラーも出ています。アプリケーションの変更を最小限にして、接続管理を改善し、フェイルオーバー時間を短縮したいと考えています。最適な解決策はどれですか。",
     "items": [],
     "choices": [
      "Aurora Serverless v1に移行する。",
      "Lambdaの同時実行数を1に制限する。",
      "RDS Proxyを作成し、Lambda関数の接続先をProxyのエンドポイントに変更する。",
      "Auroraのインスタンスクラスを大きくする。"
     ],
     "answer": 3,
     "explain": [
      "不正解。接続問題の根本解決にならず、移行負荷も大きい。",
      "不正解。スループットが著しく低下する。",
      "正解。接続プールで接続を集約し、フェイルオーバー時の接続維持により復旧時間も短縮できる。",
      "不正解。接続数の根本原因(接続管理)は解決せず、フェイルオーバーも改善しない。"
     ],
     "tip": "Lambda×RDS/Aurora＋接続枯渇＝RDS Proxy。",
     "domain": 2
    },
    {
     "id": "mc-2-024",
     "stem": "ある企業のゲームバックエンドはKinesis Data Streamsに書き込んでおり、特定のゲームIDにトラフィックが集中して一部のシャードで ProvisionedThroughputExceededException が頻発しています。他のシャードにはほぼ空きがあります。この問題を解決する最も適切な方法は何ですか。",
     "items": [],
     "choices": [
      "パーティションキーをゲームIDにランダムなサフィックスを付加した形に変更して、データを均等に分散する。",
      "コンシューマにEFOを有効にする。",
      "ストリームの保持期間を365日に延長する。",
      "ストリーム全体をFirehoseに置き換える。"
     ],
     "answer": 1,
     "explain": [
      "正解。ホットシャードはパーティションキーの偏りが原因。キーを分散させる。",
      "不正解。EFOは読み取り側の改善で、書き込みのホットシャードには効かない。",
      "不正解。書き込みスループットの問題は解決しない。",
      "不正解。根本的な分散の問題ではなく、要件にも影響する。"
     ],
     "tip": "ProvisionedThroughputExceeded＋一部シャードのみ＝ホットパーティション→キー設計の見直し。",
     "domain": 2
    },
    {
     "id": "mc-2-025",
     "stem": "ある企業は、リージョン内の3つのAZでASGを使いWebアプリケーションを運用しています。ELBヘルスチェックはHTTP 200を確認します。最近、アプリケーションがハングし、インスタンスのステータスチェックは正常なのにリクエストに応答しない状態が発生しましたが、ASGはインスタンスを置き換えませんでした。この問題の原因と解決策として最も適切なものはどれですか。",
     "items": [],
     "choices": [
      "ASGのヘルスチェックタイプをELBに変更する。",
      "クールダウン期間を延長する。",
      "ターゲット追跡のCPU目標値を引き下げる。",
      "ASGの最小台数を増やす。"
     ],
     "answer": 1,
     "explain": [
      "正解。ASGがEC2ヘルスチェックのままだと、アプリレベルの異常を検知しない。ELBタイプで置換できる。",
      "不正解。置換の判断には影響しない。",
      "不正解。スケーリングの感度であり、ヘルス判定とは別。",
      "不正解。異常なインスタンスは置換されない。"
     ],
     "tip": "「インスタンスは正常なのにアプリが応答しない」＝ASGのヘルスチェックをELBに。",
     "domain": 2
    },
    {
     "id": "mc-2-026",
     "stem": "ある企業は、東京リージョンのALB・ECS(Fargate)・Aurora MySQLで稼働する決済アプリケーションのDR要件を見直しています。ビジネス要件は「リージョン障害時にもRTOは4時間、RPOは1時間以内。DRのコストは最小化」です。現在はAuroraのみ東京にあり、DRの仕組みはありません。最もコスト効率の高いDR戦略を選択してください。",
     "items": [],
     "choices": [
      "Multi-site Active/Activeで両リージョンを常時フル稼働させる。",
      "Warm Standbyとして大阪に縮小版アプリとAuroraのグローバルセカンダリを常時稼働させる。",
      "Pilot LightとしてAuroraのクロスリージョンレプリカとフル台数のFargateタスクを待機させる。",
      "Backup and Restoreとして、AWS Backupで1時間ごとのクロスリージョンコピーを取得し、障害時にIaCで大阪にスタックを作成して復元する。"
     ],
     "answer": 4,
     "explain": [
      "不正解。要件に対して過剰でコストが最大。",
      "不正解。要件に対して過剰。RTOが4時間ならより安価な戦略で足りる。",
      "不正解。フル台数の待機はPilot Lightではなくコストも高い。",
      "正解。RTO 4時間/RPO 1時間はBackup & Restoreで満たせる最安の戦略。バックアップ頻度を1時間にする。"
     ],
     "tip": "RTO/RPOが時間単位なら最安のBackup & Restoreを疑う。過剰な戦略は「コスト最小」で不正解になる。",
     "domain": 2
    },
    {
     "id": "mc-2-027",
     "stem": "ある企業は、S3バケットに保存されたデータを大阪リージョンへレプリケーションしていますが、コンプライアンス要件で「アップロードされたオブジェクトの大半が15分以内に複製されること」を証明する必要があります。さらに、レプリケーション設定前から存在する数億オブジェクトも複製する必要があります。必要な対応を2つ選択してください。",
     "items": [],
     "choices": [
      "CRRルールでS3 Replication Time Control(RTC)を有効にし、レプリケーションメトリクスを監視する。",
      "S3バッチレプリケーションを使用して、既存のオブジェクトを複製する。",
      "CRRを一度無効にして再度有効にすれば、既存のオブジェクトは自動的に複製される。",
      "Transfer Accelerationを有効にする。",
      "S3 Standard-IAにライフサイクルで移行する。"
     ],
     "answers": [
      1,
      2
     ],
     "select": 2,
     "explain": [
      "正解。RTCは15分以内に99.99%を複製するSLAとメトリクスを提供する。",
      "正解。既存オブジェクトにはバッチレプリケーションが必要。",
      "不正解。既存のオブジェクトは自動複製されない。",
      "不正解。クライアントからのアップロード高速化であり、レプリケーションとは無関係。",
      "不正解。レプリケーション時間と無関係。"
     ],
     "tip": "「15分」＝RTC、「既存オブジェクト」＝バッチレプリケーション。",
     "domain": 2
    },
    {
     "id": "mc-2-028",
     "stem": "ある企業は、オンプレミスのNFSストレージ(200TB)をAWSへ移行します。回線はDirect Connect 1Gbpsですが、既存アプリケーションは移行期間中もオンプレミスで稼働を続け、NFSサーバーのデータは頻繁に更新されます。移行はできるだけ短い期間で、データ整合性を検証しながら行いたいと考えています。最適な方法はどれですか。",
     "items": [],
     "choices": [
      "AWS DataSyncエージェントをオンプレミスに配置し、定期スケジュールで差分同期を行い、切り替え時に最終同期を実行する。",
      "rsyncをEC2から実行する。",
      "S3 Transfer Accelerationでアップロードする。",
      "Snowball Edgeで全データをコピーし、移行完了後にアプリケーションを切り替える。"
     ],
     "answer": 1,
     "explain": [
      "正解。DataSyncは増分転送・整合性検証・スケジュールをサポートし、NFSに対応する。",
      "不正解。自前運用で検証・スケールの面で劣る。",
      "不正解。NFSサーバーからの直接利用はできず、適した方法でない。",
      "不正解。オフライン転送後の差分更新を同期する仕組みが別途必要になる。"
     ],
     "tip": "オンラインで差分同期＋検証が必要＝DataSync。Snowballは回線が不足するオフライン転送。",
     "domain": 2
    },
    {
     "id": "mc-2-029",
     "stem": "ある企業のマイクロサービスアーキテクチャでは、注文イベントを複数のサービス(在庫、請求、通知)に配信します。各サービスは異なるAWSアカウントに存在し、イベントの内容(注文金額や地域)に基づいて異なるサービスにのみ配信したいと考えています。また、障害からの復旧のために過去7日分のイベントを再生できる必要があります。最適な設計はどれですか。",
     "items": [],
     "choices": [
      "API Gatewayから各サービスのHTTPエンドポイントを順番に呼び出す。",
      "EventBridgeのカスタムイベントバスにイベントを送信し、ルールでコンテンツベースにフィルタリングして別アカウントのバスやターゲットに転送し、アーカイブを有効にしてリプレイする。",
      "Kinesis Data Streamsに書き込み、各サービスがポーリングする。",
      "SNSトピックに発行し、各サービスのSQSにサブスクライブする。"
     ],
     "answer": 2,
     "explain": [
      "不正解。密結合で、リプレイもできない。",
      "正解。ルールによるコンテンツベース配信、クロスアカウントのバス、アーカイブ&リプレイの3要件を満たす。",
      "不正解。コンテンツベースのルーティングやクロスアカウント配信の要件に適合しない。",
      "不正解。SNSのフィルターポリシーは使えるが、過去イベントのアーカイブ/リプレイが標準提供でない。"
     ],
     "tip": "「コンテンツベースのルーティング＋リプレイ＋クロスアカウント」＝EventBridge。",
     "domain": 2
    },
    {
     "id": "mc-2-030",
     "stem": "ある企業はAmazon Redshiftで分析を実行しており、S3に保存された過去10年分(数PB)のデータへ時々クエリを実行する必要があります。このデータをRedshiftにロードするとコストが高くなりますが、既存のRedshiftのテーブルとJOINしたいと考えています。最もコスト効率の高い方法はどれですか。",
     "items": [],
     "choices": [
      "Athenaで結果を出力して手動で結合する。",
      "EMRで全データを処理し、結果をRedshiftにロードする。",
      "Redshift Spectrumを使用して、Glue Data Catalogに登録したS3データを外部テーブルとしてクエリし、Redshiftテーブルと結合する。",
      "すべてのデータをRedshiftにCOPYする。"
     ],
     "answer": 3,
     "explain": [
      "不正解。手作業が多く、運用効率が悪い。",
      "不正解。運用と費用が大きい。",
      "正解。S3データをロードせずにクエリでき、ローカルテーブルとのJOINも可能。",
      "不正解。ストレージ/コンピュートコストが高い。"
     ],
     "tip": "「S3データをロードせずにRedshiftのテーブルとJOIN」＝Redshift Spectrum。",
     "domain": 2
    },
    {
     "id": "mc-2-031",
     "stem": "あるアプリケーションは、AWS Lambdaで画像処理を行い、結果をDynamoDBに保存します。Lambdaは1つのVPCプライベートサブネット内のRDSにもアクセスします。最近のトラフィック増加で、Lambdaの同時実行数が上限に達し、別の重要なLambda関数(決済処理)がスロットリングされています。決済処理関数を保護しつつ、画像処理関数の暴走も抑制する最適な方法を選択してください。",
     "items": [],
     "choices": [
      "画像処理関数のメモリを増やす。",
      "決済処理関数をVPC外に移動する。",
      "決済処理関数に予約済み同時実行を設定し、画像処理関数にも上限となる予約済み同時実行を設定する。",
      "アカウントの同時実行クォータの引き上げのみを申請する。"
     ],
     "answer": 3,
     "explain": [
      "不正解。同時実行数の制約と無関係。",
      "不正解。同時実行のプールは共通でVPCの内外では変わらない。",
      "正解。予約済み同時実行は確保と上限の両方の役割を持つ。",
      "不正解。引き上げだけでは再発する可能性があり、関数間の分離にならない。"
     ],
     "tip": "Lambdaの関数間干渉＝予約済み同時実行(確保＋上限)。プロビジョンドはコールドスタート対策。",
     "domain": 2
    },
    {
     "id": "mc-2-032",
     "stem": "あるSaaS企業は、公開API(API Gateway REST)を顧客ごとに異なる利用上限で提供し、料金プランに応じた制限をかけたいと考えています。また、悪意のあるボットからのトラフィックを軽減し、特定の国からのアクセスをブロックする必要があります。必要な対応を3つ選択してください。",
     "items": [],
     "choices": [
      "使用量プランとAPIキーを作成し、顧客ごとにスロットリングとクォータを設定する。",
      "APIステージにAWS WAFのWeb ACLを関連付け、ボット制御マネージドルールと地理一致ルールを設定する。",
      "APIをHTTP APIに変更して使用量プランを利用する。",
      "Cognitoユーザープールオーソライザーを使い、顧客の認証を行う。",
      "NLBを前面に配置してWAFを関連付ける。"
     ],
     "answers": [
      1,
      2,
      4
     ],
     "select": 3,
     "explain": [
      "正解。REST APIの使用量プランで顧客別の制限ができる。",
      "正解。ボットの制御と国のブロックはWAFで行う。",
      "不正解。HTTP APIは使用量プランをサポートしない。",
      "正解。顧客の識別・認証に適しており、顧客別の制限と組み合わせられる。",
      "不正解。NLBにWAFはアタッチできない。"
     ],
     "tip": "使用量プラン＝REST APIのみ。WAFはAPI Gateway REST/ALB/CloudFrontに付く。",
     "domain": 2
    },
    {
     "id": "mc-2-033",
     "stem": "ある企業は、Amazon EKSで機械学習の推論サービスを運用しています。トラフィックは日中に大きく変動し、GPUインスタンスの起動を最小限の時間で行いたい、またコストを最適化するために多様なインスタンスタイプを自動選択したいと考えています。ノードのスケーリングに最適なソリューションはどれですか。",
     "items": [],
     "choices": [
      "Auto Scalingグループにスケジュールアクションを設定する。",
      "すべてFargateプロファイルで実行する。",
      "Karpenterを導入して、Podの要件に基づき最適なインスタンスタイプでノードを動的にプロビジョニングする。",
      "Cluster Autoscalerを単一のマネージドノードグループで使用する。"
     ],
     "answer": 3,
     "explain": [
      "不正解。変動に追随できない。",
      "不正解。FargateはGPUをサポートしない。",
      "正解。Pendingなポッドの要件に合うインスタンスを直接起動し、スポット等との組み合わせも柔軟。",
      "不正解。インスタンスタイプの多様化や起動速度の面でKarpenterに劣る。"
     ],
     "tip": "EKSのノードの動的・多様なスケーリング＝Karpenter。FargateはGPU不可。",
     "domain": 2
    },
    {
     "id": "mc-2-034",
     "stem": "ある企業のウェブアプリは、ユーザーがモバイルアプリからサインインし、プロフィール画像をS3の自分専用のプレフィックスに直接アップロードします。サーバーを経由せず、ユーザーが他人のオブジェクトにアクセスできないようにしたい。Googleアカウントでのサインインもサポートする必要があります。必要な構成を2つ選択してください。",
     "items": [],
     "choices": [
      "Cognitoユーザープールで、Google連携を設定してユーザーを認証する。",
      "Cognito IDプールでユーザープールを認証プロバイダーとして設定し、IAMロールのポリシーで${cognito-identity.amazonaws.com:sub}をプレフィックスに使用する。",
      "S3バケットをパブリックにし、ファイル名をランダムにする。",
      "全ユーザーで共有する長期IAMアクセスキーをアプリに埋め込む。",
      "Cognitoユーザープールだけを使用し、JWTでS3に直接アクセスする。"
     ],
     "answers": [
      1,
      2
     ],
     "select": 2,
     "explain": [
      "正解。ユーザープールがソーシャルIdP連携を提供する。",
      "正解。IDプールが一時的な認証情報を発行し、ポリシー変数でユーザー別にスコープを制限できる。",
      "不正解。セキュリティ上問題がある。",
      "不正解。長期キーの埋め込みは漏えいリスクがあり、ユーザー別の分離も不可。",
      "不正解。S3はJWTを直接受け付けず、AWS認証情報が必要。"
     ],
     "tip": "モバイル＋S3直接＋ユーザー別制限＝ユーザープール(認証)＋IDプール(認証情報)＋ポリシー変数。",
     "domain": 2
    },
    {
     "id": "mc-2-035",
     "stem": "ある企業は、AWS上の本番ワークロードで常時稼働するEC2(m5)とFargateタスク、およびLambda関数を使用しており、今後1年間で使用するインスタンスファミリーやコンピュートサービスが変わる可能性があります。コンピュート費用を最大限削減しつつ、柔軟性を確保したいと考えています。最適な購入方法はどれですか。",
     "items": [],
     "choices": [
      "すべてスポットに移行する。",
      "m5のスタンダードRIを購入する。",
      "Compute Savings Plansを1年または3年で購入する。",
      "EC2 Instance Savings Plansを3年で購入する。"
     ],
     "answer": 3,
     "explain": [
      "不正解。常時稼働で中断できないワークロードには不適切。",
      "不正解。ファミリー固定で柔軟性がなく、FargateやLambdaにも適用されない。",
      "正解。EC2のファミリー/リージョン/OSの変更、およびFargateとLambdaにも適用される。",
      "不正解。ファミリー固定で、FargateやLambdaには適用されない。"
     ],
     "tip": "柔軟性(ファミリー変更やサービス横断)＝Compute Savings Plans。最大割引率優先＝EC2 Instance SP/Standard RI。",
     "domain": 2
    },
    {
     "id": "mc-2-036",
     "stem": "ある企業が機密データを扱うAmazon Aurora PostgreSQLクラスターを、KMSカスタマーマネージドキーで暗号化して東京リージョンで運用しています。DR要件としてAuroraグローバルデータベースで大阪リージョンにセカンダリクラスターを追加します。暗号化の観点で必要なことは何ですか。",
     "items": [],
     "choices": [
      "暗号化を無効にしてからセカンダリを追加する。",
      "大阪リージョンのKMSキー(マルチリージョンキーのレプリカまたは別のCMK)を指定してセカンダリクラスターを作成する。",
      "セカンダリクラスターは東京のKMSキーを自動的に使用するため、追加の対応は不要。",
      "東京のKMSキーのキーポリシーをパブリックにする。"
     ],
     "answer": 2,
     "explain": [
      "不正解。暗号化済みクラスターはグローバルセカンダリでも暗号化が必要。",
      "正解。セカンダリごとに自リージョンのKMSキーを指定する(マルチリージョンキーも利用可)。",
      "不正解。KMSキーはリージョン固有で、大阪では東京のキーを使えない。",
      "不正解。セキュリティ上不適切で、解決にもならない。"
     ],
     "tip": "KMSは通常リージョン固有。クロスリージョンの暗号化DRでは宛先リージョンのキーを指定。",
     "domain": 2
    },
    {
     "id": "mc-2-037",
     "stem": "ある企業は、オンプレミスのデータセンターとAWSをハイブリッド接続しており、オンプレミスのDNSサーバーからAWSのプライベートホストゾーンのレコードを名前解決し、同時にAWS上のEC2からオンプレミスのドメイン(corp.example.com)も名前解決する必要があります。最適な構成はどれですか。",
     "items": [],
     "choices": [
      "Route 53 Resolverのインバウンドエンドポイントを作成してオンプレミスから転送し、アウトバウンドエンドポイントと転送ルールでcorp.example.comをオンプレミスDNSへ転送する。",
      "hostsファイルをすべてのEC2とオンプレミスに配布する。",
      "パブリックホストゾーンに全レコードを複製する。",
      "VPCにDNSサーバーのEC2を構築し、双方でゾーン転送する。"
     ],
     "answer": 1,
     "explain": [
      "正解。インバウンド(オンプレ→AWS)とアウトバウンド(AWS→オンプレ)を組み合わせるマネージドな構成。",
      "不正解。スケールせず管理できない。",
      "不正解。プライベートなレコードを公開してしまう。",
      "不正解。運用負荷が高く可用性管理が必要。"
     ],
     "tip": "ハイブリッドDNS＝Route 53 Resolver(インバウンド/アウトバウンド＋ルール)。",
     "domain": 2
    }
   ]
  },
  {
   "no": 3,
   "title": "既存ソリューションの継続的改善",
   "lessons": [
    {
     "id": "3-1",
     "title": "監視・可観測性（CloudWatch / X-Ray / CloudTrail / Config）",
     "pages": [
      {
       "id": "3-1-p1",
       "title": "CloudWatch：メトリクス・アラーム・ログ",
       "html": "\n<h4>メトリクスとアラーム</h4>\n<ul>\n<li>標準メトリクスは無料で自動収集。EC2は既定で5分間隔、詳細モニタリングで<b class=\"key\">1分間隔</b>（有料）</li>\n<li>EC2の<span class=\"trap\">メモリ使用率・ディスク使用率・プロセス情報はOSの内側の値</span>なので標準では取れない → CloudWatch Agentで収集（カスタムメトリクス）</li>\n<li>高解像度メトリクスは最短<b class=\"key\">1秒</b>。アラームも高解像度（10秒/30秒）が設定可能</li>\n<li>アラーム状態は OK / ALARM / INSUFFICIENT_DATA。アクションは SNS、Auto Scaling、EC2アクション（停止・終了・再起動・復旧）、Systems Manager OpsItem など</li>\n<li>複合アラーム（Composite alarm）：複数アラームをAND/ORで束ね、<b class=\"key\">アラーム疲れ（ノイズ）を減らす</b></li>\n<li>異常検出（Anomaly Detection）：機械学習で期待値バンドを作り、固定しきい値が難しい周期的な負荷に有効</li>\n</ul>\n<h4>CloudWatch Logs</h4>\n<ul>\n<li>ロググループの保持期間は<span class=\"trap\">既定で無期限</span>（＝課金され続ける）→ 保持期間を設定してコスト削減</li>\n<li>メトリクスフィルター：ログ中のパターンをメトリクス化 → アラーム（例：ERROR件数、root利用）</li>\n<li><b class=\"key\">サブスクリプションフィルター</b>：リアルタイムでKinesis Data Streams / Data Firehose / Lambda / OpenSearchへ転送。アカウント横断の集約にも使う</li>\n<li>Logs Insights：ログへの対話型クエリ（アドホック調査）。S3へのエクスポートは非同期でリアルタイムではない</li>\n<li>複数アカウント・リージョンの横断監視は<b class=\"key\">CloudWatch クロスアカウントオブザーバビリティ（OAM）</b>で、監視アカウントから各ソースアカウントのメトリクス・ログ・トレースを参照</li>\n</ul>\n",
       "oxIds": [
        "ox-3-1-p1-a",
        "ox-3-1-p1-b",
        "ox-3-1-p1-c"
       ]
      },
      {
       "id": "3-1-p2",
       "title": "X-Ray・Synthetics・RUM：アプリの可視化",
       "html": "\n<h4>分散トレーシング</h4>\n<ul>\n<li><b class=\"key\">AWS X-Ray</b>：リクエストをサービス間で追跡し、サービスマップでレイテンシ・エラー率・ボトルネックを特定。マイクロサービスの「どこが遅いか」はX-Ray</li>\n<li>計装は X-Ray SDK または <b class=\"key\">AWS Distro for OpenTelemetry（ADOT）</b>。Lambdaは「アクティブトレース」を有効化するだけ。ECS/EC2ではX-Rayデーモン/ADOTコレクターが必要</li>\n<li>サンプリングルールで記録率を調整（全リクエスト記録はコスト増）。アノテーションは検索可能、メタデータは検索不可</li>\n<li><b class=\"key\">CloudWatch Application Signals</b>：SLO（可用性・レイテンシ目標）をアプリ視点で定義・追跡</li>\n</ul>\n<h4>合成監視と実ユーザー監視</h4>\n<ul>\n<li>CloudWatch Synthetics（カナリア）：スクリプトで定期的にURL/APIを叩き、<b class=\"key\">ユーザーがいない時間帯でも</b>可用性を検知</li>\n<li>CloudWatch RUM：実ユーザーのブラウザからページ性能・JSエラーを収集</li>\n<li><b class=\"key\">Contributor Insights</b>：ログから「上位N個の寄与者」（例：特定IPのリクエスト急増）を可視化</li>\n</ul>\n<p><span class=\"trap\">引っ掛け</span>：「サービス間の呼び出しの遅延箇所を特定」→ X-Ray。「リソース全体の負荷」→ CloudWatchメトリクス。「誰がAPIを呼んだか」→ CloudTrail。</p>\n",
       "oxIds": [
        "ox-3-1-p2-a",
        "ox-3-1-p2-b",
        "ox-3-1-p2-c"
       ]
      },
      {
       "id": "3-1-p3",
       "title": "CloudTrail と AWS Config の使い分け",
       "html": "\n<h4>CloudTrail ＝ 「誰が・いつ・何のAPIを呼んだか」</h4>\n<ul>\n<li><b class=\"key\">管理イベント</b>は既定で記録され、コンソールのイベント履歴は過去90日分。長期保管・分析には証跡（Trail）をS3へ作成</li>\n<li><b class=\"key\">データイベント</b>（S3オブジェクトレベル、Lambda Invoke、DynamoDBアイテム等）は<span class=\"trap\">既定で無効・有料</span>。必要なものだけ有効化</li>\n<li>組織の証跡（Organization trail）で全アカウント分を管理アカウント/委任管理者から一括有効化。<b class=\"key\">ログファイルの整合性検証</b>で改ざん検知</li>\n<li>CloudTrail Lake：イベントをマネージドなストアに保存し、SQLで直接クエリ（Athena構築不要）</li>\n<li>CloudTrail Insights：異常なAPI呼び出し量・エラー率を検知</li>\n</ul>\n<h4>AWS Config ＝ 「リソースの設定が今どうで、どう変わったか」</h4>\n<ul>\n<li>設定履歴・タイムラインを記録し、<b class=\"key\">Configルール</b>で準拠/非準拠を評価（マネージド/カスタムLambda）</li>\n<li>適合パック（Conformance pack）でルール群を一括展開、<b class=\"key\">アグリゲーター</b>で複数アカウント/リージョンを集約</li>\n<li>非準拠はSSM Automationによる自動修復に接続できる（例：公開S3をプライベートに戻す）</li>\n<li>高度なクエリでSQL風にリソース設定を横断検索</li>\n</ul>\n<p><span class=\"trap\">引っ掛け</span>：Configは「設定の変更」を記録するが「誰が」変更したかはCloudTrailと突き合わせる。Configは<b class=\"key\">予防ではなく検知</b>（SCPやIAMが予防）。</p>\n",
       "oxIds": [
        "ox-3-1-p3-a",
        "ox-3-1-p3-b",
        "ox-3-1-p3-c"
       ]
      },
      {
       "id": "3-1-p4",
       "title": "監視設計の判断表",
       "html": "\n<table>\n<tr><th>要件</th><th>選ぶサービス</th></tr>\n<tr><td>CPU・ネットワーク等の傾向とアラーム</td><td>CloudWatch メトリクス/アラーム</td></tr>\n<tr><td>メモリ・ディスク・アプリログ</td><td>CloudWatch Agent / Logs</td></tr>\n<tr><td>ログ内の特定文字列で通知</td><td>メトリクスフィルター + アラーム</td></tr>\n<tr><td>ログをリアルタイムで別アカウントやOpenSearchへ</td><td>サブスクリプションフィルター</td></tr>\n<tr><td>サービス間の遅延箇所の特定</td><td>X-Ray / Application Signals</td></tr>\n<tr><td>ユーザー不在でも可用性確認</td><td>Synthetics</td></tr>\n<tr><td>API操作の監査（誰が何をした）</td><td>CloudTrail（Lakeでクエリ）</td></tr>\n<tr><td>設定変更履歴・コンプライアンス</td><td>Config</td></tr>\n<tr><td>AWS側の障害・メンテ通知</td><td>AWS Health / Health Dashboard（EventBridge連携）</td></tr>\n<tr><td>複数アカウント横断の一元可視化</td><td>CloudWatch OAM / 組織の証跡 / Config アグリゲーター</td></tr>\n</table>\n<h4>アラート経路の定石</h4>\n<ul>\n<li>通知：アラーム → SNS → メール/Slack（<b class=\"key\">Amazon Q Developer in chat applications</b>＝旧AWS Chatbot）</li>\n<li>自動対応：アラーム/イベント → <b class=\"key\">EventBridge</b> → Lambda / SSM Automation / Step Functions</li>\n<li><span class=\"trap\">アラーム設定の落とし穴</span>：欠損データ処理（<b class=\"key\">TreatMissingData</b>）を誤ると、停止したインスタンスでINSUFFICIENT_DATAのまま通知されない。ハートビート的指標は「欠損＝異常（breaching）」にする</li>\n<li>運用の目標は「人が気づく」前に<b class=\"key\">自動検知→自動修復</b>。通知だけで終わる設計より、修復まで自動化する案が試験では選ばれやすい</li>\n</ul>\n",
       "oxIds": [
        "ox-3-1-p4-a",
        "ox-3-1-p4-b"
       ]
      }
     ]
    },
    {
     "id": "3-2",
     "title": "自動化と自動修復（EventBridge / Systems Manager）",
     "pages": [
      {
       "id": "3-2-p1",
       "title": "EventBridge：イベント駆動の司令塔",
       "html": "\n<ul>\n<li>ルール：イベントパターン（イベントに反応）またはスケジュール（cron/rate）で、最大5つのターゲット（Lambda、SQS、SNS、Step Functions、SSM Automation、ECSタスク、別バス等）を呼び出す</li>\n<li>AWSサービスのイベント（EC2状態変化、GuardDuty検出、Config非準拠、CodePipeline状態、AWS Health）は<b class=\"key\">デフォルトイベントバス</b>に自動で流れる</li>\n<li>カスタムバスはアプリ独自イベント用。<b class=\"key\">SaaSパートナーバス</b>も存在。<b class=\"key\">クロスアカウント/リージョン</b>は、バスのリソースポリシーで許可し別バスへ転送</li>\n<li>アーカイブ & リプレイ：過去イベントを保存して再送（障害後の再処理、テスト）</li>\n<li><b class=\"key\">EventBridge Scheduler</b>：大量・一回限り・タイムゾーン指定のスケジュール。定期実行のたびに別ルールを作る必要がない</li>\n<li>EventBridge Pipes：SQS/Kinesis/DynamoDBストリーム等 → フィルタ・エンリッチ → ターゲットを、コード少なめで接続</li>\n<li>失敗時は<b class=\"key\">DLQ（SQS）とリトライポリシー</b>をターゲットに設定可能</li>\n</ul>\n<p><span class=\"trap\">引っ掛け</span>：CloudWatch Eventsは旧名称でEventBridgeと同じ基盤。「イベントでLambdaを起動」「定期バッチ起動」は第一候補がEventBridge。ただしキューイングによる負荷平準化・再試行制御が主眼ならSQSを併用。</p>\n",
       "oxIds": [
        "ox-3-2-p1-a",
        "ox-3-2-p1-b",
        "ox-3-2-p1-c"
       ]
      },
      {
       "id": "3-2-p2",
       "title": "Systems Manager：運用の自動化ツール群",
       "html": "\n<table>\n<tr><th>機能</th><th>用途・判断</th></tr>\n<tr><td><b class=\"key\">Run Command</b></td><td>多数インスタンスへSSH不要でコマンドをアドホック実行。結果はS3/CloudWatch Logsへ</td></tr>\n<tr><td>Session Manager</td><td><b class=\"key\">SSH/踏み台/22番ポート開放不要</b>でシェル接続。IAM制御・CloudTrail/セッションログ監査。VPCエンドポイントでプライベート運用可</td></tr>\n<tr><td>Patch Manager</td><td>パッチベースライン + パッチグループ + メンテナンスウィンドウで計画パッチ適用。コンプライアンス報告</td></tr>\n<tr><td><b class=\"key\">State Manager</b></td><td>望ましい構成（エージェント導入、設定）を継続的に強制・ドリフト修正</td></tr>\n<tr><td>Automation</td><td>ランブックで多段階の運用手順（AMI作成、インスタンス再起動、修復）を自動化。承認ステップ・クロスアカウント実行可</td></tr>\n<tr><td><b class=\"key\">Parameter Store</b></td><td>設定値・秘密情報の階層管理。標準は無料。ローテーション機能は無い</td></tr>\n<tr><td>Inventory</td><td>ソフト/設定のインベントリ収集</td></tr>\n<tr><td>OpsCenter / Explorer</td><td>運用上の課題（OpsItem）を集約し調査・対応</td></tr>\n</table>\n<ul>\n<li>前提：SSM Agentがインスタンスにあり、インスタンスプロファイル（AmazonSSMManagedInstanceCore）で権限付与。プライベートサブネットならインターネット経路かVPCエンドポイント（ssm, ssmmessages, ec2messages）が必要</li>\n<li><b class=\"key\">ハイブリッドアクティベーション</b>でオンプレサーバーも管理対象にできる</li>\n<li><span class=\"trap\">秘密情報の判断</span>：自動ローテーションが必要 → Secrets Manager。単純な設定値・低コスト → Parameter Store</li>\n</ul>\n",
       "oxIds": [
        "ox-3-2-p2-a",
        "ox-3-2-p2-b",
        "ox-3-2-p2-c"
       ]
      },
      {
       "id": "3-2-p3",
       "title": "自動修復（Auto-Remediation）の定石",
       "html": "\n<h4>パターン集</h4>\n<ul>\n<li>EC2の障害：CloudWatchアラーム（StatusCheckFailed_System）→ EC2アクション「復旧」。同一IP・EBSそのままで別ホストで再起動（インスタンスストアは非対応）</li>\n<li><b class=\"key\">ASGヘルスチェック</b>：EC2ステータスに加え、ELBヘルスチェックを有効化しないと「アプリが応答しないだけ」のインスタンスが置換されない</li>\n<li><b class=\"key\">Config非準拠</b>→ Configルールの修復アクション（SSM Automation）（例：暗号化なしEBS検出、公開S3のBlock Public Access有効化）</li>\n<li><b class=\"key\">GuardDuty検出</b>→ EventBridge → Lambda/SSM Automation（例：侵害疑いのインスタンスを隔離SGへ変更しスナップショット取得）</li>\n<li>AWS Healthイベント（計画メンテナンス、RDS更新、EC2リタイア予定）→ EventBridge → 通知/自動対応</li>\n<li><b class=\"key\">CloudFormationスタックのドリフト</b>→ 通知後に再デプロイ。手動変更を許さない運用が理想</li>\n</ul>\n<h4>設計の判断基準</h4>\n<ul>\n<li>冪等（何度実行しても同じ結果）な修復にする。連続発火でループしないようガードする</li>\n<li>修復は最小権限のIAMロール（Automation Assume Role）で実行し、実行履歴をCloudTrailで監査</li>\n<li>承認が必要な高リスク操作はAutomationの<b class=\"key\">承認アクション</b>やStep Functionsで人手を挟む</li>\n<li><span class=\"trap\">引っ掛け</span>：Lambdaを自作するより、SSM Automationの既製ランブックがある場合は「運用オーバーヘッド最小」で優先されることが多い</li>\n</ul>\n",
       "oxIds": [
        "ox-3-2-p3-a",
        "ox-3-2-p3-b",
        "ox-3-2-p3-c"
       ]
      }
     ]
    },
    {
     "id": "3-3",
     "title": "CI/CDとデプロイ戦略（CodePipeline / CodeDeploy）",
     "pages": [
      {
       "id": "3-3-p1",
       "title": "CodePipeline と CodeBuild",
       "html": "\n<ul>\n<li>CodePipeline：ソース → ビルド → テスト → 承認 → デプロイをオーケストレーションするマネージドCD。ソースは S3、ECR、GitHub（CodeConnections経由）など。<span class=\"trap\">CodeCommitは新規顧客受付を終了</span>しているため、新規構成ではGitHub等が前提</li>\n<li>CodeBuild：サーバーレスのビルド実行環境。<b class=\"key\">buildspec.yml</b>（phases: install/pre_build/build/post_build、artifacts、cache）。VPC内リソース（プライベートDB等）にアクセスするにはVPC設定が必要。ローカルキャッシュ/S3キャッシュでビルド高速化</li>\n<li>手動承認アクション：本番デプロイ前にSNS通知＋承認。<b class=\"key\">クロスアカウントデプロイ</b>：パイプラインが別アカウントのロールをAssumeし、成果物バケットとKMSキーのポリシーでアクセス許可（成果物はCMKで暗号化する必要がある）</li>\n<li>クロスリージョンアクション：リージョンごとに成果物バケットを用意</li>\n<li>パイプライン実行の失敗/成功は<b class=\"key\">EventBridge</b>で検知して通知・ロールバックへ</li>\n<li>CodeBuildでのシークレットは平文の環境変数にせず、Secrets Manager / Parameter Store参照を使う</li>\n</ul>\n<h4>テスト・セキュリティの組み込み</h4>\n<ul>\n<li>ビルドステージで単体テスト、<b class=\"key\">CodeGuru Reviewer</b>やInspector（ECR/Lambdaスキャン）で静的解析/脆弱性検査</li>\n<li>CloudFormationデプロイ時はテストステージに<b class=\"key\">変更セット</b>の確認を挟む</li>\n</ul>\n",
       "oxIds": [
        "ox-3-3-p1-a",
        "ox-3-3-p1-b",
        "ox-3-3-p1-c"
       ]
      },
      {
       "id": "3-3-p2",
       "title": "CodeDeploy：デプロイ戦略と自動ロールバック",
       "html": "\n<table>\n<tr><th>対象</th><th>方式</th></tr>\n<tr><td>EC2/オンプレ</td><td>In-place（既存を更新。ASGでローリング的に）/ Blue/Green（新ASGを作り、ELBのトラフィックを切替、旧は保持後に終了）</td></tr>\n<tr><td>Lambda</td><td>エイリアスの重み付けシフト：<b class=\"key\">Canary</b>（例 10%を5分→残り全て）/ Linear（例 10%を1分ごと）/ <b class=\"key\">AllAtOnce</b></td></tr>\n<tr><td>ECS</td><td>Blue/Greenのみ。ALBのリスナー/ターゲットグループ切替。Canary / Linear / AllAtOnce</td></tr>\n</table>\n<ul>\n<li>AppSpecファイルとライフサイクルフック（BeforeInstall、AfterInstall、ApplicationStart、<b class=\"key\">ValidateService</b>、Lambda/ECSでは BeforeAllowTraffic/AfterAllowTraffic）で検証を挟む</li>\n<li>自動ロールバック：デプロイ失敗時、または<b class=\"key\">CloudWatchアラームがALARM</b>になった時に自動で前バージョンへ戻す</li>\n<li>デプロイ設定：EC2/In-placeは AllAtOnce / HalfAtATime / OneAtATime</li>\n<li>Blue/Greenの利点：<b class=\"key\">瞬時にロールバック</b>（旧環境へトラフィックを戻す）、本番同等環境でテスト可能。欠点：一時的にリソースが倍</li>\n</ul>\n<p><span class=\"trap\">引っ掛け</span>：ECSでCodeDeployのBlue/Greenを使う場合のデプロイコントローラーは「CODE_DEPLOY」。ECS標準のローリング更新は「ECS」コントローラー。In-placeはダウンタイム・容量低下が発生しうる。</p>\n",
       "oxIds": [
        "ox-3-3-p2-a",
        "ox-3-3-p2-b",
        "ox-3-3-p2-c"
       ]
      },
      {
       "id": "3-3-p3",
       "title": "デプロイ戦略の使い分け（ダウンタイムとリスク）",
       "html": "\n<table>\n<tr><th>戦略</th><th>特徴</th><th>主な実現手段</th></tr>\n<tr><td>All at once</td><td>最速・ダウンタイムあり・ロールバックは再デプロイ</td><td>Beanstalk / CodeDeploy</td></tr>\n<tr><td>Rolling</td><td>バッチ更新、容量一時低下</td><td>Beanstalk Rolling / ASG Instance Refresh</td></tr>\n<tr><td>Rolling with additional batch</td><td>追加バッチで容量維持</td><td>Beanstalk</td></tr>\n<tr><td><b class=\"key\">Immutable</b></td><td>新ASGに新規インスタンス。失敗時は新ASGを破棄するだけ、ロールバック容易</td><td>Beanstalk</td></tr>\n<tr><td>Traffic splitting</td><td>新旧へ一定割合で流す（カナリア評価）</td><td>Beanstalk</td></tr>\n<tr><td>Blue/Green</td><td>別環境を作り切替。即時戻し</td><td>CodeDeploy / Beanstalk URLスワップ / Route 53</td></tr>\n<tr><td><b class=\"key\">カナリア</b></td><td>少数ユーザーで検証後に全展開</td><td>ALB重み付けTG、Route 53加重、Lambdaエイリアス、API Gatewayカナリアステージ</td></tr>\n</table>\n<ul>\n<li><b class=\"key\">Route 53加重ルーティング</b>での切替は<span class=\"trap\">DNSのTTL・クライアントキャッシュで完全に即時にならない</span>。即時性が必要ならALBの加重ターゲットグループ</li>\n<li>ASG Instance Refresh：起動テンプレート更新後に、最小正常率を保ちつつインスタンスを段階的に入れ替え</li>\n<li><b class=\"key\">AWS AppConfig</b>：コード再デプロイなしに設定/フィーチャーフラグを段階配信し、アラーム連動で自動ロールバック</li>\n<li>データベーススキーマ変更は<b class=\"key\">後方互換（expand/contract）</b>にしないとBlue/Greenで旧環境へ戻せない</li>\n</ul>\n",
       "oxIds": [
        "ox-3-3-p3-a",
        "ox-3-3-p3-b",
        "ox-3-3-p3-c"
       ]
      },
      {
       "id": "3-3-p4",
       "title": "AMI・コンテナの供給網とパイプライン運用",
       "html": "\n<ul>\n<li><b class=\"key\">EC2 Image Builder</b>：OSパッチ・ソフト導入・テストを含むAMI/コンテナイメージの自動ビルドパイプライン。スケジュールまたは親イメージ更新で起動。配布先リージョン/アカウントを指定、Inspectorで脆弱性スキャン</li>\n<li><b class=\"key\">Golden AMI</b>方式：起動が速く再現性が高いが、更新（パッチ）の頻度に合わせたAMI再作成が必要。一方、起動時にユーザーデータで都度構成する方式は柔軟だが起動が遅く外部依存で失敗しうる</li>\n<li>Amazon ECR：イメージのスキャン（Inspector強化スキャン）、<b class=\"key\">ライフサイクルポリシー</b>で古いイメージ削除、クロスリージョン/アカウントレプリケーション、プルスルーキャッシュ</li>\n<li>CloudFormation + CodePipeline：テンプレート変更を変更セット→承認→実行する<b class=\"key\">インフラのCI/CD</b></li>\n<li>パイプラインのIAM：ステージごとに最小権限のサービスロールを分離。本番アカウントへは<b class=\"key\">クロスアカウントロール</b></li>\n</ul>\n<h4>試験での選び方</h4>\n<ul>\n<li>「ダウンタイムなし・すぐ戻せる」→ Blue/Green</li>\n<li>「少数で検証し徐々に展開」→ カナリア/Linear</li>\n<li>「追加コスト最小で更新」→ ローリング</li>\n<li>「パッチ適用済みAMIを継続供給」→ Image Builder</li>\n<li><span class=\"trap\">「手動手順を減らす」「繰り返し可能」</span>という文言が出たらIaC+CI/CDの自動化が答え</li>\n</ul>\n",
       "oxIds": [
        "ox-3-3-p4-a",
        "ox-3-3-p4-b"
       ]
      }
     ]
    },
    {
     "id": "3-4",
     "title": "IaCと構成管理（CloudFormation / StackSets / CDK）",
     "pages": [
      {
       "id": "3-4-p1",
       "title": "CloudFormation の更新・失敗・保護",
       "html": "\n<ul>\n<li><b class=\"key\">変更セット（Change Set）</b>：更新前に影響（追加/変更/置換 Replacement/削除）を確認。本番更新の定石</li>\n<li>DeletionPolicy：Retain / Snapshot（RDS、EBS等）/ Delete。<b class=\"key\">UpdateReplacePolicy</b>は更新で置換された旧リソースの扱い。DBは両方 Snapshot or Retain にしてデータ消失を防ぐ</li>\n<li><b class=\"key\">スタックポリシー</b>：更新時に特定リソースの変更を禁止。終了保護：スタック削除の誤操作防止</li>\n<li>ロールバック：作成失敗→ROLLBACK_COMPLETE（再作成するには削除が必要）。更新失敗→UPDATE_ROLLBACK_COMPLETE。ロールバック自体が失敗（UPDATE_ROLLBACK_FAILED）したら、原因を直して<b class=\"key\">ContinueUpdateRollback</b>（問題リソースをスキップ可能）</li>\n<li>CreationPolicy + cfn-signal：EC2/ASGでアプリの起動完了シグナルを待つ（WaitConditionより推奨）。タイムアウト時は作成失敗</li>\n<li><b class=\"key\">カスタムリソース</b>：テンプレートにない処理をLambda等で実装。応答（ResponseURLへ）を返さないと<span class=\"trap\">最大1時間ハング</span>するので、必ずSUCCESS/FAILEDを返す（削除時も）</li>\n<li>ネストスタック：共通部品の再利用・500リソース上限の回避。クロススタック参照はExport/Fn::ImportValue（<span class=\"trap\">参照されているExportは削除・変更不可</span>）</li>\n<li><b class=\"key\">動的参照</b>：{{resolve:ssm:...}}、{{resolve:secretsmanager:...}}でテンプレートに秘密値を直書きしない</li>\n</ul>\n",
       "oxIds": [
        "ox-3-4-p1-a",
        "ox-3-4-p1-b",
        "ox-3-4-p1-c"
       ]
      },
      {
       "id": "3-4-p2",
       "title": "StackSets とマルチアカウント展開",
       "html": "\n<ul>\n<li><b class=\"key\">StackSets</b>：1つのテンプレートを複数アカウント × 複数リージョンへ一括デプロイ・更新</li>\n<li><b class=\"key\">サービスマネージド</b>権限：AWS Organizationsと統合。OU単位で指定し、<b class=\"key\">自動デプロイ</b>（新規アカウントがOUに入ると自動適用）。IAMロールの事前作成不要。管理アカウントまたは委任管理者から実行</li>\n<li><b class=\"key\">セルフマネージド</b>権限：管理者アカウントに AWSCloudFormationStackSetAdministrationRole、ターゲットに AWSCloudFormationStackSetExecutionRole を自分で用意。Organizations外のアカウントにも使える</li>\n<li>オペレーション設定：同時実行アカウント数、障害許容数/率、リージョン順序でリスクを抑えた段階展開</li>\n<li>用途：全アカウントへのConfigルール、CloudTrail、IAMロール、ガードレールの一括展開</li>\n<li>Control Tower：ランディングゾーン構築とガードレール（予防SCP/検出Config）を自動化。アカウントの量産はAccount Factory</li>\n</ul>\n<table>\n<tr><th>要件</th><th>手段</th></tr>\n<tr><td>新規アカウント作成時に自動でベースライン適用</td><td>StackSets（サービスマネージド+自動デプロイ）/ Control Tower</td></tr>\n<tr><td>複数リージョンに同一スタック</td><td>StackSets</td></tr>\n<tr><td>承認済みテンプレートだけを開発者に提供</td><td>Service Catalog</td></tr>\n</table>\n<p><span class=\"trap\">引っ掛け</span>：「各アカウントで手動実行」「アカウント毎にスクリプト」より、組織統合のStackSetsが運用負荷最小。</p>\n",
       "oxIds": [
        "ox-3-4-p2-a",
        "ox-3-4-p2-b",
        "ox-3-4-p2-c"
       ]
      },
      {
       "id": "3-4-p3",
       "title": "ドリフト検出とリソースインポート",
       "html": "\n<ul>\n<li><b class=\"key\">ドリフト</b>＝CloudFormationの外（コンソールやCLI）で行われた手動変更による、実際の設定とテンプレートの差異</li>\n<li><b class=\"key\">ドリフト検出</b>：スタック/リソース単位で実行し、IN_SYNC / DRIFTED を判定。<span class=\"trap\">検出するだけで自動修復はしない</span>。修復は、手動変更を戻す、またはテンプレート側を更新して反映</li>\n<li>StackSetsにもドリフト検出がある。<b class=\"key\">定期的な検出</b>はEventBridge + Lambda / Config（cloudformation-stack-drift-detection-check ルール）で自動化</li>\n<li><b class=\"key\">リソースインポート</b>：既存リソースをスタックの管理下に取り込む（DeletionPolicyの指定が必要）。IaC化の移行に使う</li>\n<li>Configはスタック外の変更も含め全リソースの設定変更を記録。CloudFormationドリフトは「テンプレートとの差」、Configは「時系列の変更履歴・ルール評価」</li>\n<li>予防策：本番のIAMから直接変更権限を外し、変更はパイプライン経由のみにする（SCP / IAM）</li>\n</ul>\n<h4>ドリフト検出が検出しにくい/できないもの</h4>\n<ul>\n<li>すべてのリソースタイプが対象ではない（非対応タイプあり）</li>\n<li>テンプレートに明示していないプロパティの既定値からの変更は、対象外のことがある</li>\n</ul>\n",
       "oxIds": [
        "ox-3-4-p3-a",
        "ox-3-4-p3-b"
       ]
      },
      {
       "id": "3-4-p4",
       "title": "CDK・SAM・Service Catalog の位置づけ",
       "html": "\n<ul>\n<li><b class=\"key\">AWS CDK</b>：TypeScript/Python/Java等のプログラミング言語でインフラを定義し、cdk synthでCloudFormationテンプレートを生成、<b class=\"key\">cdk deploy</b>で展開。最終的にCloudFormationスタックになる（＝ロールバック、ドリフト検出が使える）</li>\n<li>コンストラクト：L1（CFNリソースそのまま、Cfn接頭辞）/ L2（既定値・便利メソッド付き）/ <b class=\"key\">L3（パターン）</b>（複数リソースのまとまり）</li>\n<li>cdk bootstrap：環境（アカウント/リージョン）ごとに、アセット用S3やデプロイ用ロールを作る前提作業</li>\n<li><b class=\"key\">AWS SAM</b>：サーバーレス向けのCloudFormation拡張（Transform: AWS::Serverless-2016-10-31）。sam localでローカルテスト、sam deploy。CodeDeployと連携してLambdaのカナリア（DeploymentPreference）を簡単に実装</li>\n<li><b class=\"key\">Service Catalog</b>：承認済みテンプレート（製品）のポートフォリオを提供し、エンドユーザーはセルフサービスで起動。起動制約（Launch constraint）のIAMロールで、ユーザー本人に強い権限を与えずにデプロイさせる</li>\n<li>Terraform等もあるが、試験の選択肢の基本はCloudFormation/CDK</li>\n</ul>\n<h4>判断</h4>\n<ul>\n<li>「開発者がループや条件を使い、既存言語で記述したい」→ CDK</li>\n<li>「サーバーレスアプリを簡潔に」→ SAM</li>\n<li>「統制された構成のセルフサービス提供」→ Service Catalog</li>\n<li>「全アカウントに一括」→ StackSets</li>\n</ul>\n",
       "oxIds": [
        "ox-3-4-p4-a",
        "ox-3-4-p4-b",
        "ox-3-4-p4-c"
       ]
      }
     ]
    },
    {
     "id": "3-5",
     "title": "Well-Architectedレビュー・信頼性・パフォーマンス改善",
     "pages": [
      {
       "id": "3-5-p1",
       "title": "Well-Architected Framework の6本柱とレビュー",
       "html": "\n<table>\n<tr><th>柱</th><th>キーワード</th></tr>\n<tr><td><b class=\"key\">運用上の優秀性</b></td><td>IaC、小さく頻繁な可逆変更、運用手順の自動化、障害から学ぶ</td></tr>\n<tr><td>セキュリティ</td><td>強いID基盤、最小権限、トレーサビリティ、全層防御、データ保護、自動化</td></tr>\n<tr><td>信頼性</td><td>障害からの自動復旧、水平スケール、容量推測の停止、変更管理の自動化</td></tr>\n<tr><td><b class=\"key\">パフォーマンス効率</b></td><td>先進技術の民主化（マネージド利用）、グローバル展開、サーバーレス、実験</td></tr>\n<tr><td>コスト最適化</td><td>使った分だけ支払う、全体効率の測定、無差別な重労働への支出を止める、使用状況の分析</td></tr>\n<tr><td><b class=\"key\">持続可能性</b></td><td>影響の把握、利用率の最大化、効率的なハードウェア（Graviton等）・マネージドサービス利用</td></tr>\n</table>\n<h4>レビューの道具</h4>\n<ul>\n<li>AWS Well-Architected Tool：質問に回答してワークロードを評価し、HRI（高リスク項目）と改善計画を出力。<b class=\"key\">レンズ</b>（SaaS、サーバーレス、金融サービス等）で観点を追加。マイルストーンで改善を記録</li>\n<li>Trusted Advisor：コスト最適化・パフォーマンス・セキュリティ・耐障害性・サービス制限・運用上の優秀性のチェック。全チェックの利用には<b class=\"key\">Business / Enterprise系サポート</b>が必要</li>\n<li>AWS Health：自アカウントに影響するイベント。Compute Optimizer：適正サイズ推奨</li>\n</ul>\n<p><span class=\"trap\">引っ掛け</span>：Well-Architected Toolは診断・助言のツールであり、リソースを自動修正しない。トレードオフ（例：コスト vs 信頼性）は要件の優先度で決める。</p>\n",
       "oxIds": [
        "ox-3-5-p1-a",
        "ox-3-5-p1-b",
        "ox-3-5-p1-c"
       ]
      },
      {
       "id": "3-5-p2",
       "title": "信頼性の改善：Multi-AZ・DR・疎結合",
       "html": "\n<h4>DR戦略（RTO/RPOとコストのトレードオフ）</h4>\n<table>\n<tr><th>戦略</th><th>RTO/RPO</th><th>内容</th></tr>\n<tr><td><b class=\"key\">バックアップ & リストア</b></td><td>時間〜日</td><td>最安。別リージョンへバックアップコピー（AWS Backup）</td></tr>\n<tr><td>パイロットライト</td><td>数十分〜</td><td>DBレプリカ等のコアのみ常時稼働。障害時に残りを起動</td></tr>\n<tr><td>ウォームスタンバイ</td><td>分</td><td>縮小版のフル環境が常時稼働。拡張して切替</td></tr>\n<tr><td><b class=\"key\">マルチサイト Active/Active</b></td><td>ほぼ0</td><td>全リージョンで本番稼働。最高コスト</td></tr>\n</table>\n<ul>\n<li>Aurora Global Database：リージョン間レプリケーション遅延は通常1秒未満。計画外フェイルオーバーでRPO秒単位、RTOは分単位。DynamoDBグローバルテーブルはマルチリージョンActive/Active</li>\n<li><b class=\"key\">Route 53ヘルスチェック + フェイルオーバー/レイテンシールーティング</b>、Global Accelerator（DNSキャッシュに依存せず高速切替）</li>\n<li>AWS Elastic Disaster Recovery：オンプレ/他環境のサーバーを継続レプリケーションし、低コストでDR</li>\n<li>RDS Multi-AZ（同期レプリケーションで可用性）と<b class=\"key\">リードレプリカ</b>（非同期で読取スケール）は目的が違う。<span class=\"trap\">Multi-AZ（標準）のスタンバイは読み取りに使えない</span></li>\n</ul>\n<h4>疎結合・耐障害設計</h4>\n<ul>\n<li>SQS / SNS / EventBridgeで非同期化、DLQで失敗隔離、<b class=\"key\">指数バックオフ + ジッター</b>でリトライ集中を回避</li>\n<li>ヘルスチェック + Auto Scaling、AWS Fault Injection Serviceでカオス実験し弱点を検証</li>\n<li><b class=\"key\">サービスクォータ</b>の事前確認（DR先でも上限緩和を）</li>\n</ul>\n",
       "oxIds": [
        "ox-3-5-p2-a",
        "ox-3-5-p2-b",
        "ox-3-5-p2-c"
       ]
      },
      {
       "id": "3-5-p3",
       "title": "パフォーマンス改善：ボトルネック特定とキャッシュ・レプリカ",
       "html": "\n<h4>1. まず測る</h4>\n<ul>\n<li>CloudWatch（CPU/ネットワーク/IOPS）、X-Ray（サービス間レイテンシ）、<b class=\"key\">RDS/Aurora Performance Insights</b>（DB負荷＝DBロード、待機イベント、重いSQL）、DevOps Guru（異常検知と推奨）、Compute Optimizer（サイズ・種類の推奨）</li>\n</ul>\n<h4>2. 層ごとの改善</h4>\n<table>\n<tr><th>症状</th><th>対策</th></tr>\n<tr><td>静的/動的コンテンツの遠距離レイテンシ</td><td><b class=\"key\">CloudFront</b>（キャッシュ、オリジンシールド）、グローバルなら Global Accelerator</td></tr>\n<tr><td>DB読取過多</td><td>リードレプリカ（Auroraは最大15、レプリカAuto Scalingも可。RDS MySQL/MariaDB/PostgreSQLも最大15）、<b class=\"key\">ElastiCache</b>（Redis/Valkey, Memcached）</td></tr>\n<tr><td>DynamoDB読取のマイクロ秒化</td><td>DAX（アプリのコード変更はクライアント差し替え程度）</td></tr>\n<tr><td>API Gatewayの繰り返し呼び出し</td><td>ステージのキャッシュ有効化</td></tr>\n<tr><td>Lambda→RDSの接続枯渇</td><td><b class=\"key\">RDS Proxy</b>（接続プーリング、フェイルオーバー時間も短縮）</td></tr>\n<tr><td>DB書込みが限界</td><td>スケールアップ、Aurora、シャーディング、非同期化（SQS）、DynamoDB</td></tr>\n</table>\n<ul>\n<li>キャッシュ戦略：Lazy loading（キャッシュミス時に格納、古くなりうる）/ Write-through（書込み時に更新、常に新しいが無駄なキャッシュも）。Redisは永続化・レプリケーション・フェイルオーバー・多様なデータ型、Memcachedはシンプル・マルチスレッド</li>\n<li><span class=\"trap\">引っ掛け</span>：リードレプリカは<b class=\"key\">読み取り</b>のみ改善。書き込み性能・可用性（自動フェイルオーバー）の解決にはならない（Auroraは例外的にレプリカへフェイルオーバー可能）</li>\n</ul>\n",
       "oxIds": [
        "ox-3-5-p3-a",
        "ox-3-5-p3-b",
        "ox-3-5-p3-c"
       ]
      },
      {
       "id": "3-5-p4",
       "title": "ストレージ・ネットワーク・スケーリングの最適化",
       "html": "\n<h4>ストレージ</h4>\n<ul>\n<li>EBS：gp3は容量と独立にIOPS（基準3,000、最大16,000）・スループットを指定でき、gp2より安価。高IOPS・低レイテンシのDB向けはio2 / io2 Block Express（Multi-Attach対応）。スループット重視は st1、コールドは sc1</li>\n<li><b class=\"key\">インスタンスストア</b>：最高速だが一時的（停止・終了で消える）。キャッシュ・バッファ用途</li>\n<li>S3：プレフィックスあたり 3,500 PUT/5,500 GET 毎秒。並列化・プレフィックス分散で拡張。大容量は<b class=\"key\">マルチパートアップロード</b>、遠隔はTransfer Acceleration、範囲指定GETでの並列取得</li>\n<li>EFS：汎用/最大I/O、スループットモード（Elastic推奨）。HPC/ML共有はFSx for Lustre（S3連携）</li>\n</ul>\n<h4>スケーリング</h4>\n<ul>\n<li>ASG：<b class=\"key\">ターゲット追跡</b>（既定の第一選択。例：CPU 50%）/ ステップ / スケジュール（予測可能な波）/ 予測スケーリング（周期的負荷を事前に増強）/ ウォームプール（起動の遅いアプリの事前初期化）</li>\n<li>キュー処理：SQSの「<b class=\"key\">インスタンスあたりのメッセージ数</b>」カスタムメトリクスで追跡</li>\n<li>Lambda：プロビジョニング済み同時実行でコールドスタート抑制、予約同時実行で上限/確保。SnapStart（Java等）</li>\n<li>DynamoDB：オンデマンド（予測不能）/ プロビジョニング + Auto Scaling。<span class=\"trap\">ホットパーティション</span>はキー設計で解消（書込みシャーディング）</li>\n<li><b class=\"key\">EC2配置グループ</b>：クラスター（低レイテンシ・高帯域）/ パーティション / スプレッド（障害分離）</li>\n</ul>\n",
       "oxIds": [
        "ox-3-5-p4-a",
        "ox-3-5-p4-b",
        "ox-3-5-p4-c"
       ]
      }
     ]
    },
    {
     "id": "3-6",
     "title": "セキュリティ改善（GuardDuty / Inspector / Access Analyzer）",
     "pages": [
      {
       "id": "3-6-p1",
       "title": "セキュリティサービスの使い分け",
       "html": "\n<table>\n<tr><th>サービス</th><th>何を見るか</th></tr>\n<tr><td><b class=\"key\">GuardDuty</b></td><td>CloudTrail/VPCフロー/DNSログ/S3/EKS/Lambda等を分析する脅威検出（侵害されたEC2、不審なAPI、暗号通貨マイニング）。エージェント不要</td></tr>\n<tr><td>Inspector</td><td>EC2・ECRコンテナイメージ・Lambdaの<b class=\"key\">ソフトウェア脆弱性（CVE）とネットワーク到達性</b>を継続スキャン。EC2はSSM Agent利用</td></tr>\n<tr><td>Macie</td><td>S3内の機密データ（PII等）の検出と、S3バケットのセキュリティ/公開状況の評価</td></tr>\n<tr><td><b class=\"key\">Security Hub</b></td><td>各サービスの検出結果を集約・正規化（ASFF）し、CIS/AWS基礎セキュリティのベストプラクティス基準でスコア化。複数アカウント/リージョン集約</td></tr>\n<tr><td>Detective</td><td>検出結果の根本原因調査（グラフ分析）</td></tr>\n<tr><td><b class=\"key\">IAM Access Analyzer</b></td><td>外部/組織外へ公開されているリソースの検出、未使用アクセス検出、ポリシー検証・生成</td></tr>\n<tr><td>Config</td><td>設定の準拠評価と変更履歴</td></tr>\n<tr><td><b class=\"key\">Trusted Advisor</b></td><td>セキュリティを含むベストプラクティスの簡易チェック（SG開放ポート、MFA未設定、公開EBSスナップショット等）</td></tr>\n<tr><td>Firewall Manager</td><td>Organizations全体でWAF/Shield/SG/Network Firewallポリシーを一元適用</td></tr>\n</table>\n<ul>\n<li>組織全体で有効化するには、GuardDuty/Security Hub/Inspector/Macie/Config/Access Analyzerなどの<b class=\"key\">委任管理者</b>を設定し、新規アカウントを自動有効化</li>\n<li><span class=\"trap\">引っ掛け</span>：「S3の機密データ」=Macie、「EC2のCVE」=Inspector、「怪しい挙動」=GuardDuty、「集約ダッシュボード」=Security Hub。名前の似た選択肢を取り違えない</li>\n</ul>\n",
       "oxIds": [
        "ox-3-6-p1-a",
        "ox-3-6-p1-b",
        "ox-3-6-p1-c"
       ]
      },
      {
       "id": "3-6-p2",
       "title": "最小権限への改善：IAM Access Analyzer と権限管理",
       "html": "\n<h4>IAM Access Analyzer</h4>\n<ul>\n<li><b class=\"key\">外部アクセスの検出</b>：S3、IAMロール信頼ポリシー、KMS、SQS、Lambda、Secrets Manager等が信頼ゾーン（アカウント/組織）外と共有されていないか。ゾーンは組織単位も選べる</li>\n<li>未使用アクセスの検出：未使用のロール、アクセスキー、パスワード、権限を検出（有料）</li>\n<li><b class=\"key\">ポリシー生成</b>：CloudTrailのアクティビティから、実際に使われたAPIだけを許可する最小権限ポリシーを生成</li>\n<li>ポリシー検証：文法・セキュリティ警告の確認、<b class=\"key\">カスタムポリシーチェック</b>で変更差分の検査（CI/CDに組み込める）</li>\n</ul>\n<h4>権限境界のレイヤー</h4>\n<table>\n<tr><th>仕組み</th><th>役割</th></tr>\n<tr><td>SCP</td><td>組織/OUの上限を定義。<span class=\"trap\">SCP自体は権限を付与しない</span>。管理アカウントには適用されない</td></tr>\n<tr><td>アクセス許可の境界</td><td>IAMユーザー/ロールの上限。開発者に「ロール作成は可、ただし境界付き」で委任</td></tr>\n<tr><td><b class=\"key\">セッションポリシー</b></td><td>AssumeRole時にさらに絞る</td></tr>\n<tr><td>リソースベースポリシー</td><td>リソース側で許可。同一アカウント内ではIdentityポリシーなしでも許可になりうる</td></tr>\n</table>\n<ul>\n<li>有効な権限＝（SCP ∩ 境界 ∩ セッションポリシー ∩ Identityポリシー）、明示的Denyが最優先</li>\n<li><b class=\"key\">IAMの最終アクセス情報</b>（サービス/アクション）で未使用権限を削除</li>\n<li>人はIAM Identity Center（SSO、一時認証情報）、ワークロードはIAMロール。長期アクセスキーを避ける。MFA、パスワードポリシー、ルートの保護</li>\n</ul>\n",
       "oxIds": [
        "ox-3-6-p2-a",
        "ox-3-6-p2-b",
        "ox-3-6-p2-c"
       ]
      },
      {
       "id": "3-6-p3",
       "title": "データ保護・ネットワーク防御の改善",
       "html": "\n<h4>暗号化と秘密情報</h4>\n<ul>\n<li>KMS：AWS管理キーは自動ローテーション（年次）で制御不可。カスタマー管理キーは自動ローテーション有効化可（既定は年1回、期間指定も可）。キーポリシーが主役。マルチリージョンキーで複数リージョンの同一キー素材（クロスリージョンのDR/グローバルテーブル）。<b class=\"key\">外部キーストア（XKS）</b>やCloudHSMは「自社管理/専用HSM」要件</li>\n<li>Secrets Manager：RDS等の自動ローテーション、クロスリージョンレプリケーション。ACM：証明書の自動更新（ELB/CloudFront/API Gatewayに統合。EC2に直接エクスポートはPrivate証明書など限定）</li>\n<li>S3：ブロックパブリックアクセス（アカウント/バケット）、バケットポリシーでaws:SecureTransportによりHTTPS強制、SSE-KMS、オブジェクトロック（WORM）、<b class=\"key\">アクセスポイント</b>で用途別アクセス</li>\n</ul>\n<h4>ネットワークと入口</h4>\n<ul>\n<li>セキュリティグループ：ステートフル、許可のみ。NACL：ステートレス、許可/拒否、サブネット単位（特定IPのブロックはNACL）</li>\n<li><b class=\"key\">AWS WAF</b>：ALB/API Gateway/CloudFront/AppSyncのL7保護（SQLi/XSS、レートベースルール、Bot Control）。Shield Advanced：DDoS保護、DRT支援、コスト保護</li>\n<li>Network Firewall：VPC境界の詳細検査（ドメインフィルタ、IPS）。VPCエンドポイントとエンドポイントポリシーで、データをインターネットに出さずAWSサービスへ</li>\n<li>CloudFrontの<b class=\"key\">OAC（Origin Access Control）</b>で、S3オリジンへ直接アクセスさせずCloudFront経由のみに</li>\n</ul>\n",
       "oxIds": [
        "ox-3-6-p3-a",
        "ox-3-6-p3-b",
        "ox-3-6-p3-c"
       ]
      },
      {
       "id": "3-6-p4",
       "title": "インシデント対応と継続的な改善",
       "html": "\n<h4>自動対応の流れ</h4>\n<ul>\n<li><b class=\"key\">検知</b>：GuardDuty / Security Hub / Config / Macie</li>\n<li>ルーティング：EventBridgeでフィルタ → Lambda / SSM Automation / Step Functions</li>\n<li><b class=\"key\">封じ込め</b>：SGを隔離用に差し替え、ロールのセッション失効（AWSRevokeOlderSessions）やアクセスキー無効化、NACLでIPブロック</li>\n<li>証拠保全：EBSスナップショット、メモリ取得、インスタンスは終了せず隔離、CloudTrailログ（整合性検証）保全。<span class=\"trap\">侵害インスタンスを即終了すると証拠が失われる</span></li>\n<li><b class=\"key\">調査</b>：Detective、CloudTrail Lake、Athena</li>\n<li>復旧と学習：クリーンなAMIで再構築、根本原因の改善、ランブック更新</li>\n</ul>\n<h4>継続的改善の基盤</h4>\n<ul>\n<li>ログを<b class=\"key\">専用のログアーカイブアカウント</b>へ集約（S3 + オブジェクトロック + MFA削除/KMS）。書込み専用で改ざんを防止</li>\n<li>Security Hubの基準スコアとTrusted Advisorの推奨を定期レビューし、StackSets/Config適合パックで標準化</li>\n<li><b class=\"key\">Systems Manager Patch Manager</b>とInspectorで脆弱性管理を自動化</li>\n<li>Verified Access / Verified Permissions、Cognito等は用途（ゼロトラストアクセス/認可）が出題されたときに識別</li>\n</ul>\n",
       "oxIds": [
        "ox-3-6-p4-a",
        "ox-3-6-p4-b"
       ]
      }
     ]
    },
    {
     "id": "3-7",
     "title": "コスト最適化（Savings Plans / Spot / S3 / Cost Explorer）",
     "pages": [
      {
       "id": "3-7-p1",
       "title": "購入オプション：RI・Savings Plans・Spot",
       "html": "\n<table>\n<tr><th>オプション</th><th>特徴・判断</th></tr>\n<tr><td>オンデマンド</td><td>前払い・コミットなし。短期・予測不能・初期検証</td></tr>\n<tr><td>Compute Savings Plans</td><td>最大約66%割引。1〜3年の時間あたり金額コミット。<b class=\"key\">EC2（ファミリー/サイズ/リージョン/OS/テナンシー不問）、Fargate、Lambda</b>に適用。柔軟性が最高</td></tr>\n<tr><td>EC2 Instance Savings Plans</td><td>特定リージョン・インスタンスファミリーに限定。割引率は高め（最大約72%）</td></tr>\n<tr><td>Standard RI</td><td>最大約72%。ファミリー等固定。<b class=\"key\">Convertible RI</b>は交換可能（割引率は低め、最大約66%）。RI Marketplaceで売却できるのはStandardのみ</td></tr>\n<tr><td>Spot</td><td>最大90%割引。<b class=\"key\">2分前通知</b>で中断されうる。バッチ、CI、ビッグデータ、ステートレスWeb。Spot Fleet/EC2 Fleet/ASG混合インスタンスポリシーで多様化、price-capacity-optimized配分戦略</td></tr>\n<tr><td>Dedicated Hosts</td><td>ソケット/コア単位ライセンスのBYOL、コンプライアンス</td></tr>\n</table>\n<ul>\n<li><b class=\"key\">ゾーン指定RI</b>はキャパシティ予約を伴う。リージョンRIは予約なし（AZ柔軟・サイズ柔軟性あり）。キャパシティが必要ならオンデマンドキャパシティ予約を併用</li>\n<li>RIはRDS、ElastiCache、OpenSearch、Redshiftにもある。SPはSageMakerにも</li>\n<li>基本はベースラインにSP/RI、ピークはオンデマンド/Spotの組み合わせ</li>\n<li><span class=\"trap\">引っ掛け</span>：「将来インスタンスファミリーやリージョンを変える/Fargate・Lambdaも使う」→ Compute Savings Plans。「コミットできない・中断可・耐障害」→ Spot。<b class=\"key\">RIのほうがSPより安い</b>とは限らず、同等割引ならSPの柔軟性が勝つ</li>\n</ul>\n",
       "oxIds": [
        "ox-3-7-p1-a",
        "ox-3-7-p1-b",
        "ox-3-7-p1-c"
       ]
      },
      {
       "id": "3-7-p2",
       "title": "コストの可視化・ガバナンス",
       "html": "\n<table>\n<tr><th>ツール</th><th>用途</th></tr>\n<tr><td><b class=\"key\">Cost Explorer</b></td><td>過去のコスト分析、予測（最大12か月）、RI/SPの購入推奨・カバレッジ/使用率レポート</td></tr>\n<tr><td><b class=\"key\">AWS Budgets</b></td><td>予算超過の通知（実績/予測）。予算アクションでIAM/SCP適用やインスタンス停止を自動実行。RI/SPカバレッジ予算も</td></tr>\n<tr><td>Cost and Usage Report（CUR）</td><td>最も詳細な請求データをS3へ → Athena/QuickSight。Data Exports</td></tr>\n<tr><td><b class=\"key\">Cost Anomaly Detection</b></td><td>ML による異常なコスト急増の検知と通知</td></tr>\n<tr><td>コスト配分タグ</td><td>ユーザー定義タグを<b class=\"key\">有効化（アクティブ化）して初めて</b>請求に反映。<span class=\"trap\">有効化前の期間には遡及しない</span>。タグ付けの強制はタグポリシー/SCP/Configルール</td></tr>\n<tr><td>Compute Optimizer</td><td>EC2/ASG/EBS/Lambda/ECS on Fargate等の適正サイズ推奨（CloudWatchメトリクスに基づく。メモリを見るにはCloudWatch Agent）</td></tr>\n<tr><td>Trusted Advisor</td><td>低使用率EC2、アイドルELB、未使用EBS/EIP等のコスト最適化チェック</td></tr>\n<tr><td><b class=\"key\">Organizations 一括請求</b></td><td>ボリューム割引、RI/SPの割引共有をアカウント間で</td></tr>\n</table>\n<ul>\n<li>Cost Categoriesでコストをチーム/環境に分類、Billing and Cost Managementホーム</li>\n<li>FinOps的に、アカウント構造やタグでショーバック/チャージバックを実現</li>\n</ul>\n",
       "oxIds": [
        "ox-3-7-p2-a",
        "ox-3-7-p2-b",
        "ox-3-7-p2-c"
       ]
      },
      {
       "id": "3-7-p3",
       "title": "ストレージとデータ転送のコスト最適化",
       "html": "\n<h4>S3ストレージクラス</h4>\n<table>\n<tr><th>クラス</th><th>ポイント</th></tr>\n<tr><td>Standard</td><td>頻繁アクセス</td></tr>\n<tr><td><b class=\"key\">Intelligent-Tiering</b></td><td>アクセスパターン不明・変動。自動で階層移動、取り出し料金なし、小額の監視料金（128KB未満は対象外）</td></tr>\n<tr><td>Standard-IA / One Zone-IA</td><td>低頻度。最低30日課金、取り出し料金あり。OneZoneは単一AZなので再作成可能なデータ</td></tr>\n<tr><td><b class=\"key\">Glacier Instant Retrieval</b></td><td>四半期に1回程度、ミリ秒取り出し。最低90日</td></tr>\n<tr><td>Glacier Flexible Retrieval</td><td>分〜時間で取り出し。最低90日</td></tr>\n<tr><td>Glacier Deep Archive</td><td>最安、12〜48時間。最低180日</td></tr>\n</table>\n<ul>\n<li><b class=\"key\">ライフサイクルルール</b>で遷移/期限削除、<span class=\"trap\">不完全なマルチパートアップロードの削除</span>・古いバージョンの失効も設定してコスト削減</li>\n<li>S3 Storage Lensで組織全体の利用状況・コスト効率を分析。Storage Class AnalysisはStandard→Standard-IAの判断材料</li>\n<li>EBS：<b class=\"key\">gp2→gp3</b>、未接続ボリューム/古いスナップショット削除（EBS Snapshots Archive）、Data Lifecycle Managerで自動管理。EFS：IA / Archiveライフサイクル</li>\n</ul>\n<h4>データ転送</h4>\n<ul>\n<li><b class=\"key\">VPCゲートウェイエンドポイント（S3/DynamoDB）</b>は無料。NATゲートウェイのデータ処理料金を回避</li>\n<li>NATゲートウェイはAZごと・時間料金＋処理料金。AZ間通信にも料金。可能な限りAZ内に閉じる</li>\n<li>CloudFront経由のオリジン転送は直接インターネット送信より安価な場合が多く、キャッシュでオリジン負荷も削減</li>\n<li>大量データの初期移行は<b class=\"key\">Snowファミリー</b>/DataSync/Direct Connect（回線の継続転送が多いならDXが安い）</li>\n</ul>\n",
       "oxIds": [
        "ox-3-7-p3-a",
        "ox-3-7-p3-b",
        "ox-3-7-p3-c"
       ]
      },
      {
       "id": "3-7-p4",
       "title": "コンピュート・DB・開発環境の最適化",
       "html": "\n<ul>\n<li><b class=\"key\">ライトサイジング</b>：Compute Optimizer推奨を基に、過剰なインスタンスを縮小。Graviton（Arm）で価格性能比向上（互換性確認要。Lambda、RDS、ElastiCache等も対応）</li>\n<li>Lambda：メモリ=CPU比例。<b class=\"key\">AWS Lambda Power Tuning</b>で最適メモリを探索。常時高負荷ならコンテナ/EC2のほうが安い場合も</li>\n<li>Fargate Spot（中断許容）、ECS/EKSは<b class=\"key\">Karpenter</b>/Cluster Autoscalerでノード統合</li>\n<li>Aurora Serverless v2：変動負荷のDBを細かくスケール。DynamoDBオンデマンド（予測不能）と<b class=\"key\">プロビジョニング+Auto Scaling+Reserved capacity</b>（安定）の選択</li>\n<li>Redshift：RA3（コンピュートとストレージの分離）、Serverless、一時停止（pause）、Spectrumでコールドデータ</li>\n<li><b class=\"key\">開発/検証環境の夜間停止</b>：Instance Scheduler on AWSやEventBridge Scheduler + SSM Automation。本番相当を24時間稼働させない</li>\n<li>Savings Plans/RIは<span class=\"trap\">停止してもコミット分は課金</span>されるので、安定したベースラインにのみ購入</li>\n<li>データ：古いログ/バックアップの保持期間短縮、CloudWatch Logsの保持設定、Glueジョブ、<b class=\"key\">不要なNAT/ELB/EIP</b>（未使用のElastic IPは課金対象）の削除</li>\n</ul>\n<h4>試験での判断</h4>\n<ul>\n<li>「運用変更を最小・割引を確実」→ Savings Plans / RI</li>\n<li>「中断可・最大削減」→ Spot</li>\n<li>「予測不能なアクセス」→ Intelligent-Tiering / オンデマンド系</li>\n<li>「コスト最小」だけで信頼性要件（可用性）を壊す選択肢は誤り</li>\n</ul>\n",
       "oxIds": [
        "ox-3-7-p4-a",
        "ox-3-7-p4-b"
       ]
      }
     ]
    },
    {
     "id": "3-8",
     "title": "トラブルシューティング（ネットワーク・アプリ・データ・権限）",
     "pages": [
      {
       "id": "3-8-p1",
       "title": "ネットワーク接続のトラブルシューティング",
       "html": "\n<h4>「つながらない」の切り分け順序</h4>\n<ol>\n<li><b class=\"key\">ルートテーブル</b>（宛先へのルート、IGW/NAT/TGW/ピアリング）</li>\n<li>セキュリティグループ（ステートフル：戻りは自動許可）</li>\n<li><b class=\"key\">NACL</b>（ステートレス：エフェメラルポート 1024-65535の戻り許可が必要）</li>\n<li>OS内FW、アプリのリッスン、DNS（Route 53 Resolver、プライベートホストゾーン、VPC DNS属性）</li>\n</ol>\n<ul>\n<li>VPC Reachability Analyzer：送信元/宛先を指定し、<b class=\"key\">パケットを送らずに</b>構成を解析して到達可否とブロック箇所を示す</li>\n<li>VPC フローログ：ACCEPT/REJECTを記録。<b class=\"key\">SG拒否とNACL拒否の切り分け</b>に（NACLは戻り通信もREJECTとして見える）。内容（ペイロード）は記録しない。Traffic Mirroringはパケット詳細</li>\n<li>Network Access Analyzer：意図しない到達経路（例：インターネットからDBへ）を検出</li>\n<li><b class=\"key\">Transit Gateway</b>：ルートテーブルの関連付け/伝播、CIDR重複、ピアリングは推移的でない</li>\n<li><b class=\"key\">VPN/Direct Connect</b>：CloudWatchトンネル状態、BGP広告、MTU、冗長化</li>\n<li>パブリックインスタンスがインターネットに出られない → パブリックIP/EIP、IGWへのルート。プライベートはNATのルートと、NATがパブリックサブネットにあるか</li>\n</ul>\n<p><span class=\"trap\">引っ掛け</span>：「SGでは許可しているのに通らない」→ NACLのDeny/エフェメラルポート。「一方向だけ通る」→ NACLのリターン許可漏れ。</p>\n",
       "oxIds": [
        "ox-3-8-p1-a",
        "ox-3-8-p1-b",
        "ox-3-8-p1-c"
       ]
      },
      {
       "id": "3-8-p2",
       "title": "コンピュート・アプリのトラブルシューティング",
       "html": "\n<h4>ロードバランサー</h4>\n<ul>\n<li><b class=\"key\">502 Bad Gateway</b>：ターゲットが不正な応答/接続を突然切断（アプリのkeep-alive設定がLBのアイドルタイムアウトより短い等）</li>\n<li>503 Service Unavailable：<b class=\"key\">正常なターゲットがない</b>、ターゲット未登録（ヘルスチェック失敗）</li>\n<li>504 Gateway Timeout：ターゲットがアイドルタイムアウト内に応答しない（処理が遅い、SG/NACLで到達不可）</li>\n<li>ヘルスチェック失敗：SGでLBからのヘルスチェックポートを許可、パス、応答コード（matcher）、起動猶予（ASGのヘルスチェック猶予期間）</li>\n<li>クライアントIPを保持したい：X-Forwarded-For（ALB）、NLBはクライアントIP保持（ターゲットタイプによる）</li>\n</ul>\n<h4>EC2 / ECS / Lambda</h4>\n<ul>\n<li><b class=\"key\">EC2ステータスチェック</b>：システム（ホスト側 → 復旧/停止起動）とインスタンス（OS側 → 再起動/修正）の2種類</li>\n<li>起動失敗「Client.InternalError」：KMSキー権限不足でEBS暗号化AMIが起動できない等。「InsufficientInstanceCapacity」：AZ/タイプを変える・容量予約</li>\n<li>ECSタスクが起動しない/停止：停止理由（stoppedReason）、タスク実行ロール（ECRプル・ログ出力）、メモリ不足（OOM）、ENI/サブネットIP枯渇、イメージ取得に必要なNAT/VPCエンドポイント</li>\n<li>Lambda：Throttles（同時実行上限、予約同時実行）、Timeout（最大15分）、VPC内Lambdaがインターネットに出られない（NAT必要）、非同期呼び出し失敗は<b class=\"key\">DLQ / 失敗時の宛先</b>、ストリームではバッチ失敗でシャードが詰まる→ 再試行上限/bisect/宛先設定</li>\n<li>CloudFormation失敗：イベントタブで最初のFAILEDを確認。依存関係、IAM権限、上限（クォータ）、名前の重複</li>\n</ul>\n",
       "oxIds": [
        "ox-3-8-p2-a",
        "ox-3-8-p2-b",
        "ox-3-8-p2-c"
       ]
      },
      {
       "id": "3-8-p3",
       "title": "データ層・アクセス拒否のトラブルシューティング",
       "html": "\n<h4>データベース</h4>\n<ul>\n<li>CPU高/遅い：<b class=\"key\">Performance Insights</b>で上位SQLと待機イベント → インデックス、クエリ改善、リードレプリカ、スケールアップ</li>\n<li>接続数上限（Too many connections）：RDS Proxy、コネクション管理、max_connections（メモリに依存）</li>\n<li><b class=\"key\">レプリカラグ</b>：CloudWatch ReplicaLag（Aurora: AuroraReplicaLag）。書込み負荷、レプリカの性能不足、長いクエリ</li>\n<li>ストレージ満杯：ストレージ自動スケーリング（RDS）。IOPS不足：gp3/io2へ変更、Provisioned IOPS</li>\n<li>DynamoDB：ProvisionedThroughputExceeded/スロットリング → ホットキー、キャパシティ、オンデマンド化、DAX、リトライ+指数バックオフ（SDKは自動）。<b class=\"key\">GSIのスロットリング</b>は基底テーブルの書込みも制限</li>\n</ul>\n<h4>アクセス拒否（AccessDenied）</h4>\n<ul>\n<li>評価：明示的Deny → SCP → 境界/セッション → 許可。クロスアカウントは<span class=\"trap\">両側</span>（Identityポリシー + リソースポリシー）で許可が必要</li>\n<li>S3 403：バケットポリシー、ブロックパブリックアクセス、<b class=\"key\">KMSキーポリシー（SSE-KMSのオブジェクトはkms:Decryptも必要）</b>、オブジェクト所有権（ACL）、VPCエンドポイントポリシー</li>\n<li>調査：CloudTrailのerrorCode、IAM Policy Simulator、Access Analyzer、<b class=\"key\">エンコードされた認可メッセージ</b>（sts:DecodeAuthorizationMessage）</li>\n<li>SQS：可視性タイムアウトより処理が長いと二重処理 → 延長/ハートビート。DLQの redrive で再処理。FIFOはグループIDで順序</li>\n<li>クォータ：Service Quotas / Trusted Advisorのサービスクォータチェック。Auto Scalingが増えない原因がEC2上限のことも</li>\n</ul>\n",
       "oxIds": [
        "ox-3-8-p3-a",
        "ox-3-8-p3-b",
        "ox-3-8-p3-c"
       ]
      }
     ]
    }
   ],
   "ox": [
    {
     "id": "ox-3-1-p1-a",
     "lesson": "3-1",
     "text": "EC2のメモリ使用率はCloudWatchの標準メトリクスとして自動収集される。",
     "answer": false,
     "explain": "メモリ・ディスク使用率は標準メトリクスに含まれない。CloudWatch Agentで収集する。"
    },
    {
     "id": "ox-3-1-p1-b",
     "lesson": "3-1",
     "text": "複合アラームは複数のアラーム状態を論理式で組み合わせ、通知のノイズを減らすのに使える。",
     "answer": true,
     "explain": "AND/OR/NOTで束ねて、真に対応が必要な状況のみ通知できる。"
    },
    {
     "id": "ox-3-1-p1-c",
     "lesson": "3-1",
     "text": "CloudWatch Logsのロググループは既定で30日後に自動削除される。",
     "answer": false,
     "explain": "既定は無期限保持。保持期間を明示設定しないとコストが増え続ける。"
    },
    {
     "id": "ox-3-1-p2-a",
     "lesson": "3-1",
     "text": "X-Rayのサービスマップは、分散アプリケーションのどのサービスがレイテンシやエラーの原因かを特定するのに適している。",
     "answer": true,
     "explain": "トレースデータからノード間のレイテンシ・エラー率を可視化する。"
    },
    {
     "id": "ox-3-1-p2-b",
     "lesson": "3-1",
     "text": "CloudWatch Syntheticsのカナリアは、実ユーザーのアクセスがある時のみ可用性を検知できる。",
     "answer": false,
     "explain": "Syntheticsはスクリプトによる合成トラフィックなので、実ユーザーがいなくても検知できる。実ユーザー計測はRUM。"
    },
    {
     "id": "ox-3-1-p2-c",
     "lesson": "3-1",
     "text": "X-Rayのアノテーションはインデックス化され、フィルター式での検索に使える。",
     "answer": true,
     "explain": "アノテーションは検索可能。メタデータは検索対象にならない。"
    },
    {
     "id": "ox-3-1-p3-a",
     "lesson": "3-1",
     "text": "CloudTrailのイベント履歴（コンソール）は管理イベントを過去90日間参照できる。",
     "answer": true,
     "explain": "長期保管には証跡をS3等に作成する。"
    },
    {
     "id": "ox-3-1-p3-b",
     "lesson": "3-1",
     "text": "S3オブジェクトレベルのAPI（GetObject等）は、管理イベント用の証跡を作成するだけで自動的に記録される。",
     "answer": false,
     "explain": "S3オブジェクトレベルはデータイベントで、既定では無効。明示的に有効化が必要。"
    },
    {
     "id": "ox-3-1-p3-c",
     "lesson": "3-1",
     "text": "AWS Configルールは非準拠リソースを検知でき、SSM Automationによる自動修復とも連携できる。",
     "answer": true,
     "explain": "修復アクション（remediation）としてSSM Automationランブックを紐付けられる。"
    },
    {
     "id": "ox-3-1-p4-a",
     "lesson": "3-1",
     "text": "欠損データを異常（breaching）として扱う設定により、メトリクスが途絶えた場合にもアラームを発報させられる。",
     "answer": true,
     "explain": "TreatMissingDataをbreachingにするとデータ途絶をALARMとして扱える。"
    },
    {
     "id": "ox-3-1-p4-b",
     "lesson": "3-1",
     "text": "「誰がセキュリティグループを変更したか」を調べるには、Configの設定タイムラインのみで十分で、CloudTrailは不要である。",
     "answer": false,
     "explain": "Configのタイムラインはいつどう変わったかを示すが、実行者のAPI呼び出し記録はCloudTrailで確認する。"
    },
    {
     "id": "ox-3-2-p1-a",
     "lesson": "3-2",
     "text": "EventBridgeのルールは、イベントパターンだけでなくcron/rate式によるスケジュール起動にも使える。",
     "answer": true,
     "explain": "どちらも可能。大量・単発のスケジュールにはEventBridge Schedulerが適する。"
    },
    {
     "id": "ox-3-2-p1-b",
     "lesson": "3-2",
     "text": "他アカウントのイベントバスへイベントを転送するには、送信元でIAMロールを作成するだけでよく、受信側バスのリソースポリシーは不要である。",
     "answer": false,
     "explain": "受信側のバスのリソースポリシーで送信元アカウントを許可する必要がある。"
    },
    {
     "id": "ox-3-2-p1-c",
     "lesson": "3-2",
     "text": "EventBridgeのアーカイブとリプレイにより、過去のイベントを再度バスに流して再処理できる。",
     "answer": true,
     "explain": "アーカイブしたイベントをリプレイできる。"
    },
    {
     "id": "ox-3-2-p2-a",
     "lesson": "3-2",
     "text": "Session Managerを使うと、セキュリティグループで22番ポートを開けなくてもEC2インスタンスにシェル接続できる。",
     "answer": true,
     "explain": "SSMエージェントからのアウトバウンド通信で接続するため、インバウンド開放不要。"
    },
    {
     "id": "ox-3-2-p2-b",
     "lesson": "3-2",
     "text": "Patch Managerで管理するにはインスタンスにSSM Agentが必要だが、IAM権限は不要である。",
     "answer": false,
     "explain": "インスタンスプロファイル等でSSMへの権限付与が必要。"
    },
    {
     "id": "ox-3-2-p2-c",
     "lesson": "3-2",
     "text": "Parameter Storeは、データベース認証情報の自動ローテーション機能を標準で備えている。",
     "answer": false,
     "explain": "自動ローテーションはSecrets Managerの機能。"
    },
    {
     "id": "ox-3-2-p3-a",
     "lesson": "3-2",
     "text": "Auto Scalingグループは、ELBヘルスチェックを有効にしない限り、EC2のステータスチェックのみで異常を判断する。",
     "answer": true,
     "explain": "既定はEC2ヘルスチェック。アプリ層の異常検知にはELBヘルスチェックの有効化が必要。"
    },
    {
     "id": "ox-3-2-p3-b",
     "lesson": "3-2",
     "text": "EC2の「復旧」アクションはインスタンスストアボリュームのデータも保持したまま復旧させる。",
     "answer": false,
     "explain": "復旧アクションはインスタンスストアを使うインスタンスには対応せず、EBSバックのインスタンスが対象。"
    },
    {
     "id": "ox-3-2-p3-c",
     "lesson": "3-2",
     "text": "Configルールの修復アクションに、SSM Automationランブックを指定して非準拠リソースを自動修復できる。",
     "answer": true,
     "explain": "手動実行も自動実行も設定可能。"
    },
    {
     "id": "ox-3-3-p1-a",
     "lesson": "3-3",
     "text": "CodeBuildがVPC内のプライベートなRDSに接続してテストを実行するには、CodeBuildプロジェクトにVPC設定が必要である。",
     "answer": true,
     "explain": "VPC設定を行うことでVPC内リソースへアクセスできる。"
    },
    {
     "id": "ox-3-3-p1-b",
     "lesson": "3-3",
     "text": "CodePipelineでクロスアカウントデプロイを行う場合、成果物バケットの暗号化にAWS管理キーを使っても別アカウントから復号できる。",
     "answer": false,
     "explain": "AWS管理キーはアカウント間共有できない。カスタマー管理キーでキーポリシーに相手アカウントを許可する。"
    },
    {
     "id": "ox-3-3-p1-c",
     "lesson": "3-3",
     "text": "CodePipelineには本番デプロイ前に人の承認を挟む手動承認アクションがある。",
     "answer": true,
     "explain": "SNS通知と組み合わせて利用する。"
    },
    {
     "id": "ox-3-3-p2-a",
     "lesson": "3-3",
     "text": "CodeDeployのLambdaデプロイでは、エイリアスのトラフィックを段階的に新バージョンへ移すCanaryやLinear設定が使える。",
     "answer": true,
     "explain": "Canary/Linear/AllAtOnceが選べる。"
    },
    {
     "id": "ox-3-3-p2-b",
     "lesson": "3-3",
     "text": "CodeDeployでCloudWatchアラームを自動ロールバックのトリガーに設定することはできない。",
     "answer": false,
     "explain": "アラーム発報時の自動ロールバックを設定できる。"
    },
    {
     "id": "ox-3-3-p2-c",
     "lesson": "3-3",
     "text": "ECSサービスのCodeDeployデプロイは、In-placeとBlue/Greenの両方から選べる。",
     "answer": false,
     "explain": "ECSのCodeDeployデプロイはBlue/Greenのみ。"
    },
    {
     "id": "ox-3-3-p3-a",
     "lesson": "3-3",
     "text": "Elastic Beanstalkのimmutableデプロイは、新しいASGで新インスタンスを起動して検証するため、失敗時のロールバックが容易である。",
     "answer": true,
     "explain": "失敗時は新ASGを終了するだけで元の環境が無傷で残る。"
    },
    {
     "id": "ox-3-3-p3-b",
     "lesson": "3-3",
     "text": "Route 53の加重ルーティングによるBlue/Green切替は、DNSキャッシュの影響を受けず必ず即時に反映される。",
     "answer": false,
     "explain": "TTLやクライアント/リゾルバのキャッシュにより即時でない。"
    },
    {
     "id": "ox-3-3-p3-c",
     "lesson": "3-3",
     "text": "AWS AppConfigは、アプリ設定やフィーチャーフラグをコード再デプロイなしに段階的に配信でき、アラーム連動でロールバックもできる。",
     "answer": true,
     "explain": "AppConfigのデプロイ戦略とCloudWatchアラーム監視による。"
    },
    {
     "id": "ox-3-3-p4-a",
     "lesson": "3-3",
     "text": "EC2 Image Builderは、パッチ適用とテストを含むAMIのビルドを自動化し、複数リージョンへ配布できる。",
     "answer": true,
     "explain": "パイプラインでビルド・テスト・配布を自動化する。"
    },
    {
     "id": "ox-3-3-p4-b",
     "lesson": "3-3",
     "text": "ECRのライフサイクルポリシーにより、古いイメージを自動で削除してストレージコストを抑えられる。",
     "answer": true,
     "explain": "タグ付き/タグなし、保持数や日数などのルールを設定できる。"
    },
    {
     "id": "ox-3-4-p1-a",
     "lesson": "3-4",
     "text": "変更セットを使うと、スタック更新の実行前にリソースが置換されるかどうかを確認できる。",
     "answer": true,
     "explain": "変更セットは追加/変更/削除と置換の有無を事前に提示する。"
    },
    {
     "id": "ox-3-4-p1-b",
     "lesson": "3-4",
     "text": "他のスタックからImportValueされているExport値は、そのスタックを更新して削除できる。",
     "answer": false,
     "explain": "参照されている間はExportの削除・変更はできない。"
    },
    {
     "id": "ox-3-4-p1-c",
     "lesson": "3-4",
     "text": "カスタムリソースのLambdaが応答をResponseURLに返さないと、スタック操作が長時間ハングすることがある。",
     "answer": true,
     "explain": "成功/失敗を必ず返す。削除イベントでも返す。"
    },
    {
     "id": "ox-3-4-p2-a",
     "lesson": "3-4",
     "text": "StackSetsのサービスマネージド権限では、OUに自動デプロイを有効にすると、後からOUに追加された新規アカウントにも自動でスタックが展開される。",
     "answer": true,
     "explain": "Organizations統合の自動デプロイ機能。"
    },
    {
     "id": "ox-3-4-p2-b",
     "lesson": "3-4",
     "text": "StackSetsはOrganizations配下のアカウントにしか使えない。",
     "answer": false,
     "explain": "セルフマネージド権限なら、Organizations外のアカウントにも展開できる。"
    },
    {
     "id": "ox-3-4-p2-c",
     "lesson": "3-4",
     "text": "StackSetsのオペレーション設定で、同時デプロイ数や障害許容数を指定して段階的に展開できる。",
     "answer": true,
     "explain": "Maximum concurrent accounts と Failure tolerance。"
    },
    {
     "id": "ox-3-4-p3-a",
     "lesson": "3-4",
     "text": "CloudFormationのドリフト検出は、検出したドリフトを自動的にテンプレートの内容へ修復する。",
     "answer": false,
     "explain": "検出のみで自動修復はしない。"
    },
    {
     "id": "ox-3-4-p3-b",
     "lesson": "3-4",
     "text": "既存リソースを後からCloudFormation管理下に置くには、リソースインポートを使う。",
     "answer": true,
     "explain": "インポート対象にはDeletionPolicyとリソース識別子が必要。"
    },
    {
     "id": "ox-3-4-p4-a",
     "lesson": "3-4",
     "text": "AWS CDKで定義したインフラは、デプロイ時にCloudFormationテンプレートに変換され、CloudFormationスタックとして管理される。",
     "answer": true,
     "explain": "cdk synthでテンプレート生成、デプロイはCloudFormation経由。"
    },
    {
     "id": "ox-3-4-p4-b",
     "lesson": "3-4",
     "text": "Service Catalogの起動制約を使うと、エンドユーザー本人に広い権限を付与しなくても承認済み製品を起動させられる。",
     "answer": true,
     "explain": "起動制約のIAMロールで製品をプロビジョニングする。"
    },
    {
     "id": "ox-3-4-p4-c",
     "lesson": "3-4",
     "text": "CDKのL1コンストラクトは、既定値や便利メソッドが豊富に用意された高レベルの抽象化である。",
     "answer": false,
     "explain": "L1はCloudFormationリソースそのもの（Cfn接頭辞）。高レベルなのはL2/L3。"
    },
    {
     "id": "ox-3-5-p1-a",
     "lesson": "3-5",
     "text": "Well-Architected Frameworkの柱は、運用上の優秀性、セキュリティ、信頼性、パフォーマンス効率、コスト最適化、持続可能性の6つである。",
     "answer": true,
     "explain": "持続可能性は後から追加された6番目の柱。"
    },
    {
     "id": "ox-3-5-p1-b",
     "lesson": "3-5",
     "text": "Well-Architected Toolは、評価で見つかった高リスク項目を自動的に修正する。",
     "answer": false,
     "explain": "ツールは質問ベースの評価と改善計画の提示を行うのみで、自動修正はしない。"
    },
    {
     "id": "ox-3-5-p1-c",
     "lesson": "3-5",
     "text": "Trusted Advisorの全チェックを利用するには、BusinessまたはEnterprise系のサポートプランが必要である。",
     "answer": true,
     "explain": "Basic/Developerでは一部のコアチェックに限られる。"
    },
    {
     "id": "ox-3-5-p2-a",
     "lesson": "3-5",
     "text": "RDS Multi-AZ配置（標準のインスタンス構成）のスタンバイインスタンスは、読み取りトラフィックの負荷分散に利用できる。",
     "answer": false,
     "explain": "標準のMulti-AZのスタンバイは読み取り不可。読み取りスケールにはリードレプリカ（またはMulti-AZ DBクラスター構成の読み取り可能スタンバイ）を使う。"
    },
    {
     "id": "ox-3-5-p2-b",
     "lesson": "3-5",
     "text": "パイロットライト方式は、縮小版のフル環境を常時稼働させておく方式であり、ウォームスタンバイよりコストが高い。",
     "answer": false,
     "explain": "パイロットライトはコアのみ稼働で、ウォームスタンバイより低コスト。縮小版のフル環境稼働はウォームスタンバイ。"
    },
    {
     "id": "ox-3-5-p2-c",
     "lesson": "3-5",
     "text": "Global Acceleratorは、DNSキャッシュに依存せずエンドポイントのヘルスに基づいてトラフィックを素早く切り替えられる。",
     "answer": true,
     "explain": "エニーキャストIPを使うためDNSのTTLに左右されない。"
    },
    {
     "id": "ox-3-5-p3-a",
     "lesson": "3-5",
     "text": "RDS Performance Insightsは、データベース負荷の原因となっているSQLや待機イベントを特定するのに役立つ。",
     "answer": true,
     "explain": "DBロードを待機イベント/SQL/ホスト別に分析できる。"
    },
    {
     "id": "ox-3-5-p3-b",
     "lesson": "3-5",
     "text": "リードレプリカを追加すれば、データベースの書き込みスループットも向上する。",
     "answer": false,
     "explain": "レプリカは読み取り専用でスケールする。書き込みはプライマリに集中する。"
    },
    {
     "id": "ox-3-5-p3-c",
     "lesson": "3-5",
     "text": "Lambdaから大量にRDSへ接続して接続数が枯渇する問題には、RDS Proxyによる接続プーリングが有効である。",
     "answer": true,
     "explain": "接続を多重化して再利用する。"
    },
    {
     "id": "ox-3-5-p4-a",
     "lesson": "3-5",
     "text": "EBSのgp3ボリュームは、容量とは独立にIOPSとスループットを指定できる。",
     "answer": true,
     "explain": "gp2はIOPSが容量に比例するが、gp3は独立設定でき単価も安い。"
    },
    {
     "id": "ox-3-5-p4-b",
     "lesson": "3-5",
     "text": "DynamoDBのホットパーティション問題は、プロビジョニング済みキャパシティを増やすだけで常に解決する。",
     "answer": false,
     "explain": "特定キーへのアクセス集中が原因なので、キー設計（分散）で解決する必要がある。"
    },
    {
     "id": "ox-3-5-p4-c",
     "lesson": "3-5",
     "text": "Auto Scalingの予測スケーリングは、周期的な負荷パターンに対して事前にキャパシティを増強できる。",
     "answer": true,
     "explain": "過去の負荷から予測して先行スケールする。"
    },
    {
     "id": "ox-3-6-p1-a",
     "lesson": "3-6",
     "text": "Amazon Macieは、S3バケット内のPIIなどの機密データを検出できる。",
     "answer": true,
     "explain": "MacieはS3のデータ分類・機密データ検出サービス。"
    },
    {
     "id": "ox-3-6-p1-b",
     "lesson": "3-6",
     "text": "Inspectorは、VPCフローログやCloudTrailを分析して侵害されたインスタンスなどの脅威を検出する。",
     "answer": false,
     "explain": "それはGuardDutyの役割。InspectorはCVEなどの脆弱性スキャン。"
    },
    {
     "id": "ox-3-6-p1-c",
     "lesson": "3-6",
     "text": "Security Hubは、複数のセキュリティサービスの検出結果を集約し、セキュリティ基準に照らして評価できる。",
     "answer": true,
     "explain": "ASFFで集約し、基準（例：AWS基礎セキュリティのベストプラクティス）でチェックする。"
    },
    {
     "id": "ox-3-6-p2-a",
     "lesson": "3-6",
     "text": "IAM Access Analyzerは、CloudTrailのアクティビティに基づいて実際に使用されたアクションのみを許可するポリシーを生成できる。",
     "answer": true,
     "explain": "ポリシー生成機能。"
    },
    {
     "id": "ox-3-6-p2-b",
     "lesson": "3-6",
     "text": "SCPをOUにアタッチすると、そのOU配下のアカウントのIAMユーザーに自動的にそのSCPで許可した権限が付与される。",
     "answer": false,
     "explain": "SCPは上限を定めるのみで、権限を付与しない。IAMポリシー等での許可も必要。"
    },
    {
     "id": "ox-3-6-p2-c",
     "lesson": "3-6",
     "text": "Organizationsの管理アカウントにはSCPが適用されない。",
     "answer": true,
     "explain": "管理アカウントはSCPの対象外。そのため管理アカウントでワークロードを動かさない。"
    },
    {
     "id": "ox-3-6-p3-a",
     "lesson": "3-6",
     "text": "NACLはステートレスであり、特定のIPアドレスからの通信を明示的に拒否（Deny）できる。",
     "answer": true,
     "explain": "SGは許可ルールのみ。拒否にはNACLやWAFを使う。"
    },
    {
     "id": "ox-3-6-p3-b",
     "lesson": "3-6",
     "text": "AWS管理キーの自動ローテーションは、利用者が有効/無効を切り替えられる。",
     "answer": false,
     "explain": "AWS管理キーのローテーションはAWSが管理し、利用者は制御できない。カスタマー管理キーは設定可能。"
    },
    {
     "id": "ox-3-6-p3-c",
     "lesson": "3-6",
     "text": "S3バケットポリシーでaws:SecureTransportの条件を使うと、HTTPSでないリクエストを拒否できる。",
     "answer": true,
     "explain": "Denyステートメントと条件キーの組み合わせで強制する。"
    },
    {
     "id": "ox-3-6-p4-a",
     "lesson": "3-6",
     "text": "侵害が疑われるEC2インスタンスは、証拠保全のため、直ちに終了（Terminate）するのが最初の対応として適切である。",
     "answer": false,
     "explain": "まず隔離（SG変更等）しスナップショット等で証拠を保全する。終了は証拠喪失につながる。"
    },
    {
     "id": "ox-3-6-p4-b",
     "lesson": "3-6",
     "text": "GuardDutyの検出結果をEventBridgeで受け、LambdaやSSM Automationで自動的に隔離処理を実行できる。",
     "answer": true,
     "explain": "標準的な自動対応パターン。"
    },
    {
     "id": "ox-3-7-p1-a",
     "lesson": "3-7",
     "text": "Compute Savings Plansは、EC2だけでなくFargateとLambdaの使用量にも適用される。",
     "answer": true,
     "explain": "インスタンスファミリー・リージョン不問で、Fargate/Lambdaにも適用。"
    },
    {
     "id": "ox-3-7-p1-b",
     "lesson": "3-7",
     "text": "Spotインスタンスは中断されることがないため、状態を持つ単一インスタンスのDBにも適している。",
     "answer": false,
     "explain": "Spotは2分前通知で中断されうる。ステートレス・耐障害なワークロード向け。"
    },
    {
     "id": "ox-3-7-p1-c",
     "lesson": "3-7",
     "text": "Convertible RIは別のインスタンスファミリーのRIに交換できる。",
     "answer": true,
     "explain": "割引率はStandardより低いが柔軟性がある。"
    },
    {
     "id": "ox-3-7-p2-a",
     "lesson": "3-7",
     "text": "ユーザー定義のコスト配分タグは、有効化した時点以降のコストにのみ反映され、過去分には遡及しない。",
     "answer": true,
     "explain": "有効化してから反映される。"
    },
    {
     "id": "ox-3-7-p2-b",
     "lesson": "3-7",
     "text": "AWS Budgetsは通知のみ可能で、予算超過時に自動でリソースへ制限を適用することはできない。",
     "answer": false,
     "explain": "予算アクションにより、IAMポリシー/SCPの適用やEC2/RDSの停止を自動実行できる。"
    },
    {
     "id": "ox-3-7-p2-c",
     "lesson": "3-7",
     "text": "Compute Optimizerは、メトリクスに基づいてEC2インスタンスの適正サイズを推奨する。",
     "answer": true,
     "explain": "メモリ使用率を考慮するにはCloudWatch Agentが必要。"
    },
    {
     "id": "ox-3-7-p3-a",
     "lesson": "3-7",
     "text": "アクセスパターンが予測できないS3データには、Intelligent-Tieringが適している。",
     "answer": true,
     "explain": "自動で階層を移動し、取り出し料金がかからない。"
    },
    {
     "id": "ox-3-7-p3-b",
     "lesson": "3-7",
     "text": "S3 Standard-IAは、取り出し料金がなく、最低保存期間もない。",
     "answer": false,
     "explain": "取り出し料金があり、最低30日の課金がある。"
    },
    {
     "id": "ox-3-7-p3-c",
     "lesson": "3-7",
     "text": "S3およびDynamoDBへのゲートウェイVPCエンドポイントを使うと、NATゲートウェイ経由のデータ処理料金を削減できる。",
     "answer": true,
     "explain": "ゲートウェイエンドポイントは追加料金なし。"
    },
    {
     "id": "ox-3-7-p4-a",
     "lesson": "3-7",
     "text": "Savings PlansやRIは、対象インスタンスを停止している時間はコミット分の課金が発生しない。",
     "answer": false,
     "explain": "コミットは使用の有無に関わらず課金される。"
    },
    {
     "id": "ox-3-7-p4-b",
     "lesson": "3-7",
     "text": "開発環境を夜間・週末に自動停止する運用は、コスト削減に有効である。",
     "answer": true,
     "explain": "Instance SchedulerやEventBridge Schedulerで実現できる。"
    },
    {
     "id": "ox-3-8-p1-a",
     "lesson": "3-8",
     "text": "VPC Reachability Analyzerは、実際にパケットを送信せずにネットワーク構成を解析し、到達性やブロック箇所を特定する。",
     "answer": true,
     "explain": "構成ベースの静的解析。"
    },
    {
     "id": "ox-3-8-p1-b",
     "lesson": "3-8",
     "text": "NACLはステートフルなので、インバウンドを許可すれば戻りの通信用にエフェメラルポートのアウトバウンド許可は不要である。",
     "answer": false,
     "explain": "NACLはステートレスなので、戻り通信の許可ルールが必要。"
    },
    {
     "id": "ox-3-8-p1-c",
     "lesson": "3-8",
     "text": "VPCフローログはパケットのペイロード内容も記録する。",
     "answer": false,
     "explain": "記録されるのはメタデータ（IP、ポート、プロトコル、ACCEPT/REJECT等）のみ。"
    },
    {
     "id": "ox-3-8-p2-a",
     "lesson": "3-8",
     "text": "ALBが503を返す一般的な原因は、登録された正常なターゲットが存在しないことである。",
     "answer": true,
     "explain": "ターゲット不在/全て異常。"
    },
    {
     "id": "ox-3-8-p2-b",
     "lesson": "3-8",
     "text": "ALBが504を返すのは、ターゲットがアイドルタイムアウト内に応答を返さない場合である。",
     "answer": true,
     "explain": "アプリの処理遅延や到達不可が原因になる。"
    },
    {
     "id": "ox-3-8-p2-c",
     "lesson": "3-8",
     "text": "VPC内に配置したLambda関数は、IGWへのルートのあるパブリックサブネットに置けば、パブリックIPなしでもインターネットに出られる。",
     "answer": false,
     "explain": "Lambda ENIにはパブリックIPが付かない。プライベートサブネット + NATゲートウェイが必要。"
    },
    {
     "id": "ox-3-8-p3-a",
     "lesson": "3-8",
     "text": "SSE-KMSで暗号化されたS3オブジェクトを別アカウントから読むには、S3のポリシーに加えてKMSキーの使用許可（kms:Decrypt等）も必要である。",
     "answer": true,
     "explain": "S3とKMSの両方の許可が必要。"
    },
    {
     "id": "ox-3-8-p3-b",
     "lesson": "3-8",
     "text": "DynamoDBのスロットリングは、パーティション内で特定のキーに偶発的に負荷が集中しても、テーブル全体のキャパシティが十分であれば発生しない。",
     "answer": false,
     "explain": "ホットパーティション/ホットキーでは、全体に余裕があっても個別にスロットリングされうる。"
    },
    {
     "id": "ox-3-8-p3-c",
     "lesson": "3-8",
     "text": "CloudTrailのイベントのerrorCode（AccessDeniedなど）を確認することで、拒否されたAPI呼び出しの調査ができる。",
     "answer": true,
     "explain": "誰がどの操作で拒否されたかを追跡できる。"
    }
   ],
   "mc": [
    {
     "id": "mc-3-001",
     "stem": "ある企業は、Amazon EC2上でJavaアプリケーションを稼働させる200台のインスタンスをAuto Scalingグループで運用しています。運用チームは、メモリ使用率が85%を超えた場合に通知を受け取りたいと考えていますが、現在のCloudWatchダッシュボードにはメモリ使用率が表示されていません。新しいインスタンスにも自動的に同じ設定が適用され、運用オーバーヘッドを最小限にする必要があります。\nどのソリューションが要件を満たしますか。",
     "items": [],
     "choices": [
      "CloudWatchエージェントを起動テンプレートのユーザーデータまたはSystems Manager State Managerで導入し、収集したメモリのカスタムメトリクスにアラームを設定してSNSで通知する。",
      "インスタンスの詳細モニタリングを有効にし、標準のMemoryUtilizationメトリクスに対するCloudWatchアラームを作成する。",
      "AWS Configルールでメモリ使用率を評価し、非準拠時にSNS通知する。",
      "各インスタンスにSSHで接続し、cronでメモリ使用率を取得してPutMetricDataを呼び出すスクリプトを手動で設定する。"
     ],
     "explain": [
      "正解。CloudWatchエージェントでメモリをカスタムメトリクスとして収集し、State Managerで継続的に適用・アラーム化できる。",
      "詳細モニタリングは間隔を1分にするだけで、メモリは標準メトリクスに存在しない。",
      "Configは設定の準拠評価サービスで、メモリ使用率のような実行時メトリクスの監視には使わない。",
      "手動設定はスケールせず、新規インスタンスへの自動適用もできないため運用負荷が高い。"
     ],
     "tip": "EC2のメモリ・ディスクは標準メトリクスに無い。OS内部の値は「CloudWatchエージェント」と覚える。",
     "domain": 3,
     "answer": 1
    },
    {
     "id": "mc-3-002",
     "stem": "ある企業はマイクロサービスをAWS Lambda、Amazon ECS、Amazon DynamoDBで構築しています。最近、特定のAPIで間欠的に遅延が発生していますが、どのサービス呼び出しがボトルネックか不明です。また、アプリケーションログにERRORが1分間に10件以上出力された場合に運用チームへ通知したいと考えています。\n最小限の開発工数で両方の要件を満たすために実施すべき対応を2つ選択してください。",
     "items": [],
     "choices": [
      "AWS X-Rayを有効化（LambdaはアクティブトレースとECSはX-Rayデーモン/ADOT）し、サービスマップとトレースでボトルネックを特定する。",
      "CloudWatch Logsのメトリクスフィルターで「ERROR」を数え、そのメトリクスに対するCloudWatchアラームでSNS通知する。",
      "VPCフローログをAthenaで集計してアプリケーションエラーを検出する。",
      "AWS Configのタイムラインでエラー件数を確認する。",
      "AWS CloudTrailのイベント履歴からAPIレイテンシを分析する。"
     ],
     "explain": [
      "正解。X-Rayはサービス間のレイテンシとエラーを可視化するための分散トレーシングサービス。",
      "正解。メトリクスフィルターでログをメトリクス化し、アラームに接続できる。",
      "フローログはネットワークのメタデータで、アプリケーションエラーの内容は含まれない。",
      "Configはリソース設定の履歴であり、アプリログの件数は扱わない。",
      "CloudTrailはAPIの監査ログであり、アプリケーションの処理遅延分析には向かない。"
     ],
     "tip": "「どこが遅い」＝X-Ray、「ログの文字列で通知」＝メトリクスフィルター+アラーム。",
     "domain": 3,
     "answers": [
      1,
      2
     ],
     "select": 2
    },
    {
     "id": "mc-3-003",
     "stem": "ある金融企業は、AWS Organizationsで400のアカウントを運用しています。コンプライアンス要件として、すべてのアカウントでS3オブジェクトレベルのアクセスを含むAPIアクティビティを7年間保管し、監査人がSQLで直接クエリできるようにする必要があります。アカウントの追加時にも自動で対象となり、監査ログは各アカウントの管理者が削除できないことが求められます。\n最も運用効率の良いソリューションはどれですか。",
     "items": [],
     "choices": [
      "各アカウントでCloudTrail証跡を作成し、アカウント管理者がS3バケットを管理する。",
      "各アカウントのCloudTrailイベント履歴（90日）を毎週エクスポートする。",
      "管理アカウントまたは委任管理者から組織の証跡を作成し、必要なS3データイベントを有効化して、ログアーカイブアカウントのS3バケット（オブジェクトロック）へ保存する。さらにCloudTrail Lakeの組織イベントデータストアでSQLクエリを提供する。",
      "CloudWatch Logsに各アカウントのCloudTrailを送信し、保持期間を7年に設定する。"
     ],
     "explain": [
      "各アカウント管理者が削除できる構成になり、新規アカウントの自動適用もない。",
      "イベント履歴は90日で、手動運用はスケールせず、データイベントも含まれない。",
      "正解。組織の証跡は新規アカウントにも自動適用され、メンバーアカウントは変更できない。Lakeでマネージドなクエリも可能。",
      "各アカウントの個別設定が必要で、コストも高く、アカウント管理者による変更も防げない。"
     ],
     "tip": "「全アカウント・自動適用・削除不可」＝組織の証跡。「SQLで直接」＝CloudTrail Lake。",
     "domain": 3,
     "answer": 3
    },
    {
     "id": "mc-3-004",
     "stem": "ある企業は、AWS Organizations配下の多数のアカウントで、暗号化されていないAmazon EBSボリュームが作成されていないかを継続的に評価し、非準拠のものを自動で是正したいと考えています（新規アカウントも自動対象）。可能な限り既存のAWSマネージド機能を使い、カスタムコードは避けたいと考えています。\nどの構成が最適ですか。",
     "items": [],
     "choices": [
      "AWS Configの適合パックを組織全体にデプロイし、encrypted-volumesルールに自動修復アクション（SSM Automationランブック）を関連付ける。Configアグリゲーターで結果を集約する。",
      "Amazon Inspectorで暗号化されていないボリュームをスキャンする。",
      "AWS Trusted Advisorのレポートを毎週確認し、手動で是正する。",
      "各アカウントでLambda関数を作成し、毎晩EC2 APIを呼び出して暗号化状態を確認する。"
     ],
     "explain": [
      "正解。Config組織適合パック+修復アクション+アグリゲーターで、新規アカウントも含めて自動評価・是正できる。",
      "Inspectorは脆弱性・到達性のスキャンで、EBS暗号化の準拠評価はConfigの役割。",
      "手動で継続的でもなく自動是正にもならない。",
      "カスタムコードの開発・運用が必要で、要件の「マネージド機能のみ」に反する。"
     ],
     "tip": "「設定の準拠評価＋自動修復」＝Config＋SSM Automation。",
     "domain": 3,
     "answer": 1
    },
    {
     "id": "mc-3-005",
     "stem": "ある企業は、10個のAWSアカウントのAmazon EC2状態変化イベントを、セキュリティアカウントのAWS Lambda関数で一元処理したいと考えています。新しいアカウントが追加される可能性があり、ほぼリアルタイムで処理しつつ、運用負荷とコストを最小限にする必要があります。最も適切な方法はどれですか。",
     "items": [],
     "choices": [
      "各アカウントでLambdaを直接実行し、結果をDynamoDBグローバルテーブルに書き込む。",
      "各アカウントのEventBridgeルールでセキュリティアカウントのデフォルトイベントバスをターゲットにし、セキュリティアカウント側のバスのリソースポリシーで送信元アカウントを許可する。セキュリティアカウントでルールを作ってLambdaを起動する。",
      "各アカウントのCloudWatch LogsにイベントをPutし、クロスアカウントのS3レプリケーションで集約する。",
      "セキュリティアカウントのLambdaが各アカウントのEC2を定期的にポーリングする。"
     ],
     "explain": [
      "過剰で分散した構成であり、集中処理にならない。",
      "正解。EventBridgeはクロスアカウントのバス転送に対応し、受信側のリソースポリシーが必要。",
      "S3レプリケーションはイベント処理の仕組みではなく、リアルタイム性もない。",
      "ポーリングは非効率で遅延があり、各アカウントへの権限も必要で運用負荷が高い。"
     ],
     "tip": "クロスアカウントのイベント集約＝EventBridgeのバス転送＋受信側リソースポリシー。",
     "domain": 3,
     "answer": 2
    },
    {
     "id": "mc-3-006",
     "stem": "ある企業は、プライベートサブネットにある500台のLinuxインスタンスを運用しています。セキュリティ要件として、SSHポートの開放、踏み台サーバー、インターネットゲートウェイへのルートは許可されません。運用チームは、OSパッチの計画的な適用と、必要に応じたインスタンスへのシェルアクセス（操作の監査付き）を実現する必要があります。\nどの組み合わせが要件を満たしますか。",
     "items": [],
     "choices": [
      "Systems Managerを使用し、インスタンスプロファイルにAmazonSSMManagedInstanceCoreを付与し、ssm・ssmmessages・ec2messagesのVPCエンドポイントを作成する。Patch Managerとメンテナンスウィンドウでパッチ適用し、Session Managerでシェル接続（ログはS3/CloudWatch Logsへ）する。",
      "EC2 Instance Connectを有効にし、セキュリティグループで22番ポートを企業のIPに限定する。",
      "NATゲートウェイを追加してSSHをポートフォワードする。",
      "踏み台ホストを各VPCに配置し、SSH鍵をSecrets Managerで管理する。"
     ],
     "explain": [
      "正解。インバウンド不要で、VPCエンドポイント経由のため外部経路もなく、監査も可能。",
      "22番ポートの開放が必要で、要件に反する。",
      "NATとSSHは要件に反し、リスクも運用も増える。",
      "踏み台はSSHポートを必要とし、要件に反する。"
     ],
     "tip": "SSH不要・ポート開放なし・監査＝Session Manager。プライベートならVPCエンドポイント3種。",
     "domain": 3,
     "answer": 1
    },
    {
     "id": "mc-3-007",
     "stem": "ある企業のWebアプリケーションは、ALBの背後のAuto Scalingグループで稼働しています。アプリケーションプロセスがハングしてHTTP 5xxを返すインスタンスがありますが、EC2ステータスチェックは正常のため、Auto Scalingがそのインスタンスを置換しません。\n最小の変更で自動的に異常インスタンスを置換するにはどうすればよいですか。",
     "items": [],
     "choices": [
      "CloudWatchアラームでCPUが低いインスタンスを手動で終了する。",
      "スケジュールされたスケーリングで1時間おきにすべてのインスタンスを入れ替える。",
      "ALBのアイドルタイムアウトを延長する。",
      "Auto Scalingグループのヘルスチェックタイプを「ELB」に変更し、ターゲットグループのヘルスチェックをアプリケーションの状態を確認するパスに設定する。"
     ],
     "explain": [
      "手動対応であり、自動修復にならない。",
      "過剰で可用性にも影響し、根本解決でもない。",
      "タイムアウト延長は異常インスタンスの置換とは無関係。",
      "正解。ELBヘルスチェックを有効にすると、ALBが異常と判断したインスタンスもASGが置換する。"
     ],
     "tip": "ASGの既定はEC2ヘルスチェックのみ。アプリ層の異常検知は「ELBヘルスチェックを有効化」。",
     "domain": 3,
     "answer": 4
    },
    {
     "id": "mc-3-008",
     "stem": "プライベートサブネットのEC2インスタンスをSession Managerで管理しようとしていますが、Systems Managerのコンソールにインスタンスが表示されません。インスタンスにはインターネットへの経路がなく、SSM Agentはインストール済みです。\n原因を解決するために必要な対応を2つ選択してください。",
     "items": [],
     "choices": [
      "セキュリティグループのインバウンドで22番ポートを開放する。",
      "インスタンスにパブリックIPを割り当ててIGWにルートを追加する。",
      "VPCにssm、ssmmessages、ec2messagesのインターフェイスVPCエンドポイントを作成し、インスタンスからHTTPS（443）で到達できるようにする。",
      "インスタンスプロファイルにAmazonSSMManagedInstanceCoreなどSSMの権限を持つIAMロールを関連付ける。",
      "CloudTrailの証跡を有効化する。"
     ],
     "explain": [
      "Session Managerは22番を使わない。",
      "要件上インターネット経路は使えず、SSMの前提としても不要。",
      "正解。インターネットなしならVPCエンドポイントが必要。",
      "正解。インスタンスにSSMへの権限が必要。",
      "CloudTrailはSSMの接続可否と関係ない。"
     ],
     "tip": "「SSMに表示されない」＝IAMインスタンスプロファイル or 通信経路（NAT/VPCエンドポイント）を疑う。",
     "domain": 3,
     "answers": [
      3,
      4
     ],
     "select": 2
    },
    {
     "id": "mc-3-009",
     "stem": "ある企業は、AWS Lambda関数をAmazon API Gatewayの背後で提供しています。新バージョンのデプロイ時、まず10%のトラフィックを新バージョンに5分間流し、CloudWatchアラームがALARMにならなければ残りを切り替え、アラーム発生時は自動で元に戻したいと考えています。\n最も運用効率が良い方法はどれですか。",
     "items": [],
     "choices": [
      "API Gatewayのステージを新規作成してDNSを手動で切り替える。",
      "AWS CodeDeployでLambdaエイリアスのCanary10Percent5Minutes配備設定を使用し、アラームによる自動ロールバックを構成する。",
      "手動でLambdaのコードを上書きし、問題があれば再度上書きする。",
      "Route 53の加重ルーティングで新旧のAPI Gatewayを切り替える。"
     ],
     "explain": [
      "手動切替で自動化されていない。",
      "正解。CodeDeployはLambdaのエイリアスの重みを段階的に変え、アラーム連動でロールバックする。",
      "手動で自動ロールバックもなく、リスクが高い。",
      "DNSキャッシュで制御が粗く、アラーム連動の自動ロールバックもない。"
     ],
     "tip": "Lambdaのカナリア＋アラーム自動ロールバック＝CodeDeploy（SAMのDeploymentPreferenceでも可）。",
     "domain": 3,
     "answer": 2
    },
    {
     "id": "mc-3-010",
     "stem": "ある企業はAmazon ECS on Fargateで稼働する本番サービスをCodeDeployのBlue/Greenでデプロイしています。リリース後に重大な不具合が見つかった場合、できるだけ短時間で旧バージョンに戻せるようにしたいと考えています。\n最も適切な設計はどれですか。",
     "items": [],
     "choices": [
      "Blue/Greenデプロイで、旧タスクセットの終了までの待機時間を設定し、問題が見つかった場合はALBのリスナーを旧ターゲットグループに戻す（または停止してロールバックする）。",
      "ECSのローリング更新に切り替え、問題があれば古いタスク定義で更新し直す。",
      "新しいクラスターを作成し、Route 53のTTLを24時間に設定して切り替える。",
      "デプロイのたびにコンテナイメージのタグをlatestに上書きする。"
     ],
     "explain": [
      "正解。旧環境を一定時間保持し、トラフィックを戻すだけでロールバックできる。",
      "ローリングは再デプロイに時間がかかり、即時ロールバックには向かない。",
      "TTLが長いと切替・戻しが遅くなる。",
      "latestの上書きは再現性がなく、ロールバック不可能になる。"
     ],
     "tip": "Blue/Greenの強みは「旧環境が残っているため即時切り戻し」。",
     "domain": 3,
     "answer": 1
    },
    {
     "id": "mc-3-011",
     "stem": "ある企業は、CodePipelineを開発アカウントに置き、本番アカウントのCloudFormationスタックへデプロイするクロスアカウントパイプラインを構築しています。成果物はS3バケットに保存されます。\nこのパイプラインを機能させるために必要な対応を2つ選択してください。",
     "items": [],
     "choices": [
      "成果物バケットの暗号化にカスタマー管理KMSキーを使用し、キーポリシーとバケットポリシーで本番アカウントのロールからのアクセスを許可する。",
      "成果物バケットをAWS管理キー（aws/s3）で暗号化する。",
      "本番アカウントのS3バケットを公開して成果物を配布する。",
      "本番アカウントにパイプラインが引き受けるクロスアカウントIAMロールを作成し、信頼ポリシーで開発アカウントのパイプラインのロールを許可する。",
      "本番アカウントのルートユーザーのアクセスキーをパイプラインに保存する。"
     ],
     "explain": [
      "正解。CMKとポリシーでクロスアカウントのアクセスを許可する。",
      "AWS管理キーは別アカウントと共有できず、本番側で復号できない。",
      "公開は不要で危険。",
      "正解。AssumeRoleでデプロイ先を操作する標準パターン。",
      "ルートのアクセスキーは重大なセキュリティ違反。"
     ],
     "tip": "クロスアカウントCodePipelineは「CMK＋バケット/キーポリシー＋AssumeRoleできるロール」の3点セット。",
     "domain": 3,
     "answers": [
      1,
      4
     ],
     "select": 2
    },
    {
     "id": "mc-3-012",
     "stem": "ある企業は、Elastic Beanstalk上のWebアプリケーション（本番100インスタンス）を更新します。要件は、更新中に処理能力を落とさず、失敗時に既存環境へ影響を与えずに簡単に元へ戻せることです。リソースの一時的な増加は許容されます。\n最も適切なデプロイポリシーはどれですか。",
     "items": [],
     "choices": [
      "In-place by hand",
      "Immutable",
      "Rolling",
      "All at once"
     ],
     "explain": [
      "手動の更新は自動化・再現性・可用性の要件を満たさない。",
      "正解。新しいASGで新インスタンスを起動し、成功後に切替。失敗時は新ASGを破棄するだけ。",
      "バッチごとに容量が低下し、失敗時は一部が更新済みの状態で復旧に手間がかかる。",
      "ダウンタイムが発生し、失敗時の影響が大きい。"
     ],
     "tip": "「容量維持＋簡単ロールバック」＝Immutable（またはBlue/Green）。",
     "domain": 3,
     "answer": 2
    },
    {
     "id": "mc-3-013",
     "stem": "CloudFormationで管理されている本番のAmazon RDSインスタンスについて、チームがテンプレートのプロパティを変更しようとしています。変更内容によっては、RDSインスタンスが置換されデータが失われるリスクがあります。\nデータ損失を防ぐために実施すべき対応を2つ選択してください。",
     "items": [],
     "choices": [
      "更新前に変更セットを作成し、対象リソースのReplacementが「True」でないか確認する。",
      "スタックポリシーを削除する。",
      "RDSリソースにDeletionPolicyとUpdateReplacePolicyをSnapshot（またはRetain）に設定する。",
      "CloudFormationのタイムアウトを延長する。",
      "スタックの更新を直接実行して、問題があればロールバックに任せる。"
     ],
     "explain": [
      "正解。変更セットは置換の有無を事前に確認できる。",
      "スタックポリシーを削除すると保護が弱まる。",
      "正解。置換や削除時にスナップショット/保持しデータを守る。",
      "タイムアウトは無関係。",
      "ロールバックでも置換や削除でデータが消える可能性があり、事前確認が必要。"
     ],
     "tip": "「置換でデータ消失」＝変更セット確認＋UpdateReplacePolicy/DeletionPolicy。",
     "domain": 3,
     "answers": [
      1,
      3
     ],
     "select": 2
    },
    {
     "id": "mc-3-014",
     "stem": "ある企業はAWS Organizationsを使用して数十のアカウントを運用しています。新しいアカウントがOUに追加されたら、自動的にセキュリティ監査用のIAMロールとAWS Configの設定をデプロイしたいと考えています。事前にアカウントごとのIAMロールを手動作成する運用は避けたい要件です。\n最適なソリューションはどれですか。",
     "items": [],
     "choices": [
      "セルフマネージド権限のStackSetsを使用し、各アカウントに実行ロールを事前作成する。",
      "各アカウントでCloudFormationスタックを手動作成する。",
      "サービスマネージド権限のStackSetsを管理（または委任管理）アカウントから作成し、対象OUに自動デプロイを有効にする。",
      "AWS CDKのcdk deployを各アカウントで実行する。"
     ],
     "explain": [
      "事前にロールの作成が必要で要件に反する。",
      "手動で、新規アカウントの自動対応がない。",
      "正解。Organizations統合により、ロール事前作成不要で、新規アカウントにも自動展開される。",
      "アカウントごとの手動実行が必要。"
     ],
     "tip": "「新規アカウントに自動」「IAMロール事前作成なし」＝サービスマネージドStackSets＋自動デプロイ。",
     "domain": 3,
     "answer": 3
    },
    {
     "id": "mc-3-015",
     "stem": "ある企業は、本番アカウントで開発者が手動変更したリソースがCloudFormationテンプレートから乖離していることを懸念しています。構成を定期的に検出し、今後はそのような手動変更を防止したいと考えています。\n要件を満たす対応を2つ選択してください。",
     "items": [],
     "choices": [
      "S3バージョニングを有効にする。",
      "開発者のIAM権限からリソースの直接変更権限を外し、変更はパイプラインのロール経由のみに制限する（IAM/SCP）。",
      "CloudFormationのドリフト検出を定期的に実行する（Configのcloudformation-stack-drift-detection-checkルールなどを利用）。",
      "ドリフト検出を有効にすれば、テンプレートに自動的に戻される。",
      "CloudTrailのログ保持を延長する。"
     ],
     "explain": [
      "バージョニングはCloudFormationの手動変更とは無関係。",
      "正解。予防的統制として権限制限が有効。",
      "正解。ドリフト検出は乖離の検出手段。",
      "ドリフト検出は検出のみで自動修復しない。",
      "記録が増えても手動変更は防げない。"
     ],
     "tip": "ドリフトは「検出」と「予防」を分けて考える。予防はIAM/SCPで直接変更を禁止。",
     "domain": 3,
     "answers": [
      2,
      3
     ],
     "select": 2
    },
    {
     "id": "mc-3-016",
     "stem": "CloudFormationスタックの更新が失敗し、ロールバック中に再びエラーとなってスタックがUPDATE_ROLLBACK_FAILED状態になりました。原因は、手動でリソースが削除されていたことです。\n最も適切な対応はどれですか。",
     "items": [],
     "choices": [
      "スタックポリシーを変更する。",
      "変更セットを作成して更新を再実行する。",
      "スタックを削除して再作成する。",
      "原因を解消した上で、ContinueUpdateRollbackを実行する（必要に応じて問題のリソースをスキップする）。"
     ],
     "explain": [
      "ポリシーは無関係。",
      "UPDATE_ROLLBACK_FAILED状態では更新できない。",
      "本番のデータ損失の可能性があり、最初の手段としては不適切。",
      "正解。ロールバックを再開でき、解決不能なリソースはスキップできる。"
     ],
     "tip": "UPDATE_ROLLBACK_FAILED＝ContinueUpdateRollback。",
     "domain": 3,
     "answer": 4
    },
    {
     "id": "mc-3-017",
     "stem": "ある企業は、us-east-1でAmazon Aurora MySQLを使用するeコマースアプリケーションを運用しています。新しいDR要件として、リージョン障害時にRPOは数秒、RTOは15分以内を目標とし、コストは最小限に抑えたいと考えています。\n最も適切なアーキテクチャはどれですか。",
     "items": [],
     "choices": [
      "両リージョンで完全なActive/Active構成にし、すべての容量を常時フル稼働させる。",
      "別リージョンへ毎日スナップショットをコピーし、障害時に復元する。",
      "オンプレミスにレプリケーションしてDR環境とする。",
      "Aurora Global Databaseでセカンダリリージョンを構成し、セカンダリに最小構成のアプリ層（ウォームスタンバイ）を用意して、障害時にセカンダリをプロモートしRoute 53でフェイルオーバーする。"
     ],
     "explain": [
      "要件は満たすがコストが最大で、「最小限のコスト」に反する。",
      "スナップショット復元ではRPOが最大1日、RTOも長く要件に合わない。",
      "オンプレへのDRは構築・運用が複雑で、RTO15分も難しい。",
      "正解。グローバルDBは通常1秒未満の遅延で、縮小版のアプリ層でコストを抑えつつ分単位のRTOを実現できる。"
     ],
     "tip": "RPO秒・RTO分・コスト意識＝Aurora Global＋ウォームスタンバイ/パイロットライト。",
     "domain": 3,
     "answer": 4
    },
    {
     "id": "mc-3-018",
     "stem": "ある企業のAWS Lambda関数は、RDS for MySQLデータベースへ頻繁に接続します。トラフィックのスパイク時に、データベースの接続数が上限に達してエラーが発生します。アプリケーションの変更は最小限にしたいと考えています。\nどの対応が最も効果的ですか。",
     "items": [],
     "choices": [
      "RDS Proxyを作成し、Lambda関数の接続先をプロキシのエンドポイントに変更する。",
      "Lambdaの予約同時実行をゼロにする。",
      "RDSのインスタンスサイズを最大にしてmax_connectionsを増やす。",
      "リードレプリカを追加してLambdaの書き込みをレプリカに向ける。"
     ],
     "explain": [
      "正解。接続のプーリングと多重化により接続数の急増を吸収できる。",
      "関数が実行されなくなる。",
      "コストが高く、根本的な接続管理の解決にならない。",
      "リードレプリカは読み取り専用で、書き込みはできない。"
     ],
     "tip": "Lambda×RDSの接続枯渇＝RDS Proxy。",
     "domain": 3,
     "answer": 1
    },
    {
     "id": "mc-3-019",
     "stem": "ある企業のゲームアプリケーションは、Amazon DynamoDBに対して非常に読み取りが集中します。平均レイテンシを数ミリ秒からマイクロ秒に短縮したいと考えており、アプリケーションの変更は最小限にしたいです。\n最適なソリューションはどれですか。",
     "items": [],
     "choices": [
      "DynamoDBをAurora MySQLに移行する。",
      "DynamoDB Accelerator（DAX）クラスターを作成し、DAXクライアントを使用するようにする。",
      "DynamoDBのプロビジョニング済み読み取りキャパシティを10倍にする。",
      "ElastiCache for Memcachedを導入し、アプリケーション側でキャッシュ管理ロジックを実装する。"
     ],
     "explain": [
      "大規模な移行でありレイテンシ要件にも不要。",
      "正解。DAXはDynamoDB互換のインメモリキャッシュでマイクロ秒の読み取りを実現し、変更が少ない。",
      "キャパシティはスロットリングを減らすがレイテンシをマイクロ秒にはできない。",
      "可能だがアプリケーション変更が大きい。"
     ],
     "tip": "DynamoDBのマイクロ秒＝DAX。",
     "domain": 3,
     "answer": 2
    },
    {
     "id": "mc-3-020",
     "stem": "ある企業のWebアプリケーションで、ピーク時にレスポンスが遅くなっています。アプリケーションはEC2、ALB、Amazon Aurora PostgreSQLで構成されています。運用チームは、遅延の原因が重いSQLクエリなのか、アプリ層の依存サービスなのかを特定したいと考えています。\n最も効果的な組み合わせを2つ選択してください。",
     "items": [],
     "choices": [
      "AWS X-Rayでアプリケーションをトレースし、各依存呼び出しのレイテンシをサービスマップで確認する。",
      "Amazon RDS Performance Insightsを有効化し、DBロードを占める上位のSQLと待機イベントを確認する。",
      "AWS CloudTrailの管理イベントを確認する。",
      "Amazon Macieを有効化する。",
      "AWS Trusted Advisorのセキュリティチェックを実行する。"
     ],
     "explain": [
      "正解。アプリ層・依存サービスの遅延箇所を特定できる。",
      "正解。DB側のボトルネックのSQL・待機を特定できる。",
      "CloudTrailは監査用でパフォーマンス分析向きではない。",
      "Macieは機密データ検出で無関係。",
      "セキュリティチェックは遅延分析に使えない。"
     ],
     "tip": "ボトルネック特定は「層ごとのツール」で。DB＝Performance Insights、アプリ間＝X-Ray。",
     "domain": 3,
     "answers": [
      1,
      2
     ],
     "select": 2
    },
    {
     "id": "mc-3-021",
     "stem": "ある企業は、S3バケットに格納されたデータに、顧客の個人情報（PII）が意図せず含まれていないかを継続的に検出し、検出時に通知を受け取りたいと考えています。数百のバケットがあり、運用の手間は最小限にしたいです。\n最適な解決策はどれですか。",
     "items": [],
     "choices": [
      "S3のサーバーアクセスログをAthenaで検索する。",
      "Amazon Inspectorを有効化してS3バケットをスキャンする。",
      "GuardDutyでS3のデータを分類する。",
      "Amazon Macieを有効化して機密データ検出ジョブを設定し、検出結果をEventBridge経由でSNSに通知する。"
     ],
     "explain": [
      "アクセスログにデータ内容は含まれず、PII検出には適さない。",
      "Inspectorは脆弱性スキャンでS3内のデータ分類は行わない。",
      "GuardDutyは脅威検出で、データ内容の分類は行わない。",
      "正解。Macieは機密データの検出と通知ができる。"
     ],
     "tip": "S3の機密データ＝Macie。Inspector=脆弱性、GuardDuty=脅威。",
     "domain": 3,
     "answer": 4
    },
    {
     "id": "mc-3-022",
     "stem": "ある企業は、開発チームが作成したIAMロールに広範な権限が付与されていることを懸念しています。ロールは90日間運用されており、その間のCloudTrailログがあります。実際に使用されたアクションのみに絞った最小権限のポリシーを作成したいと考えています。\n最も効率的な方法はどれですか。",
     "items": [],
     "choices": [
      "AdministratorAccessを削除し、ReadOnlyAccessのみを付与する。",
      "すべてのアクションを手作業でレビューする。",
      "Trusted Advisorで生成する。",
      "IAM Access Analyzerのポリシー生成機能を使用して、CloudTrailのアクティビティに基づくポリシーを生成する。"
     ],
     "explain": [
      "必要な書き込み権限が失われて業務が止まる可能性がある。",
      "時間がかかりミスも発生しやすい。",
      "Trusted Advisorにはポリシー生成機能がない。",
      "正解。実際のアクセスに基づく最小権限のポリシーを生成できる。"
     ],
     "tip": "実績ベースの最小権限＝Access Analyzerのポリシー生成。",
     "domain": 3,
     "answer": 4
    },
    {
     "id": "mc-3-023",
     "stem": "ある企業は、AWS Organizationsで複数のアカウントを管理しています。セキュリティチームは、すべてのメンバーアカウントでCloudTrailの停止や組織からの離脱をできなくし、さらにS3バケットのパブリックアクセスを組織全体で確実に防止したいと考えています。\n最も適切な対応を2つ選択してください。",
     "items": [],
     "choices": [
      "管理アカウントにだけSCPを適用する。",
      "Trusted Advisorのアラートのみに頼る。",
      "S3のブロックパブリックアクセスを組織の全アカウントで有効にする（アカウントレベルで設定、またはSCPで設定変更を拒否する）。",
      "各アカウントのIAMユーザーに手動でポリシーを設定する。",
      "SCPで cloudtrail:StopLogging、cloudtrail:DeleteTrail、organizations:LeaveOrganization を拒否するポリシーをOUにアタッチする。"
     ],
     "explain": [
      "管理アカウントにはSCPが適用されず、メンバーアカウントを制御するものでもない。",
      "通知のみでは防止にならない。",
      "正解。ブロックパブリックアクセスを有効化し、SCPで変更を禁止すれば確実。",
      "手動はスケールせず、アカウント管理者が変更できる。",
      "正解。SCPで組織全体の上限を強制できる。"
     ],
     "tip": "「組織全体で防止」＝SCP（予防）。検知はConfig/Security Hub。",
     "domain": 3,
     "answers": [
      3,
      5
     ],
     "select": 2
    },
    {
     "id": "mc-3-024",
     "stem": "GuardDutyが、本番VPC内のEC2インスタンスが暗号通貨マイニングのプールと通信している可能性があるという検出結果を出しました。セキュリティチームは、調査のための証拠を保全しつつ、直ちに被害拡大を防ぐ必要があります。\n最初の対応として最も適切なものはどれですか。",
     "items": [],
     "choices": [
      "インスタンスを直ちに終了する。",
      "インスタンスのIAMロールの削除のみを行う。",
      "インスタンスを再起動する。",
      "インスタンスのセキュリティグループを、すべての通信を拒否する隔離用セキュリティグループに変更し、EBSスナップショットを取得して、インスタンスは調査のために保持する。"
     ],
     "explain": [
      "証拠（メモリ、ディスク状態）が失われる。",
      "通信が継続して被害が続く可能性がある。",
      "メモリ上の証拠が失われ、マルウェアも残る可能性がある。",
      "正解。隔離・証拠保全・調査の流れが適切。EventBridgeとLambdaで自動化できる。"
     ],
     "tip": "インシデント対応は「隔離→保全→調査→復旧」。終了は最後。",
     "domain": 3,
     "answer": 4
    },
    {
     "id": "mc-3-025",
     "stem": "ある企業は、Amazon EC2、AWS Fargate、AWS Lambdaを使用しており、今後1年でEC2のインスタンスファミリーやリージョンを変更する予定です。コンピュート使用量のベースラインは安定しており、コスト削減を最大化しつつ柔軟性を保ちたいと考えています。\n最適な購入オプションはどれですか。",
     "items": [],
     "choices": [
      "Compute Savings Plans（1年）で時間あたりのコミット額をベースラインに設定する",
      "Standard Reserved Instances（1年）",
      "すべてスポットインスタンスにする",
      "EC2 Instance Savings Plans（3年）"
     ],
     "explain": [
      "正解。ファミリー・リージョンを問わず、EC2、Fargate、Lambdaに適用される。",
      "ファミリーやリージョン変更に対応できず、FargateとLambdaにも適用されない。",
      "中断リスクがあり、ベースラインの安定したワークロードの要件に不適。",
      "特定のリージョンとファミリーに固定され、柔軟性要件に反し、FargateやLambdaにも適用されない。"
     ],
     "tip": "柔軟性（ファミリー/リージョン/Fargate/Lambda）＝Compute Savings Plans。",
     "domain": 3,
     "answer": 1
    },
    {
     "id": "mc-3-026",
     "stem": "ある企業は、夜間に実行される大規模なデータ処理バッチジョブを運用しています。ジョブは再試行が可能で中断されても問題なく、各タスクは15分程度で完了します。コストを最小化したいと考えています。\n最適なコンピュート構成はどれですか。",
     "items": [],
     "choices": [
      "オンデマンドインスタンスのみを使用する。",
      "複数のインスタンスタイプとAZを指定したSpotフリート（price-capacity-optimized）または混合インスタンスポリシーのASGを使用する。",
      "3年のStandard Reserved Instancesを購入する。",
      "Dedicated Hostsを使用する。"
     ],
     "explain": [
      "最も高価な選択肢の一つで、コスト最小化に反する。",
      "正解。中断許容のバッチに最適で、多様化により容量確保と中断低減が可能。",
      "夜間のみの使用にRIは非効率。",
      "専有ホストは高価でライセンス要件向け。"
     ],
     "tip": "中断許容・再試行可＝Spot（多様化が定石）。",
     "domain": 3,
     "answer": 2
    },
    {
     "id": "mc-3-027",
     "stem": "ある企業は、アクセスパターンが予測できない約100TBのデータをAmazon S3 Standardに保存しています。コストを削減し、取り出し料金が発生しないようにしたいと考えています。また、過去のマルチパートアップロードの失敗によって未完了のパーツが蓄積されています。\n最も効果的な対応を2つ選択してください。",
     "items": [],
     "choices": [
      "すべてをOne Zone-IAに移行する。",
      "バケットのバージョニングを有効にする。",
      "すべてをS3 Glacier Deep Archiveに移行する。",
      "オブジェクトをS3 Intelligent-Tieringストレージクラスに移行する（ライフサイクルルールで遷移）。",
      "ライフサイクルルールで、不完全なマルチパートアップロードを一定日数後に中止する設定を追加する。"
     ],
     "explain": [
      "取り出し料金があり、単一AZで耐久性・可用性が下がる。",
      "バージョニングはコスト削減にならず、むしろ増える可能性がある。",
      "取り出しに時間がかかり、アクセスが発生しうる要件に合わない。",
      "正解。アクセスパターンが不明でも、取り出し料金なしで自動最適化される。",
      "正解。未完了パーツの課金を削除できる。"
     ],
     "tip": "「アクセス不明＋取り出し料金なし」＝Intelligent-Tiering。不完全MPU削除もセットで覚える。",
     "domain": 3,
     "answers": [
      4,
      5
     ],
     "select": 2
    },
    {
     "id": "mc-3-028",
     "stem": "ある企業のプライベートサブネットのEC2インスタンスは、大量のデータをAmazon S3にアップロードしています。AWSの請求を分析したところ、NATゲートウェイのデータ処理料金が高額であることがわかりました。\nコストを最小化する最も簡単な方法はどれですか。",
     "items": [],
     "choices": [
      "AWS Direct Connectを導入する。",
      "S3 Transfer Accelerationを有効化する。",
      "VPCにS3のゲートウェイエンドポイントを作成し、プライベートサブネットのルートテーブルに追加する。",
      "NATゲートウェイをNATインスタンスに置き換える。"
     ],
     "explain": [
      "コストが高く不要。",
      "加速料金が追加され、NATのコスト問題は解決しない。",
      "正解。ゲートウェイエンドポイントは無料で、S3トラフィックがNATを経由しなくなる。",
      "運用負荷が増え、スケーリング・可用性の課題がある。"
     ],
     "tip": "S3/DynamoDBへのNAT料金対策＝ゲートウェイエンドポイント。",
     "domain": 3,
     "answer": 3
    },
    {
     "id": "mc-3-029",
     "stem": "ある企業は、開発・検証用の複数のAWSアカウントのコスト管理を強化したいと考えています。月次予算の80%に達する予測が出たときにメール通知し、100%に達した場合は、開発用インスタンスを自動的に停止したいと考えています。\n最も運用効率の良い方法はどれですか。",
     "items": [],
     "choices": [
      "Cost Explorerのレポートを毎日確認する。",
      "AWS Budgetsで予算（実績/予測）の通知を設定し、100%超過時にはBudgets Actionsで対象のEC2を停止またはIAM/SCPを適用する。",
      "CloudWatchの請求アラームだけを設定する。",
      "Trusted Advisorのコストチェックを待つ。"
     ],
     "explain": [
      "手動で、自動停止ができない。",
      "正解。予測ベースの通知と予算アクションによる自動対応ができる。",
      "通知のみで自動停止などのアクションがない。",
      "チェックは即時の予算管理に使えず、自動停止もできない。"
     ],
     "tip": "「予算超過で自動アクション」＝AWS Budgets Actions。",
     "domain": 3,
     "answer": 2
    },
    {
     "id": "mc-3-030",
     "stem": "ある企業は、トランジットゲートウェイで接続された2つのVPC間で、アプリケーションが通信できない問題に直面しています。両VPCのセキュリティグループとネットワークACLは許可されているように見えます。運用チームは、パケットを送信せずに構成上の問題箇所を特定したいと考えています。\n最適なツールはどれですか。",
     "items": [],
     "choices": [
      "VPCフローログをAthenaで分析する。",
      "Amazon Inspectorのネットワーク到達性チェック。",
      "VPC Reachability Analyzerで送信元と宛先を指定してパスを分析する。",
      "AWS Trusted Advisorを実行する。"
     ],
     "explain": [
      "実際のトラフィックが発生した結果の記録のみで、構成上のブロック箇所の特定には直接向かない。",
      "InspectorはEC2のインターネット等への到達性評価で、VPC間の接続診断ツールではない。",
      "正解。構成を解析し、到達性とブロックしているコンポーネント（ルートテーブル、TGWなど）を示す。",
      "Trusted Advisorはこのような経路分析をしない。"
     ],
     "tip": "「構成を解析して到達可否」＝Reachability Analyzer。",
     "domain": 3,
     "answer": 3
    },
    {
     "id": "mc-3-031",
     "stem": "ある企業のアカウントAのLambda関数が、アカウントBのS3バケットにあるオブジェクトを読み取ろうとしていますが、AccessDeniedになります。バケットはカスタマー管理KMSキーでSSE-KMS暗号化されています。アカウントAのLambda実行ロールはs3:GetObjectを許可されています。\n問題を解決するために必要な対応を2つ選択してください。",
     "items": [],
     "choices": [
      "アカウントBのバケットポリシーで、アカウントAのLambda実行ロールにs3:GetObjectを許可する。",
      "バケットのパブリックアクセスを許可する。",
      "アカウントBのKMSキーポリシーで、アカウントAのLambda実行ロールにkms:Decryptを許可し、アカウントAのロールにもkms:Decryptを許可する。",
      "Lambdaの同時実行数を増やす。",
      "AWS管理キーに変更し、アカウントAと共有する。"
     ],
     "explain": [
      "正解。クロスアカウントは両側の許可が必要。",
      "過剰でセキュリティリスクが高い。",
      "正解。SSE-KMSではKMSの許可も必要。",
      "AccessDeniedとは無関係。",
      "AWS管理キーは共有できない。"
     ],
     "tip": "クロスアカウント＋SSE-KMS＝「S3の許可」と「KMSの許可」の両方（そして両アカウント側）。",
     "domain": 3,
     "answers": [
      1,
      3
     ],
     "select": 2
    },
    {
     "id": "mc-3-032",
     "stem": "ある企業は、Amazon SQSキューからメッセージを処理するLambda関数を運用しています。処理に最大4分かかることがあり、同じメッセージが重複して処理される現象が発生しています。キューの可視性タイムアウトは30秒です。また、繰り返し失敗するメッセージが他のメッセージ処理を妨げています。\n最適な対応はどれですか。",
     "items": [],
     "choices": [
      "可視性タイムアウトを関数のタイムアウトの6倍以上に設定し、maxReceiveCountを設定したデッドレターキュー（DLQ）を構成する。",
      "メッセージ保持期間を最短にする。",
      "キューをFIFOに変更するだけにする。",
      "Lambdaの同時実行を無制限にする。"
     ],
     "explain": [
      "正解。処理中に再度見えなくなる重複を防ぎ、失敗メッセージはDLQに隔離できる。",
      "保持期間は無関係で、メッセージの喪失の可能性が高まる。",
      "FIFOは順序と重複排除の仕組みで、可視性タイムアウト不足の問題を直接解決しない。",
      "同時実行を増やしても重複処理の原因は解決しない。"
     ],
     "tip": "SQS×Lambdaは「可視性タイムアウト≧関数タイムアウトの6倍」と「DLQ」。",
     "domain": 3,
     "answer": 1
    },
    {
     "id": "mc-3-033",
     "stem": "ある企業は、新しく設計した本番ワークロードがAWSのベストプラクティスに沿っているかを、構造化された質問形式でレビューし、高リスクの項目を特定して改善計画を管理したいと考えています。SaaSワークロード特有の観点も確認したいです。\n最適なアプローチはどれですか。",
     "items": [],
     "choices": [
      "Trusted Advisorのみを使用する。",
      "Amazon Inspectorを実行する。",
      "AWS Well-Architected Toolでワークロードを定義し、SaaSレンズを追加してレビューし、HRIを改善計画として管理する。",
      "CloudFormationのドリフト検出を使用する。"
     ],
     "explain": [
      "Trusted Advisorは自動チェックで、設計の質問型レビューや独自のレンズ追加はできない。",
      "Inspectorは脆弱性スキャン。",
      "正解。複数の柱とレンズでレビューし、高リスク項目の改善を追跡できる。",
      "ドリフト検出はIaCの乖離検出で設計レビューではない。"
     ],
     "tip": "「構造化レビュー、レンズ、HRI」＝Well-Architected Tool。",
     "domain": 3,
     "answer": 3
    },
    {
     "id": "mc-3-034",
     "stem": "ある企業の運用チームは、CloudWatchの複数のアラーム（CPU高、ディスクキュー長、5xxエラー率）から同じ障害に対して大量の通知を受け取り、アラート疲れが発生しています。本当に対応が必要な状況（CPU高かつ5xxエラー率が高い場合）のみ通知したいと考えています。\n最適な解決策はどれですか。",
     "items": [],
     "choices": [
      "通知先をメールからSMSに変える。",
      "アラームの評価期間を短くする。",
      "CloudWatchの複合アラームを作成し、CPU高 AND 5xxエラー率高 の条件でのみ通知し、個別のアラームは通知を抑止する。",
      "すべてのアラームのしきい値を高くする。"
     ],
     "explain": [
      "通知手段の変更はノイズを減らさない。",
      "評価期間を短くするとむしろ通知が増える。",
      "正解。複合アラームで条件を組み合わせノイズを減らせる。",
      "検知漏れが増えて、根本的な解決にならない。"
     ],
     "tip": "アラートノイズ対策＝複合アラーム（AND/OR）。",
     "domain": 3,
     "answer": 3
    }
   ]
  },
  {
   "no": 4,
   "title": "ワークロードの移行とモダナイゼーションの加速",
   "lessons": [
    {
     "id": "4-1",
     "title": "移行戦略・7R・評価ツール",
     "pages": [
      {
       "id": "4-1-p1",
       "title": "7R 移行戦略の使い分け",
       "html": "<h4>7R とは</h4>\n<p>既存アプリケーションごとに「どう移すか」を決めるフレームワークです。試験では<b class=\"key\">要件(期間・コスト・改修可否)から最適な R を選ぶ</b>問題が頻出します。</p>\n<table><tr><th>R</th><th>内容</th><th>典型シナリオ</th></tr>\n<tr><td><b class=\"key\">Rehost</b></td><td>リフト&シフト。変更せず EC2 へ</td><td>期限が短い・データセンター撤退。MGN を使用</td></tr>\n<tr><td><b class=\"key\">Replatform</b></td><td>リフト&リシェイプ。中核は変えず一部をマネージド化</td><td>自前 MySQL を RDS/Aurora、Tomcat を Elastic Beanstalk へ</td></tr>\n<tr><td><b class=\"key\">Refactor / Re-architect</b></td><td>クラウドネイティブに再設計</td><td>スケーラビリティ要件・俊敏性が最優先</td></tr>\n<tr><td>Repurchase</td><td>SaaS 等の別製品に置換</td><td>自社 CRM を Salesforce 等へ</td></tr>\n<tr><td>Retire</td><td>廃止</td><td>ディスカバリで利用されていないと判明したサーバー</td></tr>\n<tr><td>Retain</td><td>当面オンプレミスに残す</td><td>最近更新したばかり・規制・依存関係が未整理</td></tr>\n<tr><td><b class=\"key\">Relocate</b></td><td>ハイパーバイザーレベルで移す</td><td>VMware Cloud on AWS へ VM をそのまま移動</td></tr></table>\n<h4>判断のコツ</h4>\n<ul><li>「アプリを一切変更できない」「最短で」→ Rehost か Relocate(VMware 環境を維持したいなら Relocate)</li>\n<li>「運用負荷を下げたいが大改修は避けたい」→ Replatform</li>\n<li><span class=\"trap\">落とし穴</span>:Relocate は VMware Cloud on AWS(および Amazon EVS)向けで、EC2 への移行は Rehost</li></ul>",
       "oxIds": [
        "ox-4-1-p1-a",
        "ox-4-1-p1-b",
        "ox-4-1-p1-c"
       ]
      },
      {
       "id": "4-1-p2",
       "title": "ディスカバリと評価:ADS・Migration Evaluator",
       "html": "<h4>移行前のアセスメント</h4>\n<table><tr><th>サービス</th><th>役割</th></tr>\n<tr><td><b class=\"key\">AWS Application Discovery Service (ADS)</b></td><td>サーバーの構成・利用状況・プロセス・<b class=\"key\">ネットワーク依存関係</b>を収集。結果は Migration Hub に集約</td></tr>\n<tr><td><b class=\"key\">Migration Evaluator</b></td><td>旧 TSO Logic。利用状況から<b class=\"key\">ビジネスケース(TCO 比較・適正サイズ見積り)</b>を作成</td></tr>\n<tr><td>Migration Hub</td><td>移行の進捗を単一ビューで追跡。移行ツールの状況を集約</td></tr></table>\n<h4>ADS の収集方式</h4>\n<ul><li><b class=\"key\">Agentless Collector</b>(VMware vCenter 経由):エージェント不要。構成・CPU/メモリ等の性能データ。<span class=\"trap\">プロセスやネットワーク接続の詳細は取れない</span></li>\n<li><b class=\"key\">Discovery Agent</b>:各サーバーに導入。実行中プロセス・ネットワーク接続(依存関係)まで取得。物理サーバーや非 VMware にも使える</li></ul>\n<h4>使い分け</h4>\n<ul><li>「依存関係を把握してグルーピング(ウェーブ計画)したい」→ ADS エージェント</li>\n<li>「経営層向けにクラウド移行の費用対効果を示したい」→ Migration Evaluator</li>\n<li>「複数ツールを使った移行全体の進捗を一元管理」→ Migration Hub</li>\n<li>Migration Hub のホームリージョンを選択し、移行データはそこに保存される</li></ul>",
       "oxIds": [
        "ox-4-1-p2-a",
        "ox-4-1-p2-b",
        "ox-4-1-p2-c"
       ]
      },
      {
       "id": "4-1-p3",
       "title": "Migration Hub と移行オーケストレーション",
       "html": "<h4>Migration Hub ファミリー</h4>\n<ul><li>Migration Hub:ADS・MGN・DMS 等の進捗を一元的に追跡。アプリケーション単位でグルーピング</li>\n<li>Migration Hub Orchestrator:移行ワークフローの自動化(例:SAP などのテンプレート、サーバー移行の手順自動化)</li>\n<li><b class=\"key\">Migration Hub Strategy Recommendations</b>:アプリを分析し、<b class=\"key\">推奨する 7R 戦略</b>と移行先を提示(ソースコード・.NET/Java 分析も可能)</li>\n<li><b class=\"key\">Migration Hub Refactor Spaces</b>:<b class=\"key\">Strangler Fig パターン</b>のための環境を構築(API Gateway/NLB・Transit Gateway・クロスアカウント構成を自動化)</li></ul>\n<h4>大規模移行の進め方(ポイント)</h4>\n<ol><li>Assess:ディスカバリ・TCO・7R 決定</li>\n<li>Mobilize:ランディングゾーン構築・体制・スキル整備</li>\n<li>Migrate &amp; Modernize:ウェーブ単位で移行</li></ol>\n<p>AWS の移行支援プログラムとして <b class=\"key\">MAP (Migration Acceleration Program)</b> があり、評価・動員・移行のクレジットや支援を受けられます。</p>\n<span class=\"trap\">落とし穴</span>:「依存するサーバー群を同時に移す」ためウェーブ計画が必要。依存関係を無視した個別移行はレイテンシ問題を招く。<p>※ Migration Hub 関連サービス(Strategy Recommendations、Refactor Spaces など)は、新規提供の状況やコンソール機能が変更される場合があります。試験では各サービスの役割を押さえ、利用可否は最新の公式情報で確認してください。</p>",
       "oxIds": [
        "ox-4-1-p3-a",
        "ox-4-1-p3-b",
        "ox-4-1-p3-c"
       ]
      },
      {
       "id": "4-1-p4",
       "title": "ランディングゾーンとマルチアカウント基盤",
       "html": "<h4>ランディングゾーン</h4>\n<p>移行先となる、セキュアで複数アカウントに分離された設計済み基盤。移行前(Mobilize)に整えます。</p>\n<table><tr><th>要素</th><th>サービス</th></tr>\n<tr><td>全体構築・ガードレール</td><td><b class=\"key\">AWS Control Tower</b>(Organizations・IAM Identity Center・Config・CloudTrail 等を自動構成)</td></tr>\n<tr><td>新規アカウント払い出し</td><td><b class=\"key\">Account Factory</b>(Service Catalog ベース。Account Factory for Terraform もあり)</td></tr>\n<tr><td>予防的制御</td><td><b class=\"key\">SCP</b>(予防)</td></tr>\n<tr><td>発見的制御</td><td><b class=\"key\">AWS Config ルール</b>(検出)</td></tr>\n<tr><td>集約ログ</td><td>Log Archive アカウント、Audit アカウント</td></tr>\n<tr><td>ネットワーク集約</td><td>Transit Gateway・共有サービス VPC・Direct Connect</td></tr></table>\n<h4>設計の要点</h4>\n<ul><li>Control Tower は<b class=\"key\">Organizations が前提</b>。既存の Organization への導入も可能</li>\n<li>OU 単位でコントロール(旧ガードレール)を適用。予防は SCP、検出は Config</li>\n<li>カスタマイズが必要なら Customizations for Control Tower(CfCT)</li>\n<li><span class=\"trap\">落とし穴</span>:SCP は管理アカウントには効かない。許可を付与するものではなく上限を絞るもの</li></ul>",
       "oxIds": [
        "ox-4-1-p4-a",
        "ox-4-1-p4-b",
        "ox-4-1-p4-c"
       ]
      }
     ]
    },
    {
     "id": "4-2",
     "title": "サーバー移行:MGN と VMware",
     "pages": [
      {
       "id": "4-2-p1",
       "title": "Application Migration Service (MGN) の仕組み",
       "html": "<h4>MGN とは</h4>\n<p>物理・仮想・他クラウドのサーバーを<b class=\"key\">ブロックレベルで継続レプリケーション</b>し、EC2 へ Rehost するサービス。旧 CloudEndure Migration の後継で、<b class=\"key\">AWS Server Migration Service (SMS) の後継</b>でもあります。</p>\n<h4>流れ</h4>\n<ol><li>ソースサーバーに AWS Replication Agent を導入</li>\n<li>データは対象リージョンの<b class=\"key\">ステージングエリア(低コストなレプリケーションサーバー + EBS)</b>へ継続レプリケーション</li>\n<li><b class=\"key\">テストカットオーバー</b>で起動テスト(本番へ影響なし)</li>\n<li>カットオーバー(本番切替)。ダウンタイムは<b class=\"key\">数分程度</b></li>\n<li>ステージング資源は後で削除</li></ol>\n<h4>ポイント</h4>\n<ul><li>起動テンプレートでインスタンスタイプ・サブネット・SGを事前定義</li>\n<li>OS・アプリ・データはそのまま。移行後の最適化は別途(Rehost)</li>\n<li>VMware 環境では <b class=\"key\">エージェントレス</b>(vCenter クライアント経由のスナップショットベース)も可</li>\n<li>通信は TCP 443(AWS 接続)と 1500(エージェント → レプリケーションサーバー)。Direct Connect/VPN の経由も可</li>\n<li><span class=\"trap\">落とし穴</span>:バックアップ(AMI 作成)で移行するのではなく継続レプリケーションでカットオーバー時間を最小化する</li></ul>",
       "oxIds": [
        "ox-4-2-p1-a",
        "ox-4-2-p1-b",
        "ox-4-2-p1-c"
       ]
      },
      {
       "id": "4-2-p2",
       "title": "MGN の設計判断と DR との違い",
       "html": "<h4>ネットワーク・セキュリティ設計</h4>\n<ul><li>ステージング用サブネットを準備し、レプリケーションサーバーはそこに起動</li>\n<li>帯域が不足する場合は<b class=\"key\">帯域スロットリング</b>や専用線(Direct Connect)を検討</li>\n<li>IAM ロールで MGN にリソース作成権限を付与(初期化)。<b class=\"key\">暗号化 EBS</b> を使える</li>\n<li>ネットワーク分離環境は <b class=\"key\">Private Link / VPC エンドポイント</b>経由で接続</li></ul>\n<h4>MGN と DRS</h4>\n<table><tr><th></th><th>MGN</th><th>Elastic Disaster Recovery (DRS)</th></tr>\n<tr><td>目的</td><td><b class=\"key\">移行(一度きり)</b></td><td>災害対策(継続保護)</td></tr>\n<tr><td>仕組み</td><td>同じブロックレプリケーション</td><td>同じ。リカバリ用に常時レプリケーション</td></tr>\n<tr><td>終了</td><td>カットオーバー後に完了</td><td>継続。ポイントインタイムリカバリ</td></tr></table>\n<h4>よくある選択</h4>\n<ul><li>「最小ダウンタイムでオンプレの Windows サーバーを EC2 へ」→ MGN</li>\n<li>「VM の OVA/VMDK をインポートして AMI 化」→ VM Import/Export(手動・継続同期なし。小規模向け)</li>\n<li><span class=\"trap\">落とし穴</span>:<b class=\"key\">VM Import/Export</b> は継続レプリケーションがなく、停止時間が長くなる</li></ul>",
       "oxIds": [
        "ox-4-2-p2-a",
        "ox-4-2-p2-b",
        "ox-4-2-p2-c"
       ]
      },
      {
       "id": "4-2-p3",
       "title": "VMware Cloud on AWS・EVS と Relocate",
       "html": "<h4>VMware 環境の移行選択肢</h4>\n<table><tr><th>選択肢</th><th>特徴</th><th>向く場面</th></tr>\n<tr><td><b class=\"key\">VMware Cloud on AWS</b></td><td>AWS 上のベアメタルで VMware SDDC(vSphere/vSAN/NSX)。オンプレと同じ運用ツール。<b class=\"key\">HCX</b> で vMotion 移行</td><td>アプリ変更不可・VMware 運用を継続・短期間</td></tr>\n<tr><td><b class=\"key\">Amazon Elastic VMware Service (EVS)</b></td><td>お客様の VPC 内で VMware Cloud Foundation を稼働。AWS ネイティブサービスと近接</td><td>VMware を使い続けつつ VPC 内で運用したい</td></tr>\n<tr><td><b class=\"key\">MGN で EC2 へ</b></td><td>VM を EC2 へ Rehost(Hypervisor 変更)</td><td>VMware ライセンスから脱却したい</td></tr></table>\n<h4>ポイント</h4>\n<ul><li>Relocate = ハイパーバイザーレベルで<b class=\"key\">変更なし・IP も維持可能(L2 拡張)</b></li>\n<li>HCX で Bulk Migration / vMotion / Replication Assisted vMotion(RAV)</li>\n<li>VMware Cloud on AWS の SDDC は 接続された VPC(ENI)経由で S3・RDS 等に低レイテンシ接続可能</li>\n<li>オンプレ-AWS 接続は Direct Connect か IPsec VPN</li>\n<li><span class=\"trap\">落とし穴</span>:「VMware ライセンス費用を削減」「EC2 に移したい」→ VMware Cloud on AWS ではなく MGN</li></ul>",
       "oxIds": [
        "ox-4-2-p3-a",
        "ox-4-2-p3-b",
        "ox-4-2-p3-c"
       ]
      }
     ]
    },
    {
     "id": "4-3",
     "title": "データベース移行:DMS・SCT・Aurora・DynamoDB",
     "pages": [
      {
       "id": "4-3-p1",
       "title": "DMS の基本:フルロードと CDC",
       "html": "<h4>AWS DMS</h4>\n<p>データベース間のデータ移行・継続レプリケーションを行うマネージドサービス。ソース DB を<b class=\"key\">稼働させたまま</b>移行できます。</p>\n<table><tr><th>移行タイプ</th><th>内容</th></tr>\n<tr><td>Full load</td><td>既存データを一括コピー</td></tr>\n<tr><td>CDC only</td><td>変更のみを継続反映</td></tr>\n<tr><td><b class=\"key\">Full load + CDC</b></td><td>最小ダウンタイム移行の定番。ロード中の変更もキャッチアップ</td></tr></table>\n<h4>構成要素</h4>\n<ul><li>レプリケーションインスタンス(または <b class=\"key\">DMS Serverless</b> で自動スケール)</li>\n<li>ソース/ターゲットエンドポイント、移行タスク</li>\n<li>Multi-AZ で可用性確保、データ検証(Validation)</li>\n<li>ターゲットは RDS/Aurora/Redshift/DynamoDB/S3/Kinesis/OpenSearch など</li></ul>\n<h4>CDC の前提条件(ソース側)</h4>\n<ul><li>MySQL:<b class=\"key\">バイナリログ有効・ROW 形式</b></li>\n<li>Oracle:<b class=\"key\">ARCHIVELOG モード + 補足ロギング</b></li>\n<li>PostgreSQL:論理レプリケーション(wal_level=logical)</li>\n<li>SQL Server:ディストリビューション/MS-CDC 等</li></ul>\n<span class=\"trap\">落とし穴</span>:DMS はスキーマ(ストアドプロシージャ等)を完全には変換しない。異種 DB は SCT/Schema Conversion が必要。",
       "oxIds": [
        "ox-4-3-p1-a",
        "ox-4-3-p1-b",
        "ox-4-3-p1-c"
       ]
      },
      {
       "id": "4-3-p2",
       "title": "異種 DB 移行:SCT と Schema Conversion",
       "html": "<h4>同種 vs 異種</h4>\n<ul><li><b class=\"key\">同種(Homogeneous)</b>:MySQL → Aurora MySQL、Oracle → RDS Oracle など。ネイティブツール(mysqldump、pg_dump、Oracle Data Pump、DMS の homogeneous data migrations)で効率的</li>\n<li><b class=\"key\">異種(Heterogeneous)</b>:Oracle → Aurora PostgreSQL、SQL Server → Aurora PostgreSQL など。<b class=\"key\">スキーマ変換 + データ移行</b>の 2 段階</li></ul>\n<h4>AWS Schema Conversion Tool (SCT)</h4>\n<ul><li>スキーマ(テーブル、ビュー、ストアドプロシージャ、関数)とアプリケーション内の SQL コードを変換</li>\n<li><b class=\"key\">評価レポート</b>で自動変換可能率・手作業が必要な箇所を可視化</li>\n<li>データウェアハウス(Teradata・Oracle DW 等)→ Redshift にも対応。大容量は SCT データ抽出エージェント + <b class=\"key\">Snowball Edge</b></li>\n<li>後継的に DMS Schema Conversion(コンソール内で実行可能)</li></ul>\n<h4>Babelfish for Aurora PostgreSQL</h4>\n<p>SQL Server の T-SQL / TDS プロトコルを<b class=\"key\">アプリ変更最小で</b> Aurora PostgreSQL が受け付ける機能。SQL Server アプリの改修を減らしたい時の選択肢です。</p>\n<h4>典型フロー</h4>\n<ol><li>SCT でスキーマ変換、ターゲットに適用</li><li>DMS で full load + CDC</li><li>アプリをターゲットへ切替(カットオーバー)</li></ol>",
       "oxIds": [
        "ox-4-3-p2-a",
        "ox-4-3-p2-b",
        "ox-4-3-p2-c"
       ]
      },
      {
       "id": "4-3-p3",
       "title": "Aurora への移行と選択",
       "html": "<h4>Aurora を選ぶ理由</h4>\n<ul><li>MySQL/PostgreSQL 互換、<b class=\"key\">最大 15 リードレプリカ</b>、ストレージは 3 AZ に 6 コピー(最大 128TiB まで自動拡張)</li>\n<li>フェイルオーバーが高速。<b class=\"key\">Aurora Global Database</b> でリージョン間レプリケーション</li>\n<li>Aurora Serverless v2 で可変ワークロードに対応</li></ul>\n<h4>移行手段(MySQL/PostgreSQL → Aurora)</h4>\n<table><tr><th>方式</th><th>ダウンタイム</th><th>備考</th></tr>\n<tr><td>RDS のスナップショットから復元</td><td>中</td><td>RDS MySQL/PostgreSQL → Aurora のスナップショット移行</td></tr>\n<tr><td><b class=\"key\">Aurora リードレプリカ作成 → 昇格</b></td><td>小</td><td>RDS MySQL/PostgreSQL のレプリカとして Aurora を作り、同期後に昇格</td></tr>\n<tr><td>Percona XtraBackup(MySQL)→ S3 → Aurora</td><td>中</td><td>オンプレ MySQL の大容量向け</td></tr>\n<tr><td><b class=\"key\">DMS(full load + CDC)</b></td><td>最小</td><td>オンプレ・他クラウド・異種 DB</td></tr></table>\n<h4>注意</h4>\n<ul><li>Aurora はストレージ自動拡張のため事前の容量設計は不要</li>\n<li>リージョン間移行は Global Database/クロスリージョンレプリカ</li>\n<li><span class=\"trap\">落とし穴</span>:Aurora から RDS 等への逆方向移行は DMS や論理ダンプが基本(Aurora は独自のクラスターボリュームを使う)</li></ul>",
       "oxIds": [
        "ox-4-3-p3-a",
        "ox-4-3-p3-b",
        "ox-4-3-p3-c"
       ]
      },
      {
       "id": "4-3-p4",
       "title": "DynamoDB への移行と NoSQL 化",
       "html": "<h4>DynamoDB に移すべきケース</h4>\n<ul><li>キーによるアクセスが中心、<b class=\"key\">1桁ミリ秒の低レイテンシ</b>、スケーラビリティが無制限に近い</li>\n<li>サーバー管理不要、グローバルテーブルでマルチリージョンアクティブ</li>\n<li>JOIN や複雑なトランザクション中心なら Aurora の方が適切(<span class=\"trap\">RDB → DynamoDB は設計変更が必要</span>)</li></ul>\n<h4>移行手段</h4>\n<ul><li>DMS:RDB/MongoDB → DynamoDB。<b class=\"key\">オブジェクトマッピング</b>で属性・キーを定義</li>\n<li><b class=\"key\">S3 からのインポート</b>(DynamoDB Import from S3:CSV/DynamoDB JSON/Ion)。<b class=\"key\">テーブル書き込み容量を消費せず</b>新規テーブルへ</li>\n<li>DynamoDB → S3 エクスポート(PITR 有効が前提)</li>\n<li>MongoDB 互換が必要なら <b class=\"key\">Amazon DocumentDB</b></li></ul>\n<h4>設計判断</h4>\n<table><tr><th>要件</th><th>選択</th></tr>\n<tr><td>SQL・JOIN・既存 RDB アプリを維持</td><td>Aurora/RDS</td></tr>\n<tr><td>サーバーレス・単純なキー検索・大規模</td><td>DynamoDB</td></tr>\n<tr><td>MongoDB ワークロード</td><td>DocumentDB</td></tr>\n<tr><td>Cassandra</td><td>Amazon Keyspaces</td></tr></table>",
       "oxIds": [
        "ox-4-3-p4-a",
        "ox-4-3-p4-b",
        "ox-4-3-p4-c"
       ]
      }
     ]
    },
    {
     "id": "4-4",
     "title": "データ移行:DataSync・Transfer Family・Snow・Storage Gateway",
     "pages": [
      {
       "id": "4-4-p1",
       "title": "転送時間の見積りとネットワーク設計",
       "html": "<h4>まず計算する</h4>\n<p>転送時間 ≒ データ量 ÷ (回線帯域 × 実効利用率)。<b class=\"key\">100TB を 1Gbps で全帯域使うと約 9〜10 日</b>。実効 80% なら約 12 日、他業務と共用なら更に延びます。</p>\n<table><tr><th>状況</th><th>選択</th></tr>\n<tr><td>数 TB 以下・回線に余裕・継続的</td><td>DataSync / S3 直接アップロード</td></tr>\n<tr><td>数十〜数百 TB・回線が細い・期限が短い</td><td><b class=\"key\">Snowball Edge</b>(オフライン)</td></tr>\n<tr><td>継続的に大量転送・安定帯域・低レイテンシ</td><td><b class=\"key\">Direct Connect</b>(専用接続は 1/10/100 Gbps)</td></tr>\n<tr><td>Direct Connect の開通までのつなぎ</td><td>Site-to-Site VPN / Snowball</td></tr></table>\n<h4>設計の要点</h4>\n<ul><li>Direct Connect は開通に<b class=\"key\">数週間〜</b>かかる → 期限が短い場合は Snow が有利</li>\n<li>Direct Connect は暗号化されない → 必要なら <b class=\"key\">VPN over DX</b>(または MACsec 対応専用接続)</li>\n<li>S3 への単一アップロードはマルチパートアップロード、並列化で高速化。遠隔地は <b class=\"key\">S3 Transfer Acceleration</b></li>\n<li>Public VIF で S3 パブリックエンドポイント、Private VIF + S3 インターフェイスエンドポイントでプライベート経由</li></ul>\n<span class=\"trap\">落とし穴</span>:「帯域を増強するしかない」と選ばせても、期限・コスト要件次第で Snow Family が正解になる。",
       "oxIds": [
        "ox-4-4-p1-a",
        "ox-4-4-p1-b",
        "ox-4-4-p1-c"
       ]
      },
      {
       "id": "4-4-p2",
       "title": "AWS DataSync と Transfer Family",
       "html": "<h4>AWS DataSync</h4>\n<ul><li>オンプレ NFS/SMB/HDFS/オブジェクトストレージ ↔ <b class=\"key\">S3・EFS・FSx</b> を高速・自動化して転送(エージェントをオンプレに配置)</li>\n<li>スケジュール実行、<b class=\"key\">帯域制限</b>、整合性検証、メタデータ(権限・タイムスタンプ)保持、差分転送</li>\n<li>AWS 内ストレージ間(S3 ⇔ EFS など)や他クラウドとも転送可。接続は VPC エンドポイント(プライベート)可</li>\n<li>S3 へ書く際にストレージクラスを指定可能(例:Glacier)</li></ul>\n<h4>AWS Transfer Family</h4>\n<ul><li><b class=\"key\">SFTP / FTPS / FTP / AS2</b> のマネージドサーバー。バックエンドは <b class=\"key\">S3 または EFS</b></li>\n<li>既存パートナーが使う FTP クライアントや認証(<b class=\"key\">Active Directory/カスタム IdP</b>)をそのまま利用</li>\n<li>用途:「パートナーからのファイル受領を S3 へ」「既存 SFTP サーバーの置換」</li></ul>\n<table><tr><th>要件</th><th>サービス</th></tr>\n<tr><td>一括移行・定期同期</td><td>DataSync</td></tr>\n<tr><td>外部パートナーの SFTP 受付</td><td>Transfer Family</td></tr>\n<tr><td>ハイブリッドで S3 をファイル共有として使う</td><td>Storage Gateway</td></tr></table>\n<span class=\"trap\">落とし穴</span>:Transfer Family は移行ツールではなくプロトコル受付サービス。大量の一括移行は DataSync。",
       "oxIds": [
        "ox-4-4-p2-a",
        "ox-4-4-p2-b",
        "ox-4-4-p2-c"
       ]
      },
      {
       "id": "4-4-p3",
       "title": "Snow Family と Storage Gateway",
       "html": "<h4>Snow Family</h4>\n<table><tr><th>デバイス</th><th>容量・特徴</th></tr>\n<tr><td><b class=\"key\">Snowball Edge Storage Optimized</b></td><td>最大約 210TB の NVMe ストレージ。大容量移行向け</td></tr>\n<tr><td><b class=\"key\">Snowball Edge Compute Optimized</b></td><td>EC2 / Lambda をエッジで実行。GPU 版あり</td></tr>\n<tr><td>Snowcone</td><td>小型(約 8TB HDD / 14TB SSD)。持ち運び・過酷な環境</td></tr></table>\n<ul><li>データは<b class=\"key\">自動で暗号化</b>(KMS)。返送後 S3 に取り込み</li>\n<li>複数台並列で数百 TB〜PB。S3 にインポート後は DataSync で差分同期する運用も</li>\n<li>Snowball Edge は EC2 AMI を載せてエッジ処理、またはクラスターとして耐久性確保</li>\n<li>OpsHub でデバイス管理</li></ul>\n<h4>Storage Gateway</h4>\n<table><tr><th>種類</th><th>用途</th></tr>\n<tr><td><b class=\"key\">S3 File Gateway</b></td><td>NFS/SMB で S3 にオブジェクトとして保存。キャッシュ</td></tr>\n<tr><td>FSx File Gateway</td><td>オンプレから FSx for Windows への低レイテンシアクセス</td></tr>\n<tr><td>Volume Gateway</td><td>iSCSI。<b class=\"key\">Cached</b>(主データは S3、頻用をキャッシュ)/<b class=\"key\">Stored</b>(主データはオンプレ、非同期で S3 にバックアップ)</td></tr>\n<tr><td>Tape Gateway</td><td>既存バックアップソフトの VTL を S3/Glacier へ</td></tr></table>\n<span class=\"trap\">落とし穴</span>:Snowmobile は提供終了(新規利用不可)。Snow Family は提供状況が変わるため、試験では「オフライン大容量転送」の位置付けで理解する。",
       "oxIds": [
        "ox-4-4-p3-a",
        "ox-4-4-p3-b",
        "ox-4-4-p3-c"
       ]
      },
      {
       "id": "4-4-p4",
       "title": "移行ツールの選択まとめ",
       "html": "<h4>決め手早見表</h4>\n<table><tr><th>シナリオ</th><th>最適解</th></tr>\n<tr><td>オンプレ NFS → S3/EFS に定期同期</td><td><b class=\"key\">DataSync</b></td></tr>\n<tr><td>回線 100Mbps で 200TB、1 か月以内</td><td><b class=\"key\">Snowball Edge</b>(複数台)</td></tr>\n<tr><td>オンプレのアプリは残しつつ、バックアップ先に S3 をファイルとして使いたい</td><td>S3 File Gateway</td></tr>\n<tr><td>既存バックアップのテープ廃止</td><td><b class=\"key\">Tape Gateway</b></td></tr>\n<tr><td>FTP 受付を AWS へ</td><td>Transfer Family</td></tr>\n<tr><td>データベースを無停止で</td><td>DMS</td></tr>\n<tr><td>サーバーごと</td><td>MGN</td></tr>\n<tr><td>Windows ファイルサーバーを置換</td><td>FSx for Windows(DataSync で移行)</td></tr>\n<tr><td>HPC・Lustre 互換</td><td>FSx for Lustre</td></tr></table>\n<h4>引っ掛けパターン</h4>\n<ul><li><span class=\"trap\">Storage Gateway はデータ移行ツールではなく、ハイブリッド統合(継続利用)のためのもの</span></li>\n<li>Snow は<b class=\"key\">往復の配送日数</b>があるため、「数日以内」の要件には向かない</li>\n<li>DataSync はファイルレベル。DB やサーバーイメージは対象外</li>\n<li>混在(Snow で初期転送 + DataSync/DMS で差分)はよく出る正解パターン</li></ul>",
       "oxIds": [
        "ox-4-4-p4-a",
        "ox-4-4-p4-b",
        "ox-4-4-p4-c"
       ]
      }
     ]
    },
    {
     "id": "4-5",
     "title": "モダナイゼーション:コンテナ・サーバーレス・メインフレーム",
     "pages": [
      {
       "id": "4-5-p1",
       "title": "モダナイゼーションの進め方と Strangler Fig",
       "html": "<h4>モダナイゼーションの方向性</h4>\n<ul><li><b class=\"key\">コンテナ化</b>:ECS / EKS / Fargate。OS 依存のアプリを移植性高く</li>\n<li><b class=\"key\">サーバーレス化</b>:Lambda・API Gateway・Step Functions・EventBridge・DynamoDB</li>\n<li>マネージド DB 化:RDS・Aurora・DynamoDB</li>\n<li>マイクロサービス化:疎結合(SQS/SNS/EventBridge)</li></ul>\n<h4>Strangler Fig パターン</h4>\n<p>モノリスを<b class=\"key\">一括書き換えせず</b>、機能単位で新サービスへ段階的に切り出し、ルーティングを徐々に新側へ切替える手法。</p>\n<ul><li>前段に <b class=\"key\">ALB / API Gateway / CloudFront</b> を置き、パス単位で新旧に振り分け</li>\n<li>リスクを小さくでき、いつでもロールバック可能</li>\n<li>AWS では <b class=\"key\">Migration Hub Refactor Spaces</b> が環境構築を自動化</li>\n<li>データ同期に DMS CDC や EventBridge を使うことも</li></ul>\n<h4>判断基準</h4>\n<table><tr><th>要件</th><th>方針</th></tr>\n<tr><td>大規模システムを止められず段階移行</td><td>Strangler Fig</td></tr>\n<tr><td>全面刷新に数年・ビジネスリスクが高い</td><td>Strangler Fig で段階化</td></tr>\n<tr><td>短期間で移行</td><td>Rehost 後にモダナイズ</td></tr></table>\n<span class=\"trap\">落とし穴</span>:「ビッグバン書き換え」は選択肢にあっても、ダウンタイム・リスク要件では誤答になりやすい。",
       "oxIds": [
        "ox-4-5-p1-a",
        "ox-4-5-p1-b",
        "ox-4-5-p1-c"
       ]
      },
      {
       "id": "4-5-p2",
       "title": "コンテナ化:App2Container と ECS/EKS/Fargate",
       "html": "<h4>AWS App2Container (A2C)</h4>\n<ul><li>オンプレ/EC2 上の<b class=\"key\">.NET (Windows) / Java アプリ</b>を分析し、コンテナイメージ + デプロイ成果物を自動生成するコマンドラインツール</li>\n<li>出力は ECR 登録・ECS/EKS 向け CloudFormation/Kubernetes マニフェスト、CI/CD パイプライン</li>\n<li>ソースコード改修不要。<b class=\"key\">コンテナ化を最小努力で</b>始めたい時の答え</li></ul>\n<h4>コンテナ基盤の選択</h4>\n<table><tr><th>選択</th><th>特徴</th></tr>\n<tr><td><b class=\"key\">ECS on Fargate</b></td><td>サーバー管理不要。AWS ネイティブ、シンプル</td></tr>\n<tr><td>ECS on EC2</td><td>ホストの細かい制御、GPU、コスト最適化(Spot・RI)</td></tr>\n<tr><td><b class=\"key\">EKS</b></td><td>Kubernetes 互換・マルチクラウド/オンプレ(EKS Anywhere)との一貫性</td></tr>\n<tr><td><b class=\"key\">App Runner</b></td><td>コンテナ/ソースから Web アプリを最も簡単に公開</td></tr>\n<tr><td><b class=\"key\">Elastic Beanstalk</b></td><td>コード(Java/.NET 等)をアップするだけ。Replatform</td></tr></table>\n<h4>ポイント</h4>\n<ul><li>Windows コンテナは EC2 起動タイプや Fargate(Windows)でサポート</li>\n<li>既存が Kubernetes → EKS、AWS 固有で単純 → ECS</li>\n<li>イメージは ECR(スキャン・ライフサイクル・レプリケーション)</li></ul>",
       "oxIds": [
        "ox-4-5-p2-a",
        "ox-4-5-p2-b",
        "ox-4-5-p2-c"
       ]
      },
      {
       "id": "4-5-p3",
       "title": "サーバーレス化とアプリ・データのモダナイズ",
       "html": "<h4>サーバーレス移行の考え方</h4>\n<ul><li>バッチ・イベント駆動 → <b class=\"key\">Lambda + EventBridge / S3 / SQS</b></li>\n<li>REST API → <b class=\"key\">API Gateway + Lambda</b>(または Lambda 関数 URL)</li>\n<li>長時間ワークフロー・オーケストレーション → <b class=\"key\">Step Functions</b></li>\n<li>メッセージング(ActiveMQ/RabbitMQ 等) → <b class=\"key\">Amazon MQ</b>(互換のまま Replatform)/ SQS・SNS(Refactor)</li>\n<li>ETL → AWS Glue、ストリーム → Kinesis / MSK</li></ul>\n<h4>Lambda の制約(引っ掛け)</h4>\n<ul><li>最大実行時間 <b class=\"key\">15 分</b>。これを超える処理は Fargate/Step Functions/Batch</li>\n<li>メモリは最大 10GB、/tmp は最大 10GB、デプロイパッケージ制限あり(コンテナイメージは 10GB)</li>\n<li>コールドスタート対策に Provisioned Concurrency / SnapStart</li></ul>\n<h4>データのモダナイズ</h4>\n<table><tr><th>現状</th><th>移行先</th></tr>\n<tr><td>自前の Hadoop</td><td>EMR(+ S3 データレイク)</td></tr>\n<tr><td>オンプレ DWH</td><td>Redshift</td></tr>\n<tr><td>Redis/Memcached 自前</td><td>ElastiCache / MemoryDB</td></tr>\n<tr><td>Elasticsearch 自前</td><td>OpenSearch Service</td></tr>\n<tr><td>Kafka 自前</td><td>MSK</td></tr></table>",
       "oxIds": [
        "ox-4-5-p3-a",
        "ox-4-5-p3-b",
        "ox-4-5-p3-c"
       ]
      },
      {
       "id": "4-5-p4",
       "title": "メインフレーム移行 (M2)",
       "html": "<h4>AWS Mainframe Modernization (M2)</h4>\n<p>COBOL / PL/I 等のメインフレームアプリを AWS に移行・近代化するマネージドサービス。2 つのパターン:</p>\n<table><tr><th>パターン</th><th>内容</th></tr>\n<tr><td><b class=\"key\">Replatform</b>(再プラットフォーム)</td><td>COBOL コードを<b class=\"key\">ほぼそのまま</b>、互換ランタイム(Rocket Software 等)上で実行。改修を最小に</td></tr>\n<tr><td><b class=\"key\">Automated Refactor</b>(自動リファクタリング)</td><td>COBOL を <b class=\"key\">Java</b> に自動変換(AWS Blu Age)。クラウドネイティブ化・マイクロサービス化を見据える</td></tr></table>\n<h4>周辺のポイント</h4>\n<ul><li>M2 には開発/テスト/ランタイム環境が含まれ、<b class=\"key\">Multi-AZ・自動スケーリング</b>に対応</li>\n<li>データ:VSAM・DB2 → DMS 等で Aurora / RDS / DynamoDB へ。ファイルは S3・EFS・FSx</li>\n<li>ジョブ(JCL)・オンライン(CICS)を取り込む</li>\n<li>評価は Migration Hub Strategy Recommendations / AWS Transform 等で</li>\n<li>ライセンス・ハードウェア保守費(MIPS 課金)の削減が主な動機</li></ul>\n<h4>選択の判断</h4>\n<ul><li>「期間・リスク最小、コード変更したくない」→ Replatform</li>\n<li>「Java 化して継続的にモダナイズ、スキル確保」→ Automated Refactor</li>\n<li><span class=\"trap\">落とし穴</span>:EC2 に Hercules などのエミュレータを手作りする案は運用負荷が高く、マネージドの M2 が優先</li></ul>",
       "oxIds": [
        "ox-4-5-p4-a",
        "ox-4-5-p4-b",
        "ox-4-5-p4-c"
       ]
      }
     ]
    },
    {
     "id": "4-6",
     "title": "ライセンス・コスト見積り・TCO",
     "pages": [
      {
       "id": "4-6-p1",
       "title": "ライセンス戦略:BYOL・License Included・Dedicated Host",
       "html": "<h4>基本の選択</h4>\n<table><tr><th>モデル</th><th>内容</th></tr>\n<tr><td>License Included (LI)</td><td>Windows Server / SQL Server 等の料金がインスタンス料金に含まれる。従量で簡単</td></tr>\n<tr><td><b class=\"key\">BYOL</b></td><td>既存ライセンスを持ち込む。ライセンス条件(ソケット/コア固定)を満たす必要あり</td></tr></table>\n<h4>Dedicated Host / Dedicated Instance</h4>\n<ul><li><b class=\"key\">Dedicated Host</b>:物理サーバー全体を専有。<b class=\"key\">ソケット・コア・ホスト ID が可視化</b>され、ソケット/コア単位のライセンス(Windows Server、SQL Server、Oracle の一部など)の BYOL に必要</li>\n<li><b class=\"key\">Dedicated Instance</b>:ハードウェア専有だがホスト ID・ソケット可視化なし。<span class=\"trap\">BYOL には不十分な場合が多い</span></li>\n<li><b class=\"key\">AWS License Manager</b>:ライセンスルールを定義し使用量を追跡・制限(Dedicated Host の自動管理、組織横断)</li></ul>\n<h4>RDS でのライセンス</h4>\n<ul><li>RDS for Oracle:LI(SE2)または BYOL(SE2・EE)</li>\n<li>RDS for SQL Server:<b class=\"key\">License Included のみ</b>(通常の RDS では BYOL 不可。Dedicated Host を使いたい、BYOL が必要 → RDS Custom for SQL Server 等 or EC2)</li>\n<li>Aurora/PostgreSQL へ移行すれば商用 DB ライセンス費用を削減可能</li></ul>\n<h4>コスト最適化</h4>\n<ul><li>SQL Server on EC2:Optimize CPUs で vCPU を減らし(コア数削減)ライセンスを節約</li>\n<li>Windows の LI を使う vs BYOL は利用規約・ソフトウェアアシュアランス(SA)条件に依存 → License Mobility の適格性</li></ul>",
       "oxIds": [
        "ox-4-6-p1-a",
        "ox-4-6-p1-b",
        "ox-4-6-p1-c"
       ]
      },
      {
       "id": "4-6-p2",
       "title": "コスト見積りと TCO の考え方",
       "html": "<h4>TCO に含めるべき項目</h4>\n<ul><li>オンプレ側:ハードウェア償却、データセンター(電力・冷却・ラック)、保守、ネットワーク、<b class=\"key\">人件費</b>、ライセンス、DR 拠点</li>\n<li>AWS 側:コンピュート、ストレージ、データ転送(<b class=\"key\">アウトバウンド</b>課金)、サポート、移行費用、<b class=\"key\">二重稼働期間</b></li>\n<li><b class=\"key\">Migration Evaluator</b> が利用実績からオンプレ費用と AWS 費用を比較するビジネスケースを作成</li></ul>\n<h4>ツールの使い分け</h4>\n<table><tr><th>ツール</th><th>用途</th></tr>\n<tr><td>AWS Pricing Calculator</td><td>構成ごとの月額見積り</td></tr>\n<tr><td>Migration Evaluator</td><td>既存環境の実測に基づく TCO/ビジネスケース</td></tr>\n<tr><td>Cost Explorer / Budgets</td><td>移行後のコスト把握・予算管理</td></tr>\n<tr><td>Compute Optimizer</td><td>移行後のライトサイジング</td></tr>\n<tr><td>Savings Plans / RI</td><td>安定ワークロードの割引(1年・3年)</td></tr></table>\n<h4>コスト削減の判断</h4>\n<ul><li>利用率が低いサーバーは<b class=\"key\">ライトサイジング</b>してから購入オプションを決める(順序が重要)</li>\n<li>DR 用は Pilot Light/Warm Standby でオンプレ DR 拠点より安価に</li>\n<li>データ転送:インバウンドは無料、<b class=\"key\">インターネットへのアウトバウンドは有料</b>。Direct Connect 経由は転送単価が低い</li>\n<li><span class=\"trap\">落とし穴</span>:移行直後はオンプレ・AWS の二重コストが発生する。TCO では移行期間も含める</li></ul>",
       "oxIds": [
        "ox-4-6-p2-a",
        "ox-4-6-p2-b",
        "ox-4-6-p2-c"
       ]
      },
      {
       "id": "4-6-p3",
       "title": "移行プロジェクトの落とし穴総まとめ",
       "html": "<h4>試験でよく出る判断軸</h4>\n<table><tr><th>キーワード</th><th>答えの方向性</th></tr>\n<tr><td>最小ダウンタイム・DB</td><td>DMS (full load + CDC)</td></tr>\n<tr><td>最小ダウンタイム・サーバー</td><td>MGN</td></tr>\n<tr><td>アプリ変更不可・VMware</td><td>VMware Cloud on AWS(Relocate)</td></tr>\n<tr><td>異種 DB・スキーマ変換</td><td>SCT / DMS Schema Conversion</td></tr>\n<tr><td>依存関係の把握</td><td>ADS(エージェント方式)</td></tr>\n<tr><td>運用負荷削減・最小改修</td><td>Replatform(RDS・Beanstalk)</td></tr>\n<tr><td>段階的刷新</td><td>Strangler Fig</td></tr>\n<tr><td>COBOL</td><td>M2</td></tr>\n<tr><td>BYOL・ソケット単位</td><td>Dedicated Host + License Manager</td></tr></table>\n<h4>セキュリティと運用の落とし穴</h4>\n<ul><li>移行中の転送データは<b class=\"key\">TLS/暗号化</b>を確保(DMS は SSL、Snow は自動暗号化)</li>\n<li>DMS のレプリケーションインスタンスは<b class=\"key\">ソースとターゲットに到達可能な VPC・SG</b>に配置</li>\n<li>カットオーバー前に<b class=\"key\">ロールバック計画</b>とテストを実施</li>\n<li>移行後の最適化(Well-Architected 再評価)までが移行プロジェクト</li></ul>\n<h4>最後に:要件キーワードを拾う</h4>\n<p>「最短」「最小コスト」「運用負荷最小」「アプリ変更なし」「無停止」のうち<b class=\"key\">最優先の制約</b>を見つけ、他の選択肢を消去していきます。</p>",
       "oxIds": [
        "ox-4-6-p3-a",
        "ox-4-6-p3-b",
        "ox-4-6-p3-c"
       ]
      }
     ]
    }
   ],
   "ox": [
    {
     "id": "ox-4-1-p1-a",
     "lesson": "4-1",
     "text": "Relocate は、VM を変更せずに EC2 インスタンスへ移行する戦略である。",
     "answer": false,
     "explain": "Relocate はハイパーバイザーレベルの移動(VMware Cloud on AWS 等)。EC2 への変更なし移行は Rehost。"
    },
    {
     "id": "ox-4-1-p1-b",
     "lesson": "4-1",
     "text": "オンプレミスの MySQL を Amazon RDS for MySQL に移すのは典型的な Replatform である。",
     "answer": true,
     "explain": "アプリの中核は変えずデータベースだけマネージド化するため Replatform。"
    },
    {
     "id": "ox-4-1-p1-c",
     "lesson": "4-1",
     "text": "ディスカバリで利用実績がないと判明したサーバーは Retain に分類する。",
     "answer": false,
     "explain": "利用されていないものは Retire(廃止)。Retain は残すと決めたもの。"
    },
    {
     "id": "ox-4-1-p2-a",
     "lesson": "4-1",
     "text": "Application Discovery Service のエージェントレスコレクターは、サーバー上のプロセスとネットワーク依存関係の詳細を収集できる。",
     "answer": false,
     "explain": "プロセス・ネットワーク接続の詳細はエージェント方式の機能。"
    },
    {
     "id": "ox-4-1-p2-b",
     "lesson": "4-1",
     "text": "Migration Evaluator は現状の利用状況に基づく TCO 比較のビジネスケース作成に使う。",
     "answer": true,
     "explain": "Migration Evaluator の主目的。"
    },
    {
     "id": "ox-4-1-p2-c",
     "lesson": "4-1",
     "text": "Migration Hub は移行そのものを実行するサービスである。",
     "answer": false,
     "explain": "Migration Hub は進捗追跡・可視化の集約先で、実際の移行は MGN や DMS 等が行う。"
    },
    {
     "id": "ox-4-1-p3-a",
     "lesson": "4-1",
     "text": "Migration Hub Strategy Recommendations は、アプリごとに推奨の移行戦略を提示する。",
     "answer": true,
     "explain": "分析に基づき 7R の推奨を提示する。"
    },
    {
     "id": "ox-4-1-p3-b",
     "lesson": "4-1",
     "text": "Strangler Fig パターンのルーティング環境構築を支援するのは Migration Hub Orchestrator である。",
     "answer": false,
     "explain": "Refactor Spaces が該当。Orchestrator はワークフロー自動化。"
    },
    {
     "id": "ox-4-1-p3-c",
     "lesson": "4-1",
     "text": "MAP は移行の評価・動員・実行フェーズを支援する AWS のプログラムである。",
     "answer": true,
     "explain": "クレジット等の支援を含む。"
    },
    {
     "id": "ox-4-1-p4-a",
     "lesson": "4-1",
     "text": "Control Tower の予防的コントロールは SCP、発見的コントロールは AWS Config ルールで実装される。",
     "answer": true,
     "explain": "その通り。"
    },
    {
     "id": "ox-4-1-p4-b",
     "lesson": "4-1",
     "text": "SCP は Organizations の管理アカウントにも適用される。",
     "answer": false,
     "explain": "管理アカウントには適用されない。"
    },
    {
     "id": "ox-4-1-p4-c",
     "lesson": "4-1",
     "text": "ランディングゾーンは、移行を開始した後に整備するのが一般的である。",
     "answer": false,
     "explain": "移行前の Mobilize フェーズで整備する。"
    },
    {
     "id": "ox-4-2-p1-a",
     "lesson": "4-2",
     "text": "MGN はスナップショット取得後に一度だけコピーし、変更差分は反映しない。",
     "answer": false,
     "explain": "継続的なブロックレベルレプリケーションで差分も反映する。"
    },
    {
     "id": "ox-4-2-p1-b",
     "lesson": "4-2",
     "text": "MGN のテストカットオーバーは、本番サーバーの稼働に影響せず実施できる。",
     "answer": true,
     "explain": "テストインスタンスを起動して検証するだけで、ソースは稼働し続ける。"
    },
    {
     "id": "ox-4-2-p1-c",
     "lesson": "4-2",
     "text": "MGN は AWS Server Migration Service (SMS) の後継サービスである。",
     "answer": true,
     "explain": "SMS は終了し MGN へ移行。"
    },
    {
     "id": "ox-4-2-p2-a",
     "lesson": "4-2",
     "text": "Elastic Disaster Recovery と MGN は同様のレプリケーション技術を用いるが、目的が異なる。",
     "answer": true,
     "explain": "移行か継続的 DR かの違い。"
    },
    {
     "id": "ox-4-2-p2-b",
     "lesson": "4-2",
     "text": "VM Import/Export は継続的な差分レプリケーションにより最小ダウンタイム移行を実現する。",
     "answer": false,
     "explain": "VM Import/Export は継続同期を行わない。"
    },
    {
     "id": "ox-4-2-p2-c",
     "lesson": "4-2",
     "text": "MGN のレプリケーションサーバーはステージングサブネットに作成される。",
     "answer": true,
     "explain": "低コストなステージングエリアを使う。"
    },
    {
     "id": "ox-4-2-p3-a",
     "lesson": "4-2",
     "text": "VMware Cloud on AWS では、HCX を使って VM を再構成せずにオンプレミスから移行できる。",
     "answer": true,
     "explain": "HCX による vMotion/一括移行が可能。"
    },
    {
     "id": "ox-4-2-p3-b",
     "lesson": "4-2",
     "text": "VMware ライセンスから脱却したい場合は VMware Cloud on AWS が最適である。",
     "answer": false,
     "explain": "EC2 へ Rehost する MGN が適切。"
    },
    {
     "id": "ox-4-2-p3-c",
     "lesson": "4-2",
     "text": "Amazon EVS は VMware Cloud Foundation をお客様の Amazon VPC 内で稼働させる。",
     "answer": true,
     "explain": "EVS の特徴。"
    },
    {
     "id": "ox-4-3-p1-a",
     "lesson": "4-3",
     "text": "Full load + CDC を使うと、移行中もソース DB の更新を継続できる。",
     "answer": true,
     "explain": "CDC で変更をキャッチアップする。"
    },
    {
     "id": "ox-4-3-p1-b",
     "lesson": "4-3",
     "text": "MySQL ソースで CDC を使う場合、バイナリログは STATEMENT 形式にする必要がある。",
     "answer": false,
     "explain": "ROW 形式が必要。"
    },
    {
     "id": "ox-4-3-p1-c",
     "lesson": "4-3",
     "text": "DMS は異種 DB 間のストアドプロシージャを自動で完全変換する。",
     "answer": false,
     "explain": "スキーマ変換は SCT/DMS Schema Conversion の役割で、完全自動とは限らない。"
    },
    {
     "id": "ox-4-3-p2-a",
     "lesson": "4-3",
     "text": "SCT はアプリケーションコード内の SQL を変換する機能も持つ。",
     "answer": true,
     "explain": "埋め込み SQL の変換と評価が可能。"
    },
    {
     "id": "ox-4-3-p2-b",
     "lesson": "4-3",
     "text": "Babelfish for Aurora PostgreSQL は、SQL Server アプリの T-SQL をほぼ変更せずに利用可能にする機能である。",
     "answer": true,
     "explain": "TDS・T-SQL 互換。"
    },
    {
     "id": "ox-4-3-p2-c",
     "lesson": "4-3",
     "text": "Oracle から Aurora PostgreSQL への移行では、DMS だけでスキーマ変換まで完結する。",
     "answer": false,
     "explain": "スキーマ変換には SCT/Schema Conversion を併用する。"
    },
    {
     "id": "ox-4-3-p3-a",
     "lesson": "4-3",
     "text": "RDS for MySQL から Aurora MySQL へは、Aurora リードレプリカを作成して昇格する方法でダウンタイムを小さくできる。",
     "answer": true,
     "explain": "レプリケーション同期後に昇格する。"
    },
    {
     "id": "ox-4-3-p3-b",
     "lesson": "4-3",
     "text": "Aurora は事前に必要なストレージ容量を指定してプロビジョニングする必要がある。",
     "answer": false,
     "explain": "自動拡張される。"
    },
    {
     "id": "ox-4-3-p3-c",
     "lesson": "4-3",
     "text": "オンプレミスの Oracle から Aurora MySQL への移行には SCT と DMS を使う。",
     "answer": true,
     "explain": "異種移行の定番。"
    },
    {
     "id": "ox-4-3-p4-a",
     "lesson": "4-3",
     "text": "DynamoDB の S3 インポートは新規テーブルを作成し、書き込みキャパシティを消費しない。",
     "answer": true,
     "explain": "インポート機能の特徴。"
    },
    {
     "id": "ox-4-3-p4-b",
     "lesson": "4-3",
     "text": "RDB から DynamoDB への移行は、スキーマ変更なしで DMS により自動完結する。",
     "answer": false,
     "explain": "キー設計・オブジェクトマッピングなどデータモデル再設計が必要。"
    },
    {
     "id": "ox-4-3-p4-c",
     "lesson": "4-3",
     "text": "MongoDB 互換のワークロードには Amazon DocumentDB が適している。",
     "answer": true,
     "explain": "MongoDB API 互換。"
    },
    {
     "id": "ox-4-4-p1-a",
     "lesson": "4-4",
     "text": "100TB を 1Gbps 回線で転送する場合、理論上の最短でも約 9 日かかる。",
     "answer": true,
     "explain": "800,000Gb ÷ 1Gbps ≒ 約 9.3 日。"
    },
    {
     "id": "ox-4-4-p1-b",
     "lesson": "4-4",
     "text": "Direct Connect の接続は標準で IPsec により暗号化される。",
     "answer": false,
     "explain": "標準では暗号化されない。VPN over DX 等を併用する。"
    },
    {
     "id": "ox-4-4-p1-c",
     "lesson": "4-4",
     "text": "転送期限が短く回線が細い場合は、オフライン転送の Snowball Edge が有力である。",
     "answer": true,
     "explain": "ネットワーク転送が間に合わない場合。"
    },
    {
     "id": "ox-4-4-p2-a",
     "lesson": "4-4",
     "text": "DataSync は転送データの整合性検証と帯域制限をサポートする。",
     "answer": true,
     "explain": "いずれも標準機能。"
    },
    {
     "id": "ox-4-4-p2-b",
     "lesson": "4-4",
     "text": "Transfer Family は SFTP をサポートするが、バックエンドストレージは S3 のみである。",
     "answer": false,
     "explain": "EFS もサポート。"
    },
    {
     "id": "ox-4-4-p2-c",
     "lesson": "4-4",
     "text": "既存パートナーが利用中の SFTP 受付を AWS に置換するには Transfer Family が適している。",
     "answer": true,
     "explain": "クライアント側変更を最小にできる。"
    },
    {
     "id": "ox-4-4-p3-a",
     "lesson": "4-4",
     "text": "Volume Gateway の Stored モードでは、主データはオンプレミスに保持され、S3 に非同期バックアップされる。",
     "answer": true,
     "explain": "Cached は主データが S3 側。"
    },
    {
     "id": "ox-4-4-p3-b",
     "lesson": "4-4",
     "text": "Tape Gateway は既存のバックアップソフトウェアを変更せずにクラウドへテープ保管できる。",
     "answer": true,
     "explain": "VTL として動作する。"
    },
    {
     "id": "ox-4-4-p3-c",
     "lesson": "4-4",
     "text": "Snowball Edge に保存されたデータは暗号化されず、返送前に手動で暗号化する必要がある。",
     "answer": false,
     "explain": "自動で暗号化される。"
    },
    {
     "id": "ox-4-4-p4-a",
     "lesson": "4-4",
     "text": "Storage Gateway は大規模データ移行を目的として最も一般的に使われる。",
     "answer": false,
     "explain": "ハイブリッド統合・継続利用が主目的。"
    },
    {
     "id": "ox-4-4-p4-b",
     "lesson": "4-4",
     "text": "初期データを Snowball Edge で送り、その後の差分を DataSync で同期する構成は有効である。",
     "answer": true,
     "explain": "一般的な併用パターン。"
    },
    {
     "id": "ox-4-4-p4-c",
     "lesson": "4-4",
     "text": "DataSync はデータベースエンジンの変更を伴う移行に使える。",
     "answer": false,
     "explain": "ファイルレベルの転送。DB は DMS。"
    },
    {
     "id": "ox-4-5-p1-a",
     "lesson": "4-5",
     "text": "Strangler Fig パターンでは、旧システムを一度に停止して全機能を新システムに切り替える。",
     "answer": false,
     "explain": "段階的に機能を切り出して置換する。"
    },
    {
     "id": "ox-4-5-p1-b",
     "lesson": "4-5",
     "text": "Strangler Fig では前段の ALB などでパス単位にトラフィックを新旧へ振り分けられる。",
     "answer": true,
     "explain": "ルーティングで段階移行。"
    },
    {
     "id": "ox-4-5-p1-c",
     "lesson": "4-5",
     "text": "Refactor Spaces は Strangler Fig 実装用の環境構築を支援する。",
     "answer": true,
     "explain": "Migration Hub の機能。"
    },
    {
     "id": "ox-4-5-p2-a",
     "lesson": "4-5",
     "text": "App2Container は .NET と Java アプリケーションのコンテナ化を支援する。",
     "answer": true,
     "explain": "分析して Dockerfile/デプロイ成果物を生成する。"
    },
    {
     "id": "ox-4-5-p2-b",
     "lesson": "4-5",
     "text": "既存の Kubernetes マニフェスト資産をそのまま使いたい場合は ECS が最適である。",
     "answer": false,
     "explain": "Kubernetes 互換の EKS が適切。"
    },
    {
     "id": "ox-4-5-p2-c",
     "lesson": "4-5",
     "text": "Fargate を使うとコンテナ実行のためのサーバー(EC2)管理が不要になる。",
     "answer": true,
     "explain": "サーバーレスコンピュート。"
    },
    {
     "id": "ox-4-5-p3-a",
     "lesson": "4-5",
     "text": "Lambda は 1 回の実行に最大 15 分まで使用できる。",
     "answer": true,
     "explain": "タイムアウト上限は 15 分。"
    },
    {
     "id": "ox-4-5-p3-b",
     "lesson": "4-5",
     "text": "ActiveMQ を最小改修で移行したい場合は SQS への移行が最適である。",
     "answer": false,
     "explain": "プロトコル互換の Amazon MQ が最適。"
    },
    {
     "id": "ox-4-5-p3-c",
     "lesson": "4-5",
     "text": "Step Functions は複数の Lambda や AWS サービスをワークフローとしてオーケストレーションできる。",
     "answer": true,
     "explain": "標準機能。"
    },
    {
     "id": "ox-4-5-p4-a",
     "lesson": "4-5",
     "text": "M2 の Replatform パターンでは、COBOL をほぼ変更せずに互換ランタイムで実行できる。",
     "answer": true,
     "explain": "改修最小。"
    },
    {
     "id": "ox-4-5-p4-b",
     "lesson": "4-5",
     "text": "M2 の Automated Refactor は COBOL を Python に変換する。",
     "answer": false,
     "explain": "Java へ変換。"
    },
    {
     "id": "ox-4-5-p4-c",
     "lesson": "4-5",
     "text": "メインフレーム移行では、ハードウェアや MIPS ベースの保守費削減がよくある動機である。",
     "answer": true,
     "explain": "コスト削減が主な動機の一つ。"
    },
    {
     "id": "ox-4-6-p1-a",
     "lesson": "4-6",
     "text": "Dedicated Host は、ソケットやコア数が可視化されるため、ソケット/コア単位の BYOL に利用できる。",
     "answer": true,
     "explain": "Dedicated Instance との違い。"
    },
    {
     "id": "ox-4-6-p1-b",
     "lesson": "4-6",
     "text": "Amazon RDS for SQL Server では、通常のインスタンスで BYOL を選択できる。",
     "answer": false,
     "explain": "標準の RDS for SQL Server は License Included のみ。"
    },
    {
     "id": "ox-4-6-p1-c",
     "lesson": "4-6",
     "text": "AWS License Manager は組織全体でライセンス使用量の追跡と制限に使える。",
     "answer": true,
     "explain": "Organizations 連携で管理。"
    },
    {
     "id": "ox-4-6-p2-a",
     "lesson": "4-6",
     "text": "Savings Plans の購入前に、まずライトサイジングを行うのが望ましい。",
     "answer": true,
     "explain": "過大スペックのままコミットしないため。"
    },
    {
     "id": "ox-4-6-p2-b",
     "lesson": "4-6",
     "text": "AWS へのデータのインバウンド転送には課金されるが、アウトバウンドは無料である。",
     "answer": false,
     "explain": "逆。インバウンドは無料、アウトバウンドは有料。"
    },
    {
     "id": "ox-4-6-p2-c",
     "lesson": "4-6",
     "text": "Migration Evaluator は既存環境の利用状況に基づいてビジネスケースを作る。",
     "answer": true,
     "explain": "エージェントレスコレクターで収集。"
    },
    {
     "id": "ox-4-6-p3-a",
     "lesson": "4-6",
     "text": "依存関係の詳細な把握が必要な場合は、ADS のエージェントレス方式だけで十分である。",
     "answer": false,
     "explain": "エージェント方式でプロセス・ネットワーク接続を取得する。"
    },
    {
     "id": "ox-4-6-p3-b",
     "lesson": "4-6",
     "text": "異種 DB 移行では、スキーマ変換とデータ移行を別ツールで行うのが一般的である。",
     "answer": true,
     "explain": "SCT + DMS。"
    },
    {
     "id": "ox-4-6-p3-c",
     "lesson": "4-6",
     "text": "カットオーバー前にロールバック計画を準備しておくことは重要である。",
     "answer": true,
     "explain": "移行失敗時に備える。"
    }
   ],
   "mc": [
    {
     "id": "mc-4-001",
     "stem": "ある製造業の企業は、2 か月後にオンプレミスのデータセンターのリース契約が終了します。環境には約 400 台の Windows/Linux 物理および仮想サーバーがあり、アプリケーションのソースコードは外部ベンダー保有で改修できません。ソリューションアーキテクトは、サーバーを最小のダウンタイムで AWS に移行し、移行状況を一元的に把握したいと考えています。最も運用効率が高い方法はどれですか。",
     "items": [],
     "choices": [
      "AWS Application Migration Service (MGN) にレプリケーションエージェントを導入して継続的にレプリケーションし、テストカットオーバー後に本番カットオーバーを行う。進捗は Migration Hub で追跡する。",
      "AWS Snowball Edge に全サーバーのディスクイメージをコピーして S3 に取り込み、手動で復元する。",
      "各アプリケーションを AWS Lambda に再設計してから移行する。",
      "サーバーごとに VM Import/Export で AMI を作成し、手動で EC2 を起動する。"
     ],
     "explain": [
      "正解。MGN はブロックレベルの継続レプリケーションでカットオーバー時間を数分に抑え、テストカットオーバーも可能。Migration Hub で進捗を一元管理できる。",
      "Snow はデータ転送用でサーバー移行ツールではなく、復元作業も手動で非効率。",
      "ソースコード改修不可・期限 2 か月の要件に反する(Refactor は不可)。",
      "VM Import/Export は継続同期がなく、400 台の手作業は非効率でダウンタイムも長い。"
     ],
     "tip": "『変更不可+短期+サーバー』なら Rehost=MGN。Refactor 系の選択肢は即除外。",
     "domain": 4,
     "answer": 1
    },
    {
     "id": "mc-4-002",
     "stem": "ある企業は、オンプレミスの Oracle データベース(2TB)を Amazon Aurora PostgreSQL に移行します。業務上、停止できる時間は最大 30 分です。データベースにはストアドプロシージャが多数あり、アプリケーションには SQL が埋め込まれています。どの手順の組み合わせが最適ですか。",
     "items": [],
     "choices": [
      "DMS のみで full load を行い、ストアドプロシージャは自動的に変換される。",
      "Aurora PostgreSQL のリードレプリカとして Oracle をレプリケートする。",
      "Oracle Data Pump でエクスポートし、Aurora PostgreSQL に直接インポートする。",
      "AWS SCT で評価レポートを作成しスキーマとコードを変換した後、AWS DMS の full load + CDC で移行し、同期後にカットオーバーする。"
     ],
     "explain": [
      "DMS はスキーマ変換を完全には行わない。",
      "Aurora のレプリカ元になれるのは同種の RDS/Aurora で、オンプレ Oracle は不可。",
      "Data Pump は Oracle 同士のフォーマットで PostgreSQL に直接インポートできない。",
      "正解。異種移行は SCT でスキーマ/コードを変換し、DMS の CDC で停止時間を最小化する。"
     ],
     "tip": "異種 DB=SCT(スキーマ)+DMS(データ)。ダウンタイム短縮=CDC。",
     "domain": 4,
     "answer": 4
    },
    {
     "id": "mc-4-003",
     "stem": "ある小売企業は、オンプレミスのファイルサーバー(NFS)にある 150TB のデータを Amazon S3 に移行します。インターネット回線は 200Mbps で業務と共用され、利用できるのは約半分です。移行は 6 週間以内に完了する必要があります。移行後も 1 か月間は新規ファイルの変更が発生します。最もコスト効率が高く要件を満たす方法はどれですか。",
     "items": [],
     "choices": [
      "S3 Transfer Acceleration を有効化し、AWS CLI で並列アップロードする。",
      "Snowball Edge で初期データをコピーして S3 に取り込み、その後 DataSync で差分を同期する。",
      "DataSync エージェントのみを使用し、ネットワーク経由で全データを転送する。",
      "Direct Connect を新規契約し、DataSync で転送する。"
     ],
     "explain": [
      "帯域そのものがボトルネックなので、アクセラレーションでも解決しない。",
      "正解。初期転送をオフライン化し、変更分のみ DataSync で追い付ける。",
      "100Mbps で 150TB は約 140 日かかり、6 週間に収まらない。",
      "開通までの時間とコストの面で不利。6 週間で間に合わない可能性が高い。"
     ],
     "tip": "必ず所要日数を計算。足りなければ Snow、差分は DataSync。",
     "domain": 4,
     "answer": 2
    },
    {
     "id": "mc-4-004",
     "stem": "ある企業は、VMware vSphere 上で稼働する 600 台の VM を AWS に移行します。運用チームは vCenter を使った既存の運用手順・ツール・IP アドレスを変更したくありません。移行は数週間以内に完了させたい。最適な移行先と手段はどれですか。",
     "items": [],
     "choices": [
      "VM 内のアプリを Amazon ECS にコンテナ化して移行する。",
      "VMware Cloud on AWS に HCX を使って VM を移行する。",
      "VM を OVA にエクスポートし、VM Import/Export で AMI 化する。",
      "AWS MGN で各 VM を EC2 に変換する。"
     ],
     "explain": [
      "再設計が必要で数週間では難しい。",
      "正解。Relocate 戦略。同一の VMware 運用と IP 維持(L2 拡張)が可能。",
      "同様に運用手順が変わり、継続同期もない。",
      "EC2 への変換は運用手順・ハイパーバイザーが変わる。"
     ],
     "tip": "『VMware 運用を変えない』=VMware Cloud on AWS(Relocate)。",
     "domain": 4,
     "answer": 2
    },
    {
     "id": "mc-4-005",
     "stem": "ある金融企業は、オンプレミスの SQL Server データベースを AWS に移行します。アプリケーションは .NET で書かれ、T-SQL を多用しています。ライセンス費用を削減したいが、アプリの改修は最小にしたい。最適な選択肢はどれですか。",
     "items": [],
     "choices": [
      "Amazon RDS for SQL Server に移行する。",
      "Amazon DocumentDB に移行する。",
      "Aurora PostgreSQL に移行し、Babelfish for Aurora PostgreSQL を有効化する。DMS でデータ移行する。",
      "DynamoDB にすべて移行する。"
     ],
     "explain": [
      "ライセンス費用(License Included)の削減にならない。",
      "ドキュメント DB は用途が異なり改修が大きい。",
      "正解。Babelfish により T-SQL/TDS をほぼそのまま利用でき、商用ライセンスを削減できる。",
      "大規模な再設計が必要でアプリ改修が大きい。"
     ],
     "tip": "『SQL Server+ライセンス削減+改修最小』→ Babelfish。",
     "domain": 4,
     "answer": 3
    },
    {
     "id": "mc-4-006",
     "stem": "あるメディア企業は、オンプレミスのレガシーな Java Web アプリケーション(Tomcat)をコンテナ化したいと考えています。ソースコードは変更したくなく、自動で Dockerfile などを生成し ECS にデプロイしたい。最も適したのはどれですか。",
     "items": [],
     "choices": [
      "Elastic Beanstalk の Docker プラットフォームに手動でイメージを作成する。",
      "AWS SAM で再設計する。",
      "AWS Lambda に移植する。",
      "AWS App2Container で分析・コンテナ化し、ECR と ECS/Fargate にデプロイする。"
     ],
     "explain": [
      "可能だが自動化されない。",
      "サーバーレスへの再設計が必要。",
      "再設計が必要。",
      "正解。A2C は Java/.NET アプリを分析しコンテナ成果物を自動生成する。"
     ],
     "tip": "『コンテナ化+コード変更なし+自動生成』=App2Container。",
     "domain": 4,
     "answer": 4
    },
    {
     "id": "mc-4-007",
     "stem": "ある保険会社は、COBOL で記述されたメインフレームの基幹アプリケーションを AWS に移行します。短期間・低リスクで移行し、コードの大規模な変更は避けたい。将来的な Java 化は検討したい。最も適切なアプローチはどれですか。",
     "items": [],
     "choices": [
      "AWS Mainframe Modernization の Replatform パターンで、COBOL を互換ランタイム上で実行し、後続フェーズで Automated Refactor を検討する。",
      "ライセンスを維持するため、そのままオンプレに残す(Retain)。",
      "EC2 にエミュレータを手作業で構築する。",
      "すべての COBOL を手作業で Lambda に書き換える。"
     ],
     "explain": [
      "正解。コードほぼ変更なしで移行でき、段階的にモダナイズできる。",
      "移行要件に反する。",
      "運用・可用性・保守が負担。",
      "高コスト・高リスク。"
     ],
     "tip": "COBOL=M2。低リスク=Replatform、Java化=Automated Refactor。",
     "domain": 4,
     "answer": 1
    },
    {
     "id": "mc-4-008",
     "stem": "ある企業は、巨大なモノリシック Web アプリケーションを数年かけてマイクロサービス化する計画です。事業継続のため、サービスを停止することはできません。移行中も機能追加を続けます。最適な戦略はどれですか。",
     "items": [],
     "choices": [
      "Strangler Fig パターンで、前段に API Gateway/ALB を置き、機能単位で新サービスにルーティングを切り替える。",
      "新システムを一括開発し、週末に全面切替する。",
      "モノリスを EC2 にそのまま移行して終了する。",
      "新旧のデータベースを手動で同期し、全ユーザーを同時に移行する。"
     ],
     "explain": [
      "正解。段階的でロールバック容易。",
      "ビッグバンはリスクが高く、機能追加と並行しにくい。",
      "モダナイズ要件を満たさない。",
      "同時移行はリスクが高い。"
     ],
     "tip": "長期・無停止・並行開発=Strangler Fig。",
     "domain": 4,
     "answer": 1
    },
    {
     "id": "mc-4-009",
     "stem": "ある企業は、Oracle Database Enterprise Edition を Dedicated Host 上の EC2 で BYOL 運用しています。ライセンスはソケットベースで、オンプレミスと同数のソケット数に制限されています。AWS で複数アカウントにまたがるライセンスの使用状況を追跡し、超過を防止したい。どうすべきですか。",
     "items": [],
     "choices": [
      "アカウントごとに別途スプレッドシートで管理する。",
      "AWS License Manager でライセンスルールを作成し、AWS Organizations で共有・管理する。",
      "Dedicated Instance を使用する。",
      "AWS Config のみで監視する。"
     ],
     "explain": [
      "手動で漏れやすい。",
      "正解。ルールを強制(ホスト数・ソケット数)し、組織全体で追跡できる。",
      "ソケット/コア可視化がなく BYOL に不十分。",
      "ライセンス使用量の制限機能はない。"
     ],
     "tip": "BYOL+ソケット=Dedicated Host、管理=License Manager。",
     "domain": 4,
     "answer": 2
    },
    {
     "id": "mc-4-010",
     "stem": "ある企業のオンプレミス MySQL(500GB)を Amazon Aurora MySQL に移行します。ソースの MySQL は更新が続き、停止可能な時間は 10 分以内です。ネットワークは Direct Connect で接続済みです。最適な方法はどれですか。",
     "items": [],
     "choices": [
      "mysqldump でエクスポートし、Aurora にインポートする。",
      "Aurora Serverless に切り替える。",
      "スナップショットを S3 に出力して手動で復元する。",
      "DMS で full load + CDC を実行し、同期が追いついた後に切り替える。"
     ],
     "explain": [
      "書き出し・取り込み中の停止が長くなる。",
      "移行手段ではない。",
      "同期されない更新が失われる。",
      "正解。更新を継続反映し、切替時間を最小化できる。"
     ],
     "tip": "更新継続+短い停止=CDC。",
     "domain": 4,
     "answer": 4
    },
    {
     "id": "mc-4-011",
     "stem": "ある企業は、オンラインゲームのプレイヤー状態データ(キーバリュー、1 日数十億リクエスト、ミリ秒応答)を、オンプレミスの MySQL から AWS に移行します。スキーマ変更は許容でき、運用負荷を最小にしたい。最適な移行先はどれですか。",
     "items": [],
     "choices": [
      "Amazon DynamoDB(DMS のオブジェクトマッピング利用)",
      "Amazon Redshift",
      "Amazon RDS for MySQL",
      "Amazon DocumentDB"
     ],
     "explain": [
      "正解。キー検索・大規模・サーバーレス運用に適する。",
      "OLAP 向けで低レイテンシトランザクション用途ではない。",
      "スケール限界と運用負荷が残る。",
      "MongoDB 互換が必要な場合に限る。"
     ],
     "tip": "キーバリュー+超大規模+ミリ秒=DynamoDB。",
     "domain": 4,
     "answer": 1
    },
    {
     "id": "mc-4-012",
     "stem": "ある企業は、アプリケーションの依存関係が不明な状態で 300 台のサーバーをクラウド移行します。VMware 環境と一部の物理サーバーが混在します。移行ウェーブを決めるため、サーバー間のネットワーク依存関係を把握する必要があります。最適な方法はどれですか。",
     "items": [],
     "choices": [
      "AWS Config を有効化する。",
      "AWS Cost Explorer を使用する。",
      "Agentless Collector のみを VMware にデプロイする。",
      "AWS Application Discovery Service の Discovery Agent を導入する。"
     ],
     "explain": [
      "AWS 内リソースの構成管理であり、オンプレ不可。",
      "コスト分析で依存関係は分からない。",
      "物理サーバーは対象外で、接続詳細も取得できない。",
      "正解。エージェントはプロセスとネットワーク接続を取得し、物理サーバーにも導入できる。"
     ],
     "tip": "依存関係+物理混在=Discovery Agent。",
     "domain": 4,
     "answer": 4
    },
    {
     "id": "mc-4-013",
     "stem": "ある企業は、経営層に対しクラウド移行の費用対効果を示す必要があります。現状のオンプレミス環境の CPU・メモリ利用実績に基づいて、適正サイズの AWS 構成と TCO 比較を最短で作成したい。何を使いますか。",
     "items": [],
     "choices": [
      "AWS Cost Explorer",
      "AWS Migration Evaluator",
      "AWS Budgets",
      "AWS Pricing Calculator に手入力する"
     ],
     "explain": [
      "AWS 利用実績が前提。",
      "正解。実測データからビジネスケースを作成する。",
      "予算アラート用。",
      "手入力は実測に基づかず工数が大きい。"
     ],
     "tip": "実績に基づく TCO=Migration Evaluator。",
     "domain": 4,
     "answer": 2
    },
    {
     "id": "mc-4-014",
     "stem": "ある企業は、SFTP でパートナー企業からファイルを受領しており、現在はオンプレミスの SFTP サーバーを運用しています。パートナーの設定を変更せずに、受領ファイルを S3 に保存し、運用負荷を減らしたい。最適な方法はどれですか。",
     "items": [],
     "choices": [
      "AWS DataSync を使う。",
      "S3 パブリックバケットにアップロードさせる。",
      "AWS Transfer Family の SFTP サーバー(S3 バックエンド)を使う。",
      "EC2 に SFTP サーバーを構築する。"
     ],
     "explain": [
      "プロトコル受付の用途ではない。",
      "セキュリティと互換性の問題。",
      "正解。マネージドで既存クライアントがそのまま使える。",
      "運用負荷が残る。"
     ],
     "tip": "外部パートナーの SFTP=Transfer Family。",
     "domain": 4,
     "answer": 3
    },
    {
     "id": "mc-4-015",
     "stem": "ある企業は、オンプレミスのバックアップソフトウェアでテープライブラリにバックアップしています。バックアップソフトウェアと運用手順は変更せず、物理テープの保管コストと管理負荷を削減するため、物理テープを廃止して AWS に長期保管したいと考えています。最も適切な構成はどれですか。",
     "items": [],
     "choices": [
      "S3 File Gateway",
      "DataSync",
      "Storage Gateway の Tape Gateway",
      "Volume Gateway(Cached)"
     ],
     "explain": [
      "ファイル共有用でテープ互換ではない。",
      "VTL をサポートしない。",
      "正解。VTL として S3/Glacier にテープを保存する。",
      "ブロックボリューム用。"
     ],
     "tip": "テープ廃止=Tape Gateway。",
     "domain": 4,
     "answer": 3
    },
    {
     "id": "mc-4-016",
     "stem": "ある企業は、オンプレミス SQL Server の移行で、RDS for SQL Server を使いたいと考えています。既存のライセンス(ソフトウェアアシュアランス付き)を持ち込みたく、特に Dedicated Host での運用を想定しています。標準の RDS for SQL Server の制約を踏まえて、最適な選択肢はどれですか。",
     "items": [],
     "choices": [
      "Aurora MySQL に自動で変換される。",
      "標準の RDS for SQL Server で BYOL を指定する。",
      "EC2 上の SQL Server(Dedicated Host)、または RDS Custom for SQL Server を検討する。",
      "DynamoDB に移行する。"
     ],
     "explain": [
      "自動変換はない。",
      "標準 RDS for SQL Server は License Included のみ。",
      "正解。BYOL が必要な場合の現実的な選択肢。",
      "大規模改修が必要。"
     ],
     "tip": "RDS for SQL Server=LI のみ。BYOL なら EC2 または RDS Custom。",
     "domain": 4,
     "answer": 3
    },
    {
     "id": "mc-4-017",
     "stem": "ある企業は、移行後の AWS 環境でマルチアカウント戦略を採用します。開発・本番アカウントを自動で払い出し、セキュリティログを集約し、特定リージョンの利用を禁止するなどのガードレールを最小の運用負荷で適用したい。最適な方法はどれですか。",
     "items": [],
     "choices": [
      "各アカウントを手動で作成し IAM ポリシーを個別に設定する。",
      "単一アカウントに環境ごとの VPC を作成する。",
      "CloudFormation StackSets だけで構成する。",
      "AWS Control Tower でランディングゾーンを構築し、Account Factory と SCP ベースのコントロールを使用する。"
     ],
     "explain": [
      "運用負荷が大きく一貫性が保てない。",
      "アカウント分離になっていない。",
      "ガードレール・ログ集約まで自動化されない。",
      "正解。Control Tower はマルチアカウント基盤とガードレールを提供する。"
     ],
     "tip": "ランディングゾーン=Control Tower。リージョン拒否は SCP。",
     "domain": 4,
     "answer": 4
    },
    {
     "id": "mc-4-018",
     "stem": "ある企業は、オンプレミスと AWS を新規に構築する Direct Connect で接続し、1 日あたり 5TB を継続的に S3 へ転送します。データはインターネットを経由させず、プライベートに S3 へ到達させる必要があります。最適な構成はどれですか。",
     "items": [],
     "choices": [
      "インターネット経由で転送する。",
      "Site-to-Site VPN を使用する。",
      "Direct Connect に Private VIF を作成し、VPC の S3 インターフェイスエンドポイントを利用する。",
      "Public VIF のみを使用する。"
     ],
     "explain": [
      "要件に反する。",
      "大量転送には帯域が不安定。",
      "正解。オンプレミスからのプライベート接続では S3 インターフェイスエンドポイント(PrivateLink)が使える。",
      "Public VIF は AWS のパブリックエンドポイント経由(インターネットは通らないが VPC 内プライベートではない)。要件に対して不適。"
     ],
     "tip": "オンプレから S3 をプライベート=Private VIF+インターフェイスエンドポイント。",
     "domain": 4,
     "answer": 3
    },
    {
     "id": "mc-4-019",
     "stem": "ある企業は、既存の RabbitMQ メッセージブローカーを使うアプリケーションを AWS に移行します。AMQP クライアントコードを変更したくなく、ブローカーのパッチ適用やクラスター運用などの運用負荷も下げ、高可用性も確保したいと考えています。最も適切な選択肢はどれですか。",
     "items": [],
     "choices": [
      "Amazon MQ for RabbitMQ",
      "Amazon Kinesis",
      "Amazon EventBridge",
      "Amazon SQS"
     ],
     "explain": [
      "正解。プロトコル互換のマネージド。",
      "ストリーミング用。",
      "イベントバス用。",
      "API が異なりコード変更が必要。"
     ],
     "tip": "ブローカー互換移行=Amazon MQ。",
     "domain": 4,
     "answer": 1
    },
    {
     "id": "mc-4-020",
     "stem": "ある企業は、オンプレミスの Hadoop クラスターとデータウェアハウス(Teradata)を AWS に移行し、分析基盤をモダナイズします。DWH は 80TB、回線は 1Gbps で限られます。スキーマ変換を含め、最適な構成はどれですか。",
     "items": [],
     "choices": [
      "S3 に手動でコピーし、Redshift で手作業でテーブルを作る。",
      "SCT でスキーマを Redshift に変換し、データ抽出エージェントと Snowball Edge で初期ロード、DMS で差分を同期する。",
      "DMS のみで全データをインターネット経由で転送する。",
      "Aurora に移行する。"
     ],
     "explain": [
      "工数大。",
      "正解。SCT+Snow+DMS が DWH 移行の定番。",
      "時間がかかり、スキーマ変換もできない。",
      "OLAP に不適。"
     ],
     "tip": "DWH 大容量=SCT のデータ抽出エージェント+Snowball。",
     "domain": 4,
     "answer": 2
    },
    {
     "id": "mc-4-021",
     "stem": "ある企業は、オンプレミスの Oracle データベース(5TB、更新頻度が高い)を Amazon Aurora PostgreSQL に移行します。停止時間は最小にしたく、アプリケーションには埋め込み SQL が多数あります。移行計画に含めるべき手順を 2 つ選択してください。",
     "items": [],
     "choices": [
      "AWS SCT で評価レポートを作成し、スキーマとアプリケーション SQL を変換する。",
      "AWS DMS で full load + CDC のタスクを作成し、同期完了後にカットオーバーする。",
      "Oracle の RMAN バックアップを Aurora に直接リストアする。",
      "DynamoDB Accelerator (DAX) を前段に配置する。",
      "AWS DataSync でデータファイルを S3 にコピーし、Aurora に直接アタッチする。"
     ],
     "explain": [
      "正解。変換難易度の把握と変換を行う。",
      "正解。更新を継続反映して停止時間を最小化する。",
      "異種エンジンのためリストアできない。",
      "DAX は DynamoDB 用でありここでは無関係。",
      "Aurora にデータファイルをアタッチする機能はない。"
     ],
     "tip": "異種 DB は『変換(SCT)+複製(DMS)』の 2 本立て。",
     "domain": 4,
     "answers": [
      1,
      2
     ],
     "select": 2
    },
    {
     "id": "mc-4-022",
     "stem": "ある企業は、1PB のデータをオンプレミスから S3 に移行します。回線は 1Gbps、期限は 3 週間です。移行中も一部のデータは更新されます。要件を満たす構成を 2 つ選択してください。",
     "items": [],
     "choices": [
      "複数台の Snowball Edge で初期データを転送する。",
      "Snowball 輸送後、DataSync で更新分を同期する。",
      "Site-to-Site VPN を増設して 1PB を転送する。",
      "S3 Transfer Acceleration をすべてのデータに使用する。",
      "Snowmobile を新規で利用する。"
     ],
     "explain": [
      "正解。1PB は 1Gbps で約 93 日かかるためオフライン転送が必要。",
      "正解。差分を同期できる。",
      "VPN の帯域は 1Gbps を超えない。",
      "回線帯域がボトルネックで解決しない。",
      "Snowmobile は提供終了。"
     ],
     "tip": "1PB/1Gbps≒約 93 日。期限と比較して Snow を選ぶ。",
     "domain": 4,
     "answers": [
      1,
      2
     ],
     "select": 2
    },
    {
     "id": "mc-4-023",
     "stem": "ある企業は、ライセンスコストを抑えつつ Windows Server と SQL Server を EC2 で運用します。ソフトウェアアシュアランス付きの既存ライセンスを活用し、ソケット/コア単位の管理が必要です。適切な対策を 2 つ選択してください。",
     "items": [],
     "choices": [
      "Dedicated Host を使用してコア/ソケットを可視化する。",
      "AWS License Manager でホスト・ライセンスのルールを管理する。",
      "Dedicated Instance を使用して BYOL を行う。",
      "RDS for SQL Server に移行して BYOL を使用する。",
      "スポットインスタンスで運用する。"
     ],
     "explain": [
      "正解。ソケット/コアベースの BYOL に必要。",
      "正解。使用状況の追跡・制限ができる。",
      "ソケットが可視化されないため不十分。",
      "標準 RDS for SQL Server は BYOL 不可。",
      "ライセンス要件の充足とは無関係。"
     ],
     "tip": "BYOL(物理コア/ソケット)=Dedicated Host+License Manager。",
     "domain": 4,
     "answers": [
      1,
      2
     ],
     "select": 2
    },
    {
     "id": "mc-4-024",
     "stem": "ある企業は、monolithic な .NET アプリをモダナイズします。短期間でコンテナ化し、その後に機能を段階的に分離していく計画です。適切なアプローチを 2 つ選択してください。",
     "items": [],
     "choices": [
      "AWS App2Container でコンテナ化し ECS にデプロイする。",
      "Migration Hub Refactor Spaces と ALB を使い、機能単位で新サービスに切り替える。",
      "すべてを一度に Lambda に書き直す。",
      "Snowball Edge にアプリを載せる。",
      "コンテナ化せず手動で EC2 に再インストールする。"
     ],
     "explain": [
      "正解。.NET を最小改修でコンテナ化。",
      "正解。Strangler Fig による段階移行。",
      "ビッグバンでリスク大。",
      "アプリ移行手段ではない。",
      "モダナイズ要件に反する。"
     ],
     "tip": "コンテナ化(A2C)→段階分離(Strangler Fig)の順。",
     "domain": 4,
     "answers": [
      1,
      2
     ],
     "select": 2
    },
    {
     "id": "mc-4-025",
     "stem": "ある企業は、VMware 上の 300 台の VM を AWS に移行します。一部のアプリは変更不可でオンプレと同じ IP が必要、残りの Windows アプリは EC2 へ移し VMware ライセンスから脱却したい。適切な組み合わせを 3 つ選択してください。",
     "items": [],
     "choices": [
      "変更不可のアプリは VMware Cloud on AWS へ HCX で移行する。",
      "ライセンス脱却対象のアプリは MGN で EC2 へ移行する。",
      "全体の依存関係把握に Application Discovery Service を使用する。",
      "すべての VM を Snowball Edge に保存して移送する。",
      "すべての VM を Lambda に変換する。"
     ],
     "explain": [
      "正解。Relocate。",
      "正解。Rehost。",
      "正解。ウェーブ計画に必要。",
      "Snow は移行手段として不適。",
      "変換不可。"
     ],
     "tip": "アプリごとに 7R を使い分ける。複数選択でも要件ごとの分割が鍵。",
     "domain": 4,
     "answers": [
      1,
      2,
      3
     ],
     "select": 3
    },
    {
     "id": "mc-4-026",
     "stem": "ある企業は、オンプレミスの NFS 上の 80TB を Amazon S3 と Amazon EFS に移行します。権限メタデータを保持し、整合性を検証し、業務時間中は帯域を制限したい。適切な設計を 2 つ選択してください。",
     "items": [],
     "choices": [
      "DataSync エージェントをオンプレに配置し、帯域制限とスケジュールを設定する。",
      "DataSync のタスクで整合性検証を有効化する。",
      "Storage Gateway の Tape Gateway を使用する。",
      "Transfer Family の FTP を使用する。",
      "AWS DMS を使用する。"
     ],
     "explain": [
      "正解。",
      "正解。",
      "テープ用。",
      "プロトコル受付用で移行向きではない。",
      "DB 用。"
     ],
     "tip": "ファイル移行+帯域制御=DataSync。",
     "domain": 4,
     "answers": [
      1,
      2
     ],
     "select": 2
    },
    {
     "id": "mc-4-027",
     "stem": "ある企業は、メインフレームの COBOL アプリと DB2 データを AWS に移行します。早期にハードウェア保守費を削減し、コードはほぼ変更しないこと、データはリレーショナル DB に移すことを要件とします。適切なアプローチを 2 つ選択してください。",
     "items": [],
     "choices": [
      "AWS Mainframe Modernization の Replatform パターンを使用する。",
      "DMS などで DB2 のデータを Aurora/RDS に移行する。",
      "EC2 に手作業でエミュレータを構築する。",
      "COBOL を自動で Python に変換する。",
      "メインフレームを Retain として残す。"
     ],
     "explain": [
      "正解。",
      "正解。",
      "運用負荷が大きい。",
      "Automated Refactor は Java への変換で Python ではない。",
      "保守費削減の要件に反する。"
     ],
     "tip": "M2 は Replatform=ほぼそのまま、Refactor=Java。",
     "domain": 4,
     "answers": [
      1,
      2
     ],
     "select": 2
    }
   ]
  }
 ]
};
