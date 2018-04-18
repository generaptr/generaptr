import ParserInterface from '../interfaces/ParserInterface';

import { RawRamlColumn } from './types';
import Column from '../../types/Column';
import Schema from '../../types/Schema';

export default class RamlParser implements ParserInterface<RawRamlColumn> {

  public normalizeColumn(data: RawRamlColumn): Column {
    
  }

  public normalizeRelations(schema: Schema): Schema {
    return schema;
  }
}
