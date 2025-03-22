import { Database } from 'sqlite';

export const TableName = 'game_mentions';
const TableStructure = `
	CREATE TABLE IF NOT EXISTS ${TableName} (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		url TEXT NOT NULL,
		user TEXT NOT NULL,
		added INTEGER NOT NULL)`;

export async function InitDatabase(db: Database) {
    await db.exec(TableStructure);
}
