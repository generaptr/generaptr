import { PackageJson, PackageJsonInfo, MapOfStrings } from '../../commons/types';

/**
 * Class which implements the logic for generating valid package.json files.
 *
 * @export
 * @class PackageJsonGenerator
 */
export class PackageJsonGenerator {

  /**
   * Generates content of package json
   *
   * @param {PackageJsonInfo} options - package json info
   * @param {string} dialect - database types
   * @returns {PackageJson} - package json content
   * @memberof PackageJsonGenerator
   */
  public getPackageJson(options: PackageJsonInfo, dialect: string): PackageJson {
    const packageJson: PackageJson = {
      name: options.name,
      version: options.version,
      description: options.description,
      main: 'index.js',
      scripts: {
        'test': 'echo \'Error: no test specified\' && exit 1',
        'start': 'node index.js',
        'start:dev': './node_modules/.bin/nodemon index.js',
      },
      author: options.author,
      license: options.license,
      dependencies: {},
    };
    Object.assign(packageJson.scripts, this.getScriptsForDb(dialect));

    return packageJson;
  }

  /**
   * Generate package.json as string
   *
   * @param {PackageJsonInfo} options - package json info
   * @param {string} dialect - database type
   * @returns {string} - package json as string
   * @memberof PackageJsonGenerator
   */
  public getPackageJsonAsString(options: PackageJsonInfo, dialect: string): string {
    return JSON.stringify(this.getPackageJson(options, dialect), undefined, 2);
  }

  /**
   * Based on database type generates some helpfull scripts for it
   *
   * @private
   * @param {string} databaseType - database type
   * @returns {MapOfStrings} - map of helpull scripts
   * @memberof PackageJsonGenerator
   */
  private getScriptsForDb(databaseType: string): MapOfStrings {
    switch (databaseType) {
      case 'MySql':
        return {
          'db:migrate': './node_modules/.bin/sequelize db:migrate --env development --config ./src/configs/index.js',
          'db:create-migration': `./node_modules/.bin/sequelize migration:create --env development --config ./src/configs/index.js`,
        };
      default:
        return {};
    }
  }
}

export default new PackageJsonGenerator();
