import React, { PureComponent } from 'react';

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  Map,
  TileLayer,
  LayersControl,
  WMSTileLayer,
  LayerGroup
} from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";

const { Overlay } = LayersControl;

const imageLayerType = 'images';

export class EllipsisMap extends PureComponent {
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

  createImageLayers = () => {
    var layers = [];

    let map = this.props.map;
    debugger;
    if (map) {
      let wmsMapName = map.name.replace(' ', '_');

      if (map.layerTypes.includes(imageLayerType)) {
        let imageLayers = map.layers[imageLayerType];
  
        for (let i = 0; i < imageLayers.length; i++) {
          let layerName = imageLayers[i].name;
          
          let timestampLayers = [];
          for (let y = this.state.timestampRange.start; y <= this.state.timestampRange.end; y++) 
          {
            timestampLayers.push(             
              <TileLayer
                url={`${this.props.apiUrl}wms/${wmsMapName}/${y}/${imageLayerType}/${layerName}/{z}/{x}/{y}`}
                tileSize={256}
                noWrap={true}
                maxZoom={14}
                attribution={'Ellipsis Earth Intelligence'}
                format='image/png'
                zIndex={2}
                key={y}
              />
            );
          }

          layers.push(
            <Overlay checked name={layerName} key={i}>
              <LayerGroup name={layerName}>
                {timestampLayers}
              </LayerGroup>              
            </Overlay>
          );
        }
      }
      debugger;
      return layers;
    }    

    // for (var i = this.state.timeStart; i <= this.state.timeEnd; i++) {
    //   var timestamp = this.state.map.timestamps[i];
    //   var timestampNumber = 0;

    //   if (timestamp) {
    //     timestampNumber = timestamp.number;
    //   }

    //   let wmsMapName = this.state.map.name.replace(' ', '_');

    //   layers.push(
    //     <WMSTileLayer
    //       url={`${this.props.apiUrl}/wms/${wmsMapName}/${timestampNumber}/{layer}/{z}/{x}/{y}.png`}
    //       tileSize={256}
    //       noWrap={true}
    //       maxZoom={14}
    //       attribution={'Ellipsis Earth Intelligence'}
    //       layer={layer}
    //       format='image/png'
    //       zIndex={2}
    //     />
    //   );
    // }
    
    // return layers;
  };

  render() {
    return (
      <div>
        <Map
          center={[this.state.lat, this.state.lon]}
          zoom={this.state.zoom}
          style={{ height: "92.4vh" }}
      >
          <LayersControl position="topright">
            <Overlay checked name="Base satellite">
              <TileLayer
                url="https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWhqaWFuZyIsImEiOiJjamhkNXU3azcwZW1oMzZvNjRrb214cDVsIn0.QZWgmabi2gRJAWr1Vr3h7w"
                attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href = "https://www.mapbox.com/" > Mapbox</a >'
                noWrap={true}
              />
            </Overlay>
            {this.createImageLayers()}
          </LayersControl>
        </Map>
      </div>
    );
  }
}

export default EllipsisMap;
