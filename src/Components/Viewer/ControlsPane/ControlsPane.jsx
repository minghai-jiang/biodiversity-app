import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';
import { 
  Card,
  CardContent,
  Button
} from '@material-ui/core';
import L from 'leaflet';

import MapSelector from './MapSelector/MapSelector';
import TileLayersControl from './TileLayersControl/TileLayersControl';
import StandardTileLayersControl from './StandardTileLayersControl/StandardTileLayersControl';
import PolygonLayersControl from './PolygonLayersControl/PolygonLayersControl';
import CustomPolygonLayersControl from './CustomPolygonLayersControl/CustomPolygonLayersControl';

import ViewerUtility from '../ViewerUtility';

import './ControlsPane.css';
import ApiManager from '../../../ApiManager';


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
  }

  onSelectMap = (map) => {
    let bounds = L.latLngBounds(L.latLng(map.yMin, map.xMin), L.latLng(map.yMax, map.xMax));

    this.props.onFlyTo(bounds);

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

    let hasGeoMessageAccess = this.state.map && this.state.map.accessLevel >= ApiManager.accessLevels.viewGeoMessages;

    return (
      <div className='viewer-pane controls-pane' style={style}>
        <MapSelector
          user={this.props.user}
          onSelectMap={this.onSelectMap}
        />

        {
          this.state.map ? (
            <div className='controls-pane-block'>
              <Button
                className='geomessage-feed-button'
                variant='contained'
                color='primary'
                disabled={!hasGeoMessageAccess}
                onClick={this.props.onOpenGeoMessageFeed}
              >
                GeoMessage Feed
              </Button>
            </div>
          ) : null
        }

        <TileLayersControl
          map={this.state.map}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(ViewerUtility.tileLayerType, layers)}
        />

        <StandardTileLayersControl
          map={this.state.map}
          leafletMapViewport={this.props.leafletMapViewport}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(ViewerUtility.standardTileLayerType, layers)}
          onFeatureClick={(feature) => this.props.onFeatureClick(ViewerUtility.standardTileLayerType, feature, true)}
        />

        <PolygonLayersControl
          map={this.state.map}
          leafletMapViewport={this.props.leafletMapViewport}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(ViewerUtility.polygonLayerType, layers)}
          onFeatureClick={(feature, hasAggregatedData) => this.props.onFeatureClick(ViewerUtility.polygonLayerType, feature, hasAggregatedData)}
        />

        <CustomPolygonLayersControl
          map={this.state.map}
          leafletMapViewport={this.props.leafletMapViewport}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(ViewerUtility.customPolygonTileLayerType, layers)}
          onFeatureClick={(feature) => this.props.onFeatureClick(ViewerUtility.customPolygonTileLayerType, feature, true)}
        />
      </div>
    );
  }
}

export default ControlsPane;
