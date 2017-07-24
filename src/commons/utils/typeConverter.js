class TypeConverter {
  constructor() {
    this.numberTypes = ['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'decimal', 'float', 'double'];
    this.stringTypes = ['char', 'varchar', 'blob', 'text', 'tinyblob', 'tinytext', 'mediumblob', 'mediumtext', 'longblob', 'longtext'];
  }

  /**
   * @param {string} type db type.
   * @returns {*} standard type
   */
  convertSqlType(type) {
    if ((this.numberTypes.includes(type.toLowerCase())) ||
      (type.toLowerCase() === 'timestamp') ||
      (type.toLowerCase() === 'year')) {
      return 'number';
    } else if (this.stringTypes.includes(type.toLowerCase())) {
      return 'string';
    } else if (type.toLowerCase() === 'date') {
      return 'date-only';
    } else if (type.toLowerCase() === 'datetime') {
      return 'datetime';
    } else if (type.toLowerCase() === 'time') {
      return 'time-only';
    } else if (type.toLowerCase() === 'enum') {
      return 'enum';
    }
    throw new Error('Type not found');
  }

  /**
   * Converts no sql types to standard schema
   * @param {string} type - type to be converted
   */
  convertNoSqlType(type) {
    throw new Error('Not yet implemented');
  }

  /**
   * Converts raml types to standard schema
   * @param {*} type - type to be converted
   * @returns {*} - converted type
   */
  convertRamlTypes(type) {
    if (type.type.indexOf('|') > -1) {
      return {
        type: 'enum',
        isArray: false,
        values: type.type.split(' | '),
      };
    } else if (type.type === 'array') {
      return {
        type: type.items,
        isArray: true,
      };
    }
    return {
      type: type.type,
      isArray: false,
    };
  }
}

module.exports = new TypeConverter();
