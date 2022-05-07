from math import floor
from platform import node
import random
import html
import base64
import pkgutil
import codecs

from IPython.display import display_html
from json import dumps


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
    # html_str = html_str.replace('"insert data here"', data_json)
    # html_str = html_str.replace('"insert width here"', str(width))
    # html_str = html_str.replace('"insert node strength here"', str(node_strength))
    # html_str = html_str.replace('"insert link strength here"', str(link_strength))
    # html_str = html_str.replace('"insert link distance here"', str(link_distance))
    # html_str = html_str.replace('"insert collide strength here"', str(collide_strength))

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
