LESSON=dict(id='4-6',title='ライセンス・コスト見積り・TCO',pages=[
dict(title='ライセンス戦略:BYOL・License Included・Dedicated Host',html='''<h4>基本の選択</h4>
<table><tr><th>モデル</th><th>内容</th></tr>
<tr><td><b class="key">License Included (LI)</b></td><td>Windows Server / SQL Server 等の料金がインスタンス料金に含まれる。従量で簡単</td></tr>
<tr><td><b class="key">BYOL</b></td><td>既存ライセンスを持ち込む。ライセンス条件(ソケット/コア固定)を満たす必要あり</td></tr></table>
<h4>Dedicated Host / Dedicated Instance</h4>
<ul><li><b class="key">Dedicated Host</b>:物理サーバー全体を専有。<b class="key">ソケット・コア・ホスト ID が可視化</b>され、ソケット/コア単位のライセンス(Windows Server、SQL Server、Oracle の一部など)の BYOL に必要</li>
<li><b class="key">Dedicated Instance</b>:ハードウェア専有だがホスト ID・ソケット可視化なし。<span class="trap">BYOL には不十分な場合が多い</span></li>
<li><b class="key">AWS License Manager</b>:ライセンスルールを定義し使用量を追跡・制限(Dedicated Host の自動管理、組織横断)</li></ul>
<h4>RDS でのライセンス</h4>
<ul><li>RDS for Oracle:LI(SE2)または BYOL(SE2・EE)</li>
<li>RDS for SQL Server:<b class="key">License Included のみ</b>(通常の RDS では BYOL 不可。Dedicated Host を使いたい、BYOL が必要 → <b class="key">RDS Custom for SQL Server</b> 等 or EC2)</li>
<li>Aurora/PostgreSQL へ移行すれば商用 DB ライセンス費用を削減可能</li></ul>
<h4>コスト最適化</h4>
<ul><li>SQL Server on EC2:<b class="key">Optimize CPUs</b> で vCPU を減らし(コア数削減)ライセンスを節約</li>
<li>Windows の LI を使う vs BYOL は利用規約・ソフトウェアアシュアランス(SA)条件に依存 → <b class="key">License Mobility</b> の適格性</li></ul>''',
ox=[('Dedicated Host は、ソケットやコア数が可視化されるため、ソケット/コア単位の BYOL に利用できる。',True,'Dedicated Instance との違い。'),
('Amazon RDS for SQL Server では、通常のインスタンスで BYOL を選択できる。',False,'標準の RDS for SQL Server は License Included のみ。'),
('AWS License Manager は組織全体でライセンス使用量の追跡と制限に使える。',True,'Organizations 連携で管理。')]),
dict(title='コスト見積りと TCO の考え方',html='''<h4>TCO に含めるべき項目</h4>
<ul><li>オンプレ側:ハードウェア償却、データセンター(電力・冷却・ラック)、保守、ネットワーク、<b class="key">人件費</b>、ライセンス、DR 拠点</li>
<li>AWS 側:コンピュート、ストレージ、データ転送(<b class="key">アウトバウンド</b>課金)、サポート、移行費用、<b class="key">二重稼働期間</b></li>
<li><b class="key">Migration Evaluator</b> が利用実績からオンプレ費用と AWS 費用を比較するビジネスケースを作成</li></ul>
<h4>ツールの使い分け</h4>
<table><tr><th>ツール</th><th>用途</th></tr>
<tr><td>AWS Pricing Calculator</td><td>構成ごとの月額見積り</td></tr>
<tr><td>Migration Evaluator</td><td>既存環境の実測に基づく TCO/ビジネスケース</td></tr>
<tr><td>Cost Explorer / Budgets</td><td>移行後のコスト把握・予算管理</td></tr>
<tr><td>Compute Optimizer</td><td>移行後のライトサイジング</td></tr>
<tr><td>Savings Plans / RI</td><td>安定ワークロードの割引(1年・3年)</td></tr></table>
<h4>コスト削減の判断</h4>
<ul><li>利用率が低いサーバーは<b class="key">ライトサイジング</b>してから購入オプションを決める(順序が重要)</li>
<li>DR 用は Pilot Light/Warm Standby でオンプレ DR 拠点より安価に</li>
<li>データ転送:インバウンドは無料、<b class="key">インターネットへのアウトバウンドは有料</b>。Direct Connect 経由は転送単価が低い</li>
<li><span class="trap">落とし穴</span>:移行直後はオンプレ・AWS の二重コストが発生する。TCO では移行期間も含める</li></ul>''',
ox=[('Savings Plans の購入前に、まずライトサイジングを行うのが望ましい。',True,'過大スペックのままコミットしないため。'),
('AWS へのデータのインバウンド転送には課金されるが、アウトバウンドは無料である。',False,'逆。インバウンドは無料、アウトバウンドは有料。'),
('Migration Evaluator は既存環境の利用状況に基づいてビジネスケースを作る。',True,'エージェントレスコレクターで収集。')]),
dict(title='移行プロジェクトの落とし穴総まとめ',html='''<h4>試験でよく出る判断軸</h4>
<table><tr><th>キーワード</th><th>答えの方向性</th></tr>
<tr><td>最小ダウンタイム・DB</td><td>DMS (full load + CDC)</td></tr>
<tr><td>最小ダウンタイム・サーバー</td><td>MGN</td></tr>
<tr><td>アプリ変更不可・VMware</td><td>VMware Cloud on AWS(Relocate)</td></tr>
<tr><td>異種 DB・スキーマ変換</td><td>SCT / DMS Schema Conversion</td></tr>
<tr><td>依存関係の把握</td><td>ADS(エージェント方式)</td></tr>
<tr><td>運用負荷削減・最小改修</td><td>Replatform(RDS・Beanstalk)</td></tr>
<tr><td>段階的刷新</td><td>Strangler Fig</td></tr>
<tr><td>COBOL</td><td>M2</td></tr>
<tr><td>BYOL・ソケット単位</td><td>Dedicated Host + License Manager</td></tr></table>
<h4>セキュリティと運用の落とし穴</h4>
<ul><li>移行中の転送データは<b class="key">TLS/暗号化</b>を確保(DMS は SSL、Snow は自動暗号化)</li>
<li>DMS のレプリケーションインスタンスは<b class="key">ソースとターゲットに到達可能な VPC・SG</b>に配置</li>
<li>カットオーバー前に<b class="key">ロールバック計画</b>とテストを実施</li>
<li>移行後の最適化(Well-Architected 再評価)までが移行プロジェクト</li></ul>
<h4>最後に:要件キーワードを拾う</h4>
<p>「最短」「最小コスト」「運用負荷最小」「アプリ変更なし」「無停止」のうち<b class="key">最優先の制約</b>を見つけ、他の選択肢を消去していきます。</p>''',
ox=[('依存関係の詳細な把握が必要な場合は、ADS のエージェントレス方式だけで十分である。',False,'エージェント方式でプロセス・ネットワーク接続を取得する。'),
('異種 DB 移行では、スキーマ変換とデータ移行を別ツールで行うのが一般的である。',True,'SCT + DMS。'),
('カットオーバー前にロールバック計画を準備しておくことは重要である。',True,'移行失敗時に備える。')]),
])
