import React, { PureComponent } from "react";
//import FileDownload from 'js-file-download';

import "./Viewer.css";

import MapSelector from './MapSelector/MapSelector';
import TimestampSelector from './TimestampSelector/TimestampSelector';
import ViewerMap from './ViewerMap/ViewerMap';
import InfoPane from './ViewerMap/Helpers/InfoPane';

class Viewer extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      timestampRange: { start: 0, end: 0 },
      map: null,
      shape: null,
      infoContent: null,
      feed: [],
    };
  }

  componentDidMount() {
  }

  onSelectMap = map => {
    this.setState({
      map: map,
      timestampRange: { start: 0, end: 0 }
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

  getContent = (content) => {
    this.setState({infoContent: content})
  }

  render() {
    let keyPart = this.state.infoContent && this.state.infoContent.properties ? this.state.infoContent.properties.id : '';
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
          publicFilesUrl={this.props.publicFilesUrl}
          map={this.state.map}
          timestampRange={this.state.timestampRange}
          onShapeDrawn={this.onShapeDrawn}
          infoContent={this.getContent}
          user={this.props.user}
        />
        <InfoPane
          map={this.state.map}
          infoContent={this.state.infoContent}
          feed={this.state.feed}
          key={this.state.infoContent ? this.state.infoContent.type + this.state.infoContent.id + keyPart : null}
          user={this.props.user}
        />
    </div>
    );
  }
}

export default Viewer;
