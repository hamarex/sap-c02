LESSON=dict(id='4-4',title='データ移行:DataSync・Transfer Family・Snow・Storage Gateway',pages=[
dict(title='転送時間の見積りとネットワーク設計',html='''<h4>まず計算する</h4>
<p>転送時間 ≒ データ量 ÷ (回線帯域 × 実効利用率)。<b class="key">100TB を 1Gbps で全帯域使うと約 9〜10 日</b>。実効 80% なら約 12 日、他業務と共用なら更に延びます。</p>
<table><tr><th>状況</th><th>選択</th></tr>
<tr><td>数 TB 以下・回線に余裕・継続的</td><td>DataSync / S3 直接アップロード</td></tr>
<tr><td>数十〜数百 TB・回線が細い・期限が短い</td><td><b class="key">Snowball Edge</b>(オフライン)</td></tr>
<tr><td>継続的に大量転送・安定帯域・低レイテンシ</td><td><b class="key">Direct Connect</b>(専用接続は 1/10/100 Gbps)</td></tr>
<tr><td>Direct Connect の開通までのつなぎ</td><td>Site-to-Site VPN / Snowball</td></tr></table>
<h4>設計の要点</h4>
<ul><li>Direct Connect は開通に<b class="key">数週間〜</b>かかる → 期限が短い場合は Snow が有利</li>
<li>Direct Connect は暗号化されない → 必要なら <b class="key">VPN over DX</b>(または MACsec 対応専用接続)</li>
<li>S3 への単一アップロードは<b class="key">マルチパートアップロード</b>、並列化で高速化。遠隔地は <b class="key">S3 Transfer Acceleration</b></li>
<li><b class="key">Public VIF</b> で S3 パブリックエンドポイント、Private VIF + <b class="key">S3 インターフェイスエンドポイント</b>でプライベート経由</li></ul>
<span class="trap">落とし穴</span>:「帯域を増強するしかない」と選ばせても、期限・コスト要件次第で Snow Family が正解になる。''',
ox=[('100TB を 1Gbps 回線で転送する場合、理論上の最短でも約 9 日かかる。',True,'800,000Gb ÷ 1Gbps ≒ 約 9.3 日。'),
('Direct Connect の接続は標準で IPsec により暗号化される。',False,'標準では暗号化されない。VPN over DX 等を併用する。'),
('転送期限が短く回線が細い場合は、オフライン転送の Snowball Edge が有力である。',True,'ネットワーク転送が間に合わない場合。')]),
dict(title='AWS DataSync と Transfer Family',html='''<h4>AWS DataSync</h4>
<ul><li>オンプレ NFS/SMB/HDFS/オブジェクトストレージ ↔ <b class="key">S3・EFS・FSx</b> を<b class="key">高速・自動化</b>して転送(エージェントをオンプレに配置)</li>
<li>スケジュール実行、<b class="key">帯域制限</b>、整合性検証、メタデータ(権限・タイムスタンプ)保持、差分転送</li>
<li>AWS 内ストレージ間(S3 ⇔ EFS など)や他クラウドとも転送可。接続は VPC エンドポイント(プライベート)可</li>
<li>S3 へ書く際にストレージクラスを指定可能(例:Glacier)</li></ul>
<h4>AWS Transfer Family</h4>
<ul><li><b class="key">SFTP / FTPS / FTP / AS2</b> のマネージドサーバー。バックエンドは <b class="key">S3 または EFS</b></li>
<li>既存パートナーが使う FTP クライアントや認証(<b class="key">Active Directory/カスタム IdP</b>)をそのまま利用</li>
<li>用途:「パートナーからのファイル受領を S3 へ」「既存 SFTP サーバーの置換」</li></ul>
<table><tr><th>要件</th><th>サービス</th></tr>
<tr><td>一括移行・定期同期</td><td>DataSync</td></tr>
<tr><td>外部パートナーの SFTP 受付</td><td>Transfer Family</td></tr>
<tr><td>ハイブリッドで S3 をファイル共有として使う</td><td>Storage Gateway</td></tr></table>
<span class="trap">落とし穴</span>:Transfer Family は移行ツールではなくプロトコル受付サービス。大量の一括移行は DataSync。''',
ox=[('DataSync は転送データの整合性検証と帯域制限をサポートする。',True,'いずれも標準機能。'),
('Transfer Family は SFTP をサポートするが、バックエンドストレージは S3 のみである。',False,'EFS もサポート。'),
('既存パートナーが利用中の SFTP 受付を AWS に置換するには Transfer Family が適している。',True,'クライアント側変更を最小にできる。')]),
dict(title='Snow Family と Storage Gateway',html='''<h4>Snow Family</h4>
<table><tr><th>デバイス</th><th>容量・特徴</th></tr>
<tr><td><b class="key">Snowball Edge Storage Optimized</b></td><td>最大約 210TB の NVMe ストレージ。大容量移行向け</td></tr>
<tr><td><b class="key">Snowball Edge Compute Optimized</b></td><td>EC2 / Lambda をエッジで実行。GPU 版あり</td></tr>
<tr><td>Snowcone</td><td>小型(約 8TB HDD / 14TB SSD)。持ち運び・過酷な環境</td></tr></table>
<ul><li>データは<b class="key">自動で暗号化</b>(KMS)。返送後 S3 に取り込み</li>
<li>複数台並列で数百 TB〜PB。S3 にインポート後は DataSync で差分同期する運用も</li>
<li>Snowball Edge は <b class="key">EC2 AMI を載せてエッジ処理</b>、またはクラスターとして耐久性確保</li>
<li>OpsHub でデバイス管理</li></ul>
<h4>Storage Gateway</h4>
<table><tr><th>種類</th><th>用途</th></tr>
<tr><td><b class="key">S3 File Gateway</b></td><td>NFS/SMB で S3 にオブジェクトとして保存。キャッシュ</td></tr>
<tr><td><b class="key">FSx File Gateway</b></td><td>オンプレから FSx for Windows への低レイテンシアクセス</td></tr>
<tr><td><b class="key">Volume Gateway</b></td><td>iSCSI。<b class="key">Cached</b>(主データは S3、頻用をキャッシュ)/<b class="key">Stored</b>(主データはオンプレ、非同期で S3 にバックアップ)</td></tr>
<tr><td><b class="key">Tape Gateway</b></td><td>既存バックアップソフトの VTL を S3/Glacier へ</td></tr></table>
<span class="trap">落とし穴</span>:Snowmobile は提供終了(新規利用不可)。Snow Family は提供状況が変わるため、試験では「オフライン大容量転送」の位置付けで理解する。''',
ox=[('Volume Gateway の Stored モードでは、主データはオンプレミスに保持され、S3 に非同期バックアップされる。',True,'Cached は主データが S3 側。'),
('Tape Gateway は既存のバックアップソフトウェアを変更せずにクラウドへテープ保管できる。',True,'VTL として動作する。'),
('Snowball Edge に保存されたデータは暗号化されず、返送前に手動で暗号化する必要がある。',False,'自動で暗号化される。')]),
dict(title='移行ツールの選択まとめ',html='''<h4>決め手早見表</h4>
<table><tr><th>シナリオ</th><th>最適解</th></tr>
<tr><td>オンプレ NFS → S3/EFS に定期同期</td><td><b class="key">DataSync</b></td></tr>
<tr><td>回線 100Mbps で 200TB、1 か月以内</td><td><b class="key">Snowball Edge</b>(複数台)</td></tr>
<tr><td>オンプレのアプリは残しつつ、バックアップ先に S3 をファイルとして使いたい</td><td>S3 File Gateway</td></tr>
<tr><td>既存バックアップのテープ廃止</td><td><b class="key">Tape Gateway</b></td></tr>
<tr><td>FTP 受付を AWS へ</td><td>Transfer Family</td></tr>
<tr><td>データベースを無停止で</td><td>DMS</td></tr>
<tr><td>サーバーごと</td><td>MGN</td></tr>
<tr><td>Windows ファイルサーバーを置換</td><td>FSx for Windows(DataSync で移行)</td></tr>
<tr><td>HPC・Lustre 互換</td><td>FSx for Lustre</td></tr></table>
<h4>引っ掛けパターン</h4>
<ul><li><span class="trap">Storage Gateway はデータ移行ツールではなく、ハイブリッド統合(継続利用)のためのもの</span></li>
<li>Snow は<b class="key">往復の配送日数</b>があるため、「数日以内」の要件には向かない</li>
<li>DataSync はファイルレベル。DB やサーバーイメージは対象外</li>
<li>混在(Snow で初期転送 + DataSync/DMS で差分)はよく出る正解パターン</li></ul>''',
ox=[('Storage Gateway は大規模データ移行を目的として最も一般的に使われる。',False,'ハイブリッド統合・継続利用が主目的。'),
('初期データを Snowball Edge で送り、その後の差分を DataSync で同期する構成は有効である。',True,'一般的な併用パターン。'),
('DataSync はデータベースエンジンの変更を伴う移行に使える。',False,'ファイルレベルの転送。DB は DMS。')]),
])
