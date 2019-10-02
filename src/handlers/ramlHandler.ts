import BaseHandler from './baseHandler';
import * as ramlParser from 'raml-1-parser';
import utils from '../commons/utils/utils';
import { Schema, Table, RamlColumnSchema, RamlType } from '../commons/types';

/**
 * Raml Handler.
 *
 * @export
 * @extends {BaseHandler}
 */
export default class RamlHandler extends BaseHandler {
  /**
   * Path of raml spec.
   *
   */
  private readonly path: string;
  /**
   * Constructor for the RamlHandler.
   *
   * @param  options Spec path.
   */
  public constructor(options: { path: string }) {
    super('raml');
    this.path = options.path;
  }

  /**
   * Parse raml spec file and return a normalized schema.
   *
   * @returns parsed schema.
   */
  public async parseSchema(): Promise<Schema> {
    return new Promise<Schema>((resolve: Function, reject: Function): void => {
      try {
        const schema: Schema = [];
        const types: RamlType[] = ((ramlParser.loadApiSync(this.path).expand()) as { types: Function }).types();
        types.forEach((type: RamlType) => {
          const columns: RamlColumnSchema[] = type.toJSON({ serializeMetadata: false })[type.name()].properties;
          const table: Table = {
            name: utils.toTableName(type.name()),
            columns: [],
          };

          Object.keys(columns).map((name: string) => {
            table.columns.push(this.normalizeColumnSchema(columns[name]));
          });

          schema.push(table);
        });

        resolve(this.normalizeRelations(schema));
      } catch (e) {
        reject(new Error('Incorrect RAML file!'));
      }
    });
  }

}
