import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import {
    Response,
    ResponseCreateParams,
    ResponseCreateParamsNonStreaming,
    ResponseInput
} from 'openai/resources/responses/responses';
import { executeTool, getTools } from './tools';
import { DynamicConfigFile } from './utils/config';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

dotenv.config();

const OPENAI_TOKEN = process.env['OPENAI_TOKEN']!;
const AI_MODEL = 'gpt-4o';

const openai = new OpenAI({ apiKey: OPENAI_TOKEN });

export class BotConfig extends DynamicConfigFile {
    instructions: string = '';
    dbPath: string = '';

    constructor(configPath: string) {
        super(configPath);
        this._loadConfig();
    }
}

export class YamBot {
    private lastResponseId: string | undefined;
    private config: BotConfig;
    private db?: Database;

    get database() {
        return this.db;
    }

    say?: (str: string) => void;

    constructor(config: BotConfig) {
        this.config = config;
        this.config._events.on('changed', (config) => {
            this.config = config;
            this.lastResponseId = undefined; // clear this so we can start working with new context
            console.log('Bot config updated.');
            console.log(`config:`, this.config);
        });
        console.log(`config:`, this.config);
        open({ filename: this.config.dbPath, driver: sqlite3.Database }).then((db) => (this.db = db));
    }

    prompt(input: string, userName?: string, instructions?: string): void {
        const data: ResponseCreateParamsNonStreaming = {
            model: AI_MODEL,
            tools: getTools(),
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
        openai.responses.create(data).then((response) => this.handleResponse(response));
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
                const result = executeTool(this, output.name, params);
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
                    model: AI_MODEL,
                    tools: getTools(),
                    instructions: this.config.instructions,
                    previous_response_id: this.lastResponseId,
                    input: input
                };
                console.log(`PROMPT: ${JSON.stringify(data)}`);
                openai.responses.create(data).then((response) => this.handleResponse(response));
            });
        }
    }
}
