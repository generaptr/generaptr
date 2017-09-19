import { Schema, Table } from '../../../commons/types';
import utils from '../../../commons/utils/utils';

/**
 * Class which generates string content for router.js configuration file
 *
 * @export
 * @class Router
 */
export class Router {

  /**
   * Generate router.js content file
   * @param schema - database schema definition
   * @return {string} - string generated content
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
    let importData: string = '';

    importData += utils.formatLine('', 0, `const defaultController = require('../controllers/defaultController');`);
    schema.forEach((table: Table) => {
      const model: string = utils.singular(table.name);

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
    let routerData: string = '';

    routerData += utils.formatLine('', 0, `router.use('/', defaultController);`);
    schema.forEach((table: Table) => {
      const model: string = utils.singular(table.name);

      routerData += utils.formatLine('', 0, `router.use('/${model}s', ${model}Controller);`);
    });

    return routerData;
  }
}

export default new Router();
