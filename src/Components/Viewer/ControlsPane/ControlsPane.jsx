import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';

import L from 'leaflet';

import MapSelector from './MapSelector/MapSelector';
import TileLayersControl from './TileLayersControl/TileLayersControl';
import StandardTileLayersControl from './StandardTileLayersControl/StandardTileLayersControl';
import PolygonLayersControl from './PolygonLayersControl/PolygonLayersControl';
import CustomPolygonLayersControl from './CustomPolygonLayersControl/CustomPolygonLayersControl';

import ViewerUtility from '../ViewerUtility';

import './ControlsPane.css';


class ControlsPane extends PureComponent {

  tileLayers = []
  standardTileLayers = []
  polygonLayers = []
  customPolygonLayers = []

  flyToBounds = null

  constructor(props, context) {
    super(props, context);

    this.state = {
      map: null
    };
  }  

  componentDidUpdate(prevProps) {
    // HACKY
    // this.flyToBounds will be set if on mobile or on a small screen.
    // In such a situation, having the controls pane open will hide the map, preventing the leaflet
    // fly-to from working. So we delay the fly to after the controls pane closes.
    // However, this does not work if the user opens the data pane and not the map pane.
    if (!this.props.isOpen && prevProps.isOpen && this.flyToBounds) {
      setTimeout(() => {
        this.props.leafletMap.current.leafletElement.flyToBounds(this.flyToBounds);
        this.flyToBounds = null;
      }, 100);

    }
  }

  onSelectMap = (map) => {
    let leafletMap = this.props.leafletMap;

    if (leafletMap) {
      let leafletElement = leafletMap.current.leafletElement;

      let bounds = L.latLngBounds(L.latLng(map.yMin, map.xMin), L.latLng(map.yMax, map.xMax));

      if (!isMobile && !this.props.isSmallWindow) {
        leafletElement.flyToBounds(bounds);
      }
      else {
        // let centerY = map.yMin + (map.yMax - map.yMin) / 2;
        // let centerX = map.xMin + (map.xMax - map.xMin) / 2;

        // leafletElement.setView(L.latLng(centerY, centerX), 8);
        this.flyToBounds = bounds;
      }
    }

    this.setState({ map: map }, () => this.props.onSelectMap(map));
  }

  onLayersChange = (type, layers) => {

    if (type === ViewerUtility.tileLayerType) {
      this.tileLayers = layers;
    }
    else if (type === ViewerUtility.standardTileLayerType) {
      this.standardTileLayers = layers
    }
    else if (type === ViewerUtility.polygonLayerType) {
      this.polygonLayers = layers;
    }
    else if (type === ViewerUtility.customPolygonTileLayerType) {
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
          onLayersChange={(layers) => this.onLayersChange(ViewerUtility.tileLayerType, layers)}
        />

        <StandardTileLayersControl
          map={this.state.map}
          leafletMap={this.props.leafletMap}
          leafletMapViewport={this.props.leafletMapViewport}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(ViewerUtility.standardTileLayerType, layers)}
          onFeatureClick={(feature) => this.props.onFeatureClick(ViewerUtility.standardTileLayerType, feature)}
        />

        <PolygonLayersControl
          map={this.state.map}
          leafletMap={this.props.leafletMap}
          leafletMapViewport={this.props.leafletMapViewport}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(ViewerUtility.polygonLayerType, layers)}
          onFeatureClick={(feature) => this.props.onFeatureClick(ViewerUtility.polygonLayerType, feature)}
        />

        <CustomPolygonLayersControl
          map={this.state.map}
          leafletMap={this.props.leafletMap}
          leafletMapViewport={this.props.leafletMapViewport}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(ViewerUtility.customPolygonTileLayerType, layers)}
          onFeatureClick={(feature) => this.props.onFeatureClick(ViewerUtility.customPolygonTileLayerType, feature)}
        />
      </div>
    );
  }
}

export default ControlsPane;
