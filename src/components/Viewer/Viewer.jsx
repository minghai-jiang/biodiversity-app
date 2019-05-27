import React, { PureComponent } from "react";

import "./Viewer.css";

import MapSelector from './MapSelector/MapSelector';
import TimestampSelector from './TimestampSelector/TimestampSelector';
import ViewerMap from './ViewerMap/ViewerMap';
import InfoPane from './ViewerMap/Helpers/InfoPane';

class Viewer extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className="map">
        <ViewerMap>
          
        </ViewerMap>
      </div>
    );
  }
}

export default Viewer;
