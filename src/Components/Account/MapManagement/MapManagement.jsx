import React, { PureComponent } from 'react';
import { Redirect } from 'react-router-dom';

import 'react-table/react-table.css';
import cloneDeep from 'lodash.clonedeep';

import AccessManagement from './AccessManagement/AccessManagement';
import GroupUserManagement from './GroupUserManagement/GroupUserManagement';
import CustomPolygonLayersManagement from './CustomPolygonLayersManagement/CustomPolygonLayersManagement';
import FormManagement from './FormManagement/FormManagement';

import ApiManager from '../../../ApiManager';

import './MapManagement.css';

class MapManagement extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      maps: null,
      selectedMap: null,
      mode: 0,
      formManagementKey: 0
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
    let newKey = this.state.formManagementKey;
    if (mode === 3) {
        newKey = Math.random();
    }
    this.setState({ mode: mode, formManagementKey: newKey });
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
    let selectedMap = this.state.maps.find(map => map.id === e.target.value);

    ApiManager.fetch('POST', '/settings/mapAccess', { mapId: selectedMap.id }, this.props.user)
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
      options.push(
        <option value={map.id} key={key++} >{map.name}</option>
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
              language={this.props.language}
              localization={this.props.localization}
              user={this.props.user}
              showError={showError}
              map={this.state.selectedMap}
            >
            </CustomPolygonLayersManagement>
          )
      }

      else if (this.state.mode === 3) {
        modeElement = (
          <FormManagement
            key={this.state.formManagementKey}
            apiUrl={this.props.apiUrl}
            language={this.props.language}
            localization={this.props.localization}
            user={this.props.user}
            showError={showError}
            map={this.state.selectedMap}
          >
          </FormManagement>
        )
    }


        mapAccessArea = (
          <div style={{marginTop: '20px'}}>
            <div>
              <button
                className='map-management-button'
                onClick={() => this.changeMode(0)}
              >
                {this.props.localization["Map access"]}
              </button>
              <button
                className='map-management-button'
                style={{marginLeft: '20px'}}
                onClick={() => this.changeMode(2)}
              >
                {this.props.localization["Custom polygons"]}
              </button>
              <button
                className='map-management-button'
                style={{marginLeft: '20px'}}
                onClick={() => this.changeMode(3)}
              >
                {this.props.localization["formManagement"]}
              </button>
            </div>
            <div style={{ marginTop: '20px' }}>
              {modeElement}
            </div>
          </div>
        );
      }

      managementArea = (
        <div>
          <select onChange={this.onMapSelect} defaultValue="default">
            <option value="default" disabled hidden>{this.props.localization["SelectMap"]}</option>
            {this.renderMapOptions()}
          </select>
          <div style={{textAlign: 'left'}}>
            <div className='tooltip'>
              {this.props.localization["Access levels"]}
              <span className='tooltiptext' dangerouslySetInnerHTML={{__html: this.props.localization["levels"]}}/>
            </div>
          </div>

          {mapAccessArea}
        </div>
      );
    }

    return (
      <div className="login-block" style={{width: '40em', marginLeft: 'auto', marginRight: 'auto'}}>
        <h1 className='account-title'>
          {this.props.localization["Map Management"]}
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
