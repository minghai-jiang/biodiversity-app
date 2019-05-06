import React, { PureComponent } from 'react';
import { NavLink, Redirect } from 'react-router-dom';

import ReactTable from 'react-table';
import 'react-table/react-table.css';

import ApiManager from '../../../ApiManager';

class MapManagement extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      maps: null,
      selectedMap: null,
      mapAccess: null
    };
  }

  componentDidMount() {
    if (!this.props.user) {
      return;
    }

    this.getMaps();
  }

  componentWillUnmount() {
    this.setState({ maps: null, selectedMap: null });
  }

  getMaps = async () => {
    ApiManager.fetch('GET', '/account/myMaps', null, this.props.user)
      .then(result => {
        this.setState({ maps: result });
      })
      .catch(err => {
        showError(err);
      });
  }

  onMapSelect = (e) => {
    let selectedMap = this.state.maps.find(map => map.uuid === e.target.value);

    ApiManager.fetch('POST', '/settings/mapAccess', { mapId: selectedMap.uuid }, this.props.user)
      .then(result => {
        this.setState({ selectedMap: selectedMap, mapAccess: result, groupsEdit: result.groups });
      })
      .catch(err => {
        showError(err);
      });
  }

  renderMapOptions = () => {
    let options = [];

    let key = 0;

    this.state.maps.forEach(map => {
      if (map.accessLevel < 900) {
        return;
      }

      options.push(
        <option value={map.uuid} key={key++} >{map.name}</option>
      );
    });

    return options;
  }

  renderEditable = (cellInfo) => {
    return (
      <div
        style={{ backgroundColor: "#fafafa" }}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const data = [...this.state.groupsEdit];
          data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          this.setState({ groupsEdit: data });
        }}
        dangerouslySetInnerHTML={{
          __html: this.state.groupsEdit[cellInfo.index][cellInfo.column.id]
        }}
      />
    );
  }

  render() {
    if (!this.props.user) {
      return (
        <Redirect to='/login'></Redirect>
      );
    }

    let settingsArea = (<div></div>);

    if (this.state.maps) {
      let mapAccessArea = (
        <div></div>
      )

      if (this.state.mapAccess) {
        let disable = this.state.selectedMap.accessLevel < 1000;

        mapAccessArea = (
          <div>
            <input 
              className='login-input' 
              type='text'
              ref='publicAccessLevelInput'
              defaultValue={this.state.mapAccess.publicAccessLevel}
              disabled={disable}
            >
            </input>
            <ReactTable
              data={this.state.groupsEdit}
              columns={[
                {
                  Header: "Group name",
                  accessor: "name",
                  Cell: this.renderEditable
                },
                {
                  Header: "Access level",
                  accessor: "accessLevel",
                  Cell: this.renderEditable
                }
              ]}
              defaultPageSize={1000}
              showPagination={false}
              minRows={0}
              className="-striped -highlight"
            />
          </div>
        );
      }

      settingsArea = (
        <div>
          <select onChange={this.onMapSelect} defaultValue="default">
            <option value="default" disabled hidden>Select a Map</option>
            {this.renderMapOptions()}
          </select>
          {mapAccessArea}
        </div>
      );
    }

    return (
      <div className="login-block">
        <h1 className='account-title'>
          Map Management
        </h1>
        {settingsArea}
      </div>
    );
  }
}

function showError(err) {
  if (err.message) {
    alert(err.message);
  }
  else if (typeof err === 'string' || err instanceof String) {
    alert(err);
  }
  else {
    alert('An error occurred. Try again later.Please contact us if this problem persists.');
  }
}

export default MapManagement;
