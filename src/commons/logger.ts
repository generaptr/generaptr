import config from '../configs/config';
import bunyan from '../configs/logger';

/**
 * Logger class used in the project.
 *
 * @export
 */
export class Logger {

  /**
   * Log error message
   */
  /* istanbul ignore next */
  public error(message: string): void {
    if (config.ENV === 'dev') {
      bunyan.error(message);
    }
  }

  /**
   * Logs info message.
   *
   */
  /* istanbul ignore next */
  public info(message: string): void {
    if (config.ENV === 'dev' || config.ENV === 'test') {
      bunyan.info(message);
    }
  }

  /**
   * Log warn message.
   *
   */
  /* istanbul ignore next */
  public warn(message: string): void {
    if (config.ENV === 'dev' || config.ENV === 'test') {
      bunyan.warn(message);
    }
  }
}

export default new Logger();
