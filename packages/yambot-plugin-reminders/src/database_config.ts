import { Database } from 'sqlite';

export const TableName = 'reminders';
const TableStructure = `
	CREATE TABLE IF NOT EXISTS ${TableName} (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		message TEXT NOT NULL,
		user TEXT NOT NULL,
		added INTEGER NOT NULL,
		remind_time INTEGER)`;

export async function InitDatabase(db: Database) {
    await db.exec(TableStructure);
}
