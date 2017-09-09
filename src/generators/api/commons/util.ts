export class Util {
  public getUtil(): string {
    return `class Util {
  generateLocationUri(request, id) {
    return request.protocol + '://' + request.get('host') + request.originalUrl + '/' + id;
  }
}

module.exports = new Util();`;
  }
}

export default new Util();