L = dict(id='2-4', title='ストレージ設計(S3・EBS・EFS・FSx)', pages=[
('S3のクラス・ライフサイクル・整合性', '''<table><tr><th>クラス</th><th>特徴</th></tr><tr><td>Standard</td><td>頻繁アクセス</td></tr><tr><td><b class="key">Intelligent-Tiering</b></td><td>アクセスパターン不明・変動。自動で階層移動(取り出し料金なし、オブジェクト単位の監視料金あり)</td></tr><tr><td>Standard-IA / One Zone-IA</td><td>低頻度。最小保存30日、128KB未満は128KB課金。One Zoneは<b class="key">単一AZ</b>(再作成可能なデータ向け)</td></tr><tr><td>Glacier Instant Retrieval</td><td>四半期に1回程度、<b class="key">ミリ秒取り出し</b>。最小90日</td></tr><tr><td>Glacier Flexible Retrieval</td><td>数分〜12時間。最小90日</td></tr><tr><td>Glacier Deep Archive</td><td>最安。標準12時間・バルク48時間。最小180日</td></tr></table>
<ul><li>ライフサイクルルールで移行・有効期限、不完全なマルチパートアップロードの削除</li><li>S3は<b class="key">強い読み取り整合性(strong read-after-write)</b>を全リクエストで提供</li><li>バージョニング+MFA Delete、<b class="key">Object Lock</b>(WORM：ガバナンス/コンプライアンスモード、リーガルホールド)、Glacier Vault Lock</li><li>大容量アップロード：マルチパートアップロード(100MB超で推奨・5GB超は必須)、S3 Transfer Acceleration(遠隔地からエッジ経由)</li><li>レプリケーション：SRR/CRR。<b class="key">既存オブジェクトにはS3バッチレプリケーション</b>。バージョニング必須</li></ul>
<p><span class="trap">引っ掛け：ライフサイクルでIntelligent-Tieringや各IAへ移すとき、小さいオブジェクトが多いと最小サイズ課金で逆に高くなる。</span></p>''',
[('S3 Standard-IAは単一AZにのみデータを保存する。',False,'単一AZなのはOne Zone-IA。Standard-IAは3AZ以上に保存。'),
('S3 Object Lockのコンプライアンスモードでは、保持期間中は root ユーザーでも削除・上書きできない。',True,'ガバナンスモードは特別権限で解除できるが、コンプライアンスモードは不可。'),
('レプリケーションを設定する前から存在するオブジェクトを複製するには、S3バッチレプリケーションを使う。',True,'通常のレプリケーションは設定後の新規オブジェクトが対象。')]),
('EBS・インスタンスストア・EFS', '''<h4>EBS</h4><ul><li><b class="key">gp3</b>：汎用SSD、容量と独立してIOPS(3,000〜16,000)/スループット指定。gp2より約20%安価。大半の用途の既定</li><li>io2 / io2 Block Express：高耐久(99.999%)、最大256,000 IOPS、<b class="key">マルチアタッチ</b>(io1/io2、同一AZ内のNitro)。ミッションクリティカルDB</li><li>st1(スループット最適化HDD)・sc1(コールドHDD)：ブート不可、ビッグデータ/ログ向け</li><li>EBSは<b class="key">AZ固定</b>。AZ間移動はスナップショット経由。スナップショットはS3に増分保存、高速スナップショット復元(FSR)</li></ul>
<h4>インスタンスストア</h4><ul><li>物理ホスト直結の超高IOPS。<b class="key">停止/終了/故障でデータ消失</b>。バッファ・キャッシュ・一時データ向け</li></ul>
<h4>EFS</h4><ul><li>NFSv4、<b class="key">Linux専用</b>、マルチAZ、数千のインスタンスから同時マウント、自動伸縮</li><li>ストレージクラス：Standard / IA / Archive(ライフサイクルで自動移行)、One Zone</li><li>スループット：Elastic(推奨・自動)/Provisioned/Bursting。パフォーマンスモード：General Purpose(既定)/Max I/O</li><li>クロスリージョンはEFSレプリケーション、AWS Backup。EFSはLambda・ECS・Fargateからもマウント可</li></ul>''',
[('EBSボリュームは作成したAZ内でのみアタッチでき、AZ間移動にはスナップショットを使う。',True,'EBSはAZ固定のブロックストレージ。'),
('インスタンスストアのデータは、インスタンスを停止してもそのまま保持される。',False,'停止・終了・ハード障害でデータは失われる。'),
('EFSはWindowsインスタンスからSMBでマウントできる。',False,'EFSはNFS(Linux)専用。WindowsにはFSx for Windows File Server。')]),
('FSxファミリーとデータ転送サービス', '''<table><tr><th>サービス</th><th>選ぶ場面</th></tr><tr><td>FSx for Windows File Server</td><td>SMB、<b class="key">Active Directory統合</b>、NTFS、DFS、Windowsワークロード。Multi-AZ可</td></tr><tr><td>FSx for Lustre</td><td>HPC・ML・動画処理の高スループット。<b class="key">S3と連携</b>(データリポジトリ関連付け)。スクラッチ(一時・最高性能)/永続</td></tr><tr><td>FSx for NetApp ONTAP</td><td>NFS/SMB/iSCSIのマルチプロトコル、オンプレNetApp移行、スナップショット、SnapMirror、重複排除</td></tr><tr><td>FSx for OpenZFS</td><td>オンプレZFSの移行、低レイテンシNFS、スナップショット/クローン</td></tr></table>
<h4>オンプレ→AWSのデータ移行</h4><ul><li>DataSync：オンライン転送(NFS/SMB/HDFS/S3等 ↔ AWS)。スケジュール・検証付き</li><li><b class="key">Storage Gateway</b>：ハイブリッド。S3 File / FSx File / Volume(キャッシュ型/保管型) / Tape。オンプレから継続的にクラウドへ</li><li><b class="key">Snowball Edge / Snowcone</b>：大容量でネットワーク帯域が不足するオフライン転送、エッジコンピューティング</li><li><b class="key">AWS Transfer Family</b>：SFTP/FTPS/FTP/AS2をS3/EFSへ。既存パートナーのSFTPを維持したい場合</li></ul>
<p><span class="trap">引っ掛け：「Windows+AD+SMB」→FSx for Windows。「HPC+S3連携」→FSx for Lustre。「ファイルプロトコルを維持したままオンプレから段階的に移行・キャッシュ」→Storage Gateway。「週単位の大量初期転送で回線が細い」→Snowball。</span></p>''',
[('S3と連携して高速に処理するHPCワークロードにはFSx for Lustreが適する。',True,'Lustreは高スループット並列FSで、S3バケットをデータリポジトリとして連携できる。'),
('SFTPで外部パートナーとファイル交換を行い、保存先をS3にしたい場合はAWS Transfer Familyが利用できる。',True,'SFTP/FTPS/FTP/AS2をマネージドで提供する。'),
('Active Directory統合が必要なSMBファイル共有にはEFSを使う。',False,'AD統合のSMBはFSx for Windows File Server。')]),
])
