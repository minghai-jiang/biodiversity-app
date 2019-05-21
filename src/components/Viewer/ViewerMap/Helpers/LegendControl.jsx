import React from 'react';
import { isMobile } from 'react-device-detect';

import { Portal } from "react-leaflet-portal";

import LegendRow from './LegendRow';


let legendControl_maxPolygons = 500;
let legendControl_maxStandardTiles = 1000;

let legendControl_checkedLayers = [];

let legendControl_legendElement = [];

let legendControl_map = null;

const LegendControl = {
  getElement: () => {
    if (!legendControl_legendElement || legendControl_legendElement.length === 0) {
      return null;
    }

    let initialClass = 'leaflet-control-layers leaflet-control-layers-toggle legend';
    if (!isMobile) {
      initialClass += ' active';
    }

    return ( 
      <Portal key="legendPortal" position="bottomright">
        <div 
          key='legendContainer'
          className={initialClass}
          onClick={addActive}
        >
          {legendControl_legendElement}
        </div>
      </Portal>
    )
  },

  initialize: (props, maxPolygons, maxStandardTiles) => {
    legendControl_maxPolygons = maxPolygons;
    legendControl_maxStandardTiles = maxStandardTiles;

    legendControl_map = props.map;
  },

  update: (props, polygonCounts, standardTilesCount) => {
    if (legendControl_map !== props.map) {
      legendControl_checkedLayers = [];
    }

    legendControl_legendElement = getLegend(props, polygonCounts, standardTilesCount);

    legendControl_map = props.map;
  },

  clear: () => {
    legendControl_legendElement = [];
  },

  onOverlayAdd: (e) => {
    if (!legendControl_checkedLayers.includes(e.name)) {
      legendControl_checkedLayers.push(e.name);
    }
  },

  onOverlayRemove: (e) => {    
    let index = legendControl_checkedLayers.indexOf(e.name);
    if (index > -1) {
      legendControl_checkedLayers.splice(index, 1);
    }
  }
}

function getLegend (props, polygonCounts, standardTilesCount) {
  let map = props.map;
  let legend = [];
  let timestamp = props.timestampRange

  if (!map || !timestamp) {
    return null;
  }

  if (typeof(polygonCounts) === 'object' || typeof(standardTilesCount) === 'object')
  {
    let input = {props: props, polygonCounts: polygonCounts, standardTilesCount: standardTilesCount, maxPolygon: legendControl_maxPolygons, maxStandardTiles: legendControl_maxStandardTiles}
    legend.push(<button key="closeButton" className='closeButton' onClick={closeLegend}>x</button>);
    legend.push(legendLoop(input));
  }

  return legend;
}

function legendLoop (input)
{
  let props = input.props;
  let map = props.map;
  let timestamp = props.timestampRange.end;
  let layers = [];
  let legendData = [];
  let legend = [];

  if(!map)
  {
    return null;
  }

  //Classes
  let classes = map.classes;
  for (let i = 0; i < classes.length; i++)
  {
    if (classes[i].timestampNumber === timestamp)
    {
      let allClasses = classes[i].classes;
      for (let j = 0; j < allClasses.length; j++)
      {
        let className = allClasses[j].name;
        if (className !== 'no class' && className !== 'blanc' && className !== 'mask')
        {
          layers.push(allClasses[j]);
        }
      }
      break 
    }
  }

  legendData.push({name: 'Classes', layers: layers});


  //polygons
  layers = [];
  let polygonLayers = map.polygonLayers;
  for (let i = 0; i < polygonLayers.length; i++)
  {
    if (polygonLayers[i].timestampNumber === timestamp)
    {
      layers = polygonLayers[i].layers;
      break 
    }
  }

  let result = [layers, input.polygonCounts].reduce((a, b) => a.map((c, i) => Object.assign({}, c, b[i])));
  legendData.push({name: 'Polygon Layers', layers: result, max: input.maxPolygon});

  //standard tiles
  if (input.standardTilesCount && input.standardTilesCount[0])
  {
    input.standardTilesCount[0].color = '6495ed';
    legendData.push({name: 'Standard Tiles', layers: input.standardTilesCount, max: input.maxStandardTiles})
  }

  for (let i = 0; i < legendData.length; i++)
  {
    let category = legendData[i];
    if (category.layers.length > 0)
    {
      legend.push(<h1 key={category.name+'.h1'}>{category.name}</h1>);
      for (let j = 0; j < category.layers.length; j++)
      {
        let layer = category.layers[j];
        legend.push(<LegendRow key={layer.name + i} name={layer.name} color={layer.color} count={layer.count} max={category.max} />)
      }
      if (category.max)
      {
        legend.push(<p key={category.name+'.max'} className='legendMax'>Maximum on sceen: {category.max}</p>);
      }
    }
    
  }

  return legend;
}

function closeLegend(e)
{
  if(e.target.tagName === 'BUTTON')
  {    
    let legend = document.getElementsByClassName('legend')[0];
    legend.classList.remove('active');
  }
}

function addActive(e)
{
  if(e.target.tagName === 'DIV')
  { 
    let legend = document.getElementsByClassName('legend')[0];
    legend.classList.add('active');
  }
}



export default LegendControl;
