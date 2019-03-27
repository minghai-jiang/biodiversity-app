//import React from 'react';

import L from "leaflet";

const LegendControl = {
  initialize: (map, callback) => {
    createDrawButton(map, {polygon: {allowIntersection: false }}, callback);
  }
}

function createDrawButton (map, type, callback) {
  var drawnItems = new L.featureGroup();
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

  callback(shapeCoords);

  // let map = this.props.map;
  
  // if (event.layerType === 'rectangle' && map)
  // {
  //   let headers = [];
  //   if (this.props.user)
  //   {
  //     headers["Authorization"] = "BEARER " + this.props.user.token;
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


export default LegendControl;
