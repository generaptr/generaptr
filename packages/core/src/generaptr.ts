import { generateApi, generateSpec, installApi, readOpenApi } from './fileOperations/apiFileOperations';
import MysqlHandler from './handlers/mysqlHandler';
import PostgresHandler from './handlers/postgresHandler';

export const operations = {
  api: { generateApi, installApi },
  spec: { generateSpec, readOpenApi },
};

export const handlers = {
  MySql: MysqlHandler,
  Postgres: PostgresHandler,
};
