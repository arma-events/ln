import { fileURLToPath } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';
import { exit } from 'node:process';
import { defineConfig, preprocessCSS } from 'vite';
import handlebars from 'handlebars';
import { minify } from 'html-minifier-terser';
import yaml from 'yaml';
import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

const CONFIG = yaml.parse(await readFile('./links.yaml', 'utf-8'));

const CONFIG_SCHEMA = TypeCompiler.Compile(
    Type.Record(
        Type.String(),
        Type.Object({
            url: Type.String(),
            title: Type.Optional(Type.String()),
            description: Type.Optional(Type.String())
        })
    )
);

if (!CONFIG_SCHEMA.Check(CONFIG)) {
    const errors = Array.from(CONFIG_SCHEMA.Errors(CONFIG));

    console.log(`Invalid Config (\x1b[31m${errors.length} errors\x1b[0m):`);
    for (const err of errors) {
        console.error('    \x1b[33m%s\x1b[0m', err.message, 'at', '\x1b[90m' + err.path);
    }

    exit(1);
}

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
                            input: Object.keys(CONFIG).map(x => fileURLToPath(new URL(`${x}.html`, import.meta.url)))
                        }
                    }
                };
            },
            async buildStart() {
                for (const [alias, data] of Object.entries(CONFIG)) {
                    await writeFile(
                        fileURLToPath(new URL(`${alias}.html`, import.meta.url)),
                        await minify(template(data), {
                            collapseWhitespace: true,
                            keepClosingSlash: true,
                            removeComments: true,
                            removeRedundantAttributes: true,
                            removeScriptTypeAttributes: true,
                            removeStyleLinkTypeAttributes: true,
                            useShortDoctype: true,
                            minifyCSS: true
                        })
                    );
                }
            }
        }
    ]
});
