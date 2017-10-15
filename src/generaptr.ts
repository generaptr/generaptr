import ApiFileOperations from './fileOperations/ApiFileOperations';
import RamlFileOperations from './fileOperations/RamlFileOperations';
import MysqlHandler from './handlers/MysqlHandler';
import RamlHandler from './handlers/RamlHandler';

export const operations: {api: Object; raml: Object} = {
  api: ApiFileOperations,
  raml: RamlFileOperations,
};

export const handlers: {MySql: Object; RAML: Object} = {
  MySql: MysqlHandler,
  RAML: RamlHandler,
};
