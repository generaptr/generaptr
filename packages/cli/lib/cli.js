import { styleText } from 'node:util';
import figlet from 'figlet';
import inquirer from 'inquirer';
import * as action from './tracks/action.js';

console.clear();
console.log(
  styleText('cyan', figlet.textSync('generaptr', { horizontalLayout: 'full' })),
);

try {
  await action.handler(await inquirer.prompt(action.questions));
} catch (error) {
  console.log(styleText('red', error.message));
  process.exitCode = 1;
}
