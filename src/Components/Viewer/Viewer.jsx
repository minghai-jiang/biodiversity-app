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
import DataPane from './DataPane/DataPane';

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
      currentPanes = [...currentPanes];
      this.setState({ panes: currentPanes }, () => {
        console.log(this.state.panes);
      });
    }
  }

  render() {
    let mapPane = null;
    let controlsPane = null;
    let dataPane = null;

    if (this.state.panes.includes(MAP_PANE_NAME)) {
      let mapPaneWidth = '100vw';
      if (!isMobile) {
        if (this.state.panes.length === 2) {
          mapPaneWidth = '75vw';
        }
        else if (this.state.panes.length === 3) {
          mapPaneWidth = '50vw';
        }
      }
      else {
        if (!this.state.panes.includes(MAP_PANE_NAME)) {
          mapPaneWidth = '0vw';
        }
      }

      mapPane = (
        <div className='map-pane' style={{ width: mapPaneWidth }}>
          <Map center={[51.505, -0.09]} zoom={13}>
            <TileLayer
              url='https://www.google.com/maps/vt?lyrs=y@189&x={x}&y={y}&z={z}'
              attribution='Base satellite: <a href="https://www.maps.google.com">Google Maps</a>'
            />  
          </Map>
        </div>
      );
    }

    if (this.state.panes.includes(CONTROL_PANE_NAME)) {
      controlsPane = (
        <div className='controls-pane'>
          <ControlsPane>
            
          </ControlsPane>
        </div>
      );
    }

    if (this.state.panes.includes(DATA_PANE_NAME)) {
      dataPane = (
        <div className='data-pane'>
          <DataPane>
            
          </DataPane>
        </div>
      );
    }

    return (
      <div className='viewer'>
        
        <div className='viewer-main-container'>
          {controlsPane}
          {mapPane}
          {dataPane}
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
