import React from 'react';

import {
  GeoJSON,
  LayersControl,
  LayerGroup,
  Popup,
} from "react-leaflet";

import QueryUtil from '../../../Utilities/QueryUtil';

let StandardTiles_checkedLayers = [];
let StandardTiles_layerGeoJsons = [];
let StandardTiles_filteredTiles = [];
let StandardTiles_polygonCounts = 0;

let StandardTiles_controlOverlays = [];

let StandardTilesControl_maxPolygon = 1000;

let StandardTiles_randomKey = '1';

let StandardTiles_map = null;
let StandardTiles_mapRef = {};

let StandardTiles_PopupContent = {};

const StandardTilesLayer = {
  getElement: () => {
    return { 
      polygonControlOverlays: StandardTiles_controlOverlays && StandardTiles_controlOverlays.length > 0 ? StandardTiles_controlOverlays : null, 
      polygonCounts: StandardTiles_polygonCounts 
    };
  },

  initialize: async (props, bounds, maxPolygons, map) => {
    StandardTilesControl_maxPolygon = maxPolygons;

    if (!props.map || !props.timestampRange) {
      StandardTiles_controlOverlays = [];
    }
    else {
      let layerInfo = await getTilesJson(props, bounds);
      StandardTiles_layerGeoJsons = layerInfo.layerGeoJsons;
      StandardTiles_polygonCounts = layerInfo.polygonCounts;
      layerInfo.errorTiles ? StandardTiles_filteredTiles = layerInfo.errorTiles : StandardTiles_filteredTiles = [];

      StandardTiles_controlOverlays = createGeojsonLayerControl(props); 
    }

    StandardTiles_map = props.map;
    StandardTiles_mapRef = map;
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
      layerInfo.errorGeoJsons ? StandardTiles_filteredTiles = layerInfo.errorGeoJsons : StandardTiles_filteredTiles = [];

      StandardTiles_controlOverlays = createGeojsonLayerControl(props);
    }

    StandardTiles_map = props.map;

  },

  clear: () => {
    StandardTiles_controlOverlays = [];
    StandardTiles_polygonCounts = 0;
    StandardTiles_PopupContent = {};
    StandardTiles_map = null;

    StandardTiles_checkedLayers = [];
    StandardTiles_layerGeoJsons = [];
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
    
    StandardTiles_PopupContent = {};
    StandardTiles_mapRef.closePopup();
  },

  onFeatureClick: (props, contentFunction) => {
    if (StandardTiles_PopupContent && StandardTiles_PopupContent.id)
    {
      let popup = StandardTiles_PopupContent;
      let id = popup.properties.tileX + "." + popup.properties.tileY + '.' +  popup.properties.zoom;
      let content = [];
      let properties = Object.create(popup.properties);
      let merged;

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
          properties.headers = {Authorization: "Bearer " + props.user.token}
        }
        else
        {
          properties.headers = []
        }

        merged = {...properties, ...StandardTiles_PopupContent.properties};
      }

      let analyse = <a className="noselect" onClick={() => {handleTile('analyse', contentFunction, id, merged, Math.random())} }>Analyse</a>

      let report;

      if (props.user)
      {
        report =  <a className="noselect" onClick={() => {handleTile('report', contentFunction, id, merged, Math.random())} }>GeoMessage</a>
      }

      return (
        <Popup position={popup.e.latlng} key={id + Math.random() + Math.random() + Math.random()} autoPan={false} keepInView={false}>
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

  let polygonCounts = [];
  let geoJsonPromise = getTilesJsonAux(
    props.apiUrl,
    props.user, 
    map.uuid, 
    props.timestampRange.end, 
    bounds,
    map.zoom);

  let layerGeoJson = await geoJsonPromise;
  if (layerGeoJson && layerGeoJson.standardTiles)
  {
    polygonCounts.push({
      name: layerGeoJson.standardTiles.name,
      count: layerGeoJson.standardTiles.originalCount,
    });
  }

  return {
    layerGeoJsons: layerGeoJson.standardTiles,
    errorGeoJsons: layerGeoJson.errorTiles,
    polygonCounts: polygonCounts
  };
}

async function getTilesJsonAux(apiUrl, user, mapUuid, timestampEnd, bounds, zoom) {
  let headers = {};
  if (user) {
    headers["Authorization"] = "Bearer " + user.token;
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
    }, headers 
  );

  if (typeof(tilesIdResult.ids) !== 'undefined' && tilesIdResult.ids.length > 0)
  {
    let tilesGeoJson = await QueryUtil.postData(
      apiUrl + 'geometry/tiles',
      {
        mapId:  mapUuid,
        timestamp: timestampEnd,
        tileIds: tilesIdResult.ids
      }, headers
    );
    
    if(tilesGeoJson)
    {
      let filteredTiles = {};

      if (user)
      {
        let filteredTilesFeatures = [];
        let filteredTilesResult = await QueryUtil.postData(
          apiUrl + 'geoMessage/tile/ids',
          {
            mapId:  mapUuid,
            xMin: bounds.xMin,
            xMax: bounds.xMax,
            yMin: bounds.yMin,
            yMax: bounds.yMax,
            zoom: zoom
          }, headers
        );

        if (filteredTilesResult)
        {
          for (let i = 0; i < tilesGeoJson.features.length; i++)
          {
            let tileProperties = tilesGeoJson.features[i].properties;

            for (let j = 0; j < filteredTilesResult.tileIds.length; j++)
            {
              if (tileProperties.tileX === filteredTilesResult.tileIds[j].tileX && tileProperties.tileY === filteredTilesResult.tileIds[j].tileY && tileProperties.zoom === filteredTilesResult.tileIds[j].zoom)
              {
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
      }

      tilesGeoJson.name = 'Standard Tiles';
      //tilesGeoJson.color = layerColor;
      tilesGeoJson.count = tilesGeoJson.features.length
      tilesGeoJson.originalCount = tilesIdResult.count

      return {standardTiles: tilesGeoJson, errorTiles: filteredTiles};
    }
  }
  else {
    return {
      standardTiles: {
        name: 'Standard Tiles',
        //color: layerColor,
        originalCount: tilesIdResult.count
      }
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

  if(layerGeoJson)
  {
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

    let checked;
    checked = StandardTiles_checkedLayers.includes(layerGeoJson.name)

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

function handleTile(type, contentFunction, id, properties, random)
{
  contentFunction({
    id: id,
    openPane: true,
    type: type,
    properties: properties,
    random: random,
  });
}


export default StandardTilesLayer;
