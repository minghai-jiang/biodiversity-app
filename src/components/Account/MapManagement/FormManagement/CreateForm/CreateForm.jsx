import React, { PureComponent } from 'react';
import { NavLink, Redirect } from 'react-router-dom';

import ReactTable from 'react-table';
import 'react-table/react-table.css';
import cloneDeep from 'lodash.clonedeep';

import ApiManager from '../../../../../ApiManager';

class CreateForm extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      form : [{"Question": 'Your question', "Type": 'Text', "Obligatory": 'Yes'}]
          };
  }


  add = () => {
    this.state.form.push(this.state.form[0])
    this.setState(this.state.form)
    console.log(this.state.form)
  }
  delete = (cellInfo) => {}


  renderEditable = (cellInfo) => {
    return (
      <div style={{ backgroundColor: "#fafafa" }}>
        <input
          type='text'
          defaultValue={this.state.form[cellInfo.index][cellInfo.column.id]}
          onBlur={e => {
            this.state.form[cellInfo.index][cellInfo.column.id] = e.target.value;
          }}
        />
      </div>
    );
  }

  renderDropdown = (cellInfo) => {
    return (
      <div style={{ backgroundColor: "#fafafa" }}>
      <select name="Type">
        <option value="Text">Text</option>
        <option value="Numeric">Numeric</option>
        <option value="Boolean">Boolean</option>
      </select>
      </div>
    );
  }

  renderTickbox = (cellInfo) => {
    return (
      <div style={{ backgroundColor: "#fafafa" }}>
      <select name="Obligatory">
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
      </div>
    );
  }

  renderActionButtons = (cellInfo) => {
    if (cellInfo.index === 0) {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
          <button onClick={() => this.add()}>{this.props.localization["Add"]}</button>
        </div>
      );
    }
    else {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
          <button onClick={() => this.delete(cellInfo)}>{this.props.localization["Delete"]}</button>
        </div>
      );
    }

  }

  render() {
    let modeElement = (<div></div>);

    modeElement = (
      <div>
      <h2> Creating {this.props.formName} </h2>

        <ReactTable
          key={Math.random()}
          data={this.state.form}
          columns={[
            {
              Header: this.props.localization["Question"],
              accessor: 'Question',
              Cell: this.renderEditable
            },
            {
              Header: this.props.localization["Type"],
              accessor: 'Type',
              Cell: this.renderEditable
            },
            {
              Header: this.props.localization["Obligatory"],
              accessor: 'Obligatory',
              Cell: this.renderEditable
            },
            {
              Header: this.props.localization["Actions"],
              accessor: 'actions',
              Cell: this.renderActionButtons
            }
          ]}
          sortable={false}
          defaultPageSize={1000}
          showPagination={false}
          minRows={0}
          className="-striped -highlight"
        />
      </div>
    )
      return (
        modeElement
      );
}
}
export default CreateForm;
