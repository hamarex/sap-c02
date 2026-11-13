LESSON=dict(id='4-5',title='モダナイゼーション:コンテナ・サーバーレス・メインフレーム',pages=[
dict(title='モダナイゼーションの進め方と Strangler Fig',html='''<h4>モダナイゼーションの方向性</h4>
<ul><li><b class="key">コンテナ化</b>:ECS / EKS / Fargate。OS 依存のアプリを移植性高く</li>
<li><b class="key">サーバーレス化</b>:Lambda・API Gateway・Step Functions・EventBridge・DynamoDB</li>
<li><b class="key">マネージド DB 化</b>:RDS・Aurora・DynamoDB</li>
<li><b class="key">マイクロサービス化</b>:疎結合(SQS/SNS/EventBridge)</li></ul>
<h4>Strangler Fig パターン</h4>
<p>モノリスを<b class="key">一括書き換えせず</b>、機能単位で新サービスへ段階的に切り出し、ルーティングを徐々に新側へ切替える手法。</p>
<ul><li>前段に <b class="key">ALB / API Gateway / CloudFront</b> を置き、パス単位で新旧に振り分け</li>
<li>リスクを小さくでき、いつでもロールバック可能</li>
<li>AWS では <b class="key">Migration Hub Refactor Spaces</b> が環境構築を自動化</li>
<li>データ同期に DMS CDC や EventBridge を使うことも</li></ul>
<h4>判断基準</h4>
<table><tr><th>要件</th><th>方針</th></tr>
<tr><td>大規模システムを止められず段階移行</td><td>Strangler Fig</td></tr>
<tr><td>全面刷新に数年・ビジネスリスクが高い</td><td>Strangler Fig で段階化</td></tr>
<tr><td>短期間で移行</td><td>Rehost 後にモダナイズ</td></tr></table>
<span class="trap">落とし穴</span>:「ビッグバン書き換え」は選択肢にあっても、ダウンタイム・リスク要件では誤答になりやすい。''',
ox=[('Strangler Fig パターンでは、旧システムを一度に停止して全機能を新システムに切り替える。',False,'段階的に機能を切り出して置換する。'),
('Strangler Fig では前段の ALB などでパス単位にトラフィックを新旧へ振り分けられる。',True,'ルーティングで段階移行。'),
('Refactor Spaces は Strangler Fig 実装用の環境構築を支援する。',True,'Migration Hub の機能。')]),
dict(title='コンテナ化:App2Container と ECS/EKS/Fargate',html='''<h4>AWS App2Container (A2C)</h4>
<ul><li>オンプレ/EC2 上の<b class="key">.NET (Windows) / Java アプリ</b>を分析し、<b class="key">コンテナイメージ + デプロイ成果物</b>を自動生成するコマンドラインツール</li>
<li>出力は ECR 登録・ECS/EKS 向け CloudFormation/Kubernetes マニフェスト、CI/CD パイプライン</li>
<li>ソースコード改修不要。<b class="key">コンテナ化を最小努力で</b>始めたい時の答え</li></ul>
<h4>コンテナ基盤の選択</h4>
<table><tr><th>選択</th><th>特徴</th></tr>
<tr><td><b class="key">ECS on Fargate</b></td><td>サーバー管理不要。AWS ネイティブ、シンプル</td></tr>
<tr><td><b class="key">ECS on EC2</b></td><td>ホストの細かい制御、GPU、コスト最適化(Spot・RI)</td></tr>
<tr><td><b class="key">EKS</b></td><td>Kubernetes 互換・マルチクラウド/オンプレ(EKS Anywhere)との一貫性</td></tr>
<tr><td><b class="key">App Runner</b></td><td>コンテナ/ソースから Web アプリを最も簡単に公開</td></tr>
<tr><td><b class="key">Elastic Beanstalk</b></td><td>コード(Java/.NET 等)をアップするだけ。Replatform</td></tr></table>
<h4>ポイント</h4>
<ul><li>Windows コンテナは EC2 起動タイプや Fargate(Windows)でサポート</li>
<li>既存が Kubernetes → EKS、AWS 固有で単純 → ECS</li>
<li>イメージは <b class="key">ECR</b>(スキャン・ライフサイクル・レプリケーション)</li></ul>''',
ox=[('App2Container は .NET と Java アプリケーションのコンテナ化を支援する。',True,'分析して Dockerfile/デプロイ成果物を生成する。'),
('既存の Kubernetes マニフェスト資産をそのまま使いたい場合は ECS が最適である。',False,'Kubernetes 互換の EKS が適切。'),
('Fargate を使うとコンテナ実行のためのサーバー(EC2)管理が不要になる。',True,'サーバーレスコンピュート。')]),
dict(title='サーバーレス化とアプリ・データのモダナイズ',html='''<h4>サーバーレス移行の考え方</h4>
<ul><li>バッチ・イベント駆動 → <b class="key">Lambda + EventBridge / S3 / SQS</b></li>
<li>REST API → <b class="key">API Gateway + Lambda</b>(または Lambda 関数 URL)</li>
<li>長時間ワークフロー・オーケストレーション → <b class="key">Step Functions</b></li>
<li>メッセージング(ActiveMQ/RabbitMQ 等) → <b class="key">Amazon MQ</b>(互換のまま Replatform)/ SQS・SNS(Refactor)</li>
<li>ETL → AWS Glue、ストリーム → Kinesis / MSK</li></ul>
<h4>Lambda の制約(引っ掛け)</h4>
<ul><li>最大実行時間 <b class="key">15 分</b>。これを超える処理は Fargate/Step Functions/Batch</li>
<li>メモリは最大 10GB、/tmp は最大 10GB、デプロイパッケージ制限あり(コンテナイメージは 10GB)</li>
<li>コールドスタート対策に Provisioned Concurrency / SnapStart</li></ul>
<h4>データのモダナイズ</h4>
<table><tr><th>現状</th><th>移行先</th></tr>
<tr><td>自前の Hadoop</td><td>EMR(+ S3 データレイク)</td></tr>
<tr><td>オンプレ DWH</td><td>Redshift</td></tr>
<tr><td>Redis/Memcached 自前</td><td>ElastiCache / MemoryDB</td></tr>
<tr><td>Elasticsearch 自前</td><td>OpenSearch Service</td></tr>
<tr><td>Kafka 自前</td><td>MSK</td></tr></table>''',
ox=[('Lambda は 1 回の実行に最大 15 分まで使用できる。',True,'タイムアウト上限は 15 分。'),
('ActiveMQ を最小改修で移行したい場合は SQS への移行が最適である。',False,'プロトコル互換の Amazon MQ が最適。'),
('Step Functions は複数の Lambda や AWS サービスをワークフローとしてオーケストレーションできる。',True,'標準機能。')]),
dict(title='メインフレーム移行 (M2)',html='''<h4>AWS Mainframe Modernization (M2)</h4>
<p>COBOL / PL/I 等のメインフレームアプリを AWS に移行・近代化するマネージドサービス。2 つのパターン:</p>
<table><tr><th>パターン</th><th>内容</th></tr>
<tr><td><b class="key">Replatform</b>(再プラットフォーム)</td><td>COBOL コードを<b class="key">ほぼそのまま</b>、互換ランタイム(Rocket Software 等)上で実行。改修を最小に</td></tr>
<tr><td><b class="key">Automated Refactor</b>(自動リファクタリング)</td><td>COBOL を <b class="key">Java</b> に自動変換(AWS Blu Age)。クラウドネイティブ化・マイクロサービス化を見据える</td></tr></table>
<h4>周辺のポイント</h4>
<ul><li>M2 には開発/テスト/ランタイム環境が含まれ、<b class="key">Multi-AZ・自動スケーリング</b>に対応</li>
<li>データ:VSAM・DB2 → DMS 等で Aurora / RDS / DynamoDB へ。ファイルは S3・EFS・FSx</li>
<li>ジョブ(JCL)・オンライン(CICS)を取り込む</li>
<li>評価は <b class="key">Migration Hub Strategy Recommendations / AWS Transform</b> 等で</li>
<li>ライセンス・ハードウェア保守費(MIPS 課金)の削減が主な動機</li></ul>
<h4>選択の判断</h4>
<ul><li>「期間・リスク最小、コード変更したくない」→ Replatform</li>
<li>「Java 化して継続的にモダナイズ、スキル確保」→ Automated Refactor</li>
<li><span class="trap">落とし穴</span>:EC2 に Hercules などのエミュレータを手作りする案は運用負荷が高く、マネージドの M2 が優先</li></ul>''',
ox=[('M2 の Replatform パターンでは、COBOL をほぼ変更せずに互換ランタイムで実行できる。',True,'改修最小。'),
('M2 の Automated Refactor は COBOL を Python に変換する。',False,'Java へ変換。'),
('メインフレーム移行では、ハードウェアや MIPS ベースの保守費削減がよくある動機である。',True,'コスト削減が主な動機の一つ。')]),
])
