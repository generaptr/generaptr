const logger = require('bunyan');
const path = require('path');

const log = logger.createLogger({
  name: 'generatr',
  serializers: logger.stdSerializers,
  streams: [
    {
      type: 'file',
      path: path.join(__dirname, '../../debug-log.json'),
    },
  ],
});

// make sure that uncaught exceptions are logged before exiting
process.on('uncaughtException', (err) => {
  console.log(err);
  /* istanbul ignore next */
  log.fatal(err, 'Uncaught exception');
});

process.on('exit', (code) => {
  console.log(code);
  /* istanbul ignore next */
  log.error({exitCode: code}, `Exiting with status code: ${code}`);
});

process.on('warning', (warning) => {
  /* istanbul ignore next */
  log.warn(warning, 'Warning triggered');
});

process.on('unhandledRejection', (reason, promise) => {
  console.log(reason);
  /* istanbul ignore next */
  log.fatal(reason, `Unhandled rejection: ${reason.message}`);
});

module.exports = log;
