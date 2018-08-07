import {getContent} from '../utils/file';
import * as mustache from 'mustache';
import * as path from 'path';

export default class ControllerGenerator {
  
  generate(type: 'express', options: {entity: string}): string {
    const template:string = getContent(path.join(__dirname, `../boilerplates/controllers/${type}.mst`));
    return mustache.render(template, options);
  }
  
};
