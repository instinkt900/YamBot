import { BotTool, BotToolParameter } from './bot_tool.js';
import { YamBot } from '../bot.js';

export class DoNothingToolImpl implements BotTool {
    get description(): string {
        return 'does nothing';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {};
    }
    async execute(_bot: YamBot): Promise<string> {
        return '';
    }
}
