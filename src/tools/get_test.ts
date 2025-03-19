import { BotTool, BotToolParameter } from '.';
import { YamBot } from '../bot';

class GetTestToolImpl implements BotTool {
    get description(): string {
        return 'gets the current test value';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {
            first_value: { type: 'string', description: 'the first input' },
            second_value: { type: 'number', description: 'the second input' }
        };
    }
    async execute(bot: YamBot, first: string, second: number): Promise<string> {
        return 'red-' + first + '-' + second;
    }
}

export const GetTestTool = new GetTestToolImpl();
