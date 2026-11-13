// Renders the json-render pages in pages.json against the generated API. Generaptr writes pages.json from
// openapi.json; this file is the same for every API.
import { defineCatalog, resolvePropValue } from '@json-render/core';
import { createStateStore, defineRegistry, JSONUIProvider, Renderer } from '@json-render/react';
import { schema } from '@json-render/react/schema';
import { shadcnComponents } from '@json-render/shadcn';
import { shadcnComponentDefinitions } from '@json-render/shadcn/catalog';
import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { z } from 'zod';
import { resources, title } from './pages.json';
import './index.css';

const LONG_TEXT = 200;

// A string longer than LONG_TEXT shows its start and a button for the rest.
function JsonText({ text }) {
  const [all, setAll] = useState(false);
  if (all || text.length <= LONG_TEXT) {
    return <span className="text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap break-words">"{text}"</span>;
  }
  return (
    <span className="text-emerald-700 dark:text-emerald-400 break-words">
      "{text.slice(0, LONG_TEXT)}…"{' '}
      <button type="button" className="text-foreground underline underline-offset-4" onClick={() => setAll(true)}>
        Show all {text.length} characters
      </button>
    </span>
  );
}

// Objects and arrays fold with the browser's own <details>; the first two levels start open.
function JsonTree({ value, depth = 0 }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">{depth ? 'null' : '—'}</span>;
  }
  if (typeof value === 'string') {
    return depth ? <JsonText text={value} /> : <span className="whitespace-pre-wrap break-words">{value}</span>;
  }
  if (typeof value !== 'object') {
    return <span className="text-sky-700 dark:text-sky-400">{String(value)}</span>;
  }
  const entries = Array.isArray(value) ? value.map((item, index) => [index, item]) : Object.entries(value);
  if (!entries.length) {
    return <span className="text-muted-foreground">{Array.isArray(value) ? 'No items' : 'No keys'}</span>;
  }
  return (
    <details open={depth < 2}>
      <summary className="cursor-pointer text-muted-foreground">
        {entries.length} {Array.isArray(value) ? (entries.length === 1 ? 'item' : 'items') : entries.length === 1 ? 'key' : 'keys'}
      </summary>
      <dl className="ml-1 border-l pl-3">
        {entries.map(([key, item]) => (
          <div key={key} className="flex gap-2">
            <dt className="shrink-0 text-muted-foreground">{key}</dt>
            <dd className="min-w-0">
              <JsonTree value={item} depth={depth + 1} />
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

const used = ['Card', 'Stack', 'Grid', 'Heading', 'Text', 'Button', 'Link', 'Input', 'Textarea', 'Select', 'Switch', 'Alert'];
const pick = (all) => Object.fromEntries(used.map((name) => [name, all[name]]));
const catalog = defineCatalog(schema, {
  components: {
    ...pick(shadcnComponentDefinitions),
    Json: { props: z.object({ value: z.unknown() }), description: 'A JSON value as a tree that folds' },
  },
  actions: {},
});
const { registry } = defineRegistry(catalog, {
  components: { ...pick(shadcnComponents), Json: ({ props }) => <div className="text-sm"><JsonTree value={props.value} /></div> },
});

const parses = (text) => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};
// The form checks a JSON field as the user types; an empty field is the `required` check's job.
const validationFunctions = { json: (value) => value === undefined || value === '' || parses(String(value)) };

// #/users, #/users/new, #/users/7, #/users/7/edit
const route = (hash) => {
  const [path, id, edit] = hash.replace(/^#\/?/, '').split('/');
  const resource = resources.find((r) => r.path === `/${path}`) ?? resources[0];
  if (id === 'new') {
    return { page: resource.pages.create, path: resource.path };
  }
  if (id) {
    return { page: edit === 'edit' ? resource.pages.edit : resource.pages.detail, id, path: resource.path };
  }
  return { page: resource.pages.list, path: resource.path };
};

const api = async (method, path, body) => {
  const response = await fetch(`/api${path}`, {
    method,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const issues = json?.issues?.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(issues || json?.message || response.statusText);
  }
  return json;
};

// Inputs hold strings; the API takes typed JSON. Each field's kind comes from openapi.json.
const toForm = (row, fields) => Object.fromEntries(Object.entries(fields).map(([key, field]) => {
  const value = row[key];
  if (value === null || value === undefined) {
    return [key, field.kind === 'boolean' ? false : ''];
  }
  if (field.kind === 'boolean') {
    return [key, value];
  }
  if (field.kind === 'array') {
    return [key, value.join(', ')];
  }
  if ((field.kind === 'json' || field.kind === 'raw') && typeof value !== 'string') {
    return [key, JSON.stringify(value, null, 2)];
  }
  return [key, String(value)];
}));

const toBody = (form, fields, partial) => Object.fromEntries(Object.entries(fields).flatMap(([key, field]) => {
  const value = form[key];
  if (value === undefined || value === '') {
    return partial && field.nullable ? [[key, null]] : [];
  }
  if (field.kind === 'integer' || field.kind === 'number' || field.kind === 'reference') {
    return [[key, Number(value)]];
  }
  if (field.kind === 'array') {
    return [[key, String(value).split(',').map((item) => item.trim()).filter(Boolean)]];
  }
  // A JSON column takes parsed JSON; a value of any other type goes to the database as the text it is.
  return [[key, field.kind === 'json' ? JSON.parse(String(value)) : value]];
}));

// A list cell: one line.
const show = ({ value }) => {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length)) {
    return '—';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (Array.isArray(value) && value.every((item) => typeof item !== 'object' || item === null)) {
    return value.join(', ');
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
};

const MODES = ['light', 'dark', 'system'];
const stored = () => {
  try {
    return localStorage.getItem('mode') ?? 'system';
  } catch {
    return 'system';
  }
};

// Light, dark, or the system setting. The choice stays in this browser; `system` follows the OS as it changes.
function useMode() {
  const [mode, setMode] = useState(stored);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => document.documentElement.classList.toggle('dark', mode === 'dark' || (mode === 'system' && media.matches));
    apply();
    try {
      localStorage.setItem('mode', mode);
    } catch {}
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [mode]);
  return [mode, setMode];
}

function ModeSwitch() {
  const [mode, setMode] = useMode();
  return (
    <fieldset className="mb-2 flex rounded-md border p-0.5 text-xs">
      <legend className="sr-only">Color mode</legend>
      {MODES.map((name) => (
        <button
          key={name}
          type="button"
          aria-pressed={mode === name}
          onClick={() => setMode(name)}
          className={`flex-1 rounded px-2 py-1 capitalize ${mode === name ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {name}
        </button>
      ))}
    </fieldset>
  );
}

function App() {
  const [hash, setHash] = useState(location.hash || `#${resources[0]?.path ?? ''}`);
  const [filter, setFilter] = useState('');
  const shown = resources.filter((r) => r.title.toLowerCase().includes(filter.trim().toLowerCase()));
  useEffect(() => {
    const onHash = () => setHash(location.hash);
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  const current = useMemo(() => route(hash), [hash]);
  const store = useMemo(
    () => createStateStore({ route: { id: current.id }, offset: 0, rows: [], row: {}, form: {}, options: {}, error: null }),
    [current],
  );

  const load = async () => {
    try {
      for (const step of current.page.load) {
        const json = await api('GET', resolvePropValue(step.path, { stateModel: store.getSnapshot() }));
        const value = step.pluck ? json.map((row) => String(row[step.pluck])) : step.form ? toForm(json, step.form) : json;
        store.set(step.into, value);
      }
    } catch (error) {
      store.set('/error', error.message);
    }
  };
  useEffect(() => {
    load();
  }, [current, store]);

  const handlers = {
    navigate: ({ to, base, id }) => {
      location.hash = base ? `${base}/${encodeURIComponent(store.get(id))}` : String(to);
    },
    page: async ({ delta }) => {
      store.set('/offset', Math.max(0, store.get('/offset') + delta));
      await load();
    },
    remove: async ({ path, next }) => {
      try {
        await api('DELETE', path);
        location.hash = String(next);
      } catch (error) {
        store.set('/error', error.message);
      }
    },
    save: async ({ method, path, partial, fields, next, nextKey }) => {
      if (store.get('/check')?.valid === false) {
        return;
      }
      try {
        const json = await api(method, path, toBody(store.get('/form'), fields, partial));
        location.hash = nextKey && json ? `${next}/${encodeURIComponent(json[nextKey])}` : String(next);
      } catch (error) {
        store.set('/error', error.message);
      }
    },
  };

  return (
    <div className="min-h-screen grid md:grid-cols-[14rem_1fr]">
      <nav className="border-r bg-muted/40 p-4 flex flex-col gap-1 max-h-64 md:max-h-screen md:sticky md:top-0 overflow-y-auto">
        <p className="px-2 pb-2 text-sm font-semibold">{title}</p>
        <ModeSwitch />
        <input
          type="search"
          aria-label="Find a table"
          placeholder="Find a table"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="mb-2 rounded-md border bg-background px-2 py-1.5 text-sm"
        />
        {shown.map((r) => (
          <a
            key={r.path}
            href={`#${r.path}`}
            aria-current={r.path === current.path ? 'page' : undefined}
            className={`rounded-md px-2 py-1.5 text-sm hover:bg-accent ${r.path === current.path ? 'bg-accent font-medium' : ''}`}
          >
            {r.title}
          </a>
        ))}
      </nav>
      <main className="p-6 max-w-screen-2xl w-full min-w-0">
        <JSONUIProvider
          key={hash}
          registry={registry}
          store={store}
          handlers={handlers}
          functions={{ show }}
          validationFunctions={validationFunctions}
        >
          <Renderer spec={current.page.spec} registry={registry} />
        </JSONUIProvider>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
