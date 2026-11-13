from ch3_common import build
pages = [
('Well-Architected Framework の6本柱とレビュー', '''
<table>
<tr><th>柱</th><th>キーワード</th></tr>
<tr><td>{k|運用上の優秀性}</td><td>IaC、小さく頻繁な可逆変更、運用手順の自動化、障害から学ぶ</td></tr>
<tr><td>{k|セキュリティ}</td><td>強いID基盤、最小権限、トレーサビリティ、全層防御、データ保護、自動化</td></tr>
<tr><td>{k|信頼性}</td><td>障害からの自動復旧、水平スケール、容量推測の停止、変更管理の自動化</td></tr>
<tr><td>{k|パフォーマンス効率}</td><td>先進技術の民主化（マネージド利用）、グローバル展開、サーバーレス、実験</td></tr>
<tr><td>{k|コスト最適化}</td><td>使った分だけ支払う、全体効率の測定、無差別な重労働への支出を止める、使用状況の分析</td></tr>
<tr><td>{k|持続可能性}</td><td>影響の把握、利用率の最大化、効率的なハードウェア（Graviton等）・マネージドサービス利用</td></tr>
</table>
<h4>レビューの道具</h4>
<ul>
<li>{k|AWS Well-Architected Tool}：質問に回答してワークロードを評価し、{k|HRI（高リスク項目）}と改善計画を出力。{k|レンズ}（SaaS、サーバーレス、金融サービス等）で観点を追加。マイルストーンで改善を記録</li>
<li>{k|Trusted Advisor}：コスト最適化・パフォーマンス・セキュリティ・耐障害性・サービス制限・運用上の優秀性のチェック。全チェックの利用には{k|Business / Enterprise系サポート}が必要</li>
<li>{k|AWS Health}：自アカウントに影響するイベント。{k|Compute Optimizer}：適正サイズ推奨</li>
</ul>
<p>{t|引っ掛け}：Well-Architected Toolは{k|診断・助言のツール}であり、リソースを自動修正しない。トレードオフ（例：コスト vs 信頼性）は要件の優先度で決める。</p>
''', [
 ('Well-Architected Frameworkの柱は、運用上の優秀性、セキュリティ、信頼性、パフォーマンス効率、コスト最適化、持続可能性の6つである。', True, '持続可能性は後から追加された6番目の柱。'),
 ('Well-Architected Toolは、評価で見つかった高リスク項目を自動的に修正する。', False, 'ツールは質問ベースの評価と改善計画の提示を行うのみで、自動修正はしない。'),
 ('Trusted Advisorの全チェックを利用するには、BusinessまたはEnterprise系のサポートプランが必要である。', True, 'Basic/Developerでは一部のコアチェックに限られる。'),
]),
('信頼性の改善：Multi-AZ・DR・疎結合', '''
<h4>DR戦略（RTO/RPOとコストのトレードオフ）</h4>
<table>
<tr><th>戦略</th><th>RTO/RPO</th><th>内容</th></tr>
<tr><td>{k|バックアップ & リストア}</td><td>時間〜日</td><td>最安。別リージョンへバックアップコピー（AWS Backup）</td></tr>
<tr><td>{k|パイロットライト}</td><td>数十分〜</td><td>DBレプリカ等のコアのみ常時稼働。障害時に残りを起動</td></tr>
<tr><td>{k|ウォームスタンバイ}</td><td>分</td><td>縮小版のフル環境が常時稼働。拡張して切替</td></tr>
<tr><td>{k|マルチサイト Active/Active}</td><td>ほぼ0</td><td>全リージョンで本番稼働。最高コスト</td></tr>
</table>
<ul>
<li>{k|Aurora Global Database}：リージョン間レプリケーション遅延は通常1秒未満。計画外フェイルオーバーでRPO秒単位、RTOは分単位。{k|DynamoDBグローバルテーブル}はマルチリージョンActive/Active</li>
<li>{k|Route 53ヘルスチェック + フェイルオーバー/レイテンシールーティング}、{k|Global Accelerator}（DNSキャッシュに依存せず高速切替）</li>
<li>{k|AWS Elastic Disaster Recovery}：オンプレ/他環境のサーバーを継続レプリケーションし、低コストでDR</li>
<li>{k|RDS Multi-AZ}（同期レプリケーションで可用性）と{k|リードレプリカ}（非同期で読取スケール）は目的が違う。{t|Multi-AZ（標準）のスタンバイは読み取りに使えない}</li>
</ul>
<h4>疎結合・耐障害設計</h4>
<ul>
<li>{k|SQS / SNS / EventBridge}で非同期化、{k|DLQ}で失敗隔離、{k|指数バックオフ + ジッター}でリトライ集中を回避</li>
<li>{k|ヘルスチェック + Auto Scaling}、{k|AWS Fault Injection Service}でカオス実験し弱点を検証</li>
<li>{k|サービスクォータ}の事前確認（DR先でも上限緩和を）</li>
</ul>
''', [
 ('RDS Multi-AZ配置（標準のインスタンス構成）のスタンバイインスタンスは、読み取りトラフィックの負荷分散に利用できる。', False, '標準のMulti-AZのスタンバイは読み取り不可。読み取りスケールにはリードレプリカ（またはMulti-AZ DBクラスター構成の読み取り可能スタンバイ）を使う。'),
 ('パイロットライト方式は、縮小版のフル環境を常時稼働させておく方式であり、ウォームスタンバイよりコストが高い。', False, 'パイロットライトはコアのみ稼働で、ウォームスタンバイより低コスト。縮小版のフル環境稼働はウォームスタンバイ。'),
 ('Global Acceleratorは、DNSキャッシュに依存せずエンドポイントのヘルスに基づいてトラフィックを素早く切り替えられる。', True, 'エニーキャストIPを使うためDNSのTTLに左右されない。'),
]),
('パフォーマンス改善：ボトルネック特定とキャッシュ・レプリカ', '''
<h4>1. まず測る</h4>
<ul>
<li>{k|CloudWatch}（CPU/ネットワーク/IOPS）、{k|X-Ray}（サービス間レイテンシ）、{k|RDS/Aurora Performance Insights}（DB負荷＝DBロード、待機イベント、重いSQL）、{k|DevOps Guru}（異常検知と推奨）、{k|Compute Optimizer}（サイズ・種類の推奨）</li>
</ul>
<h4>2. 層ごとの改善</h4>
<table>
<tr><th>症状</th><th>対策</th></tr>
<tr><td>静的/動的コンテンツの遠距離レイテンシ</td><td>{k|CloudFront}（キャッシュ、オリジンシールド）、グローバルなら Global Accelerator</td></tr>
<tr><td>DB読取過多</td><td>{k|リードレプリカ}（Auroraは最大15、レプリカAuto Scalingも可。RDS MySQL/MariaDB/PostgreSQLも最大15）、{k|ElastiCache}（Redis/Valkey, Memcached）</td></tr>
<tr><td>DynamoDB読取のマイクロ秒化</td><td>{k|DAX}（アプリのコード変更はクライアント差し替え程度）</td></tr>
<tr><td>API Gatewayの繰り返し呼び出し</td><td>ステージの{k|キャッシュ}有効化</td></tr>
<tr><td>Lambda→RDSの接続枯渇</td><td>{k|RDS Proxy}（接続プーリング、フェイルオーバー時間も短縮）</td></tr>
<tr><td>DB書込みが限界</td><td>スケールアップ、Aurora、シャーディング、非同期化（SQS）、DynamoDB</td></tr>
</table>
<ul>
<li>{k|キャッシュ戦略}：Lazy loading（キャッシュミス時に格納、古くなりうる）/ Write-through（書込み時に更新、常に新しいが無駄なキャッシュも）。Redisは永続化・レプリケーション・フェイルオーバー・多様なデータ型、Memcachedはシンプル・マルチスレッド</li>
<li>{t|引っ掛け}：リードレプリカは{k|読み取り}のみ改善。書き込み性能・可用性（自動フェイルオーバー）の解決にはならない（Auroraは例外的にレプリカへフェイルオーバー可能）</li>
</ul>
''', [
 ('RDS Performance Insightsは、データベース負荷の原因となっているSQLや待機イベントを特定するのに役立つ。', True, 'DBロードを待機イベント/SQL/ホスト別に分析できる。'),
 ('リードレプリカを追加すれば、データベースの書き込みスループットも向上する。', False, 'レプリカは読み取り専用でスケールする。書き込みはプライマリに集中する。'),
 ('Lambdaから大量にRDSへ接続して接続数が枯渇する問題には、RDS Proxyによる接続プーリングが有効である。', True, '接続を多重化して再利用する。'),
]),
('ストレージ・ネットワーク・スケーリングの最適化', '''
<h4>ストレージ</h4>
<ul>
<li>{k|EBS}：{k|gp3}は容量と独立にIOPS（基準3,000、最大16,000）・スループットを指定でき、gp2より安価。高IOPS・低レイテンシのDB向けは{k|io2 / io2 Block Express}（Multi-Attach対応）。スループット重視は st1、コールドは sc1</li>
<li>{k|インスタンスストア}：最高速だが一時的（停止・終了で消える）。キャッシュ・バッファ用途</li>
<li>{k|S3}：プレフィックスあたり {k|3,500 PUT/5,500 GET 毎秒}。並列化・プレフィックス分散で拡張。大容量は{k|マルチパートアップロード}、遠隔は{k|Transfer Acceleration}、範囲指定GETでの並列取得</li>
<li>{k|EFS}：汎用/最大I/O、スループットモード（Elastic推奨）。HPC/ML共有は{k|FSx for Lustre}（S3連携）</li>
</ul>
<h4>スケーリング</h4>
<ul>
<li>ASG：{k|ターゲット追跡}（既定の第一選択。例：CPU 50%）/ ステップ / スケジュール（予測可能な波）/ {k|予測スケーリング}（周期的負荷を事前に増強）/ {k|ウォームプール}（起動の遅いアプリの事前初期化）</li>
<li>キュー処理：SQSの「{k|インスタンスあたりのメッセージ数}」カスタムメトリクスで追跡</li>
<li>Lambda：{k|プロビジョニング済み同時実行}でコールドスタート抑制、予約同時実行で上限/確保。{k|SnapStart}（Java等）</li>
<li>DynamoDB：オンデマンド（予測不能）/ プロビジョニング + Auto Scaling。{t|ホットパーティション}はキー設計で解消（書込みシャーディング）</li>
<li>{k|EC2配置グループ}：クラスター（低レイテンシ・高帯域）/ パーティション / スプレッド（障害分離）</li>
</ul>
''', [
 ('EBSのgp3ボリュームは、容量とは独立にIOPSとスループットを指定できる。', True, 'gp2はIOPSが容量に比例するが、gp3は独立設定でき単価も安い。'),
 ('DynamoDBのホットパーティション問題は、プロビジョニング済みキャパシティを増やすだけで常に解決する。', False, '特定キーへのアクセス集中が原因なので、キー設計（分散）で解決する必要がある。'),
 ('Auto Scalingの予測スケーリングは、周期的な負荷パターンに対して事前にキャパシティを増強できる。', True, '過去の負荷から予測して先行スケールする。'),
]),
]
LESSON, OX = build('3-5', 'Well-Architectedレビュー・信頼性・パフォーマンス改善', pages)
