from lib import *
L=[]
# ---- 1-7
L.append(lesson('1-7','集中ログとセキュリティガバナンス',[
('組織 CloudTrail と集中ログ',
f'''<h4>CloudTrail</h4><ul><li>{K('組織の証跡（Organization trail）')}：管理アカウント（または委任管理者）で作成すると、全メンバーアカウント・全リージョンのイベントを1つのS3バケットに記録。メンバーは証跡を変更・削除できない</li><li>{K('管理イベント')}はデフォルト記録、{K('データイベント')}（S3オブジェクト、Lambda実行等）は追加設定</li><li>{K('ログファイルの整合性検証')}（ダイジェストファイル）で改ざん検知</li><li>{K('CloudTrail Lake')}：イベントデータストアに対しSQLでクエリ（組織イベントデータストア可）</li></ul><h4>ログ集約の設計</h4><ul><li>{K('ログアーカイブアカウント')}に集中S3バケット：バケットポリシーで書き込みを許可し、{K('SSE-KMS')}、バージョニング、{K('S3 Object Lock（コンプライアンスモード）')}、{K('MFA Delete')}、ライフサイクル（Glacierへ移行）</li><li>CloudWatch Logsのクロスアカウント集約：{K('サブスクリプションフィルタ')}→Kinesis Data Streams／Firehose／Lambda。{K('CloudWatch ログのクロスアカウント/リージョン監視アカウント機能（Observability Access Manager）')}もある</li><li>{T('ログ改ざん防止')}の要件 → Object Lock + 別アカウントに隔離 + SCPで削除禁止</li><li>分析：Athena、OpenSearch、{K('Amazon Security Lake')}（OCSF形式でセキュリティデータを集約、組織全体）</li></ul>''',
[('組織の証跡をOrganizationsで作成すると、メンバーアカウントは証跡を削除できない。',True,'組織の証跡はメンバーから変更できません。'),
 ('ログの改ざん防止には、ログアーカイブ用S3バケットにObject Lockを設定するのが有効である。',True,'WORMにより上書き・削除を防ぎます。'),
 ('CloudTrailのデータイベントは、デフォルトで記録される。',False,'既定では管理イベントのみです。データイベントは追加設定が必要です。')]),
('AWS Config による構成管理',
f'''<h4>Configの役割</h4><ul><li>{K('リソース構成の記録')}、変更履歴、{K('ルールによる準拠評価')}（マネージドルール／Lambdaカスタムルール／Guard）</li><li>{K('自動修復')}：SSM Automationランブックで非準拠リソースを修正</li><li>{K('コンフォーマンスパック')}：ルールと修復のセットを一括配備（組織単位でも可）</li><li>{K('Config アグリゲーター')}：複数アカウント・リージョンの構成と準拠状況を1つのアカウントに{K('集約')}（Organizations連携で自動的に全アカウントを対象に）。{T('アグリゲーターは参照用の集約で、ルール適用そのものではない')}</li><li>{K('組織のConfigルール')}：管理アカウント／委任管理者から全アカウントへルールを展開</li><li>高度なクエリでSQL風に構成情報を検索</li></ul><h4>使い分け</h4><table><tr><th>知りたいこと</th><th>サービス</th></tr><tr><td>誰がAPIを呼んだか</td><td>CloudTrail</td></tr><tr><td>リソースが今どんな構成で、準拠しているか</td><td>Config</td></tr><tr><td>性能・メトリクス</td><td>CloudWatch</td></tr><tr><td>脅威の検知</td><td>GuardDuty</td></tr></table>''',
[('Configアグリゲーターを使うと、複数アカウントの準拠状況を1つのアカウントで確認できる。',True,'集約ビューを提供します。'),
 ('「誰がセキュリティグループを変更したか」を知る最初のデータソースはConfigのみである。',False,'APIの呼び出し主体はCloudTrailで確認します。Configは変更前後の構成を示します。'),
 ('Configの自動修復には、SSM Automationのランブックが使える。',True,'修復アクションとして指定します。')]),
('GuardDuty・Security Hub・Inspector・Macie',
f'''<h4>役割の整理</h4><table><tr><th>サービス</th><th>役割</th></tr><tr><td>{K('GuardDuty')}</td><td>脅威検出。CloudTrail、VPCフローログ、DNSログ、S3データイベント、EKS監査ログ、Lambda、マルウェア保護などを分析</td></tr><tr><td>{K('Security Hub')}</td><td>検出結果の{K('集約と準拠スコア')}。CIS/PCI/AWS基礎セキュリティのベストプラクティス基準、ASFF形式。GuardDuty、Inspector、Macie、Firewall Managerなどの結果を統合</td></tr><tr><td>{K('Inspector')}</td><td>EC2、ECRコンテナイメージ、Lambdaの{K('脆弱性スキャン')}</td></tr><tr><td>{K('Macie')}</td><td>S3の{K('機密データ（PII）検出')}</td></tr><tr><td>{K('Detective')}</td><td>検出結果の根本原因を調査（グラフ分析）</td></tr><tr><td>{K('IAM Access Analyzer')}</td><td>外部（組織外）に公開されたリソースや未使用アクセスの検出、ポリシー検証</td></tr></table><h4>組織での展開</h4><ul><li>GuardDuty／Security Hub／Macie／Inspectorは{K('委任管理者')}を設定し、{K('新規アカウントを自動有効化')}。{K('集約リージョン')}でマルチリージョンの結果を集約（Security Hub）</li><li>{T('Security Hubは検出そのものではなく集約。有効化にはConfigの記録が前提')}</li><li>自動対処：{K('EventBridge')}でSecurity Hub／GuardDutyの検出結果を受け、Lambda/SSM/Step Functionsで修復</li></ul>''',
[('GuardDutyは、VPCフローログやDNSログを分析して脅威を検出できる。',True,'有効化すれば独自にこれらを分析します。'),
 ('S3バケット内の機密データ（PII）を検出するには、Inspectorを使う。',False,'PII検出はMacieです。Inspectorは脆弱性スキャンです。'),
 ('Security Hubは、複数サービスの検出結果をASFF形式で集約し、標準に基づく準拠スコアを提供する。',True,'集約と準拠チェックがSecurity Hubの役割です。')]),
('Firewall Manager・Audit Manager・その他統制',
f'''<h4>AWS Firewall Manager</h4><ul><li>Organizationsと連携し、{K('WAFルール、Shield Advanced、セキュリティグループ、Network Firewall、Route 53 Resolver DNS Firewall')}等のポリシーを{K('組織全体へ一括適用・準拠監視')}</li><li>前提：Organizationsの全機能、{K('Firewall Manager管理者アカウント')}、Config有効化</li><li>新規アカウント・新規リソースにも{K('自動適用')}</li></ul><h4>その他のガバナンスサービス</h4><table><tr><th>サービス</th><th>ポイント</th></tr><tr><td>AWS Artifact</td><td>AWSのコンプライアンスレポートの入手</td></tr><tr><td>Audit Manager</td><td>監査証拠の継続収集と監査レポート作成</td></tr><tr><td>Service Catalog</td><td>承認済みの製品（CFnテンプレート）の{K('セルフサービス提供')}、制約・ポートフォリオ共有</td></tr><tr><td>Trusted Advisor</td><td>コスト・セキュリティ等の推奨チェック（フルチェックはBusiness/Enterprise以上のサポート）</td></tr><tr><td>Systems Manager</td><td>パッチ、Session Manager、{K('Quick Setup')}で組織展開</td></tr><tr><td>Health Dashboard</td><td>組織ビューでAWSの障害・計画イベントを集約</td></tr></table><ul><li>{T('「承認済み構成だけをユーザーが選んで作れる」')}→ Service Catalog。{T('「新規アカウントにも自動でWAFを強制」')}→ Firewall Manager</li></ul>''',
[('Firewall Managerを使うと、組織内の全アカウントにWAFルールやセキュリティグループポリシーを一括適用できる。',True,'中央のポリシー適用と準拠監視が目的です。'),
 ('Service Catalogは、承認済みのCloudFormationテンプレートをユーザーがセルフサービスで起動できるようにする。',True,'ガバナンスを保ちながら標準化できます。'),
 ('Firewall Managerは、Organizationsを使わない単一アカウントでも全機能が利用できる。',False,'Organizationsとの統合が前提です。')]),
]))
# ---- 1-8
L.append(lesson('1-8','コスト管理とタグ戦略',[
('コスト配分タグと Cost Explorer',
f'''<h4>コスト配分タグ</h4><ul><li>{K('AWS生成タグ')}（aws:createdBy等）と{K('ユーザー定義タグ')}。コスト配分タグとして{K('有効化（アクティブ化）')}して初めてCost Explorer／CURに反映</li><li>{T('有効化前の過去分には遡って反映されない')}（有効化以降）</li><li>{K('タグポリシー')}（Organizations）でキー名・値の表記ゆれを防止。{K('SCP')}で必須タグなしのリソース作成を拒否（aws:RequestTag条件）</li><li>タグ未対応のコストや共有コストは{K('コストカテゴリ')}（ルールで分類）や{K('分割コスト配分データ')}（ECS/EKS）で配分</li></ul><h4>Cost Explorer</h4><ul><li>過去13か月分＋予測（最大12か月）の可視化・フィルタ・グループ化。{K('リザベーション/Savings Plansの利用率・カバレッジ')}レポートと購入推奨</li><li>{K('組織の管理アカウント')}では全メンバーが見える。メンバーの閲覧は設定で可否を制御</li></ul><h4>Cost Anomaly Detection</h4><ul><li>機械学習で{K('異常な支出')}を検知し、SNS/Eメールで通知</li></ul>''',
[('コスト配分タグは、有効化した時点より前のコストにも遡って自動的に反映される。',False,'有効化以降のデータが対象です。'),
 ('SCPで、特定のタグが付いていないリソースの作成を拒否できる。',True,'aws:RequestTagなどの条件キーを使います。'),
 ('Cost Anomaly Detectionは、機械学習で通常と異なる支出を検知して通知できる。',True,'SNSやメールで通知できます。')]),
('AWS Budgets と請求の統制',
f'''<h4>AWS Budgets</h4><ul><li>種類：{K('コスト予算、使用量予算、RI/Savings Plansの利用率・カバレッジ予算')}</li><li>{K('実績値と予測値')}の両方でしきい値アラート（SNS/Eメール/Chatbot）</li><li>{K('予算アクション')}：しきい値超過時にIAM/SCPポリシーの適用、EC2/RDSインスタンスの停止などを{K('自動実行')}</li><li>{T('Budgetsは通知・アクションであり、課金を自動的に止めるハードリミットではない')}</li></ul><h4>組織の請求</h4><ul><li>{K('一括請求')}：使用量の合算によりボリューム割引（S3、データ転送など）、{K('RI/Savings Plansの割引共有')}を組織全体で適用（共有を無効にするアカウント設定も可）</li><li>Sandbox OU用に、アカウント単位の予算と予算アクションを設定し、超過時にSCPで操作を拒否するパターンが定番</li><li>{K('請求コンソールへのアクセス')}はIAMで明示的に有効化が必要（IAMユーザー/ロール向けアクセス）</li></ul>''',
[('AWS Budgetsは、予算超過時にSCPやIAMポリシーを自動でアタッチする予算アクションを実行できる。',True,'予算アクションで対応が可能です。'),
 ('AWS Budgetsは、予算上限に達するとAWSリソースの課金を必ず自動停止する。',False,'通知とアクションが中心で、ハードリミットではありません。'),
 ('一括請求によって、組織全体の使用量が合算されボリューム割引が適用される。',True,'一括請求の主要な利点です。')]),
('Cost and Usage Report（CUR）と分析',
f'''<h4>CUR（Cost and Usage Report）</h4><ul><li>最も{K('詳細')}なコスト・使用量データ。リソースID・タグ・時間単位まで含む。S3に定期出力</li><li>形式：CSV／Parquet。{K('Athena統合')}（Glueクローラ、CloudFormationテンプレート自動生成）でSQL分析、QuickSightで可視化、Redshift連携</li><li>{K('CUR 2.0 / Data Exports')}：新しいデータエクスポート（カラムを選択可能）</li><li>管理アカウントで作成すれば組織全体を含む</li></ul><h4>使い分け</h4><table><tr><th>目的</th><th>ツール</th></tr><tr><td>手軽な傾向把握・予測</td><td>Cost Explorer</td></tr><tr><td>しきい値監視・アクション</td><td>Budgets</td></tr><tr><td>リソース単位の詳細分析、チャージバック</td><td>CUR + Athena + QuickSight</td></tr><tr><td>異常検知</td><td>Cost Anomaly Detection</td></tr><tr><td>右サイジング推奨</td><td>Compute Optimizer</td></tr><tr><td>購入オプション</td><td>Savings Plans（Compute SPは柔軟）/ RI</td></tr></table><ul><li>{T('部署別請求（チャージバック）')}：アカウント分離（最も確実）＋タグ＋コストカテゴリ</li></ul>''',
[('リソース単位・時間単位の最も詳細なコスト分析にはCURを使う。',True,'CURが最も詳細なデータセットです。'),
 ('CURをS3に出力してAthenaでクエリする構成が可能である。',True,'Athena統合が公式にサポートされています。'),
 ('Cost Explorerは、リソース単位のコストを時間単位でSQLクエリできる。',False,'それはCUR+Athenaの用途です。')]),
]))
