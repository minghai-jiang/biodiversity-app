import React, { PureComponent, createRef } from 'react';
import { isMobile } from 'react-device-detect';

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  Map,
  TileLayer,
  LayersControl,
  Marker,
  Popup
} from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";

import "./ViewerMap.css";

import MapInfo from './MapInfo';

export class ViewerMap extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='mapContainer'>
        <Map center={[51.505, -0.09]} zoom={13}>
          <MapInfo/>
          <MapInfo/>
          <TileLayer
            url='https://www.google.com/maps/vt?lyrs=y@189&x={x}&y={y}&z={z}'
            attribution='Base satellite: <a href="https://www.maps.google.com">Google Maps</a>'
          />  
        </Map>
      </div>
    );
  }
}

export default ViewerMap;