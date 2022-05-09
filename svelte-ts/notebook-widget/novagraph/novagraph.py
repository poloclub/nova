from math import floor
from platform import node
import random
import html
import base64
import pkgutil

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
    # HTML template for the widget
    html_top = """<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Nova Graph</title>"""
    html_bottom = """</head><body></body></html>"""

    # Embed global style
    css_str = pkgutil.get_data(__name__, "global.css").decode("utf-8")
    html_top += f"<style>{css_str}</style>"

    # Read the bundled JS file
    js_b = pkgutil.get_data(__name__, "novagraph.js")

    # Read local JS file (for development only)
    # with open("./novagraph.js", "r") as fp:
    #     js_string = fp.read()
    # js_b = bytes(js_string, encoding="utf-8")

    # Encode the JS & CSS with base 64
    js_base64 = base64.b64encode(js_b).decode("utf-8")

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

    return html.escape(html_str)


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
