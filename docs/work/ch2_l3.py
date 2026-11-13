L = dict(id='2-3', title='ELB・CloudFront・Global Accelerator・Route 53', pages=[
('ELBの種類と使い分け', '''<table><tr><th>種類</th><th>層</th><th>特徴</th></tr><tr><td><b class="key">ALB</b></td><td>L7</td><td>パス/ホスト/ヘッダー/クエリのルーティング、Lambda・IPターゲット、Cognito/OIDC認証、AWS WAF連携、gRPC、ECSの動的ポート</td></tr><tr><td><b class="key">NLB</b></td><td>L4</td><td>超低レイテンシ・高スループット、<b class="key">AZごとに固定(Elastic)IP</b>可、送信元IP保持、TCP/UDP/TLS、<b class="key">PrivateLink(エンドポイントサービス)の前段</b>。現在はセキュリティグループもサポート</td></tr><tr><td><b class="key">GWLB</b></td><td>L3</td><td>サードパーティ仮想アプライアンス(FW/IDS)を透過的に挿入。GENEVE(6081)</td></tr><tr><td>CLB</td><td>-</td><td>旧世代。新規設計では選ばない</td></tr></table>
<ul><li>クロスゾーン負荷分散：ALBは常に有効(無料)、NLBは既定で無効(有効時はAZ間データ転送料)</li><li>スティッキーセッション・接続ドレイニング(登録解除の遅延)・低速開始(slow start)</li><li>ALBは固定IPを持たない → 固定IPが必要ならNLB、またはALBの前にGlobal Accelerator、あるいはNLB→ALBターゲット構成</li></ul>
<p><span class="trap">引っ掛け：「パスベースルーティング」→ALB。「固定IP/静的IPをクライアントがホワイトリスト」→NLBかGlobal Accelerator。「FWアプライアンスを透過的に挿入」→GWLB。</span></p>''',
[('ALBはAZごとに固定のElastic IPを割り当てられる。',False,'固定IPを割り当てられるのはNLB。ALBはIPが変動する。'),
('Gateway Load Balancerはサードパーティ製の仮想アプライアンスを透過的に挿入する用途に使う。',True,'GENEVEカプセル化でトラフィックをアプライアンス群へ分散する。'),
('パスベースのルーティングが必要な場合はNLBを選ぶ。',False,'L7のパス/ホストベースのルーティングはALBの機能。')]),
('CloudFrontとGlobal Accelerator', '''<h4>CloudFront(CDN)</h4><ul><li>エッジでキャッシュ。S3・ALB・API Gateway・任意のオリジン。静的/動的コンテンツの配信高速化、DDoS/WAFの前段としても有効</li><li><b class="key">OAC(Origin Access Control)</b>でS3オリジンへのアクセスをCloudFront経由のみに制限(旧OAIの後継、SSE-KMS対応)</li><li><b class="key">署名付きURL/署名付きCookie</b>：有料コンテンツ等の限定配信。署名付きURLは単一ファイル、Cookieは複数ファイル/URL変更不可の場合</li><li><b class="key">オリジンフェイルオーバー</b>(オリジングループ)：プライマリが5xx等のとき自動でセカンダリへ</li><li>Lambda@Edge / CloudFront Functions：軽量(ヘッダー書換等)はFunctions、複雑処理・ネットワーク/ボディ参照はLambda@Edge</li><li>フィールドレベル暗号化、地理的制限、HTTPSの強制</li></ul>
<h4>Global Accelerator</h4><ul><li>AWSグローバルネットワークへ最寄りエッジから入り、<b class="key">2つの固定Anycast IP</b>でエンドポイント(ALB/NLB/EC2/EIP)へ</li><li><b class="key">キャッシュはしない</b>。TCP/UDP、ゲーム・IoT・VoIP、HTTPでも固定IPや高速フェイルオーバーが必要な場合</li><li>トラフィックダイヤル・エンドポイント重みでブルー/グリーンやリージョン間の段階移行</li></ul>
<table><tr><th>要件</th><th>選択</th></tr><tr><td>静的コンテンツのキャッシュ、グローバル配信</td><td>CloudFront</td></tr><tr><td>非HTTP(UDP等)、固定IP、速いリージョンフェイルオーバー</td><td>Global Accelerator</td></tr></table>''',
[('CloudFrontのOACは、S3バケットへのアクセスをCloudFront経由のみに制限する用途に使う。',True,'バケットポリシーでCloudFrontサービスプリンシパル+ディストリビューションARNを許可する。'),
('Global Acceleratorはエッジでコンテンツをキャッシュして配信を高速化する。',False,'キャッシュは行わない。ネットワーク経路の最適化と固定IPが特徴。'),
('UDPベースのゲームトラフィックをグローバルに高速化したい場合、Global Acceleratorが適する。',True,'GAはTCP/UDPに対応。CloudFrontはHTTP/HTTPS(WebSocket含む)中心。')]),
('Route 53のルーティングポリシーとハイブリッド/マルチリージョン', '''<table><tr><th>ポリシー</th><th>用途</th></tr><tr><td>シンプル</td><td>1つの宛先</td></tr><tr><td>加重</td><td>割合で分散、カナリア/段階移行</td></tr><tr><td><b class="key">レイテンシー</b></td><td>ユーザーに最もレイテンシの低いリージョンへ</td></tr><tr><td><b class="key">フェイルオーバー</b></td><td>ヘルスチェックでActive-Passive</td></tr><tr><td><b class="key">地理的位置情報</b></td><td>ユーザーの国・大陸で決定(コンプライアンス・言語)</td></tr><tr><td>地理的近接性</td><td>位置情報+バイアスで調整(Traffic Flowが必要)</td></tr><tr><td>複数値回答</td><td>ヘルスチェック付き最大8レコードを返す(ELBの代替ではない)</td></tr></table>
<ul><li><b class="key">エイリアスレコード</b>：ゾーンAPEX(example.com)に使え、ALB/CloudFront/S3等を指す。<b class="key">CNAMEはAPEXに作成不可</b>。エイリアスへのクエリは無料</li><li>ヘルスチェックはエンドポイント/他のヘルスチェック(計算)/CloudWatchアラームを監視可能(プライベートリソースはCloudWatchアラーム経由)</li><li><b class="key">Route 53 Resolver</b>：ハイブリッドDNS。インバウンドEP(オンプレ→AWS)・アウトバウンドEP(AWS→オンプレ)+ルール</li><li>プライベートホストゾーン：VPC関連付け。複数VPC/アカウントで共有可</li></ul>
<p><span class="trap">引っ掛け：「レイテンシー」と「地理的位置情報」は混同しやすい。法規制で国別に振り分けるなら地理的位置情報、最速を狙うならレイテンシー。</span></p>''',
[('example.com(ゾーンAPEX)にCNAMEレコードを作成してALBを指すことができる。',False,'APEXにはCNAMEを作れない。AエイリアスレコードでALBを指す。'),
('ユーザーの国ごとにコンテンツを制限して振り分ける要件には地理的位置情報ルーティングを使う。',True,'ユーザーの所在地に基づく。レイテンシーは速度基準。'),
('Route 53のヘルスチェックはCloudWatchアラームの状態を監視対象にできる。',True,'プライベートVPC内のリソースの監視などで使える。')]),
])
