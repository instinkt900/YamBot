import { Tool } from 'openai/resources/responses/responses';
import { GetTestTool } from './get_test';
import { YamBot } from '../bot';

export interface BotToolParameter {
    type: string;
    description: string;
}

export interface BotTool {
    get description(): string;
    get parameters(): { [key: string]: BotToolParameter };
    execute(bot: YamBot, ...args: any[]): Promise<string> | undefined;
}

const activeTools: Record<string, BotTool> = {
    getTest: GetTestTool
};

export function getTools(): Array<Tool> {
    const tools = new Array<Tool>();
    for (const [toolName, tool] of Object.entries(activeTools)) {
        tools.push({
            type: 'function',
            name: toolName,
            parameters: {
                type: 'object',
                properties: tool.parameters,
                required: Object.keys(tool.parameters),
                additionalProperties: false
            },
            strict: true,
            description: tool.description
        });
    }
    return tools;
}

export function executeTool(
    bot: YamBot,
    toolName: string,
    args: { [key: string]: any }
): Promise<string> | undefined {
    const tool = activeTools[toolName];
    if (tool) {
        const params = [];
        for (const paramName of Object.keys(tool.parameters)) {
            const parameterValue = args[paramName];
            if (!parameterValue) {
                console.log(
                    `Tried calling tool ${toolName} with incorrect parameters. Got ${JSON.stringify(args)}`
                );
                return;
            }
            params.push(args[paramName]);
        }
        return tool.execute(bot, ...params);
    }
    console.log(`Unknown tool call: ${toolName}`);
    return;
}
