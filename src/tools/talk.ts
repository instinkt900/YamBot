import { BotTool, BotToolParameter } from '.';
import { YamBot } from '../bot';

class TalkToolImpl implements BotTool {
    get description(): string {
        return 'says something in the channel';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {
            message: { type: 'string', description: 'what to say' }
        };
    }
    async execute(bot: YamBot, message: string): Promise<string> {
        bot.say?.(message);
        return '';
    }
}

export const TalkTool = new TalkToolImpl();
