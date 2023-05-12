import { type SQLTransaction, type WebSQLDatabase } from 'expo-sqlite';

import { exec, transaction } from './database-utils';

export interface MigrationPlan {
	order: number;
	migrate(db: SQLTransaction): void;
}

export class DbMigrator {
	constructor (private db: WebSQLDatabase, private table = '_migrations') {}

	async perform (migrations: MigrationPlan[]) {
		const db = this.db;

		// create a migration table if it hasn't already existed,
		// check for already applied migrations
		const [, res] = await exec(db, [
			{
				sql:
					`CREATE TABLE IF NOT EXISTS \`${this.table}\` (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, created_at INTEGER DEFAULT CURRENT_TIMESTAMP)`,
				args: [],
			},
			{
				sql: `SELECT name FROM \`${this.table}\` ORDER BY id ASC`,
				args: [],
			},
		]);

		const rows = res.rows as ({ name: string })[];
		const names = rows.map((row) => row.name);

		// perform the migrations
		let count = 0;

		migrations.sort((a, b) => a.order - b.order);

		for (const migration of migrations) {
			const name = '' + migration.order;

			if (names.includes(name)) {
				continue;
			}

			count++;
			console.debug(`[migrator] performing migration ${name}`);

			await transaction(db, (tx) => {
				tx.executeSql(`INSERT INTO \`${this.table}\` (name) VALUES (?)`, [name]);
				migration.migrate(tx);
			});
		}

		console.debug(`[migrator] performed ${count} migrations`);
	}
}
