/**
 * Class which contains UtilGenerator generated content class.
 *
 * @export
 * @class Util
 */
export class UtilGenerator {

  /**
   * This method returns UtilGenerator class string content
   * @return {string} - UtilGenerator class content as string
   */
  public getUtil(): string {
    return `class Util {
  generateLocationUri(request, id) {
    return request.protocol + '://' + request.get('host') + request.originalUrl + '/' + id;
  }
}

module.exports = new Util();`;
  }
}

export default new UtilGenerator();
