from ch3_common import build
pages = [
('セキュリティサービスの使い分け', '''
<table>
<tr><th>サービス</th><th>何を見るか</th></tr>
<tr><td>{k|GuardDuty}</td><td>CloudTrail/VPCフロー/DNSログ/S3/EKS/Lambda等を分析する{k|脅威検出}（侵害されたEC2、不審なAPI、暗号通貨マイニング）。エージェント不要</td></tr>
<tr><td>{k|Inspector}</td><td>EC2・ECRコンテナイメージ・Lambdaの{k|ソフトウェア脆弱性（CVE）とネットワーク到達性}を継続スキャン。EC2はSSM Agent利用</td></tr>
<tr><td>{k|Macie}</td><td>{k|S3内の機密データ（PII等）}の検出と、S3バケットのセキュリティ/公開状況の評価</td></tr>
<tr><td>{k|Security Hub}</td><td>各サービスの検出結果を{k|集約・正規化（ASFF）}し、CIS/AWS基礎セキュリティのベストプラクティス基準でスコア化。複数アカウント/リージョン集約</td></tr>
<tr><td>{k|Detective}</td><td>検出結果の{k|根本原因調査}（グラフ分析）</td></tr>
<tr><td>{k|IAM Access Analyzer}</td><td>{k|外部/組織外へ公開されているリソース}の検出、未使用アクセス検出、ポリシー検証・生成</td></tr>
<tr><td>{k|Config}</td><td>設定の準拠評価と変更履歴</td></tr>
<tr><td>{k|Trusted Advisor}</td><td>セキュリティを含むベストプラクティスの簡易チェック（SG開放ポート、MFA未設定、公開EBSスナップショット等）</td></tr>
<tr><td>{k|Firewall Manager}</td><td>Organizations全体でWAF/Shield/SG/Network Firewallポリシーを一元適用</td></tr>
</table>
<ul>
<li>{k|組織全体}で有効化するには、GuardDuty/Security Hub/Inspector/Macie/Config/Access Analyzerなどの{k|委任管理者}を設定し、新規アカウントを自動有効化</li>
<li>{t|引っ掛け}：「S3の機密データ」=Macie、「EC2のCVE」=Inspector、「怪しい挙動」=GuardDuty、「集約ダッシュボード」=Security Hub。名前の似た選択肢を取り違えない</li>
</ul>
''', [
 ('Amazon Macieは、S3バケット内のPIIなどの機密データを検出できる。', True, 'MacieはS3のデータ分類・機密データ検出サービス。'),
 ('Inspectorは、VPCフローログやCloudTrailを分析して侵害されたインスタンスなどの脅威を検出する。', False, 'それはGuardDutyの役割。InspectorはCVEなどの脆弱性スキャン。'),
 ('Security Hubは、複数のセキュリティサービスの検出結果を集約し、セキュリティ基準に照らして評価できる。', True, 'ASFFで集約し、基準（例：AWS基礎セキュリティのベストプラクティス）でチェックする。'),
]),
('最小権限への改善：IAM Access Analyzer と権限管理', '''
<h4>IAM Access Analyzer</h4>
<ul>
<li>{k|外部アクセスの検出}：S3、IAMロール信頼ポリシー、KMS、SQS、Lambda、Secrets Manager等が信頼ゾーン（アカウント/組織）外と共有されていないか。{k|ゾーンは組織単位}も選べる</li>
<li>{k|未使用アクセスの検出}：未使用のロール、アクセスキー、パスワード、権限を検出（有料）</li>
<li>{k|ポリシー生成}：{k|CloudTrailのアクティビティ}から、実際に使われたAPIだけを許可する最小権限ポリシーを生成</li>
<li>{k|ポリシー検証}：文法・セキュリティ警告の確認、{k|カスタムポリシーチェック}で変更差分の検査（CI/CDに組み込める）</li>
</ul>
<h4>権限境界のレイヤー</h4>
<table>
<tr><th>仕組み</th><th>役割</th></tr>
<tr><td>{k|SCP}</td><td>組織/OUの{k|上限}を定義。{t|SCP自体は権限を付与しない}。管理アカウントには適用されない</td></tr>
<tr><td>{k|アクセス許可の境界}</td><td>IAMユーザー/ロールの上限。開発者に「ロール作成は可、ただし境界付き」で委任</td></tr>
<tr><td>{k|セッションポリシー}</td><td>AssumeRole時にさらに絞る</td></tr>
<tr><td>{k|リソースベースポリシー}</td><td>リソース側で許可。同一アカウント内ではIdentityポリシーなしでも許可になりうる</td></tr>
</table>
<ul>
<li>有効な権限＝（SCP ∩ 境界 ∩ セッションポリシー ∩ Identityポリシー）、{k|明示的Denyが最優先}</li>
<li>{k|IAMの最終アクセス情報}（サービス/アクション）で未使用権限を削除</li>
<li>人は{k|IAM Identity Center}（SSO、一時認証情報）、ワークロードは{k|IAMロール}。長期アクセスキーを避ける。{k|MFA}、パスワードポリシー、ルートの保護</li>
</ul>
''', [
 ('IAM Access Analyzerは、CloudTrailのアクティビティに基づいて実際に使用されたアクションのみを許可するポリシーを生成できる。', True, 'ポリシー生成機能。'),
 ('SCPをOUにアタッチすると、そのOU配下のアカウントのIAMユーザーに自動的にそのSCPで許可した権限が付与される。', False, 'SCPは上限を定めるのみで、権限を付与しない。IAMポリシー等での許可も必要。'),
 ('Organizationsの管理アカウントにはSCPが適用されない。', True, '管理アカウントはSCPの対象外。そのため管理アカウントでワークロードを動かさない。'),
]),
('データ保護・ネットワーク防御の改善', '''
<h4>暗号化と秘密情報</h4>
<ul>
<li>{k|KMS}：AWS管理キーは自動ローテーション（年次）で制御不可。{k|カスタマー管理キー}は自動ローテーション有効化可（既定は年1回、期間指定も可）。{k|キーポリシー}が主役。{k|マルチリージョンキー}で複数リージョンの同一キー素材（クロスリージョンのDR/グローバルテーブル）。{k|外部キーストア（XKS）}やCloudHSMは「自社管理/専用HSM」要件</li>
<li>{k|Secrets Manager}：RDS等の{k|自動ローテーション}、クロスリージョンレプリケーション。ACM：証明書の自動更新（ELB/CloudFront/API Gatewayに統合。EC2に直接エクスポートはPrivate証明書など限定）</li>
<li>{k|S3}：{k|ブロックパブリックアクセス}（アカウント/バケット）、バケットポリシーで{k|aws:SecureTransport}によりHTTPS強制、{k|SSE-KMS}、オブジェクトロック（WORM）、{k|アクセスポイント}で用途別アクセス</li>
</ul>
<h4>ネットワークと入口</h4>
<ul>
<li>{k|セキュリティグループ}：ステートフル、許可のみ。{k|NACL}：ステートレス、許可/拒否、サブネット単位（特定IPのブロックはNACL）</li>
<li>{k|AWS WAF}：ALB/API Gateway/CloudFront/AppSyncのL7保護（SQLi/XSS、レートベースルール、Bot Control）。{k|Shield Advanced}：DDoS保護、DRT支援、コスト保護</li>
<li>{k|Network Firewall}：VPC境界の詳細検査（ドメインフィルタ、IPS）。{k|VPCエンドポイント}とエンドポイントポリシーで、データをインターネットに出さずAWSサービスへ</li>
<li>CloudFrontの{k|OAC（Origin Access Control）}で、S3オリジンへ直接アクセスさせずCloudFront経由のみに</li>
</ul>
''', [
 ('NACLはステートレスであり、特定のIPアドレスからの通信を明示的に拒否（Deny）できる。', True, 'SGは許可ルールのみ。拒否にはNACLやWAFを使う。'),
 ('AWS管理キーの自動ローテーションは、利用者が有効/無効を切り替えられる。', False, 'AWS管理キーのローテーションはAWSが管理し、利用者は制御できない。カスタマー管理キーは設定可能。'),
 ('S3バケットポリシーでaws:SecureTransportの条件を使うと、HTTPSでないリクエストを拒否できる。', True, 'Denyステートメントと条件キーの組み合わせで強制する。'),
]),
('インシデント対応と継続的な改善', '''
<h4>自動対応の流れ</h4>
<ul>
<li>{k|検知}：GuardDuty / Security Hub / Config / Macie</li>
<li>{k|ルーティング}：EventBridgeでフィルタ → {k|Lambda / SSM Automation / Step Functions}</li>
<li>{k|封じ込め}：SGを隔離用に差し替え、ロールのセッション失効（AWSRevokeOlderSessions）やアクセスキー無効化、NACLでIPブロック</li>
<li>{k|証拠保全}：EBSスナップショット、メモリ取得、{k|インスタンスは終了せず隔離}、CloudTrailログ（整合性検証）保全。{t|侵害インスタンスを即終了すると証拠が失われる}</li>
<li>{k|調査}：Detective、CloudTrail Lake、Athena</li>
<li>{k|復旧と学習}：クリーンなAMIで再構築、根本原因の改善、ランブック更新</li>
</ul>
<h4>継続的改善の基盤</h4>
<ul>
<li>ログを{k|専用のログアーカイブアカウント}へ集約（S3 + オブジェクトロック + MFA削除/KMS）。書込み専用で改ざんを防止</li>
<li>{k|Security Hub}の基準スコアと{k|Trusted Advisor}の推奨を定期レビューし、StackSets/Config適合パックで標準化</li>
<li>{k|Systems Manager Patch Manager}と{k|Inspector}で脆弱性管理を自動化</li>
<li>{k|Verified Access / Verified Permissions}、{k|Cognito}等は用途（ゼロトラストアクセス/認可）が出題されたときに識別</li>
</ul>
''', [
 ('侵害が疑われるEC2インスタンスは、証拠保全のため、直ちに終了（Terminate）するのが最初の対応として適切である。', False, 'まず隔離（SG変更等）しスナップショット等で証拠を保全する。終了は証拠喪失につながる。'),
 ('GuardDutyの検出結果をEventBridgeで受け、LambdaやSSM Automationで自動的に隔離処理を実行できる。', True, '標準的な自動対応パターン。'),
]),
]
LESSON, OX = build('3-6', 'セキュリティ改善（GuardDuty / Inspector / Access Analyzer）', pages)
