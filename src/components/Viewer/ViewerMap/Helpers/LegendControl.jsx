import React from 'react';

import {Portal} from "react-leaflet-portal";


let legendControl_maxPolygons = 500;
let legendControl_maxStandardTiles = 1000;

let legendControl_checkedLayers = [];

let legendControl_legendElement = null;

let legendControl_map = null;

const LegendControl = {
  getElement: () => {
    if (!legendControl_legendElement) {
      return null;
    }

    return ( 
      <Portal position="bottomright">
        <div 
          className='leaflet-control-layers leaflet-control-layers-toggle legend' 
          key={'legendContainer'}
        >
          {legendControl_legendElement}
        </div>
      </Portal>
    )
  },

  initialize: (props, maxPolygons, maxStandardTiles) => {
    legendControl_maxPolygons = maxPolygons;
    legendControl_maxPolygons = maxStandardTiles;

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
    legendControl_legendElement = null;
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

  legend.push(legendLoop(props, polygonCounts, standardTilesCount));

  if (typeof(polygonCounts) === 'object')
  {
    legend.push(legendLoop(props, polygonCounts, 'polygon'));
  }

  if(typeof(standardTilesCount) === 'object')
  {
    //legend.push(legendLoop(props, standardTilesCount, 'standard'));
  }

  //Classes
  /*if (map.classes.length > 0 || map.spectral.length > 0)
  {
    legend.push(<h1 key='tileLayerHeader'>Tile Layers</h1>);
    legend.push(legendLoop(props, 'classes', polygonCounts));
  }
  
  //Polygon Layers
  if (map.polygonLayers.length > 0)
  {
    legend.push(<h1 key='PolygonLayerHeader'>Polygon Layers</h1>);
    legend.push(legendLoop(props, 'polygon', polygonCounts));
    legend.push(<p key="maxPolygon" className="maxPolygon">Max polygons per layer: {legendControl_maxPolygons}</p>);
  }

  //Standard Tiles
  if(standardTilesCount)
  {
    legend.push(<h1 key='Standard Tiles'>Standard Tiles</h1>);
    legend.push(legendLoop(props, 'polygon', standardTilesCount));
    legend.push(<p key="standardTiles" className="standardTiles">Max Standard Tiles: {legendControl_maxStandardTiles}</p>);
  }*/


  return legend;
}

function legendLoop (props, loopContent, type)
{
  //console.log(props)
  let map = props.map;
  let timestamp = props.timestampRange.end;
  let layers;
  let legend = [];

  if(!map)
  {
    return null;
  }

  if(type === 'polygon')
  {
    let polygonLayers = map.polygonLayers;
    for (let i = 0; i < polygonLayers.length; i++)
    {
      if (polygonLayers[i].timestampNumber === timestamp)
      {
        layers = polygonLayers[i].layers;
        break 
      }
    }

    let result = [layers, loopContent].reduce((a, b) => a.map((c, i) => Object.assign({}, c, b[i])));
    for (let i = 0; i < result.length; i++)
    {
      let style = {background: '#' + result[i].color};
      //let count = ': ' + result[i].count;
      let block = <i key={i} style={style}></i>
      let name = result[i].name;

      let row = <p key={type + i}>{block}{name}{count}</p>

      legend.push(row)
      console.log(result[i]);
    }
/*    for (let key in result)
    {
      console.log(key, result[key])
    }*/
  }


  return legend;
  /*let map = props.map;
  let legend = [];
  let timestamp = props.timestampRange

  let type2 = '';
  let name = '';
  if(type === 'polygon')
  {
    type = 'polygonLayers';
    type2 = 'layers';
  }
  else
  {
    type2 = type;
    name = type[0].toUpperCase() + type.substr(1);;
  }

  if (type && map[type] !== undefined)
  {
    if (map[type].length > 0)
    {
      if(name !== '')
      {
        legend.push(<h2 key={type + 'Header'}>{name}</h2>);
      } 

      for (let i = 0; i < map[type].length; i++)
      {
        if(map[type][i].timestampNumber === timestamp.end)
        {
          if (map[type][i][type2])
          {
            for (let j = 0; j < map[type][i][type2].length; j++)
            {
              if (map[type][i][type2][j].name !== 'no class' && map[type][i][type2][j].name !== 'blanc' && map[type][i][type2][j].name !== 'mask')
              {
                let count;
                if (legendControl_checkedLayers.includes(map[type][i][type2][j].name))
                {
                  console.log(polygonCounts, map[type][i][type2][j], map[type][i][type2][j].name, legendControl_maxPolygons)
                  if(polygonCounts[map[type][i][type2][j].name] > legendControl_maxPolygons)
                  {
                    count = <span> {' on screen: '} <span style={{color: 'red'}}>{polygonCounts[map[type][i][type2][j].name]}</span></span>;
                  }
                  else
                  {  
                    count = ' on screen: ' + polygonCounts[map[type][i][type2][j].name];
                  }
                }

                let style = {background: '#'+map[type][i][type2][j].color};

                if(typeof(count) !== 'undefined' && legendControl_checkedLayers.includes(map[type][i][type2][j].name))
                {
                  count = <span className='onScreenCount' key={'count' + type + i + '.' + j}>{count}</span>;
                }

                legend.push(<p key={type + i + '.' + j}><i key={i} style={style}></i>{map[type][i][type2][j].name}{count}</p>);
                
              }
            }
          }
          break;
        }
      }
    }
  }
  return legend;*/
}



export default LegendControl;
