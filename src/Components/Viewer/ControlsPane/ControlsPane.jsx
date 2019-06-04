import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';

import './ControlsPane.css';

import MapSelector from './MapSelector/MapSelector';
import TimestampSelector from './TimestampSelector/TimestampSelector';

class ControlsPane extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      isOpen: false,

      map: null,
      timestampRange: null
    };
  }  

  onSelectMap = (map) => {
    this.setState({ 
      map: map,
      timestampRange: {
        start: map.timestamps.length - 1,
        end: map.timestamps.length - 1
      }
    });
  }

  onSelectTimestamp = (timestampRange) => {
    if (this.state.timestampRange.start !== timestampRange.start || 
      this.state.timestampRange.end !== timestampRange.end) {
      this.setState({ timestampRange: timestampRange });
    }
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
        <TimestampSelector
          map={this.state.map}
          onSelectTimestamp={this.onSelectTimestamp}
        />
      </div>
    );
  }
}

export default ControlsPane;
