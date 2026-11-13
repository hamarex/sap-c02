K=lambda s:'<b class="key">'+s+'</b>'
LESSON=dict(id='4-1',title='移行戦略・7R・評価ツール',pages=[
dict(title='7R 移行戦略の使い分け',html='''<h4>7R とは</h4>
<p>既存アプリケーションごとに「どう移すか」を決めるフレームワークです。試験では<b class="key">要件(期間・コスト・改修可否)から最適な R を選ぶ</b>問題が頻出します。</p>
<table><tr><th>R</th><th>内容</th><th>典型シナリオ</th></tr>
<tr><td><b class="key">Rehost</b></td><td>リフト&シフト。変更せず EC2 へ</td><td>期限が短い・データセンター撤退。MGN を使用</td></tr>
<tr><td><b class="key">Replatform</b></td><td>リフト&リシェイプ。中核は変えず一部をマネージド化</td><td>自前 MySQL を RDS/Aurora、Tomcat を Elastic Beanstalk へ</td></tr>
<tr><td><b class="key">Refactor / Re-architect</b></td><td>クラウドネイティブに再設計</td><td>スケーラビリティ要件・俊敏性が最優先</td></tr>
<tr><td><b class="key">Repurchase</b></td><td>SaaS 等の別製品に置換</td><td>自社 CRM を Salesforce 等へ</td></tr>
<tr><td><b class="key">Retire</b></td><td>廃止</td><td>ディスカバリで利用されていないと判明したサーバー</td></tr>
<tr><td><b class="key">Retain</b></td><td>当面オンプレミスに残す</td><td>最近更新したばかり・規制・依存関係が未整理</td></tr>
<tr><td><b class="key">Relocate</b></td><td>ハイパーバイザーレベルで移す</td><td>VMware Cloud on AWS へ VM をそのまま移動</td></tr></table>
<h4>判断のコツ</h4>
<ul><li>「アプリを一切変更できない」「最短で」→ <b class="key">Rehost</b> か <b class="key">Relocate</b>(VMware 環境を維持したいなら Relocate)</li>
<li>「運用負荷を下げたいが大改修は避けたい」→ <b class="key">Replatform</b></li>
<li><span class="trap">落とし穴</span>:Relocate は VMware Cloud on AWS(および Amazon EVS)向けで、EC2 への移行は Rehost</li></ul>''',
ox=[('Relocate は、VM を変更せずに EC2 インスタンスへ移行する戦略である。',False,'Relocate はハイパーバイザーレベルの移動(VMware Cloud on AWS 等)。EC2 への変更なし移行は Rehost。'),
('オンプレミスの MySQL を Amazon RDS for MySQL に移すのは典型的な Replatform である。',True,'アプリの中核は変えずデータベースだけマネージド化するため Replatform。'),
('ディスカバリで利用実績がないと判明したサーバーは Retain に分類する。',False,'利用されていないものは Retire(廃止)。Retain は残すと決めたもの。')]),
dict(title='ディスカバリと評価:ADS・Migration Evaluator',html='''<h4>移行前のアセスメント</h4>
<table><tr><th>サービス</th><th>役割</th></tr>
<tr><td><b class="key">AWS Application Discovery Service (ADS)</b></td><td>サーバーの構成・利用状況・プロセス・<b class="key">ネットワーク依存関係</b>を収集。結果は Migration Hub に集約</td></tr>
<tr><td><b class="key">Migration Evaluator</b></td><td>旧 TSO Logic。利用状況から<b class="key">ビジネスケース(TCO 比較・適正サイズ見積り)</b>を作成</td></tr>
<tr><td><b class="key">Migration Hub</b></td><td>移行の進捗を<b class="key">単一ビューで追跡</b>。移行ツールの状況を集約</td></tr></table>
<h4>ADS の収集方式</h4>
<ul><li><b class="key">Agentless Collector</b>(VMware vCenter 経由):エージェント不要。構成・CPU/メモリ等の性能データ。<span class="trap">プロセスやネットワーク接続の詳細は取れない</span></li>
<li><b class="key">Discovery Agent</b>:各サーバーに導入。<b class="key">実行中プロセス・ネットワーク接続(依存関係)</b>まで取得。物理サーバーや非 VMware にも使える</li></ul>
<h4>使い分け</h4>
<ul><li>「依存関係を把握してグルーピング(ウェーブ計画)したい」→ ADS エージェント</li>
<li>「経営層向けにクラウド移行の費用対効果を示したい」→ Migration Evaluator</li>
<li>「複数ツールを使った移行全体の進捗を一元管理」→ Migration Hub</li>
<li>Migration Hub のホームリージョンを選択し、移行データはそこに保存される</li></ul>''',
ox=[('Application Discovery Service のエージェントレスコレクターは、サーバー上のプロセスとネットワーク依存関係の詳細を収集できる。',False,'プロセス・ネットワーク接続の詳細はエージェント方式の機能。'),
('Migration Evaluator は現状の利用状況に基づく TCO 比較のビジネスケース作成に使う。',True,'Migration Evaluator の主目的。'),
('Migration Hub は移行そのものを実行するサービスである。',False,'Migration Hub は進捗追跡・可視化の集約先で、実際の移行は MGN や DMS 等が行う。')]),
dict(title='Migration Hub と移行オーケストレーション',html='''<h4>Migration Hub ファミリー</h4>
<ul><li><b class="key">Migration Hub</b>:ADS・MGN・DMS 等の進捗を一元的に追跡。アプリケーション単位でグルーピング</li>
<li><b class="key">Migration Hub Orchestrator</b>:移行ワークフローの自動化(例:SAP などのテンプレート、サーバー移行の手順自動化)</li>
<li><b class="key">Migration Hub Strategy Recommendations</b>:アプリを分析し、<b class="key">推奨する 7R 戦略</b>と移行先を提示(ソースコード・.NET/Java 分析も可能)</li>
<li><b class="key">Migration Hub Refactor Spaces</b>:<b class="key">Strangler Fig パターン</b>のための環境を構築(API Gateway/NLB・Transit Gateway・クロスアカウント構成を自動化)</li></ul>
<h4>大規模移行の進め方(ポイント)</h4>
<ol><li>Assess:ディスカバリ・TCO・7R 決定</li>
<li>Mobilize:ランディングゾーン構築・体制・スキル整備</li>
<li>Migrate &amp; Modernize:ウェーブ単位で移行</li></ol>
<p>AWS の移行支援プログラムとして <b class="key">MAP (Migration Acceleration Program)</b> があり、評価・動員・移行のクレジットや支援を受けられます。</p>
<span class="trap">落とし穴</span>:「依存するサーバー群を同時に移す」ためウェーブ計画が必要。依存関係を無視した個別移行はレイテンシ問題を招く。''',
ox=[('Migration Hub Strategy Recommendations は、アプリごとに推奨の移行戦略を提示する。',True,'分析に基づき 7R の推奨を提示する。'),
('Strangler Fig パターンのルーティング環境構築を支援するのは Migration Hub Orchestrator である。',False,'Refactor Spaces が該当。Orchestrator はワークフロー自動化。'),
('MAP は移行の評価・動員・実行フェーズを支援する AWS のプログラムである。',True,'クレジット等の支援を含む。')]),
dict(title='ランディングゾーンとマルチアカウント基盤',html='''<h4>ランディングゾーン</h4>
<p>移行先となる、<b class="key">セキュアで複数アカウントに分離された設計済み基盤</b>。移行前(Mobilize)に整えます。</p>
<table><tr><th>要素</th><th>サービス</th></tr>
<tr><td>全体構築・ガードレール</td><td><b class="key">AWS Control Tower</b>(Organizations・IAM Identity Center・Config・CloudTrail 等を自動構成)</td></tr>
<tr><td>新規アカウント払い出し</td><td><b class="key">Account Factory</b>(Service Catalog ベース。Account Factory for Terraform もあり)</td></tr>
<tr><td>予防的制御</td><td><b class="key">SCP</b>(予防)</td></tr>
<tr><td>発見的制御</td><td><b class="key">AWS Config ルール</b>(検出)</td></tr>
<tr><td>集約ログ</td><td>Log Archive アカウント、Audit アカウント</td></tr>
<tr><td>ネットワーク集約</td><td>Transit Gateway・共有サービス VPC・Direct Connect</td></tr></table>
<h4>設計の要点</h4>
<ul><li>Control Tower は<b class="key">Organizations が前提</b>。既存の Organization への導入も可能</li>
<li>OU 単位でコントロール(旧ガードレール)を適用。予防は SCP、検出は Config</li>
<li>カスタマイズが必要なら Customizations for Control Tower(CfCT)</li>
<li><span class="trap">落とし穴</span>:SCP は管理アカウントには効かない。許可を付与するものではなく上限を絞るもの</li></ul>''',
ox=[('Control Tower の予防的コントロールは SCP、発見的コントロールは AWS Config ルールで実装される。',True,'その通り。'),
('SCP は Organizations の管理アカウントにも適用される。',False,'管理アカウントには適用されない。'),
('ランディングゾーンは、移行を開始した後に整備するのが一般的である。',False,'移行前の Mobilize フェーズで整備する。')]),
])
