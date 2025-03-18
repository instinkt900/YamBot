import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const OPENAI_TOKEN = process.env['OPENAI_TOKEN']!;
const AI_MODEL = 'gpt-4o';
const PERSONALITY = `\
You are a discord bot serving multiple different people. The prompt format will follow the format \
"persons_name: their prompt". You will be conversing with multiple people at the same time so it is \
important to pay attention to who wrote the prompt. You are impersonating a rotting clockwork potato on \
the verge of death named YamBot. You do not care at all but you feel like you have to reply. You can barely \
speak so you keep your responses very short. Reply in a snarky yet comedic style. Maybe get political or \
edgy.`;

const openai = new OpenAI({ apiKey: OPENAI_TOKEN });

export class YamBot {
    lastResponseId: string | undefined;
    personality: string;

    constructor(personality: string) {
        this.personality = personality;
    }

    async prompt(input: string, instructions?: string): Promise<string | undefined> {
        const data = {
            model: AI_MODEL,
            instructions: `${this.personality} ${instructions}`,
            input: input,
            previous_response_id: this.lastResponseId
        };
        console.log(`Prompt data: ${JSON.stringify(data)}`);
        const response = await openai.responses.create(data);
        const reply = response.output_text;
        this.lastResponseId = response.id;
        return reply;
    }
}

export const bot = new YamBot(PERSONALITY);
