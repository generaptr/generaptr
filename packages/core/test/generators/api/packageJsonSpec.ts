import * as assert from 'assert';
import packageJsonGenerator from '../../../src/generators/api/packageJson';
import apiMocks from '../../testUtils/apiMocks';

import { PackageJson } from "../../../src/commons/types";

describe('Suite for testing the PackageJsonGenerator class', () => {

  it('should know how to generate a valid package json', () => {

    const generated: PackageJson = packageJsonGenerator.getPackageJson(apiMocks.PACKAGE_JSON_CONFIG, 'MySql');

    assert.strictEqual(generated.name, apiMocks.VALID_PACKAGE_JSON.name);
    assert.strictEqual(generated.version, apiMocks.VALID_PACKAGE_JSON.version);
    assert.strictEqual(generated.description, apiMocks.VALID_PACKAGE_JSON.description);
    assert.strictEqual(generated.main, apiMocks.VALID_PACKAGE_JSON.main);
    assert.deepStrictEqual(generated.scripts, apiMocks.VALID_PACKAGE_JSON.scripts);
    assert.strictEqual(generated.author, apiMocks.VALID_PACKAGE_JSON.author);
    assert.strictEqual(generated.license, apiMocks.VALID_PACKAGE_JSON.license);
    assert.deepStrictEqual(generated.dependencies, apiMocks.VALID_PACKAGE_JSON.dependencies);
  });

  it('should know how to return a valid package json as string', () => {
    assert.strictEqual(
      packageJsonGenerator.getPackageJsonAsString(
        apiMocks.PACKAGE_JSON_CONFIG,
        'MySql',
      ),
      JSON.stringify(
        apiMocks.VALID_PACKAGE_JSON,
        undefined,
        2,
      ),
    );
  });

  it('should not generate scripts for an unknown database dialect', () => {
    const validScripts: { [key: string]: string } = {
      'test': 'echo \'Error: no test specified\' && exit 1',
      'start': 'node src/index.js',
      'start:dev': './node_modules/.bin/nodemon src/index.js',
    };
    const generated: PackageJson = packageJsonGenerator.getPackageJson(apiMocks.PACKAGE_JSON_CONFIG, 'unknown driver');
    assert.deepStrictEqual(generated.scripts, validScripts);
  });
});
