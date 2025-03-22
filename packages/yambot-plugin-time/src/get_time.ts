import { YamBot, BotTool, BotToolParameter } from 'yambot';

export class GetTimeTool implements BotTool {
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
