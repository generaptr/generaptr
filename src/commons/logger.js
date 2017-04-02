const logger = require('bunyan');
const path = require('path');

const log = logger.createLogger({
  name: 'generatr',
  serializers: logger.stdSerializers,
  streams: [
    {
      type: 'file',
      path: path.join(__dirname, '../../debug-log.json')
    }
  ]
});

// make sure that uncaught exceptions are logged before exiting
process.on('uncaughtException', function (err) {
  log.fatal(err, "Uncaught exception");
});

process.on('exit', (code) => {
  log.error({exitCode: code}, "Exiting with status code: " + code);
});

process.on('warning', (warning) => {
  log.warn(warning, "Warning triggered");
});

process.on('unhandledRejection', (reason, promise) => {
  log.fatal(reason, "Unhandled rejection: " + reason.message);
});

module.exports = log;