import React, { PureComponent } from "react";
import { isMobile } from 'react-device-detect';

import {
  Map,
  TileLayer,
  LayersControl,
  Marker,
  Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import "./DataPane.css";

class DataPane extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      isOpen: false
    };
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className='viewer-data-pane'>
        Data Pane
      </div>
    );
  }
}

export default DataPane;
