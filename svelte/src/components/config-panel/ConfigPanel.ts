import type { Graph } from '../graph/Graph';

export class ConfigPanel {
  graph: Graph;

  constructor(graph: Graph) {
    this.graph = graph;
  }
}

export interface ForceParameter {
  name: string;
  id: string;
  min: number;
  max: number;
  value: number;
  step: number;
  updateStrength: (newStrength: number) => void;
}

/**
 * Initialize an array of force parameters
 * @param myGraph Graph object
 * @returns An array of force parameters
 */
export const initForceParameters = (myGraph: Graph): ForceParameter[] => {
  const forceParameters: ForceParameter[] = [];

  const forceNodeParameter: ForceParameter = {
    name: 'Node Strength',
    id: 'node-strength',
    min: -200,
    max: 60,
    value: -30,
    step: 1,
    updateStrength: (d: number) => myGraph.updateNodeForceStrength(d)
  };
  forceParameters.push(forceNodeParameter);

  const forceLinkParameter: ForceParameter = {
    name: 'Link Strength',
    id: 'link-strength',
    min: 0,
    max: 5,
    value: 1,
    step: 0.01,
    updateStrength: (d: number) => myGraph.updateLinkForceStrength(d)
  };
  forceParameters.push(forceLinkParameter);

  const forceCenterParameter: ForceParameter = {
    name: 'Link Distance',
    id: 'link-distance',
    min: 0,
    max: 100,
    value: 30,
    step: 0.5,
    updateStrength: (d: number) => myGraph.updateLinkForceDistance(d)
  };
  forceParameters.push(forceCenterParameter);

  return forceParameters;
};
