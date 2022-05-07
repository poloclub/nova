import React from 'react';
import d3 from './d3-imports.ts';
import './App.css'
import Graph from './components/Graph/Graph.tsx'
import type { GraphData, Strengths } from './components/Graph/GraphTypes';
import karate from './data/karate.json';
import miserables from './data/miserables.json';
import stackoverflow from './data/stackoverflow.json';

/**
 * Custom event for notebook message events
 */
interface NotebookEvent extends Event {
  data: GraphData;
  width: number;
  nodeStrength: number;
  linkStrength: number;
  linkDistance: number;
  collideStrength: number;
}

const datasets = [
  {
    name: 'Les Misérables Character',
    file: 'miserables',
    strengths: null,
    data: miserables,
  },
  {
    name: 'StackOverflow Tag',
    file: 'stackoverflow',
    strengths: { linkStrength: 4, collideStrength: 10 },
    data: stackoverflow,
  },
  { name: 'Karate Club', file: 'karate', strengths: null, data: karate },
];

const App = ({notebookMode}) => {
  const [curDatasetIndex, setCurDatasetIndex] = React.useState(0)
  const [data, setData] = React.useState(null)
  const [width, setWidth] = React.useState(600)
  const [strengths, setStrengths] = React.useState(null)

  React.useEffect(() => {
    if (notebookMode) {
      if (notebookMode) {
        // Listen to the iframe message events
        document.addEventListener('novaGraphData', (e: Event) => {
          const notebookEvent = e as NotebookEvent;
          setData(notebookEvent.data);
          setWidth(notebookEvent.width);
          setStrengths({
            nodeStrength: notebookEvent.nodeStrength,
            linkStrength: notebookEvent.linkStrength,
            linkDistance: notebookEvent.linkDistance,
            collideStrength: notebookEvent.collideStrength
          });
        });
      }
    } else {
      // Directly load the data
      setData(datasets[curDatasetIndex].data)
      setStrengths(datasets[curDatasetIndex].strengths);
    }
  }, [notebookMode])
  
  return (
    <>
      <div className={`main-app ${notebookMode ? 'notebook-mode' : ''}`}>
        <div className="top-grid">
          {!notebookMode && (
            <>
              <div className="dataset-container">
                <div className="dataset-title">Choose a graph</div>
                {datasets.map((dataset, index) => (
                  <div className={`dataset-option ${curDatasetIndex === index ? 'selected' : ''}`} key={index} onClick={async () => {
                    setCurDatasetIndex(index)
                    setData(dataset.data)
                    setStrengths(dataset.strengths);
                  }}>
                    {dataset.name}
                  </div>

                ))}
              </div>
              <div className={`graph-container ${notebookMode ? 'left-align' : ''}`} style={{width: width}}>
                <Graph strengths={strengths} width={width} data={data} dataset={datasets[curDatasetIndex]}/>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default App;