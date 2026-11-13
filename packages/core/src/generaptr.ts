import ApiFileOperations from './fileOperations/apiFileOperations';
import RamlFileOperations from './fileOperations/ramlFileOperations';
import MysqlHandler from './handlers/mysqlHandler';
import RamlHandler from './handlers/ramlHandler';

export const operations: { api: Object; raml: Object } = {
  api: ApiFileOperations,
  raml: RamlFileOperations,
};

export const handlers: { MySql: Object; RAML: Object } = {
  MySql: MysqlHandler,
  RAML: RamlHandler,
};
