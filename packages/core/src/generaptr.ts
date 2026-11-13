import { generateApi, installApi } from './fileOperations/apiFileOperations';
import RamlFileOperations from './fileOperations/ramlFileOperations';
import MysqlHandler from './handlers/mysqlHandler';
import RamlHandler from './handlers/ramlHandler';

export const operations = {
  api: { generateApi, installApi },
  raml: RamlFileOperations,
};

export const handlers = {
  MySql: MysqlHandler,
  RAML: RamlHandler,
};
