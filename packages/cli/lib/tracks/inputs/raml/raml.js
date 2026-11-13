import { styleText } from 'node:util';
import { handlers } from 'generaptr';

export const questions = [
  {
    name: 'path',
    type: 'input',
    message: 'Path to the RAML specification: ',
    validate: (value) => {
      if (value.length) {
        return true;
      }
      console.log(styleText('red', 'Path to the RAML specification not provided.'));

      return false;
    },
  },
];

export const handler = (data) => {
  const ramlHandler = new handlers.RAML(data);

  return ramlHandler.parseSchema();
};
