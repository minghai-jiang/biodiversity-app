import React, { PureComponent } from "react";
import { isMobile } from 'react-device-detect';

import {
  Map,
  TileLayer,
  LayersControl,
  Marker,
  Popup
} from "react-leaflet";

import ControlsPane from './ControlsPane/ControlsPane';

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

    let changed = false;

    if (!isMobile) {
      if (!currentPanes.includes(paneName)) {
        currentPanes.push(paneName);
        changed = true;
      }
      else if (paneName !== MAP_PANE_NAME) {
        currentPanes.remove(paneName);
        changed = true;
      }
    }
    else {
      if (!currentPanes.includes(paneName)) {
        currentPanes = [paneName];
        changed = true;
      }
    }

    if (changed) {
      this.setState({ panes: currentPanes });
    }
  }

  render() {
    return (
      <div className='viewer'>
        
        <div className='viewer-main-container'>
          <div>
            <ControlsPane>
              
            </ControlsPane>
          </div>
          <div className='map-container'>
            <Map center={[51.505, -0.09]} zoom={13}>
              <TileLayer
                url='https://www.google.com/maps/vt?lyrs=y@189&x={x}&y={y}&z={z}'
                attribution='Base satellite: <a href="https://www.maps.google.com">Google Maps</a>'
              />  
            </Map>
          </div>
        </div>


        <div className='viewer-menu'>
          <div className='button' onClick={() => this.onViewerMenuClick(CONTROL_PANE_NAME)}>
            {this.props.localization['ViewerControlsPane']}
          </div>
          <div className='button' onClick={() => this.onViewerMenuClick(MAP_PANE_NAME)}>
            {this.props.localization['ViewerMapPane']}
          </div>
          <div className='button' onClick={() => this.onViewerMenuClick(DATA_PANE_NAME)}>
            {this.props.localization['ViewerDataPane']}
          </div>
        </div>
      </div>
    );
  }
}

export default Viewer;
