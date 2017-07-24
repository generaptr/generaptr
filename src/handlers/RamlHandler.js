const BaseHandler = require('./BaseHandler');
const ramlParser = require('raml-1-parser');
const utils = require('../commons/utils/utils');
class RamlHandler extends BaseHandler {
  /**
   * Constructor for the RamlHandler.
   *
   * @param {*} options Spec path.
   */
  constructor(options) {
    super('raml');
    if (!options.path) {
      throw new Error('Path is a required argument.');
    }
    this.path = options.path;
  }

  parseSchema() {
    return new Promise((resolve, reject) => {
      try {
        const schema = [];
        const types = ramlParser.loadApiSync(this.path).expand().types();
        types.forEach((type) => {
          const columns = type.toJSON({serializeMetadata: false})[type.name()].properties;
          const table = {
            name: utils.toTableName(type.name()),
            columns: [],
          };

          Object.keys(columns).map((name) => {
            table.columns.push(this.normalizeColumnSchema(columns[name]));
          });

          schema.push(table);
        });

        resolve(schema);
      } catch (e) {
        console.log('Incorrect RAML file!');
        reject(e);
      }
    });
  }

}

module.exports = RamlHandler;
