import React, { PureComponent } from "react";

import "./viewer.css";
import Moment from "moment";
import $ from 'jquery';

import MapSelector from './map-selector/map-selector';
import ViewerMap from './viewer-map/viewer-map';

class Viewer extends PureComponent {
    constructor(props, context) {
      super(props, context);

      this.state = {
        timestampNumber: "0",
    
        timeStart: 0,
        timeEnd: 0
      };
    }

    selectMap = map => {
      this.setState({
          map: map
      });
    };

    selectTimestampRange = (start, end) => {
      this.setState({
        timeStart: start,
        timeEnd: end
      });
    };

    render() {
      return (
        <div className="map">
          <div className="map-selector-div">
            <MapSelector 
              apiUrl={this.props.apiUrl} 
              onSelect={this.selectMap} 
            />
          </div>
          <ViewerMap
            apiUrl={this.props.apiUrl} 
            map={this.state.map}
          />
        </div>
      );
    }
}

export default Viewer;
