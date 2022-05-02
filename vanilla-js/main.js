import './styles/main.css';
import './styles/app.css';
import './styles/graph.css';
import { Graph } from './scripts/graph';

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
let myGraph = null;
const configContainer = document.querySelector('.config-container');

const initGraphView = async () => {
  const modelFile = datasets[curDatasetIndex].file;

  // Load the dataset
  const loadedData = await d3.json(`data/${modelFile}`);

  // Draw the graph
  /** @type {HTMLElement} */
  const component = document.querySelector('div.graph-wrapper');
  component.style.width = `${width}px`;
  component.style.height = `${width}px`;

  myGraph = new Graph({
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
};

const initConfigPanel = () => {
  console.log('initing config panel');
};

initGraphView();
initConfigPanel();
