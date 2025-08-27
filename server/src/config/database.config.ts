import knex, { Knex } from 'knex';
import {
  KNEX_MYSQL_POOL_MIN,
  KNEX_MYSQL_POOL_MAX,
  KNEX_MYSQL_POOL_ACQUIRE_TIMEOUT,
  KNEX_MYSQL_POOL_CREATE_TIMEOUT,
  KNEX_MYSQL_POOL_DESTROY_TIMEOUT,
  KNEX_MYSQL_POOL_IDLE_TIMEOUT,
  KNEX_MYSQL_POOL_REAP_INTERVAL,
  KNEX_MYSQL_POOL_CREATE_RETRY_INTERVAL
} from '../utils/constants.js';

let knexInstance: Knex | null = null;

export async function initKnex(): Promise<Knex> {
  if (knexInstance) {
    return knexInstance;
  }

  try {
    // Use environment variables for local database connection
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'scholarship_tracker',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    };

    knexInstance = knex({
      client: 'mysql2',
      connection: dbConfig,
      pool: {
        min: KNEX_MYSQL_POOL_MIN,
        max: KNEX_MYSQL_POOL_MAX,
        acquireTimeoutMillis: KNEX_MYSQL_POOL_ACQUIRE_TIMEOUT,
        createTimeoutMillis: KNEX_MYSQL_POOL_CREATE_TIMEOUT,
        destroyTimeoutMillis: KNEX_MYSQL_POOL_DESTROY_TIMEOUT,
        idleTimeoutMillis: KNEX_MYSQL_POOL_IDLE_TIMEOUT,
        reapIntervalMillis: KNEX_MYSQL_POOL_REAP_INTERVAL,
        createRetryIntervalMillis: KNEX_MYSQL_POOL_CREATE_RETRY_INTERVAL,
      },
    });

    // Test the connection
    await knexInstance.raw('SELECT 1');
    console.log('✅ Knex MySQL connection established successfully');
    console.log(`📊 Connected to database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);

    return knexInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Knex:', error);
    throw error;
  }
}

export function getKnex(): Knex {
  if (!knexInstance) {
    throw new Error('Knex not initialized. Call initKnex() first.');
  }
  return knexInstance;
}

export default knexInstance;
