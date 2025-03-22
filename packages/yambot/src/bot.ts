import { OpenAI } from 'openai';
import {
    Response,
    ResponseCreateParams,
    ResponseCreateParamsNonStreaming,
    ResponseInput,
    Tool
} from 'openai/resources/responses/responses';
import { DynamicConfigFile } from './utils/config.js';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { DoNothingToolImpl } from './tools/do_nothing.js';
import { TalkToolImpl } from './tools/talk.js';
import { ToolPlugin } from './tools/tool_plugin.js';
import { BotTool } from './tools/bot_tool.js';
import path from 'path';

export class BotConfig extends DynamicConfigFile {
    model: string = 'gpt-4o';
    instructions: string = '';
    dbPath: string = '';
    conversation_timeout = 0;
    plugins: string[] = [];

    constructor(configPath: string) {
        super(configPath);
        this._loadConfig();
    }
}

export class YamBot {
    private openai;
    private lastResponseId: string | undefined;
    private config: BotConfig;
    private db?: Database;
    private silenceTimeout?: NodeJS.Timeout;
    private tools: Map<string, BotTool> = new Map();

    get database() {
        return this.db;
    }

    say?: (str: string) => void;

    constructor(config: BotConfig, openaiToken: string) {
        this.openai = new OpenAI({ apiKey: openaiToken });
        this.config = config;
        this.config._events.on('changed', (_config) => {
            this.onConfigChanged();
        });
        this.onConfigChanged();
    }

    prompt(input: string, userName?: string, instructions?: string): void {
        const data: ResponseCreateParamsNonStreaming = {
            model: this.config.model,
            tools: this.getTools(),
            tool_choice: 'required',
            instructions: `${this.config.instructions}${instructions ? ' ' + instructions : ''}`,
            input: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'input_text',
                            text: (userName ? userName + ' says: ' : '') + input
                        }
                    ]
                }
            ],
            previous_response_id: this.lastResponseId
        };

        console.log(`PROMPT: ${JSON.stringify(data)}`);
        this.openai.responses.create(data).then((response) => this.handleResponse(response));
    }

    talk(message: string) {
        this.say?.(message);
        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
        }
        if (this.config.conversation_timeout) {
            this.silenceTimeout = setTimeout(() => {
                this.endConversation();
            }, this.config.conversation_timeout * 1000);
        }
    }

    private onConfigChanged() {
        const dbPath = path.resolve(this.config._getBaseDir(), this.config.dbPath);
        open({ filename: dbPath, driver: sqlite3.Database }).then((db) => (this.db = db));
        this.initTools();
        this.lastResponseId = undefined; // clear this so we can start working with new context
        console.log('Bot config updated.');
        console.log(this.config);
    }

    private initTools() {
        this.tools.clear();

        this.tools.set('do_nothing', new DoNothingToolImpl());
        this.tools.set('talk', new TalkToolImpl());

        for (const pluginName of this.config.plugins) {
            import(pluginName).then((module: any) => {
                console.log(module.plugin);
                console.log(module.plugin.getPlugins);
                console.log(module.plugin.getPlugins());
                const plugin = module.plugin as ToolPlugin;
                const pluginTools = plugin.getPlugins();
                for (const [name, tool] of Object.entries(pluginTools)) {
                    this.tools.set(name, tool);
                }
            });
        }
    }

    private getTools(): Array<Tool> {
        const tools = new Array<Tool>();
        for (const [toolName, tool] of this.tools.entries()) {
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

    async executeTool(toolName: string, args: { [key: string]: any }): Promise<string> {
        const tool = this.tools.get(toolName);
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
            return tool.execute(this, ...params);
        }
        console.log(`Unknown tool call: ${toolName}`);
        return '';
    }
    private endConversation(): void {
        const data: ResponseCreateParamsNonStreaming = {
            model: this.config.model,
            tools: this.getTools(),
            tool_choice: 'required',
            instructions: this.config.instructions,
            input: [
                {
                    role: 'system',
                    content: [
                        {
                            type: 'input_text',
                            text: 'stop responding until mentioned by name again'
                        }
                    ]
                }
            ],
            previous_response_id: this.lastResponseId
        };

        console.log(`silence: ${JSON.stringify(data)}`);
        this.openai.responses.create(data).then((response) => this.handleResponse(response));
    }

    private handleResponse(response: Response): void {
        console.log(`RESPONSE: ${JSON.stringify(response)}`);
        this.lastResponseId = response.id;
        const functionCalls: { callId: string; result: Promise<string> }[] = [];
        for (const output of response.output) {
            if (output.type === 'message') {
                for (const message of output.content) {
                    if (message.type === 'output_text') {
                        console.log(`Bot Message: ${message.text}`);
                        // this.say?.(message.text);
                    }
                }
            } else if (output.type === 'function_call') {
                console.log(`function call ${output.name}`);
                const params = JSON.parse(output.arguments);
                const result = this.executeTool(output.name, params);
                if (result) {
                    functionCalls.push({
                        callId: output.call_id,
                        result: result
                    });
                }
            }
        }
        if (functionCalls.length > 0) {
            console.log(`waiting on ${functionCalls.length} call results...`);
            const promises = functionCalls.map((item) => item.result);
            Promise.all(promises).then((results) => {
                console.log(`results complete = ${JSON.stringify(results)}`);
                const input: ResponseInput = [];
                results.forEach((result, index) => {
                    input.push({
                        type: 'function_call_output',
                        call_id: functionCalls[index].callId,
                        output: JSON.stringify(result)
                    });
                });
                const data: ResponseCreateParams = {
                    model: this.config.model,
                    tools: this.getTools(),
                    instructions: this.config.instructions,
                    previous_response_id: this.lastResponseId,
                    input: input
                };
                console.log(`PROMPT: ${JSON.stringify(data)}`);
                this.openai.responses.create(data).then((response) => this.handleResponse(response));
            });
        }
    }
}
