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

import QueryUtil from '../../../Utilities/QueryUtil';

let polygonLayersControl_checkedLayers = [];
let polygonLayersControl_layerGeoJsons = [];
let polygonLayersControl_polygonCounts = 0;

let polygonLayersControl_controlOverlays = [];

let polygonLayersControl_maxPolygon = 500;

let polygonLayersControl_randomKey = '1';

let polygonLayersControl_map = null;

const PolygonLayersControl = {
  getElement: () => {
    debugger;
    return { 
      polygonControlOverlays: polygonLayersControl_controlOverlays.length > 0 ? polygonLayersControl_controlOverlays : null, 
      polygonCounts: polygonLayersControl_polygonCounts 
    };
  },

  initialize: async (props, bounds, maxPolygons) => {
    polygonLayersControl_maxPolygon = maxPolygons;

    if (!props.map || !props.timestampRange) {
      polygonLayersControl_controlOverlays = [];
    }
    else {
      let layerInfo = await getPolygonsJson(props, bounds);
      polygonLayersControl_layerGeoJsons = layerInfo.layerGeoJsons;
      polygonLayersControl_polygonCounts = layerInfo.polygonCounts;

      polygonLayersControl_controlOverlays = createGeojsonLayerControl(props); 
    }

    polygonLayersControl_map = props.map;
  },

  update: async (props, bounds) => {
    if (polygonLayersControl_map !== props.map) {
      polygonLayersControl_checkedLayers = [];
    }

    if (!props.map || !props.timestampRange) {
      polygonLayersControl_controlOverlays = [];
    }
    else {
      let layerInfo = await getPolygonsJson(props, bounds);
      polygonLayersControl_layerGeoJsons = layerInfo.layerGeoJsons;
      polygonLayersControl_polygonCounts = layerInfo.polygonCounts;

      polygonLayersControl_controlOverlays = createGeojsonLayerControl(props); 
    }



    polygonLayersControl_map = props.map;
  },

  clear: () => {
    polygonLayersControl_controlOverlays = [];    
  },

  onOverlayAdd: (e) => {
    if (!polygonLayersControl_checkedLayers.includes(e.name)) {
      polygonLayersControl_checkedLayers.push(e.name);
    }
  },

  onOverlayRemove: (e) => {    
    let index = polygonLayersControl_checkedLayers.indexOf(e.name);
    if (index > -1) {
      polygonLayersControl_checkedLayers.splice(index, 1);
    }
  }
}

async function getPolygonsJson(props, bounds) {
  let map = props.map;
  
  if (!map) {
    return;
  }

  let geoJsonPromises = [];

  for (let i = 0; i < map.polygonLayers.length; i++) {
    if (map.polygonLayers[i].timestampNumber === props.timestampRange.end)
    {
      for (let j = 0; j < map.polygonLayers[i].layers.length; j++)
      {
        let geoJsonPromise = getPolygonsJsonAux(
          props.apiUrl,
          props.user, 
          map.uuid, 
          props.timestampRange.end, 
          bounds, 
          map.polygonLayers[i].layers[j].name,
          map.polygonLayers[i].layers[j].color);

        geoJsonPromises.push(geoJsonPromise);          
      }
    }
  }

  let layerGeoJsons = [];
  let polygonCounts ={};

  for (let i = 0; i < geoJsonPromises.length; i++) {
    let layerGeoJson = await geoJsonPromises[i];
    layerGeoJsons.push(layerGeoJson);
    polygonCounts[layerGeoJson.name] = layerGeoJson.count;
  }

  polygonLayersControl_randomKey = Math.random();

  return {
    layerGeoJsons: layerGeoJsons,
    polygonCounts: polygonCounts
  };
}

async function getPolygonsJsonAux(apiUrl, user, mapUuid, timestampEnd, bounds, layerName, layerColor) {
  let headers = {};
  if (user) {
    headers["Authorization"] = "BEARER " + user.token;
  }

  let polygonIdResult = await QueryUtil.getData(
    apiUrl + 'metadata/polygons',
    {
      mapId:  mapUuid,
      timestamp: timestampEnd,
      layer: layerName,
      xMin: bounds.xMin,
      xMax: bounds.xMax,
      yMin: bounds.yMin,
      yMax: bounds.yMax,
      limit: polygonLayersControl_maxPolygon
    },
    { headers }
  );

  if (typeof(polygonIdResult.ids) !== 'undefined' && polygonIdResult.ids.length > 0)
  {
    let polygonsGeoJson = await QueryUtil.getData(
      apiUrl + 'geometry/polygons',
      {
        mapId:  mapUuid,
        timestamp: timestampEnd,
        polygonIds: polygonIdResult.ids
      },
      { headers }
    );

    polygonsGeoJson.name = layerName;
    polygonsGeoJson.color = layerColor;
    polygonsGeoJson.count = polygonIdResult.count

    return polygonsGeoJson;
  }
  else {
    return {
      name: layerName,
      color: layerColor,
      count: polygonIdResult.count
    };
  }
}

function createGeojsonLayerControl(props) {
  let map = props.map;
  let layers = [];

  if (!map) {
    return null;
  }

  let layerGeoJsons = polygonLayersControl_layerGeoJsons;

  for (let i = 0; i < layerGeoJsons.length; i++)
  {
    let geoJson;
    if (layerGeoJsons[i].count <= polygonLayersControl_maxPolygon && layerGeoJsons[i].type)
    {
      geoJson = 
        <GeoJSON
          data={layerGeoJsons[i]}
          onEachFeature={onEachFeature}
          style={{color: '#' + layerGeoJsons[i].color, weight: 1}}
          key={polygonLayersControl_randomKey}
          zIndex={1000}
        />
    }

    let checked = polygonLayersControl_checkedLayers.includes(layerGeoJsons[i].name);

    let r = Math.random();
    let layer = (
      <LayersControl.Overlay
        key={r}
        name={layerGeoJsons[i].name}
        checked={checked}
      >
        <LayerGroup name={layerGeoJsons[i].name} key={i}>
          {geoJson}
        </LayerGroup>
      </LayersControl.Overlay> 
    ); 

    layers.push(layer);
  }

  if (layers.length > 0)
  {
    return layers;
  }
  else
  {
    return null;
  }
}

function onEachFeature(feature, layer) {
  if (feature.properties) {
    let popupContent = '';

    for (let property in feature.properties) {
      if (feature.properties.hasOwnProperty(property)) {      
        popupContent += `<span><strong>${property}</strong>: ${feature.properties[property]}<br/></span>`
      }
    }
    layer.bindPopup(popupContent);
  }
}

export default PolygonLayersControl;
