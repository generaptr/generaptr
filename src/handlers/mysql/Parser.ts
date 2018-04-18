import ParserInterface from '../interfaces/ParserInterface';
import { RawMySqlColumn } from './types';
import Column from '../../types/Column';
import Schema from '../../types/Schema';
import DataType from '../../types/DataType';
import { getValues } from '../../utils/types';
import { toTitleCase, toSingular, toPlural } from '../../utils/text';
import ForeignKey from '../../types/ForeignKey';


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
    normalized = this.normalizeOneToMany(normalized);

    return schema;
  }

  private normalizeOneToOne(schema: Schema): Schema {
    let normalized: Schema = schema;
    
    for (const table of schema.getTables()) {
      if (!table.hasForeignKeys() || table.isCrossReference()) {
        continue;
      }
      for (const column of table.getColumns()) {
        if (!(column.isUnique() && column.getForeignKey())) {
          continue;
        }
        
        const sourceColumn: Column = (new Column())
          .setName(toSingular(table.getName()))
          .setPrimary(column.isPrimary())
          .setUnique(column.isUnique())
          .setNullable(column.isNullable())
          .setType(
            (new DataType())
              .setType(toTitleCase(table.getName()))
          )
          .setForeignKey(
            (new ForeignKey())
              .setOwned(true)
              .setType('1-1')
          );

        const targetColumn: Column = (new Column())
          .setName(column.getName())
          .setPrimary(column.isPrimary())
          .setUnique(column.isUnique())
          .setNullable(column.isNullable())
          .setType(column.getType())
          .setForeignKey(
            (new ForeignKey())
              .setOwned(false)
              .setType('1-1')
              .setAlias(
                (column.getForeignKey() as ForeignKey)
                .isAlias()
              )
          );

          normalized = normalized.addColumnToTable(sourceColumn, (column.getForeignKey() as ForeignKey).getTarget().table);
          normalized = normalized.addColumnToTable(targetColumn, table.getName());
      }
      
    }

    return normalized;
  }

  private normalizeOneToMany(schema: Schema): Schema {
    let normalized: Schema = schema;

    for (const table of schema.getTables()) {
      if (!table.hasForeignKeys() || table.isCrossReference()) {
        continue;
      }
      for (const column of table.getColumns()) {
        if (!(!column.isUnique() && column.getForeignKey())) {
          continue;
        }

        const foreignKey: ForeignKey = column.getForeignKey() as ForeignKey;

        const sourceColumn: Column = (new Column())
          .setName(column.getName())
          .setPrimary(column.isPrimary())
          .setUnique(false)
          .setNullable(false)
          .setType(
            (new DataType())
              .setType(toTitleCase(foreignKey.isAlias() ? foreignKey.getTarget().table : column.getName()))
              .setIsArray(false)
          )
          .setForeignKey(
            (new ForeignKey())
              .setAlias(
                (column.getForeignKey() as ForeignKey)
                  .isAlias()
              )
              .setType('1-n')
              .setOwned(false)
          );

        const targetColumn: Column = (new Column())
          .setName(toPlural(table.getName()))
          .setPrimary(column.isPrimary())
          .setUnique(false)
          .setNullable(true)
          .setType(
            (new DataType())
              .setType(toTitleCase(table.getName()))
              .setIsArray(true)
          )
          .setForeignKey(
            (new ForeignKey())
              .setOwned(true)
              .setType('1-n')
          );

        normalized = normalized.addColumnToTable(sourceColumn, table.getName());
        normalized = normalized.addColumnToTable(targetColumn, foreignKey.getTarget().table)
      }
    }

    return normalized;
  }

  private normalizeManyToMany(schema: Schema): Schema {
    let normalized: Schema = schema;

    return normalized;
  }
}
