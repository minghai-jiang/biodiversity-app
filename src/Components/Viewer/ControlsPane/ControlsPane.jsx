import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';

import './ControlsPane.css';

import MapSelector from './MapSelector/MapSelector';

import TileLayersControl from './TileLayersControl/TileLayersControl';

const TILE_LAYERS_NAME = 'tile';
const STANDARD_TILE_LAYERS_NAME = 'standard_tile';
const POLYGON_LAYERS_NAME = 'polygon';
const CUSTOM_POLYGON_LAYERS_NAME = 'custom_polygon';

class ControlsPane extends PureComponent {

  tileLayers = []

  constructor(props, context) {
    super(props, context);

    this.state = {
      isOpen: false,

      map: null
    };
  }  

  onSelectMap = (map) => {
    this.setState({ map: map }, () => this.props.onSelectMap(map));
  }

  onLayersChange = (type, layers) => {
    if (type === TILE_LAYERS_NAME) {
      this.tileLayers = layers;
    }

    let allLayers = [].concat(this.tileLayers);

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
      </div>
    );
  }
}

export default ControlsPane;
