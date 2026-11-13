from ch3_common import build
pages = [
('CloudWatch：メトリクス・アラーム・ログ', '''
<h4>メトリクスとアラーム</h4>
<ul>
<li>{k|標準メトリクス}は無料で自動収集。EC2は既定で{k|5分間隔}、{k|詳細モニタリング}で{k|1分間隔}（有料）</li>
<li>EC2の{t|メモリ使用率・ディスク使用率・プロセス情報はOSの内側の値}なので標準では取れない → {k|CloudWatch Agent}で収集（カスタムメトリクス）</li>
<li>{k|高解像度メトリクス}は最短{k|1秒}。アラームも高解像度（10秒/30秒）が設定可能</li>
<li>アラーム状態は {k|OK / ALARM / INSUFFICIENT_DATA}。アクションは SNS、Auto Scaling、EC2アクション（停止・終了・再起動・{k|復旧}）、Systems Manager OpsItem など</li>
<li>{k|複合アラーム（Composite alarm）}：複数アラームをAND/ORで束ね、{k|アラーム疲れ（ノイズ）を減らす}</li>
<li>{k|異常検出（Anomaly Detection）}：機械学習で期待値バンドを作り、固定しきい値が難しい周期的な負荷に有効</li>
</ul>
<h4>CloudWatch Logs</h4>
<ul>
<li>ロググループの保持期間は{t|既定で無期限}（＝課金され続ける）→ 保持期間を設定してコスト削減</li>
<li>{k|メトリクスフィルター}：ログ中のパターンをメトリクス化 → アラーム（例：ERROR件数、root利用）</li>
<li>{k|サブスクリプションフィルター}：リアルタイムで{k|Kinesis Data Streams / Data Firehose / Lambda / OpenSearch}へ転送。アカウント横断の集約にも使う</li>
<li>{k|Logs Insights}：ログへの対話型クエリ（アドホック調査）。S3へのエクスポートは非同期でリアルタイムではない</li>
<li>複数アカウント・リージョンの横断監視は{k|CloudWatch クロスアカウントオブザーバビリティ（OAM）}で、監視アカウントから各ソースアカウントのメトリクス・ログ・トレースを参照</li>
</ul>
''', [
 ('EC2のメモリ使用率はCloudWatchの標準メトリクスとして自動収集される。', False, 'メモリ・ディスク使用率は標準メトリクスに含まれない。CloudWatch Agentで収集する。'),
 ('複合アラームは複数のアラーム状態を論理式で組み合わせ、通知のノイズを減らすのに使える。', True, 'AND/OR/NOTで束ねて、真に対応が必要な状況のみ通知できる。'),
 ('CloudWatch Logsのロググループは既定で30日後に自動削除される。', False, '既定は無期限保持。保持期間を明示設定しないとコストが増え続ける。'),
]),
('X-Ray・Synthetics・RUM：アプリの可視化', '''
<h4>分散トレーシング</h4>
<ul>
<li>{k|AWS X-Ray}：リクエストをサービス間で追跡し、{k|サービスマップ}でレイテンシ・エラー率・ボトルネックを特定。マイクロサービスの「どこが遅いか」はX-Ray</li>
<li>計装は X-Ray SDK または {k|AWS Distro for OpenTelemetry（ADOT）}。Lambdaは「アクティブトレース」を有効化するだけ。ECS/EC2ではX-Rayデーモン/ADOTコレクターが必要</li>
<li>{k|サンプリングルール}で記録率を調整（全リクエスト記録はコスト増）。{k|アノテーション}は検索可能、メタデータは検索不可</li>
<li>{k|CloudWatch Application Signals}：SLO（可用性・レイテンシ目標）をアプリ視点で定義・追跡</li>
</ul>
<h4>合成監視と実ユーザー監視</h4>
<ul>
<li>{k|CloudWatch Synthetics（カナリア）}：スクリプトで定期的にURL/APIを叩き、{k|ユーザーがいない時間帯でも}可用性を検知</li>
<li>{k|CloudWatch RUM}：実ユーザーのブラウザからページ性能・JSエラーを収集</li>
<li>{k|Contributor Insights}：ログから「上位N個の寄与者」（例：特定IPのリクエスト急増）を可視化</li>
</ul>
<p>{t|引っ掛け}：「サービス間の呼び出しの遅延箇所を特定」→ X-Ray。「リソース全体の負荷」→ CloudWatchメトリクス。「誰がAPIを呼んだか」→ CloudTrail。</p>
''', [
 ('X-Rayのサービスマップは、分散アプリケーションのどのサービスがレイテンシやエラーの原因かを特定するのに適している。', True, 'トレースデータからノード間のレイテンシ・エラー率を可視化する。'),
 ('CloudWatch Syntheticsのカナリアは、実ユーザーのアクセスがある時のみ可用性を検知できる。', False, 'Syntheticsはスクリプトによる合成トラフィックなので、実ユーザーがいなくても検知できる。実ユーザー計測はRUM。'),
 ('X-Rayのアノテーションはインデックス化され、フィルター式での検索に使える。', True, 'アノテーションは検索可能。メタデータは検索対象にならない。'),
]),
('CloudTrail と AWS Config の使い分け', '''
<h4>CloudTrail ＝ 「誰が・いつ・何のAPIを呼んだか」</h4>
<ul>
<li>{k|管理イベント}は既定で記録され、コンソールの{k|イベント履歴は過去90日}分。長期保管・分析には{k|証跡（Trail）をS3へ}作成</li>
<li>{k|データイベント}（S3オブジェクトレベル、Lambda Invoke、DynamoDBアイテム等）は{t|既定で無効・有料}。必要なものだけ有効化</li>
<li>{k|組織の証跡（Organization trail）}で全アカウント分を管理アカウント/委任管理者から一括有効化。{k|ログファイルの整合性検証}で改ざん検知</li>
<li>{k|CloudTrail Lake}：イベントをマネージドなストアに保存し、SQLで直接クエリ（Athena構築不要）</li>
<li>{k|CloudTrail Insights}：異常なAPI呼び出し量・エラー率を検知</li>
</ul>
<h4>AWS Config ＝ 「リソースの設定が今どうで、どう変わったか」</h4>
<ul>
<li>設定履歴・タイムラインを記録し、{k|Configルール}で準拠/非準拠を評価（マネージド/カスタムLambda）</li>
<li>{k|適合パック（Conformance pack）}でルール群を一括展開、{k|アグリゲーター}で複数アカウント/リージョンを集約</li>
<li>非準拠は{k|SSM Automationによる自動修復}に接続できる（例：公開S3をプライベートに戻す）</li>
<li>{k|高度なクエリ}でSQL風にリソース設定を横断検索</li>
</ul>
<p>{t|引っ掛け}：Configは「設定の変更」を記録するが「誰が」変更したかはCloudTrailと突き合わせる。Configは{k|予防ではなく検知}（SCPやIAMが予防）。</p>
''', [
 ('CloudTrailのイベント履歴（コンソール）は管理イベントを過去90日間参照できる。', True, '長期保管には証跡をS3等に作成する。'),
 ('S3オブジェクトレベルのAPI（GetObject等）は、管理イベント用の証跡を作成するだけで自動的に記録される。', False, 'S3オブジェクトレベルはデータイベントで、既定では無効。明示的に有効化が必要。'),
 ('AWS Configルールは非準拠リソースを検知でき、SSM Automationによる自動修復とも連携できる。', True, '修復アクション（remediation）としてSSM Automationランブックを紐付けられる。'),
]),
('監視設計の判断表', '''
<table>
<tr><th>要件</th><th>選ぶサービス</th></tr>
<tr><td>CPU・ネットワーク等の傾向とアラーム</td><td>CloudWatch メトリクス/アラーム</td></tr>
<tr><td>メモリ・ディスク・アプリログ</td><td>CloudWatch Agent / Logs</td></tr>
<tr><td>ログ内の特定文字列で通知</td><td>メトリクスフィルター + アラーム</td></tr>
<tr><td>ログをリアルタイムで別アカウントやOpenSearchへ</td><td>サブスクリプションフィルター</td></tr>
<tr><td>サービス間の遅延箇所の特定</td><td>X-Ray / Application Signals</td></tr>
<tr><td>ユーザー不在でも可用性確認</td><td>Synthetics</td></tr>
<tr><td>API操作の監査（誰が何をした）</td><td>CloudTrail（Lakeでクエリ）</td></tr>
<tr><td>設定変更履歴・コンプライアンス</td><td>Config</td></tr>
<tr><td>AWS側の障害・メンテ通知</td><td>AWS Health / Health Dashboard（EventBridge連携）</td></tr>
<tr><td>複数アカウント横断の一元可視化</td><td>CloudWatch OAM / 組織の証跡 / Config アグリゲーター</td></tr>
</table>
<h4>アラート経路の定石</h4>
<ul>
<li>通知：アラーム → {k|SNS} → メール/Slack（{k|Amazon Q Developer in chat applications}＝旧AWS Chatbot）</li>
<li>自動対応：アラーム/イベント → {k|EventBridge} → Lambda / SSM Automation / Step Functions</li>
<li>{t|アラーム設定の落とし穴}：欠損データ処理（{k|TreatMissingData}）を誤ると、停止したインスタンスでINSUFFICIENT_DATAのまま通知されない。ハートビート的指標は「欠損＝異常（breaching）」にする</li>
<li>運用の目標は「人が気づく」前に{k|自動検知→自動修復}。通知だけで終わる設計より、修復まで自動化する案が試験では選ばれやすい</li>
</ul>
''', [
 ('欠損データを異常（breaching）として扱う設定により、メトリクスが途絶えた場合にもアラームを発報させられる。', True, 'TreatMissingDataをbreachingにするとデータ途絶をALARMとして扱える。'),
 ('「誰がセキュリティグループを変更したか」を調べるには、Configの設定タイムラインのみで十分で、CloudTrailは不要である。', False, 'Configのタイムラインはいつどう変わったかを示すが、実行者のAPI呼び出し記録はCloudTrailで確認する。'),
]),
]
LESSON, OX = build('3-1', '監視・可観測性（CloudWatch / X-Ray / CloudTrail / Config）', pages)
