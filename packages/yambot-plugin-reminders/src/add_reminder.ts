import { BotTool, BotToolParameter, YamBot } from 'yambot';
import { InitDatabase, TableName } from './database_config.js';

export class AddReminderTool implements BotTool {
    get description(): string {
        return 'adds a reminder to the list';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {
            user: { type: 'string', description: 'the name of the person the reminder is for' },
            description: { type: 'string', description: 'a description of the reminder' },
            time: {
                type: 'string',
                description: 'the unix timestamp as a number for the reminder. 0 if no time'
            }
        };
    }
    async execute(bot: YamBot, user: string, description: string, time?: number): Promise<string> {
        const db = bot.database;
        if (db) {
            InitDatabase(db);
            const now = Math.floor(Date.now() / 1000);
            await db.run(
                `INSERT INTO ${TableName} (message, user, added, remind_time) VALUES (?, ?, ?, ?)`,
                description,
                user,
                now,
                time
            );
            return 'success';
        }
        return 'database error';
    }
}
