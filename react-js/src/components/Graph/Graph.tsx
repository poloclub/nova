import React from 'react'
import './Graph.css'
import { GraphClass } from './GraphTypes.ts';
import type { GraphData, Strengths } from './GraphTypes.ts';
import ConfigPanel from '../ConfigPanel/ConfigPanel.tsx';
import IconGear from '../../images/icon-gear.tsx';
// import IconLogo from '../../images/icon-logo.tsx';

let myGraph: GraphClass | null = null;
let configPanelStyle = {}

const Graph = ({ strengths, width, data, dataset }) => {
  const [configSelected, setConfigSelected] = React.useState(false);
  const [nodeCount, setNodeCount] = React.useState(0);
  const [edgeCount, setEdgeCount] = React.useState(0);

  React.useEffect(() => {
    if (data) {
      myGraph = new GraphClass({
        component: document.getElementById(`graph-wrapper`),
        data,
        strengths,
        width,
        height: width
      });

      setNodeCount(data.nodes.length);
      setEdgeCount(data.links.length);
    }
    const panelRoom = Math.floor((window.innerWidth - width) / 2);
    if (panelRoom < 190) {
      configPanelStyle = {
        transform: `translateX(calc(100% - ${190 - panelRoom + 5}px))`,
        top: '42px'
      }
    }
  }, [data, strengths, width, dataset.file]);
      
  return (    
    <div className="graph-wrapper" style={{ width: width, height: width }} id={`graph-wrapper`}>
    <svg className="graph-svg" />

    <div className="graph-footer">
        <span>{`${nodeCount} nodes, ${edgeCount} edges`}</span>
        <a href="https://github.com/poloclub/nova" target="_blank" rel="noreferrer">
            <span className="name">
                {/* <IconLogo /> */}
            </span>
        </a>
    </div>

    <div
        className={`configButton ${configSelected ? 'selected' : ''}`}
        onClick={() => {
            setConfigSelected(!configSelected);
        }}
    >
        <IconGear />
    </div>
    <div
      className={`config-container ${!configSelected ? 'no-display' : ''}`}
      style={ configPanelStyle }
    >
        <ConfigPanel height={width} myGraph={myGraph} flipConfigSelected={() => setConfigSelected(!configSelected)} />
    </div>
    </div>
  )
}

export default Graph;