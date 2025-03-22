import { BotTool, BotToolParameter, YamBot } from 'yambot';
import { InitDatabase, TableName } from './database_config.js';

export class GetRemindersTool implements BotTool {
    get description(): string {
        return 'gets the current list of reminders for a user';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {
            user: { type: 'string', description: 'the name of the person the reminder is for' }
        };
    }
    async execute(bot: YamBot, user: string): Promise<string> {
        const now = Math.floor(Date.now() / 1000);
        console.log(`get reminders for ${user}`);
        console.log(
            `SELECT * FROM ${TableName} WHERE user = "${user}" AND (remind_time IS 0 OR remind_time > ${now}) ORDER BY added ASC`
        );
        const db = bot.database;
        if (db) {
            InitDatabase(db);
            const rows = await db.all(
                `SELECT * FROM ${TableName} WHERE user = ? AND (remind_time IS 0 OR remind_time > ?) ORDER BY added ASC`,
                user,
                now
            );
            return JSON.stringify(rows);
        }
        return 'database error';
    }
}
