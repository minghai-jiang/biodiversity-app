import React from 'react';

import L from "leaflet";

import {
  Popup,
} from "react-leaflet";

let DrawingControl_user;
let DrawingControl_contentFunction;
let DrawingControl_Popup;
let DrawingControl_Props;
let DrawingControl_refresh;
let DrawingControl_mapRef;
let DrawingControl_drawnItems;

const DrawingControl = {
  initialize: (map, callback, user, contentFunction, props, mapRef, refresh) => {
    DrawingControl_user = user;
    DrawingControl_contentFunction = contentFunction;
    DrawingControl_Props = props;

    DrawingControl_refresh = refresh;
    DrawingControl_mapRef = mapRef;

    createDrawButton(map, {polygon: {allowIntersection: false }}, callback);
  },
  update:(user, props) =>
  {
    DrawingControl_user = user;
    DrawingControl_Props = props;
  },
  onFeatureClick: () =>
  {
    return(DrawingControl_Popup);
  }
}

function createDrawButton (map, type, callback) {
  var drawnItems = new L.featureGroup();
  DrawingControl_drawnItems = drawnItems;
  map.addLayer(drawnItems);
  
  let draw = {
    polygon: false,
    rectangle: false,
    marker: false,
    polyline: false,
    circle: false,
    circlemarker: false
  };

  if(type)
  {
    for (let key in type)
    {
      draw[key] = type[key];
    }
  }

  var drawControl = new L.Control.Draw({
    draw: draw,
    edit: false
  });
  
  map.addControl(drawControl);
  map.on(L.Draw.Event.CREATED, (event) => onShapeDrawnClosure(event, drawnItems, callback));
}

function onShapeDrawnClosure(event, drawnItems, callback) {
  drawnItems.clearLayers();
  const layer = event.layer;
  drawnItems.addLayer(layer);
  const latLngs = layer.getLatLngs()[0];

  var shapeCoords = [];
  for (let i = 0; i < latLngs.length; i++) {
    var coord = {
      x: latLngs[i].lng,
      y: latLngs[i].lat
    };

    shapeCoords.push(coord);
  }

  layer.on('click', (e) => onClickCustomPolygon(e, shapeCoords))
  callback(shapeCoords);

  // let map = this.props.map;
  
  // if (event.layerType === 'rectangle' && map)
  // {
  //   let headers = [];
  //   if (this.props.user)
  //   {
  //     headers["Authorization"] = "Bearer " + this.props.user.token;
  //   }

  //   this.setState({popupProps: {
  //     uuid: map.uuid,
  //     bounds: event.layer.getBounds(),
  //     timestamp: this.props.timestampRange.end,
  //     header: headers
  //   }});

  //   let form = document.getElementById('formDiv');
  //   form.classList.add('block');
  // }

  // this.props.onShapeDrawn(shapeCoords);
}

function onClickCustomPolygon(e, shapeCoords)
{
  let id = JSON.stringify(shapeCoords);
  
  let coordinates = [];
  for (let i = 0; i < shapeCoords.length; i++)
  {
    coordinates.push([shapeCoords[i].x, shapeCoords[i].y]);
  }
  coordinates.push([shapeCoords[0].x, shapeCoords[0].y])

  if (DrawingControl_Props && DrawingControl_Props.map)
  {
    let classes; let spectral; let custom;
    for (let i = 0; i < DrawingControl_Props.map.classes.length; i++)
    {
      if (DrawingControl_Props.map.classes[i].timestampNumber === DrawingControl_Props.timestampRange.end)
      {
        if (DrawingControl_Props.map.classes[i])
        {
          classes = DrawingControl_Props.map.classes[i].classes;
        }
        if (DrawingControl_Props.map.spectral[i])
        {
          spectral = DrawingControl_Props.map.spectral[i].indices;
        }

        break;
      }
    }

    let content = [];
    let properties = {
      coordinates: [coordinates],
      custom: true,
      type: 'Polygon',
      apiUrl: DrawingControl_Props.apiUrl,
      class: classes,
      spectral: spectral,
      timestamp: DrawingControl_Props.timestampRange.end,
      crowdLayers: DrawingControl_Props.map.crowdLayers,
    }

    let analyse = <a className="noselect" onClick={() => {handleCustomPolygon('analyse', DrawingControl_contentFunction, id, properties, Math.random())} }>Analyse</a>
    let report;

    if (DrawingControl_user)
    {
      report =  <a className="noselect" onClick={() => {handleCustomPolygon('save', DrawingControl_contentFunction, id, properties, Math.random(), e)} }>Save Polygon</a>
    }

    for (let i = 0; i < shapeCoords.length; i++)
    {
      content.push(<p key={id + '.Point.' + i}><span>{'Point ' + (i+1)}:</span><br/> x: {shapeCoords[i].x.toFixed(3)}    y: {shapeCoords[i].y.toFixed(3)}</p>);
    }
    
    DrawingControl_Popup = (<Popup position={e.latlng} key={id + Math.random() + Math.random() + Math.random()} autoPan={false} keepInView={false}>
        <div key={id + '.content'}>
          {content}
        </div>
        {analyse}
        {report}
      </Popup>
    );
  }
}

function handleCustomPolygon(type, contentFunction, id, properties, random, e)
{
  contentFunction({
    id: id,
    openpane: true,
    type: type,
    properties: properties,
    random: random,
    refresh: DrawingControl_refresh,
    mapRef: DrawingControl_mapRef,
    clear: DrawingControl_drawnItems.clearLayers,
    e: e,
  });
}


export default DrawingControl;