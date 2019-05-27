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
      questions : [{"Question": 'question1', "Type": 'Text', "Obligatory": 'Yes'},{"Question": 'question2', "Type": 'Numeric', "Obligatory": 'Yes'}]
          };
  }

  moveUp = (cellInfo) => {
    this.state.questions[cellInfo.index- 1] = [this.state.questions[cellInfo.index], this.state.questions[cellInfo.index]=this.state.questions[cellInfo.index- 1]][0];
    this.setState(this.state.questions)
  }

  moveDown = (cellInfo) => {
    this.state.questions[cellInfo.index+ 1] = [this.state.questions[cellInfo.index], this.state.questions[cellInfo.index]=this.state.questions[cellInfo.index+ 1]][0];
    this.setState(this.state.questions)
  }

  add = () => {
    let x = {"Question": '', "Type": '', "Obligatory": ''}
    x["Question"] = this.state.questions[0]["Question"]
    x["Type"] = this.state.questions[0]["Type"]
    x["Obligatory"] = this.state.questions[0]["Obligatory"]

    this.state.questions.splice(1,0,x)
    this.setState(this.state.questions)
  }

  delete = (cellInfo) => {

    this.state.questions.splice(cellInfo.index ,1)
    this.setState({state: this.state})
  }


  renderEditable = (cellInfo) => {
    return (
      <div style={{ backgroundColor: "#fafafa" }}>
        <input
          type='text'
          defaultValue={this.state.questions[cellInfo.index][cellInfo.column.id]}
          onBlur={e => {
            this.state.questions[cellInfo.index][cellInfo.column.id] = e.target.value;
          }}
        />
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

  renderMoveButtons = (cellInfo) => {
    if(cellInfo.index === 1 && this.state.questions.length > 2) {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
        <button onClick={() => this.moveDown(cellInfo)}>Down</button>
        </div>
      );
    }
    else if(cellInfo.index === this.state.questions.length -1 && this.state.questions.length > 2 ) {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
        <button onClick={() => this.moveUp(cellInfo)}>Up</button>
        </div>
      );
    }
    else if (cellInfo.index > 1 && cellInfo.index < this.state.questions.length  ) {
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
  renderDropdown = (cellInfo) => {
    let element = <div> </div>
      element = (   <div style={{ backgroundColor: "#fafafa" }}>
          <select value = {this.state.questions[cellInfo.index][cellInfo.column.id]}
           name="Type"
           onChange = {e => {
             let x = Object.assign({}, this.state.questions);
             x[cellInfo.index][cellInfo.column.id] = e.target.value;
             this.setState({x})
            }}>
            <option  value="Text">{this.props.localization["Text"]}</option>
            <option value="Numeric">{this.props.localization["Numeric"]}</option>
            <option value="Boolean">{this.props.localization["Boolean"]}</option>
          </select>
          </div>
        );
    return (element)

  }

  renderTickbox = (cellInfo) => {
    let element = <div> </div>
      element = (   <div style={{ backgroundColor: "#fafafa" }}>
          <select value = {this.state.questions[cellInfo.index][cellInfo.column.id]}
           name="Type"
           onChange = {e => {
             let x = Object.assign({}, this.state.questions);
             x[cellInfo.index][cellInfo.column.id] = e.target.value;
             this.setState({x})
            }}>
            <option  value="Yes">{this.props.localization["Yes"]}</option>
            <option value="No">{this.props.localization["No"]}</option>
          </select>
          </div>
        );
    return (element)
  }
  render() {
    let modeElement = (<div></div>);

    modeElement = (
      <div>
      <h2> {this.props.localization["Creating"]} {this.props.formName} </h2>

        <ReactTable
          key={Math.random()}
          data={this.state.questions}
          columns={[
            {
              Header: this.props.localization["Move"],
              accessor: 'move',
              Cell: this.renderMoveButtons
            },
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
export default ChangeForm;
