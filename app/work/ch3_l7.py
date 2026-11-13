from ch3_common import build
pages = [
('購入オプション：RI・Savings Plans・Spot', '''
<table>
<tr><th>オプション</th><th>特徴・判断</th></tr>
<tr><td>{k|オンデマンド}</td><td>前払い・コミットなし。短期・予測不能・初期検証</td></tr>
<tr><td>{k|Compute Savings Plans}</td><td>最大約66%割引。1〜3年の{k|時間あたり金額}コミット。{k|EC2（ファミリー/サイズ/リージョン/OS/テナンシー不問）、Fargate、Lambda}に適用。柔軟性が最高</td></tr>
<tr><td>{k|EC2 Instance Savings Plans}</td><td>特定リージョン・インスタンスファミリーに限定。割引率は高め（最大約72%）</td></tr>
<tr><td>{k|Standard RI}</td><td>最大約72%。ファミリー等固定。{k|Convertible RI}は交換可能（割引率は低め、最大約66%）。RI Marketplaceで売却できるのはStandardのみ</td></tr>
<tr><td>{k|Spot}</td><td>最大90%割引。{k|2分前通知}で中断されうる。バッチ、CI、ビッグデータ、ステートレスWeb。Spot Fleet/EC2 Fleet/ASG混合インスタンスポリシーで多様化、{k|price-capacity-optimized}配分戦略</td></tr>
<tr><td>{k|Dedicated Hosts}</td><td>ソケット/コア単位ライセンスのBYOL、コンプライアンス</td></tr>
</table>
<ul>
<li>{k|ゾーン指定RI}はキャパシティ予約を伴う。リージョンRIは予約なし（AZ柔軟・サイズ柔軟性あり）。キャパシティが必要なら{k|オンデマンドキャパシティ予約}を併用</li>
<li>RIはRDS、ElastiCache、OpenSearch、Redshiftにもある。SPはSageMakerにも</li>
<li>{k|基本はベースラインにSP/RI、ピークはオンデマンド/Spot}の組み合わせ</li>
<li>{t|引っ掛け}：「将来インスタンスファミリーやリージョンを変える/Fargate・Lambdaも使う」→ Compute Savings Plans。「コミットできない・中断可・耐障害」→ Spot。{k|RIのほうがSPより安い}とは限らず、同等割引ならSPの柔軟性が勝つ</li>
</ul>
''', [
 ('Compute Savings Plansは、EC2だけでなくFargateとLambdaの使用量にも適用される。', True, 'インスタンスファミリー・リージョン不問で、Fargate/Lambdaにも適用。'),
 ('Spotインスタンスは中断されることがないため、状態を持つ単一インスタンスのDBにも適している。', False, 'Spotは2分前通知で中断されうる。ステートレス・耐障害なワークロード向け。'),
 ('Convertible RIは別のインスタンスファミリーのRIに交換できる。', True, '割引率はStandardより低いが柔軟性がある。'),
]),
('コストの可視化・ガバナンス', '''
<table>
<tr><th>ツール</th><th>用途</th></tr>
<tr><td>{k|Cost Explorer}</td><td>過去のコスト分析、{k|予測（最大12か月）}、RI/SPの{k|購入推奨}・カバレッジ/使用率レポート</td></tr>
<tr><td>{k|AWS Budgets}</td><td>予算超過の通知（実績/予測）。{k|予算アクション}でIAM/SCP適用やインスタンス停止を自動実行。RI/SPカバレッジ予算も</td></tr>
<tr><td>{k|Cost and Usage Report（CUR）}</td><td>最も詳細な請求データをS3へ → Athena/QuickSight。{k|Data Exports}</td></tr>
<tr><td>{k|Cost Anomaly Detection}</td><td>ML による{k|異常なコスト急増}の検知と通知</td></tr>
<tr><td>{k|コスト配分タグ}</td><td>ユーザー定義タグを{k|有効化（アクティブ化）して初めて}請求に反映。{t|有効化前の期間には遡及しない}。タグ付けの強制はタグポリシー/SCP/Configルール</td></tr>
<tr><td>{k|Compute Optimizer}</td><td>EC2/ASG/EBS/Lambda/ECS on Fargate等の{k|適正サイズ推奨}（CloudWatchメトリクスに基づく。メモリを見るにはCloudWatch Agent）</td></tr>
<tr><td>{k|Trusted Advisor}</td><td>低使用率EC2、アイドルELB、未使用EBS/EIP等のコスト最適化チェック</td></tr>
<tr><td>{k|Organizations 一括請求}</td><td>ボリューム割引、{k|RI/SPの割引共有}をアカウント間で</td></tr>
</table>
<ul>
<li>{k|Cost Categories}でコストをチーム/環境に分類、{k|Billing and Cost Management}ホーム</li>
<li>FinOps的に、アカウント構造やタグでショーバック/チャージバックを実現</li>
</ul>
''', [
 ('ユーザー定義のコスト配分タグは、有効化した時点以降のコストにのみ反映され、過去分には遡及しない。', True, '有効化してから反映される。'),
 ('AWS Budgetsは通知のみ可能で、予算超過時に自動でリソースへ制限を適用することはできない。', False, '予算アクションにより、IAMポリシー/SCPの適用やEC2/RDSの停止を自動実行できる。'),
 ('Compute Optimizerは、メトリクスに基づいてEC2インスタンスの適正サイズを推奨する。', True, 'メモリ使用率を考慮するにはCloudWatch Agentが必要。'),
]),
('ストレージとデータ転送のコスト最適化', '''
<h4>S3ストレージクラス</h4>
<table>
<tr><th>クラス</th><th>ポイント</th></tr>
<tr><td>Standard</td><td>頻繁アクセス</td></tr>
<tr><td>{k|Intelligent-Tiering}</td><td>{k|アクセスパターン不明・変動}。自動で階層移動、取り出し料金なし、小額の監視料金（128KB未満は対象外）</td></tr>
<tr><td>Standard-IA / One Zone-IA</td><td>低頻度。{k|最低30日}課金、取り出し料金あり。OneZoneは単一AZなので再作成可能なデータ</td></tr>
<tr><td>{k|Glacier Instant Retrieval}</td><td>四半期に1回程度、ミリ秒取り出し。最低90日</td></tr>
<tr><td>Glacier Flexible Retrieval</td><td>分〜時間で取り出し。最低90日</td></tr>
<tr><td>{k|Glacier Deep Archive}</td><td>最安、12〜48時間。最低{k|180日}</td></tr>
</table>
<ul>
<li>{k|ライフサイクルルール}で遷移/期限削除、{t|不完全なマルチパートアップロードの削除}・古いバージョンの失効も設定してコスト削減</li>
<li>{k|S3 Storage Lens}で組織全体の利用状況・コスト効率を分析。{k|Storage Class Analysis}はStandard→Standard-IAの判断材料</li>
<li>EBS：{k|gp2→gp3}、未接続ボリューム/古いスナップショット削除（{k|EBS Snapshots Archive}）、Data Lifecycle Managerで自動管理。EFS：{k|IA / Archive}ライフサイクル</li>
</ul>
<h4>データ転送</h4>
<ul>
<li>{k|VPCゲートウェイエンドポイント（S3/DynamoDB）}は無料。NATゲートウェイのデータ処理料金を回避</li>
<li>{k|NATゲートウェイ}はAZごと・時間料金＋処理料金。AZ間通信にも料金。可能な限りAZ内に閉じる</li>
<li>{k|CloudFront}経由のオリジン転送は直接インターネット送信より安価な場合が多く、キャッシュでオリジン負荷も削減</li>
<li>大量データの初期移行は{k|Snowファミリー}/DataSync/Direct Connect（回線の継続転送が多いならDXが安い）</li>
</ul>
''', [
 ('アクセスパターンが予測できないS3データには、Intelligent-Tieringが適している。', True, '自動で階層を移動し、取り出し料金がかからない。'),
 ('S3 Standard-IAは、取り出し料金がなく、最低保存期間もない。', False, '取り出し料金があり、最低30日の課金がある。'),
 ('S3およびDynamoDBへのゲートウェイVPCエンドポイントを使うと、NATゲートウェイ経由のデータ処理料金を削減できる。', True, 'ゲートウェイエンドポイントは追加料金なし。'),
]),
('コンピュート・DB・開発環境の最適化', '''
<ul>
<li>{k|ライトサイジング}：Compute Optimizer推奨を基に、過剰なインスタンスを縮小。{k|Graviton（Arm）}で価格性能比向上（互換性確認要。Lambda、RDS、ElastiCache等も対応）</li>
<li>{k|Lambda}：メモリ=CPU比例。{k|AWS Lambda Power Tuning}で最適メモリを探索。常時高負荷ならコンテナ/EC2のほうが安い場合も</li>
<li>{k|Fargate Spot}（中断許容）、ECS/EKSは{k|Karpenter}/Cluster Autoscalerでノード統合</li>
<li>{k|Aurora Serverless v2}：変動負荷のDBを細かくスケール。{k|DynamoDBオンデマンド}（予測不能）と{k|プロビジョニング+Auto Scaling+Reserved capacity}（安定）の選択</li>
<li>{k|Redshift}：RA3（コンピュートとストレージの分離）、Serverless、一時停止（pause）、Spectrumでコールドデータ</li>
<li>{k|開発/検証環境の夜間停止}：{k|Instance Scheduler on AWS}やEventBridge Scheduler + SSM Automation。本番相当を24時間稼働させない</li>
<li>{k|Savings Plans/RI}は{t|停止してもコミット分は課金}されるので、安定したベースラインにのみ購入</li>
<li>データ：古いログ/バックアップの保持期間短縮、CloudWatch Logsの保持設定、Glueジョブ、{k|不要なNAT/ELB/EIP}（未使用のElastic IPは課金対象）の削除</li>
</ul>
<h4>試験での判断</h4>
<ul>
<li>「運用変更を最小・割引を確実」→ Savings Plans / RI</li>
<li>「中断可・最大削減」→ Spot</li>
<li>「予測不能なアクセス」→ Intelligent-Tiering / オンデマンド系</li>
<li>「コスト最小」だけで信頼性要件（可用性）を壊す選択肢は誤り</li>
</ul>
''', [
 ('Savings PlansやRIは、対象インスタンスを停止している時間はコミット分の課金が発生しない。', False, 'コミットは使用の有無に関わらず課金される。'),
 ('開発環境を夜間・週末に自動停止する運用は、コスト削減に有効である。', True, 'Instance SchedulerやEventBridge Schedulerで実現できる。'),
]),
]
LESSON, OX = build('3-7', 'コスト最適化（Savings Plans / Spot / S3 / Cost Explorer）', pages)
