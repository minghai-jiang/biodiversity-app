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
import "./ControlsPane.css";

class ControlsPane extends PureComponent {
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
      <div className='viewer-controls-pane'>
        Hello
      </div>
    );
  }
}

export default ControlsPane;
