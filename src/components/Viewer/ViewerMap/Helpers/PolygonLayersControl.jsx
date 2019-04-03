//import React, { PureComponent, createRef } from 'react';
import React from 'react';

import {
  //Map,
  //TileLayer,
  GeoJSON,
  LayersControl,
  LayerGroup,
  //FeatureGroup,
  Popup,
  //Polygon,
  //Marker
} from "react-leaflet";
//import L from "leaflet";

import QueryUtil from '../../../Utilities/QueryUtil';

let polygonLayersControl_checkedLayers = [];
let polygonLayersControl_layerGeoJsons = [];
let polygonLayersControl_polygonCounts = 0;

let polygonLayersControl_controlOverlays = [];

let polygonLayersControl_maxPolygon = 500;

let polygonLayersControl_randomKey = '1';

let polygonLayersControl_map = null;

let polygonLayersControl_PopupContent = {}

const PolygonLayersControl = {
  getElement: () => {
    return { 
      polygonControlOverlays: polygonLayersControl_controlOverlays && polygonLayersControl_controlOverlays.length > 0 ? polygonLayersControl_controlOverlays : null, 
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
    polygonLayersControl_polygonCounts = 0;
    polygonLayersControl_PopupContent = {}
    polygonLayersControl_map = null;
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
  },

  onFeatureClick: (props, contentFunction) => {
    console.log(polygonLayersControl_PopupContent, polygonLayersControl_PopupContent.id);
    if (polygonLayersControl_PopupContent && polygonLayersControl_PopupContent.id)
    {
      let popup = polygonLayersControl_PopupContent;
      let id = popup.id;
      let content = [];
      let properties = Object.create(popup.properties);

      for (let key in popup.properties)
      {
        content.push(<p key={id + '.' + key}><span>{key}:</span> {popup.properties[key]}</p>)
      }

      let classes; let spectral;
      for (let i = 0; i < props.map.classes.length; i++)
      {
        if (props.map.classes[i].timestampNumber === props.timestampRange.end)
        {
          classes = props.map.classes[i].classes;
          spectral = props.map.spectral[i].indices;
          break;
        }
      }

      if(popup.properties && props.map && props.timestampRange && props.apiUrl && polygonLayersControl_PopupContent.data)
      {
        properties.class = classes;
        properties.spectral = spectral;
        properties.layerName = polygonLayersControl_PopupContent.data.layerName;
        properties.hasAggregatedData = polygonLayersControl_PopupContent.data.hasAggregatedData;
        properties.uuid = props.map.uuid;
        properties.timestamp = props.timestampRange.end;
        properties.apiUrl = props.apiUrl;
        properties.type = polygonLayersControl_PopupContent.geometry.type;
        properties.coordinates = polygonLayersControl_PopupContent.geometry.coordinates;

        if (props.user)
        {
          properties.headers = {Authorization: "Bearer " + props.user.token}
        }
        else
        {
          properties.headers = []
        }
      }

      let analyse = <a className="noselect" onClick={() => {handleTile('analyse', contentFunction, id, properties)} }>Analyse</a>

      let report;

      if (props.user)
      {
        report =  <a className="noselect" onClick={() => {handleTile('report', contentFunction, id, properties)} }>GeoMessage</a>
      }

      return (
        <Popup position={popup.e.latlng} key={id + Math.random() + Math.random() + Math.random()}>
          <div key={id + '.content' + Math.random() + Math.random() + Math.random()}>
            {content}
          </div>
          {analyse}
          {/*report*/}
        </Popup>
      );
    }
    else
    {
      return null;
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
          map.polygonLayers[i].layers[j].color,
          map.polygonLayers[i].layers[j].hasAggregatedData);

        geoJsonPromises.push(geoJsonPromise);          
      }
    }
  }

  let layerGeoJsons = [];
  let polygonCounts = [];

  for (let i = 0; i < geoJsonPromises.length; i++) {
    let layerGeoJson = await geoJsonPromises[i];
    layerGeoJsons.push(layerGeoJson);
    polygonCounts.push({
      name: layerGeoJson.name,
      count: layerGeoJson.count,
    });
  }

  polygonLayersControl_randomKey = Math.random();

  return {
    layerGeoJsons: layerGeoJsons,
    polygonCounts: polygonCounts
  };
}

async function getPolygonsJsonAux(apiUrl, user, mapUuid, timestampEnd, bounds, layerName, layerColor, hasAggregatedData) {
  let headers = {};
  if (user) {
    headers["Authorization"] = "Bearer " + user.token;
  }

  let polygonIdResult = await QueryUtil.postData(
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
    }, headers
  );
  if (typeof(polygonIdResult.ids) !== 'undefined' && polygonIdResult.ids.length > 0)
  {
    let polygonsGeoJson = await QueryUtil.postData(
      apiUrl + 'geometry/polygons',
      {
        mapId:  mapUuid,
        timestamp: timestampEnd,
        polygonIds: polygonIdResult.ids
      }, headers
    );

    polygonsGeoJson.name = layerName;
    polygonsGeoJson.color = layerColor;
    polygonsGeoJson.count = polygonIdResult.count
    polygonsGeoJson.hasAggregatedData = hasAggregatedData

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
  layer.on({
    click: function(e){
      feature.e = e;
      feature.data = 
      {
        color: layer.options.data.color,
        layerName: layer.options.data.name,
        hasAggregatedData: layer.options.data.hasAggregatedData,
      }
      polygonLayersControl_PopupContent = feature;
    }
  });
}

function handleTile(type, contentFunction, id, properties)
{
  contentFunction({
    id: id,
    openPane: true,
    type: type,
    properties: properties,
  });
}

export default PolygonLayersControl;