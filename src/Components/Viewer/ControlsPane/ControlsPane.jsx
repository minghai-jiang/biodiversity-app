import React, { PureComponent } from 'react';

import MapSelector from './MapSelector/MapSelector';
import TileLayersControl from './TileLayersControl/TileLayersControl';
import PolygonLayersControl from './PolygonLayersControl/PolygonLayersControl';

import ViewerUtility from '../ViewerUtility';

import './ControlsPane.css';

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
    if (prevProps.override !== this.props.override) {
      this.onLayersChange(null, null);
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
    if (map)
    {
      this.setState({ map: map }, () => this.props.onSelectMap(map));
    }
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

    let allLayers = this.tileLayers;
    if (!this.props.override) {
      allLayers = allLayers.concat(this.standardTileLayers, this.polygonLayers, this.customPolygonLayers);
    }

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
          localization={this.props.localization}
          user={this.props.user}
          onSelectMap={this.onSelectMap}
        />

        <TileLayersControl
          localization={this.props.localization}
          user={this.props.user}
          map={this.state.map && this.state.map['d9903b33-f5d1-4d57-992f-3d8172460126'] ? this.state.map['d9903b33-f5d1-4d57-992f-3d8172460126'] : null}
          timestampRange={this.props.timestampRange}
          onLayersChange={(layers) => this.onLayersChange(ViewerUtility.tileLayerType, layers)}
        />

        <PolygonLayersControl
          ref={this.polygonLayersControl}
          localization={this.props.localization}
          user={this.props.user}
          map={this.state.map && this.state.map['ea53987e-842d-4467-91c3-9e23b3e5e2e8'] ? this.state.map['ea53987e-842d-4467-91c3-9e23b3e5e2e8'] : null}
          leafletMapViewport={this.props.leafletMapViewport}
          timestampRange={{start: 0, end: 0}}
          override={this.props.override}
          onLayersChange={(layers) => this.onLayersChange(ViewerUtility.polygonLayerType, layers)}
          onFeatureClick={(feature, hasAggregatedData, map) => this.props.onFeatureClick(ViewerUtility.polygonLayerType, feature, hasAggregatedData, map)}
          key={this.state.map && this.state.map['ea53987e-842d-4467-91c3-9e23b3e5e2e8'] ? 'polygonLayersControl' + 'ea53987e-842d-4467-91c3-9e23b3e5e2e8' : null}
        />

      </div>
    );
  }
}

export default ControlsPane;
