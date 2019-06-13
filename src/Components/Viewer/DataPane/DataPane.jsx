import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';

import {
  Map,
  TileLayer,
  LayersControl,
  Marker,
  Popup
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import './DataPane.css';
import ViewerUtility from '../ViewerUtility';

import AnalyseControl from './AnalyseControl/AnalyseControl';

class DataPane extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    let style = {};
    if (!this.props.isOpen) {
      style = { display: 'none' };
    }

    if (!this.props.element) {
      return (
        <div className='viewer-pane data-pane' style={style}>
          Please select an element on the map and an action first.
        </div>
      );
    }

    let actionControl = null;

    if (this.props.action === ViewerUtility.dataPaneAction.analyse) {
      actionControl = (
        <AnalyseControl
          user={this.props.user}
          map={this.props.map}
          element={this.props.element}          
        />
      );
    }
    
    return (
      <div className='viewer-pane data-pane' style={style}>
        {actionControl}
      </div>
    );
  }
}

export default DataPane;
