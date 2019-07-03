import React, { PureComponent } from 'react';

import ApiManager from '../../../../ApiManager';
import ErrorHandler from '../../../../ErrorHandler';

import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import './MapSelector.css';

export class MapSelector extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      maps: [],
      mapOptions: [],

      selectedMap: { id: 'default' }
    };
  }
  
  componentDidUpdate(prevProps) {
    if (this.props.user !== prevProps.user) {
      this.getMaps();
    }
  }

  componentDidMount = () => {
    this.getMaps();
  }

  getMaps = async () => {
    ApiManager.get('/account/myMaps', null, this.props.user)
      .then(maps => {
        this.setState({ maps: maps });
      })
      .catch(err => {
        ErrorHandler.alert(err);
      });
  }

  selectMap = (e) => {
    if (!e.target.value) {
      return;
    } 
    
    let map = this.state.maps.find(x => x.id === e.target.value);

    if (!map) {
      return;
    }


    this.setState({ selectedMap: map });

    if (!map.timestamps || !map.layer) {      
      this.getMapMetadata(map)
        .then(() => {
          this.props.onSelectMap(map);
        })
        .catch(err => {
          ErrorHandler.alert(err);
        });
    }    
  };

  getMapMetadata = (map) => {
    if (map.metadataLoaded) {
      return Promise.resolve();
    }

    let body = {
      mapId: map.id
    };

    let timestampsPromise = ApiManager.post('/metadata/timestamps', body, this.props.user);
    let tileLayersPromise = ApiManager.post('/metadata/tileLayers', body, this.props.user);
    let polygonLayersPromise = ApiManager.post('/metadata/polygonLayers', body, this.props.user);
    let customPolygonLayersPromise = ApiManager.post('/geoMessage/customPolygon/layers', body, this.props.user);

    let classesPromise = ApiManager.post('/metadata/classes', body, this.props.user);
    let measurementsPromise = ApiManager.post('/metadata/measurements', body, this.props.user);

    let promises = [
      timestampsPromise,
      tileLayersPromise, 
      polygonLayersPromise, 
      customPolygonLayersPromise,

      classesPromise, 
      measurementsPromise
    ];

    return Promise.all(promises)
      .then(results => {
        map.timestamps = results[0];
        map.layers = {
          tile: results[1],
          polygon: results[2],
          customPolygon: results[3]
        };

        map.classes = results[4];
        map.measurements = results[5];

        if (this.props.user && map.accessLevel >= ApiManager.accessLevels.addGeoMessages) {
          return ApiManager.post('/geomessage/getForms', body, this.props.user);
        }
        else {
          return null;
        }
      })      
      .then(forms => {
        map.forms = forms;

        map.metadataLoaded = true;
      });
  }

  renderMapOptions = () => {
    let options = [];
    if (this.state.maps.length > 0)
    {
      for (let i = 0; i < this.state.maps.length; i++)
      {
        let map = this.state.maps[i];
        options.push(
          <MenuItem value={map.id} key={i}>{map.name}</MenuItem>
        );
      }
    }

    return options;
  };

  render() {
    return (
      <Select key='map-selector' className='selector' onChange={this.selectMap} value={this.state.selectedMap.id}>
        <MenuItem value='default' disabled hidden>Select a Map</MenuItem>
        {this.renderMapOptions()}
      </Select>
    );
  }
}

export default MapSelector;