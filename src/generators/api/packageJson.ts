import { PackageJson, PackageJsonInfo, MapOfStrings } from '../../commons/types';

/**
 * Class which implements the logic for generating valid package.json files.
 *
 * @export
 */
export class PackageJsonGenerator {

  /**
   * Generates content of package json
   *
   * @param options - package json info
   * @param  dialect - database types
   * @returns  - package json content
   */
  public getPackageJson(options: PackageJsonInfo, dialect: string): PackageJson {
    const packageJson: PackageJson = {
      name: options.name,
      version: options.version,
      description: options.description,
      main: 'index.js',
      scripts: {
        'test': 'echo \'Error: no test specified\' && exit 1',
        'start': 'node src/index.js',
        'start:dev': './node_modules/.bin/nodemon src/index.js',
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
   * @param options - package json info
   * @param  dialect - database type
   * @returns  - package json as string
   */
  public getPackageJsonAsString(options: PackageJsonInfo, dialect: string): string {
    return JSON.stringify(this.getPackageJson(options, dialect), undefined, 2);
  }

  /**
   * Based on database type generates some helpfull scripts for it
   *
   * @param  databaseType - database type
   * @returns  - map of helpull scripts
   */
  private getScriptsForDb(databaseType: string): MapOfStrings {
    switch (databaseType) {
      case 'MySql':
        return {
          'db:migrate': './node_modules/.bin/sequelize db:migrate --env development --config ./src/configs/database.js',
          'db:create-migration': `./node_modules/.bin/sequelize migration:create --env development --config ./src/configs/database.js`,
        };
      default:
        return {};
    }
  }
}

export default new PackageJsonGenerator();
