import Schema from '../../types/Schema';
import Column from '../../types/Column';

export default interface ParserInterface<T> {

  normalizeRelations(schema: Schema): Schema;

  normalizeColumn(column: T): Column;
}
