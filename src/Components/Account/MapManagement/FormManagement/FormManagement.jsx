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
      forms: [],
      mode:0,
      formToChange:null,
      data: []
    };
  }

  componentDidMount() {
    ApiManager.fetch('POST', '/geoMessage/getForms', {"mapId": this.props.map.id}, this.props.user)
      .then((forms) => {
        forms = [{'formname': this.props.localization["new form"]}].concat(forms)
        this.setState({forms:forms });
      })
      .catch(err => {
        console.log(err);
        this.props.showError(err);
      });
  }


  changeForm = (mode,cellInfo) => {
    console.log(this.state.forms[cellInfo.index]["form"]["questions"])
    this.setState({mode:mode,formToChange: this.state.forms[cellInfo.index]});

  }

  deleteFrom = (cellInfo) => {
      ApiManager.fetch('POST', '/geoMessage/deleteForm', {"mapId": this.props.map.id, "formName":this.state.forms[cellInfo.index]['formname']}, this.props.user)
        .then(() => {
          this.state.forms.splice(cellInfo.index,1)
        }).then(() => {
          console.log(this.state.forms)
          let newForms = [...this.state.forms];
          this.setState({ forms: newForms });
          })
        .catch(err => {
          console.log(err);
          this.props.showError(err);
        });


  }

  createForm = (mode) => {
    this.setState({ mode: mode });
  }


  renderEditable = (cellInfo) => {

    return (
      <div style={{ backgroundColor: "#fafafa" }}>
        <input
          type='text'
          defaultValue={this.state.forms[cellInfo.index][cellInfo.column.id]}
          onBlur={e => {
            if(cellInfo.index> 0){
            let body = {"mapId": this.props.map.id, "newName":e.target.value, "oldName":this.state.forms[cellInfo.index]["formname"], "form": this.state.forms[cellInfo.index]["form"]};
            ApiManager.fetch('POST', '/geoMessage/alterForm', body, this.props.user)
                          .then(() => {
                            this.state.forms[cellInfo.index][cellInfo.column.id] = body.newName;
                            //redirect
                          })
                          .catch(err => {
                            console.log(err);
                            this.props.showError(err);
                            this.state.forms[cellInfo.index][cellInfo.column.id] = this.state.forms[cellInfo.index]["formname"];
                            let newForms = [...this.state.forms];
                            this.setState({forms:newForms})
                          });
          }else{
            this.state.forms[cellInfo.index][cellInfo.column.id] = e.target.value;
          }
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
              key={Math.random()}
              data={this.state.forms}
              columns={[
                {
                  Header: this.props.localization["form"],
                  accessor: 'formname',
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
            showError={this.props.showError}
            user={this.props.user}
            map={this.props.map}
            formName = {this.state.forms[0]["formname"]}
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
            showError={this.props.showError}
            user={this.props.user}
            map={this.props.map}
            form = {this.state.formToChange}
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
