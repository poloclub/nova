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
    value: myGraph.initStrengths?.nodeStrength || -30,
    step: 1,
    updateStrength: (d: number) => myGraph.updateNodeForceStrength(d)
  };
  forceParameters.push(forceNodeParameter);

  const forceLinkParameter: ForceParameter = {
    name: 'Link Strength',
    id: 'link-strength',
    min: 0,
    max: 5,
    value: myGraph.initStrengths?.linkStrength || 1,
    step: 0.01,
    updateStrength: (d: number) => myGraph.updateLinkForceStrength(d)
  };
  forceParameters.push(forceLinkParameter);

  const forceLinkDistanceParameter: ForceParameter = {
    name: 'Link Distance',
    id: 'link-distance',
    min: 0,
    max: myGraph.width / 3,
    value: myGraph.initStrengths?.linkDistance || 30,
    step: 1,
    updateStrength: (d: number) => myGraph.updateLinkForceDistance(d)
  };
  forceParameters.push(forceLinkDistanceParameter);

  const forceCollideParameter: ForceParameter = {
    name: 'Collision Strength',
    id: 'collide-strength',
    min: 0,
    max: 20,
    value: myGraph.initStrengths?.collideStrength || 1,
    step: 0.5,
    updateStrength: (d: number) => myGraph.updateCollideForceStrength(d)
  };
  forceParameters.push(forceCollideParameter);

  return forceParameters;
};
