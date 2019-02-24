import React, { PureComponent, createRef } from 'react';

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  Map,
  TileLayer,
  LayersControl,
  LayerGroup
} from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";

const imagesLayerType = 'images';
const labelsLayerType = 'labels';
const indicesLayerType = 'indices';

let mapParams = {
  tileSize: 256,
  attribution: 'Ellipsis Earth Intelligence',
  maxZoom: 14,
  noWrap: true,
  format: 'image/png'
};

export class ViewerMap extends PureComponent {
  mapRef = createRef();

  constructor(props) {
    super(props);
    this.state = {
      zoom: 3,
      lat: 40.509865,
      lon: -0.118092
    };
  };

  componentDidMount = () => {
    const map = this.mapRef.current.leafletElement;
    var drawnItems = new L.featureGroup();
    map.addLayer(drawnItems);
    var drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false
        },
        rectangle: true,
        marker: false,
        polyline: false,
        circle: false,
        circlemarker: false
      },
      edit: false
    });
    map.addControl(drawControl);
    map.on(L.Draw.Event.CREATED, this.onShapeDrawnClosure(drawnItems));
  };

  onShapeDrawnClosure(drawnItems) {
    return function onShapeDrawn(event) {
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

      this.props.onShapeDrawn(shapeCoords);
    }.bind(this);
  }

  createLayers = (layerType, stacking, checked, zIndex) => {
    var layers = [];

    let map = this.props.map;
    let timestampRange = this.props.timestampRange;

    if (map && timestampRange) {
      let timestampStart = stacking ? timestampRange.start : timestampRange.end;

      if (map.layerTypes.includes(layerType)) {
        let typeLayers = map.layers[layerType];
  
        for (let i = 0; i < typeLayers.length; i++) {
          let layerName = typeLayers[i].name;
          let zIndexOffset = i * (timestampRange.end - timestampStart);
          
          let timestampLayers = [];
          for (let y = timestampStart; y <= timestampRange.end; y++) 
          {
            timestampLayers.push(             
              <TileLayer
                url={`${this.props.apiUrl}wms/${map.id}/${y}/${layerType}/${layerName}/{z}/{x}/{y}`}
                tileSize={mapParams.tileSize}
                noWrap={mapParams.noWrap}
                maxZoom={mapParams.maxZoom}
                attribution={mapParams.attribution}
                format={mapParams.format}
                zIndex={zIndex + zIndexOffset + timestampLayers.length}
                key={y}
              />
            );
          }

          layers.push(
            <LayersControl.Overlay checked name={layerName} key={i} checked={checked}>
              <LayerGroup name={layerName}>
                {timestampLayers}
              </LayerGroup>              
            </LayersControl.Overlay>
          );
        }
      }
      return layers;
    }  
  }

  render() {
    return (
      <Map
        center={[this.state.lat, this.state.lon]}
        zoom={this.state.zoom}
        style={{ height: "92.4vh" }}  
        ref={this.mapRef}
      >
        <LayersControl position="topright">
          <LayersControl.Overlay checked name="Base satellite">
            <TileLayer
              url="https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWhqaWFuZyIsImEiOiJjamhkNXU3azcwZW1oMzZvNjRrb214cDVsIn0.QZWgmabi2gRJAWr1Vr3h7w"
              attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href = "https://www.mapbox.com/" > Mapbox</a >'
              noWrap={true}
              zIndex={0}
            />
          </LayersControl.Overlay>
          {this.createLayers(imagesLayerType, true, true, 100)}
          {this.createLayers(labelsLayerType, false, true, 200)}
          {this.createLayers(indicesLayerType, false, false, 300)}
        </LayersControl>
      </Map>
    );
  }
}

export default ViewerMap;
