import { BotTool, BotToolParameter } from '.';
import { YamBot } from '../bot';
import { Database } from 'sqlite';

const TableName = 'game_mentions';
const TableStructure = `
	CREATE TABLE IF NOT EXISTS ${TableName} (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		url TEXT NOT NULL,
		user TEXT NOT NULL,
		added INTEGER NOT NULL)`;

async function InitDatabase(db: Database) {
    await db.exec(TableStructure);
}

class AddGameMentionToolImpl implements BotTool {
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

class GetGameMentionsToolImpl implements BotTool {
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

class RemoveGameMentionToolImpl implements BotTool {
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

export const AddGameMentionTool = new AddGameMentionToolImpl();
export const GetGameMentionsTool = new GetGameMentionsToolImpl();
export const RemoveGameMentionTool = new RemoveGameMentionToolImpl();
