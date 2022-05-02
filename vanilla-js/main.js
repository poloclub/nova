import { Graph } from './scripts/graph';
import { initForceParameters } from './scripts/configPanel';

// Configurations
const datasets = [
  {
    name: 'Les Misérables Character',
    file: 'miserables.json',
    strengths: null
  },
  {
    name: 'StackOverflow Tag',
    file: 'stackoverflow.json',
    strengths: { linkStrength: 4, collideStrength: 10 }
  },
  { name: 'Karate Club', file: 'karate.json', strengths: null }
];
const curDatasetIndex = 0;
const width = 600;
const configContainer = document.querySelector('.config-container');

/**
 * Initialize the graph view
 * @returns Graph
 */
const initGraphView = async () => {
  const modelFile = datasets[curDatasetIndex].file;

  // Load the dataset
  const loadedData = await d3.json(`data/${modelFile}`);

  // Draw the graph
  /** @type {HTMLElement} */
  const component = document.querySelector('div.graph-wrapper');
  component.style.width = `${width}px`;
  component.style.height = `${width}px`;

  const myGraph = new Graph({
    component,
    data: loadedData,
    strengths: datasets[curDatasetIndex].strengths,
    width: width,
    height: width
  });

  // Initialize the footer
  const graphFooter = component.querySelector('.graph-footer');
  graphFooter.textContent = `${loadedData.nodes.length} nodes, \
    ${loadedData.links.length} edges`;

  // Initialize the configuration button
  const configButtonSVGRaw = await d3.text('images/icon-gear.svg');
  const buttonContainer = component.querySelector('.config-button');
  buttonContainer.innerHTML = configButtonSVGRaw;

  // Bind event handler to the button
  buttonContainer.addEventListener('click', () => {
    if (configContainer.classList.contains('no-display')) {
      configContainer.classList.remove('no-display');
      buttonContainer.classList.add('selected');
    } else {
      configContainer.classList.add('no-display');
      buttonContainer.classList.remove('selected');
    }
  });

  return myGraph;
};

/**
 * Initialize the configuration panel
 * @param {Graph} myGraph Graph object
 */
const initConfigPanel = async myGraph => {
  /** @type {HTMLElement} */
  const component = document.querySelector('.parameter-wrapper');

  // Initialize the close button
  const closeButton = component.querySelector('.parameter-title > .svg-icon');
  const closeButtonSVGRaw = await d3.text('images/icon-close.svg');
  closeButton.innerHTML = closeButtonSVGRaw;

  // Add parameter sliders
  const forceParameters = initForceParameters(myGraph);

  // For each parameter, create a parameter-item element
  for (const param of forceParameters) {
    const item = document.createElement('div');
    item.classList.add('parameter-item');
    component.appendChild(item);

    const parameter = document.createElement('div');
    parameter.classList.add('parameter');
    item.appendChild(parameter);

    const name = document.createElement('span');
    name.classList.add('parameter-name');
    name.innerText = param.name;
    parameter.append(name);

    const value = document.createElement('span');
    value.classList.add('parameter-value');
    value.innerText = param.value;
    parameter.append(value);

    const slider = document.createElement('input');
    slider.setAttribute('type', 'range');
    slider.setAttribute('id', `${param.id}-slider`);
    slider.classList.add('slider');
    slider.setAttribute('name', `${param.id}`);
    slider.setAttribute('min', `${param.min}`);
    slider.setAttribute('max', `${param.max}`);
    slider.setAttribute('value', `${param.value}`);
    slider.setAttribute('step', `${param.step}`);
    slider.addEventListener('input', e => {
      // @ts-ignore
      const newValue = e.currentTarget.value;
      value.innerText = newValue;
      param.updateStrength(parseFloat(newValue));
    });
    item.appendChild(slider);
  }
};

const initView = async () => {
  const myGraph = await initGraphView();
  await initConfigPanel(myGraph);
};

initView();
