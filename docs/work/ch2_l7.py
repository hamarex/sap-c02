L = dict(id='2-7', title='データベース設計の使い分け', pages=[
('RDS・Aurora・DynamoDBの選択基準', '''<table><tr><th>要件</th><th>選択</th></tr><tr><td>既存RDB(Oracle/SQL Server等)のライセンス・機能を維持</td><td>RDS(<b class="key">RDS Custom</b>はOS/DBカスタマイズ要件)</td></tr><tr><td>MySQL/PostgreSQL互換、高性能・高可用性、15リーダー、サーバーレス</td><td>Aurora</td></tr><tr><td>キー/バリュー、ミリ秒の一桁、無制限スケール、サーバーレス</td><td>DynamoDB</td></tr><tr><td>ドキュメント(MongoDB互換)</td><td>DocumentDB</td></tr><tr><td>グラフ</td><td>Neptune</td></tr><tr><td>時系列</td><td>Timestream</td></tr><tr><td>台帳(暗号学的に検証可能な履歴)</td><td>QLDB(提供終了方向。Auroraへの移行推奨)</td></tr><tr><td>ワイドカラム(Cassandra互換)</td><td>Keyspaces</td></tr></table>
<ul><li>Aurora：<b class="key">Aurora Serverless v2</b>(予測困難な負荷)、<b class="key">Aurora I/O-Optimized</b>(I/O課金が高い場合に定額)、Backtrack(MySQL互換、巻き戻し)、クローン(コピーオンライト、高速)、Aurora Machine Learning統合</li><li>RDSのストレージ自動スケーリング、パフォーマンスインサイト、暗号化は<b class="key">作成時のみ指定</b>(後から有効化はスナップショットコピー→暗号化→復元)</li><li><b class="key">Blue/Green Deployments</b>でバージョンアップ/スキーマ変更のダウンタイム最小化</li></ul>
<p><span class="trap">引っ掛け：暗号化されていない既存RDSを暗号化 → スナップショットを暗号化コピーして復元(その場で有効化は不可)。</span></p>''',
[('Oracleのライセンスや機能を維持したままマネージド運用したい場合、Auroraを選ぶのが適切である。',False,'AuroraはMySQL/PostgreSQL互換。Oracleの維持はRDS for Oracle(あるいはRDS Custom)。'),
('作成済みの非暗号化RDSインスタンスを暗号化するには、スナップショットを暗号化コピーして復元する。',True,'既存インスタンスのその場での暗号化は不可。'),
('Aurora Serverless v2は予測が難しい変動負荷に向く。',True,'ACU単位で細かく自動スケールする。')]),
('DynamoDB設計の要点', '''<ul><li><b class="key">パーティションキー設計</b>：高カーディナリティで均等分散。ホットパーティションを避ける(書き込みシャーディングなど)</li><li>容量モード：<b class="key">オンデマンド</b>(予測不能、スパイク)／プロビジョンド+Auto Scaling(予測可能。リザーブドキャパシティで割引)。Standard-IAテーブルクラスで保存コスト削減</li><li>セカンダリインデックス：<b class="key">LSI</b>(テーブル作成時のみ、同一パーティションキー、強い整合性可)／<b class="key">GSI</b>(後から追加可、別パーティションキー、結果整合性のみ)</li><li>一貫性：既定は結果整合性、強い整合性読み取りは指定可(GSIは不可、Global Tablesは別リージョンでは不可)</li><li><b class="key">DAX</b>：DynamoDB専用のインメモリキャッシュ(マイクロ秒、API互換)。読み取り集中の高速化。強い整合性読み取りはキャッシュされない</li><li>TTL：期限切れ項目の自動削除(書き込み容量を消費しない)</li><li>DynamoDB Streams：24時間の変更履歴 → Lambda。Kinesis Data Streams統合も可</li><li>バックアップ：<b class="key">PITR</b>(35日)、オンデマンドバックアップ、S3へのエクスポート</li><li>トランザクション(TransactWriteItems)、1項目最大400KB → 大きなデータはS3に置きポインタを保持</li></ul>
<p><span class="trap">引っ掛け：LSIは後から追加できない。GSIは強い整合性が選べない。複雑なアドホック結合クエリ・集計が主目的ならDynamoDBでなくRDB/Athena/Redshift。</span></p>''',
[('DynamoDBのLSIは、テーブル作成後にいつでも追加できる。',False,'LSIはテーブル作成時のみ定義可能。後から追加できるのはGSI。'),
('DAXは読み取り集中のDynamoDBワークロードにマイクロ秒レイテンシを提供する。',True,'DynamoDB API互換のインメモリキャッシュ。'),
('DynamoDBの1項目の最大サイズは400KBであり、それを超える大きなデータはS3に格納してポインタを保持する設計がよく使われる。',True,'標準的なパターン。')]),
('キャッシュ戦略とDB移行', '''<h4>ElastiCache の使い分け</h4><ul><li>Redis(Valkey)：データ構造(ソート済セット等)、永続化、レプリケーション、Multi-AZ、Pub/Sub、リーダーボード、セッション</li><li><b class="key">Memcached</b>：単純、マルチスレッド、シャーディングで水平分割、レプリケーション・永続化なし</li><li>戦略：<b class="key">Lazy loading</b>(キャッシュミス時にロード、古いデータの可能性)／<b class="key">Write-through</b>(書き込み時に更新、常に最新だが書き込み負荷・未使用データ増)／TTL併用</li></ul>
<h4>DB移行</h4><ul><li><b class="key">DMS</b>：移行+CDCで継続レプリケーション、ほぼダウンタイムなし。同種移行（Oracle→Oracle）は不要な変換なし、異種移行はスキーマ変換に<b class="key">AWS SCT</b>(またはDMS Schema Conversion)を併用</li><li>同種のMySQL/PostgreSQL → ネイティブツール(mysqldump、pg_dump、ネイティブレプリケーション)や、Auroraへのリードレプリカ作成→昇格も選択肢</li><li>DMSレプリケーションインスタンスは大規模時にMulti-AZ化、ソースDBの負荷に注意</li></ul>
<table><tr><th>要件</th><th>選択</th></tr><tr><td>Oracle → Aurora PostgreSQL</td><td>SCT+DMS(CDC)</td></tr><tr><td>オンプレMySQL → Aurora MySQL (停止最小)</td><td>DMS CDC、またはバイナリログレプリケーション</td></tr></table>''',
[('異なるエンジン間のDB移行(例：Oracle→Aurora PostgreSQL)では、スキーマ変換にAWS SCTを併用する。',True,'DMSはデータ移行・CDC、SCTはスキーマ・コードの変換。'),
('Memcachedはレプリケーションと永続化をサポートし、Multi-AZの自動フェイルオーバーが可能である。',False,'それはRedis(Valkey)の特徴。Memcachedはレプリケーション・永続化なし。'),
('Lazy loading戦略では、キャッシュのデータが古くなる可能性がある。',True,'TTLを併用して鮮度を管理する。')]),
])
