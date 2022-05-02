/**
 * Initialize an array of force parameters
 * @param myGraph Graph object
 * @returns An array of force parameters
 */
export const initForceParameters = myGraph => {
  const forceParameters = [];

  const forceNodeParameter = {
    name: 'Node Strength',
    id: 'node-strength',
    min: -200,
    max: 60,
    value: myGraph.initStrengths?.nodeStrength || -30,
    step: 1,
    updateStrength: d => myGraph.updateNodeForceStrength(d)
  };
  forceParameters.push(forceNodeParameter);

  const forceLinkParameter = {
    name: 'Link Strength',
    id: 'link-strength',
    min: 0,
    max: 5,
    value: myGraph.initStrengths?.linkStrength || 1,
    step: 0.01,
    updateStrength: d => myGraph.updateLinkForceStrength(d)
  };
  forceParameters.push(forceLinkParameter);

  const forceLinkDistanceParameter = {
    name: 'Link Distance',
    id: 'link-distance',
    min: 0,
    max: myGraph.width / 3,
    value: myGraph.initStrengths?.linkDistance || 30,
    step: 1,
    updateStrength: d => myGraph.updateLinkForceDistance(d)
  };
  forceParameters.push(forceLinkDistanceParameter);

  const forceCollideParameter = {
    name: 'Collision Strength',
    id: 'collide-strength',
    min: 0,
    max: 20,
    value: myGraph.initStrengths?.collideStrength || 1,
    step: 0.5,
    updateStrength: d => myGraph.updateCollideForceStrength(d)
  };
  forceParameters.push(forceCollideParameter);

  return forceParameters;
};
