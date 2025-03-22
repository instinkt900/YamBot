import { BotTool, BotToolParameter, YamBot } from 'yambot';
import { InitDatabase, TableName } from './database_config.js';

export class ClearRemindersTool implements BotTool {
    get description(): string {
        return 'clears all reminders for a user';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {
            user: { type: 'string', description: 'the name of the person the reminder is for' }
        };
    }
    async execute(bot: YamBot, user: string): Promise<string> {
        const db = bot.database;
        if (db) {
            InitDatabase(db);
            await db.run(`DELETE FROM ${TableName} WHERE user = ?`, user);
            return 'success';
        }
        return 'database error';
    }
}
