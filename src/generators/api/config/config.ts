/**
 * Class which generated string content for configuration file (based on env variable)
 *
 * @export
 * @class Config
 */
export class Config {
  /**
   * Generate config file string content based on env variable
   * @return {string} - string generated content
   */
  public getConfig(): string {
    const config: Object = {
      development: {
        morgan: 'dev',
        APP_PORT: process.env.PORT || 3000,
      },
      production: {
        morgan: 'combined',
        APP_PORT: process.env.PORT || 3000,
      },
    };

    return `module.exports = ${JSON.stringify(config, undefined, 2)};`;
  }

  /**
   * Generate index file string content from /config folder which returns Environment variables by ENV key
   * @return {string} - string generated content
   */
  public getEnvBasedConfig(): string {
    return `const config = require('./config');

module.exports = {
  getEnvBasedConfig: () => {
    return (config[process.env.NODE_ENV] || config['development']);
  }
};`;
  }
}

export default new Config();
