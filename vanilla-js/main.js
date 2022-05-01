import './styles/main.css';
import './styles/app.css';
import './styles/graph.css';
import { Graph } from './scripts/graph';

// Load the graph data
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

const initGraphView = async () => {
  console.log('ahha');

  const modelFile = datasets[curDatasetIndex].file;

  // Load the dataset
  const loadedData = await d3.json(`data/${modelFile}`);

  // Draw the graph
  const container = document.querySelector('.graph-container');
  const component = document.createElement('div');
  component.classList.add('graph-wrapper');
  component.style.width = `${width}px`;
  component.style.height = `${width}px`;
  container.appendChild(component);

  const myGraph = new Graph({
    component,
    data: loadedData,
    strengths: datasets[curDatasetIndex].strengths,
    width: width,
    height: width
  });
};

initGraphView();
