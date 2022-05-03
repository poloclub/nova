import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import * as fs from 'fs';
import * as path from 'path';

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [svelte()]
// });

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    // Development
    return {
      plugins: [svelte()]
    };
  } else if (command === 'build') {
    switch (mode) {
      case 'notebook': {
        // Production: notebook widget
        return {
          build: {
            outDir: 'notebook-widget/_nova-graph',
            sourcemap: false,
            lib: {
              entry: 'src/main-notebook.ts',
              formats: ['iife'],
              name: 'novaGraph',
              fileName: format => 'nova-graph.js'
            }
          },
          plugins: [
            svelte({
              emitCss: false
            }),
            {
              name: 'post-build',
              writeBundle: options => {
                // Move target file to the notebook package
                fs.copyFile(
                  path.resolve(options.dir, options.entryFileNames as string),
                  path.resolve(
                    __dirname,
                    'notebook-widget/nova-graph/nova-graph.js'
                  ),
                  error => {
                    if (error) throw error;
                  }
                );

                // Delete all other generated files
                fs.rm(options.dir, { recursive: true }, error => {
                  if (error) throw error;
                });
              }
            }
          ]
        };
      }

      case 'production': {
        // Production: standard web page (default mode)
        return {
          build: {
            outDir: 'dist'
          },
          plugins: [svelte()]
        };
      }

      case 'github': {
        // Production: github page
        return {
          base: '/nova/',
          build: {
            outDir: 'gh-page'
          },
          plugins: [svelte()]
        };
      }

      default: {
        console.error(`Unknown production mode ${mode}`);
        return null;
      }
    }
  }
});
