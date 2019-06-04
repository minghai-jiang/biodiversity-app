import React, { PureComponent } from 'react';

import ApiManager from '../../../../ApiManager';
import ErrorHandler from '../../../../ErrorHandler';

import './MapSelector.css';

export class MapSelector extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      maps: [],
      mapOptions: []
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

  selectMap = async (e) => {
    if (!e.target.value) {
      return;
    } 
    
    let map = this.state.maps.find(x => x.id === e.target.value);

    if (!map) {
      return;
    }

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
      classesPromise, 
      spectralIndicesPromise, 
      customPolygonLayersPromise
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
          <option value={map.id} key={i}>{map.name}</option>
        );
      }
    }

    return options;
  };

  render() {
    return (
      <select key='map-selector' className='map-selector' onChange={this.selectMap} defaultValue='default'>
        <option value='default' disabled hidden>Select a Map</option>
        {this.renderMapOptions()}
      </select>
    );
  }
}

export default MapSelector;