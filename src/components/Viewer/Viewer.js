import React, { PureComponent } from "react";
import FileDownload from 'js-file-download';

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
      map: null,
      shape: null
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

  downloadShape = async () => {
    let headers = {
      "Content-Type": "application/json"
    };
    if (this.props.user) {
      headers["Authorization"] = "BEARER " + this.props.user.token;
    }

    let timestamp = this.state.map.timestamps[this.state.timestampRange.end];
    let bodyJson = JSON.stringify({
      mapId: this.state.map.id,
      timestampNumber: timestamp.number
    });

    let downloadWindow = window.open();
    window.focus();

    fetch(`${this.props.apiUrl}utilities/requestshapeDownload`,
      {
        method: 'POST',
        headers: headers,
        body: bodyJson
      })
      .then(response => {
        return response.json();
      })
      .then(json => {
        let downloadUrl = `${this.props.apiUrl}utilities/downloadShape/${json.token}`;
        downloadWindow.location = downloadUrl;
      })
      .catch(error =>{
        alert("Failed to download shape");
      })
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
        {this.state.map ? 
        <div className='button viewer-button' onClick={() => { this.downloadShape(); }} style={{top: '47vh'}}>
            Download Shape
        </div> : null}
    </div>
    );
  }
}

export default Viewer;
