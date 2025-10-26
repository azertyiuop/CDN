import Database from './database.mjs';

let dbInstance = null;

export function getDatabase() {
  if (!dbInstance) {
    console.log('✅ Initialisation SQLite Database');
    dbInstance = new Database();
  }
  return dbInstance;
}

export default getDatabase;
