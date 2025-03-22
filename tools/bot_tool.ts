import { YamBot } from '../bot';

export interface BotToolParameter {
    type: string;
    description: string;
}

export interface BotTool {
    get description(): string;
    get parameters(): { [key: string]: BotToolParameter };
    execute(bot: YamBot, ...args: any[]): Promise<string>;
}
