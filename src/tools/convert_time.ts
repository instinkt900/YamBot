import { BotTool, BotToolParameter } from '.';
import { YamBot } from '../bot';

class ConvertUnixTimeToolImpl implements BotTool {
    get description(): string {
        return 'converts the unix time to a human readable format';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {
            timestamp: { type: 'number', description: 'the unix timestamp to convert' }
        };
    }
    async execute(_bot: YamBot, timestamp: number): Promise<string> {
        return new Date(timestamp * 1000).toISOString();
    }
}

export const ConvertUnixTimeTool = new ConvertUnixTimeToolImpl();
