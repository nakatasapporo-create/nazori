なぞりのじかん — PWA配布版

このZIPにはPWAの動作に必要なファイル一式が入っています。
ChatGPTのサイトへ移動するリンクや、ChatGPTへのログイン処理は含んでいません。

【重要：単体HTMLとの違い】
PWAは「ファイル」アプリでHTMLを開くだけではインストールできません。
ZIPを展開し、すべてのファイルとフォルダーを同じHTTPSのWebサーバーに配置してください。
index.htmlだけをアップロードした場合は、PWAとして動作しません。

【公開する方の手順】
1. このZIPを展開します。
2. index.html、sw.js、manifest.webmanifest、各JSファイル、data/、fonts/、icons/を、フォルダー構成を変えずに配置します。
   ドメイン直下でも /nazori/ などのサブフォルダーでも使えます。
3. HTTPSのURLで index.html が開くことを確認します。
4. sw.js はJavaScriptとして、manifest.webmanifest はJSONとして配信してください。
   sw.jsのContent-Type：text/javascript または application/javascript
   manifest.webmanifestのContent-Type：application/manifest+json
   存在しないファイルをindex.htmlに置き換える設定で、JSなどがHTMLとして返らないようにしてください。
5. 教材は端末内で処理されます。アプリ自体にChatGPTのログイン・外部API呼び出しはありません。
   公開範囲は学校や組織の運用方針に合わせてサーバー側で設定してください。

【iPadで使う手順】
1. インターネット接続中にSafariで、配置したHTTPSのURLを開きます。
2. 共有 →「ホーム画面に追加」→「追加」を選びます。
   「Webアプリとして開く」が表示されたらオンにします。
3. ホーム画面に追加したアイコンから、一度オンラインで起動します。
4. 右上の「せってい」を約1秒長押しし、「オフライン準備完了」を確認します。
   Safariでの準備だけでなく、追加したアイコンから開いた画面で確認してください。
5. アプリを終了し、機内モードにしてから、そのアイコンでもう一度起動して確認してください。
   なぞり書き・形の判定・全172文字の書き順アニメーションは端末に保存した教材を使用します。
   読み上げは端末の日本語音声に依存します。日本語音声を端末に用意してください。

【うまくいかない場合】
・「公開版アプリを開いてください」と出る：前の単体HTML版です。このZIPのindex.htmlに置き換えてください。
・「オフライン準備を完了できません」と出る：HTTPS、ファイル一式の配置、サーバーのContent-Typeを確認してください。
・前の画面が出る：オンラインで開き、設定内の「準備を確認」→「更新して開き直す」を使ってください。
・ファイルを削除したり端末のWebサイトデータを消した場合は、もう一度オンラインで準備してください。

【この配布版に含むもの】
index.html：学習画面
manifest.webmanifest：ホーム画面インストール用の設定
sw.js：教材を保存してオフラインで開くためのプログラム
pwa.js：PWAの登録・準備状態の表示
app.js / scoring.js / stroke-guide.js：なぞり・判定・書き順再生
data/：全172文字の書き順とライセンス
fonts/：文字選択用フォントとライセンス
icons/：ホーム画面用アイコン

【動作確認の範囲】
必要ファイルの同梱、相対パス、オフライン読み込みのロジックを確認しています。
iPad実機でのインストール・オフライン起動は未確認です。

【ライセンス】
書き順データ：KanjiVG / CC BY-SA 3.0（data/KANJIVG-LICENSE.txt）
フォント：Klee One / SIL OFL（fonts/OFL.txt）

PWAの配信条件に関する参考：
https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
