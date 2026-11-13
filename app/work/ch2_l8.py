L = dict(id='2-8', title='分析・データレイク・ストリーミング', pages=[
('Redshift・Athena・EMR・OpenSearchの使い分け', '''<table><tr><th>サービス</th><th>選ぶ場面</th></tr><tr><td>Redshift</td><td>DWH。大規模・複雑なSQL結合/集計、BI。RA3(コンピュートとストレージ分離)、<b class="key">Redshift Spectrum</b>でS3を直接クエリ、Serverless、同時実行スケーリング、マテリアライズドビュー、データ共有、ゼロETL統合(Aurora/DynamoDB等)</td></tr><tr><td><b class="key">Athena</b></td><td>S3上のデータにアドホックSQL(サーバーレス・スキャン量課金)。<b class="key">Parquet/ORC圧縮・パーティション</b>でコストと速度を改善。Glue Data Catalog使用</td></tr><tr><td><b class="key">EMR</b></td><td>Spark/Hadoop/Hive/Presto等のビッグデータ処理。細かな制御、スポット活用、EMR Serverless/on EKS</td></tr><tr><td>OpenSearch Service</td><td>全文検索、ログ分析、ダッシュボード</td></tr><tr><td>QuickSight</td><td>BI。SPICEインメモリ、行レベルセキュリティ</td></tr></table>
<ul><li>Redshiftの暗号化・スナップショットのクロスリージョンコピー、Multi-AZ(RA3)</li><li>Redshiftは<b class="key">OLAP</b>、RDS/AuroraはOLTP。大量の小さなトランザクション更新にRedshiftは不向き</li></ul>
<p><span class="trap">引っ掛け：「S3に置いたままアドホック／頻度が低い」→Athena。「複雑な結合を高頻度に、多数の同時BIユーザー」→Redshift。「S3のデータとDWHテーブルをまとめて結合」→Redshift Spectrum。</span></p>''',
[('Athenaはスキャンしたデータ量に応じて課金されるため、列指向形式(Parquet)とパーティショニングでコストを下げられる。',True,'読み込む量が減る。'),
('Redshiftは大量の小さなOLTPトランザクション処理に最適である。',False,'RedshiftはOLAP向け。OLTPはRDS/Aurora/DynamoDB。'),
('Redshift SpectrumはS3上のデータを、Redshiftクラスターにロードせずにクエリできる。',True,'DWHとデータレイクの横断クエリが可能。')]),
('データレイクとETL：Glue・Lake Formation・DataZone', '''<ul><li>S3データレイク：Raw/Curated/Processed層、パーティション設計、Parquet変換</li><li>AWS Glue：サーバーレスETL(Spark/Python)。<b class="key">Glue Data Catalog</b>(Athena/EMR/Redshift Spectrum共通のメタデータ)、<b class="key">クローラー</b>でスキーマ自動検出、ジョブブックマークで差分処理、Glue Studio、DataBrew(ノーコード整形)、Glue Data Quality</li><li><b class="key">Lake Formation</b>：データレイクの集中アクセス制御。データベース/テーブル/<b class="key">列・行・セルレベル</b>の権限、タグベース(LF-TBAC)、<b class="key">クロスアカウント共有</b>。Athena/Redshift Spectrum/EMR/Glueが権限を強制</li><li>Amazon DataZone / SageMaker Unified Studio：データ共有・カタログ・ガバナンスのポータル</li><li>S3 Tables(Apache Iceberg形式のマネージドテーブル)でレイクハウス</li></ul>
<h4>ポイント</h4><ul><li>IAM・S3バケットポリシーだけでは列レベル制御が困難 → Lake Formation</li><li>機密データの検出：<b class="key">Macie</b>(S3のPII検出)</li></ul>
<p><span class="trap">引っ掛け：Athenaで列を隠したい → Lake Formation列フィルター(データ自体のコピー不要)。スキーマ変更のたびに手作業でDDLを書かず、クローラーで自動化。</span></p>''',
[('Lake Formationでは、テーブルの列レベルや行レベルでのアクセス制御を一元的に設定できる。',True,'クエリエンジン側がLake Formationの権限を適用する。'),
('Glue Data Catalogは、Glueだけでなく、AthenaやRedshift Spectrumからも参照できる。',True,'共通のメタデータリポジトリとして機能する。'),
('S3バケット内のPII(個人情報)を自動検出するにはGlueクローラーを使う。',False,'PII検出はAmazon Macieの役割。クローラーはスキーマ検出。')]),
('ストリーミングとリアルタイム処理', '''<table><tr><th>サービス</th><th>特徴</th></tr><tr><td><b class="key">Kinesis Data Streams</b></td><td>シャード(書込1MB/s・1,000件/s、読取2MB/s)。オンデマンド/プロビジョンド。拡張ファンアウト(EFO)でコンシューマごとに2MB/s。保持24h〜365日。順序はパーティションキー単位</td></tr><tr><td><b class="key">Amazon Data Firehose</b></td><td>配信専用のマネージド。S3/Redshift/OpenSearch/Splunk/HTTPへ。バッファ(サイズ/時間)のニアリアルタイム。Lambda変換、Parquet変換</td></tr><tr><td><b class="key">Managed Service for Apache Flink</b></td><td>ストリームに対するSQL/Flinkのリアルタイム分析・ウィンドウ集計</td></tr><tr><td><b class="key">MSK</b></td><td>マネージドKafka。既存Kafkaアプリの互換性。MSK Serverless</td></tr><tr><td>IoT Core</td><td>デバイス接続(MQTT)・ルールでKinesis/Lambda等へ</td></tr></table>
<ul><li>典型：Producers → Kinesis Data Streams → (Lambda / Flink) → Firehose → S3 → Athena/Redshift</li><li>ホットシャード：パーティションキー偏り → キー設計見直し、シャード分割。<b class="key">ProvisionedThroughputExceeded</b>はリトライ+バックオフ</li><li>順序保証が不要で任意のコンシューマが独立並列処理 → SQS。順序+複数コンシューマ+再読込 → Kinesis。Kafka互換 → MSK</li></ul>
<p><span class="trap">引っ掛け：Firehoseは「ニアリアルタイム」(バッファ最短で数秒〜60秒)でありリアルタイムではない。また複数のコンシューマが再読込するならFirehoseでなくData Streams。</span></p>''',
[('Amazon Data Firehoseは、ストリームデータをS3やRedshiftなどへ配信するマネージドサービスである。',True,'バッファリングによるニアリアルタイム配信。'),
('Kinesis Data Streamsは、1シャードあたりの書き込みが1MB/sまたは1,000件/sに制限される。',True,'超える場合はシャード追加またはオンデマンドモード。'),
('既存のApache Kafkaアプリケーションをコード変更を最小にして移行するには、Kinesis Data Streamsが最適である。',False,'Kafka互換のAmazon MSKが適する。')]),
])
