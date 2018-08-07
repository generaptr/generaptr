import {getContent} from '../utils/file';
import * as mustache from 'mustache';
import * as path from 'path';

export default class ControllerGenerator {
  
  generate(): string {
    const template:string = getContent(path.join(__dirname, `../boilerplates/entrypoints/server.mst`));
    return mustache.render(template, {});
  }
  
};
