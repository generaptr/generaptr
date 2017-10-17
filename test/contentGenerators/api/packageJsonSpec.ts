import * as assert from 'assert';
import packageJsonGenerator from '../../../src/contentGenerators/api/packageJson';
import apiMocks from '../../testUtils/apiMocks';

import { PackageJson } from "../../../src/commons/types";

describe('Suite for testing the PackageJsonGenerator class', () => {

  it('should know how to generate a valid package json', () => {

    const generated: PackageJson = packageJsonGenerator.getPackageJson(apiMocks.PACKAGE_JSON_CONFIG, 'MySql');

    assert.equal(generated.name, apiMocks.VALID_PACKAGE_JSON.name);
    assert.equal(generated.version, apiMocks.VALID_PACKAGE_JSON.version);
    assert.equal(generated.description, apiMocks.VALID_PACKAGE_JSON.description);
    assert.equal(generated.main, apiMocks.VALID_PACKAGE_JSON.main);
    assert.deepEqual(generated.scripts, apiMocks.VALID_PACKAGE_JSON.scripts);
    assert.equal(generated.author, apiMocks.VALID_PACKAGE_JSON.author);
    assert.equal(generated.license, apiMocks.VALID_PACKAGE_JSON.license);
    assert.deepEqual(generated.dependencies, apiMocks.VALID_PACKAGE_JSON.dependencies);
  });

  it('should know how to return a valid package json as string', () => {
    assert.equal(
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
    const validScripts: {[key: string]: string} = {
      'test': 'echo \'Error: no test specified\' && exit 1',
      'start': 'node src/index.js',
      'start:dev': './node_modules/.bin/nodemon src/index.js',
    };
    const generated: PackageJson = packageJsonGenerator.getPackageJson(apiMocks.PACKAGE_JSON_CONFIG, 'unknown driver');
    assert.deepEqual(generated.scripts, validScripts);
  });
});
