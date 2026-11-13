import { generateApi, generateSpec, installApi, readOpenApi } from './fileOperations/apiFileOperations';
import MysqlHandler from './handlers/mysqlHandler';

export const operations = {
  api: { generateApi, installApi },
  spec: { generateSpec, readOpenApi },
};

export const handlers = {
  MySql: MysqlHandler,
};
