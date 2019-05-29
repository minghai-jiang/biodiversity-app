import React, { PureComponent } from "react";
import { isMobile } from 'react-device-detect';

import {
  Map,
  TileLayer,
  LayersControl,
  Marker,
  Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "./Viewer.css";

const MAP_PANE_NAME = 'map_pane';
const CONTROL_PANE_NAME = 'control_pane';
const DATA_PANE_NAME = 'data_pane';

class Viewer extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      panes: [MAP_PANE_NAME]
    };
  }

  componentDidMount() {
  }

  onViewerMenuClick = (paneName) => {
    let currentPanes = this.state.panes;

    if (currentPanes.includes(paneName)) {
      if (!isMobile && paneName !== MAP_PANE_NAME) {
        currentPanes.splice()
      }
    }
  }

  render() {
    return (
      <div className='viewer'>
        <div className='map-container'>
          <Map center={[51.505, -0.09]} zoom={13}>
            <TileLayer
              url='https://www.google.com/maps/vt?lyrs=y@189&x={x}&y={y}&z={z}'
              attribution='Base satellite: <a href="https://www.maps.google.com">Google Maps</a>'
            />  
          </Map>
        </div>

        <div className='viewer-menu'>
          <div className='button'>
            Controls
          </div>
          <div className='button'>
            Map
          </div>
          <div className='button'>
            Data
          </div>
        </div>
      </div>
    );
  }
}

export default Viewer;
