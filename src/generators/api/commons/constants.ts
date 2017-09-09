export class Constants {
  public getStatusCode(): string {
    const statuses: Object = {
      OK: 200,
      CREATED: 201,
      NO_CONTENT: 204,
      FOUND: 302,
      SEE_OTHER: 303,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      METHOD_NOT_ALLOWED: 405,
      CONFLICT: 409,
      INTERNAL_SERVER_ERROR: 500,
      BAD_GATEWAY: 502
    };

    return `module.exports = ${JSON.stringify(statuses, undefined, 2)};`;
  };
}

export default new Constants();