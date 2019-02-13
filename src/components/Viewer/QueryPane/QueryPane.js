import React, { PureComponent} from 'react';
import SlidingPane from 'react-sliding-pane';

import 'react-sliding-pane/dist/react-sliding-pane.css';
import "./QueryPane.css";

export class QueryPane extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      openQueryPane: false      
    };
  }

  toggleQueryPane = (open) => {
    this.setState({ openQueryPane: open });
  }

  render() {
    return (
      <div>
        <div className='open-query-window-button' onClick={() => { this.toggleQueryPane(true); }}></div>
        <SlidingPane
          className='query-pane'
          overlayClassName='modal-overlay'
          isOpen={this.state.openQueryPane}
          title='Query Data'
          width={'50%'}
          onRequestClose={() => { this.toggleQueryPane(false); }}>
          <div>
            Hello
          </div>
        </SlidingPane>
      </div>
    );
  }
}

export default QueryPane;