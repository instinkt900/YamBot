import { BotTool } from './bot_tool';

export interface ToolPlugin {
    getPlugins(): Record<string, BotTool>;
}
