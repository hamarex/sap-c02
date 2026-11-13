from ch3_common import build
pages = [
('ネットワーク接続のトラブルシューティング', '''
<h4>「つながらない」の切り分け順序</h4>
<ol>
<li>{k|ルートテーブル}（宛先へのルート、IGW/NAT/TGW/ピアリング）</li>
<li>{k|セキュリティグループ}（ステートフル：戻りは自動許可）</li>
<li>{k|NACL}（ステートレス：{k|エフェメラルポート 1024-65535}の戻り許可が必要）</li>
<li>OS内FW、アプリのリッスン、DNS（Route 53 Resolver、プライベートホストゾーン、VPC DNS属性）</li>
</ol>
<ul>
<li>{k|VPC Reachability Analyzer}：送信元/宛先を指定し、{k|パケットを送らずに}構成を解析して到達可否とブロック箇所を示す</li>
<li>{k|VPC フローログ}：ACCEPT/REJECTを記録。{k|SG拒否とNACL拒否の切り分け}に（NACLは戻り通信もREJECTとして見える）。内容（ペイロード）は記録しない。{k|Traffic Mirroring}はパケット詳細</li>
<li>{k|Network Access Analyzer}：意図しない到達経路（例：インターネットからDBへ）を検出</li>
<li>{k|Transit Gateway}：ルートテーブルの関連付け/伝播、CIDR重複、{k|ピアリングは推移的でない}</li>
<li>{k|VPN/Direct Connect}：CloudWatchトンネル状態、BGP広告、MTU、冗長化</li>
<li>パブリックインスタンスがインターネットに出られない → パブリックIP/EIP、IGWへのルート。プライベートはNATのルートと、NATがパブリックサブネットにあるか</li>
</ul>
<p>{t|引っ掛け}：「SGでは許可しているのに通らない」→ NACLのDeny/エフェメラルポート。「一方向だけ通る」→ NACLのリターン許可漏れ。</p>
''', [
 ('VPC Reachability Analyzerは、実際にパケットを送信せずにネットワーク構成を解析し、到達性やブロック箇所を特定する。', True, '構成ベースの静的解析。'),
 ('NACLはステートフルなので、インバウンドを許可すれば戻りの通信用にエフェメラルポートのアウトバウンド許可は不要である。', False, 'NACLはステートレスなので、戻り通信の許可ルールが必要。'),
 ('VPCフローログはパケットのペイロード内容も記録する。', False, '記録されるのはメタデータ（IP、ポート、プロトコル、ACCEPT/REJECT等）のみ。'),
]),
('コンピュート・アプリのトラブルシューティング', '''
<h4>ロードバランサー</h4>
<ul>
<li>{k|502 Bad Gateway}：ターゲットが不正な応答/接続を突然切断（アプリのkeep-alive設定がLBのアイドルタイムアウトより短い等）</li>
<li>{k|503 Service Unavailable}：{k|正常なターゲットがない}、ターゲット未登録（ヘルスチェック失敗）</li>
<li>{k|504 Gateway Timeout}：ターゲットがアイドルタイムアウト内に応答しない（処理が遅い、SG/NACLで到達不可）</li>
<li>ヘルスチェック失敗：SGでLBからのヘルスチェックポートを許可、パス、応答コード（matcher）、起動猶予（ASGのヘルスチェック猶予期間）</li>
<li>クライアントIPを保持したい：X-Forwarded-For（ALB）、NLBはクライアントIP保持（ターゲットタイプによる）</li>
</ul>
<h4>EC2 / ECS / Lambda</h4>
<ul>
<li>{k|EC2ステータスチェック}：システム（ホスト側 → 復旧/停止起動）とインスタンス（OS側 → 再起動/修正）の2種類</li>
<li>起動失敗「Client.InternalError」：KMSキー権限不足でEBS暗号化AMIが起動できない等。「InsufficientInstanceCapacity」：AZ/タイプを変える・容量予約</li>
<li>{k|ECSタスクが起動しない/停止}：停止理由（stoppedReason）、タスク実行ロール（ECRプル・ログ出力）、メモリ不足（OOM）、ENI/サブネットIP枯渇、イメージ取得に必要なNAT/VPCエンドポイント</li>
<li>{k|Lambda}：Throttles（同時実行上限、予約同時実行）、Timeout（最大15分）、{k|VPC内Lambdaがインターネットに出られない}（NAT必要）、非同期呼び出し失敗は{k|DLQ / 失敗時の宛先}、ストリームでは{k|バッチ失敗でシャードが詰まる}→ 再試行上限/bisect/宛先設定</li>
<li>{k|CloudFormation失敗}：イベントタブで最初のFAILEDを確認。依存関係、IAM権限、上限（クォータ）、名前の重複</li>
</ul>
''', [
 ('ALBが503を返す一般的な原因は、登録された正常なターゲットが存在しないことである。', True, 'ターゲット不在/全て異常。'),
 ('ALBが504を返すのは、ターゲットがアイドルタイムアウト内に応答を返さない場合である。', True, 'アプリの処理遅延や到達不可が原因になる。'),
 ('VPC内に配置したLambda関数は、IGWへのルートのあるパブリックサブネットに置けば、パブリックIPなしでもインターネットに出られる。', False, 'Lambda ENIにはパブリックIPが付かない。プライベートサブネット + NATゲートウェイが必要。'),
]),
('データ層・アクセス拒否のトラブルシューティング', '''
<h4>データベース</h4>
<ul>
<li>CPU高/遅い：{k|Performance Insights}で上位SQLと待機イベント → インデックス、クエリ改善、{k|リードレプリカ}、スケールアップ</li>
<li>接続数上限（Too many connections）：{k|RDS Proxy}、コネクション管理、max_connections（メモリに依存）</li>
<li>{k|レプリカラグ}：CloudWatch ReplicaLag（Aurora: AuroraReplicaLag）。書込み負荷、レプリカの性能不足、長いクエリ</li>
<li>ストレージ満杯：{k|ストレージ自動スケーリング}（RDS）。IOPS不足：gp3/io2へ変更、Provisioned IOPS</li>
<li>{k|DynamoDB}：ProvisionedThroughputExceeded/スロットリング → ホットキー、キャパシティ、オンデマンド化、DAX、リトライ+指数バックオフ（SDKは自動）。{k|GSIのスロットリング}は基底テーブルの書込みも制限</li>
</ul>
<h4>アクセス拒否（AccessDenied）</h4>
<ul>
<li>評価：{k|明示的Deny → SCP → 境界/セッション → 許可}。{k|クロスアカウント}は{t|両側}（Identityポリシー + リソースポリシー）で許可が必要</li>
<li>S3 403：バケットポリシー、ブロックパブリックアクセス、{k|KMSキーポリシー（SSE-KMSのオブジェクトはkms:Decryptも必要）}、オブジェクト所有権（ACL）、VPCエンドポイントポリシー</li>
<li>調査：{k|CloudTrailのerrorCode}、{k|IAM Policy Simulator}、Access Analyzer、{k|エンコードされた認可メッセージ}（sts:DecodeAuthorizationMessage）</li>
<li>{k|SQS}：可視性タイムアウトより処理が長いと二重処理 → 延長/ハートビート。{k|DLQ}の redrive で再処理。FIFOはグループIDで順序</li>
<li>{k|クォータ}：Service Quotas / Trusted Advisorのサービスクォータチェック。Auto Scalingが増えない原因がEC2上限のことも</li>
</ul>
''', [
 ('SSE-KMSで暗号化されたS3オブジェクトを別アカウントから読むには、S3のポリシーに加えてKMSキーの使用許可（kms:Decrypt等）も必要である。', True, 'S3とKMSの両方の許可が必要。'),
 ('DynamoDBのスロットリングは、パーティション内で特定のキーに偶発的に負荷が集中しても、テーブル全体のキャパシティが十分であれば発生しない。', False, 'ホットパーティション/ホットキーでは、全体に余裕があっても個別にスロットリングされうる。'),
 ('CloudTrailのイベントのerrorCode（AccessDeniedなど）を確認することで、拒否されたAPI呼び出しの調査ができる。', True, '誰がどの操作で拒否されたかを追跡できる。'),
]),
]
LESSON, OX = build('3-8', 'トラブルシューティング（ネットワーク・アプリ・データ・権限）', pages)
