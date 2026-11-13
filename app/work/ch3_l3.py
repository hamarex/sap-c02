from ch3_common import build
pages = [
('CodePipeline と CodeBuild', '''
<ul>
<li>{k|CodePipeline}：ソース → ビルド → テスト → 承認 → デプロイをオーケストレーションするマネージドCD。ソースは S3、ECR、GitHub（CodeConnections経由）など。{t|CodeCommitは新規顧客受付を終了}しているため、新規構成ではGitHub等が前提</li>
<li>{k|CodeBuild}：サーバーレスのビルド実行環境。{k|buildspec.yml}（phases: install/pre_build/build/post_build、artifacts、cache）。VPC内リソース（プライベートDB等）にアクセスするには{k|VPC設定}が必要。ローカルキャッシュ/S3キャッシュでビルド高速化</li>
<li>{k|手動承認アクション}：本番デプロイ前にSNS通知＋承認。{k|クロスアカウントデプロイ}：パイプラインが別アカウントのロールをAssumeし、成果物バケットとKMSキーのポリシーでアクセス許可（成果物はCMKで暗号化する必要がある）</li>
<li>{k|クロスリージョン}アクション：リージョンごとに成果物バケットを用意</li>
<li>パイプライン実行の失敗/成功は{k|EventBridge}で検知して通知・ロールバックへ</li>
<li>CodeBuildでの{k|シークレット}は平文の環境変数にせず、{k|Secrets Manager / Parameter Store}参照を使う</li>
</ul>
<h4>テスト・セキュリティの組み込み</h4>
<ul>
<li>ビルドステージで単体テスト、{k|CodeGuru Reviewer}や{k|Inspector（ECR/Lambdaスキャン）}で静的解析/脆弱性検査</li>
<li>CloudFormationデプロイ時はテストステージに{k|変更セット}の確認を挟む</li>
</ul>
''', [
 ('CodeBuildがVPC内のプライベートなRDSに接続してテストを実行するには、CodeBuildプロジェクトにVPC設定が必要である。', True, 'VPC設定を行うことでVPC内リソースへアクセスできる。'),
 ('CodePipelineでクロスアカウントデプロイを行う場合、成果物バケットの暗号化にAWS管理キーを使っても別アカウントから復号できる。', False, 'AWS管理キーはアカウント間共有できない。カスタマー管理キーでキーポリシーに相手アカウントを許可する。'),
 ('CodePipelineには本番デプロイ前に人の承認を挟む手動承認アクションがある。', True, 'SNS通知と組み合わせて利用する。'),
]),
('CodeDeploy：デプロイ戦略と自動ロールバック', '''
<table>
<tr><th>対象</th><th>方式</th></tr>
<tr><td>EC2/オンプレ</td><td>{k|In-place}（既存を更新。ASGでローリング的に）/ {k|Blue/Green}（新ASGを作り、ELBのトラフィックを切替、旧は保持後に終了）</td></tr>
<tr><td>Lambda</td><td>エイリアスの重み付けシフト：{k|Canary}（例 10%を5分→残り全て）/ {k|Linear}（例 10%を1分ごと）/ {k|AllAtOnce}</td></tr>
<tr><td>ECS</td><td>{k|Blue/Green}のみ。ALBのリスナー/ターゲットグループ切替。Canary / Linear / AllAtOnce</td></tr>
</table>
<ul>
<li>{k|AppSpec}ファイルとライフサイクルフック（BeforeInstall、AfterInstall、ApplicationStart、{k|ValidateService}、Lambda/ECSでは BeforeAllowTraffic/AfterAllowTraffic）で検証を挟む</li>
<li>{k|自動ロールバック}：デプロイ失敗時、または{k|CloudWatchアラームがALARM}になった時に自動で前バージョンへ戻す</li>
<li>デプロイ設定：EC2/In-placeは {k|AllAtOnce / HalfAtATime / OneAtATime}</li>
<li>Blue/Greenの利点：{k|瞬時にロールバック}（旧環境へトラフィックを戻す）、本番同等環境でテスト可能。欠点：一時的にリソースが倍</li>
</ul>
<p>{t|引っ掛け}：ECSでCodeDeployのBlue/Greenを使う場合のデプロイコントローラーは「CODE_DEPLOY」。ECS標準のローリング更新は「ECS」コントローラー。In-placeはダウンタイム・容量低下が発生しうる。</p>
''', [
 ('CodeDeployのLambdaデプロイでは、エイリアスのトラフィックを段階的に新バージョンへ移すCanaryやLinear設定が使える。', True, 'Canary/Linear/AllAtOnceが選べる。'),
 ('CodeDeployでCloudWatchアラームを自動ロールバックのトリガーに設定することはできない。', False, 'アラーム発報時の自動ロールバックを設定できる。'),
 ('ECSサービスのCodeDeployデプロイは、In-placeとBlue/Greenの両方から選べる。', False, 'ECSのCodeDeployデプロイはBlue/Greenのみ。'),
]),
('デプロイ戦略の使い分け（ダウンタイムとリスク）', '''
<table>
<tr><th>戦略</th><th>特徴</th><th>主な実現手段</th></tr>
<tr><td>All at once</td><td>最速・ダウンタイムあり・ロールバックは再デプロイ</td><td>Beanstalk / CodeDeploy</td></tr>
<tr><td>Rolling</td><td>バッチ更新、容量一時低下</td><td>Beanstalk Rolling / ASG Instance Refresh</td></tr>
<tr><td>Rolling with additional batch</td><td>追加バッチで容量維持</td><td>Beanstalk</td></tr>
<tr><td>{k|Immutable}</td><td>新ASGに新規インスタンス。失敗時は新ASGを破棄するだけ、{k|ロールバック容易}</td><td>Beanstalk</td></tr>
<tr><td>{k|Traffic splitting}</td><td>新旧へ一定割合で流す（カナリア評価）</td><td>Beanstalk</td></tr>
<tr><td>{k|Blue/Green}</td><td>別環境を作り切替。即時戻し</td><td>CodeDeploy / Beanstalk URLスワップ / Route 53</td></tr>
<tr><td>{k|カナリア}</td><td>少数ユーザーで検証後に全展開</td><td>ALB重み付けTG、Route 53加重、Lambdaエイリアス、API Gatewayカナリアステージ</td></tr>
</table>
<ul>
<li>{k|Route 53加重ルーティング}での切替は{t|DNSのTTL・クライアントキャッシュで完全に即時にならない}。即時性が必要ならALBの加重ターゲットグループ</li>
<li>{k|ASG Instance Refresh}：起動テンプレート更新後に、最小正常率を保ちつつインスタンスを段階的に入れ替え</li>
<li>{k|AWS AppConfig}：コード再デプロイなしに設定/{k|フィーチャーフラグ}を段階配信し、アラーム連動で自動ロールバック</li>
<li>データベーススキーマ変更は{k|後方互換（expand/contract）}にしないとBlue/Greenで旧環境へ戻せない</li>
</ul>
''', [
 ('Elastic Beanstalkのimmutableデプロイは、新しいASGで新インスタンスを起動して検証するため、失敗時のロールバックが容易である。', True, '失敗時は新ASGを終了するだけで元の環境が無傷で残る。'),
 ('Route 53の加重ルーティングによるBlue/Green切替は、DNSキャッシュの影響を受けず必ず即時に反映される。', False, 'TTLやクライアント/リゾルバのキャッシュにより即時でない。'),
 ('AWS AppConfigは、アプリ設定やフィーチャーフラグをコード再デプロイなしに段階的に配信でき、アラーム連動でロールバックもできる。', True, 'AppConfigのデプロイ戦略とCloudWatchアラーム監視による。'),
]),
('AMI・コンテナの供給網とパイプライン運用', '''
<ul>
<li>{k|EC2 Image Builder}：OSパッチ・ソフト導入・テストを含む{k|AMI/コンテナイメージの自動ビルドパイプライン}。スケジュールまたは親イメージ更新で起動。配布先リージョン/アカウントを指定、Inspectorで脆弱性スキャン</li>
<li>{k|Golden AMI}方式：起動が速く再現性が高いが、更新（パッチ）の頻度に合わせたAMI再作成が必要。一方、起動時に{k|ユーザーデータ}で都度構成する方式は柔軟だが起動が遅く外部依存で失敗しうる</li>
<li>{k|Amazon ECR}：イメージのスキャン（Inspector強化スキャン）、{k|ライフサイクルポリシー}で古いイメージ削除、クロスリージョン/アカウントレプリケーション、プルスルーキャッシュ</li>
<li>{k|CloudFormation + CodePipeline}：テンプレート変更を変更セット→承認→実行する{k|インフラのCI/CD}</li>
<li>パイプラインのIAM：ステージごとに{k|最小権限のサービスロール}を分離。本番アカウントへは{k|クロスアカウントロール}</li>
</ul>
<h4>試験での選び方</h4>
<ul>
<li>「ダウンタイムなし・すぐ戻せる」→ Blue/Green</li>
<li>「少数で検証し徐々に展開」→ カナリア/Linear</li>
<li>「追加コスト最小で更新」→ ローリング</li>
<li>「パッチ適用済みAMIを継続供給」→ Image Builder</li>
<li>{t|「手動手順を減らす」「繰り返し可能」}という文言が出たらIaC+CI/CDの自動化が答え</li>
</ul>
''', [
 ('EC2 Image Builderは、パッチ適用とテストを含むAMIのビルドを自動化し、複数リージョンへ配布できる。', True, 'パイプラインでビルド・テスト・配布を自動化する。'),
 ('ECRのライフサイクルポリシーにより、古いイメージを自動で削除してストレージコストを抑えられる。', True, 'タグ付き/タグなし、保持数や日数などのルールを設定できる。'),
]),
]
LESSON, OX = build('3-3', 'CI/CDとデプロイ戦略（CodePipeline / CodeDeploy）', pages)
