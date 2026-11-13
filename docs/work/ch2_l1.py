L = dict(id='2-1', title='DR戦略とRTO/RPO', pages=[
('RTOとRPO、DR4戦略の全体像', '''<h4>RTO と RPO</h4><ul><li>RTO(Recovery Time Objective)＝障害発生から<b class="key">サービス復旧までに許容される時間</b></li><li>RPO(Recovery Point Objective)＝<b class="key">許容できるデータ損失の時間幅</b>(最後の復旧可能時点から障害までの時間)</li><li>RPOが小さい → レプリケーションの頻度/同期性が重要。RTOが小さい → 待機環境の準備度が重要</li></ul>
<h4>DR 4戦略(コストが低い順＝復旧が遅い順)</h4><table><tr><th>戦略</th><th>RTO/RPO目安</th><th>内容</th></tr><tr><td>Backup &amp; Restore</td><td>時間〜日</td><td>バックアップを別リージョンへコピー。障害時にIaC等で環境を再構築</td></tr><tr><td>Pilot Light</td><td>数十分〜時間</td><td>DBなど<b class="key">コアのみ常時稼働・レプリケーション</b>。アプリ層は停止/最小。障害時に起動・拡張</td></tr><tr><td>Warm Standby</td><td>分</td><td><b class="key">縮小版のフル環境</b>が常時稼働。障害時にスケールアウトして切替</td></tr><tr><td>Multi-site Active/Active</td><td>ほぼゼロ</td><td>複数リージョンが<b class="key">同時に本番トラフィック</b>を処理。最高コスト</td></tr></table>
<p><span class="trap">引っ掛け：Pilot Lightは「アプリサーバーも動いている」のではなく、データ層だけが動いている状態。Warm Standbyは「すでに処理できる縮小環境」がある点で異なる。</span></p>''',
[('RPOとは、障害発生から復旧完了までに許容される時間のことである。',False,'それはRTO。RPOは許容できるデータ損失の時間幅。'),
('Pilot Lightでは、データ層を常時レプリケーションし、アプリ層は障害時に起動・拡張する。',True,'コアのみ稼働させる戦略で、Warm Standbyより低コスト・復旧は遅い。'),
('Multi-site Active/Activeは4戦略の中で最もコストが低い。',False,'複数リージョンで本番を同時稼働するため最もコストが高い。')]),
('サービス別のDR機能(RDS/Aurora/DynamoDB/S3/EBS)', '''<h4>データ層のクロスリージョン複製</h4><table><tr><th>サービス</th><th>機能</th><th>特徴</th></tr><tr><td>Aurora</td><td><b class="key">Aurora Global Database</b></td><td>ストレージレベルで複製、通常<b class="key">1秒未満のレイテンシ</b>。リージョン障害時にセカンダリを昇格(RTO 通常1分未満を目安に分単位)。RPOは秒単位</td></tr><tr><td>RDS</td><td>クロスリージョンリードレプリカ</td><td>非同期。昇格して単独DBにできる(昇格後は元に戻せない)</td></tr><tr><td>DynamoDB</td><td><b class="key">Global Tables</b></td><td>マルチリージョン・マルチアクティブ。どのリージョンでも書き込み可、最終的に整合(同一項目の競合は最終書き込み勝ち)</td></tr><tr><td>S3</td><td>CRR(クロスリージョンレプリケーション)</td><td>非同期。<b class="key">S3 Replication Time Control(RTC)</b>で15分以内に99.99%のオブジェクトを複製するSLA</td></tr><tr><td>EBS</td><td>スナップショットのコピー</td><td>Data Lifecycle Managerで自動化、クロスリージョンコピー可</td></tr></table>
<ul><li>AWS Elastic Disaster Recovery(DRS)：オンプレ/他クラウド/AWSのサーバーをブロックレベルで継続レプリケーションし、<b class="key">数分のRTO・秒単位のRPO</b>でAWSへフェイルオーバー。Pilot Light的な低コスト構成</li><li>AWS Backup：クロスリージョン/クロスアカウントのバックアップ集中管理、<b class="key">Backup Vault Lock</b>でWORM保護(ランサムウェア対策)</li></ul>''',
[('Aurora Global Databaseはセカンダリリージョンへ通常1秒未満の遅延でストレージレベル複製する。',True,'低RPO・低RTOのリージョン間DRに適する。'),
('DynamoDB Global Tablesは書き込みをプライマリリージョンだけに限定する。',False,'マルチアクティブで、どのレプリカリージョンでも書き込み可能。'),
('S3 RTCを有効にすると、複製のSLAとして15分以内に99.99%のオブジェクトが複製される。',True,'RTCは追加料金で複製時間のSLAとメトリクスを提供する。')]),
('フェイルオーバーの仕組みとDR設計の判断基準', '''<h4>トラフィック切替</h4><ul><li>Route 53 フェイルオーバールーティング：ヘルスチェックで障害検知しDNSをセカンダリへ。DNSのため<b class="key">TTLとクライアントキャッシュの影響</b>を受ける</li><li>Global Accelerator：Anycast<b class="key">固定IP</b>で、DNSキャッシュに依存せず<b class="key">数十秒で別リージョンのエンドポイントへ切替</b>。固定IPが必要/切替を速くしたい場面で有利</li><li><b class="key">Route 53 Application Recovery Controller(ARC)</b>：ルーティングコントロールとレディネスチェックで、安全にフェイルオーバーを実施(データプレーンの高可用な制御)</li></ul>
<h4>判断の流れ</h4><ol><li>RTO/RPOを確認 → 戦略を決定(RPOがほぼ0ならスナップショットでなく同期/準同期レプリケーション)</li><li>コスト制約が強く、RTOが時間単位OK → Backup&amp;Restore/Pilot Light</li><li>分単位のRTO → Warm Standby、ほぼ無停止 → Multi-site</li></ol>
<p><span class="trap">引っ掛け：「マルチAZ」はAZ障害対策であり、リージョン障害の備えではない。リージョン障害に備える要件があるときは必ずクロスリージョン構成を選ぶ。また、DR構成は定期的なフェイルオーバー訓練をしないと有効性を保証できない。</span></p>''',
[('マルチAZ配置だけで、リージョン全体の障害に備えたことになる。',False,'AZ障害には有効だが、リージョン障害にはクロスリージョン構成が必要。'),
('DNSキャッシュに左右されずに素早くリージョン間で切り替えたい場合、Global Acceleratorが有効である。',True,'固定のAnycast IPを使うため、クライアントのDNSキャッシュの影響を受けない。'),
('AWS Elastic Disaster Recoveryは、サーバーを継続的にレプリケーションしAWSへ迅速にフェイルオーバーできる。',True,'ブロックレベルの継続レプリケーションで低RPO・数分のRTOを実現する。')]),
])
