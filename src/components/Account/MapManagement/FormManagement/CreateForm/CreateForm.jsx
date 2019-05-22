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
      form : [{"Question": 'Your question', "Type": "Numeric", "Obligatory": "Yes"}],
          };
  }


  add = () => {
    let x = {"Question": '', "Type": '', "Obligatory": ''}
    x["Question"] = this.state.form[0]["Question"]
    x["Type"] = this.state.form[0]["Type"]
    x["Obligatory"] = this.state.form[0]["Obligatory"]

    this.state.form.splice(1,0,x)
    this.setState(this.state.form)
  }

  delete = (cellInfo) => {
    this.state.form.splice(cellInfo.index - 1,1)
    this.setState(this.state.form)
  }

  save = () => {
      }

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
    let element = <div> </div>
      element = (   <div style={{ backgroundColor: "#fafafa" }}>
          <select value = {this.state.form[cellInfo.index][cellInfo.column.id]}
           name="Type"
           onChange = {e => {
             let x = Object.assign({}, this.state.form);
             x[cellInfo.index][cellInfo.column.id] = e.target.value;
             this.setState({x})
            }}>
            <option  value="Text">Text</option>
            <option value="Numeric">Numeric</option>
            <option value="Boolean">Boolean</option>
          </select>
          </div>
        );
    return (element)

  }

  renderTickbox = (cellInfo) => {
    let element = <div> </div>
      element = (   <div style={{ backgroundColor: "#fafafa" }}>
          <select value = {this.state.form[cellInfo.index][cellInfo.column.id]}
           name="Type"
           onChange = {e => {
             let x = Object.assign({}, this.state.form);
             x[cellInfo.index][cellInfo.column.id] = e.target.value;
             this.setState({x})
            }}>
            <option  value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          </div>
        );
    return (element)
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
              Cell: this.renderDropdown
            },
            {
              Header: this.props.localization["Obligatory"],
              accessor: 'Obligatory',
              Cell: this.renderTickbox
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
        <button onClick={() => this.save()}>{this.props.localization["saveForm"]}</button>
      </div>
    )
      return (
        modeElement
      );
}
}
export default CreateForm;
