import React, { PureComponent, createRef } from 'react';

import {
  Map,
  TileLayer,
  GeoJSON,
  LayersControl,
  LayerGroup,
  FeatureGroup,
  Popup,
  Polygon,
  Marker
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
  maxZoom: 14,
  noWrap: true,
  format: 'image/png'
};

const baseSatelliteOverlay = (
  <LayersControl.Overlay checked name="Base satellite">
    <TileLayer
      url="https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWhqaWFuZyIsImEiOiJjamhkNXU3azcwZW1oMzZvNjRrb214cDVsIn0.QZWgmabi2gRJAWr1Vr3h7w"
      attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href = "https://www.mapbox.com/" > Mapbox</a >'
      noWrap={true}
      zIndex={0}
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
        let url = `${props.apiUrl}tileLayer/${map.uuid}/${timestampNumber}/${tileLayerName}/{z}/{x}/{y}`;

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

    let layerElements = [];

    tileLayersOfTypes.layers.forEach(layer => {
      let layerName = layer.name;

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

// export class TileLayersControl extends PureComponent {


//   componentWillReceiveProps = (nextProps) => {
//     let differentMap = nextProps.map !== this.props.map;
//     let differentTimestamp = nextProps.timestampRange !== this.props.timestampRange ||
//       nextProps.timestampRange.start !== this.props.timestampRange.start || 
//       nextProps.timestampRange.end !== this.props.timestampRange.end
    
//     if (differentMap || differentTimestamp) {
//       if (differentMap) {
//         this.preparedtileLayers = this.prepareLayers(nextProps);
//       }

//       let controlOverlays = this.prepareTileLayersOverlays();

//       this.setState({ controlOverlays: controlOverlays });
//     }
//   }

//   onOverlayAdd = (e) => {
//     if (!this.checkedLayers.includes(e.name)) {
//       this.checkedLayers.push(e.name);
//     }
//   }

//   onOverlayRemove = (e) => {    
//     let index = this.checkedLayers.indexOf(e.name);
//     if (index > -1) {
//       this.checkedLayers.splice(index, 1);
//     }
//   }

//   prepareLayers = (props) => {
//     let map = props.map;
//     if (!map || !map.tileLayers) {
//       return [];
//     }

//     this.checkedLayers.length = 0;
    
//     let preparedtileLayers = [];

//     for (var i = 0; i < tileLayerTypes.length; i++)
//     {
//       let tileLayerType = tileLayerTypes[i];

//       let mapTileLayerType = map.tileLayers.find(x => x.type === tileLayerType.name);

//       if (!mapTileLayerType) {
//         continue;
//       }

//       let tileLayersOfTypes = [];

//       for (var j = 0; j < mapTileLayerType.layers.length; j++)
//       {
//         let tileLayerName = mapTileLayerType.layers[j];

//         if (tileLayerType.checked && !this.checkedLayers.includes(tileLayerName)) {
//           this.checkedLayers.push(tileLayerName);
//         }

//         let tileLayersOfType = tileLayerTypes.find(x => x.name === tileLayerName);

//         if (!tileLayersOfType) {
//           tileLayersOfType = {
//             name: tileLayerName,
//             timestampElements: []
//           };

//           tileLayersOfTypes.push(tileLayersOfType);
//         }

//         mapTileLayerType.timestamps.forEach(timestampNumber => {
//           let url = `${props.apiUrl}tileLayer/${map.uuid}/${timestampNumber}/${tileLayerName}/{z}/{x}/{y}`;

//           tileLayersOfType.timestampElements.push({
//             timestampNumber: timestampNumber,
//             element: (<TileLayer
//               url={url}
//               tileSize={mapParams.tileSize}
//               noWrap={mapParams.noWrap}
//               maxZoom={mapParams.maxZoom}
//               attribution={mapParams.attribution}
//               format={mapParams.format}
//               zIndex={tileLayerType.zIndex + (tileLayersOfType.timestampElements.length + 1)}
//               key={timestampNumber + '.' + j}
//               errorTileUrl={props.publicFilesUrl + 'images/dummy_tile.png'}
//               bounds = {L.latLngBounds(L.latLng(map.yMin, map.xMin), L.latLng(map.yMax, map.xMax))}
//             />)
//           });
//         })
//       }

//       preparedtileLayers.push({
//         type: tileLayerType.name,
//         layers: tileLayersOfTypes
//       });
//     }

//     return preparedtileLayers;
//   }

//   prepareTileLayersOverlays = () => {
//     let controlOverlays = [];

//     let map = this.props.map;
//     let timestampRange = this.props.timestampRange;

//     if (!map || !timestampRange || !this.state.preparedtileLayers) {
//       return null;
//     }

//     for (let i = 0; i < tileLayerTypes.length; i++) {
//       let tileLayerType = tileLayerTypes[i];

//       let tileLayersOfTypes = this.state.preparedtileLayers.find(x => x.type === tileLayerType.name);

//       if (!tileLayersOfTypes) {
//         continue;
//       }

//       let timestampStart = tileLayerType.stacking ? timestampRange.start : timestampRange.end;

//       let layerElements = [];

//       tileLayersOfTypes.layers.forEach(layer => {
//         let layerName = layer.name;

//         for (let j = timestampStart; j <= timestampRange.end; j++) {

//           let timestampNumber = map.timestamps[j].timestampNumber;
//           let timestampElement = layer.timestampElements.find(x => x.timestampNumber === timestampNumber);

//           if (!timestampElement) {
//             continue;
//           }

//           layerElements.push(timestampElement.element);
//         }

//         controlOverlays.push(
//           <LayersControl.Overlay 
//             name={layerName} 
//             key={map.name + layerName} 
//             checked={this.state.checkedLayers.includes(layerName)}
//           >
//             <LayerGroup name={layerName} key={layerName}>
//               {layerElements}
//             </LayerGroup>
//           </LayersControl.Overlay>
//         );
//       })
//     }

//     return controlOverlays;
//   }

//   render() {
//     return (
//       <LayersControl position="topright">
//         { this.baseSatellieOverlay }
//         { this.state.controlOverlays }
//       </LayersControl>
//     );
//   }

// }

export default TileLayersControl;
