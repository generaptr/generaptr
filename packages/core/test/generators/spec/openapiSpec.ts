import assert from 'node:assert';
import { compileErrors, validate } from '@readme/openapi-parser';
import { DbColumn, DbTable } from '../../../src/commons/types';
import { openApiDocument, tablesFromOpenApi } from '../../../src/generators/spec/openapi';

const column = (name: string, columnType: string, extra: Partial<DbColumn> = {}): DbColumn => ({
  name, columnType, nullable: false, primary: false, unique: false, autoIncrement: false, ...extra,
});

const info = { name: 'demo-api', version: '1.2.3', description: 'Demo', author: '', license: 'MIT' };

const tables: DbTable[] = [
  {
    name: 'users',
    columns: [
      column('id', 'int unsigned', { primary: true, autoIncrement: true }),
      column('firstName', 'varchar(255)', { nullable: true }),
      column('email', 'varchar(50)', { unique: true }),
      column('active', 'tinyint(1)'),
      column('role', "enum('admin','member')"),
      column('balance', 'decimal(10,2)', { nullable: true }),
      column('created_at', 'datetime'),
    ],
  },
  {
    name: 'accounts',
    columns: [
      column('id', 'int unsigned', { primary: true, autoIncrement: true }),
      column('user_id', 'int unsigned', { unique: true, references: { table: 'users', column: 'id' } }),
    ],
  },
  {
    name: 'users_groups',
    columns: [
      column('user_id', 'int unsigned', { primary: true, references: { table: 'users', column: 'id' } }),
      column('group_id', 'int unsigned', { primary: true }),
    ],
  },
];

describe('OpenAPI generator', () => {
  it('writes a valid OpenAPI 3.1 document', async () => {
    const result = await validate(structuredClone(openApiDocument(tables, info)) as never);
    assert.ok(result.valid, result.valid ? '' : compileErrors(result));
  });

  it('describes the routes the generated API serves', () => {
    const doc = openApiDocument(tables, info);
    assert.deepStrictEqual(Object.keys(doc.paths), ['/users', '/users/{id}', '/accounts', '/accounts/{id}']);
    assert.deepStrictEqual(doc.info, { title: 'demo-api', version: '1.2.3', description: 'Demo' });
  });

  it('describes rows with the keys and types the API returns', () => {
    const users = openApiDocument(tables, info).components.schemas.Users;
    assert.deepStrictEqual(users.properties.firstName.type, ['string', 'null']);
    assert.strictEqual(users.properties.firstName.maxLength, 255);
    assert.strictEqual(users.properties.active.type, 'boolean');
    assert.deepStrictEqual(users.properties.role.enum, ['admin', 'member']);
    assert.strictEqual(users.properties.createdAt.format, 'date-time');
    assert.strictEqual(users.properties.id.minimum, 0);
  });

  it('requires on create only the columns the database cannot fill', () => {
    const input = openApiDocument(tables, info).components.schemas.UsersInput;
    assert.deepStrictEqual(input.required, ['email', 'active', 'role', 'createdAt']);
    assert.strictEqual(input.properties.id, undefined);
  });

  it('reads its own document back to the same tables', () => {
    assert.deepStrictEqual(tablesFromOpenApi(openApiDocument(tables, info)), tables);
  });

  it('reads a third-party document by convention', () => {
    const doc = {
      openapi: '3.1.0',
      info: { title: 'pets', version: '1' },
      components: {
        schemas: {
          Pet: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'integer' },
              name: { type: 'string', maxLength: 80 },
              tag: { type: 'string' },
              weight: { type: 'number' },
              vaccinated: { type: 'boolean' },
              kind: { type: 'string', enum: ['cat', 'dog'] },
              born: { type: 'string', format: 'date' },
            },
          },
        },
      },
    };
    assert.deepStrictEqual(tablesFromOpenApi(doc), [{
      name: 'Pet',
      columns: [
        column('id', 'int', { primary: true, autoIncrement: true }),
        column('name', 'varchar(80)'),
        column('tag', 'text', { nullable: true }),
        column('weight', 'double', { nullable: true }),
        column('vaccinated', 'tinyint(1)', { nullable: true }),
        column('kind', "enum('cat','dog')", { nullable: true }),
        column('born', 'date', { nullable: true }),
      ],
    }]);
  });
});
