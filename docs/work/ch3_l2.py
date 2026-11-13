from ch3_common import build
pages = [
('EventBridge：イベント駆動の司令塔', '''
<ul>
<li>{k|ルール}：イベントパターン（イベントに反応）または{k|スケジュール}（cron/rate）で、最大5つのターゲット（Lambda、SQS、SNS、Step Functions、SSM Automation、ECSタスク、別バス等）を呼び出す</li>
<li>AWSサービスのイベント（EC2状態変化、GuardDuty検出、Config非準拠、CodePipeline状態、AWS Health）は{k|デフォルトイベントバス}に自動で流れる</li>
<li>{k|カスタムバス}はアプリ独自イベント用。{k|SaaSパートナーバス}も存在。{k|クロスアカウント/リージョン}は、バスのリソースポリシーで許可し別バスへ転送</li>
<li>{k|アーカイブ & リプレイ}：過去イベントを保存して再送（障害後の再処理、テスト）</li>
<li>{k|EventBridge Scheduler}：大量・一回限り・タイムゾーン指定のスケジュール。定期実行のたびに別ルールを作る必要がない</li>
<li>{k|EventBridge Pipes}：SQS/Kinesis/DynamoDBストリーム等 → フィルタ・エンリッチ → ターゲットを、コード少なめで接続</li>
<li>失敗時は{k|DLQ（SQS）とリトライポリシー}をターゲットに設定可能</li>
</ul>
<p>{t|引っ掛け}：CloudWatch Eventsは旧名称でEventBridgeと同じ基盤。「イベントでLambdaを起動」「定期バッチ起動」は第一候補がEventBridge。ただしキューイングによる負荷平準化・再試行制御が主眼ならSQSを併用。</p>
''', [
 ('EventBridgeのルールは、イベントパターンだけでなくcron/rate式によるスケジュール起動にも使える。', True, 'どちらも可能。大量・単発のスケジュールにはEventBridge Schedulerが適する。'),
 ('他アカウントのイベントバスへイベントを転送するには、送信元でIAMロールを作成するだけでよく、受信側バスのリソースポリシーは不要である。', False, '受信側のバスのリソースポリシーで送信元アカウントを許可する必要がある。'),
 ('EventBridgeのアーカイブとリプレイにより、過去のイベントを再度バスに流して再処理できる。', True, 'アーカイブしたイベントをリプレイできる。'),
]),
('Systems Manager：運用の自動化ツール群', '''
<table>
<tr><th>機能</th><th>用途・判断</th></tr>
<tr><td>{k|Run Command}</td><td>多数インスタンスへ{k|SSH不要で}コマンドをアドホック実行。結果はS3/CloudWatch Logsへ</td></tr>
<tr><td>{k|Session Manager}</td><td>{k|SSH/踏み台/22番ポート開放不要}でシェル接続。IAM制御・CloudTrail/セッションログ監査。VPCエンドポイントでプライベート運用可</td></tr>
<tr><td>{k|Patch Manager}</td><td>パッチベースライン + パッチグループ + {k|メンテナンスウィンドウ}で計画パッチ適用。コンプライアンス報告</td></tr>
<tr><td>{k|State Manager}</td><td>望ましい構成（エージェント導入、設定）を継続的に強制・ドリフト修正</td></tr>
<tr><td>{k|Automation}</td><td>ランブックで多段階の運用手順（AMI作成、インスタンス再起動、修復）を自動化。承認ステップ・クロスアカウント実行可</td></tr>
<tr><td>{k|Parameter Store}</td><td>設定値・秘密情報の階層管理。標準は無料。ローテーション機能は無い</td></tr>
<tr><td>{k|Inventory}</td><td>ソフト/設定のインベントリ収集</td></tr>
<tr><td>{k|OpsCenter / Explorer}</td><td>運用上の課題（OpsItem）を集約し調査・対応</td></tr>
</table>
<ul>
<li>前提：{k|SSM Agent}がインスタンスにあり、{k|インスタンスプロファイル（AmazonSSMManagedInstanceCore）}で権限付与。プライベートサブネットならインターネット経路か{k|VPCエンドポイント（ssm, ssmmessages, ec2messages）}が必要</li>
<li>{k|ハイブリッドアクティベーション}でオンプレサーバーも管理対象にできる</li>
<li>{t|秘密情報の判断}：自動ローテーションが必要 → Secrets Manager。単純な設定値・低コスト → Parameter Store</li>
</ul>
''', [
 ('Session Managerを使うと、セキュリティグループで22番ポートを開けなくてもEC2インスタンスにシェル接続できる。', True, 'SSMエージェントからのアウトバウンド通信で接続するため、インバウンド開放不要。'),
 ('Patch Managerで管理するにはインスタンスにSSM Agentが必要だが、IAM権限は不要である。', False, 'インスタンスプロファイル等でSSMへの権限付与が必要。'),
 ('Parameter Storeは、データベース認証情報の自動ローテーション機能を標準で備えている。', False, '自動ローテーションはSecrets Managerの機能。'),
]),
('自動修復（Auto-Remediation）の定石', '''
<h4>パターン集</h4>
<ul>
<li>{k|EC2の障害}：CloudWatchアラーム（StatusCheckFailed_System）→ {k|EC2アクション「復旧」}。同一IP・EBSそのままで別ホストで再起動（インスタンスストアは非対応）</li>
<li>{k|ASGヘルスチェック}：EC2ステータスに加え、{k|ELBヘルスチェックを有効化}しないと「アプリが応答しないだけ」のインスタンスが置換されない</li>
<li>{k|Config非準拠}→ Configルールの{k|修復アクション（SSM Automation）}（例：暗号化なしEBS検出、公開S3のBlock Public Access有効化）</li>
<li>{k|GuardDuty検出}→ EventBridge → Lambda/SSM Automation（例：侵害疑いのインスタンスを隔離SGへ変更しスナップショット取得）</li>
<li>{k|AWS Health}イベント（計画メンテナンス、RDS更新、EC2リタイア予定）→ EventBridge → 通知/自動対応</li>
<li>{k|CloudFormationスタックのドリフト}→ 通知後に再デプロイ。手動変更を許さない運用が理想</li>
</ul>
<h4>設計の判断基準</h4>
<ul>
<li>冪等（何度実行しても同じ結果）な修復にする。連続発火でループしないようガードする</li>
<li>修復は{k|最小権限のIAMロール}（Automation Assume Role）で実行し、実行履歴をCloudTrailで監査</li>
<li>承認が必要な高リスク操作はAutomationの{k|承認アクション}やStep Functionsで人手を挟む</li>
<li>{t|引っ掛け}：Lambdaを自作するより、SSM Automationの既製ランブックがある場合は「運用オーバーヘッド最小」で優先されることが多い</li>
</ul>
''', [
 ('Auto Scalingグループは、ELBヘルスチェックを有効にしない限り、EC2のステータスチェックのみで異常を判断する。', True, '既定はEC2ヘルスチェック。アプリ層の異常検知にはELBヘルスチェックの有効化が必要。'),
 ('EC2の「復旧」アクションはインスタンスストアボリュームのデータも保持したまま復旧させる。', False, '復旧アクションはインスタンスストアを使うインスタンスには対応せず、EBSバックのインスタンスが対象。'),
 ('Configルールの修復アクションに、SSM Automationランブックを指定して非準拠リソースを自動修復できる。', True, '手動実行も自動実行も設定可能。'),
]),
]
LESSON, OX = build('3-2', '自動化と自動修復（EventBridge / Systems Manager）', pages)
