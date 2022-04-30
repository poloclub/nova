import d3 from '../../d3-imports';

interface NodeData {
  id: string;
  group: string;
}

interface LinkData {
  source: string;
  target: string;
  value?: number;
}

export interface Strengths {
  nodeStrength?: number;
  linkStrength?: number;
  linkDistance?: number;
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
  countNodeLink: (node: Node) => number;

  nodeGroups: string[];
  linkValues: number[];

  nodeElements: d3.Selection<d3.BaseType, Node, SVGGElement, unknown>;
  linkElements: d3.Selection<d3.BaseType, Link, SVGGElement, unknown>;

  forceNode: d3.ForceManyBody<d3.SimulationNodeDatum>;
  forceLink: d3.ForceLink<d3.SimulationNodeDatum, Link>;
  forceCenter: d3.ForceCenter<d3.SimulationNodeDatum>;

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
    strengths = null,
    width = 300,
    height = 300,
    nodeRadius = 5,
    minLinkStrokeWidth = 1,
    maxLinkStrokeWidth = 6
  }: {
    component: HTMLElement;
    data: GraphData;
    strengths?: Strengths | null;
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
    this.linkValues = data.links.map(d => d.value || 0);

    if (new Set(this.linkValues).size === 1) {
      this.strokeWidthScale = d3
        .scaleLinear()
        .domain([this.linkValues[0], this.linkValues[0]])
        .range([minLinkStrokeWidth, minLinkStrokeWidth]);
    } else {
      this.strokeWidthScale = d3
        .scaleLinear()
        .domain([Math.min(...this.linkValues), Math.max(...this.linkValues)])
        .range([minLinkStrokeWidth, maxLinkStrokeWidth]);
    }

    // Keep track link counts (used in updating link strength)
    const nodeLinkCounts: number[] = [];
    const nodeIDMap = new Map(this.nodes.map((d, i) => [d.id, i]));
    for (const l of this.links) {
      const sourceIndex = nodeIDMap.get(l.source as string)!;
      const targetIndex = nodeIDMap.get(l.target as string)!;
      nodeLinkCounts[sourceIndex] = (nodeLinkCounts[sourceIndex] || 0) + 1;
      nodeLinkCounts[targetIndex] = (nodeLinkCounts[targetIndex] || 0) + 1;
    }

    this.countNodeLink = (node: Node) => {
      const curIndex = nodeIDMap.get(node.id);
      if (curIndex !== undefined) {
        return nodeLinkCounts[curIndex];
      } else {
        return 0;
      }
    };

    // Initialize the force simulation
    const nodeIDs = data.nodes.map(d => d.id);
    this.forceNode = d3.forceManyBody();
    this.forceLink = d3.forceLink(this.links).id(node => nodeIDs[node.index!]);
    this.forceCenter = d3.forceCenter(width / 2, height / 2);

    // Set the initial strengths if they are provided
    if (strengths !== null) {
      if (strengths.linkStrength !== undefined) {
        this.forceLink.strength((link, i, links) => {
          return (
            strengths.linkStrength! /
            Math.min(
              this.countNodeLink(link.source as Node),
              this.countNodeLink(link.target as Node)
            )
          );
        });
      }
      if (strengths.linkDistance !== undefined) {
        this.forceLink.strength(strengths.linkDistance);
      }
      if (strengths.nodeStrength !== undefined) {
        this.forceNode.strength(strengths.nodeStrength);
      }
    }

    this.simulation = d3
      .forceSimulation(this.nodes)
      .force('link', this.forceLink)
      .force('charge', this.forceNode)
      .force('center', this.forceCenter)
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

    (
      nodeElements as d3.Selection<SVGCircleElement, Node, SVGElement, unknown>
    ).call(this.#dragFactory());

    // Add tooltips for nodes
    nodeElements
      .append('title')
      .text(d => `${d.id}, ${this.nodeGroups[d.index!]}`);

    return { nodeElements, linkElements };
  }

  /**
   * @param x Always keep nodes in the bounding box
   * @returns new x
   */
  #boxBoundX(x: number) {
    return Math.max(this.nodeRadius, Math.min(this.width - this.nodeRadius, x));
  }

  /**
   * @param x Always keep nodes in the bounding box
   * @returns new y
   */
  #boxBoundY(y: number) {
    return Math.max(
      this.nodeRadius,
      Math.min(this.height - this.nodeRadius, y)
    );
  }

  /**
   * Event handler for simulation ticking
   */
  #ticked() {
    // Update node and link positions
    this.linkElements
      .attr('x1', d => {
        const source = d.source as Node;
        return source.x ? this.#boxBoundX(source.x) : 0;
      })
      .attr('y1', d => {
        const source = d.source as Node;
        return source.y ? this.#boxBoundY(source.y) : 0;
      })
      .attr('x2', d => {
        const target = d.target as Node;
        return target.x ? this.#boxBoundX(target.x) : 0;
      })
      .attr('y2', d => {
        const target = d.target as Node;
        return target.y ? this.#boxBoundY(target.y) : 0;
      });

    this.nodeElements
      .attr('cx', d => (d.x !== undefined ? this.#boxBoundX(d.x) : 0))
      .attr('cy', d => (d.y !== undefined ? this.#boxBoundY(d.y) : 0));
  }

  /**
   * Bind dragging related event handlers to nodes
   */
  #dragFactory() {
    const dragstarted = (e: d3.D3DragEvent<SVGCircleElement, Node, Node>) => {
      // Restart the simulation if it has already paused
      if (!e.active) {
        this.simulation.alpha(0.3).restart();
      }
      // Init fixed position fx and fy
      e.subject.fx = e.subject.x;
      e.subject.fy = e.subject.y;
    };

    const dragged = (e: d3.D3DragEvent<SVGCircleElement, Node, Node>) => {
      // Move the node to the targeted position using fixed position fx and fy
      e.subject.fx = e.x;
      e.subject.fy = e.y;
    };

    const dragended = (e: d3.D3DragEvent<SVGCircleElement, Node, Node>) => {
      // Reset fixed position fx and fy
      e.subject.fx = null;
      e.subject.fy = null;
    };

    return d3
      .drag<SVGCircleElement, Node>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  updateNodeForceStrength(newStrength: number) {
    // Update the forces
    this.forceNode.strength(newStrength);

    // Update the simulation
    this.simulation.alpha(0.3).restart();
  }

  updateLinkForceStrength(newStrength: number) {
    // Update the forces
    this.forceLink.strength((link, i, links) => {
      return (
        newStrength /
        Math.min(
          this.countNodeLink(link.source as Node),
          this.countNodeLink(link.target as Node)
        )
      );
    });

    // Update the simulation
    this.simulation.alpha(0.3).restart();
  }

  updateLinkForceDistance(newDistance: number) {
    // Update the forces
    this.forceLink.distance(newDistance);

    // Update the simulation
    this.simulation.alpha(0.3).restart();
  }
}
