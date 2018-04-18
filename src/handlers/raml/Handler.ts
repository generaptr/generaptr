import HandlerInterface from '../interfaces/HandlerInterface';
import RamlParser from './Parser';
import { RawRamlColumn } from './types';
import Schema from '../../types/Schema';

export default class RamlHandler implements HandlerInterface<RawRamlColumn> {

  private parser: RamlParser;

  public constructor() {
    this.parser = new RamlParser();
    return this;
  }

  public getParser(): RamlParser {
    return this.parser;
  }

  public async getSchema(): Promise<Schema> {
    return Promise.resolve(new Schema());
  }

}
