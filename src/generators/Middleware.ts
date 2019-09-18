import {getContent} from '../utils/file';
import * as mustache from 'mustache';
import * as path from 'path';

export default class MiddlewareGenerator {
  
  generate(type: 'log' | 'requestId'): string {
    const template:string = getContent(path.join(__dirname, `../boilerplates/middlewares/${type}.mst`));
    return mustache.render(template, {});
  }
};
