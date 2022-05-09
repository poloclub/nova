# Svelte Example

This example demonstrates how one can apply NOVA to adapt a toy visual analytics (VA) tool—NOVA Graph that is developed with the Svelte framework—to support computational notebooks.

- [1. Overview](#1-overview)
  - [1.1. Web App](#11-web-app)
  - [1.2. Notebook Widget](#12-notebook-widget)
- [2. NOVA Method](#2-nova-method)
  - [2.1. Convert the VA tool into a single HTML file](#21-convert-the-va-tool-into-a-single-html-file)
    - [2.1.1. Vite Configuration](#211-vite-configuration)
    - [2.1.2. Inject JS into an HTML template](#212-inject-js-into-an-html-template)
  - [2.2. Design Python wrapper API](#22-design-python-wrapper-api)
  - [2.3. Publish the VA widget in a software repository](#23-publish-the-va-widget-in-a-software-repository)
- [3. Demo Page](#3-demo-page)

## 1. Overview

In this example, we use a toy VA tool called NOVA Graph. This tool can help data scientists visualize graph data using force layout. It allows users to input their own graph data and change force layout parameters.

### 1.1. Web App

![](https://i.imgur.com/64LPc4N.png)

NOVA Graph's web app is developed with Svelte + Typescript + SCSS. To run the web app locally, you can use the following commands:

Navigate to this folder

```bash
cd svelte-ts
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

![](https://i.imgur.com/sm89OAs.png)

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

The main idea is to (1) configure Vite to bundle everything used in this web app (e.g., Svelte components, scripts, style sheets, and assets) into a single JavaScript file; (2) inject this JavaScript file in an HTML template.

#### 2.1.1. Vite Configuration

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

#### 2.1.2. Inject JS into an HTML template

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

The function `_make_html()` injects the JS file into an HTML base64 string and returns this string.

### 2.2. Design Python wrapper API

To allow users to pass data and configurations into the notebook widget, we can design a Python function API that first collects and validates user input, and then send input to the widget through standard Web Events.

```python
def _make_html(data):
    # ...
    # Convert json dict to string
    data_json = dumps(data)

    # Pass data into JS by using another script to dispatch an event
    messenger_js = f"""
        (function() {{
            const event = new Event('novaGraphData');
            event.data = {data_json};
            event.width = {width};
            event.nodeStrength = {node_strength};
            event.linkStrength = {link_strength};
            event.linkDistance = {link_distance};
            event.collideStrength = {collide_strength};
            document.dispatchEvent(event);
        }}())
    """
    messenger_js = messenger_js.encode()
    messenger_js_base64 = base64.b64encode(messenger_js).decode("utf-8")

    # Inject the JS to the html template
    html_str = (
        html_top
        + """<script defer src='data:text/javascript;base64,{}'></script>""".format(
            js_base64
        )
        + """<script defer src='data:text/javascript;base64,{}'></script>""".format(
            messenger_js_base64
        )
        + html_bottom
    )
```

Then we display the HTML string as an `iframe` in a notebook cell:

```python
def visualize(
    data,
    width=500,
    height=520,
    node_strength=-30,
    link_strength=1,
    link_distance=30,
    collide_strength=1,
):
    """
    Render NOVA Graph in the output cell.

    Args:
        data(dict): Graph data (nodes and edges).
            {'nodes': [{
                'id': str (node identifier),
                'group': str (node category)
             }],
             'edges': [{
                'source': str (source node's id),
                'source': str (target node's id),
                'value': float (optional edge weight)
              }]
            }
        width(int): Width of the main visualization window
        height(int): Height of the whole window
        node_strength(float): Force strength between nodes, range [-200, 60]
        link_strength(float): Force strength of links, range [0, 5]
        link_distance(float): Link distance, range [0, width / 3]
        collide_strength(float): Force strength to avoid node collision, range [0, 20]

    Return:
        HTML code with deferred JS code in base64 format
    """

    # Simple input validations
    assert isinstance(data, dict), "`data` has to be a dictionary."
    assert "nodes" in data, "`data` is not valid (no `nodes` key)."
    assert "links" in data, "`data` is not valid (no `links` key)."
    assert (
        node_strength >= -200 and node_strength < 60
    ), "`nodeStrength` needs to be in range [-200, 60]"
    assert (
        link_strength >= 0 and link_strength < 5
    ), "`linkStrength` needs to be in range [0, 5]"
    assert link_distance >= 0 and link_distance < floor(
        width / 3
    ), f"`linkDistance` needs to be in range [0, ${floor(width / 3)}]"
    assert (
        collide_strength >= 0 and collide_strength < 20
    ), "`collideStrength` needs to be in range [0, 20]"

    html_str = _make_html(
        data, width, node_strength, link_strength, link_distance, collide_strength
    )

    # Randomly generate an ID for the iframe to avoid collision
    iframe_id = "nova-graph-iframe-" + str(int(random.random() * 1e8))

    iframe = f"""
        <iframe
            srcdoc="{html_str}"
            frameBorder="0"
            width="100%"
            height="{height}px"
            id="{iframe_id}">
        </iframe>
    """

    # Display the iframe
    display_html(iframe, raw=True)
```

Therefore, users can simply call this function to launch the NOVA Graph widget.

```python
novagraph.visualize(my_graph)
```

### 2.3. Publish the VA widget in a software repository

To enable users to easily install this widget (with only one command), we can package it into a Python library and publish it on [Python Package Index (PyPI)](https://pypi.org/project/nova-graph/).

Publishing a Python package is a standard and easy process. If you have never published any Python package before, you can refer to this [great tutorial](https://realpython.com/pypi-publish-python-package/) to learn how to set up a PyPI account and publish your first package!

You can refer to NOVA Graph's file structure to set up your package.

```
.
├── MANIFEST.in
├── README.md -> ../README.md
├── dist
├── example
├── novagraph
│   ├── __init__.py
│   ├── global.css -> ../../public/global.css
│   ├── novagraph.js
│   └── novagraph.py
├── publish-pip.sh
├── requirements_dev.txt
├── setup.cfg
├── setup.py
└── tests
    ├── __init__.py
    └── test_nova_graph.py
```

Specific to VA notebook widgets, we need to tell Python to include assets files (i.e., `novagraph.js`) into the package. We can do this in `MANIFEST.in`.

```in
recursive-include novagraph *
```

Finally, to publish the package on PyPI, we can run the following commands.

```bash
python3 -m build
python3 -m twine upload --repository nova-graph --skip-existing dist/*
```

## 3. Demo Page

Many VA tools have a companion live demo page where users can easily access and try out the tool. In this example, we show how to create a demo page that showcases both the web app and notebook widget simultaneously.

Here we create a GitHub page that includes the web app component and a Jupyter notebook environment.
We use [Jupyter Lite](https://github.com/jupyterlite/jupyterlite) to build a  in-browser notebook environment, and then embed it in the demo page.

Build a Jupyter Lite environment

```bash
# Build the environment using content from `content` folder
cd lite
jupyter lite build --contents content --output-dir output

# Move the built environment into the github page folder
rm -r ../gh-page/notebook/
mkdir ../gh-page/notebook/
cp -r output/* ../gh-page/notebook
rm -rf output
```

To try out the built notebook environment

```bash
cd gh-page/notebook
python3 -m http.server
```

Navigate to [localhost:8000](localhost:8000), you should see a Jupyter Lab running in your environment :)

Next, we can embed Jupyter Lite as an `iframe` in the demo page (in `App.svelte`).

```html
<iframe
  title="Jupyter notebook"
  src="https://poloclub.github.io/timbertrek/notebook/retro/notebooks/?path=campas.ipynb"
  width="100%"
  height="100%"
/>
```