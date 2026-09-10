// @ts-check
import { defineConfig } from 'astro/config';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

/**
 * Datum poslední změny do sitemapy.
 *
 * Bez lastmod nemá Google jak poznat, že se stránka změnila — musí na to přijít
 * náhodným procházením. Bereme datum posledního commitu souborů, ze kterých se
 * stránka skládá: .astro šablony, jejího datového JSONu a u článků .md souboru.
 *
 * Záměrně NEpoužíváme datum buildu — to by při každém nasazení tvrdilo, že se
 * změnilo úplně všechno, a Google by signál přestal brát vážně.
 */
function gitDate(file) {
  if (!existsSync(file)) return null;
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
      encoding: 'utf-8',
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function newest(...files) {
  const dates = files.filter(Boolean).map(gitDate).filter(Boolean).sort();
  return dates.length ? dates[dates.length - 1] : null;
}

/** route (bez lomítek na krajích) → datum poslední změny */
function buildLastmodMap() {
  const map = new Map();

  // Články v poradně: .md soubor + šablona článku
  const blogDir = 'src/content/blog';
  if (existsSync(blogDir)) {
    for (const f of readdirSync(blogDir).filter(n => n.endsWith('.md'))) {
      const slug = f.replace(/\.md$/, '');
      map.set(`blog/${slug}`, newest(`${blogDir}/${f}`, 'src/pages/blog/[slug].astro'));
    }
  }

  // Ostatní stránky: .astro + stejnojmenný JSON v src/data
  const walk = (dir, prefix = '') => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(full, `${prefix}${entry.name}/`);
      } else if (entry.name.endsWith('.astro') && !entry.name.startsWith('[')) {
        const base = entry.name.replace(/\.astro$/, '');
        const route = base === 'index' ? prefix.replace(/\/$/, '') : `${prefix}${base}`;
        const data = [
          `src/data/${base}.json`,
          base === 'index' && prefix === '' ? 'src/data/homepage.json' : null,
          base === 'index' && prefix ? `src/data/${prefix.replace(/\/$/, '')}-index.json` : null,
        ];
        map.set(route, newest(full, ...data));
      }
    }
  };
  if (existsSync('src/pages')) walk('src/pages');

  return map;
}

const LASTMOD = buildLastmodMap();

// https://astro.build/config
export default defineConfig({
  site: 'https://uspornevytapeni.cz',
  trailingSlash: 'always',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      serialize(item) {
        const route = new URL(item.url).pathname.replace(/^\/|\/$/g, '');
        const lastmod = LASTMOD.get(route);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
