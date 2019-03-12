import React, { PureComponent } from 'react';

import "./MapSelector.css";

const QueryUtil = require('../../Utilities/QueryUtil').default;

export class MapSelector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      maps: []
    };
  }

  componentDidMount = () => {
    this.getMaps()
      .catch(error => {
        alert(error);
      });
  }

  getMaps = async () => {
    try
    {
      let responseJson = await QueryUtil.getData(this.props.apiUrl + 'account/myMaps');
      this.setState({ maps: responseJson });
    }
    catch(error)
    {
      throw new Error(error);
    }
  }

  selectMap = (e) => {
    if (!e.target.value) {
      this.props.onSelect();
    } 
    else {
      let map = this.state.maps.find(x => x.uuid === e.target.value);
      if (map) {        
        this.getMapTimestamps(map)
          .then(() => {
            return this.getMapLayers(map);
          })
          .then(() => {
            this.props.onSelect(map);
          })
          .catch(error => {
            alert(error);
          });
      }
    }
  };

  getMapTimestamps = async (map) => {
    let responseJson = await QueryUtil.getData(this.props.apiUrl + 'metadata/timestamps', {"mapId":  map.uuid });
    map.timestamps = responseJson;
  };

  getMapLayers = async (map) => {
    let responseJsonTileLayers = await QueryUtil.getData(this.props.apiUrl + 'metadata/tileLayers', {"mapId":  map.uuid });
    map.tileLayers = responseJsonTileLayers;

    let responseJsonPolygonLayers = await QueryUtil.getData(this.props.apiUrl + 'metadata/polygonLayers', {"mapId":  map.uuid });
    map.polygonLayers = responseJsonPolygonLayers;
  };

  renderMapOptions = () => {
    let options = [];
    if (this.state.maps.length > 0)
    {
      for (let i = 0; i < this.state.maps.length; i++)
      {
        let map = this.state.maps[i];
        options.push(
          <option value={map.uuid} key={i}>{map.name}</option>
        );
      }
    }

    return options;
  };

  render() {
    return (
      <select className="map-selector" onChange={this.selectMap}>
          <option value="">Select a map</option>
          {this.renderMapOptions()}
      </select>
    );
  }
}

export default MapSelector;