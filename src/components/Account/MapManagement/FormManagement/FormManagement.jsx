import React, { PureComponent } from 'react';
import { NavLink, Redirect } from 'react-router-dom';

import ReactTable from 'react-table';
import 'react-table/react-table.css';
import cloneDeep from 'lodash.clonedeep';

import ApiManager from '../../../../ApiManager';

import CreateForm from './CreateForm/CreateForm';
import ChangeForm from './ChangeForm/ChangeForm';


class FormManagment extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      forms: [{name: 'new form'},{name: 'old form'}],
      formsData: [{name: 'new form'},{name: 'old form'}],
      mode:0,
      formToChange:null
    };
  }




  changeForm = (mode,cellInfo) => {
    this.setState({mode:mode,formToChange: this.state.forms[cellInfo.index-1]['name']});

  }

  deleteFrom = (cellInfo) => {
      this.state.formsData.splice(cellInfo.index - 1,1)
      this.setState(this.state.formsData)
  }

  createForm = (mode) => {
    this.setState({ mode: mode });
  }


  renderEditable = (cellInfo) => {

    return (
      <div style={{ backgroundColor: "#fafafa" }}>
        <input
          type='text'
          defaultValue={this.state.formsData[cellInfo.index][cellInfo.column.id]}
          onBlur={e => {
            this.state.formsData[cellInfo.index][cellInfo.column.id] = e.target.value;
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
          <button onClick={() => this.createForm(1)}>{this.props.localization["Create"]}</button>
        </div>
      );
    }
    else {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
          <button onClick={() => this.changeForm(2,cellInfo)}>{this.props.localization["Change"]}</button>
          <button onClick={() => this.deleteFrom(cellInfo)}>{this.props.localization["Delete"]}</button>
        </div>
      );
    }

  }

  render() {
    if (this.state.forms) {
      let modeElement = (<div></div>);

      if (this.state.mode === 0) {
        modeElement = (
          <div>
            <ReactTable
              data={this.state.formsData}
              columns={[
                {
                  Header: this.props.localization["form"],
                  accessor: 'name',
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
      }


      if (this.state.mode === 1) {
        modeElement = (
          <CreateForm
            apiUrl={this.props.apiUrl}
            language={this.props.language}
            localization={this.props.localization}
            user={this.props.user}
            map={this.props.map}
            formName = {this.state.formsData[0]["name"]}
          >
          </CreateForm>
        )
      }

      if (this.state.mode === 2) {
        modeElement = (
          <ChangeForm
            apiUrl={this.props.apiUrl}
            language={this.props.language}
            localization={this.props.localization}
            user={this.props.user}
            map={this.props.map}
            formName = {this.state.formToChange}
          >
          </ChangeForm>
        )
      }


      return (
        modeElement
      );




    }
    else {
      return (<div></div>)
    }
  }
}



export default FormManagment;
