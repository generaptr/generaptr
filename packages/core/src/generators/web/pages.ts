import type { DbForeignKey } from '../../commons/types.js';
import type { OpenApiDocument } from '../spec/openapi.js';

// biome-ignore lint/suspicious/noExplicitAny: JSON Schema from the document generaptr writes.
type JsonSchema = Record<string, any>;

/** How a form edits a value and how the web app turns the input back into JSON. */
export type Kind = 'string' | 'integer' | 'number' | 'boolean' | 'enum' | 'array' | 'json' | 'reference';
export type Field = { kind: Kind; nullable: boolean };
/** A GET the web app runs before it shows a page, and where in the page state the result goes. */
export type Load = { path: unknown; into: string; pluck?: string; form?: Record<string, Field> };
export type Element = { type: string; props: Record<string, unknown>; children: string[]; [extra: string]: unknown };
/** A json-render spec: a flat map of elements and the one at the root. */
export type Page = { spec: { root: string; elements: Record<string, Element> }; load: Load[] };
export type Resource = { name: string; path: string; title: string; pages: Record<'list' | 'detail' | 'create' | 'edit', Page> };

const PAGE_SIZE = 20;
const COLUMNS = 5;
const OPTIONS = 100;

const words = (key: string): string => {
  const text: string = key.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};
const singular = (name: string): string => name.replace(/s$/, '');
const refName = (schema: JsonSchema | undefined): string => String(schema?.$ref).split('/').pop() as string;
const types = (property: JsonSchema): string[] => [property.type ?? []].flat();
const show = (value: unknown) => ({ $computed: 'show', args: { value } });
const navigate = (to: unknown) => ({ press: { action: 'navigate', params: { to } } });
const openRow = (base: string, id: string) => ({ press: { action: 'navigate', params: { base, id: { $item: id } } } });

const kindOf = (property: JsonSchema): Kind => {
  if (property.enum) {
    return 'enum';
  }
  const plain: Kind[] = ['string', 'integer', 'number', 'boolean', 'array'];
  return plain.find((kind: Kind) => types(property).includes(kind)) ?? 'json';
};

/** Element ids follow creation order, so the same document always gives the same spec. */
const builder = () => {
  const elements: Record<string, Element> = {};
  const el = (type: string, props: Record<string, unknown>, children: string[] = [], extra: object = {}): string => {
    const id = `${type.toLowerCase()}-${Object.keys(elements).length}`;
    elements[id] = { type, props, children, ...extra };
    return id;
  };
  return { elements, el };
};

/**
 * Turns the OpenAPI document that generaptr writes into json-render pages: a list, a detail, a create form, and an
 * edit form for each route. Keys and foreign keys come from `x-keys` and `x-column`.
 */
export const webPages = (doc: OpenApiDocument): { title: string; resources: Resource[] } => {
  const schemas: Record<string, JsonSchema> = doc.components.schemas;
  const collections: string[] = Object.keys(doc.paths).filter((path: string) => !path.includes('{'));
  const listed = (path: string): JsonSchema[] => {
    const items: JsonSchema = (doc.paths[path].get as JsonSchema).responses[200].content['application/json'].schema.items;
    return items.allOf ?? [items];
  };
  const rowOf = (path: string): JsonSchema => schemas[refName(listed(path)[0])];
  const pathOfTable = (table: string): string | undefined =>
    collections.find((path: string) => rowOf(path)['x-table'] === table);
  // x-keys holds column names; the API and the forms use property names.
  const property = (row: JsonSchema, column: string): string =>
    Object.keys(row.properties).find((key: string) => row.properties[key]['x-column']?.name === column) ?? column;
  const keyOf = (row: JsonSchema): string => property(row, row['x-keys'].primaryKey.columns[0]);
  const labelOf = (row: JsonSchema): string =>
    Object.keys(row.properties).find((key: string) => /name|email|title|label/i.test(key))
    ?? Object.keys(row.properties).find((key: string) => kindOf(row.properties[key]) === 'string')
    ?? keyOf(row);

  const resources: Resource[] = collections.map((path: string): Resource => {
    const row: JsonSchema = rowOf(path);
    const name: string = row['x-table'];
    const title: string = words(name);
    const thing: string = words(singular(name)).toLowerCase();
    const key: string = keyOf(row);
    const here = `${path}/\${/route/id}`;
    const relations: [string, JsonSchema][] = Object.entries(listed(path)[1]?.properties ?? {});
    const references: Map<string, DbForeignKey> = new Map((row['x-keys'].foreignKeys ?? [])
      .filter((foreignKey: DbForeignKey) => foreignKey.columns.length === 1 && pathOfTable(foreignKey.table))
      .map((foreignKey: DbForeignKey) => [property(row, foreignKey.columns[0]), foreignKey]));
    const body = (method: 'post' | 'put'): JsonSchema => {
      const item: string = method === 'post' ? path : `${path}/{id}`;
      return schemas[refName((doc.paths[item][method] as JsonSchema).requestBody.content['application/json'].schema)];
    };
    const propertiesOf = (schema: JsonSchema): [string, JsonSchema][] => Object.entries(schema.properties as Record<string, JsonSchema>);
    const fieldsOf = (schema: JsonSchema): Record<string, Field> => Object.fromEntries(propertiesOf(schema)
      .map(([field, value]: [string, JsonSchema]) => [field, {
        kind: references.has(field) ? 'reference' : kindOf(value), nullable: types(value).includes('null'),
      }]));

    const list = (): Page => {
      const { elements, el } = builder();
      const columns: string[] = Object.keys(row.properties)
        .filter((field: string) => kindOf(row.properties[field]) !== 'json').slice(0, COLUMNS);
      const grid = { columns: columns.length + 1, gap: 'md', className: 'w-full items-center py-2 border-b' };
      const head = el('Grid', grid, [
        ...columns.map((field: string) => el('Text', { text: words(field), variant: 'caption' })),
        el('Text', { text: '', variant: 'caption' }),
      ]);
      const cells = el('Grid', grid, [
        ...columns.map((field: string) => el('Text', { text: show({ $item: field }), variant: 'body' })),
        el('Button', { label: 'Open', variant: 'secondary' }, [], { on: openRow(path, key) }),
      ]);
      const rows = el('Stack', { direction: 'vertical', gap: 'none', className: 'w-full' }, [cells], { repeat: { statePath: '/rows', key } });
      const empty = el('Text', { text: `No ${title.toLowerCase()} on this page.`, variant: 'muted' }, [], { visible: { $state: '/rows/0', not: true } });
      const page = (label: string, delta: number, enabled: object) => el('Button', {
        label, variant: 'secondary', disabled: { $cond: enabled, $next: false, $else: true },
      }, [], { on: { press: { action: 'page', params: { delta } } } });
      const root = el('Stack', { direction: 'vertical', gap: 'md' }, [
        el('Stack', { direction: 'horizontal', justify: 'between', align: 'center' }, [
          el('Heading', { text: title, level: 'h2' }),
          el('Button', { label: `New ${thing}`, variant: 'primary' }, [], { on: navigate(`${path}/new`) }),
        ]),
        el('Card', {}, [head, rows, empty]),
        el('Stack', { direction: 'horizontal', gap: 'sm', justify: 'end' }, [
          page('Previous', -PAGE_SIZE, { $state: '/offset', gt: 0 }),
          page('Next', PAGE_SIZE, { $state: `/rows/${PAGE_SIZE - 1}` }),
        ]),
      ]);
      return { spec: { root, elements }, load: [{ path: { $template: `${path}?limit=${PAGE_SIZE}&offset=\${/offset}` }, into: '/rows' }] };
    };

    const detail = (): Page => {
      const { elements, el } = builder();
      const fields = el('Grid', { columns: 2, gap: 'md' }, Object.keys(row.properties).flatMap((field: string) => [
        el('Text', { text: words(field), variant: 'muted' }),
        el('Text', { text: show({ $state: `/row/${field}` }), variant: 'body' }),
      ]));
      const related: string[] = relations.map(([relation, schema]: [string, JsonSchema]) => {
        const many: boolean = schema.type === 'array';
        const target: JsonSchema = schemas[refName(many ? schema.items : schema.anyOf[0])];
        const targetPath = pathOfTable(target['x-table']) as string;
        const label: string = labelOf(target);
        if (!many) {
          return el('Card', { title: words(relation) }, [
            el('Link', {
              label: { $template: `\${/row/${relation}/${label}}` },
              href: { $template: `#${targetPath}/\${/row/${relation}/${keyOf(target)}}` },
            }, [], { visible: { $state: `/row/${relation}` } }),
            el('Text', { text: 'None', variant: 'muted' }, [], { visible: { $state: `/row/${relation}`, not: true } }),
          ]);
        }
        const line = el('Stack', { direction: 'horizontal', justify: 'between', align: 'center', className: 'py-1' }, [
          el('Text', { text: show({ $item: label }), variant: 'body' }),
          el('Button', { label: 'Open', variant: 'secondary' }, [], { on: openRow(targetPath, keyOf(target)) }),
        ]);
        return el('Card', { title: words(relation) }, [
          el('Stack', { direction: 'vertical', gap: 'none' }, [line], { repeat: { statePath: `/row/${relation}`, key: keyOf(target) } }),
          el('Text', { text: 'None', variant: 'muted' }, [], { visible: { $state: `/row/${relation}/0`, not: true } }),
        ]);
      });
      const root = el('Stack', { direction: 'vertical', gap: 'md' }, [
        el('Stack', { direction: 'horizontal', justify: 'between', align: 'center' }, [
          el('Heading', { text: { $template: `${words(singular(name))} \${/route/id}` }, level: 'h2' }),
          el('Stack', { direction: 'horizontal', gap: 'sm' }, [
            el('Button', { label: 'Edit', variant: 'secondary' }, [], { on: navigate({ $template: `${here}/edit` }) }),
            el('Button', { label: 'Delete', variant: 'danger' }, [], {
              on: { press: {
                action: 'remove',
                params: { path: { $template: here }, next: path },
                confirm: { title: `Delete this ${thing}?`, message: 'This removes the row from the database.', variant: 'danger' },
              } },
            }),
          ]),
        ]),
        el('Card', { title: 'Fields' }, [fields]),
        ...related,
      ]);
      const include: string = relations.map(([relation]: [string, JsonSchema]) => relation).join(',');
      return { spec: { root, elements }, load: [{ path: { $template: `${here}${include ? `?with=${include}` : ''}` }, into: '/row' }] };
    };

    const form = (mode: 'create' | 'edit'): Page => {
      const { elements, el } = builder();
      const schema: JsonSchema = body(mode === 'create' ? 'post' : 'put');
      const fields: Record<string, Field> = fieldsOf(schema);
      const required: Set<string> = new Set(schema.required ?? []);
      const load: Load[] = [];
      const inputs: string[] = propertiesOf(schema).map(([field, value]: [string, JsonSchema]) => {
        const label: string = words(field);
        const checks = [
          ...(required.has(field) ? [{ type: 'required', message: `${label} is required.` }] : []),
          ...(value.maxLength ? [{ type: 'maxLength', args: { max: value.maxLength }, message: `${label} has at most ${value.maxLength} characters.` }] : []),
        ];
        const bind = { $bindState: `/form/${field}` };
        switch (fields[field].kind) {
          case 'boolean':
            return el('Switch', { label, name: field, checked: bind, checks });
          case 'enum':
            return el('Select', { label, name: field, options: value.enum.filter((option: unknown) => option !== null), value: bind, checks });
          case 'reference': {
            const foreignKey = references.get(field) as DbForeignKey;
            const target: string = pathOfTable(foreignKey.table) as string;
            load.push({ path: `${target}?limit=${OPTIONS}`, into: `/options/${field}`, pluck: property(rowOf(target), foreignKey.foreignColumns[0]) });
            return el('Select', { label: `${label} (${words(foreignKey.table)})`, name: field, options: { $state: `/options/${field}` }, value: bind, checks });
          }
          case 'json':
            return el('Textarea', { label: `${label} (JSON)`, name: field, value: bind, checks });
          default: {
            const numeric: boolean = fields[field].kind === 'integer' || fields[field].kind === 'number';
            const placeholders: Record<string, string> = { array: 'Values separated by commas', 'date-time': '2026-01-31T10:00:00Z', base64: 'Base64' };
            return el('Input', {
              label, name: field, value: bind, checks,
              type: numeric ? 'number' : /email/i.test(field) ? 'email' : 'text',
              placeholder: placeholders[fields[field].kind] ?? placeholders[value.format] ?? placeholders[value.contentEncoding] ?? value.description ?? null,
            });
          }
        }
      });
      const save = mode === 'create'
        ? { method: 'POST', path, partial: false, next: path, nextKey: key }
        : { method: 'PUT', path: { $template: here }, partial: true, next: { $template: here } };
      const root = el('Stack', { direction: 'vertical', gap: 'md' }, [
        el('Heading', { text: mode === 'create' ? `New ${thing}` : { $template: `Edit ${thing} \${/route/id}` }, level: 'h2' }),
        el('Card', { maxWidth: 'lg' }, [
          el('Stack', { direction: 'vertical', gap: 'md' }, [
            ...inputs,
            el('Alert', { title: 'The API did not save the row.', message: { $state: '/error' }, type: 'error' }, [], { visible: { $state: '/error' } }),
            el('Stack', { direction: 'horizontal', gap: 'sm' }, [
              el('Button', { label: mode === 'create' ? `Create ${thing}` : 'Save changes', variant: 'primary' }, [], {
                on: { press: [{ action: 'validateForm', params: { statePath: '/check' } }, { action: 'save', params: { ...save, fields } }] },
              }),
              el('Button', { label: 'Cancel', variant: 'secondary' }, [], { on: navigate(mode === 'create' ? path : { $template: here }) }),
            ]),
          ]),
        ]),
      ]);
      if (mode === 'edit') {
        load.push({ path: { $template: here }, into: '/form', form: fields });
      }
      return { spec: { root, elements }, load };
    };

    return { name, path, title, pages: { list: list(), detail: detail(), create: form('create'), edit: form('edit') } };
  });

  return { title: doc.info.title, resources };
};
