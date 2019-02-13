import React, { PureComponent } from 'react';

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
  constructor(props) {
    super(props);
    this.state = {
      zoom: 3,
      lat: 40.509865,
      lon: -0.118092,

      timestampRange: {start: 0, end: 0}
    };
  };

  componentDidMount = () => {

  };

  createLayers = (layerType, stacking) => {
    var layers = [];

    let map = this.props.map;
    if (map) {
      if (map.layerTypes.includes(layerType)) {
        let typeLayers = map.layers[layerType];
  
        for (let i = 0; i < typeLayers.length; i++) {
          let layerName = typeLayers[i].name;
          let timestampStart = stacking ? this.state.timestampRange.start : this.state.timestampRange.end;
          
          let timestampLayers = [];
          for (let y = timestampStart; y <= this.state.timestampRange.end; y++) 
          {
            timestampLayers.push(             
              <TileLayer
                url={`${this.props.apiUrl}wms/${map.wmsMapName}/${y}/${layerType}/${layerName}/{z}/{x}/{y}`}
                tileSize={mapParams.tileSize}
                noWrap={mapParams.noWrap}
                maxZoom={mapParams.maxZoom}
                attribution={mapParams.attribution}
                format={mapParams.format}
                zIndex={2}
                key={y}
              />
            );
          }

          layers.push(
            <LayersControl.Overlay checked name={layerName} key={i}>
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
        style={{ height: "92.4vh" }}      >
        <LayersControl position="topright">
          <LayersControl.Overlay checked name="Base satellite">
            <TileLayer
              url="https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWhqaWFuZyIsImEiOiJjamhkNXU3azcwZW1oMzZvNjRrb214cDVsIn0.QZWgmabi2gRJAWr1Vr3h7w"
              attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href = "https://www.mapbox.com/" > Mapbox</a >'
              noWrap={true}
            />
          </LayersControl.Overlay>
          {this.createLayers(imagesLayerType, true)}
          {this.createLayers(labelsLayerType, false)}
          {this.createLayers(indicesLayerType, false)}
        </LayersControl>
      </Map>
    );
  }
}

export default ViewerMap;
