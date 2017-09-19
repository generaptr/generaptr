/**
 * Class which generates string content for cors.js configuration file
 *
 * @export
 * @class Cors
 */
export class Cors {
  /**
   * Get cors.js configuration file string content
   * @return {string} - string generated content
   */
  public getCorsConfig(): string {
    return `module.exports = (request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    next();
};`;
  }
}

export default new Cors();
