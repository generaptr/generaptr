import typeUtil from '../commons/utils/typeUtil';
import schemaUtil from '../commons/utils/schemaUtil';
import { RamlColumnSchema, Column, Schema, Table } from '../commons/types';

/**
 * Raml schema pre processor.
 *
 * @export
 */
export default class RamlSchemaPreprocessor {

  /**
   * Normalize the table schema.
   *
   * @param columnSchema column schema to be normalized
   * @returns  normalized column schema
   */
  public convertToStandardSchema(columnSchema: RamlColumnSchema): Column {
    return {
      name: columnSchema.name,
      primary: columnSchema.name === 'id',
      unique: columnSchema.name === 'id',
      allowNull: !columnSchema.required,
      dataType: typeUtil.convertRamlTypes({
        type: columnSchema.type.pop() || '',
        items: columnSchema.items,
      }),
    };
  }

  /**
   * Normalize schema relations.
   *
   * @param  schema - schema which needs to be normalized
   * @returns  normalized schema
   */
  public normalizeSchemaRelations(schema: Schema): Schema {
    let normalizedSchema: Schema = schema;

    normalizedSchema = this.normalizeOneToOneRelation(normalizedSchema);
    normalizedSchema = this.normalizeOneToManyRelation(normalizedSchema);
    normalizedSchema = this.normalizeManyToManyRelation(normalizedSchema);

    return normalizedSchema;
  }

  /**
   * Adds the relation type to schema.
   *
   * @param  schema - schema which needs normalization
   * @return  normalized schema
   */
  private normalizeOneToOneRelation(schema: Schema): Schema {
    const updatedSchema: Schema = schema;
    updatedSchema.map((table: Table) => {
      table.columns.map((column: Column) => {
        if (
          !column.allowNull &&
          !column.dataType.isArray &&
          schemaUtil.isCircularRelation(table, column, schema) &&
          !schemaUtil.circularRelationIsRequired(table, column, schema) &&
          !schemaUtil.circularRelationIsArray(table, column, schema) &&
          !typeUtil.isDefaultType(column.dataType.type)
        ) {
          column.dataType.relationType = '1-1';
        } else if (
          column.allowNull &&
          !column.dataType.isArray &&
          schemaUtil.isCircularRelation(table, column, schema) &&
          schemaUtil.circularRelationIsRequired(table, column, schema) &&
          !schemaUtil.circularRelationIsArray(table, column, schema) &&
          !typeUtil.isDefaultType(column.dataType.type)
        ) {
          column.dataType.relationType = '1-1';
          column.dataType.isRelationHolder = true;
        }

        return column;
      });

      return table;
    });

    return updatedSchema;
  }

  /**
   * Adds the relation type to schema.
   *
   * @param  schema - schema which needs normalization
   * @return  normalized schema
   */
  private normalizeOneToManyRelation(schema: Schema): Schema {
    const updatedSchema: Schema = schema;
    updatedSchema.map((table: Table) => {
      table.columns.map((column: Column) => {
        if (
          column.allowNull &&
          column.dataType.isArray &&
          schemaUtil.isCircularRelation(table, column, schema) &&
          schemaUtil.circularRelationIsRequired(table, column, schema) &&
          !schemaUtil.circularRelationIsArray(table, column, schema) &&
          !typeUtil.isDefaultType(column.dataType.type)
        ) {
          column.dataType.relationType = '1-n';
          column.dataType.isRelationHolder = true;
        } else if (
          !column.allowNull &&
          !column.dataType.isArray &&
          schemaUtil.isCircularRelation(table, column, schema) &&
          !schemaUtil.circularRelationIsRequired(table, column, schema) &&
          schemaUtil.circularRelationIsArray(table, column, schema) &&
          !typeUtil.isDefaultType(column.dataType.type)
        ) {
          column.dataType.relationType = '1-n';
        }

        return column;
      });

      return table;
    });

    return updatedSchema;
  }

  /**
   * Adds the relation type to schema.
   *
   * @param  schema - schema which needs normalization
   * @return  normalized schema
   */
  private normalizeManyToManyRelation(schema: Schema): Schema {
    const updatedSchema: Schema = schema;
    updatedSchema.map((table: Table) => {
      table.columns.map((column: Column) => {
        if (
          column.allowNull &&
          column.dataType.isArray &&
          schemaUtil.isCircularRelation(table, column, schema) &&
          schemaUtil.circularRelationIsArray(table, column, schema) &&
          !schemaUtil.circularRelationIsRequired(table, column, schema) &&
          !typeUtil.isDefaultType(column.dataType.type)
        ) {
          column.dataType.relationType = 'n-n';
          column.dataType.isRelationHolder = true;
        }

        return column;
      });

      return table;
    });

    return updatedSchema;
  }
}
