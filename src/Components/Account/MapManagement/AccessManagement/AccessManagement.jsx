import React, { PureComponent } from 'react';

import ReactTable from 'react-table';
import 'react-table/react-table.css';
import cloneDeep from 'lodash.clonedeep';

import ApiManager from '../../../../ApiManager';

class AccessManagement extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      mapAccess: null,
      groupsData: null
    };
  }

  componentDidMount() {
    this.update();
  }

  update = () => {
    if (!this.props.user) {
      return;
    }

    this.getMapAccess();
  }

  componentWillUnmount() {
    this.setState({ mapAccess: null, groupsData: null });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.map !== this.props.map) {
      this.setState({
        mapAccess: null,
        groupsData: null
      },
      () => { this.update(); }
      );
    }
  }

  getMapAccess = (e) => {
    ApiManager.fetch('POST', '/settings/mapAccess', { mapId: this.props.map.id }, this.props.user)
      .then(result => {
        for (let i = 1; i < result.groups.length + 1; i++) {
          result.groups[i - 1].id = i;
        }

        let groupsData = cloneDeep(result.groups);

        if (this.props.map.accessLevel >= 1000) {
          groupsData.unshift({
            id: 0,
            name: this.props.localization["new group"],
            accessLevel: 500
          });
        }

        this.setState({ mapAccess: result, groupsData: groupsData });
      })
      .catch(err => {
        this.props.showError(err);
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
      mapId: this.props.map.id,
      newPublicAccessLevel: newPublicAccessLevel
    };

    ApiManager.fetch('POST', '/settings/updateMap', body, this.props.user)
      .then(() => {
        this.props.map.publicAccessLevel = newPublicAccessLevel;
      })
      .catch(err => {
        target.value = this.state.mapAccess.publicAccessLevel;
        this.props.showError(err);
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
      mapId: this.props.map.id,
      groupName: editedRow.name,
      accessLevel: editedRow.accessLevel
    };

    ApiManager.fetch('POST', '/settings/createGroup', body, this.props.user)
      .then(() => {
        let newGroup = {
          id: this.state.groupsData.length + 1,
          name: editedRow.name,
          accessLevel: editedRow.accessLevel
        };

        let newGroupClone = cloneDeep(newGroup);

        this.state.mapAccess.groups.push(newGroup);
        this.state.groupsData.push(newGroupClone);

        if (this.props.map.accessLevel >= 1000) {
          let newGroupData = this.state.groupsData.find(group => group.id === 0);
          newGroupData.name = 'new group';
          newGroupData.accessLevel = 500;
        }
        
        let groupsData = [...this.state.groupsData];

        this.setState({ groupsData: groupsData });
      })
      .catch(err => {
        this.props.showError(err);
      });    
  }

  saveGroup = (cellInfo) => {
    let editedRow = cellInfo.original;
    let originalRow = this.state.mapAccess.groups.find(group => group.id === editedRow.id);

    if (!originalRow) {
      console.warn('Attempted to save a group that does not exist in the original data.');
      return;
    }

    if (originalRow.name !== editedRow.name || originalRow.accessLevel !== editedRow.accessLevel) {

      if (!checkValidAccessLevel(editedRow.accessLevel)) {
        alert('Access level must be a whole number between 0 and 1000');
        return;
      }

      let body = {
        mapId: this.props.map.id,
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
          this.props.showError(err);
        });
    }
  }

  onGroupEditUsers = (cellInfo) => {
    let editedRow = cellInfo.original;
    let originalRow = this.state.mapAccess.groups.find(group => group.id === editedRow.id);

    if (!originalRow) {
      console.warn('Attempted to edit users of a group that does not exist in the original data.');
      return;
    }

    this.props.onGroupUserManagement(originalRow);
  }

  deleteGroup = (cellInfo) => {
    let editedRow = cellInfo.original;
    let originalRow = this.state.mapAccess.groups.find(group => group.id === editedRow.id);

    if (!originalRow) {
      console.warn('Attempted to delete a group that does not exist in the original data.');
      return;
    }

    let confirmDelete = window.confirm(`Are you sure you want to delete the group: ${originalRow.name}?`);

    if (confirmDelete) {
      let body = {
        mapId: this.props.map.id,
        groupName: originalRow.name
      };

      ApiManager.fetch('POST', '/settings/deleteGroup', body, this.props.user)
        .then(() => {
          this.state.mapAccess.groups = this.state.mapAccess.groups.filter(group => {
            return group.id !== originalRow.id;
          });

          let newGroupsData = this.state.groupsData.filter(group => {
            return group.id !== originalRow.id;
          });

          this.setState({ groupsData: newGroupsData });
        })
        .catch(err => {
          this.props.showError(err);
        });
    }
  }

  renderEditable = (cellInfo) => {
    let isOwner = this.props.map.accessLevel >= 1000;

    return (
      <div style={{ backgroundColor: "#fafafa" }}>
        <input
          type='text'
          defaultValue={this.state.groupsData[cellInfo.index][cellInfo.column.id]}
          onBlur={e => {
            this.state.groupsData[cellInfo.index][cellInfo.column.id] = e.target.value;
          }}
          disabled={!isOwner}
        />
      </div>
    );
  }

  renderActionButtons = (cellInfo) => {
    let isOwner = this.props.map.accessLevel >= 1000;
    let isUserManager = this.props.map.accessLevel >= 900;

    if (cellInfo.original.id === 0) {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
          <button onClick={() => this.createGroup(cellInfo)}>{this.props.localization["Create"]}</button>
        </div>
      );
    }
    else {
      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
        >
          <button onClick={() => this.saveGroup(cellInfo)} disabled={!isOwner}>{this.props.localization['Save']}</button>
          <button onClick={() => this.onGroupEditUsers(cellInfo)} disabled={!isUserManager}>{this.props.localization["Edit users"]}</button>
          <button onClick={() => this.deleteGroup(cellInfo)} disabled={!isOwner}>{this.props.localization["Delete"]}</button>
        </div>
      );
    }

  }

  render() {
    if (this.state.mapAccess) {
      let disable = this.props.map.accessLevel < 1000;

      return (
        <div>
          <div className='login-input-label-div'>
            {this.props.localization["Public access level"]}
          </div>
          <input 
            className='login-input' 
            type='text'
            ref='publicAccessLevelInput'
            style={{ marginBottom: '20px' }}
            defaultValue={this.state.mapAccess.publicAccessLevel}
            onBlur={this.updatePublicAccessLevel.bind(this)}
            disabled={disable}
          >
          </input>
          <ReactTable
            key={Math.random()}
            data={this.state.groupsData}
            columns={[
              {
                Header: this.props.localization["Group name"],
                accessor: 'name',
                Cell: this.renderEditable
              },
              {
                Header: this.props.localization["Access level"],
                accessor: 'accessLevel',
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
      );
    }
    else {
      return (<div></div>)
    }
  }
}

function checkValidAccessLevel(accessLevel) {
  return !(isNaN(accessLevel) || !Number.isInteger(parseFloat(accessLevel)) ||
    accessLevel < 0 || accessLevel > 1000)
}

export default AccessManagement;
