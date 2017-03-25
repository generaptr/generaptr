const assert = require('assert');
const cli = '../lib/cli.js';
const exec = require('child_process').exec;

describe('print', () => {
  it('should throw an error without a host provided', () => {
    exec(`${cli} -h`, (err, stdout, stderr) => {
      assert.equal('[ generaptr ] Error: Host not provided.', stdout);
    });
  });

  it('should throw an error without a port provided', () => {
    exec(`${cli} -h`, (err, stdout, stderr) => {
      assert.equal('[ generaptr ] Error: Port not provided.', stdout);
    });
  });

  it('should throw an error without a databse provided', () => {
    exec(`${cli} -h`, (err, stdout, stderr) => {
      assert.equal('[ generaptr ] Error: Database not provided.', stdout);
    });
  });

  it('should throw an error without a username provided', () => {
    exec(`${cli} -h`, (err, stdout, stderr) => {
      assert.equal('[ generaptr ] Error: Username not provided.', stdout);
    });
  });

  it('should throw an error without a Password provided', () => {
    exec(`${cli} -h`, (err, stdout, stderr) => {
      assert.equal('[ generaptr ] Error: Password not provided.', stdout);
    });
  });

});