import { type WebSQLDatabase, openDatabase } from 'expo-sqlite';

import { DbMigrator, type MigrationPlan } from './migrations';

export interface GiphyRecord {
	id: string;
	json: string;
}

export interface NoteRecord {
	id: number;
	content: string;
	giphy_id: string;
}

const migrations: MigrationPlan[] = [
	// 0001. initial database setup
	{
		order: 1683794654252,
		migrate (tx) {
			tx.executeSql(`
				CREATE TABLE giphy (
					id TEXT PRIMARY KEY,
					json TEXT
				)
			`);

			tx.executeSql(`
				CREATE TABLE notes (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
					title TEXT NOT NULL,
					content TEXT NOT NULL,
					giphy_id TEXT NOT NULL,
					FOREIGN KEY(giphy_id) REFERENCES giphy(id)
				)
			`);
		},
	},
];

// we don't *need* to initialize the database on startup, we can defer it until
// we actually query something, but ensure that we only have one db instance
let _promise: Promise<WebSQLDatabase> | undefined;

const connectInner = async (): Promise<WebSQLDatabase> => {
	const db = openDatabase(`notes.db`);
	const migrator = new DbMigrator(db);

	await migrator.perform(migrations);

	return db;
};

export const connect = () => {
	return _promise ||= connectInner();
};
