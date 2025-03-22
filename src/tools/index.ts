import { Tool } from 'openai/resources/responses/responses';
import { YamBot } from '../bot';
import { DoNothingTool } from './do_nothing';
import { TalkTool } from './talk';
import { AddReminderTool, ClearRemindersTool, GetRemindersTool } from './reminder';
import { TimeTool } from './get_time';
import { ConvertUnixTimeTool } from './convert_time';
import { AddGameMentionTool, GetGameMentionsTool, RemoveGameMentionTool } from './games';

export interface BotToolParameter {
    type: string;
    description: string;
}

export interface BotTool {
    get description(): string;
    get parameters(): { [key: string]: BotToolParameter };
    execute(bot: YamBot, ...args: any[]): Promise<string>;
}

const activeTools: Record<string, BotTool> = {
    doNothing: DoNothingTool,
    talk: TalkTool,
    getTime: TimeTool,
    convertTime: ConvertUnixTimeTool,
    addReminder: AddReminderTool,
    getReminders: GetRemindersTool,
    clearReminders: ClearRemindersTool,
    addGameMention: AddGameMentionTool,
    removeGameMention: RemoveGameMentionTool,
    getGameMentions: GetGameMentionsTool
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

export async function executeTool(
    bot: YamBot,
    toolName: string,
    args: { [key: string]: any }
): Promise<string> {
    const tool = activeTools[toolName];
    if (tool) {
        const params = [];
        for (const paramName of Object.keys(tool.parameters)) {
            const parameterValue = args[paramName];
            if (parameterValue == undefined) {
                console.log(
                    `Tried calling tool ${toolName} with incorrect parameters. Got ${JSON.stringify(args)}`
                );
                return '';
            }
            params.push(args[paramName]);
        }
        return tool.execute(bot, ...params);
    }
    console.log(`Unknown tool call: ${toolName}`);
    return '';
}
