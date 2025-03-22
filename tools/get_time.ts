import { BotTool, BotToolParameter } from './bot_tool';
import { YamBot } from '../bot';

class GetTimeToolImpl implements BotTool {
    get description(): string {
        return 'gets the current time as unix epoch time';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {};
    }
    async execute(_bot: YamBot): Promise<string> {
        return `${Date.now() / 1000}`;
    }
}

export const TimeTool = new GetTimeToolImpl();
