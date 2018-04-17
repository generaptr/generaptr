import ParserInterface from '../interfaces/ParserInterface';
import { RawMySqlColumn } from './types';
import Column from '../../types/Column';
import Schema from '../../types/Schema';
import DataType from '../../types/DataType';
import { getValues } from '../../utils/types';

export default class Parser implements ParserInterface<RawMySqlColumn> {

  public normalizeColumn(data: RawMySqlColumn): Column {
    const column = new Column();
    column.setName(data.COLUMN_NAME);
    column.setPrimary(Boolean(data.COLUMN_KEY && data.COLUMN_KEY === 'PRI'));
    column.setNullable(Boolean(data.IS_NULLABLE && data.IS_NULLABLE === 'YES'));
    column.setUnique(Boolean(data.COLUMN_KEY && (data.COLUMN_KEY === 'PRI' || data.COLUMN_KEY === 'UNI')));
    column.setType((new DataType()).setType(data.DATA_TYPE).setValues(data.DATA_TYPE === 'enum' ? getValues(data.COLUMN_TYPE): []));

    return column;
  }

  public normalizeRelations(schema: Schema): Schema {
    let normalized: Schema = schema;
    
    normalized = this.normalizeOneToOne(normalized);

    return schema;
  }

  private normalizeOneToOne(schema: Schema): Schema {
    let updatedSchema: Schema = schema;
    
    if (!schema.getTables().some(table => table.hasForeignKeys() || table.isCrossReference())) {
      return schema;
    }

    for (const table of schema.getTables()) {

    }
    
    return updatedSchema;
  }
}
