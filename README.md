# Command Executer MCP Server

許可されたコマンドのみを実行できるMCPサーバー。

## 機能

- 設定ファイルで指定されたコマンドのみを実行可能
- コマンドの引数は制限なし
- セキュリティを考慮した実装
- 複数のシェル設定ファイルをサポート

## インストール

```bash
git clone [repository-url]
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
      "approvedCommands": ["ls", "pwd", "echo", "python"],
      "options": {
        "shellConfigPaths": ["~/.zshrc", "~/.zshenv"],
        "shell": "/bin/zsh"
      }
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
- `options`: シェル実行に関する設定
  - `shellConfigPaths`: 読み込むシェル設定ファイルのパス（配列）
  - `shell`: 使用するシェル（デフォルト: `/bin/zsh`）

### シェル設定

シェル設定ファイルは以下のように指定できます：

```json
"options": {
  // 単一の設定ファイル
  "shellConfigPaths": ["~/.zshrc"],

  // 複数の設定ファイル（順番に読み込まれます）
  "shellConfigPaths": ["~/.zshenv", "~/.zshrc", "~/.zshrc.local"],

  // デフォルト値
  // shellConfigPathsが指定されていない場合は["~/.zshrc"]が使用されます
  // shellが指定されていない場合は"/bin/zsh"が使用されます
}
```

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

サーバーは設定ファイルで指定されたシェル設定を読み込んでコマンドを実行します：

1. 指定された順序で全てのシェル設定ファイルを読み込み
2. 環境変数やエイリアスなどが利用可能な状態でコマンドを実行
3. 指定されたシェル（デフォルト: `/bin/zsh`）を使用

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
