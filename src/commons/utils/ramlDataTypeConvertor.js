class RamlDataTypeConvertor {
    constructor() {
        this.MYSQL = 'MySql';
        this.POSTGRESSQL = 'Postgresql';
        this.SQLITE = 'Sqlite';

        this.mysqlNumberTypes = ['int', 'tinyint', 'smallint', 'mediumint', 'bigint', 'decimal', 'float', 'double'];
        this.mysqlStringTypes = ['char', 'varchar', 'blob', 'text', 'tinyblob', 'tinytext', 'mediumblob', 'mediumtext', 'longblob', 'longtext', 'enum'];
    }

    /**
     * From string method
     * @param databaseEngine
     */
    fromString(databaseEngine) {
        if (databaseEngine.toLowerCase() === this.MYSQL.toLowerCase()) {
            return this.MYSQL;
        } else if (databaseEngine.toLowerCase() === this.POSTGRESSQL.toLowerCase()) {
            return this.POSTGRESSQL;
        } else if (databaseEngine.toLowerCase() === this.SQLITE.toLowerCase()) {
            return this.POSTGRESSQL;
        }
    }

    /**
     * Convert attribute type from database to raml valid type
     * @param databaseEngine
     * @param attributeType
     * @returns {*}
     */
    convertType(databaseEngine, attributeType) {
        switch (this.fromString(databaseEngine)) {
            case this.MYSQL:
                if ((this.mysqlNumberTypes.includes(attributeType.toLowerCase())) ||
                    (attributeType.toLowerCase() === 'timestamp') ||
                    (attributeType.toLowerCase() === 'year')) {
                    return 'number';
                } else if (this.mysqlStringTypes.includes(attributeType.toLowerCase())) {
                    return 'string';
                } else if (attributeType.toLowerCase() === 'date') {
                    return 'date-only';
                } else if (attributeType.toLowerCase() === 'datetime') {
                    return 'datetime';
                } else if (attributeType.toLowerCase() === 'time') {
                    return 'time-only';
                }
                throw new Error('Invalid attribute type');
                break;
            case this.POSTGRESSQL:
                throw new Error('Not implemented yet');
                break;
            case this.SQLITE:
                throw new Error('Not implemented yet');
                break;
            default:
                throw new Error('Could not match database engine');
        }
    }

}

module.exports = new RamlDataTypeConvertor();