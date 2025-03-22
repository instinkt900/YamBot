import { BotTool, BotToolParameter } from './bot_tool';
import { YamBot } from '../bot';
import { Database } from 'sqlite';

const TableName = 'reminders';
const TableStructure = `
	CREATE TABLE IF NOT EXISTS ${TableName} (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		message TEXT NOT NULL,
		user TEXT NOT NULL,
		added INTEGER NOT NULL,
		remind_time INTEGER)`;

async function InitDatabase(db: Database) {
    await db.exec(TableStructure);
}

class AddReminderToolImpl implements BotTool {
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

class GetRemindersToolImpl implements BotTool {
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

class ClearRemindersToolImpl implements BotTool {
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

export const AddReminderTool = new AddReminderToolImpl();
export const GetRemindersTool = new GetRemindersToolImpl();
export const ClearRemindersTool = new ClearRemindersToolImpl();
