import { BotTool, BotToolParameter } from './bot_tool.js';
import { YamBot } from '../bot.js';

export class TalkToolImpl implements BotTool {
    get description(): string {
        return 'says something in the channel';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {
            message: { type: 'string', description: 'what to say' }
        };
    }
    async execute(bot: YamBot, message: string): Promise<string> {
        bot.talk(message);
        return '';
    }
}
