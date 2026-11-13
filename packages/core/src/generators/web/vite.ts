import * as fs from 'node:fs';
import * as path from 'node:path';
import { Eta } from 'eta';
import type { DbSchema, PackageJsonInfo } from '../../commons/types.js';
import { openApiDocument } from '../spec/openapi.js';
import { webPages } from './pages.js';

const TEMPLATES: string = path.resolve(import.meta.dirname, '../../../templates/web');

export const WEB_VERSIONS: Record<string, string> = {
  '@json-render/core': '0.22.0',
  '@json-render/react': '0.22.0',
  '@json-render/shadcn': '0.22.0',
  react: '19.3.1',
  'react-dom': '19.3.1',
  zod: '4.6.7',
  '@tailwindcss/vite': '4.3.5',
  '@vitejs/plugin-react': '6.3.0',
  tailwindcss: '4.3.5',
  'tw-animate-css': '1.4.0',
  vite: '8.3.8',
};

const DEV: string[] = ['@tailwindcss/vite', '@vitejs/plugin-react', 'tailwindcss', 'tw-animate-css', 'vite'];

const eta: Eta = new Eta({ views: TEMPLATES, autoEscape: true });
const copy = (file: string): string => fs.readFileSync(path.join(TEMPLATES, file), 'utf-8');

/** Every file of the web app for the API that `renderApi` writes for the same schema. */
export const renderWeb = (schema: DbSchema, info: PackageJsonInfo): Record<string, string> => {
  const pages = webPages(openApiDocument(schema, info));
  if (!pages.resources.length) {
    throw new Error('The web app needs at least one table with a single-column primary key');
  }
  const pinned = (names: string[]): Record<string, string> => Object.fromEntries(names.map((name: string) => [name, WEB_VERSIONS[name]]));

  return {
    'package.json': `${JSON.stringify({
      name: `${info.name}-web`,
      version: info.version,
      description: info.description,
      author: info.author,
      license: info.license,
      private: true,
      type: 'module',
      engines: { node: '>=22' },
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      dependencies: pinned(Object.keys(WEB_VERSIONS).filter((name: string) => !DEV.includes(name))),
      devDependencies: pinned(DEV),
    }, undefined, 2)}\n`,
    '.gitignore': eta.render('gitignore.eta', {}),
    '.env.example': eta.render('env.example.eta', {}),
    'index.html': eta.render('index.html.eta', { title: info.name }),
    'vite.config.js': copy('vite.config.js'),
    'src/main.jsx': copy('src/main.jsx'),
    'src/index.css': copy('src/index.css'),
    'src/theme.css': copy('src/theme.css'),
    'src/pages.json': `${JSON.stringify(pages, undefined, 2)}\n`,
  };
};
