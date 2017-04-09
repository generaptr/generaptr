const BaseValidator = require('./BaseValidator');

class MysqlConnectionValidator extends BaseValidator {

  isValid(data) {
    let valid = true;
    if (!(data && data.host && typeof data.host === 'string')) {
      valid = false;
      this.trigger('Host not provided.');
    }

    if (!(data && data.port && !isNaN(parseInt(data.port)))) {
      valid = false;
      this.trigger('Valid port not provided.');
    }

    if (!(data && data.database && typeof data.database === 'string')) {
      valid = false;
      this.trigger('Database not provided.');
    }

    if (!(data && data.user && typeof data.user === 'string')) {
      valid = false;
      this.trigger('User not provided.');
    }

    return valid;
  }
}

module.exports = new MysqlConnectionValidator();
