import ApiFileOperations from './fieGenerators/api';
import RamlFileOperations from './fieGenerators/raml';
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
