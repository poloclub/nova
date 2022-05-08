# Svelte Example

This example demonstrates how one can apply NOVA to adapt a toy visual analytics (VA) tool (NOVA Graph) developed with the Svelte framework to support computational notebooks.

## 1. Overview

In this example, we use a toy VA tool called NOVA Graph. This tool can help data scientists visualize graph data using force layout. It allows users to input their own graph data and change force layout parameters.

### 1.1. Web App

NOVA Graph's web app is developed with Svelte + Typescript + SCSS. To run the web app locally, you can use the following commands:

Navigate to this folder

```bash
cd svelte
```

Install dependencies

```bash
npm install
```

Run NOVA Graph

```bash
npm run dev
```

Open [localhost:3000](localhost:3000) in your browser. You should see NOVA Graph running :)

### 1.2. Notebook Widget

NOVA Graph's notebook widget is a Python package that users can easily install and access in different computational notebooks. To try out this widget, you can use the following commands:

Navigate to the widget folder

```bash
cd notebook-widget
```

Install the Python package locally (we suggest using a virtual environment such as [virtualenv](https://virtualenv.pypa.io/en/latest/) and [conda](https://docs.conda.io/projects/conda/en/latest/user-guide/getting-started.html))

```bash
pip install -e .
```

Open example notebooks in JupyterLab

```bash
cd example
jupyter lab
```

Then you can open `nova-graph.ipynb` to try out this widget.

```python
import novagraph as nova
from json import load

# Read the data
miserables = load(open('./miserables.json', 'r'))

# Pass data to our VA tool and show it below the cell
nova.visualize(miserables)
```

## 2. NOVA Method

In this section, we provide details on how to use the NOVA method to convert NOVA Graph's web app into a notebook widget.

### 2.1. Convert the VA tool into a single HTML file

The first step is to bundle the web app into a single HTML file. In this example, we use [Vite](https://vitejs.dev), a rollup-based bundler, to streamline this process.

The main idea is to (1) tell Vite to bundle everything used in this web app (e.g., Svelte components, scripts, style sheets, and assets) into a single JavaScript file; (2) inject this JavaScript file in an HTML template.

The Vite configuration is in [`vite.config.ts`](./vite.config.ts):

```ts
// ...
// Listen to `vite build` command
else if (command === 'build') {
  switch (mode) {
    // Listen to `vite build --mode notebook` command
    case 'notebook': {
      return {
        build: {
          // Save the output JS file in a temporary folder `_novagraph`
          outDir: 'notebook-widget/_novagraph',
          sourcemap: false,
          lib: {
            // The entry JS file is `main-notebook.ts`
            entry: 'src/main-notebook.ts',
            formats: ['iife'],
            name: 'novaGraph',
            fileName: format => 'novagraph.js'
          }
        },
        plugins: [
          svelte({
            // Bundle CSS into the JS file
            emitCss: false
          }),
          {
            // Run this script after bundling
            name: 'post-build',
            writeBundle: options => {
              // Move the output file into the notebook package
              fs.copyFile(
                path.resolve(options.dir, options.entryFileNames as string),
                path.resolve(
                  __dirname,
                  'notebook-widget/novagraph/novagraph.js'
                ),
                error => {
                  if (error) throw error;
                }
              );

              // Delete all other generated extra files
              fs.rm(options.dir, { recursive: true }, error => {
                if (error) throw error;
              });
            }
          }
        ]
      };
    }
```

After having this configuration, you can bundle NOVA Graph with just one command:

```bash
vite build --mode notebook

# Or use npm script defined in package.json
# npm run build:notebook
```

This command generates a JS file at `notebook-widget/novagraph/novagraph.js`.

Next, we want to inject this JS file into an HTML template in Python.
We do this in [`notebook-widget/novagraph/novagraph.py`](./notebook-widget/novagraph/novagraph.py)

```python
def _make_html():
    # HTML template string
    html_top = """<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Nova Graph</title>"""
    html_bottom = """</head><body></body></html>"""

    # Read the bundled JS file as binary string
    js_b = pkgutil.get_data(__name__, "novagraph.js")

    # Encode the JS binary string as base64 string
    js_base64 = base64.b64encode(js_b).decode("utf-8")

    # Inject the JS string into the html template
    html_str = (
        html_top
        + """<script defer src='data:text/javascript;base64,{}'></script>""".format(
            js_base64
        )
        + html_bottom
    )

    # Return a url safe html string
    return html.escape(html_str)
```

### 2.2. Design Python wrapper API

### 2.3. Publish the VA widget in a software repository

## 3. Demo Page


