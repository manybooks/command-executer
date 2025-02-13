#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import { isCommandApproved } from "./approved-commands.js";

const execAsync = promisify(exec);

class CommandExecuterServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "command-executer-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {
            execute_command: {
              requiresApproval: true,
              description: "許可されたコマンドのみを実行します",
            },
          },
        },
      }
    );

    this.setupToolHandlers();

    this.server.onerror = (error: Error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "execute_command",
          description: "許可されたコマンドのみを実行します",
          inputSchema: {
            type: "object",
            properties: {
              command: {
                type: "string",
                description: "実行するコマンド",
              },
            },
            required: ["command"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: { params: { name: string; arguments?: Record<string, unknown> }; method: string }) => {
        if (request.params.name !== "execute_command") {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }

        const { command } = request.params.arguments as { command: string };

        if (!command || typeof command !== "string") {
          throw new McpError(ErrorCode.InvalidParams, "コマンドが指定されていないか、無効な形式です。");
        }

        if (!isCommandApproved(command)) {
          return {
            content: [
              {
                type: "text",
                text: `エラー: コマンド '${command}' は許可されていません。設定ファイルで許可されたコマンドのみ実行できます。`,
              },
            ],
            isError: true,
          };
        }

        try {
          // 環境変数PATHに/usr/local/binを追加
          const env = {
            ...process.env,
            PATH: `${process.env.PATH}:/usr/local/bin:/opt/homebrew/bin`,
            SHELL: process.env.SHELL || "/bin/zsh",
          };

          const { stdout, stderr } = await execAsync(command, {
            timeout: 5000, // 5秒でタイムアウト
            maxBuffer: 1024 * 1024, // 1MB
            env,
          });
          return {
            content: [
              {
                type: "text",
                text: stdout || stderr,
              },
            ],
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "不明なエラー";
          // エラーメッセージからコマンドの部分を抽出
          const cmdError = errorMessage.replace(/^Command failed: /, "");
          return {
            content: [
              {
                type: "text",
                text: cmdError,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Command Executer MCP server running on stdio");
  }
}

const server = new CommandExecuterServer();
server.run().catch(console.error);
