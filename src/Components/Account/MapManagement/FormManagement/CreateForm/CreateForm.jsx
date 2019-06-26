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
      form : [{"question": 'your question', "type": "numeric", "obligatory": "yes"}],
          };
  }


  moveUp = (cellInfo) => {
    this.state.form[cellInfo.index- 1] = [this.state.form[cellInfo.index], this.state.form[cellInfo.index]=this.state.form[cellInfo.index- 1]][0];
    console.log(this.state.form)
    this.setState(this.state.form)
  }

  moveDown = (cellInfo) => {
    this.state.form[cellInfo.index+ 1] = [this.state.form[cellInfo.index], this.state.form[cellInfo.index]=this.state.form[cellInfo.index+ 1]][0];
    this.setState(this.state.form)
  }

  add = () => {
    let x = {"question": '', "type": '', "obligatory": ''}
    x["question"] = this.state.form[0]["question"]
    x["type"] = this.state.form[0]["type"]
    x["obligatory"] = this.state.form[0]["obligatory"]

    this.state.form.splice(1,0,x)
    this.setState(this.state.form)
  }

  delete = (cellInfo) => {
    this.state.form.splice(cellInfo.index ,1)
    this.setState({state: this.state})
  }

  save = () => {
    let form = this.state.form
    form.shift()
    form = {"questions": form}
    console.log(form)
    ApiManager.fetch('POST', '/geoMessage/addForm', {"mapId": this.props.map.id, "formName":this.props.formName, "form": form}, this.props.user)
      .then(() => {
        //redirect
      })
      .catch(err => {
        console.log(err);
        this.props.showError(err);
      });


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
            <option  value="text">{this.props.localization["Text"]}</option>
            <option value="numeric">{this.props.localization["Numeric"]}</option>
            <option value="boolean">{this.props.localization["Boolean"]}</option>
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
            <option  value="yes">{this.props.localization["Yes"]}</option>
            <option value="no">{this.props.localization["No"]}</option>
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

  renderMoveButtons = (cellInfo) => {
    if(cellInfo.index === 1 && this.state.form.length > 2) {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
        <button onClick={() => this.moveDown(cellInfo)}>Down</button>
        </div>
      );
    }
    else if(cellInfo.index === this.state.form.length -1 && this.state.form.length > 2 ) {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
        <button onClick={() => this.moveUp(cellInfo)}>Up</button>
        </div>
      );
    }
    else if (cellInfo.index > 1 && cellInfo.index < this.state.form.length  ) {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
        <button onClick={() => this.moveUp(cellInfo)}>Up</button>
        <button onClick={() => this.moveDown(cellInfo)}>Down</button>
        </div>
      );
    }

    else {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
        </div>
      );
    }

  }


  render() {
    let modeElement = (<div></div>);

    modeElement = (
      <div>
      <h2> {this.props.localization["Creating"]} {this.props.formName} </h2>

        <ReactTable
          key={Math.random()}
          data={this.state.form}
          columns={[
            {
              Header: this.props.localization["Move"],
              accessor: 'move',
              Cell: this.renderMoveButtons
            },
            {
              Header: this.props.localization["Question"],
              accessor: 'question',
              Cell: this.renderEditable
            },
            {
              Header: this.props.localization["Type"],
              accessor: 'type',
              Cell: this.renderDropdown
            },
            {
              Header: this.props.localization["Obligatory"],
              accessor: 'obligatory',
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
