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
let curDatasetIndex = 0;
/** @type {HTMLElement} */
const datasetComponent = document.querySelector('div.dataset-container');

/** @type {GraphApp | null} */
let myApp = null;

class GraphApp {
  /** @type {HTMLElement} */
  graphComponent;

  /** @type {HTMLElement} */
  configComponent;

  /** @type {HTMLElement} */
  buttonContainer;

  /** @type {Graph | null} */
  myGraph;

  /** @type {number} */
  width;

  constructor(width) {
    this.width = width;
    /** @type {HTMLElement} */
    this.graphComponent = document.querySelector('div.graph-wrapper');

    /** @type {HTMLElement} */
    this.configComponent = document.querySelector('div.config-container');

    /** @type {HTMLElement} */
    this.buttonContainer = document.createElement('div');
    this.buttonContainer.classList.add('config-button');
    this.graphComponent.appendChild(this.buttonContainer);

    this.initView();
  }

  /**
   * Destructor for GraphApp
   */
  destroy() {
    this.graphComponent.querySelector('.graph-svg').remove();
    this.configComponent.querySelector('.svg-icon').remove();
    this.configComponent
      .querySelectorAll('.parameter-item')
      .forEach(d => d.remove());
    this.buttonContainer.remove();
  }

  async initView() {
    this.myGraph = await this.initGraphView();
    await this.initConfigPanel();
  }

  /**
   * Initialize the graph view
   * @returns Graph
   */
  initGraphView = async () => {
    const modelFile = datasets[curDatasetIndex].file;

    // Load the dataset
    const loadedData = await d3.json(`data/${modelFile}`);

    // Draw the graph
    /** @type {HTMLElement} */
    this.graphComponent.style.width = `${this.width}px`;
    this.graphComponent.style.height = `${this.width}px`;

    const myGraph = new Graph({
      component: this.graphComponent,
      data: loadedData,
      strengths: datasets[curDatasetIndex].strengths,
      width: this.width,
      height: this.width
    });

    // Initialize the footer
    const graphFooter = this.graphComponent.querySelector('.graph-footer');
    graphFooter.textContent = `${loadedData.nodes.length} nodes, \
    ${loadedData.links.length} edges`;

    // Initialize the configuration button
    const configButtonSVGRaw = await d3.text('images/icon-gear.svg');
    this.buttonContainer.innerHTML = configButtonSVGRaw;

    // Bind event handler to the button
    this.buttonContainer.addEventListener('click', () => {
      this.flipConfigDisplay();
    });

    return myGraph;
  };

  /**
   * Initialize the configuration panel
   */
  initConfigPanel = async () => {
    /** @type {HTMLElement} */
    const component = this.configComponent.querySelector('.parameter-wrapper');

    // Initialize the close button
    const closeButton = document.createElement('span');
    closeButton.classList.add('svg-icon');
    const closeButtonSVGRaw = await d3.text('images/icon-close.svg');
    closeButton.innerHTML = closeButtonSVGRaw;
    closeButton.addEventListener('click', () => {
      this.flipConfigDisplay();
    });
    component.querySelector('.parameter-title').appendChild(closeButton);

    // Add parameter sliders
    const forceParameters = initForceParameters(this.myGraph);

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

  /**
   * Flip the display of the configuration panel.
   */
  flipConfigDisplay = () => {
    if (this.configComponent.classList.contains('no-display')) {
      this.configComponent.classList.remove('no-display');
      this.buttonContainer.classList.add('selected');
    } else {
      this.configComponent.classList.add('no-display');
      this.buttonContainer.classList.remove('selected');
    }
  };
}

/**
 * Initialize the dataset panel
 */
const initDatasetView = () => {
  for (const [i, dataset] of datasets.entries()) {
    const option = document.createElement('div');
    option.classList.add('dataset-option');
    option.setAttribute('id', `dataset-option-${i}`);
    if (curDatasetIndex === i) {
      option.classList.add('selected');
    }
    option.innerText = dataset.name;

    // Click a dataset option switches the dataset
    option.addEventListener('click', () => {
      if (curDatasetIndex !== i) {
        option.classList.add('selected');
        datasetComponent
          .querySelector(`#dataset-option-${curDatasetIndex}`)
          .classList.remove('selected');
        curDatasetIndex = i;
      }

      // Re-initialize the app component
      myApp.destroy();
      myApp = new GraphApp(width);
    });

    datasetComponent.appendChild(option);
  }
};

// Initialize the dataset panel
initDatasetView();

// Initialize the app component
const width = 600;
myApp = new GraphApp(width);
