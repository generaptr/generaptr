const typeConverter = require('../utils/typeConverter');
const utils = require('../utils/utils');

module.exports = class MysqlSchemaPreprocessor {

  /**
   * @param tableSchema
   * @returns {{}}
   */
  convertToStandardTableSchema(tableSchema) {
    const schema = {};
    schema.name = tableSchema['COLUMN_NAME'] ? tableSchema['COLUMN_NAME'] : null;
    schema.primary = !!(tableSchema['COLUMN_KEY'] && tableSchema['COLUMN_KEY'] === 'PRI');
    schema.unique = !!(tableSchema['COLUMN_KEY'] && (tableSchema['COLUMN_KEY'] === 'PRI' || tableSchema['COLUMN_KEY'] === 'UNI'));
    schema.foreignKey = !!(tableSchema['COLUMN_KEY'] && tableSchema['COLUMN_KEY'] === 'MUL');
    schema.dataType = {
      type: typeConverter.convertType(tableSchema['DATA_TYPE']),
      size: tableSchema['CHARACTER_MAXIMUM_LENGTH'] ? parseInt(tableSchema['CHARACTER_MAXIMUM_LENGTH']) : null,
    };
    return schema;
  }

  convertToStandard(schema) {
    schema = this.normalizeOneToOneRelations(schema);
    schema = this.normalizeOneToManyRelations(schema);
    schema = this.normalizeManyToManyRelations(schema);
    schema = this.stripEmptyTables(schema);

    return schema;
  }

  normalizeOneToOneRelations(schema) {
    schema.forEach(table => {
      if (!this.tableHasForeignKeys(table)) {
        return table;
      }
      table.columns.forEach(column => {
        if (column.foreignKey && column.unique) {

        }
      });
    });
  }
  normalizeOneToManyRelations(schema) {

    return schema;
  }
  normalizeManyToManyRelations(schema) {

    return schema;
  }

  stripEmptyTables(schema) {
    return schema.filter(table => !!Object.keys(table.columns).length);
  }

  tableHasForeignKeys(table) {
    return !!table.columns.filter(column => column.foreignKey).length;
  }
};