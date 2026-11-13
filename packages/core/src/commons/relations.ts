import { camel, pascal, routedTables } from './columns.js';
import type { DbColumn, DbForeignKey, DbTable } from './types.js';

/** One Drizzle relation. `from` and `to` are column names on the source and target tables. */
export type Relation = {
  name: string;
  kind: 'one' | 'many';
  target: string;
  from: string;
  to: string;
  through?: { table: string; from: string; to: string };
};

/** A single-column foreign key to a table in the schema. */
type ForeignKey = { name: string; table: string; column: string };

// razor: composite foreign keys get no relation; Drizzle relations take column arrays if `?with=` needs them.
const foreignKeys = (table: DbTable, known: Set<string>): ForeignKey[] => (table.foreignKeys ?? [])
  .filter((key: DbForeignKey) => key.columns.length === 1 && known.has(key.table))
  .map((key: DbForeignKey) => ({ name: key.columns[0], table: key.table, column: key.foreignColumns[0] }));

/** `user_id` and `userId` become `user`. A name without an id suffix stays undefined. */
const stripId = (name: string): string | undefined => {
  const stripped: string = name.replace(/_?id$/i, '');

  return stripped && stripped !== name ? stripped : undefined;
};

/**
 * A link table has a primary key of exactly two foreign keys, or no primary key and only two columns,
 * both foreign keys. It gets no routes and no relations of its own.
 */
const linkColumns = (table: DbTable, known: Set<string>): [ForeignKey, ForeignKey] | undefined => {
  const primary: string[] = table.primaryKey?.columns ?? [];
  const candidates: string[] = primary.length ? primary : table.columns.map((column: DbColumn) => column.name);
  const keys: ForeignKey[] = foreignKeys(table, known).filter((key: ForeignKey) => candidates.includes(key.name));

  return candidates.length === 2 && keys.length === 2 ? [keys[0], keys[1]] : undefined;
};

/**
 * Names both sides of each foreign key, keyed by table name. Link tables become many-to-many relations
 * through the link table. A name never repeats a column key or another relation of the same table.
 */
export const tableRelations = (tables: DbTable[]): Map<string, Relation[]> => {
  const known: Set<string> = new Set(tables.map((table: DbTable) => table.name));
  const relations: Map<string, Relation[]> = new Map(tables.map((table: DbTable) => [table.name, []]));
  const add = (table: string, relation: Relation): void => {
    const own: Relation[] = relations.get(table) ?? [];
    const columns: DbColumn[] = tables.find((t: DbTable) => t.name === table)?.columns ?? [];
    const taken: Set<string> = new Set([...columns.map((column: DbColumn) => camel(column.name)), ...own.map((r: Relation) => r.name)]);
    let name: string = relation.name;
    for (let n = 2; taken.has(name); n++) {
      name = `${relation.name}${n}`;
    }
    own.push({ ...relation, name });
  };

  for (const table of tables) {
    const link = linkColumns(table, known);
    if (link) {
      const [a, b] = link;
      const self: boolean = a.table === b.table;
      const label = (column: ForeignKey): string =>
        self ? `${camel(column.table)}By${pascal(stripId(column.name) ?? column.name)}` : camel(column.table);
      add(a.table, {
        name: label(b), kind: 'many', target: b.table, from: a.column, to: b.column,
        through: { table: table.name, from: a.name, to: b.name },
      });
      add(b.table, {
        name: label(a), kind: 'many', target: a.table, from: b.column, to: a.column,
        through: { table: table.name, from: b.name, to: a.name },
      });
      continue;
    }
    const keys: ForeignKey[] = foreignKeys(table, known);
    for (const key of keys) {
      const target: string = key.table;
      const twice: boolean = keys.filter((other: ForeignKey) => other.table === target).length > 1;
      add(table.name, {
        name: camel(stripId(key.name) ?? target), kind: 'one', target, from: key.name, to: key.column,
      });
      add(target, {
        name: twice ? `${camel(table.name)}By${pascal(stripId(key.name) ?? key.name)}` : camel(table.name),
        kind: 'many', target: table.name, from: key.column, to: key.name,
      });
    }
  }

  return relations;
};

/** Relations between tables that have routes. `?with=` never exposes a table that the routes do not. */
export const routedRelations = (tables: DbTable[]): Map<string, Relation[]> => {
  const routed: Set<string> = new Set(routedTables(tables).map((table: DbTable) => table.name));

  return new Map([...tableRelations(tables)]
    .filter(([table]: [string, Relation[]]) => routed.has(table))
    .map(([table, relations]: [string, Relation[]]) => [table, relations.filter((relation: Relation) => routed.has(relation.target))]));
};
