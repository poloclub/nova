import { Graph } from './scripts/graph.js';
import { initForceParameters } from './scripts/configPanel.js';

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

  /** @type {boolean} */
  notebookMode = false;

  iconLogoSVG = null;
  iconGearSVG = null;
  iconCloseSVG = null;

  constructor(width, notebookMode = false, packagePath = '') {
    this.width = width;
    this.notebookMode = notebookMode;
    this.packagePath = packagePath;

    /** @type {HTMLElement} */
    this.graphComponent = document.querySelector('div.graph-wrapper');

    /** @type {HTMLElement} */
    this.configComponent = document.querySelector('div.config-container');

    /** @type {HTMLElement} */
    this.buttonContainer = document.createElement('div');
    this.buttonContainer.classList.add('config-button');
    this.graphComponent.appendChild(this.buttonContainer);

    this.initGraphView();
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

  /**
   * Initialize the graph view
   * @returns Graph
   */
  initGraphView = async () => {
    // Wait for users to pass datasets
    if (this.notebookMode) {
      document.addEventListener('novaGraphData', async notebookEvent => {
        const data = notebookEvent.data;
        this.width = notebookEvent.width;
        const strengths = {
          nodeStrength: notebookEvent.nodeStrength,
          linkStrength: notebookEvent.linkStrength,
          linkDistance: notebookEvent.linkDistance,
          collideStrength: notebookEvent.collideStrength
        };

        this.graphComponent.style.width = `${this.width}px`;
        this.graphComponent.style.height = `${this.width}px`;

        // Save the image assets
        this.iconGearSVG = notebookEvent.iconGearSVG;
        this.iconLogoSVG = notebookEvent.iconLogoSVG;
        this.iconCloseSVG = notebookEvent.iconCloseSVG;

        this.myGraph = new Graph({
          component: this.graphComponent,
          data: data,
          strengths: strengths,
          width: this.width,
          height: this.width
        });

        // Initialize the footer and config panel
        await this.initFooter(data);
        await this.initConfigPanel();
      });
    } else {
      const modelFile = datasets[curDatasetIndex].file;

      // Load the dataset
      const data = await d3.json(`data/${modelFile}`);

      // Draw the graph
      /** @type {HTMLElement} */
      this.graphComponent.style.width = `${this.width}px`;
      this.graphComponent.style.height = `${this.width}px`;

      this.myGraph = new Graph({
        component: this.graphComponent,
        data: data,
        strengths: datasets[curDatasetIndex].strengths,
        width: this.width,
        height: this.width
      });

      // Initialize the footer and config panel
      await this.initFooter(data);
      await this.initConfigPanel();
    }
  };

  // Initialize the footer
  initFooter = async data => {
    const graphFooter = this.graphComponent.querySelector('.graph-footer');
    graphFooter.querySelector(
      '.stats'
    ).textContent = `${data.nodes.length} nodes, \
      ${data.links.length} edges`;

    if (this.notebookMode) {
      graphFooter.querySelector('.name').innerHTML = this.iconLogoSVG;
      this.buttonContainer.innerHTML = this.iconGearSVG;
    } else {
      let fetchResponse = await fetch('/images/icon-logo.svg');
      const logoIconSVGRaw = await fetchResponse.text();
      graphFooter.querySelector('.name').innerHTML = logoIconSVGRaw;

      // Initialize the configuration button
      fetchResponse = await fetch('images/icon-gear.svg');
      const configButtonSVGRaw = await fetchResponse.text();
      this.buttonContainer.innerHTML = configButtonSVGRaw;
    }

    // Bind event handler to the button
    this.buttonContainer.addEventListener('click', () => {
      this.flipConfigDisplay();
    });
  };

  /**
   * Initialize the configuration panel
   */
  initConfigPanel = async () => {
    /** @type {HTMLElement} */
    const component = this.configComponent.querySelector('.parameter-wrapper');

    // Check if the screen is small; if so, we show the config panel on top of
    // the main window
    const panelRoom = Math.floor((window.innerWidth - this.width) / 2);
    if (panelRoom < 190) {
      this.configComponent.style.transform = `translateX(calc(100% - ${
        190 - panelRoom + 5
      }px)`;
      this.configComponent.style.top = '42px';
    }

    // Initialize the close button
    const closeButton = document.createElement('span');
    closeButton.classList.add('svg-icon');

    if (this.notebookMode) {
      closeButton.innerHTML = this.iconCloseSVG;
    } else {
      const fetchResponse = await fetch('images/icon-close.svg');
      const closeButtonSVGRaw = await fetchResponse.text();
      closeButton.innerHTML = closeButtonSVGRaw;
    }

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

// Parse the attribute to get parameters from HTML
const notebookMode =
  document
    .querySelector('script[data-notebookMode]')
    .getAttribute('data-notebookMode') === 'true'
    ? true
    : false;

// Initialize the dataset panel if not in notebook mode
if (!notebookMode) {
  initDatasetView();
}

// Initialize the app component
const width = 600;
myApp = new GraphApp(width, notebookMode);
