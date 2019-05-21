//import React, { PureComponent, createRef } from 'react';
import React from 'react';

import {
  //Map,
  TileLayer,
  //GeoJSON,
  LayersControl,
  LayerGroup,
  //FeatureGroup,
  //Popup,
  //Polygon,
  //Marker
} from "react-leaflet";
import L from "leaflet";

const imagesTileLayer = 'images';
const labelsTileLayer = 'labels';
const indicesTileLayer = 'indices';
//const changesTileLayer = 'changes';

const tileLayerTypes = [ 
  {
    name: imagesTileLayer, 
    checked: true,
    stacking: true,
    zIndex: 100
  },
  {
    name: labelsTileLayer, 
    checked: true,
    stacking: false,
    zIndex: 200,
  },
  {
    name: indicesTileLayer, 
    checked: false,
    stacking: false,
    zIndex: 300
  }
/*  {
    name: changesTileLayer,
    checked: false,
    stacking: true,
    zIndex: 400
  }*/
];

const mapParams = {
  tileSize: 256,
  attribution: 'Ellipsis Earth Intelligence',
  maxZoom: 19,
  noWrap: true,
  format: 'image/png'
};

const baseSatelliteOverlay = (
  <LayersControl.Overlay checked name="Base satellite" key="Base streets-satellite">
    <TileLayer
      url='https://www.google.com/maps/vt?lyrs=y@189&x={x}&y={y}&z={z}'
      attribution='Base satellite: <a href="https://www.maps.google.com">Google Maps</a>'
      noWrap={true}
      zIndex={0}
      maxZoom={19}
    />
  </LayersControl.Overlay>
)

let tileLayersControl_checkedLayers = [];
let tileLayersControl_preparedtileLayers = [];
let tileLayersControl_controlOverlays = [];

let tileLayersControl_map = null;
let tileLayersControl_timestampRange = null;

const TileLayersControl = {
  getElement: () => {
    return [ baseSatelliteOverlay, ...tileLayersControl_controlOverlays ];
  },

  initialize: (props) => {
    if (!props.map || !props.timestampRange) {
      tileLayersControl_controlOverlays = [];
    }
    else {
      tileLayersControl_preparedtileLayers = tileLayersControl_prepareLayers(props);
      tileLayersControl_controlOverlays = prepareTileLayersOverlays(props); 
    }

    tileLayersControl_map = props.map;
    tileLayersControl_timestampRange = props.timestampRange;
  },

  update: (props) => {
    let differentMap = props.map !== tileLayersControl_map;
    let differentTimestamp = props.timestampRange !== tileLayersControl_timestampRange ||
    props.timestampRange.start !== tileLayersControl_timestampRange.start || 
    props.timestampRange.end !== tileLayersControl_timestampRange.end
    
    if (differentMap || differentTimestamp) {
      if (differentMap) {
        tileLayersControl_preparedtileLayers = tileLayersControl_prepareLayers(props);
      }

      tileLayersControl_controlOverlays = prepareTileLayersOverlays(props);
    }

    tileLayersControl_map = props.map;
    tileLayersControl_timestampRange = props.timestampRange;
  },

  onOverlayAdd: (e) => {
    if (!tileLayersControl_checkedLayers.includes(e.name)) {
      tileLayersControl_checkedLayers.push(e.name);
    }
  },

  onOverlayRemove: (e) => {    
    let index = tileLayersControl_checkedLayers.indexOf(e.name);
    if (index > -1) {
      tileLayersControl_checkedLayers.splice(index, 1);
    }
  },

  clear: (e) => {
    tileLayersControl_controlOverlays = [];
  }
}


function tileLayersControl_prepareLayers (props) {
  let map = props.map;
  if (!map || !map.tileLayers) {
    return [];
  }

  tileLayersControl_checkedLayers.length = 0;
  
  let preparedtileLayers = [];

  for (var i = 0; i < tileLayerTypes.length; i++)
  {
    let tileLayerType = tileLayerTypes[i];

    let mapTileLayerType = map.tileLayers.find(x => x.type === tileLayerType.name);

    if (!mapTileLayerType) {
      continue;
    }

    let tileLayersOfTypes = [];

    for (var j = 0; j < mapTileLayerType.layers.length; j++)
    {
      let tileLayerName = mapTileLayerType.layers[j];

      if (tileLayerType.checked && !tileLayersControl_checkedLayers.includes(tileLayerName)) {
        tileLayersControl_checkedLayers.push(tileLayerName);
      }

      let tileLayersOfType = tileLayerTypes.find(x => x.name === tileLayerName);

      if (!tileLayersOfType) {
        tileLayersOfType = {
          name: tileLayerName,
          timestampElements: []
        };

        tileLayersOfTypes.push(tileLayersOfType);
      }

      mapTileLayerType.timestamps.forEach(timestampNumber => {
        let url = `${props.apiUrl}tileService/${map.uuid}/${timestampNumber}/${tileLayerName}/{z}/{x}/{y}`;

        tileLayersOfType.timestampElements.push({
          timestampNumber: timestampNumber,
          element: (<TileLayer
            url={url}
            tileSize={mapParams.tileSize}
            noWrap={mapParams.noWrap}
            maxZoom={mapParams.maxZoom}
            attribution={mapParams.attribution}
            format={mapParams.format}
            zIndex={tileLayerType.zIndex + (tileLayersOfType.timestampElements.length + 1)}
            key={timestampNumber + '.' + j}
            errorTileUrl={props.publicFilesUrl + 'images/dummy_tile.png'}
            bounds = {L.latLngBounds(L.latLng(map.yMin, map.xMin), L.latLng(map.yMax, map.xMax))}
          />)
        });
      })
    }

    preparedtileLayers.push({
      type: tileLayerType.name,
      layers: tileLayersOfTypes
    });
  }

  return preparedtileLayers;
}

function prepareTileLayersOverlays (props) {
  let controlOverlays = [];

  let map = props.map;
  let timestampRange = props.timestampRange;

  if (!map || !timestampRange || !tileLayersControl_preparedtileLayers) {
    return null;
  }

  for (let i = 0; i < tileLayerTypes.length; i++) {
    let tileLayerType = tileLayerTypes[i];

    let tileLayersOfTypes = tileLayersControl_preparedtileLayers.find(x => x.type === tileLayerType.name);

    if (!tileLayersOfTypes) {
      continue;
    }

    let timestampStart = tileLayerType.stacking ? timestampRange.start : timestampRange.end;

    tileLayersOfTypes.layers.forEach(layer => {
      let layerName = layer.name;
      let layerElements = [];

      for (let j = timestampStart; j <= timestampRange.end; j++) {

        let timestampNumber = map.timestamps[j].timestampNumber;
        let timestampElement = layer.timestampElements.find(x => x.timestampNumber === timestampNumber);

        if (!timestampElement) {
          continue;
        }

        layerElements.push(timestampElement.element);
      }

      controlOverlays.push(
        <LayersControl.Overlay 
          name={layerName} 
          key={map.name + layerName} 
          checked={tileLayersControl_checkedLayers.includes(layerName)}
        >
          <LayerGroup name={layerName} key={layerName}>
            {layerElements}
          </LayerGroup>
        </LayersControl.Overlay>
      );
    })
  }

  return controlOverlays;
}

export default TileLayersControl;
