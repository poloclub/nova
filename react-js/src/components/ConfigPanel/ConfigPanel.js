import React from 'react';
import './ConfigPanel.css'
import { initForceParameters } from './ConfigPanelTypes';
import IconClose from '../../images/icon-close.js';

const ConfigPanel = ({ height, myGraph, flipConfigSelected }) => {
  const [forceParameters, setForceParameters] = React.useState(null);
  const [parameters, setParameters] = React.useState({});
  const [forceParametersUpdated, setForceParametersUpdated] = React.useState(false);

  React.useEffect(() => {
    if (myGraph) {
      setForceParameters(initForceParameters(myGraph));
    }
  }, [myGraph])

  React.useEffect(() => {
      setParameters({})
      if (forceParametersUpdated && forceParameters) {
        forceParameters.forEach((parameter) => {
          setParameters({ ...parameters, [parameter.name]: parameter.value });
        })
        setForceParametersUpdated(false);
      }
  }, [forceParameters, parameters, forceParametersUpdated])

  return (
      <div className="parameter-wrapper" style={{maxHeight: `${Math.max(50, height - 30)}px`}}>
        <div className="parameter-title">
          <span>Force Parameters</span>
          <span className="svg-icon" onClick={() => flipConfigSelected()}>
            <IconClose />
          </span>
        </div>
      {forceParameters && forceParameters.map((parameter) => (
        <div className="parameter-item" key={parameter.name}>
          <div className="parameter">
            <span className="parameter-name">{parameter.name}</span>
            <span className="parameter-value">{parameter.value}</span>
          </div>
          <input
            type="range"
            id={`${parameter.id}-slider`}
            className="slider"
            name={`${parameter.id}`}
            min={parameter.min}
            max={parameter.max}
            value={parameters[parameter.name]}
            step={parameter.step}
            onInput={e => {
              parameter.value = parseFloat(e.currentTarget.value);
              parameter.updateStrength(parseFloat(e.currentTarget.value));
              forceParameters.forEach((parameter) => {
                setParameters({ ...parameters, [parameter.name]: parameter.value });
              })
              setForceParametersUpdated(true);
              parameters[parameter.name] = parseFloat(e.currentTarget.value);
            }
          }
          />
        </div>
      ))}
    </div>
  )
}

export default ConfigPanel;