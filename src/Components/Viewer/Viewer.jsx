import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';

import {
  Map,
  TileLayer,
  LayersControl,
  Marker,
  Popup
} from 'react-leaflet';

import ControlsPane from './ControlsPane/ControlsPane';
import DataPane from './DataPane/DataPane';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './Viewer.css';

const MAP_PANE_NAME = 'map_pane';
const CONTROL_PANE_NAME = 'control_pane';
const DATA_PANE_NAME = 'data_pane';

class Viewer extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      panes: [MAP_PANE_NAME],

      leafletLayers: []
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
        arrayRemove(currentPanes, paneName);
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

  onLayersChange = (layers) => {
    this.setState({ leafletLayers: layers });
  }

  render() {

    let mapPaneStyle = {
      display: 'block',
      width: '100vw'
    };

    if (this.state.panes.includes(MAP_PANE_NAME)) {

      if (!isMobile) {
        if (this.state.panes.length === 2) {
          mapPaneStyle.width = '75vw';
        }
        else if (this.state.panes.length === 3) {
          mapPaneStyle.width = '50vw';
        }
      }

    }
    else {
      mapPaneStyle.display = 'none';
    }

    return (
      <div className='viewer'>
        
        <div className='viewer-main-container'>
          <ControlsPane
            user={this.props.user}
            isOpen={this.state.panes.includes(CONTROL_PANE_NAME)}
            onLayersChange={this.onLayersChange}
          />
          
          <div className='viewer-pane map-pane' style={mapPaneStyle}>
            <Map center={[40.509865, -0.118092]} zoom={2}>
              <TileLayer
                url='https://www.google.com/maps/vt?lyrs=y@189&x={x}&y={y}&z={z}'
                attribution='Base satellite: <a href="https://www.maps.google.com">Google Maps</a>'
                zIndex={1}
              />  
              {this.state.leafletLayers}
            </Map>
          </div>

          <DataPane
            user={this.props.user}
            isOpen={this.state.panes.includes(DATA_PANE_NAME)}
          />
        </div>

        <div className='viewer-menu'>
          <div className='button viewer-menu-button' onClick={() => this.onViewerMenuClick(CONTROL_PANE_NAME)}>
            <div className='viewer-menu-button-content'>
              {this.props.localization['ViewerControlsPane']}
            </div>
          </div>
          <div className='button viewer-menu-button' onClick={() => this.onViewerMenuClick(MAP_PANE_NAME)}>
            <div className='viewer-menu-button-content'>
              {this.props.localization['ViewerMapPane']}           
            </div>
          </div>
          <div className='button viewer-menu-button' onClick={() => this.onViewerMenuClick(DATA_PANE_NAME)}>
            <div className='viewer-menu-button-content'>
              {this.props.localization['ViewerDataPane']}        
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function arrayRemove(arr) {
  let what, a = arguments, L = a.length, ax;
  debugger;
  while (L > 1 && arr.length) {
      what = a[--L];
      while ((ax= arr.indexOf(what)) !== -1) {
          arr.splice(ax, 1);
      }
  }
  return arr;
}

export default Viewer;
