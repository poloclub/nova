import d3 from '../d3-imports';

interface NodeData {
  id: string;
  group: string;
}

interface LinkData {
  source: string;
  target: string;
  value: number;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {}

export interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}

interface Padding {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Main class for the Graph Visualization
 */
export class Graph {
  component: HTMLElement;
  svg: d3.Selection<d3.BaseType, unknown, null, undefined>;
  data: GraphData;
  nodes: Node[];
  links: Link[];

  nodeGroups: string[];
  linkValues: number[];

  nodeElements: d3.Selection<d3.BaseType, Node, SVGGElement, unknown>;
  linkElements: d3.Selection<d3.BaseType, Link, SVGGElement, unknown>;

  width: number;
  height: number;
  nodeRadius: number;
  minLinkStrokeWidth: number;
  maxLinkStrokeWidth: number;
  padding: Padding;

  colorScale: d3.ScaleOrdinal<string, string, never>;
  strokeWidthScale: d3.ScaleLinear<number, number, never>;
  simulation: d3.Simulation<Node, undefined>;

  /**
   * Create a Graph object
   * @param args Named parameters
   * @param args.component Graph component
   * @param args.data Graph data
   * @param args.width SVG width
   * @param args.height SVG height
   */
  constructor({
    component,
    data,
    width = 300,
    height = 300,
    nodeRadius = 5,
    minLinkStrokeWidth = 1,
    maxLinkStrokeWidth = 6
  }: {
    component: HTMLElement;
    data: GraphData;
    width?: number;
    height?: number;
    nodeRadius?: number;
    minLinkStrokeWidth?: number;
    maxLinkStrokeWidth?: number;
  }) {
    this.component = component;
    this.data = data;
    this.padding = {
      top: 5,
      bottom: 5,
      left: 5,
      right: 5
    };
    this.width = width - this.padding.left - this.padding.right;
    this.height = height - this.padding.top - this.padding.bottom;

    this.nodeRadius = nodeRadius;
    this.maxLinkStrokeWidth = maxLinkStrokeWidth;
    this.minLinkStrokeWidth = minLinkStrokeWidth;

    // Deep copy nodes and links from the data object
    this.nodes = data.nodes.map(d => ({ id: d.id }));
    this.links = data.links.map(d => ({ source: d.source, target: d.target }));

    // Construct the color scale
    this.nodeGroups = data.nodes.map(d => d.group);
    if (new Set(this.nodeGroups).size > 10) {
      // console.warn('Number of node groups is more than 10.');
    }
    this.colorScale = d3.scaleOrdinal(this.nodeGroups, d3.schemeTableau10);

    // Construct the edge thickness scale
    this.linkValues = data.links.map(d => d.value);
    this.strokeWidthScale = d3
      .scaleLinear()
      .domain([Math.min(...this.linkValues), Math.max(...this.linkValues)])
      .range([minLinkStrokeWidth, maxLinkStrokeWidth]);

    // Initialize the force simulation
    const nodeIDs = data.nodes.map(d => d.id);
    const forceNode = d3.forceManyBody();
    const forceLink = d3.forceLink(this.links).id(node => nodeIDs[node.index!]);

    // forceNode.strength(1);
    // forceLink.strength(1);

    this.simulation = d3
      .forceSimulation(this.nodes)
      .force('link', forceLink)
      .force('charge', forceNode)
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', () => this.#ticked());

    // Initialize the SVG element
    this.svg = d3
      .select(component)
      .select('svg.graph-svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewbox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'none');

    // Initialize the graph view
    const result = this.drawGraphView();
    this.nodeElements = result.nodeElements;
    this.linkElements = result.linkElements;
  }

  /**
   * Draw the initial view
   */
  drawGraphView() {
    console.log(this.data);

    const content = this.svg
      .append('g')
      .attr('class', 'content')
      .attr(
        'transform',
        `translate(${this.padding.left}, ${this.padding.top})`
      );

    // Draw links as lines
    const linkElements = content
      .append('g')
      .attr('class', 'link-group')
      .selectAll('line.link')
      .data(this.links)
      .join('line')
      .attr('class', 'link')
      .style('stroke', 'var(--md-gray-400)')
      .style('stroke-opacity', 0.6)
      .style('stroke-width', d =>
        this.strokeWidthScale(this.linkValues[d.index!])
      );

    // Draw nodes as circles
    const nodeElements = content
      .append('g')
      .attr('class', 'node-group')
      .selectAll('circle.node')
      .data(this.nodes)
      .join('circle')
      .attr('class', 'node')
      .attr('r', this.nodeRadius)
      .style('fill', d => this.colorScale(this.nodeGroups[d.index!]))
      .style('stroke', 'white')
      .style('stroke-width', 1.5);

    // Add tooltips for nodes
    nodeElements
      .append('title')
      .text(d => `${d.id}, ${this.nodeGroups[d.index!]}`);

    return { nodeElements, linkElements };
  }

  /**
   * Event handler for simulation ticking
   */
  #ticked() {
    // Update node and link positions
    this.linkElements
      .attr('x1', d => {
        const source = d.source as Node;
        return source.x ? source.x : 0;
      })
      .attr('y1', d => {
        const source = d.source as Node;
        return source.y ? source.y : 0;
      })
      .attr('x2', d => {
        const target = d.target as Node;
        return target.x ? target.x : 0;
      })
      .attr('y2', d => {
        const target = d.target as Node;
        return target.y ? target.y : 0;
      });

    this.nodeElements
      .attr('cx', d => (d.x !== undefined ? d.x : 0))
      .attr('cy', d => (d.y !== undefined ? d.y : 0));
  }
}
