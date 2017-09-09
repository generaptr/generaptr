import {Schema, Table} from '../../../commons/types';
import utils from '../../../commons/utils/utils';

export class Router {

  /**
   *
   * @param schema
   * @return {string}
   */
  public getRouterConfig(schema: Schema): string {
    return `const router = require('express').Router();
    
${this.generateImportControllersData(schema)}
${this.generateRouterUseData(schema)}
module.exports = router;`;
  }

  /**
   * Generate controllers imports data
   * @param {Schema} schema - tables array
   * @return {string} - multiple lines data
   */
  private generateImportControllersData(schema: Schema): string {
    let importData = '';

    importData += utils.formatLine('', 0, `const defaultController = require('../controllers/defaultController');`);
    schema.forEach((table: Table) => {
      const model = utils.singular(table.name);

      importData += utils.formatLine('', 0, `const ${model}Controller = require('../controllers/${model}Controller');`);
    });

    return importData;
  }

  /**
   * Generate router.use data for every schema table
   * @param {Schema] schema - tables array
   * @return {string} - multiple lines data, each line having one router.use('/models', modelController);
   */
  private generateRouterUseData(schema: Schema): string {
    let routerData = '';

    routerData += utils.formatLine('', 0, `router.use('/', defaultController);`);
    schema.forEach((table: Table) => {
      const model = utils.singular(table.name);

      routerData += utils.formatLine('', 0, `router.use('/${model}s', ${model}Controller);`);
    });

    return routerData;
  }
}

export default new Router();