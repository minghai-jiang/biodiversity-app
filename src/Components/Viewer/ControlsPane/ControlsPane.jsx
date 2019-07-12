import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';
import { 
  Card,
  CardContent,
  Button
} from '@material-ui/core';
import L from 'leaflet';

import MapSelector from './MapSelector/MapSelector';
import FlyToControl from './FlyToControl/FlyToControl'
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

  standardTileLayersControl = null
  polygonLayersControl = null
  customPolygonlayersControl = null;

  flyToBounds = null

  constructor(props, context) {
    super(props, context);

    this.standardTileLayersControl = React.createRef();
    this.polygonLayersControl = React.createRef();
    this.customPolygonLayersControl = React.createRef();

    this.state = {
      map: null
    };
  }  

  componentDidUpdate(prevProps) {
    if (!prevProps.override && this.props.override) {
      this.props.onLayersChange(this.tileLayers);
    }
    else if (prevProps.override && !this.props.override) {
      let allLayers = this.tileLayers.concat(this.standardTileLayers, this.polygonLayers, this.customPolygonLayers);
      this.props.onLayersChange(allLayers);
    }
  }

  selectLayer = (type, layer) => {
    // Disabled till further notice
    return;

    if (type === ViewerUtility.standardTileLayerType) {
      this.standardTileLayersControl.current.selectLayer(layer);
    }
    else if (type === ViewerUtility.polygonLayerType) {
      this.polygonLayersControl.current.selectLayer(layer);
    }
    else if (type === ViewerUtility.customPolygonTileLayerType) {
      this.customPolygonLayersControl.current.selectLayer(layer);
    }
  }

  updateCustomPolygons = () => {
    this.customPolygonLayersControl.current.refresh();
  }

  onSelectMap = (map) => {
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

        <FlyToControl
          user={this.props.user}
          map={this.state.map}
          onFlyTo={this.props.onFlyTo}
        />

        <TileLayersControl
          user={this.props.user}
          map={this.state.map}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(ViewerUtility.tileLayerType, layers)}
        />

        <StandardTileLayersControl
          ref={this.standardTileLayersControl}
          user={this.props.user}
          map={this.state.map}
          leafletMapViewport={this.props.leafletMapViewport}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(ViewerUtility.standardTileLayerType, layers)}
          onFeatureClick={(feature) => this.props.onFeatureClick(ViewerUtility.standardTileLayerType, feature, true)}
        />

        <PolygonLayersControl
          ref={this.polygonLayersControl}
          user={this.props.user}
          map={this.state.map}
          leafletMapViewport={this.props.leafletMapViewport}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(ViewerUtility.polygonLayerType, layers)}
          onFeatureClick={(feature, hasAggregatedData) => this.props.onFeatureClick(ViewerUtility.polygonLayerType, feature, hasAggregatedData)}
        />

        <CustomPolygonLayersControl
          ref={this.customPolygonLayersControl}
          user={this.props.user}
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
