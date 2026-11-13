L = dict(id='2-10', title='コスト最適化とパフォーマンス設計', pages=[
('コンピュートの購入オプションとコスト設計', '''<table><tr><th>オプション</th><th>特徴</th></tr><tr><td>オンデマンド</td><td>柔軟、最も高い。短期・予測不能</td></tr><tr><td><b class="key">Compute Savings Plans</b></td><td>1年/3年の時間あたり金額コミット。EC2(リージョン・ファミリー・OS不問)・Fargate・Lambdaに適用。最大66%程度の割引</td></tr><tr><td><b class="key">EC2 Instance Savings Plans</b></td><td>特定リージョン・ファミリーに限定、割引率が高い(最大72%程度)</td></tr><tr><td>リザーブドインスタンス</td><td>Standard(変更制限、最大72%)/Convertible(ファミリー変更可)。RDS/ElastiCache/Redshift/OpenSearchはRIで割引(Savings Plansは対象外)</td></tr><tr><td><b class="key">スポット</b></td><td>最大90%引き。<b class="key">2分前通知で中断</b>。ステートレス・耐障害・バッチ/CI/ビッグデータ向け</td></tr><tr><td>Dedicated Host/Instance</td><td>BYOL(ソケット/コア単位ライセンス)・コンプライアンス</td></tr><tr><td>Capacity Reservation</td><td>AZ内の容量確保(割引なし。SPと併用)</td></tr></table>
<ul><li>Auto Scaling+混合インスタンスポリシー(ベースをオンデマンド/RI、上乗せをスポット、複数ファミリーで中断リスク分散。capacity-optimized)</li><li><b class="key">Graviton</b>(Arm)：同等性能で価格性能比が良い(約20〜40%向上)。対応ソフトのみ</li><li><b class="key">Compute Optimizer</b>：EC2/EBS/Lambda/ASGのライトサイジング推奨。Cost Explorer・Budgets・Cost Anomaly Detection・コスト配分タグ・Cost and Usage Report</li></ul>
<p><span class="trap">引っ掛け：「予測可能な常時稼働＋インスタンスファミリー変更の可能性」→Compute Savings PlansまたはConvertible RI。「中断してはいけない」ワークロードにスポットは不可。</span></p>''',
[('Compute Savings Plansは、EC2だけでなくFargateとLambdaの利用にも適用される。',True,'柔軟性が高い。'),
('RDSの利用料金はCompute Savings Plansで割引できる。',False,'RDSなどのDBサービスはリザーブドインスタンスで割引。'),
('スポットインスタンスは中断の通知が約2分前に行われる。',True,'中断を許容でき、再試行可能な処理に使う。')]),
('データ転送・ストレージ・ネットワークのコスト', '''<ul><li>データ転送の原則：インバウンド無料、同一AZ内プライベートIPは無料、<b class="key">AZ間・リージョン間・インターネット送信は課金</b></li><li>NAT Gatewayは時間+処理GB課金 → S3/DynamoDBへは<b class="key">ゲートウェイエンドポイント(無料)</b>を使い、NATを経由させない</li><li><b class="key">CloudFront</b>：オリジン→CloudFront間の転送は無料。インターネット直接送信より割安になることが多い、プライスクラスでさらに削減</li><li>S3：ライフサイクル/Intelligent-Tiering、S3 Storage Lens、リクエスター支払い、Gateway Endpoint</li><li>EBS：未アタッチボリューム・古いスナップショットの削除、gp2→gp3</li><li><b class="key">Direct Connect</b>(大量・継続的転送は割安・安定)vs VPN(迅速・低コスト)。Transit Gatewayは時間+データ処理課金、<b class="key">VPCピアリング</b>は同一AZなら転送無料・推移的ルーティング不可</li><li>AZ間転送の最小化：AZ認識ルーティング(NLB/ALBクロスゾーン無効)、トポロジ認識ルーティング(EKS)</li></ul>
<h4>サーバーレス/マネージドのコスト特性</h4><ul><li>低頻度・変動 → Lambda/Fargate/Aurora Serverless/DynamoDBオンデマンド</li><li>常時高負荷で安定 → RIやSPが効くEC2/プロビジョンドが安い場合が多い</li></ul>
<p><span class="trap">引っ掛け：プライベートサブネットのEC2からS3へ大量転送しNAT料金が高い → S3ゲートウェイVPCエンドポイント。</span></p>''',
[('S3へのアクセスにはゲートウェイ型VPCエンドポイントを使うことで、NAT Gatewayのデータ処理料金を回避できる。',True,'ゲートウェイエンドポイントは追加料金なし。'),
('AZ間のデータ転送はAWSでは無料である。',False,'同一AZ内のプライベートIP通信は無料だが、AZ間は課金される。'),
('インターフェースエンドポイントはS3とDynamoDB専用で、時間課金はない。',False,'S3/DynamoDB用の無料はゲートウェイ型。インターフェース型は時間+データ課金で多数のサービスに対応。')]),
('パフォーマンス設計のチェックポイント', '''<ul><li>EC2：ワークロードに合わせたファミリー(C=計算、M=汎用、R=メモリ、I=ストレージIO、G/P=GPU、Inf/Trn=推論/学習)、<b class="key">配置グループ</b>(クラスター=低遅延HPC、パーティション=大規模分散、スプレッド=少数の重要インスタンスの分離)、<b class="key">拡張ネットワーキング/ENA/EFA</b>(HPC・MPI)</li><li>ストレージ：IOPS要求→io2/ストライピング、スループット→st1/FSx Lustre、インスタンスストア</li><li>DB：リードレプリカ・Auroraリーダーで読み取り分散、<b class="key">キャッシュ</b>(ElastiCache/DAX)、RDS Proxy、パーティション設計</li><li>配信：CloudFront、Global Accelerator、S3 Transfer Acceleration、<b class="key">API Gatewayキャッシュ</b></li><li>非同期化/バッファ：SQS・Kinesis・Lambda同時実行制御で背圧</li><li>リージョン選択：ユーザー近接・サービス提供状況・コンプライアンス・コスト</li><li>観測：CloudWatch(メトリクス・ログ・アラーム)、X-Ray、Performance Insights、Compute Optimizer</li></ul>
<h4>Well-Architected 6本柱</h4><p>運用上の優秀性／セキュリティ／信頼性／パフォーマンス効率／コスト最適化／<b class="key">持続可能性</b>。トレードオフ(例：信頼性↑はコスト↑)の中で要件優先度に沿って選ぶのがSAPの核心。</p>
<p><span class="trap">引っ掛け：問題文の「最もコスト効率が高い」「運用オーバーヘッド最小」「最小限の変更」という修飾語で答えが変わる。要件をすべて満たす選択肢のうち、修飾語に最も合致するものを選ぶ。</span></p>''',
[('クラスター配置グループは、単一AZ内で低遅延・高スループットのノード間通信を必要とするHPC向けである。',True,'同一AZ内でラックを近接させる。'),
('EFAはTCP通信の一般的なWebアプリのスループットを高めるための機能である。',False,'EFAはHPC/MLのノード間通信(OSバイパス)向け。'),
('Well-Architectedフレームワークの6本柱には持続可能性が含まれる。',True,'2021年末に追加された。')]),
])
