import { YamBot, BotTool, BotToolParameter } from 'yambot';
import { InitDatabase, TableName } from './database.js';

export class AddGameMentionTool implements BotTool {
    get description(): string {
        return 'used when a steam link is mentioned. use this to add the game to the list of game mentions.';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {
            user: { type: 'string', description: 'the name of the person who mentioned the game' },
            url: { type: 'string', description: 'the steam url of the game that was mentioned' }
        };
    }
    async execute(bot: YamBot, user: string, url: string): Promise<string> {
        const db = bot.database;
        if (db) {
            InitDatabase(db);
            const now = Math.floor(Date.now() / 1000);
            await db.run(`INSERT INTO ${TableName} (url, user, added) VALUES (?, ?, ?)`, url, user, now);
            return 'success';
        }
        return 'database error';
    }
}
