L = dict(id='2-6', title='コンテナ設計(ECS・EKS・Fargate)', pages=[
('ECS・EKS・Fargate・App Runnerの選択', '''<table><tr><th>サービス</th><th>選ぶ場面</th></tr><tr><td><b class="key">ECS</b></td><td>AWSネイティブ。シンプル、IAM統合、運用負荷が低い。Kubernetes知識不要</td></tr><tr><td><b class="key">EKS</b></td><td>Kubernetes標準API、既存K8sの移行・マルチクラウド可搬性、OSSエコシステム。EKS Anywhere/ハイブリッド</td></tr><tr><td>Fargate</td><td>サーバーレスのコンピュート(ECS/EKS共通)。<b class="key">EC2ノード管理不要</b>、タスク単位に分離</td></tr><tr><td>App Runner</td><td>ソース/イメージから最小設定でWebアプリ/APIを公開</td></tr><tr><td>ECR</td><td>コンテナレジストリ。脆弱性スキャン、<b class="key">クロスリージョン/クロスアカウントレプリケーション</b>、ライフサイクルポリシー</td></tr></table>
<h4>起動タイプの判断</h4><ul><li>Fargate：運用最小化、変動負荷、小〜中規模</li><li>EC2起動タイプ：GPU、特殊インスタンス、Savings Plans/スポットで大規模常時稼働コスト最適化、Daemon、ホストレベル制御、Windowsの一部要件</li><li><b class="key">Fargate Spot</b>：中断許容のバッチで最大70%程度の割引</li></ul>
<p><span class="trap">引っ掛け：「Kubernetesの運用を避けたい」→ECS。「既にKubernetesマニフェスト/Helmを使っている」→EKS。「サーバー管理をなくしたい」→Fargate(ECSでもEKSでも可)。</span></p>''',
[('Fargateを使うと、コンテナを実行するEC2インスタンスのパッチ適用やスケーリング管理が不要になる。',True,'サーバーレスコンピュートでタスク単位に起動する。'),
('FargateはECSでのみ利用でき、EKSでは利用できない。',False,'EKSもFargateプロファイルでPodをFargate上で実行できる。'),
('既存のKubernetes資産(Helmチャート)を最小変更で移行するにはEKSが適する。',True,'Kubernetes互換のため。')]),
('ECS/EKSのネットワーク・IAM・スケーリング', '''<h4>ECS</h4><ul><li><b class="key">タスクロール</b>(コンテナ内アプリがAWS APIを呼ぶ権限)と<b class="key">タスク実行ロール</b>(ECR pull・ログ送信・Secrets取得)を区別</li><li>ネットワークモード<b class="key">awsvpc</b>：タスクごとにENI。タスク単位のセキュリティグループ(Fargateは必須)</li><li>サービスのオートスケーリング(Application Auto Scaling)：ターゲット追跡。キャパシティプロバイダーでEC2のASGもスケール</li><li>デプロイ：ローリング、<b class="key">CodeDeployによるBlue/Green</b>(カナリア/線形)</li><li>ECS Service Connect / Cloud Map：サービスディスカバリ</li><li>機密値はSecrets Manager / SSM Parameter Storeから環境変数/シークレットとして注入(平文埋め込み禁止)</li></ul>
<h4>EKS</h4><ul><li><b class="key">IRSA</b>(IAM Roles for Service Accounts)またはEKS Pod Identityで、Pod単位に最小権限</li><li>スケーリング：Pod＝HPA、ノード＝Cluster Autoscalerまたは<b class="key">Karpenter</b>(高速・多様なインスタンスを自動選択)</li><li>VPC CNIはPodにVPCのIPを割り当て → サブネットのIP枯渇に注意</li><li>ノード種別：マネージドノードグループ / セルフマネージド / Fargate</li><li>コントロールプレーンは複数AZで管理され、AWSが運用</li></ul>''',
[('ECSのタスク実行ロールは、コンテナ内のアプリがS3にアクセスするための権限を付与するロールである。',False,'それはタスクロール。実行ロールはECRのpullやログ出力、シークレット取得などECSエージェント用。'),
('EKSでPod単位に最小権限を付与するには、IRSAまたはEKS Pod Identityを使う。',True,'ノードのインスタンスプロファイルを共有すると権限が過剰になる。'),
('KarpenterはEKSのノードを需要に応じて迅速にプロビジョニングするオートスケーラーである。',True,'Cluster Autoscalerの代替として使える。')]),
('コンテナ移行・モダナイズの判断', '''<ul><li><b class="key">AWS App2Container(A2C)</b>：既存のJava/.NETアプリをコンテナ化しECS/EKSへ</li><li><b class="key">Lift &amp; Shift(Rehost)</b>＝MGN / <b class="key">Replatform</b>＝RDS化など小改修 / <b class="key">Refactor</b>＝サーバーレス/マイクロサービス化</li><li>マイクロサービス間通信：同期＝ALB/ECS Service Connect/VPC Lattice、非同期＝SQS/SNS/EventBridge</li><li>ログ/監視：Container Insights、FireLens(Fluent Bit)でログルーティング、X-Ray/OpenTelemetry</li></ul>
<h4>サーバーレス vs コンテナ</h4><table><tr><th>観点</th><th>Lambda</th><th>コンテナ(Fargate)</th></tr><tr><td>実行時間</td><td>最大15分</td><td>制限なし(常駐可)</td></tr><tr><td>起動</td><td>ms〜(コールドスタート)</td><td>数十秒</td></tr><tr><td>課金</td><td>呼び出し/実行時間</td><td>vCPU・メモリの稼働時間</td></tr><tr><td>適性</td><td>イベント駆動・短時間・スパイク</td><td>常駐サービス・長時間・既存コンテナ</td></tr></table>
<p><span class="trap">引っ掛け：コンテナイメージを使うだけならLambdaコンテナイメージ(最大10GB)もある。「15分超」「常時稼働」「ポート待受サーバー」はLambdaでは不向き。</span></p>''',
[('Lambdaは15分を超える長時間バッチ処理を単一の実行で完了できる。',False,'上限15分。それ以上はFargate/Batch等。'),
('既存の.NETアプリをコンテナ化してECSやEKSへ移行する支援にAWS App2Containerが利用できる。',True,'アプリ検出からコンテナ化、デプロイ成果物生成までを支援。'),
('Fargate Spotは中断が許容されるバッチ処理のコスト削減に適する。',True,'中断に備えてチェックポイント/再実行可能な設計にする。')]),
])
