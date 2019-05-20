import React from 'react';

import {
  GeoJSON,
  LayersControl,
  LayerGroup,
  Popup,
} from "react-leaflet";

import QueryUtil from '../../../Utilities/QueryUtil';

let CrowdLayersControl_checkedLayers = [];
let CrowdLayersControl_layerGeoJsons = [];
let CrowdLayersControl_polygonCounts = 0;

let CrowdLayersControl_controlOverlays = [];

let CrowdLayersControl_maxPolygon = 500;

let CrowdLayersControl_randomKey = '1';

let CrowdLayersControl_map = null;
let CrowdLayersControl_mapRef = {};

let CrowdLayersControl_props = {};

let CrowdLayersControl_PopupContent = {};

let CrowdLayersControl_highlight = -1;
let CrowdLayersControl_highlightCenter = [];
let CrowdLayersControl_refresh = () => {};
let CrowdLayersControl_shouldRefresh = false;

let CrowdLayersControl_deleted = -1;

const CrowdLayersControl = {
  getElement: () => {
    return { 
      polygonControlOverlays: CrowdLayersControl_controlOverlays && CrowdLayersControl_controlOverlays.length > 0 ? CrowdLayersControl_controlOverlays : null, 
      polygonCounts: CrowdLayersControl_polygonCounts 
    };
  },

  initialize: async (props, bounds, maxPolygons, map, refresh) => {
    CrowdLayersControl_maxPolygon = maxPolygons;

    if (!props.map || !props.timestampRange) {
      CrowdLayersControl_controlOverlays = [];
    }
    else {
      let layerInfo = await getPolygonsJson(props, bounds);
      CrowdLayersControl_layerGeoJsons = layerInfo.layerGeoJsons;
      CrowdLayersControl_polygonCounts = layerInfo.polygonCounts;

      CrowdLayersControl_controlOverlays = createGeojsonLayerControl(props); 
    }

    CrowdLayersControl_map = props.map;
    CrowdLayersControl_mapRef = map;

    CrowdLayersControl_props = props;

    CrowdLayersControl_refresh = refresh;
  },

  update: async (props, bounds, refresh) => {
    if (CrowdLayersControl_map !== props.map) {
      CrowdLayersControl_checkedLayers = [];
    }

    if (!props.map || !props.timestampRange || !props.map.crowdLayers) {
      CrowdLayersControl_controlOverlays = [];
    }
    else {
      CrowdLayersControl_props = props;

      let layerInfo = await getPolygonsJson(props, bounds);
      CrowdLayersControl_layerGeoJsons = layerInfo.layerGeoJsons;
      CrowdLayersControl_polygonCounts = layerInfo.polygonCounts;

      CrowdLayersControl_refresh = refresh;
      CrowdLayersControl_controlOverlays = createGeojsonLayerControl(props);
    }



    CrowdLayersControl_map = props.map;
  },

  clear: () => {
    CrowdLayersControl_controlOverlays = [];
    CrowdLayersControl_polygonCounts = 0;
    CrowdLayersControl_PopupContent = {}
    CrowdLayersControl_map = null;

    CrowdLayersControl_checkedLayers = [];
    CrowdLayersControl_layerGeoJsons = [];
    CrowdLayersControl_controlOverlays = [];

    CrowdLayersControl_highlight = -1;
    CrowdLayersControl_highlightCenter = [];
    CrowdLayersControl_refresh = () => {};

    CrowdLayersControl_props = {};
  },

  onOverlayAdd: (e, refresh) => {
    CrowdLayersControl_PopupContent = {};
    CrowdLayersControl_mapRef.closePopup();

    if (!CrowdLayersControl_checkedLayers.includes(e.name)) {
      CrowdLayersControl_checkedLayers.push(e.name);
    }

    if (e.id)
    {
      CrowdLayersControl_highlight = e.id;
      CrowdLayersControl_highlightCenter = e.center;
      CrowdLayersControl_refresh = refresh;
      CrowdLayersControl_shouldRefresh = true;
    }
  },

  onOverlayRemove: (e) => {    
    let index = CrowdLayersControl_checkedLayers.indexOf(e.name);
    if (index > -1) {
      CrowdLayersControl_checkedLayers.splice(index, 1);
    }

    CrowdLayersControl_PopupContent = {};
    CrowdLayersControl_mapRef.closePopup();
  },

  onFeatureClick: (props, contentFunction) => {
    if (CrowdLayersControl_PopupContent && CrowdLayersControl_PopupContent.id && CrowdLayersControl_PopupContent.data.click && CrowdLayersControl_PopupContent.e)
    {
      let popup = CrowdLayersControl_PopupContent;
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

      if(popup.properties && props.map && props.timestampRange && props.apiUrl && CrowdLayersControl_PopupContent.data)
      {
        properties.id = CrowdLayersControl_PopupContent.id;
        properties.class = classes;
        properties.spectral = spectral;
        properties.layerName = CrowdLayersControl_PopupContent.data.layerName;
        properties.hasAggregatedData = CrowdLayersControl_PopupContent.data.hasAggregatedData;
        properties.uuid = props.map.uuid;
        properties.timestamp = props.timestampRange.end;
        properties.apiUrl = props.apiUrl;
        properties.type = CrowdLayersControl_PopupContent.geometry.type;
        properties.coordinates = CrowdLayersControl_PopupContent.geometry.coordinates;
        properties.kind = 'polygon';
        properties.custom = true;
        properties.crowdLayers = props.map.crowdLayers;

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
      let report = <a className="noselect" onClick={() => {handlePolygon('report', contentFunction, id, properties, Math.random())} }>GeoMessage</a>;
      let updateButton;
      let deleteButton;

      if (props.user)
      {
        let updateInfo = {
          refresh: CrowdLayersControl_refresh,
          ...popup
        };

        updateButton =  <a className="noselect" onClick={() => {handlePolygon('update', contentFunction, updateInfo, properties, Math.random())} }>Update</a>;
        deleteButton =  <a className="noselect" onClick={() => {deletePolygon(properties)} }>Delete</a>;
      }

      let popupContent;
      if (id !== CrowdLayersControl_deleted)
      {
        CrowdLayersControl_PopupContent.data.click = false;
        popupContent = (
          <Popup position={popup.e.latlng} key={id + Math.random()}  autoPan={false} keepInView={false}>
            <div key={id + '.content'}>
              {content}
            </div>
            {analyse}
            {report}
            {updateButton}
            {deleteButton}
          </Popup>);
        delete CrowdLayersControl_PopupContent.e;
        delete popup.e;
      }

      return (popupContent);
    }
    else
    {
      return null;
    }
  }
}

async function getPolygonsJson(props, bounds) {
  let map = props.map;
  
  if (!map || !map.crowdLayers) {
    return;
  }

  let geoJsonPromises = [];

  for (let i = 0; i < map.crowdLayers.length; i++)
  {
    let geoJsonPromise = getPolygonsJsonAux(
      props.apiUrl,
      props.user, 
      map.uuid, 
      props.timestampRange.end, 
      bounds, 
      map.crowdLayers[i].name,
      map.crowdLayers[i].color);

    geoJsonPromises.push(geoJsonPromise);
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

  CrowdLayersControl_randomKey = Math.random();

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
    apiUrl + 'geoMessage/customPolygon/ids',
    {
      mapId:  mapUuid,
      layer: layerName,
      xMin: bounds.xMin,
      xMax: bounds.xMax,
      yMin: bounds.yMin,
      yMax: bounds.yMax,
      limit: CrowdLayersControl_maxPolygon
    }, headers
  );

  if(polygonIdResult)
  {
    if (typeof(polygonIdResult.ids) !== 'undefined' && polygonIdResult.ids.length > 0)
    {
      let polygonsGeoJson = await QueryUtil.postData(
        apiUrl + 'geoMessage/customPolygon/geometries',
        {
          mapId:  mapUuid,
          customPolygonIds: polygonIdResult.ids
        }, headers
      );

      polygonsGeoJson.name = layerName;
      polygonsGeoJson.color = layerColor;
      polygonsGeoJson.count = polygonIdResult.count

      return {polygonLayer: polygonsGeoJson};
    }
    else
    {
      return {
        name: layerName,
        color: layerColor,
        count: polygonIdResult.count
      };
    }
  }

}

function createGeojsonLayerControl(props) {
  let map = props.map;
  let layers = [];

  if (!map) {
    return null;
  }

  let layerGeoJsons = CrowdLayersControl_layerGeoJsons;

  if (layerGeoJsons)
  {
    for (let i = 0; i < layerGeoJsons.length; i++)
    {
      let geoJson = [];
      if (layerGeoJsons[i].polygonLayer && layerGeoJsons[i].polygonLayer.count <= CrowdLayersControl_maxPolygon && layerGeoJsons[i].polygonLayer.type)
      {
        geoJson.push( 
          <GeoJSON
            data={layerGeoJsons[i].polygonLayer}
            onEachFeature={onEachFeature}
            style={{color: '#' + layerGeoJsons[i].polygonLayer.color, weight: 1}}
            key={CrowdLayersControl_randomKey}
            zIndex={1000}
          />);
      }

      let name = layerGeoJsons[i].polygonLayer ? layerGeoJsons[i].polygonLayer.name : layerGeoJsons[i].name;
      let checked = CrowdLayersControl_checkedLayers.includes(name);

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

  CrowdLayersControl_PopupContent = feature;

  if (CrowdLayersControl_shouldRefresh) {
    CrowdLayersControl_shouldRefresh = false;
    CrowdLayersControl_refresh();
  }
}

function onEachFeature(feature, layer) {
  if (CrowdLayersControl_highlight !== -1 && CrowdLayersControl_highlight[0] == feature.id)
  {
    feature.e = {};
    feature.e.latlng = CrowdLayersControl_highlightCenter;
    addFeatureData(feature, layer);
  }

  layer.on({
    click: function(e){
      CrowdLayersControl_mapRef.closePopup();
      feature.e = e;
      addFeatureData(feature, layer);
      //CrowdLayersControl_refresh();
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

async function deletePolygon(properties)
{
  let headers = {};
  if (CrowdLayersControl_props.user) {
    headers["Authorization"] = "Bearer " + CrowdLayersControl_props.user.token;
  }

  let polygonDelete = await QueryUtil.postData(
    CrowdLayersControl_props.apiUrl + 'geoMessage/customPolygon/deletePolygon',
    {
      mapId: CrowdLayersControl_props.map.uuid,
      customPolygonId: properties.id,
    }, headers
  );

  if (await polygonDelete === 'OK')
  {
    CrowdLayersControl_mapRef.closePopup();
    CrowdLayersControl_deleted = properties.id;
    CrowdLayersControl_refresh();
  }
}

export default CrowdLayersControl;
