import {
	type Query,
	type ResultSet,
	type SQLTransactionCallback,
	type WebSQLDatabase,
} from 'expo-sqlite';

export const exec = async (db: WebSQLDatabase, queries: Query[], readonly = false): Promise<ResultSet[]> => {
	return new Promise((resolve, reject) => {
		db.exec(queries, readonly, (error, result) => {
			if (error) {
				reject(error);
			}
			else {
				resolve(result as ResultSet[]);
			}
		});
	});
};

export const transaction = async (db: WebSQLDatabase, cb: SQLTransactionCallback): Promise<void> => {
	return new Promise((resolve, reject) => {
		db.transaction(cb, reject, resolve);
	});
};
