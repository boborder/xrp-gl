# XRP GL

DIDの詳細設計
Payment Channel設計
セキュリティ設計
setReglerKey、SiglerListSetの修正
NFT Mint機能修正
Paystring実装

DevnetでのDIDSetトランザクションの動作確認、ドキュメントの仕様設計
DIDSetトランザクションのDataフィールドにプロフィール情報をjson形式で追加するかipfsを使用する
AccountSetトランザクションの設定項目の追加
SignerListSet、SetReglerKeyトランザクションの追加（エラー）
Profile画面からDIDSetとDIDDeleteトランザクションをドキュメントの作成をPinataAPIで自動化
XUMMAPIのユーザストアに保存することで状態の保持
プロフィール画面の改良、項目追加、細かな変更
payment pointer用のデーターベースとサービス購入用の非同期ペイメントチャンネルの準備
vanityアドレスの生成機能（仮）追加
NFT Mint機能（仮）追加
擬似トランザクションで何かできないか？

## DID & Paystring

ダウンロードしてディレクトリに移動

```bash

gh repo clone boborder/xrp-gl
cd xrp-gl

```

bunとパッケージのインストール

```bash

# bunが無ければインストール
curl -fsSL https://bun.sh/install | bash

bun i

```

環境変数にAPI KEYとシークレットを設定
.env.localを作成する

```bash

mv example.env.local .env.local

```

```.env.local

XUMMAPI={API Key}
XUMMSECRET={Secret}
DATABASE_URL={DB URL}
PINATA_JWT={Pinata JWT}

```

ローカルで実行する
デフォルトは http://localhost:3000

```bash

bun dev

```

BuildしてCloudflare Pagesにデプロイ(edge runtimeを使用)

```bash

bun run deploy

```

Dockerでデプロイ(開発はローカル推奨)

```bash

docker-compose up

```

## Reference Docs
### [xrpl.org](https://xrpl.org/protocol-reference.html)
- xrplの公式サイト
### [xrpl.js](https://js.xrpl.org)
- xrplのクライアントライブラリ
### [Xumm Developer](https://docs.xumm.dev/)
- xumm sdk, xappの開発用
### [XRPL Standards](https://github.com/XRPLF/XRPL-Standards/discussions)
- xrplの新機能についての提案や仕様のディスカッション

### [Next.js](https://nextjs.org/docs)
- バックエンドも使えるreactの多機能フレームワーク
### [cloudflare pages](https://developers.cloudflare.com/pages/)
- 静的サイトまたはサーバーレスのデプロイ先のプラットフォーム
### [tailwindcss](https://tailwindcss.com/docs/installation)
- cssをインラインスタイルで記述できる
### [daisyUI](https://daisyui.com/components/)
- tailwindcssのコンポーネントが用意されていてレスポンシブ対応
