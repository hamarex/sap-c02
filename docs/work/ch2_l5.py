L = dict(id='2-5', title='サーバーレスとイベント駆動アーキテクチャ', pages=[
('Lambdaの設計ポイントとAPI Gateway', '''<h4>Lambda</h4><ul><li>最大実行時間<b class="key">15分</b>、メモリ128MB〜10,240MB(CPUはメモリに比例)、一時ストレージ最大10GB(/tmp)、ペイロード同期6MB</li><li>同時実行数：アカウント既定1,000(リージョン)。<b class="key">予約済み同時実行</b>＝その関数の上限確保/保護、<b class="key">プロビジョニング済み同時実行</b>＝コールドスタート回避(課金あり)。SnapStart(Java等)で起動高速化</li><li>VPC内のリソースにアクセスするにはVPC設定。インターネットへはNAT Gatewayが必要</li><li>非同期呼び出し：自動リトライ2回、<b class="key">DLQ</b>/On-failure宛先。SQSトリガーはバッチ+部分的バッチ失敗報告。ストリーム(Kinesis/DynamoDB)はシャード単位の順序</li><li>15分超・大規模バッチ → Fargate/AWS Batch/Step Functions</li></ul>
<h4>API Gateway</h4><table><tr><th>種類</th><th>特徴</th></tr><tr><td>REST API</td><td>機能豊富：キャッシュ、使用量プラン/APIキー、リクエスト検証、WAF、リソースポリシー、カナリアリリース、Cognito/Lambdaオーソライザー</td></tr><tr><td>HTTP API</td><td>低コスト・低レイテンシ。JWTオーソライザー。機能は少ない</td></tr><tr><td>WebSocket API</td><td>双方向リアルタイム通信</td></tr></table>
<ul><li>統合タイムアウトは通常<b class="key">29秒</b>(既定)。長時間処理は非同期化(202+SQS/Step Functions)</li><li>スロットリング(既定10,000 rps/アカウント)。REST APIは<b class="key">使用量プランでクライアント別制限</b>。エッジ最適化/リージョン/プライベートのエンドポイント</li></ul>
<p><span class="trap">引っ掛け：Lambdaがリトライして重複処理が起きうる → 冪等性設計が必須。</span></p>''',
[('Lambdaの最大実行時間は15分である。',True,'それを超える処理はFargate、Batch、Step Functions等を検討する。'),
('プロビジョニング済み同時実行は、関数のコールドスタートを減らすために使う。',True,'事前に初期化済みの実行環境を確保する。'),
('API Gateway REST APIのキャッシュや使用量プランはHTTP APIでも同等に使える。',False,'これらはREST APIの機能。HTTP APIは低コストだが機能が限定される。')]),
('メッセージング：SQS・SNS・EventBridge・Kinesisの使い分け', '''<table><tr><th>サービス</th><th>モデル</th><th>ポイント</th></tr><tr><td>SQS標準</td><td>キュー(プル)</td><td>ほぼ無制限スループット、少なくとも1回、順序保証なし</td></tr><tr><td><b class="key">SQS FIFO</b></td><td>キュー</td><td>順序保証(メッセージグループ)・重複排除(5分)。高スループットモードあり</td></tr><tr><td>SNS</td><td>Pub/Sub(プッシュ)</td><td>ファンアウト。SQS/Lambda/HTTP/Email/SMS。<b class="key">フィルターポリシー</b>、FIFOトピック</td></tr><tr><td>EventBridge</td><td>イベントバス</td><td>ルールで<b class="key">コンテンツベースのルーティング</b>、SaaS/AWSイベント、スケジュール、<b class="key">アーカイブ&amp;リプレイ</b>、スキーマレジストリ、Pipes</td></tr><tr><td>Kinesis Data Streams</td><td>ストリーム</td><td>順序(シャード単位)・<b class="key">複数コンシューマの再読込</b>(保持24時間〜365日)</td></tr></table>
<ul><li>SQSの可視性タイムアウトはコンシューマ処理時間より長く。ロングポーリングでコスト削減。DLQ＋maxReceiveCount。メッセージ最大256KB(大きいものはS3へ)</li><li><b class="key">SNS+SQSのファンアウト</b>：1イベントを複数の独立処理へ。SQSの前にSNSを置く典型構成</li></ul>
<p><span class="trap">引っ掛け：「複数の消費者が同じデータを再読込したい／リプレイ」→Kinesis(またはEventBridgeアーカイブ)。SQSはメッセージが消費されると消える。「順序+重複排除」→SQS FIFO。</span></p>''',
[('SQSはコンシューマが処理して削除するとメッセージが消えるため、同じメッセージを複数の独立コンシューマが再読込する用途には向かない。',True,'再読込・複数コンシューマにはKinesis等を使う。'),
('SNSのFIFOトピックは順序保証と重複排除を提供する。',True,'SQS FIFOキューをサブスクライバーにできる。'),
('SQSの可視性タイムアウトは、コンシューマの処理時間より短く設定するのが望ましい。',False,'短いと処理中に再配信され重複処理が起きる。処理時間より長くする。')]),
('Step Functionsと典型パターン', '''<h4>Step Functions</h4><ul><li>サーバーレスのワークフロー(ステートマシン)。分岐・並列・Map・待機・リトライ/Catchによるエラー処理・<b class="key">人手承認(コールバック)</b></li><li>Standard：<b class="key">最長1年</b>、正確に1回実行、実行履歴。<b class="key">Express</b>：最長5分、高スループット・大量、少なくとも1回(非同期)/同期もあり、低コスト</li><li>Lambda、ECS、SDK統合(200以上のサービス)を直接呼び出し。「Lambdaで待機・ポーリング」を避けられる</li><li><b class="key">Sagaパターン</b>：補償トランザクションで分散処理の失敗をロールバック</li></ul>
<h4>典型パターン</h4><ul><li>S3 → EventBridge/SQS → Lambda：ファイルアップロード処理</li><li>API Gateway → SQS：スパイクのバッファ、非同期受付</li><li><b class="key">DynamoDB Streams → Lambda</b>：変更データキャプチャ(24時間保持)</li><li>クロスアカウントイベント：EventBridgeで別アカウントのバスへ転送(リソースポリシー)</li></ul>
<p><span class="trap">引っ掛け：Lambda関数から別のLambdaを同期的に直列呼び出し(チェイン)するのはアンチパターン(待機課金・失敗管理が複雑)。ステートマシンで調整する。</span></p>''',
[('Step Functions Standardワークフローは最長1年間実行できる。',True,'Expressは最長5分。長時間・人手承認を含むならStandard。'),
('複雑な多段処理を、Lambda関数から別のLambdaを同期的に呼び出して連鎖させるのが推奨設計である。',False,'待機分の課金やエラー処理が複雑になる。Step Functionsでオーケストレーションする。'),
('EventBridgeはイベントのアーカイブとリプレイをサポートする。',True,'過去イベントを再送して再処理やテストに使える。')]),
])
