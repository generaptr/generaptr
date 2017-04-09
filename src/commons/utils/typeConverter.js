class TypeConverter {
  constructor() {
    this.numberTypes = ['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'decimal', 'float', 'double'];
    this.stringTypes = ['char', 'varchar', 'blob', 'text', 'tinyblob', 'tinytext', 'mediumblob', 'mediumtext', 'longblob', 'longtext', 'enum'];
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
    }
    throw new Error('Type not found');
  }

  convertNoSqlType(type) {
    throw new Error('Not yet implemented');
  }
}

module.exports = new TypeConverter();
