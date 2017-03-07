const assert = require('assert');
const cli = '../lib/cli.js';
const exec = require('child_process').exec;

describe('print', () => {
    it('should throw an error when empty options', () => {
        exec(`${cli} -m`, (err, stdout, stderr) => {
            assert.equal('[ generaptr ],  Error: no message defined to print!', stdout);
        });
    });

    it('should print a string', () => {
        exec(`${cli} -m "Test"`, (err, stdout, stderr) => {
            assert.equal('[ generaptr ] Test', stdout);
        });
    });
});