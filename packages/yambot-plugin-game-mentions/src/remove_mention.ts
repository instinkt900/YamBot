import { YamBot, BotTool, BotToolParameter } from 'yambot';
import { InitDatabase, TableName } from './database.js';

export class RemoveGameMentionTool implements BotTool {
    get description(): string {
        return 'removes a game mention from the list';
    }
    get parameters(): { [key: string]: BotToolParameter } {
        return {
            id: { type: 'string', description: 'the id of the game mention to remove' }
        };
    }
    async execute(bot: YamBot, id: number): Promise<string> {
        const db = bot.database;
        if (db) {
            InitDatabase(db);
            await db.run(`DELETE FROM ${TableName} WHERE id = ?`, id);
            return 'success';
        }
        return 'database error';
    }
}
