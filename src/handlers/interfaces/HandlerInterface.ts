import Schema from '../../types/Schema';
import ParserInterface from './ParserInterface';

export default interface HandlerInterface<T> {

  getSchema(): Promise<Schema>;
  getParser(): ParserInterface<T>;
}
