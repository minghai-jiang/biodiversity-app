import React, { PureComponent } from 'react';
import { NavLink, Redirect } from 'react-router-dom';

import ReactTable from 'react-table';
import 'react-table/react-table.css';
import cloneDeep from 'lodash.clonedeep';

import ApiManager from '../../../ApiManager';

class MapManagement extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      maps: null,
      selectedMap: null,
      mapAccess: null,
      groupData: null
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
        let relevantMaps = result.filter(map => map.accessLevel >= 800);

        this.setState({ maps: relevantMaps });
      })
      .catch(err => {
        showError(err);
      });
  }

  onMapSelect = (e) => {
    let selectedMap = this.state.maps.find(map => map.uuid === e.target.value);

    ApiManager.fetch('POST', '/settings/mapAccess', { mapId: selectedMap.uuid }, this.props.user)
      .then(result => {
        for (let i = 1; i < result.groups.length + 1; i++) {
          result.groups[i - 1].id = i;
        }

        let groupsData = cloneDeep(result.groups);

        groupsData.unshift({
          id: 0,
          name: 'new group',
          accessLevel: 500
        });

        this.setState({ selectedMap: selectedMap, mapAccess: result, groupsData: groupsData });
      })
      .catch(err => {
        showError(err);
      });
  }

  updatePublicAccessLevel = (e) => {
    let target = e.target;
    let newPublicAccessLevel = target.value;

    if (!checkValidAccessLevel(newPublicAccessLevel) || newPublicAccessLevel > 500) {
      alert('Public access level for a map must be a whole number between 0 and 500');
      target.value = this.state.mapAccess.publicAccessLevel;
      return;
    }

    let body = {
      mapId: this.state.selectedMap.uuid,
      newPublicAccessLevel: newPublicAccessLevel
    };

    ApiManager.fetch('POST', '/settings/updateMap', body, this.props.user)
      .then(result => {
        this.state.selectedMap.publicAccessLevel = newPublicAccessLevel;
      })
      .catch(err => {
        target.value = this.state.mapAccess.publicAccessLevel;
        showError(err);
      });    
  }

  createGroup = (row) => {
    let editedRow = row.original;

    if (editedRow.name.length < 4) {
      alert('Group name must be at least 4 characters long');
      return;
    }

    if (!checkValidAccessLevel(editedRow.accessLevel)) {
      alert('Access level must be a whole number between 0 and 1000');
      return;
    }

    let body = {
      mapId: this.state.selectedMap.uuid,
      groupName: editedRow.name,
      accessLevel: editedRow.accessLevel
    };

    ApiManager.fetch('POST', '/settings/createGroup', body, this.props.user)
      .then(result => {
        let newGroup = {
          id: this.state.groupsData.length + 1,
          name: editedRow.name,
          accessLevel: editedRow.accessLevel
        };

        let newGroupClone = cloneDeep(newGroup);

        this.state.mapAccess.groups.push(newGroup);
        this.state.groupsData.push(newGroupClone);

        let newGroupData = this.state.groupsData.find(group => group.id === 0);
        newGroupData.name = 'new group';
        newGroupData.accessLevel = 500;
        
        let groupsData = [...this.state.groupsData];

        this.setState({ groupData: groupsData });
      })
      .catch(err => {
        showError(err);
      });    
  }

  saveGroup = (row) => {
    let editedRow = row.original;
    let originalRow = this.state.mapAccess.groups.find(group => group.id === editedRow.id);

    if (!originalRow) {
      console.warn('Attempted to save a row that does not exist in the original data.');
      return;
    }

    if (originalRow.name !== editedRow.name || originalRow.accessLevel !== editedRow.accessLevel) {

      if (!checkValidAccessLevel(editedRow.accessLevel)) {
        alert('Access level must be a whole number between 0 and 1000');
        return;
      }

      let body = {
        mapId: this.state.selectedMap.uuid,
        groupName: originalRow.name,
        newGroupName: editedRow.name,
        newAccessLevel: editedRow.accessLevel
      };

      ApiManager.fetch('POST', '/settings/updateGroup', body, this.props.user)
        .then(result => {
          originalRow.name = editedRow.name;
          originalRow.accessLevel = editedRow.accessLevel;
        })
        .catch(err => {
          showError(err);
        });
    }
  }

  deleteGroup = (row) => {
    let editedRow = row.original;
    let originalRow = this.state.mapAccess.groups.find(group => group.id === editedRow.id);

    let confirmDelete = window.confirm(`Are you sure you want to delete the group: ${originalRow.name}?`);

    if (confirmDelete) {
      let body = {
        mapId: this.state.selectedMap.uuid,
        groupName: originalRow.name
      };

      ApiManager.fetch('POST', '/settings/deleteGroup', body, this.props.user)
        .then(result => {
          this.state.mapAccess.groups = this.state.mapAccess.groups.filter(group => {
            return group.id !== originalRow.id;
          });

          let newGroupsData = this.state.groupsData.filter(group => {
            return group.id !== originalRow.id;
          });

          this.setState({ groupsData: newGroupsData });
        })
        .catch(err => {
          showError(err);
        });
    }
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
          this.state.groupsData[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
        }}
        dangerouslySetInnerHTML={{
          __html: this.state.groupsData[cellInfo.index][cellInfo.column.id]
        }}
      />
    );
  }

  renderActionButtons = (cellInfo) => {
    if (cellInfo.index === 0) {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
          <button onClick={() => this.createGroup(cellInfo)}>Create</button>
        </div>
      );
    }
    else {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
          <button onClick={() => this.saveGroup(cellInfo)}>Save</button>
          <button onClick={() => this.deleteGroup(cellInfo)}>Delete</button>
        </div>
      );
    }

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
            <div>
              <button onClick={() => { }}>Map access</button>
              <button onClick={() => { }}>Custom polygons</button>
            </div>
            <div className='login-input-label-div'>
              Public access level
            </div>
            <input 
              className='login-input' 
              type='text'
              ref='publicAccessLevelInput'
              defaultValue={this.state.mapAccess.publicAccessLevel}
              onBlur={this.updatePublicAccessLevel.bind(this)}
              disabled={disable}
            >
            </input>
            <ReactTable
              data={this.state.groupsData}
              columns={[
                {
                  Header: 'Group name',
                  accessor: 'name',
                  Cell: this.renderEditable
                },
                {
                  Header: 'Access level',
                  accessor: 'accessLevel',
                  Cell: this.renderEditable
                },
                {
                  Header: 'Actions',
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
      <div className="login-block" style={{width: '40em', marginLeft: 'auto', marginRight: 'auto'}}>
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

function checkValidAccessLevel(accessLevel) {
  return !(isNaN(accessLevel) || !Number.isInteger(parseFloat(accessLevel)) ||
    accessLevel < 0 || accessLevel > 1000)
}

export default MapManagement;
