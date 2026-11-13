// Renders the json-render pages in pages.json against the generated API. Generaptr writes pages.json from
// openapi.json; this file is the same for every API.
import { defineCatalog, resolvePropValue } from '@json-render/core';
import { createStateStore, defineRegistry, JSONUIProvider, Renderer } from '@json-render/react';
import { schema } from '@json-render/react/schema';
import { shadcnComponents } from '@json-render/shadcn';
import { shadcnComponentDefinitions } from '@json-render/shadcn/catalog';
import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { resources, title } from './pages.json';
import './index.css';

const used = ['Card', 'Stack', 'Grid', 'Heading', 'Text', 'Button', 'Link', 'Input', 'Textarea', 'Select', 'Switch', 'Alert'];
const pick = (all) => Object.fromEntries(used.map((name) => [name, all[name]]));
const catalog = defineCatalog(schema, { components: pick(shadcnComponentDefinitions), actions: {} });
const { registry } = defineRegistry(catalog, { components: pick(shadcnComponents) });

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
  if (field.kind === 'json' && typeof value !== 'string') {
    return [key, JSON.stringify(value, null, 2)];
  }
  return [key, String(value)];
}));

const parsed = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

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
  return [[key, field.kind === 'json' ? parsed(String(value)) : value]];
}));

const show = ({ value }) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (Array.isArray(value)) {
    return value.join(', ') || '—';
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
};

function App() {
  const [hash, setHash] = useState(location.hash || `#${resources[0]?.path ?? ''}`);
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
      <nav className="border-r bg-muted/40 p-4 flex md:flex-col gap-1 overflow-x-auto">
        <p className="px-2 pb-2 text-sm font-semibold">{title}</p>
        {resources.map((r) => (
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
      <main className="p-6 max-w-5xl w-full">
        <JSONUIProvider key={hash} registry={registry} store={store} handlers={handlers} functions={{ show }}>
          <Renderer spec={current.page.spec} registry={registry} />
        </JSONUIProvider>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
