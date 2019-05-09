import React, { PureComponent } from 'react';
import { NavLink, Redirect } from 'react-router-dom';

import ReactTable from 'react-table';
import 'react-table/react-table.css';
import cloneDeep from 'lodash.clonedeep';

import AccessManagement from './AccessManagement/AccessManagement';
import GroupUserManagement from './GroupUserManagement/GroupUserManagement';
import CustomPolygonLayersManagement from './CustomPolygonLayersManagement/CustomPolygonLayersManagement';

import ApiManager from '../../../ApiManager';

import './MapManagement.css';

class MapManagement extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      maps: null,
      selectedMap: null,
      mode: 0
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

  changeMode = (mode) => {
    this.setState({ mode: mode });
  }

  onGroupUserManagement = (group) => {
    this.setState({
      selectedGroup: group,
      mode: 1
    });
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

        let nextMode = this.state.mode;
        if (this.state.mode === 1) {
          nextMode = 0;
        }

        this.setState({ selectedMap: selectedMap, mapAccess: result, groupsData: groupsData, mode: nextMode });
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

  render() {
    if (!this.props.user) {
      return (
        <Redirect to='/login'></Redirect>
      );
    }

    let managementArea = (<div></div>);

    if (this.state.maps) {
      let mapAccessArea = (
        <div></div>
      )

      if (this.state.selectedMap) {
        let modeElement = (<div></div>);

        if (this.state.mode === 0) {
          modeElement = (
            <AccessManagement
              apiUrl={this.props.apiUrl} 
              language={this.props.language} 
              localization={this.props.localization}
              user={this.props.user}
              showError={showError}
              onGroupUserManagement={this.onGroupUserManagement}
              map={this.state.selectedMap}
            >
            </AccessManagement>
          )
        }
        else if (this.state.mode === 1) {
            modeElement = (
              <GroupUserManagement
                apiUrl={this.props.apiUrl} 
                language={this.props.language} 
                localization={this.props.localization}
                user={this.props.user}
                showError={showError}
                map={this.state.selectedMap}
                group={this.state.selectedGroup}
              >
              </GroupUserManagement>
            )
        }
        else if (this.state.mode === 2) {
          modeElement = (
            <CustomPolygonLayersManagement
              apiUrl={this.props.apiUrl} 
              language={this.props.language} 
              localization={this.props.localization}
              user={this.props.user}
              showError={showError}
              map={this.state.selectedMap}
            >
            </CustomPolygonLayersManagement>
          )
      }

        mapAccessArea = (
          <div style={{marginTop: '20px'}}>
            <div>
              <button 
                className='map-management-button'
                onClick={() => this.changeMode(0)}
              >
                Map access
              </button>
              <button 
                className='map-management-button'
                style={{marginLeft: '20px'}} 
                onClick={() => this.changeMode(2)}
              >
                Custom polygons
              </button>
            </div>
            {modeElement}
          </div>
        );
      }

      managementArea = (
        <div>
          <select onChange={this.onMapSelect} defaultValue="default">
            <option value="default" disabled hidden>Select a Map</option>
            {this.renderMapOptions()}
          </select>
          <div style={{textAlign: 'right'}}>
            <div className='tooltip'>
              Access levels
              <span className='tooltiptext'>
                A higher access level implies all lower levels.<br/><br/>
                Level 100: The right to view the map.<br/>
                Level 200: The right to access aggregated data of a map.<br/>
                Level 300: The right to view geoMessages.<br/>
                Level 400: The right to add geoMessages.<br/>
                Level 500: The right to add custom polygons.<br/>
                Level 600: The right to delete geoMessages.<br/>
                Level 700: The right to alter or delete custom polygons.<br/>
                Level 800: The right to alter custom polygon layers.<br/>
                Level 900: The right to add users to user groups up till degree 9.<br/>
                Level 1000: The right to make content public and to create or alter user groups.<br/>
              </span>
            </div>
          </div>

          {mapAccessArea}
        </div>
      );
    }

    return (
      <div className="login-block" style={{width: '40em', marginLeft: 'auto', marginRight: 'auto'}}>
        <h1 className='account-title'>
          Map Management
        </h1>
        {managementArea}
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
