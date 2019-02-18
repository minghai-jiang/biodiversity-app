import React, { PureComponent } from "react";

import "./Viewer.css";

import MapSelector from './MapSelector/MapSelector';
import TimestampSelector from './TimestampSelector/TimestampSelector';
import ViewerMap from './ViewerMap/ViewerMap';
import QueryPane from './QueryPane/QueryPane';

class Viewer extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      timestampRange: { start: 0, end: 0 },
      shape: null
    };
  }

  componentDidMount() {
  }

  onSelectMap = map => {
    this.setState({
        map: map
    });
  }

  onShapeDrawn = shape => {
    this.setState({
      shape: shape
    });
  }

  onSelectTimestampRange = (start, end) => {
    this.setState({
      timestampRange: { start: start, end: end }
    });
  }

  render() {
    return (
      <div className="map">
        <div className="map-selector-div">
          <MapSelector 
            apiUrl={this.props.apiUrl} 
            onSelect={this.onSelectMap}
            user={this.props.user} 
          />
        </div>
        <div id="time-range-selector" className="time-range-selector">                   
          <TimestampSelector
            timestamps={this.state.map ? this.state.map.timestamps : null}
            onSlide={this.onSelectTimestampRange}
          />
        </div>
        <ViewerMap
          apiUrl={this.props.apiUrl} 
          map={this.state.map}
          timestampRange={this.state.timestampRange}
          onShapeDrawn={this.onShapeDrawn}
        />
        <QueryPane
          apiUrl={this.props.apiUrl}
          map={this.state.map}
          timestampRange={this.state.timestampRange}
          shape={this.state.shape}
          user={this.props.user}
        />
    </div>
    );
  }
}

export default Viewer;
