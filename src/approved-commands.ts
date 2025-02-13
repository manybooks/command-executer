import * as fs from "fs";
import * as path from "path";

interface McpServerConfig {
  mcpServers: {
    "command-executer": {
      approvedCommands: string[];
    };
  };
}

function getConfigPath(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  if (!homeDir) {
    throw new Error("ホームディレクトリが見つかりません");
  }

  return path.join(homeDir, "Library/Application Support/Claude/claude_desktop_config.json");
}

function loadApprovedCommands(): string[] {
  try {
    const configPath = getConfigPath();
    const configContent = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent) as McpServerConfig;
    return config.mcpServers["command-executer"].approvedCommands;
  } catch (error) {
    console.error("警告: 許可コマンドの設定の読み込みに失敗しました:", error);
    return [];
  }
}

const approvedCommands = loadApprovedCommands();

export function isCommandApproved(command: string): boolean {
  if (approvedCommands.length === 0) {
    return false;
  }

  const commandParts = command.trim().split(" ");
  const baseCommand = commandParts[0];

  // ベースコマンドが許可リストにあるか確認
  return approvedCommands.includes(baseCommand);
}
