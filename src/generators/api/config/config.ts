export class Config {
  public getConfig(): string {
    const config: Object = {
      development: {
        morgan: 'dev',
        APP_PORT: process.env.PORT || 3000
      },
      production: {
        morgan: 'combined',
        APP_PORT: process.env.PORT || 3000
      }
    };

    return `module.exports = ${JSON.stringify(config, undefined, 2)};`
  }

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