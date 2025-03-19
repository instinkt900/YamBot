import { BotTool, BotToolParameter } from '.';
import { YamBot } from '../bot';

class DoNothingToolImpl implements BotTool {
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

export const DoNothingTool = new DoNothingToolImpl();
