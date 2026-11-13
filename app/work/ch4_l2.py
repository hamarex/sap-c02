LESSON=dict(id='4-2',title='サーバー移行:MGN と VMware',pages=[
dict(title='Application Migration Service (MGN) の仕組み',html='''<h4>MGN とは</h4>
<p>物理・仮想・他クラウドのサーバーを<b class="key">ブロックレベルで継続レプリケーション</b>し、EC2 へ Rehost するサービス。旧 CloudEndure Migration の後継で、<b class="key">AWS Server Migration Service (SMS) の後継</b>でもあります。</p>
<h4>流れ</h4>
<ol><li>ソースサーバーに <b class="key">AWS Replication Agent</b> を導入</li>
<li>データは対象リージョンの<b class="key">ステージングエリア(低コストなレプリケーションサーバー + EBS)</b>へ継続レプリケーション</li>
<li><b class="key">テストカットオーバー</b>で起動テスト(本番へ影響なし)</li>
<li>カットオーバー(本番切替)。ダウンタイムは<b class="key">数分程度</b></li>
<li>ステージング資源は後で削除</li></ol>
<h4>ポイント</h4>
<ul><li>起動テンプレートで<b class="key">インスタンスタイプ・サブネット・SG</b>を事前定義</li>
<li>OS・アプリ・データはそのまま。移行後の最適化は別途(Rehost)</li>
<li>VMware 環境では <b class="key">エージェントレス</b>(vCenter クライアント経由のスナップショットベース)も可</li>
<li>通信は TCP 443(AWS 接続)と 1500(エージェント → レプリケーションサーバー)。Direct Connect/VPN の経由も可</li>
<li><span class="trap">落とし穴</span>:バックアップ(AMI 作成)で移行するのではなく継続レプリケーションで<b class="key">カットオーバー時間を最小化</b>する</li></ul>''',
ox=[('MGN はスナップショット取得後に一度だけコピーし、変更差分は反映しない。',False,'継続的なブロックレベルレプリケーションで差分も反映する。'),
('MGN のテストカットオーバーは、本番サーバーの稼働に影響せず実施できる。',True,'テストインスタンスを起動して検証するだけで、ソースは稼働し続ける。'),
('MGN は AWS Server Migration Service (SMS) の後継サービスである。',True,'SMS は終了し MGN へ移行。')]),
dict(title='MGN の設計判断と DR との違い',html='''<h4>ネットワーク・セキュリティ設計</h4>
<ul><li>ステージング用サブネットを準備し、レプリケーションサーバーはそこに起動</li>
<li>帯域が不足する場合は<b class="key">帯域スロットリング</b>や専用線(Direct Connect)を検討</li>
<li>IAM ロールで MGN にリソース作成権限を付与(初期化)。<b class="key">暗号化 EBS</b> を使える</li>
<li>ネットワーク分離環境は <b class="key">Private Link / VPC エンドポイント</b>経由で接続</li></ul>
<h4>MGN と DRS</h4>
<table><tr><th></th><th>MGN</th><th>Elastic Disaster Recovery (DRS)</th></tr>
<tr><td>目的</td><td><b class="key">移行(一度きり)</b></td><td>災害対策(継続保護)</td></tr>
<tr><td>仕組み</td><td>同じブロックレプリケーション</td><td>同じ。リカバリ用に常時レプリケーション</td></tr>
<tr><td>終了</td><td>カットオーバー後に完了</td><td>継続。ポイントインタイムリカバリ</td></tr></table>
<h4>よくある選択</h4>
<ul><li>「最小ダウンタイムでオンプレの Windows サーバーを EC2 へ」→ MGN</li>
<li>「VM の OVA/VMDK をインポートして AMI 化」→ VM Import/Export(手動・継続同期なし。小規模向け)</li>
<li><span class="trap">落とし穴</span>:<b class="key">VM Import/Export</b> は継続レプリケーションがなく、停止時間が長くなる</li></ul>''',
ox=[('Elastic Disaster Recovery と MGN は同様のレプリケーション技術を用いるが、目的が異なる。',True,'移行か継続的 DR かの違い。'),
('VM Import/Export は継続的な差分レプリケーションにより最小ダウンタイム移行を実現する。',False,'VM Import/Export は継続同期を行わない。'),
('MGN のレプリケーションサーバーはステージングサブネットに作成される。',True,'低コストなステージングエリアを使う。')]),
dict(title='VMware Cloud on AWS・EVS と Relocate',html='''<h4>VMware 環境の移行選択肢</h4>
<table><tr><th>選択肢</th><th>特徴</th><th>向く場面</th></tr>
<tr><td><b class="key">VMware Cloud on AWS</b></td><td>AWS 上のベアメタルで VMware SDDC(vSphere/vSAN/NSX)。オンプレと同じ運用ツール。<b class="key">HCX</b> で vMotion 移行</td><td>アプリ変更不可・VMware 運用を継続・短期間</td></tr>
<tr><td><b class="key">Amazon Elastic VMware Service (EVS)</b></td><td>お客様の VPC 内で VMware Cloud Foundation を稼働。AWS ネイティブサービスと近接</td><td>VMware を使い続けつつ VPC 内で運用したい</td></tr>
<tr><td><b class="key">MGN で EC2 へ</b></td><td>VM を EC2 へ Rehost(Hypervisor 変更)</td><td>VMware ライセンスから脱却したい</td></tr></table>
<h4>ポイント</h4>
<ul><li>Relocate = ハイパーバイザーレベルで<b class="key">変更なし・IP も維持可能(L2 拡張)</b></li>
<li>HCX で <b class="key">Bulk Migration / vMotion / Replication Assisted vMotion(RAV)</b></li>
<li>VMware Cloud on AWS の SDDC は <b class="key">接続された VPC(ENI)</b>経由で S3・RDS 等に低レイテンシ接続可能</li>
<li>オンプレ-AWS 接続は Direct Connect か IPsec VPN</li>
<li><span class="trap">落とし穴</span>:「VMware ライセンス費用を削減」「EC2 に移したい」→ VMware Cloud on AWS ではなく MGN</li></ul>''',
ox=[('VMware Cloud on AWS では、HCX を使って VM を再構成せずにオンプレミスから移行できる。',True,'HCX による vMotion/一括移行が可能。'),
('VMware ライセンスから脱却したい場合は VMware Cloud on AWS が最適である。',False,'EC2 へ Rehost する MGN が適切。'),
('Amazon EVS は VMware Cloud Foundation をお客様の Amazon VPC 内で稼働させる。',True,'EVS の特徴。')]),
])
