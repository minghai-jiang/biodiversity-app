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

let StandardTiles_checkedLayers = [];
let StandardTiles_layerGeoJsons = [];
let StandardTiles_filteredTiles = []
let StandardTiles_polygonCounts = 0;

let StandardTiles_controlOverlays = [];

let StandardTilesControl_maxPolygon = 1000;

let StandardTiles_randomKey = '1';

let StandardTiles_map = null;

let StandardTiles_PopupContent = {};

const StandardTilesLayer = {
  getElement: () => {
    return { 
      polygonControlOverlays: StandardTiles_controlOverlays && StandardTiles_controlOverlays.length > 0 ? StandardTiles_controlOverlays : null, 
      polygonCounts: StandardTiles_polygonCounts 
    };
  },

  initialize: async (props, bounds, maxPolygons) => {
    StandardTilesControl_maxPolygon = maxPolygons;

    if (!props.map || !props.timestampRange) {
      StandardTiles_controlOverlays = [];
    }
    else {
      let layerInfo = await getTilesJson(props, bounds);
      StandardTiles_layerGeoJsons = layerInfo.layerGeoJsons;
      StandardTiles_filteredTiles = layerInfo.errorTiles;
      StandardTiles_polygonCounts = layerInfo.polygonCounts;
      layerInfo.errorTiles ? StandardTiles_filteredTiles = layerInfo.errorTiles : StandardTiles_filteredTiles = [];

      StandardTiles_controlOverlays = createGeojsonLayerControl(props); 
    }

    StandardTiles_map = props.map;
  },

  update: async (props, bounds) => {
    if (StandardTiles_map !== props.map) {
      StandardTiles_checkedLayers = [];
    }

    if (!props.map || !props.timestampRange) {
      StandardTiles_controlOverlays = [];
    }
    else {
      let layerInfo = await getTilesJson(props, bounds);
      
      StandardTiles_layerGeoJsons = layerInfo.layerGeoJsons;
      StandardTiles_polygonCounts = layerInfo.polygonCounts;
      StandardTiles_filteredTiles = layerInfo.errorTiles;
      layerInfo.errorGeoJsons ? StandardTiles_filteredTiles = layerInfo.errorGeoJsons : StandardTiles_filteredTiles = [];

      StandardTiles_controlOverlays = createGeojsonLayerControl(props);
    }

    StandardTiles_map = props.map;

    //console.log(StandardTiles_polygonCounts);
  },

  clear: () => {
    StandardTiles_controlOverlays = [];    
  },

  onOverlayAdd: (e) => {
    if (!StandardTiles_checkedLayers.includes(e.name)) {
      StandardTiles_checkedLayers.push(e.name);
    }
  },

  onOverlayRemove: (e) => {    
    let index = StandardTiles_checkedLayers.indexOf(e.name);
    if (index > -1) {
      StandardTiles_checkedLayers.splice(index, 1);
    }
  },

  onFeatureClick: (props, contentFunction) => {
    if (StandardTiles_PopupContent && StandardTiles_PopupContent.id)
    {
      console.log(StandardTiles_PopupContent, props, contentFunction);
      let popup = StandardTiles_PopupContent;
      let id = popup.id + '.' + popup.properties.tileX + "." + popup.properties.tileY + '.' +  popup.properties.zoom;
      let content = [];
      let properties = Object.create(popup.properties);

      for (let key in popup.properties)
      {
        content.push(<p key={id + '.' + key + '.' + popup.properties[key]}><span>{key}:</span> {popup.properties[key]}</p>)
      }

      if(popup.properties && props.map && props.timestampRange && props.apiUrl)
      {
        properties.uuid = props.map.uuid;
        properties.timestamp = props.timestampRange.end;
        properties.apiUrl = props.apiUrl;
        if (props.user)
        {
          properties.headers = {Authorization: "BEARER " + props.user.token}
        }
        else
        {
          properties.headers = []
        }
      }

      let analyse = <a className="noselect" onClick={() => {handleTile('analyse', contentFunction, id, properties)} }>Analyse this tile</a>

      let report;

      if (props.user)
      {
        report =  <a className="noselect" onClick={() => {handleTile('report', contentFunction, id, properties)} }>Report error in this tile</a>
      }

      return (
        <Popup position={popup.e.latlng} key={id}>
          <div key={id + '.content'}>
            {content}
          </div>
          {/*analyse*/}
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

async function getTilesJson(props, bounds) {
  let map = props.map;
  
  if (!map) {
    return;
  }


  let geoJsonPromise = getTilesJsonAux(
    props.apiUrl,
    props.user, 
    map.uuid, 
    props.timestampRange.end, 
    bounds);

  let layerGeoJson = await geoJsonPromise;
  let polygonCounts ={
    name: layerGeoJson.standardTiles.name,
    count: layerGeoJson.standardTiles.originalCount,
  };

  return {
    layerGeoJsons: layerGeoJson.standardTiles,
    errorGeoJsons: layerGeoJson.errorTiles,
    polygonCounts: polygonCounts
  };
}

async function getTilesJsonAux(apiUrl, user, mapUuid, timestampEnd, bounds) {
  let headers = {};
  if (user) {
    headers["Authorization"] = "BEARER " + user.token;
  }

  let tilesIdResult = await QueryUtil.postData(
    apiUrl + 'metadata/tiles',
    {
      mapId:  mapUuid,
      timestamp: timestampEnd,
      xMin: bounds.xMin,
      xMax: bounds.xMax,
      yMin: bounds.yMin,
      yMax: bounds.yMax,
      limit: StandardTilesControl_maxPolygon
    },
    { headers }
  );


  if (typeof(tilesIdResult.ids) !== 'undefined' && tilesIdResult.ids.length > 0)
  {
    let tilesGeoJson = await QueryUtil.postData(
      apiUrl + 'geometry/tiles',
      {
        mapId:  mapUuid,
        timestamp: timestampEnd,
        tileIds: tilesIdResult.ids
      },
      { headers }
    );

    let filteredTiles = {};

    if (tilesGeoJson && user)
    {
      let filteredTilesFeatures = [];
      let filteredTilesResult = await QueryUtil.postData(
        apiUrl + 'feedback/error/get',
        {
          mapId:  mapUuid,
          timestamp: timestampEnd
        },
        {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW9fdXNlciIsImlhdCI6MTU1MzYxNDQ2MSwiZXhwIjoxNTUzNzAwODYxfQ.3rxpY3a3gOFqXGyxXDUEsYzU-EVkh13LD-Ua9WR-RSE'
        }
      );

      for (let i = 0; i < tilesGeoJson.features.length; i++)
      {
        let tileProperties = tilesGeoJson.features[i].properties;

        for (let j = 0; j < filteredTilesResult.length; j++)
        {
          if (tileProperties.tileX === filteredTilesResult[j].tileX && tileProperties.tileY === filteredTilesResult[j].tileY && tileProperties.zoom === filteredTilesResult[j].zoom)
          {
            tilesGeoJson.features[i].feedback = filteredTilesResult[j].feedback;
            filteredTilesFeatures.push(tilesGeoJson.features[i]);
          }
        }
      }

      let ids = [...new Set(filteredTilesFeatures.map(item => item.id))];
      tilesGeoJson.features = tilesGeoJson.features.filter(item => !ids.includes(item.id));
      
      filteredTiles.type = "FeatureCollection";
      filteredTiles.count = filteredTilesFeatures.length;
      filteredTiles.features = filteredTilesFeatures;
      filteredTiles.name = 'Standard Tiles Error';
    }

    tilesGeoJson.name = 'Standard Tiles';
    //tilesGeoJson.color = layerColor;
    tilesGeoJson.count = tilesGeoJson.features.length
    tilesGeoJson.originalCount = tilesIdResult.count

    return {standardTiles: tilesGeoJson, errorTiles: filteredTiles};
  }
  else {
    return {
      name: 'Standard Tiles',
      //color: layerColor,
      count: tilesIdResult.count
    };
  }
}

function createGeojsonLayerControl(props) {
  let map = props.map;
  let layers = [];

  if (!map) {
    return null;
  }

  let layerGeoJson = StandardTiles_layerGeoJsons;
  let filteredTiles = StandardTiles_filteredTiles;
  let geoJson = [];

  if (layerGeoJson.count <= StandardTilesControl_maxPolygon)
  {
    geoJson.push( 
      <GeoJSON
        data={layerGeoJson}
        onEachFeature={onEachFeature}
        style={{color: 'cornflowerblue', weight: 1, opacity: 0.5}}
        key={StandardTiles_randomKey}
        zIndex={1000}
      />);

      if (filteredTiles.count > 0)
      {
        geoJson.push(<GeoJSON
          data={filteredTiles}
          onEachFeature={onEachFeature}
          style={{color: 'red', weight: 1}}
          key={StandardTiles_randomKey + 'error'}
          zIndex={1000}
        />);
      }
  }

  let checked = StandardTiles_checkedLayers.includes(layerGeoJson.name);

  let r = Math.random();
  let layer = (
    <LayersControl.Overlay
      key={r}
      name={layerGeoJson.name}
      checked={checked}
    >
      <LayerGroup name={layerGeoJson.name} key='Standard Tiles Layer'>
        {geoJson}
      </LayerGroup>
    </LayersControl.Overlay> 
  ); 

  layers.push(layer);

  if (layers.length > 0)
  {
    return layers;
  }
  else
  {
    return null;
  }
}

function onEachFeature(feature, layer)
{
  layer.on({
    click: function(e){
      feature.e = e; 
      StandardTiles_PopupContent = feature;
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


export default StandardTilesLayer;
