import React, { PureComponent } from 'react';
import { NavLink, Redirect } from 'react-router-dom';

import ReactTable from 'react-table';
import 'react-table/react-table.css';
import cloneDeep from 'lodash.clonedeep';

import ApiManager from '../../../../../ApiManager';

class ChangeForm extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      form : [{"Question": 'Your question', "Type": 'Text', "Obligatory": 'Yes'}]
          };
  }



  render() {
    let modeElement = (<div></div>);

      return (
        modeElement
      );
}
}
export default ChangeForm;
