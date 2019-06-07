import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';

import { Map, Marker } from 'react-leaflet';
import 'leaflet-draw';
import L from 'leaflet';

import Utility from '../../Utility';

import TimestampSelector from './TimestampSelector/TimestampSelector';

import ControlsPane from './ControlsPane/ControlsPane';
import DataPane from './DataPane/DataPane';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import './Viewer.css';

// This block is purely to get the marker icon working of Leaflet.
// Taken somewhere from the web.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const MAP_PANE_NAME = 'map_pane';
const CONTROL_PANE_NAME = 'control_pane';
const DATA_PANE_NAME = 'data_pane';

const DEFAULT_VIEWPORT = {
  center: [40.509865, -0.118092],
  zoom: 2
}

class Viewer extends PureComponent {

  leafletMap = null;
  setNewViewportTimer = null;

  constructor(props, context) {
    super(props, context);

    this.leafletMap = React.createRef();

    this.state = {
      panes: [MAP_PANE_NAME],

      map: null,
      timestampRange: {
        start: 0,
        end: 0
      },

      leafletLayers: [],
      leafletMapViewport: DEFAULT_VIEWPORT,

      geolocation: null
    };
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      this.setLocation, 
      () => this.setLocation(null), 
      { enableHighAccuracy: true }
    );

    this.onLeafletMapViewportChanged(DEFAULT_VIEWPORT);
  }

  setLocation = (position) => {
    if (position) {      
      if (!this.state.geolocation || this.state.geolocation.latitude !== position.latitude || 
        this.state.geolocation.longitude !== position.longitude) {
          let newGeolocation = [position.coords.latitude, position.coords.longitude];
          this.setState({ geolocation: newGeolocation });
      }
    }

    setTimeout(() => {
        navigator.geolocation.getCurrentPosition(
          this.setLocation, 
          () => this.setLocation(null), 
          { enableHighAccuracy: true }
        );
      }, 
      1000 * 10
    );
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
        currentPanes = Utility.arrayRemove(currentPanes, paneName);
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
        this.leafletMap.current.leafletElement.invalidateSize();
      });
    }
  }

  onSelectMap = (map) => {
    this.setState({ 
      map: map,
      timestampRange: {
        start: map.timestamps.length - 1,
        end: map.timestamps.length - 1
      }
    });
  }

  onLayersChange = (layers) => {
    this.setState({ leafletLayers: layers });
  }

  onSelectTimestamp = (timestampRange) => {
    if (this.state.timestampRange.start !== timestampRange.start || 
      this.state.timestampRange.end !== timestampRange.end) {
      this.setState({ timestampRange: timestampRange });
    }
  }

  onLeafletMapViewportChanged = (viewport) => {
    if (this.setNewViewportTimer) {
      clearTimeout(this.setNewViewportTimer);
    }
    
    viewport.bounds = getLeafletMapBounds(this.leafletMap);    

    this.setNewViewportTimer = setTimeout(
      () => {
        this.setState({ leafletMapViewport: viewport })
      }, 
      1000
    );
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
            leafletMap={this.leafletMap}
            leafletMapViewport={this.state.leafletMapViewport}
            timestampRange={this.state.timestampRange}
            geolocation={this.state.geolocation}
            onSelectMap={this.onSelectMap}
            onLayersChange={this.onLayersChange}
          />
          
          <div className='viewer-pane map-pane' style={mapPaneStyle}>
            <TimestampSelector
              map={this.state.map}
              onSelectTimestamp={this.onSelectTimestamp}
              width={mapPaneStyle.width}
            />
            <Map 
              center={DEFAULT_VIEWPORT.center} 
              zoom={DEFAULT_VIEWPORT.zoom}
              ref={this.leafletMap}
              maxZoom={19}
              onViewportChanged={this.onLeafletMapViewportChanged}
            >
              {this.state.leafletLayers}
              {this.state.geolocation ? <Marker position={this.state.geolocation}/> : null}
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

function getLeafletMapBounds(leafletMap) {
  let screenBounds = leafletMap.current.leafletElement.getBounds();
  let bounds = 
  {
    xMin: screenBounds.getWest(),
    xMax: screenBounds.getEast(),
    yMin: screenBounds.getSouth(),
    yMax: screenBounds.getNorth()
  }

  return bounds;
}

export default Viewer;
