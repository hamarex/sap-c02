LESSON=dict(id='4-3',title='データベース移行:DMS・SCT・Aurora・DynamoDB',pages=[
dict(title='DMS の基本:フルロードと CDC',html='''<h4>AWS DMS</h4>
<p>データベース間のデータ移行・継続レプリケーションを行うマネージドサービス。ソース DB を<b class="key">稼働させたまま</b>移行できます。</p>
<table><tr><th>移行タイプ</th><th>内容</th></tr>
<tr><td>Full load</td><td>既存データを一括コピー</td></tr>
<tr><td>CDC only</td><td>変更のみを継続反映</td></tr>
<tr><td><b class="key">Full load + CDC</b></td><td>最小ダウンタイム移行の定番。ロード中の変更もキャッチアップ</td></tr></table>
<h4>構成要素</h4>
<ul><li><b class="key">レプリケーションインスタンス</b>(または <b class="key">DMS Serverless</b> で自動スケール)</li>
<li>ソース/ターゲットエンドポイント、移行タスク</li>
<li><b class="key">Multi-AZ</b> で可用性確保、データ検証(Validation)</li>
<li>ターゲットは RDS/Aurora/Redshift/DynamoDB/S3/Kinesis/OpenSearch など</li></ul>
<h4>CDC の前提条件(ソース側)</h4>
<ul><li>MySQL:<b class="key">バイナリログ有効・ROW 形式</b></li>
<li>Oracle:<b class="key">ARCHIVELOG モード + 補足ロギング</b></li>
<li>PostgreSQL:論理レプリケーション(wal_level=logical)</li>
<li>SQL Server:ディストリビューション/MS-CDC 等</li></ul>
<span class="trap">落とし穴</span>:DMS はスキーマ(ストアドプロシージャ等)を完全には変換しない。異種 DB は SCT/Schema Conversion が必要。''',
ox=[('Full load + CDC を使うと、移行中もソース DB の更新を継続できる。',True,'CDC で変更をキャッチアップする。'),
('MySQL ソースで CDC を使う場合、バイナリログは STATEMENT 形式にする必要がある。',False,'ROW 形式が必要。'),
('DMS は異種 DB 間のストアドプロシージャを自動で完全変換する。',False,'スキーマ変換は SCT/DMS Schema Conversion の役割で、完全自動とは限らない。')]),
dict(title='異種 DB 移行:SCT と Schema Conversion',html='''<h4>同種 vs 異種</h4>
<ul><li><b class="key">同種(Homogeneous)</b>:MySQL → Aurora MySQL、Oracle → RDS Oracle など。ネイティブツール(mysqldump、pg_dump、Oracle Data Pump、DMS の homogeneous data migrations)で効率的</li>
<li><b class="key">異種(Heterogeneous)</b>:Oracle → Aurora PostgreSQL、SQL Server → Aurora PostgreSQL など。<b class="key">スキーマ変換 + データ移行</b>の 2 段階</li></ul>
<h4>AWS Schema Conversion Tool (SCT)</h4>
<ul><li>スキーマ(テーブル、ビュー、ストアドプロシージャ、関数)と<b class="key">アプリケーション内の SQL コード</b>を変換</li>
<li><b class="key">評価レポート</b>で自動変換可能率・手作業が必要な箇所を可視化</li>
<li>データウェアハウス(Teradata・Oracle DW 等)→ <b class="key">Redshift</b> にも対応。大容量は SCT データ抽出エージェント + <b class="key">Snowball Edge</b></li>
<li>後継的に <b class="key">DMS Schema Conversion</b>(コンソール内で実行可能)</li></ul>
<h4>Babelfish for Aurora PostgreSQL</h4>
<p>SQL Server の T-SQL / TDS プロトコルを<b class="key">アプリ変更最小で</b> Aurora PostgreSQL が受け付ける機能。SQL Server アプリの改修を減らしたい時の選択肢です。</p>
<h4>典型フロー</h4>
<ol><li>SCT でスキーマ変換、ターゲットに適用</li><li>DMS で full load + CDC</li><li>アプリをターゲットへ切替(カットオーバー)</li></ol>''',
ox=[('SCT はアプリケーションコード内の SQL を変換する機能も持つ。',True,'埋め込み SQL の変換と評価が可能。'),
('Babelfish for Aurora PostgreSQL は、SQL Server アプリの T-SQL をほぼ変更せずに利用可能にする機能である。',True,'TDS・T-SQL 互換。'),
('Oracle から Aurora PostgreSQL への移行では、DMS だけでスキーマ変換まで完結する。',False,'スキーマ変換には SCT/Schema Conversion を併用する。')]),
dict(title='Aurora への移行と選択',html='''<h4>Aurora を選ぶ理由</h4>
<ul><li>MySQL/PostgreSQL 互換、<b class="key">最大 15 リードレプリカ</b>、ストレージは 3 AZ に 6 コピー(最大 128TiB まで自動拡張)</li>
<li>フェイルオーバーが高速。<b class="key">Aurora Global Database</b> でリージョン間レプリケーション</li>
<li>Aurora Serverless v2 で可変ワークロードに対応</li></ul>
<h4>移行手段(MySQL/PostgreSQL → Aurora)</h4>
<table><tr><th>方式</th><th>ダウンタイム</th><th>備考</th></tr>
<tr><td>RDS のスナップショットから復元</td><td>中</td><td>RDS MySQL/PostgreSQL → Aurora のスナップショット移行</td></tr>
<tr><td><b class="key">Aurora リードレプリカ作成 → 昇格</b></td><td><b class="key">小</b></td><td>RDS MySQL/PostgreSQL のレプリカとして Aurora を作り、同期後に昇格</td></tr>
<tr><td>Percona XtraBackup(MySQL)→ S3 → Aurora</td><td>中</td><td>オンプレ MySQL の大容量向け</td></tr>
<tr><td><b class="key">DMS(full load + CDC)</b></td><td>最小</td><td>オンプレ・他クラウド・異種 DB</td></tr></table>
<h4>注意</h4>
<ul><li>Aurora はストレージ自動拡張のため事前の容量設計は不要</li>
<li>リージョン間移行は Global Database/クロスリージョンレプリカ</li>
<li><span class="trap">落とし穴</span>:Aurora から RDS 等への逆方向移行は DMS や論理ダンプが基本(Aurora は独自のクラスターボリュームを使う)</li></ul>''',
ox=[('RDS for MySQL から Aurora MySQL へは、Aurora リードレプリカを作成して昇格する方法でダウンタイムを小さくできる。',True,'レプリケーション同期後に昇格する。'),
('Aurora は事前に必要なストレージ容量を指定してプロビジョニングする必要がある。',False,'自動拡張される。'),
('オンプレミスの Oracle から Aurora MySQL への移行には SCT と DMS を使う。',True,'異種移行の定番。')]),
dict(title='DynamoDB への移行と NoSQL 化',html='''<h4>DynamoDB に移すべきケース</h4>
<ul><li>キーによるアクセスが中心、<b class="key">個ミリ秒の低レイテンシ</b>、スケーラビリティが無制限に近い</li>
<li>サーバー管理不要、グローバルテーブルでマルチリージョンアクティブ</li>
<li>JOIN や複雑なトランザクション中心なら Aurora の方が適切(<span class="trap">RDB → DynamoDB は設計変更が必要</span>)</li></ul>
<h4>移行手段</h4>
<ul><li><b class="key">DMS</b>:RDB/MongoDB → DynamoDB。<b class="key">オブジェクトマッピング</b>で属性・キーを定義</li>
<li><b class="key">S3 からのインポート</b>(DynamoDB Import from S3:CSV/DynamoDB JSON/Ion)。<b class="key">テーブル書き込み容量を消費せず</b>新規テーブルへ</li>
<li>DynamoDB → S3 エクスポート(PITR 有効が前提)</li>
<li>MongoDB 互換が必要なら <b class="key">Amazon DocumentDB</b></li></ul>
<h4>設計判断</h4>
<table><tr><th>要件</th><th>選択</th></tr>
<tr><td>SQL・JOIN・既存 RDB アプリを維持</td><td>Aurora/RDS</td></tr>
<tr><td>サーバーレス・単純なキー検索・大規模</td><td>DynamoDB</td></tr>
<tr><td>MongoDB ワークロード</td><td>DocumentDB</td></tr>
<tr><td>Cassandra</td><td>Amazon Keyspaces</td></tr></table>''',
ox=[('DynamoDB の S3 インポートは新規テーブルを作成し、書き込みキャパシティを消費しない。',True,'インポート機能の特徴。'),
('RDB から DynamoDB への移行は、スキーマ変更なしで DMS により自動完結する。',False,'キー設計・オブジェクトマッピングなどデータモデル再設計が必要。'),
('MongoDB 互換のワークロードには Amazon DocumentDB が適している。',True,'MongoDB API 互換。')]),
])
