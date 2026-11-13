import assert from 'node:assert';
import { DbColumn, DbTable } from '../../../src/commons/types.js';
import { columnBuilder, type CustomTypes, renderApi, routedTables, schemaFile } from '../../../src/generators/api/express.js';

const column = (name: string, columnType: string, extra: Partial<DbColumn> = {}): DbColumn => ({
  name, columnType, nullable: true, autoIncrement: false, ...extra,
});

describe('Express + Drizzle generator', () => {
  it.each([
    ['int unsigned', 'int("c", { unsigned: true })'],
    ['smallint', 'smallint("c")'],
    ['bigint unsigned', 'bigint("c", { mode: \'number\', unsigned: true })'],
    ['tinyint(1)', 'boolean("c")'],
    ['decimal(10,2)', 'decimal("c", { precision: 10, scale: 2 })'],
    ['varchar(50)', 'varchar("c", { length: 50 })'],
    ['char(2)', 'char("c", { length: 2 })'],
    ["enum('a','b')", 'mysqlEnum("c", ["a","b"])'],
    ['longtext', 'longtext("c")'],
    ['datetime', 'datetime("c")'],
    ['json', 'json("c")'],
  ])('maps MySQL %s', (columnType: string, call: string) => {
    assert.strictEqual(columnBuilder(column('c', columnType)).call, call);
  });

  it.each([
    ['integer', 'integer("c")'],
    ['numeric(10,2)', 'numeric("c", { precision: 10, scale: 2 })'],
    ['character varying(50)', 'varchar("c", { length: 50 })'],
    ['timestamp with time zone', 'timestamp("c", { withTimezone: true })'],
    ['timestamp(3) with time zone', 'timestamp("c", { withTimezone: true, precision: 3 })'],
    ['timestamp(6) without time zone', 'timestamp("c", { precision: 6 })'],
    ['text[]', 'text("c").array()'],
    ['character varying(20)[]', 'varchar("c", { length: 20 }).array()'],
    ['jsonb', 'jsonb("c")'],
  ])('maps Postgres %s', (columnType: string, call: string) => {
    assert.strictEqual(columnBuilder(column('c', columnType), 'postgresql').call, call);
  });

  it.each([
    ['bytea', 'byteaType("c")', { name: 'byteaType', binary: true }],
    ['tsvector', 'tsvectorType("c")', { name: 'tsvectorType', binary: false }],
    ['text[][]', 'textArrayArrayType("c")', { name: 'textArrayArrayType', binary: false }],
  ])('writes the Postgres type %s as a custom type', (columnType: string, call: string, custom: { name: string; binary: boolean }) => {
    const customs: CustomTypes = new Map();
    assert.strictEqual(columnBuilder(column('c', columnType), 'postgresql', undefined, customs).call, call);
    assert.deepStrictEqual([...customs.values()], [custom]);
  });

  it('reuses one custom type for one SQL type', () => {
    const customs: CustomTypes = new Map();
    columnBuilder(column('a', 'tsvector'), 'postgresql', undefined, customs);
    columnBuilder(column('b', 'tsvector'), 'postgresql', undefined, customs);
    assert.strictEqual(customs.size, 1);
  });

  it('escapes enum values instead of copying them into code', () => {
    assert.strictEqual(columnBuilder(column('c', "enum('it''s','a\\b')")).call, 'mysqlEnum("c", ["it\'s","a\\\\b"])');
    assert.throws(() => columnBuilder(column('c', 'varchar(1) + evil()')), /Unsupported type/);
    assert.throws(() => columnBuilder(column('c', 'decimal(10,2);x')), /Unsupported type/);
  });

  it.each(['../evil', 'users`; drop', 'a b', '1abc'])('rejects the unsafe table name %s', (name: string) => {
    const info = { name: 'x', version: '1.0.0', description: '', author: '', license: 'MIT' };
    assert.throws(() => renderApi({ dialect: 'mysql', tables: [{ name, columns: [column('id', 'int')], primaryKey: { name: 'PRIMARY', columns: ['id'] } }] }, info), /Unsafe name/);
  });

  it('rejects an unsafe column name', () => {
    const info = { name: 'x', version: '1.0.0', description: '', author: '', license: 'MIT' };
    assert.throws(() => renderApi({ dialect: 'mysql', tables: [{ name: 'users', columns: [column('id: 1, x', 'int')] }] }, info), /Unsafe name/);
  });

  it('writes a type without a Drizzle builder as a custom type, and rejects a type that is not plain SQL', () => {
    assert.strictEqual(columnBuilder(column('shape', 'geometry')).call, 'geometryType("shape")');
    assert.throws(() => columnBuilder(column('shape', 'geometry) evil(')), /Unsupported type/);
  });

  it('writes identity, generated, collated, and ON UPDATE columns, and declares custom types once', () => {
    const postgres: string = schemaFile({ dialect: 'postgresql', tables: [{
      name: 'kinds',
      columns: [
        column('id', 'integer', { identity: { always: true, name: 'kinds_id_seq', start: '100', increment: '5', min: '1', max: '2147483647', cache: '1', cycle: false } }),
        column('upper', 'text', { generated: { expression: 'upper(title)' } }),
        column('title_c', 'text', { collation: 'C' }),
        column('payload', 'bytea'),
        column('copy', 'bytea'),
      ],
    }] });
    assert.match(postgres, /integer\("id"\)\.generatedAlwaysAsIdentity\(\{ name: "kinds_id_seq", startWith: "100", increment: "5", minValue: "1", maxValue: "2147483647", cache: "1" \}\)/);
    assert.match(postgres, /\.generatedAlwaysAs\(sql\.raw\("upper\(title\)"\)\)/);
    assert.match(postgres, /textCollateCType\("title_c"\)/);
    assert.strictEqual(postgres.match(/const byteaType = customType/g)?.length, 1);
    assert.match(postgres, /fromDriver: \(value\) => value\.toString\('base64'\)/);

    const mysql: string = schemaFile({ dialect: 'mysql', tables: [{
      name: 'kinds',
      columns: [
        column('name', 'varchar(10)', { collation: 'utf8mb4_bin' }),
        column('length', 'int', { generated: { expression: 'char_length(name)', virtual: true } }),
        column('seen_at', 'datetime(3)', { onUpdateNow: true }),
      ],
    }] });
    assert.match(mysql, /varchar\("name", \{ length: 10 \}\)\.collate\("utf8mb4_bin"\)/);
    assert.match(mysql, /\.generatedAlwaysAs\(sql\.raw\("char_length\(name\)"\), \{ mode: 'virtual' \}\)/);
    assert.match(mysql, /datetime\("seen_at", \{ fsp: 3 \}\)\.onUpdateNow\(\{ fsp: 3 \}\)/);
  });

  it('writes keys, a foreign key, and a composite primary key', () => {
    const tables: DbTable[] = [
      {
        name: 'users',
        columns: [column('id', 'int', { nullable: false, autoIncrement: true })],
        primaryKey: { name: 'PRIMARY', columns: ['id'] },
      },
      {
        name: 'users_groups',
        columns: [column('user_id', 'int', { nullable: false }), column('group_id', 'int', { nullable: false })],
        primaryKey: { name: 'PRIMARY', columns: ['user_id', 'group_id'] },
        foreignKeys: [{ name: 'users_groups_ibfk_1', columns: ['user_id'], table: 'users', foreignColumns: ['id'], onDelete: 'cascade' }],
      },
    ];
    const file: string = schemaFile({ dialect: 'mysql', tables });

    assert.match(file, /^import \{ foreignKey, int, mysqlTable, primaryKey \} from 'drizzle-orm\/mysql-core';/);
    assert.match(file, /id: int\("id"\)\.autoincrement\(\)\.primaryKey\(\),/);
    assert.match(file, /userId: int\("user_id"\)\.notNull\(\),/);
    assert.match(file, / {2}primaryKey\(\{ columns: \[table\.userId, table\.groupId\] \}\),/);
    assert.ok(file.includes(
      'foreignKey({ name: "users_groups_ibfk_1", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),',
    ));
    assert.deepStrictEqual(routedTables(tables).map((table: DbTable) => table.name), ['users']);
  });

  it('names Postgres keys as the database does, and points a self reference at the table', () => {
    const file: string = schemaFile({
      dialect: 'postgresql',
      tables: [{
        name: 'nodes',
        columns: [column('id', 'integer', { nullable: false, autoIncrement: true }), column('parent_id', 'integer'), column('slug', 'text')],
        primaryKey: { name: 'nodes_pk', columns: ['id'] },
        uniques: [{ name: 'nodes_slug_key', columns: ['slug'], nullsNotDistinct: true }],
        foreignKeys: [{
          name: 'nodes_parent_fk', columns: ['parent_id'], table: 'nodes', foreignColumns: ['id'], onDelete: 'set null', onUpdate: 'restrict',
        }],
      }],
    });
    assert.match(file, /id: serial\("id"\)\.notNull\(\),/);
    assert.ok(file.includes('primaryKey({ name: "nodes_pk", columns: [table.id] }),'));
    assert.ok(file.includes('unique("nodes_slug_key").on(table.slug).nullsNotDistinct(),'));
    assert.ok(file.includes(
      'foreignKey({ name: "nodes_parent_fk", columns: [table.parentId], foreignColumns: [table.id] }).onDelete("set null").onUpdate("restrict"),',
    ));
  });

  it('writes indexes with raw SQL keys, a method, a WHERE, and storage parameters', () => {
    const file: string = schemaFile({
      dialect: 'postgresql',
      tables: [{
        name: 'documents',
        columns: [column('title', 'text'), column('body', 'jsonb')],
        indexes: [
          { name: 'documents_title_key', unique: true, keys: ['lower(title)'], where: '(body IS NOT NULL)' },
          { name: 'documents_body_gin', method: 'gin', keys: ['body jsonb_path_ops'], with: { fastupdate: 'off' } },
        ],
      }],
    });
    assert.match(file, /^import \{ sql \} from 'drizzle-orm';\nimport \{ index, jsonb, pgTable, text, uniqueIndex \}/);
    assert.ok(file.includes('uniqueIndex("documents_title_key").on(sql.raw("lower(title)")).where(sql.raw("(body IS NOT NULL)")),'));
    assert.ok(file.includes('index("documents_body_gin").using("gin", sql.raw("body jsonb_path_ops")).with({"fastupdate":"off"}),'));
  });

  it('refuses a referential action that is not one, since Drizzle writes it into DDL', () => {
    assert.throws(() => schemaFile({
      dialect: 'mysql',
      tables: [{
        name: 'users',
        columns: [column('id', 'int')],
        foreignKeys: [{ name: 'fk', columns: ['id'], table: 'users', foreignColumns: ['id'], onDelete: 'cascade; drop' as never }],
      }],
    }), /Invalid referential action "cascade; drop"/);
  });

  it('writes database defaults as raw SQL inside a JS string', () => {
    const file: string = schemaFile({
      dialect: 'postgresql',
      tables: [{
        name: 'events',
        columns: [
          column('id', 'integer', { nullable: false, autoIncrement: true }),
          column('created_at', 'timestamp with time zone', { nullable: false, default: 'now()' }),
          column('note', 'text', { nullable: false, default: "'it''s `x` ${y}'::text" }),
        ],
        primaryKey: { name: 'events_pkey', columns: ['id'] },
      }],
    });
    assert.match(file, /^import \{ sql \} from 'drizzle-orm';\nimport \{ pgTable, serial, text, timestamp \} from 'drizzle-orm\/pg-core';/);
    assert.match(file, /createdAt: timestamp\("created_at", \{ withTimezone: true \}\)\.notNull\(\)\.default\(sql\.raw\("now\(\)"\)\),/);
    assert.ok(file.includes('note: text("note").notNull().default(sql.raw("\'it\'\'s `x` ${y}\'::text")),'));
  });
});
