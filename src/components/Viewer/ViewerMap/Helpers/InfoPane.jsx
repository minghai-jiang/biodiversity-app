import React, { PureComponent} from 'react';
import SlidingPane from 'react-sliding-pane';
import PopupForm from '../../Popup-form/Popup-form';

import 'react-sliding-pane/dist/react-sliding-pane.css';

export class InfoPane extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      openQueryPane: true,
    }
  }

  toggleQueryPane = (open) => {
    this.setState({ openQueryPane: open });
  }

  componentWillReceiveProps(nextProp){  
    if(nextProp && nextProp.infoContent && nextProp.infoContent.openPane)
    {
      this.toggleQueryPane(true);
    }
  }

  render() {
    if (this.props.map && this.props.infoContent) {
      return (
          <SlidingPane
            className='query-pane'
            overlayClassName='modal-overlay'
            isOpen={this.state.openQueryPane}
            title='GeoMessage'
            width={'75%'}
            onRequestClose={() => { this.toggleQueryPane(false); }}
          >
            <PopupForm
              props={this.props.infoContent.properties}
            />
          </SlidingPane>
      );
    }
    else {
      return (
        <div></div>
      )
    }
  }
}

export default InfoPane;