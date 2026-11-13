import { generateApi, generateSpec, generateWeb, installApi, readOpenApi } from './fileOperations/apiFileOperations.js';
import MysqlHandler from './handlers/mysqlHandler.js';
import PostgresHandler from './handlers/postgresHandler.js';

export const operations = {
  api: { generateApi, installApi },
  spec: { generateSpec, readOpenApi },
  web: { generateWeb, installWeb: installApi },
};

export const handlers = {
  MySql: MysqlHandler,
  Postgres: PostgresHandler,
};
