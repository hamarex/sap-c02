L = dict(id='2-2', title='高可用性とデータ層のマルチAZ設計', pages=[
('RDSとAuroraの可用性設計', '''<h4>RDS Multi-AZ の種類</h4><table><tr><th>構成</th><th>特徴</th></tr><tr><td>Multi-AZ DBインスタンス</td><td>別AZにスタンバイを同期レプリケーション。<b class="key">スタンバイは読み取り不可</b>。自動フェイルオーバー(通常60〜120秒)。エンドポイントのDNSが切り替わる</td></tr><tr><td><b class="key">Multi-AZ DBクラスター</b>(MySQL/PostgreSQL)</td><td>読み取り可能なスタンバイ2台(計3AZ)。フェイルオーバー通常35秒未満、書き込みレイテンシ改善</td></tr><tr><td>リードレプリカ</td><td>非同期。読み取りスケール用が主目的。DR用に昇格も可</td></tr></table>
<h4>Aurora</h4><ul><li>ストレージは<b class="key">3AZに6コピー</b>、クラスターボリュームを共有。書き込み4/6、読み取り3/6のクォーラム</li><li>リーダー(最大15)がそのままフェイルオーバー先。通常30秒以内に昇格</li><li><b class="key">RDS Proxy</b>：接続プールでフェイルオーバー時間を短縮(最大66%短縮と説明される)し、Lambdaからの大量接続も吸収</li><li><b class="key">Aurora Serverless v2</b>：ACU単位で秒単位にスケール。変動の大きいワークロード向け</li></ul>
<p><span class="trap">引っ掛け：RDSのMulti-AZ(インスタンス型)は「読み取りスケール」には使えない。読み取り分散が要件ならリードレプリカかAuroraリーダー。</span></p>''',
[('RDS Multi-AZ DBインスタンス構成のスタンバイは読み取りクエリに利用できる。',False,'インスタンス型のスタンバイは読み取り不可。読み取り可能なのはMulti-AZ DBクラスターやリードレプリカ。'),
('Auroraのストレージは3つのAZにまたがって6コピー保持される。',True,'AZ1つ障害でも書き込み継続、AZ+1障害でも読み取り可能なクォーラム設計。'),
('RDS ProxyはLambdaなど大量の短命接続からDBを保護するのに役立つ。',True,'接続をプールして再利用し、DBの接続数枯渇を防ぐ。')]),
('グローバルデータ設計：Aurora Global / DynamoDB / ElastiCache', '''<ul><li>Aurora Global Database：1プライマリ+最大5セカンダリリージョン。セカンダリは読み取り専用で、リージョン障害時に昇格(手動/マネージドフェイルオーバー)。<b class="key">リージョンをまたぐ低遅延リード</b>とDRの両方に使う。書き込み転送(write forwarding)でセカンダリから書き込みを転送できる</li><li>DynamoDB Global Tables：マルチリージョン・<b class="key">マルチアクティブ</b>。書き込みを各リージョンのローカルで受けたい要件はこちら。SLAは99.999%</li><li>ElastiCache for Redis(Valkey)：Multi-AZ+自動フェイルオーバーのレプリケーショングループ。<b class="key">Global Datastore</b>でクロスリージョン複製</li><li>MemoryDB：Redis互換の<b class="key">耐久性のあるプライマリDB</b>(マルチAZトランザクションログ)。キャッシュではなくDBとして使う場合</li></ul>
<h4>使い分け</h4><table><tr><th>要件</th><th>選択</th></tr><tr><td>リレーショナル+リージョン間DR/低遅延読み取り</td><td>Aurora Global Database</td></tr><tr><td>各リージョンでローカル書き込み(アクティブ-アクティブ)</td><td>DynamoDB Global Tables</td></tr><tr><td>耐久性ありのマイクロ秒読み取り+インメモリDB</td><td>MemoryDB</td></tr><tr><td>DBの前段キャッシュ</td><td>ElastiCache / DAX(DynamoDB専用)</td></tr></table>''',
[('Aurora Global Databaseのセカンダリリージョンは通常、読み取り専用である。',True,'書き込み転送を使えば書き込みをプライマリへ転送可能だが、セカンダリ自体は読み取り専用。'),
('各リージョンで同時にローカル書き込みを受けるリレーショナルDBにはAurora Global Databaseが最適である。',False,'マルチリージョンのマルチアクティブ書き込みはDynamoDB Global Tablesの特徴。'),
('MemoryDBはキャッシュ専用で、データの耐久性は保証されない。',False,'MemoryDBはマルチAZトランザクションログにより耐久性を持つプライマリDBとして使える。')]),
('Auto Scalingと疎結合による耐障害設計', '''<h4>Auto Scaling グループ(ASG)</h4><ul><li>複数AZのサブネットにまたがらせ、AZ障害時は残りのAZで自動的に再均衡</li><li>ヘルスチェック：EC2ステータス＋<b class="key">ELBヘルスチェックを有効化</b>するとアプリ層の異常も置換できる</li><li>スケーリングポリシー：ターゲット追跡(推奨：CPU 50%維持など)、ステップ、スケジュール(予測可能な負荷)、<b class="key">予測スケーリング</b>(周期的な負荷を機械学習で事前増強)</li><li><b class="key">ウォームプール</b>：事前初期化済みインスタンスを待機させ、起動の遅いアプリのスケールアウトを高速化</li><li>ライフサイクルフック：終了/起動前に処理を挟む(ログ退避など)</li><li>混合インスタンスポリシー：オンデマンド+スポットを組み合わせ</li></ul>
<h4>疎結合の原則</h4><ul><li>状態を持たせない(セッションはElastiCache/DynamoDBへ)</li><li>同期呼び出しの間に<b class="key">SQS</b>を挟んでバッファ。キュー長でスケール(<b class="key">バックログ/インスタンス</b>のカスタム指標)</li><li>単一障害点(SPOF)を排除：NAT GatewayはAZごと、など</li></ul>
<p><span class="trap">引っ掛け：「負荷の急増に対して間に合わない」ときは、スケーリング指標の見直しよりキューでバッファする、またはウォームプール・予測スケーリングが答えになることが多い。</span></p>''',
[('ASGでELBヘルスチェックを有効にすると、アプリケーションレベルの異常を検知したインスタンスも置き換えられる。',True,'デフォルトのEC2ヘルスチェックはインスタンスの稼働状態のみを見る。'),
('周期的に繰り返す負荷パターンには予測スケーリングが利用できる。',True,'過去の負荷から予測し、事前にキャパシティを確保する。'),
('NAT GatewayはリージョンあたりAZに関係なく1台で高可用性が確保される。',False,'NAT GatewayはAZ内で冗長だが、AZ障害に備えるには各AZに配置し、AZごとのルートテーブルで向ける。')]),
])
