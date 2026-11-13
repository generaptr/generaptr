import assert from 'node:assert';
import { compileErrors, validate } from '@readme/openapi-parser';
import { DbColumn, DbIndex, DbTable } from '../../../src/commons/types.js';
import { openApiDocument, tablesFromOpenApi } from '../../../src/generators/spec/openapi.js';

const column = (name: string, columnType: string, extra: Partial<DbColumn> = {}): DbColumn => ({
  name, columnType, nullable: false, autoIncrement: false, ...extra,
});

type Doc = ReturnType<typeof openApiDocument>;
const postgresTables: DbTable[] = [{
  name: 'users', columns: [column('id', 'integer'), column('name', 'text')], primaryKey: { name: 'users_pkey', columns: ['id'] },
}];

const info = { name: 'demo-api', version: '1.2.3', description: 'Demo', author: '', license: 'MIT' };

const tables: DbTable[] = [
  {
    name: 'users',
    columns: [
      column('id', 'int unsigned', { autoIncrement: true }),
      column('firstName', 'varchar(255)', { nullable: true }),
      column('email', 'varchar(50)'),
      column('active', 'tinyint(1)'),
      column('role', "enum('admin','member')"),
      column('balance', 'decimal(10,2)', { nullable: true }),
      column('created_at', 'datetime'),
    ],
    primaryKey: { name: 'PRIMARY', columns: ['id'] },
    uniques: [{ name: 'email', columns: ['email'] }],
  },
  {
    name: 'accounts',
    columns: [
      column('id', 'int unsigned', { autoIncrement: true }),
      column('user_id', 'int unsigned'),
    ],
    primaryKey: { name: 'PRIMARY', columns: ['id'] },
    uniques: [{ name: 'user_id', columns: ['user_id'] }],
    foreignKeys: [{ name: 'accounts_ibfk_1', columns: ['user_id'], table: 'users', foreignColumns: ['id'], onDelete: 'cascade' }],
  },
  {
    name: 'users_groups',
    columns: [
      column('user_id', 'int unsigned'),
      column('group_id', 'int unsigned'),
    ],
    primaryKey: { name: 'PRIMARY', columns: ['user_id', 'group_id'] },
    foreignKeys: [{ name: 'users_groups_ibfk_1', columns: ['user_id'], table: 'users', foreignColumns: ['id'] }],
  },
];

describe('OpenAPI generator', () => {
  it('writes a valid OpenAPI 3.1 document', async () => {
    const result = await validate(structuredClone(openApiDocument({ dialect: 'mysql', tables }, info)) as never);
    assert.ok(result.valid, result.valid ? '' : compileErrors(result));
  });

  it('describes the routes the generated API serves', () => {
    const doc = openApiDocument({ dialect: 'mysql', tables }, info);
    assert.deepStrictEqual(Object.keys(doc.paths), ['/users', '/users/{id}', '/accounts', '/accounts/{id}']);
    assert.deepStrictEqual(doc.info, { title: 'demo-api', version: '1.2.3', description: 'Demo' });
  });

  it('describes rows with the keys and types the API returns', () => {
    const users = openApiDocument({ dialect: 'mysql', tables }, info).components.schemas.Users;
    assert.deepStrictEqual(users.properties.firstName.type, ['string', 'null']);
    assert.strictEqual(users.properties.firstName.maxLength, 255);
    assert.strictEqual(users.properties.active.type, 'boolean');
    assert.deepStrictEqual(users.properties.role.enum, ['admin', 'member']);
    assert.strictEqual(users.properties.createdAt.format, 'date-time');
    assert.strictEqual(users.properties.id.minimum, 0);
  });

  it('describes ?with and the related rows it adds', () => {
    const doc = openApiDocument({ dialect: 'mysql', tables }, info);
    const get = (doc.paths['/accounts/{id}'] as any).get;
    const withParameter = get.parameters.find((parameter: { name: string }) => parameter.name === 'with');
    assert.deepStrictEqual(withParameter.schema, { type: 'array', items: { type: 'string', enum: ['user'] } });
    assert.strictEqual(withParameter.explode, false);
    assert.deepStrictEqual(get.responses[200].content['application/json'].schema.allOf[1].properties.user, {
      anyOf: [{ $ref: '#/components/schemas/Users' }, { type: 'null' }],
    });
    const list = (doc.paths['/users'] as any).get.responses[200].content['application/json'].schema.items;
    assert.deepStrictEqual(list.allOf[1].properties.accounts, { type: 'array', items: { $ref: '#/components/schemas/Accounts' } });
  });

  it('describes Postgres arrays and precise timestamps', () => {
    const doc = openApiDocument({
      dialect: 'postgresql',
      tables: [{ name: 'posts', primaryKey: { name: 'posts_pkey', columns: ['id'] }, columns: [
        column('id', 'integer', { autoIncrement: true }),
        column('tags', 'text[]', { nullable: true }),
        column('seen_at', 'timestamp(3) with time zone'),
      ] }],
    }, info);
    const { tags, seenAt } = doc.components.schemas.Posts.properties;
    assert.deepStrictEqual(tags.type, ['array', 'null']);
    assert.deepStrictEqual(tags.items, { type: 'string' });
    assert.strictEqual(seenAt.format, 'date-time');
  });

  it('requires on create only the columns the database cannot fill', () => {
    const input = openApiDocument({ dialect: 'mysql', tables }, info).components.schemas.UsersInput;
    assert.deepStrictEqual(input.required, ['email', 'active', 'role', 'createdAt']);
    assert.strictEqual(input.properties.id, undefined);
  });

  it('reads its own document back to the same tables', () => {
    assert.deepStrictEqual(tablesFromOpenApi(openApiDocument({ dialect: 'mysql', tables }, info), 'mysql'), { dialect: 'mysql', tables });
  });

  it.each(["'it''s'", '0', '-1.5', 'true', 'null', 'now()', 'CURRENT_TIMESTAMP', "'{}'::jsonb", "'a'::character varying(20)"])(
    'keeps the default %s from a document',
    (value: string) => {
      const withDefault: DbTable[] = [{ name: 'users', columns: [column('id', 'int', { default: value })], primaryKey: { name: 'PRIMARY', columns: ['id'] } }];
      const doc = openApiDocument({ dialect: 'mysql', tables: withDefault }, info);
      assert.strictEqual(tablesFromOpenApi(doc, 'mysql').tables[0].columns[0].default, value);
    },
  );

  it.each(["'x'); DROP TABLE users; --", '1; DROP TABLE users', "'a\\'", 'pg_sleep(10)', '(select 1)'])(
    'rejects the default %s from a document',
    (value: string) => {
      const withDefault: DbTable[] = [{ name: 'users', columns: [column('id', 'int', { default: value })], primaryKey: { name: 'PRIMARY', columns: ['id'] } }];
      const doc = openApiDocument({ dialect: 'mysql', tables: withDefault }, info);
      assert.throws(() => tablesFromOpenApi(doc, 'mysql'), /Unsafe default/);
      assert.throws(() => tablesFromOpenApi(doc, 'postgresql'), /Unsafe default/);
    },
  );

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
    assert.deepStrictEqual(tablesFromOpenApi(doc, 'mysql').tables, [{
      name: 'Pet',
      primaryKey: { name: 'PRIMARY', columns: ['id'] },
      columns: [
        column('id', 'int', { autoIncrement: true }),
        column('name', 'varchar(80)'),
        column('tag', 'text', { nullable: true }),
        column('weight', 'double', { nullable: true }),
        column('vaccinated', 'tinyint(1)', { nullable: true }),
        column('kind', "enum('cat','dog')", { nullable: true }),
        column('born', 'date', { nullable: true }),
      ],
    }]);
  });

  it('converts its own MySQL document to Postgres types and keeps the keys', () => {
    const { dialect, tables: converted } = tablesFromOpenApi(openApiDocument({ dialect: 'mysql', tables }, info), 'postgresql');
    assert.strictEqual(dialect, 'postgresql');
    assert.deepStrictEqual(converted[0].columns.map((c: DbColumn) => [c.name, c.columnType, c.enumName]), [
      ['id', 'integer', undefined],
      ['firstName', 'character varying(255)', undefined],
      ['email', 'character varying(50)', undefined],
      ['active', 'boolean', undefined],
      ['role', "enum('admin','member')", 'users_role'],
      ['balance', 'numeric(10,2)', undefined],
      ['created_at', 'timestamp with time zone', undefined],
    ]);
    assert.deepStrictEqual(converted[1].foreignKeys, tables[1].foreignKeys);
    assert.deepStrictEqual(converted[0].primaryKey, { name: 'users_pkey', columns: ['id'] });
    assert.strictEqual(converted[0].columns[0].autoIncrement, true);
  });

  it.each([
    ['an action that is not one', { foreignKeys: [{ name: 'fk', columns: ['id'], table: 'users', foreignColumns: ['id'], onDelete: 'cascade; DROP TABLE users' }] }, /Invalid referential action/],
    ['columns that are not a list', { primaryKey: { name: 'pk', columns: 'id' } }, /Invalid x-keys/],
    ['a name that is not a string', { uniques: [{ name: { toString: 'x' }, columns: ['id'] }] }, /Invalid x-keys/],
    ['a key name with SQL in it', { uniques: [{ name: 'u"; DROP TABLE users; --', columns: ['id'] }] }, /Unsafe name/],
  ])('rejects x-keys with %s', (_case: string, keys: object, error: RegExp) => {
    const doc: Doc = structuredClone(openApiDocument({ dialect: 'mysql', tables }, info));
    doc.components.schemas.Users['x-keys'] = keys;
    assert.throws(() => tablesFromOpenApi(doc, 'mysql'), error);
  });

  it('builds keys from x-keys fields only', () => {
    const doc: Doc = structuredClone(openApiDocument({ dialect: 'mysql', tables }, info));
    doc.components.schemas.Users['x-keys'] = { ...doc.components.schemas.Users['x-keys'], name: 'evil', columns: [] };
    const [users] = tablesFromOpenApi(doc, 'mysql').tables;
    assert.strictEqual(users.name, 'users');
    assert.strictEqual(users.columns.length, tables[0].columns.length);
  });

  it('reads CHECK constraints back, and leaves them out in another dialect', () => {
    const checks = [{ name: 'users_role_known', expression: "(`role` in (_utf8mb4'a;b',_utf8mb4'it''s'))" }];
    const doc = openApiDocument({ dialect: 'mysql', tables: [{ ...tables[0], checks }] }, info);
    assert.deepStrictEqual(tablesFromOpenApi(doc, 'mysql').tables[0].checks, checks);
    assert.strictEqual(tablesFromOpenApi(doc, 'postgresql').tables[0].checks, undefined);
  });

  it.each([
    ['mysql', 'amount > 0); DROP TABLE users; --'],
    ['mysql', 'amount > 0 -- comment'],
    ['mysql', 'amount > 0 /* comment */'],
    ['mysql', 'amount > 0 # comment'],
    ['mysql', 'amount > 0\nOR true'],
    ['mysql', 'amount > 0) OR (1 = 1'],
    ['mysql', 'amount > (0'],
    ['mysql', "name = 'open"],
    ['mysql', "name = 'it\\'s'"],
    ['postgresql', "name = E'\\' ) OR (true'"],
    ['postgresql', 'name = `a`'],
    ['postgresql', 'name = $$a$$'],
  ] as const)('rejects the %s CHECK expression %s from a document', (dialect: 'mysql' | 'postgresql', expression: string) => {
    const doc: Doc = structuredClone(openApiDocument({ dialect, tables: dialect === 'mysql' ? tables : postgresTables }, info));
    doc.components.schemas.Users['x-checks'] = [{ name: 'users_check', expression }];
    assert.throws(() => tablesFromOpenApi(doc, dialect), /Unsafe expression/);
  });

  it('reads indexes back, and leaves them out in another dialect', () => {
    const indexes: DbIndex[] = [
      { name: 'users_name_idx', keys: ['name', '(lower(name)) DESC NULLS LAST'], where: '(id > 0)' },
      { name: 'users_name_gin', unique: true, method: 'gin', keys: ['name gin_trgm_ops'], with: { fastupdate: 'off' } },
    ];
    const doc = openApiDocument({ dialect: 'postgresql', tables: [{ ...postgresTables[0], indexes }] }, info);
    assert.deepStrictEqual(tablesFromOpenApi(doc, 'postgresql').tables[0].indexes, indexes);
    assert.strictEqual(tablesFromOpenApi(doc, 'mysql').tables[0].indexes, undefined);
  });

  it.each([
    ['a key that leaves its list', { name: 'i', keys: ['name); DROP TABLE users; --'] }, /Unsafe expression/],
    ['a WHERE that leaves its brackets', { name: 'i', keys: ['name'], where: 'id > 0) OR (true' }, /Unsafe expression/],
    ['a method with SQL in it', { name: 'i', method: 'gin (name); --', keys: ['name'] }, /Invalid x-indexes/],
    ['a storage parameter with SQL in it', { name: 'i', keys: ['name'], with: { 'a=1); --': '1' } }, /Invalid x-indexes/],
    ['a storage value with SQL in it', { name: 'i', keys: ['name'], with: { fillfactor: '70); --' } }, /Invalid x-indexes/],
    ['no keys', { name: 'i', keys: [] }, /Invalid x-keys/],
  ])('rejects x-indexes with %s', (_case: string, index: object, error: RegExp) => {
    const doc: Doc = structuredClone(openApiDocument({ dialect: 'postgresql', tables: postgresTables }, info));
    doc.components.schemas.Users['x-indexes'] = [index];
    assert.throws(() => tablesFromOpenApi(doc, 'postgresql'), error);
  });

  it('reads generated, identity, and collated columns back, and keeps only serials in another dialect', () => {
    const identity = { always: true, name: 'users_id_seq', start: '100', increment: '5', min: '1', max: '2147483647', cache: '1', cycle: false };
    const columns: DbColumn[] = [
      column('id', 'integer', { identity }),
      column('name', 'text', { collation: 'C' }),
      column('upper', 'text', { nullable: true, generated: { expression: 'upper(name)' } }),
    ];
    const doc = openApiDocument({ dialect: 'postgresql', tables: [{ ...postgresTables[0], columns }] }, info);
    assert.deepStrictEqual(Object.keys(doc.components.schemas.UsersInput.properties), ['name']);
    assert.deepStrictEqual(tablesFromOpenApi(doc, 'postgresql').tables[0].columns, columns);
    assert.deepStrictEqual(tablesFromOpenApi(doc, 'mysql').tables[0].columns, [
      column('id', 'int', { autoIncrement: true }),
      column('name', 'text'),
      column('upper', 'text', { nullable: true }),
    ]);
  });

  it.each([
    ['a generated expression that leaves its brackets', { generated: { expression: 'upper(name)) STORED, evil text GENERATED ALWAYS AS (1' } }, /Unsafe expression/],
    ['an identity option with SQL in it', {
      identity: { always: true, name: 'users_id_seq', start: '1) ; DROP TABLE users; --', increment: '1', min: '1', max: '9', cache: '1', cycle: false },
    }, /Invalid x-column/],
    ['an identity sequence name with SQL in it', {
      identity: { always: true, name: 'a"; DROP TABLE users; --', start: '1', increment: '1', min: '1', max: '9', cache: '1', cycle: false },
    }, /Unsafe name/],
    ['a collation with SQL in it', { collation: 'C"; DROP TABLE users; --' }, /Invalid x-column/],
  ])('rejects x-column with %s', (_case: string, extra: object, error: RegExp) => {
    const doc: Doc = structuredClone(openApiDocument({ dialect: 'postgresql', tables: postgresTables }, info));
    Object.assign(doc.components.schemas.Users.properties.name['x-column'], extra);
    assert.throws(() => tablesFromOpenApi(doc, 'postgresql'), error);
  });

  it('reads the keys of a generaptr 2 document from its columns', () => {
    const legacy = (name: string, extra: object) => ({ name, columnType: 'integer', nullable: false, autoIncrement: false, ...extra });
    const doc = {
      'x-dialect': 'postgresql' as const,
      components: { schemas: {
        Users: { 'x-table': 'users', properties: { id: { 'x-column': legacy('id', { primary: true, unique: false }) } } },
        Accounts: { 'x-table': 'accounts', properties: {
          id: { 'x-column': legacy('id', { primary: true, unique: false }) },
          userId: { 'x-column': legacy('user_id', { primary: false, unique: true, references: { table: 'users', column: 'id' } }) },
        } },
      } },
    };
    assert.deepStrictEqual(tablesFromOpenApi(doc, 'postgresql').tables[1], {
      name: 'accounts',
      columns: [column('id', 'integer'), column('user_id', 'integer')],
      primaryKey: { name: 'accounts_pkey', columns: ['id'] },
      uniques: [{ name: 'accounts_user_id_key', columns: ['user_id'] }],
      foreignKeys: [{ name: 'accounts_user_id_fkey', columns: ['user_id'], table: 'users', foreignColumns: ['id'] }],
    });
  });
});
