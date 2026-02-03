// Database core
export {
  initializeDatabase,
  getDatabase,
  getDatabaseOrThrow,
  isDatabaseInitialized,
  persistDatabase,
  closeDatabase,
  execQuery,
  execStatement,
  execTransaction,
  getLastInsertRowId,
  getNextId,
} from './db';

// Schema
export { SCHEMA_VERSION, CREATE_TABLES_SQL } from './schema';

// Mapper utilities
export {
  toSnakeCase,
  toCamelCase,
  mapRowToEntity,
  mapEntityToRow,
  mapRowsToEntities,
  buildInsertSQL,
  buildUpdateSQL,
} from './mapper';

// Repositories
export * from './repositories';

// Migration
export {
  hasExistingLocalStorageData,
  migrateFromLocalStorage,
  verifyMigration,
} from './migration';
