import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { defineConfig } from 'vite';
import handlebars from 'handlebars';

import LINKS from './links.json';

const template = handlebars.compile(await readFile('./src/link.html.hbs', 'utf-8'));

export default defineConfig({
    build: {
        modulePreload: {
            polyfill: false
        }
    },
    plugins: [
        {
            name: 'render-link-pages',
            config(config) {
                return {
                    ...config,
                    build: {
                        ...(config.build ?? {}),
                        rollupOptions: {
                            ...(config.build?.rollupOptions ?? {}),
                            input: Object.keys(LINKS).map(x => fileURLToPath(new URL(`${x}.html`, import.meta.url)))
                        }
                    }
                };
            },
            async buildStart() {
                for (const [alias, link] of Object.entries(LINKS)) {
                    await writeFile(fileURLToPath(new URL(`${alias}.html`, import.meta.url)), template({ link }));
                }
            }
        }
    ]
});
