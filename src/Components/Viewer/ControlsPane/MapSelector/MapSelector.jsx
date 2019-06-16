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
        maps = maps.filter(x => x.id !== 'ea53987e-842d-4467-91c3-9e23b3e5e2e8');
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
    let body = {
      mapId: map.id
    };

    let timestampsPromise = ApiManager.post('/metadata/timestamps', body, this.props.user);
    let tileLayersPromise = ApiManager.post('/metadata/tileLayers', body, this.props.user);
    let polygonLayersPromise = ApiManager.post('/metadata/polygonLayers', body, this.props.user);
    let customPolygonLayersPromise = ApiManager.post('/geoMessage/customPolygon/layers', body, this.props.user);

    let classesPromise = ApiManager.post('/metadata/classes', body, this.props.user);
    let spectralIndicesPromise = ApiManager.post('/metadata/spectral', body, this.props.user);

    let promises = [
      timestampsPromise,
      tileLayersPromise, 
      polygonLayersPromise, 
      customPolygonLayersPromise,

      classesPromise, 
      spectralIndicesPromise
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
        map.spectralIndices = results[5];
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
      <Select key='map-selector' className='map-selector' onChange={this.selectMap} value={this.state.selectedMap.id}>
        <MenuItem value='default' disabled hidden>Select a Map</MenuItem>
        {this.renderMapOptions()}
      </Select>
    );
  }
}

export default MapSelector;