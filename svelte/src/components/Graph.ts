import d3 from '../d3-imports';

export interface Node {
  id: string;
  group: string;
}

export interface Link {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

/**
 * Main class for the Graph Visualization
 */
export class Graph {
  component: HTMLElement;
  svg: d3.Selection<d3.BaseType, unknown, null, undefined>;
  data: GraphData;

  width: number;
  height: number;

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
    height = 300
  }: {
    component: HTMLElement;
    data: GraphData;
    width?: number;
    height?: number;
  }) {
    this.width = width;
    this.height = height;
    this.component = component;
    this.data = data;

    // Initialize the SVG element
    this.svg = d3
      .select(component)
      .select('svg.graph-svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewbox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'none');

    // Initialize the graph view
    this.drawGraphView();
  }

  /**
   * Draw the initial view
   */
  drawGraphView() {
    console.log(this.data);
    this.svg
      .append('circle')
      .attr('cx', 100)
      .attr('cy', 100)
      .attr('r', 50)
      .style('fill', 'navy');
  }
}
