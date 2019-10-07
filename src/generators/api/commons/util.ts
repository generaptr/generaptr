/**
 * Class which contains Util generated content class.
 *
 * @export
 */
export class Util {

  /**
   * This method returns Util class string content
   * @return  - Util class content as string
   */
  public getUtil(): string {
    return `module.exports = generateLocationUri = (request, id) => request.protocol + '://' + request.get('host') + request.originalUrl + '/' + id;`;
  }

  /**
   * This method returns a custom Error class
   * @returns - AppError class as string
   */
  public getAppError(): string {
    return `module.exports = class AppError extends Error {

  constructor(message, status = 400, type, data) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.status = status;
    this.type = type;
    this.data = data;
  }

};`;
  }
}

export default new Util();
