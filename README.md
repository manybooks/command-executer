# Command Executer MCP Server

許可されたコマンドのみを実行できるMCPサーバー。

## 機能

- 設定ファイルで指定されたコマンドのみを実行可能
- コマンドの引数は制限なし
- セキュリティを考慮した実装
- 環境変数の自動設定（PATH、SHELL）

## インストール

```bash
git clone https://github.com/manybooks/command-executer.git
cd command-executer
npm install
npm run build
```

## 設定

Claude Desktopの設定ファイル（`~/Library/Application Support/Claude/claude_desktop_config.json`）に以下のように設定を追加します：

```json
{
  "mcpServers": {
    "command-executer": {
      "command": "node",
      "args": ["/path/to/command-executer/build/index.js"],
      "disabled": false,
      "autoApprove": ["execute_command"],
      "approvedCommands": ["ls", "pwd", "echo", "python"]
    }
  }
}
```

### 設定項目

- `command`: サーバーを実行するコマンド（通常は`node`）
- `args`: サーバーの実行ファイルへのパス
- `disabled`: サーバーを無効にするかどうか
- `autoApprove`: 自動承認するツール（`execute_command`を指定）
- `approvedCommands`: 実行を許可するコマンドのリスト（シンプルな文字列配列）

### 許可コマンドの追加

`approvedCommands`配列に実行を許可したいコマンドを追加します：

```json
"approvedCommands": [
  "ls",
  "pwd",
  "echo",
  "python",
  "npm"
]
```

## 使用例

Claudeで以下のようにコマンドを実行できます：

```
ls -la /path/to/directory
python script.py --arg1 value1
echo "Hello, World!"
```

## 実行環境

サーバーは以下の環境変数を自動的に設定します：

- `PATH`: システムのPATHに`/usr/local/bin`と`/opt/homebrew/bin`を追加
- `SHELL`: システムのデフォルトシェル（未設定の場合は`/bin/zsh`）

これにより、Homebrewでインストールされたコマンドなども正しく実行できます。

## セキュリティ

- 許可されたコマンドのみ実行可能
- コマンド実行時のタイムアウト（5秒）と最大バッファサイズ（1MB）を設定
- エラー時は簡潔なエラーメッセージを表示

## 開発

### ビルド

```bash
npm run build
```

### 型チェック

```bash
tsc --noEmit
```

## ライセンス

MIT
