import { terser } from 'rollup-plugin-terser';

export default {
  input: 'main.js',
  output: {
    sourcemap: false,
    format: 'iife',
    name: 'app',
    file: 'notebook-widget/novagraph/novagraph.js'
  },
  plugins: [
    // If we're building for production (npm run build
    // instead of npm run dev), minify
    terser()
  ]
};
