from ch3_common import build
pages = [
('CloudFormation の更新・失敗・保護', '''
<ul>
<li>{k|変更セット（Change Set）}：更新前に影響（追加/変更/{k|置換 Replacement}/削除）を確認。本番更新の定石</li>
<li>{k|DeletionPolicy}：Retain / Snapshot（RDS、EBS等）/ Delete。{k|UpdateReplacePolicy}は更新で{k|置換}された旧リソースの扱い。DBは両方 Snapshot or Retain にしてデータ消失を防ぐ</li>
<li>{k|スタックポリシー}：更新時に特定リソースの変更を禁止。{k|終了保護}：スタック削除の誤操作防止</li>
<li>{k|ロールバック}：作成失敗→ROLLBACK_COMPLETE（再作成するには削除が必要）。更新失敗→UPDATE_ROLLBACK_COMPLETE。ロールバック自体が失敗（UPDATE_ROLLBACK_FAILED）したら、原因を直して{k|ContinueUpdateRollback}（問題リソースをスキップ可能）</li>
<li>{k|CreationPolicy + cfn-signal}：EC2/ASGでアプリの起動完了シグナルを待つ（WaitConditionより推奨）。タイムアウト時は作成失敗</li>
<li>{k|カスタムリソース}：テンプレートにない処理をLambda等で実装。応答（ResponseURLへ）を返さないと{t|最大1時間ハング}するので、必ずSUCCESS/FAILEDを返す（削除時も）</li>
<li>{k|ネストスタック}：共通部品の再利用・500リソース上限の回避。{k|クロススタック参照}はExport/Fn::ImportValue（{t|参照されているExportは削除・変更不可}）</li>
<li>{k|動的参照}：{{resolve:ssm:...}}、{{resolve:secretsmanager:...}}でテンプレートに秘密値を直書きしない</li>
</ul>
''', [
 ('変更セットを使うと、スタック更新の実行前にリソースが置換されるかどうかを確認できる。', True, '変更セットは追加/変更/削除と置換の有無を事前に提示する。'),
 ('他のスタックからImportValueされているExport値は、そのスタックを更新して削除できる。', False, '参照されている間はExportの削除・変更はできない。'),
 ('カスタムリソースのLambdaが応答をResponseURLに返さないと、スタック操作が長時間ハングすることがある。', True, '成功/失敗を必ず返す。削除イベントでも返す。'),
]),
('StackSets とマルチアカウント展開', '''
<ul>
<li>{k|StackSets}：1つのテンプレートを{k|複数アカウント × 複数リージョン}へ一括デプロイ・更新</li>
<li>{k|サービスマネージド}権限：AWS Organizationsと統合。OU単位で指定し、{k|自動デプロイ}（新規アカウントがOUに入ると自動適用）。IAMロールの事前作成不要。管理アカウントまたは{k|委任管理者}から実行</li>
<li>{k|セルフマネージド}権限：管理者アカウントに AWSCloudFormationStackSetAdministrationRole、ターゲットに AWSCloudFormationStackSetExecutionRole を自分で用意。Organizations外のアカウントにも使える</li>
<li>{k|オペレーション設定}：同時実行アカウント数、障害許容数/率、リージョン順序でリスクを抑えた段階展開</li>
<li>用途：全アカウントへのConfigルール、CloudTrail、IAMロール、ガードレールの一括展開</li>
<li>{k|Control Tower}：ランディングゾーン構築とガードレール（予防SCP/検出Config）を自動化。アカウントの量産は{k|Account Factory}</li>
</ul>
<table>
<tr><th>要件</th><th>手段</th></tr>
<tr><td>新規アカウント作成時に自動でベースライン適用</td><td>StackSets（サービスマネージド+自動デプロイ）/ Control Tower</td></tr>
<tr><td>複数リージョンに同一スタック</td><td>StackSets</td></tr>
<tr><td>承認済みテンプレートだけを開発者に提供</td><td>Service Catalog</td></tr>
</table>
<p>{t|引っ掛け}：「各アカウントで手動実行」「アカウント毎にスクリプト」より、組織統合のStackSetsが運用負荷最小。</p>
''', [
 ('StackSetsのサービスマネージド権限では、OUに自動デプロイを有効にすると、後からOUに追加された新規アカウントにも自動でスタックが展開される。', True, 'Organizations統合の自動デプロイ機能。'),
 ('StackSetsはOrganizations配下のアカウントにしか使えない。', False, 'セルフマネージド権限なら、Organizations外のアカウントにも展開できる。'),
 ('StackSetsのオペレーション設定で、同時デプロイ数や障害許容数を指定して段階的に展開できる。', True, 'Maximum concurrent accounts と Failure tolerance。'),
]),
('ドリフト検出とリソースインポート', '''
<ul>
<li>{k|ドリフト}＝CloudFormationの外（コンソールやCLI）で行われた手動変更による、実際の設定とテンプレートの差異</li>
<li>{k|ドリフト検出}：スタック/リソース単位で実行し、IN_SYNC / DRIFTED を判定。{t|検出するだけで自動修復はしない}。修復は、手動変更を戻す、またはテンプレート側を更新して反映</li>
<li>StackSetsにもドリフト検出がある。{k|定期的な検出}はEventBridge + Lambda / Config（cloudformation-stack-drift-detection-check ルール）で自動化</li>
<li>{k|リソースインポート}：既存リソースをスタックの管理下に取り込む（DeletionPolicyの指定が必要）。IaC化の移行に使う</li>
<li>{k|Config}はスタック外の変更も含め全リソースの設定変更を記録。CloudFormationドリフトは「テンプレートとの差」、Configは「時系列の変更履歴・ルール評価」</li>
<li>予防策：本番のIAMから直接変更権限を外し、変更はパイプライン経由のみにする（SCP / IAM）</li>
</ul>
<h4>ドリフト検出が検出しにくい/できないもの</h4>
<ul>
<li>すべてのリソースタイプが対象ではない（非対応タイプあり）</li>
<li>テンプレートに明示していないプロパティの既定値からの変更は、対象外のことがある</li>
</ul>
''', [
 ('CloudFormationのドリフト検出は、検出したドリフトを自動的にテンプレートの内容へ修復する。', False, '検出のみで自動修復はしない。'),
 ('既存リソースを後からCloudFormation管理下に置くには、リソースインポートを使う。', True, 'インポート対象にはDeletionPolicyとリソース識別子が必要。'),
]),
('CDK・SAM・Service Catalog の位置づけ', '''
<ul>
<li>{k|AWS CDK}：TypeScript/Python/Java等のプログラミング言語でインフラを定義し、{k|cdk synth}でCloudFormationテンプレートを生成、{k|cdk deploy}で展開。最終的にCloudFormationスタックになる（＝ロールバック、ドリフト検出が使える）</li>
<li>コンストラクト：{k|L1}（CFNリソースそのまま、Cfn接頭辞）/ {k|L2}（既定値・便利メソッド付き）/ {k|L3（パターン）}（複数リソースのまとまり）</li>
<li>{k|cdk bootstrap}：環境（アカウント/リージョン）ごとに、アセット用S3やデプロイ用ロールを作る前提作業</li>
<li>{k|AWS SAM}：サーバーレス向けのCloudFormation拡張（Transform: AWS::Serverless-2016-10-31）。{k|sam local}でローカルテスト、{k|sam deploy}。CodeDeployと連携してLambdaのカナリア（DeploymentPreference）を簡単に実装</li>
<li>{k|Service Catalog}：承認済みテンプレート（製品）のポートフォリオを提供し、エンドユーザーはセルフサービスで起動。{k|起動制約}（Launch constraint）のIAMロールで、ユーザー本人に強い権限を与えずにデプロイさせる</li>
<li>{k|Terraform}等もあるが、試験の選択肢の基本はCloudFormation/CDK</li>
</ul>
<h4>判断</h4>
<ul>
<li>「開発者がループや条件を使い、既存言語で記述したい」→ CDK</li>
<li>「サーバーレスアプリを簡潔に」→ SAM</li>
<li>「統制された構成のセルフサービス提供」→ Service Catalog</li>
<li>「全アカウントに一括」→ StackSets</li>
</ul>
''', [
 ('AWS CDKで定義したインフラは、デプロイ時にCloudFormationテンプレートに変換され、CloudFormationスタックとして管理される。', True, 'cdk synthでテンプレート生成、デプロイはCloudFormation経由。'),
 ('Service Catalogの起動制約を使うと、エンドユーザー本人に広い権限を付与しなくても承認済み製品を起動させられる。', True, '起動制約のIAMロールで製品をプロビジョニングする。'),
 ('CDKのL1コンストラクトは、既定値や便利メソッドが豊富に用意された高レベルの抽象化である。', False, 'L1はCloudFormationリソースそのもの（Cfn接頭辞）。高レベルなのはL2/L3。'),
]),
]
LESSON, OX = build('3-4', 'IaCと構成管理（CloudFormation / StackSets / CDK）', pages)
