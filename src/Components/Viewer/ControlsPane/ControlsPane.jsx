import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';

import './ControlsPane.css';

import MapSelector from './MapSelector/MapSelector';

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
    let style = {};
    if (!this.props.isOpen) {
      style = { display: 'none' };
    }

    return (
      <div className='viewer-pane controls-pane' style={style}>
        <MapSelector
          user={this.props.user}
          key='map-selector'
        />
      </div>
    );
  }
}

export default ControlsPane;
