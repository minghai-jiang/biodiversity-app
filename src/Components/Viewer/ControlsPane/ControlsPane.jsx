import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';

import L from 'leaflet';

import MapSelector from './MapSelector/MapSelector';
import TileLayersControl from './TileLayersControl/TileLayersControl';
import StandardTileLayersControl from './StandardTileLayersControl/StandardTileLayersControl';
import PolygonLayersControl from './PolygonLayersControl/PolygonLayersControl';
import CustomPolygonLayersControl from './CustomPolygonLayersControl/CustomPolygonLayersControl';

import './ControlsPane.css';

const TILE_LAYERS_NAME = 'tile';
const STANDARD_TILE_LAYERS_NAME = 'standard_tile';
const POLYGON_LAYERS_NAME = 'polygon';
const CUSTOM_POLYGON_LAYERS_NAME = 'custom_polygon';

class ControlsPane extends PureComponent {

  tileLayers = []
  standardTileLayers = []
  polygonLayers = []
  customPolygonLayers = []

  constructor(props, context) {
    super(props, context);

    this.state = {
      isOpen: false,

      map: null
    };
  }  

  onSelectMap = (map) => {
    let leafletMap = this.props.leafletMap;

    if (leafletMap) {
      let leafletElement = leafletMap.current.leafletElement;

      let bounds = L.latLngBounds(L.latLng(map.yMin, map.xMin), L.latLng(map.yMax, map.xMax));
      leafletElement.flyToBounds(bounds);
    }

    this.setState({ map: map }, () => this.props.onSelectMap(map));
  }

  onLayersChange = (type, layers) => {

    if (type === TILE_LAYERS_NAME) {
      this.tileLayers = layers;
    }
    else if (type === STANDARD_TILE_LAYERS_NAME) {
      this.standardTileLayers = layers
    }
    else if (type === POLYGON_LAYERS_NAME) {
      this.polygonLayers = layers;
    }
    else if (type === CUSTOM_POLYGON_LAYERS_NAME) {
      this.customPolygonLayers = layers;
    }

    let allLayers = this.tileLayers.concat(this.standardTileLayers, this.polygonLayers, this.customPolygonLayers);

    this.props.onLayersChange(allLayers);
  }

  render() {
    let style = {};
    if (!this.props.isOpen) {
      style = { display: 'none' };
    }

    return (
      <div className='viewer-pane controls-pane' style={style}>
        <MapSelector
          user={this.props.user}
          onSelectMap={this.onSelectMap}
        />

        <TileLayersControl
          map={this.state.map}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(TILE_LAYERS_NAME, layers)}
        />

        <StandardTileLayersControl
          map={this.state.map}
          leafletMap={this.props.leafletMap}
          leafletMapViewport={this.props.leafletMapViewport}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(STANDARD_TILE_LAYERS_NAME, layers)}
        />

        <PolygonLayersControl
          map={this.state.map}
          leafletMap={this.props.leafletMap}
          leafletMapViewport={this.props.leafletMapViewport}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(STANDARD_TILE_LAYERS_NAME, layers)}
        />

        <CustomPolygonLayersControl
          map={this.state.map}
          leafletMap={this.props.leafletMap}
          leafletMapViewport={this.props.leafletMapViewport}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(STANDARD_TILE_LAYERS_NAME, layers)}
        />
      </div>
    );
  }
}

export default ControlsPane;
