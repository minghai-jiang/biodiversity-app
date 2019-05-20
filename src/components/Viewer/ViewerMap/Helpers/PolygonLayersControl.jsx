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
let polygonLayersControl_mapRef = {};

let polygonLayersControl_PopupContent = {};

let polygonLayersControl_highlight = -1;
let polygonLayersControl_highlightCenter = [];
let polygonLayersControl_refresh = () => {};
let polygonLayersControl_shouldRefresh = false;

const PolygonLayersControl = {
  getElement: () => {
    return { 
      polygonControlOverlays: polygonLayersControl_controlOverlays && polygonLayersControl_controlOverlays.length > 0 ? polygonLayersControl_controlOverlays : null, 
      polygonCounts: polygonLayersControl_polygonCounts 
    };
  },

  initialize: async (props, bounds, maxPolygons, map) => {
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
    polygonLayersControl_mapRef = map;
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

    polygonLayersControl_checkedLayers = [];
    polygonLayersControl_layerGeoJsons = [];
    polygonLayersControl_controlOverlays = [];

    polygonLayersControl_highlight = -1;
    polygonLayersControl_highlightCenter = [];
    polygonLayersControl_refresh = () => {};
  },

  onOverlayAdd: (e, refresh) => {
    polygonLayersControl_PopupContent = {};
    polygonLayersControl_mapRef.closePopup();

    if (!polygonLayersControl_checkedLayers.includes(e.name)) {
      polygonLayersControl_checkedLayers.push(e.name);
    }

    if (e.id)
    {
      polygonLayersControl_highlight = e.id;
      polygonLayersControl_highlightCenter = e.center;
      polygonLayersControl_refresh = refresh;
      polygonLayersControl_shouldRefresh = true;
    }
  },

  onOverlayRemove: (e) => {    
    let index = polygonLayersControl_checkedLayers.indexOf(e.name);
    if (index > -1) {
      polygonLayersControl_checkedLayers.splice(index, 1);
    }

    polygonLayersControl_PopupContent = {};
    polygonLayersControl_mapRef.closePopup();
  },

  onFeatureClick: (props, contentFunction) => {
    if (polygonLayersControl_PopupContent && polygonLayersControl_PopupContent.id && polygonLayersControl_PopupContent.data.click)
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
          props.map.classes[i] ? classes = props.map.classes[i].classes : classes = undefined;
          props.map.spectral[i] ? spectral = props.map.spectral[i].indices : spectral = undefined;
          break;
        }
      }

      if(popup.properties && props.map && props.timestampRange && props.apiUrl && polygonLayersControl_PopupContent.data)
      {
        properties.id = polygonLayersControl_PopupContent.id;
        properties.class = classes;
        properties.spectral = spectral;
        properties.layerName = polygonLayersControl_PopupContent.data.layerName;
        properties.hasAggregatedData = polygonLayersControl_PopupContent.data.hasAggregatedData;
        properties.uuid = props.map.uuid;
        properties.timestamp = props.timestampRange.end;
        properties.apiUrl = props.apiUrl;
        properties.type = polygonLayersControl_PopupContent.geometry.type;
        properties.coordinates = polygonLayersControl_PopupContent.geometry.coordinates;
        properties.kind = 'polygon';

        if (props.user)
        {
          properties.headers = {Authorization: "Bearer " + props.user.token}
        }
        else
        {
          properties.headers = []
        }
      }

      let analyse = <a className="noselect" onClick={() => {handlePolygon('analyse', contentFunction, id, properties, Math.random())} }>Analyse</a>
      let report =  <a className="noselect" onClick={() => {handlePolygon('report', contentFunction, id, properties, Math.random())} }>GeoMessage</a>      

      polygonLayersControl_PopupContent.data.click = false;
      return (
        <Popup position={popup.e.latlng} key={id + Math.random()}  autoPan={false} keepInView={false}>
          <div key={id + '.content'}>
            {content}
          </div>
          {analyse}
          {report}
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

  for (let i = 0; i < geoJsonPromises.length; i++)
  {
    let layerGeoJson = await geoJsonPromises[i];
    if (layerGeoJson)
    {    
      layerGeoJsons.push(layerGeoJson);
      if (layerGeoJson.polygonLayer)
      {
        polygonCounts.push({
          name: layerGeoJson.polygonLayer.name,
          count: layerGeoJson.polygonLayer.count,
        });
      }
      else
      {
        polygonCounts.push({
          name: layerGeoJson.name,
          count: layerGeoJson.count,
        });
      }
    }
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

    let filteredPolygons = {};
    
    if (polygonsGeoJson)
    {
      let filteredPolygonFeatures = [];
      let filteredPolygonResult = await QueryUtil.postData(
        apiUrl + 'geoMessage/polygon/ids',
        {
          mapId:  mapUuid,
          xMin: bounds.xMin,
          xMax: bounds.xMax,
          yMin: bounds.yMin,
          yMax: bounds.yMax,
          limit: polygonLayersControl_maxPolygon,
        }, headers
      );

      if (filteredPolygonResult && filteredPolygonResult.ids)
      {
        for (let i = 0; i < polygonsGeoJson.features.length; i++)
        {
          let polygonProperties = polygonsGeoJson.features[i].properties;

          for (let j = 0; j < filteredPolygonResult.ids.length; j++)
          {
            if (polygonProperties.id === filteredPolygonResult.ids[j])
            {
              filteredPolygonFeatures.push(polygonsGeoJson.features[i]);
            }
          }
        }
      
        let ids = [...new Set(filteredPolygonFeatures.map(item => item.id))];
        polygonsGeoJson.features = polygonsGeoJson.features.filter(item => !ids.includes(item.id));
        
        filteredPolygons.type = "FeatureCollection";
        filteredPolygons.count = filteredPolygonFeatures.length;
        filteredPolygons.features = filteredPolygonFeatures;
        filteredPolygons.name = 'Polygon Error';
      }
    }
    

    polygonsGeoJson.name = layerName;
    polygonsGeoJson.color = layerColor;
    polygonsGeoJson.count = polygonIdResult.count
    polygonsGeoJson.hasAggregatedData = hasAggregatedData

    return {polygonLayer: polygonsGeoJson, errorPolygons: filteredPolygons};
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

  if (layerGeoJsons)
  {
    for (let i = 0; i < layerGeoJsons.length; i++)
    {
      let geoJson = [];
      if (layerGeoJsons[i].polygonLayer && layerGeoJsons[i].polygonLayer.count <= polygonLayersControl_maxPolygon && layerGeoJsons[i].polygonLayer.type)
      {
        geoJson.push( 
          <GeoJSON
            data={layerGeoJsons[i].polygonLayer}
            onEachFeature={onEachFeature}
            style={{color: '#' + layerGeoJsons[i].polygonLayer.color, weight: 1}}
            key={polygonLayersControl_randomKey}
            zIndex={1000}
          />);

          if (layerGeoJsons[i].errorPolygons.count > 0)
          {
            geoJson.push(<GeoJSON
              data={layerGeoJsons[i].errorPolygons}
              onEachFeature={onEachFeature}
              style={{color: 'red', weight: 1}}
              key={polygonLayersControl_randomKey + 'error'}
              zIndex={1000}
            />);
          }
      }

      let name = layerGeoJsons[i].polygonLayer ? layerGeoJsons[i].polygonLayer.name : layerGeoJsons[i].name;
      let checked = polygonLayersControl_checkedLayers.includes(name);

      let r = Math.random();
      let layer = (
        <LayersControl.Overlay
          key={r}
          name={name}
          checked={checked}
        >
          <LayerGroup name={name} key={i}>
            {geoJson}
          </LayerGroup>
        </LayersControl.Overlay> 
      ); 

      layers.push(layer);
    }
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

function addFeatureData(feature, layer)
{
  feature.data = 
  {
    color: layer.options.data.color,
    layerName: layer.options.data.name,
    hasAggregatedData: layer.options.data.hasAggregatedData,
    click: true,
  }

  polygonLayersControl_PopupContent = feature;

  if (polygonLayersControl_shouldRefresh) {
    polygonLayersControl_shouldRefresh = false;
    polygonLayersControl_refresh();
  }
}

function onEachFeature(feature, layer) {
  if (polygonLayersControl_highlight !== -1 && polygonLayersControl_highlight[0] == feature.id)
  {
    feature.e = {};
    feature.e.latlng = polygonLayersControl_highlightCenter;
    addFeatureData(feature, layer);
  }

  layer.on({
    click: function(e){
      polygonLayersControl_mapRef.closePopup();
      feature.e = e;
      addFeatureData(feature, layer);
      //polygonLayersControl_refresh();
    }
  });

}

function handlePolygon(type, contentFunction, id, properties, random)
{
  contentFunction({
    id: id,
    openpane: true,
    type: type,
    properties: properties,
    random: random,
  });
}

export default PolygonLayersControl;
