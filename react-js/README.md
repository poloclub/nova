# React.js Example

This example demonstrates how one can apply NOVA to adapt a toy visual analytics (VA) tool (NOVA Graph) developed with the React.js framework to support computational notebooks.

## 1. Overview

In this example, we use a toy VA tool called NOVA Graph. This tool can help data scientists visualize graph data using force layout. It allows users to input their own graph data and change force layout parameters.

### 1.1. Web App

NOVA Graph's web app is developed with React + Javascript + CSS. To run the web app locally, you can use the following commands:

Navigate to this folder

```bash
cd react-js
```

Install dependencies

```bash
npm install
```

Run NOVA Graph

```bash
npm run start
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

The first step is to bundle the web app into a single HTML file. In this example, we use [Webpack](https://webpack.js.org/) with the [html-webpack-inline-source-plugin](https://www.npmjs.com/package/html-webpack-inline-source-plugin).

The main idea is to (1) tell Webpack to bundle everything used in this web app (e.g., React components, scripts, style sheets, and assets) into a single HTML file; (2) render this HTML file in an ipywidget in a computational notebook.

The Webpack configuration override is in [`config-overrides.js`](./config-overrides.js):

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = function override(config, env) {
    if (env === 'production') {
    config.plugins
      .find(plugin => Object.getPrototypeOf(plugin).constructor.name === 'HtmlWebpackPlugin')
      .options.inlineSource = '.(js|css)$'
    config.plugins.push(new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin))
  }
  return config
}
```

After having this configuration, you can bundle NOVA Graph with just one command:

```bash
npm run build
```

This command generates an HTML file at `build/index.html`.

Next, we want to render this HTML template in Python.
We do this in [`notebook-widget/novagraph/novagraph.py`](./notebook-widget/novagraph/novagraph.py)

```python
def _make_html(
    data, width, node_strength, link_strength, link_distance, collide_strength
):
    """
    Function to create an HTML string to bundle NOVA Graph's html, css, and js.
    We use base64 to encode the js so that we can use inline defer for <script>

    We add another script to pass Python data as inline json, and dispatch an
    event to transfer the data

    Args:
        data(dict): Graph data (nodes and edges)
        width(int): Width of the main visualization window
        node_strength(float): Force strength between nodes, range [-200, 60]
        link_strength(float): Force strength of links, range [0, 5]
        link_distance(float): Link distance, range [0, width / 3]
        collide_strength(float): Force strength to avoid node collision, range [0, 20]

    Return:
        HTML code with deferred JS code in base64 format
    """
    html_file = codecs.open("../build/index.html", 'r')
    html_str = html_file.read()

    data_json = dumps(data)

    html_str = html_str.replace('notebookMode:!1', 'notebookMode:1')

    stropen = "{"
    strclose = "}"
    html_str = html_str.replace('options:null', f"options:{stropen}data:{data_json},width:{width},node_strength:{node_strength},link_strength:{link_strength},link_distance:{link_distance},collide_strength:{collide_strength}{strclose}")

    return html.escape(html_str)
   
def visualize(
    data,
    width=500,
    height=700,
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

    # Simple validations
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


