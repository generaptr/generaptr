import {getContent} from '../utils/file';
import * as mustache from 'mustache';
import * as path from 'path';

export default class ConfigGenerator {
  
  generate(options: {}): string {
    const template:string = getContent(path.join(__dirname, '../boilerplates/configs/index.mst'));
    return mustache.render(template, options);
  }
  
};
