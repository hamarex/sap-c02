import json
h=json.load(open('hint_v6.json'))
u={"783":"リージョンとフェイルオーバー","788":"マイクロサービスに分割","797":"仮想プライベートゲートウェイを 1 つ","829":"削除します。A社のAWS","834":"アプリケーションアカウントで、シークレット","842":"ジョブの使用のために、ap-southeast-2","844":"GuardDuty スキャン結果イベント","857":"接続を設定します。AWS DMSで","863":"予測するには、Migration Evaluator","865":"予測ベースロードに対応する","870":"ディストリビューションを設定します","874":"アプライアンスを含む検査 VPC","876":"選択を使用する新しい起動テンプレート","880":"SCP を組織のルートにアタッチします。aws:SourceOrgID","893":"Amazon S3バケットにデプロイ","903":"リージョン間リードレプリカを備えた","915":"デプロイします。AWS Glue DataBrew","918":"CloudFormation タスク定義を更新し、Compute","929":"AWS Step Functionsワークフロー","936":"渡します。オブジェクトへのアクセス権限","937":"StackSets の委任管理者"}
for k,v in u.items(): h[k]=v
# multi-answer replacements
h["825"]="インポート ジョブを作成 / 社内VPC内 / SCT で、変更データキャプチャ"
h["831"]="プライベートホストゾーンを作成 / 受信エンドポイントを作成 / プライベートホストゾーンドメイン"
h["853"]="AWS Lambda関数を / 権限を持つロール"
json.dump(h,open('hint_v6.json','w'),ensure_ascii=False,indent=0)
