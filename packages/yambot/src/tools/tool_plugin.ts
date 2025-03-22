import { BotTool } from './bot_tool.js';

export interface ToolPlugin {
    getPlugins(): Record<string, BotTool>;
}
