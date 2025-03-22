import { YamBot, BotTool, BotToolParameter } from 'yambot';
import { InitDatabase, TableName } from './database.js';

export class GetGameMentionsTool implements BotTool {
    get description(): string {
        return 'gets the list of games that have previously been mentioned';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {
            user: {
                type: 'string',
                description:
                    'the name of who mentioned the games or an empty string for all games mentioned by anyone'
            }
        };
    }
    async execute(bot: YamBot, user: string): Promise<string> {
        const query =
            user.length > 0
                ? `SELECT * FROM ${TableName} WHERE user = "${user}" ORDER BY added ASC`
                : `SELECT * FROM ${TableName} ORDER BY added ASC`;
        console.log(query);
        const db = bot.database;
        if (db) {
            InitDatabase(db);
            const rows = await db.all(query);
            return JSON.stringify(rows);
        }
        return 'database error';
    }
}
