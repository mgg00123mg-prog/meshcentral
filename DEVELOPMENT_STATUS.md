# MeshCentral リモート管理システム構築状況

## 次回再開時のコマンド（コピペでOK）

### Claude Codeに伝える内容
```
MeshCentralの続きをやりたい。
/Users/kotarokashiwai/meshcentral/DEVELOPMENT_STATUS.md を読んで状況を把握して。

前回の問題:
- 新しいエージェント（192.168.128.54）がサーバーに接続できない
- `MeshAgent.exe run`で詳細ログを確認する予定だった

まず `MeshAgent.exe run` の結果を確認して、問題を解決してください。
```

### Windows PC側で最初に実行するコマンド
```cmd
:: エージェントの詳細ログを表示
net stop "Mesh Agent"
"C:\Program Files\Mesh Agent\MeshAgent.exe" run
```

### Render.comログ確認
1. https://dashboard.render.com/ にログイン
2. meshcentralサービス → Logs タブ

### MeshCentral Web画面
- URL: https://meshcentral-uz6d.onrender.com/

---

## 目的
- 41台のWindows PCを一括リモート管理
- Chrome Remote Desktopを1回だけ使ってMeshAgentをインストール
- その後はMeshCentral Web画面から全て管理

## サーバー情報
| 項目 | 値 |
|------|-----|
| URL | https://meshcentral-uz6d.onrender.com/ |
| デプロイ先 | Render.com |
| GitHub | https://github.com/mgg00123mg-prog/meshcentral.git |
| ローカルパス | /Users/kotarokashiwai/meshcentral/ |
| MeshCentralバージョン | v1.1.55 |

## 環境変数（Render.com）
| Key | Value | 説明 |
|-----|-------|------|
| FORCE_CONFIG_RESET | false | trueにすると証明書とDBをリセット |
| SESSION_KEY | net8meshcentral2024secretkey32 | セッション暗号化キー |

## 現在の問題点（2025/12/26時点）

### 1. 証明書ハッシュ不一致
- サーバー証明書ハッシュ: `62460cf73d`
- 古いエージェント証明書ハッシュ: `28ce4aefa2`
- 別PC（IP: 128.28.105.158）から古いエージェントが接続試行中

### 2. 新しいエージェントが接続できない
- 作業中PC IP: `192.168.128.54`
- .mshファイルには新しいServerIDあり
- ServerID: `8F2CADE8BD3B132AD2884A8605F95AB61B0FADBB46FDD599DB7FB6109281D6735F8C7D9CB08E74269524D49961520F5E`
- `MeshAgent.exe connect`実行すると「Connecting to: wss://meshcentral-uz6d.onrender.com:443/agent.ashx」と表示
- しかし、サーバーログには新しい接続が来ない
- `MeshAgent.exe -state`で「Unable to contact Mesh Agent...」エラー

## 作成したファイル

### 1. /Users/kotarokashiwai/meshcentral/start.js
カスタムスターター。FORCE_CONFIG_RESET=trueで証明書とDBをリセット可能。

### 2. /Users/kotarokashiwai/meshcentral/Dockerfile
Render.com用Dockerイメージ。Node.js 20ベース。

### 3. /Users/kotarokashiwai/meshcentral/config.template.json
MeshCentral設定テンプレート。

### 4. /Users/kotarokashiwai/net8_rebirth/net8/02.ソースファイル/net8_html/api/meshcentral_api.php
NET8からMeshCentralを制御するAPI。

## API認証情報
```
User: ~t:7eLkNoMAbtwTEuFY
Secret: tPCNs8rp7wA0Y81CcHpN
```

## 次回やるべきこと

### 優先度高
1. `MeshAgent.exe run`でエージェントの詳細ログを確認
2. ネットワーク/ファイアウォールの問題確認
3. 別PC（128.28.105.158）の古いエージェントを削除またはアップデート

### 代替案（解決しない場合）
- RustDesk: オープンソース、シンプル、自己ホスト可能
- Tailscale + RDP: VPN不要で全PCにアクセス可能

## Windows PCでのエージェントインストール手順

### 1. 古いエージェント削除
```cmd
net stop "Mesh Agent"
"C:\Program Files\Mesh Agent\MeshAgent.exe" -uninstall
rmdir /s /q "C:\Program Files\Mesh Agent"
```

### 2. 新しいエージェントインストール
1. https://meshcentral-uz6d.onrender.com/ にログイン
2. デバイスグループ「net8_slot」を選択
3. 「Add Agent」→「Windows」→ダウンロード
4. 管理者として実行

### 3. 確認コマンド
```cmd
sc query "Mesh Agent"                                    # サービス状態
"C:\Program Files\Mesh Agent\MeshAgent.exe" -state       # エージェント状態
"C:\Program Files\Mesh Agent\MeshAgent.exe" connect      # 手動接続テスト
"C:\Program Files\Mesh Agent\MeshAgent.exe" run          # 詳細ログ付き実行
```

## トラブルシューティング履歴

### 試したこと
1. ✅ Render.comにデプロイ
2. ✅ 管理者アカウント作成
3. ✅ Render Disk設定（データ永続化）
4. ✅ FORCE_CONFIG_RESET=trueで証明書リセット
5. ✅ エージェント完全削除・再インストール
6. ✅ MeshAgent.db削除
7. ❌ 新しいエージェントがサーバーに接続できない

### ログで確認したこと
- サーバーは正常起動（ポート10000、エイリアス443）
- 古いエージェントからの接続試行は検出されている
- 新しいエージェントからの接続はログに表示されない

## 更新日
2025年12月26日
