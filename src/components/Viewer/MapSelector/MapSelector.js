import React, { PureComponent } from 'react';

import "./MapSelector.css";

const QueryUtil = require('../../Utilities/QueryUtil').default;

export class MapSelector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      maps: []
    };

    if(this.props.user)
    {
      this.header = {Authorization: "Bearer " + this.props.user.token};
    }
    else
    {
      this.header = {};
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props !== nextProps && this.props.user !== nextProps.user)
    {
      if (nextProps.user)
      {
        this.header['Authorization'] = "Bearer " + nextProps.user.token;
      }
    }
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
      let responseJson = await QueryUtil.getData(this.props.apiUrl + 'account/myMaps', this.header);
      this.setState({ maps: responseJson });
    }
    catch(error)
    {
      throw new Error(error);
    }
  }

  selectMap = async (e) => {
    if (!e.target.value) {
      this.props.onSelect();
    } 
    else {
      let map = this.state.maps.find(x => x.uuid === e.target.value);
      if (map) {        
        try {
          let mapTimestampsPromise = this.getMapTimestamps(map);
          let mapLayersPromise = this.getMapLayers(map);

          await mapTimestampsPromise;
          await mapLayersPromise;

          this.props.onSelect(map);
        }
        catch (err) {
          alert(err);
        }
      }
    }
  };


  getMapTimestamps = async (map) => {
    let responseJson = await QueryUtil.postData(this.props.apiUrl + 'metadata/timestamps', {"mapId":  map.uuid }, this.header);
    map.timestamps = responseJson;
  };

  getMapLayers = async (map) => {
    let tileLayersPromise = QueryUtil.postData(this.props.apiUrl + 'metadata/tileLayers', {"mapId":  map.uuid }, this.header);
    let polygonLayersPromise = QueryUtil.postData(this.props.apiUrl + 'metadata/polygonLayers', {"mapId":  map.uuid }, this.header);
    let classPromise = QueryUtil.postData(this.props.apiUrl + 'metadata/classes', {"mapId":  map.uuid }, this.header);
    let spectralPromise = QueryUtil.postData(this.props.apiUrl + 'metadata/spectral', {"mapId":  map.uuid }, this.header);
    let crowdLayersPromise = QueryUtil.postData(this.props.apiUrl + 'geoMessage/customPolygon/layers', {"mapId":  map.uuid }, this.header);

    let responseJsonTileLayers = await tileLayersPromise;

    let tileLayers = [];
    responseJsonTileLayers.forEach(timestampLayers => {
      timestampLayers.layers.forEach(layer => {
        let tileLayer = tileLayers.find(x => x.type === layer.type);

        if (!tileLayer) {
          tileLayer = {
            type: layer.type,
            layers: [],
            timestamps: []
          };

          tileLayers.push(tileLayer);
        }
        
        if (!tileLayer.layers.includes(layer.name)) {
          tileLayer.layers.push(layer.name);
        }
        
        if (!tileLayer.timestamps.includes(timestampLayers.timestampNumber)) {
          tileLayer.timestamps.push(timestampLayers.timestampNumber);
        }
      });
    });

    let responseJsonPolygonLayers = await polygonLayersPromise;
    let responseClasses = await classPromise;
    let responseSpectral = await spectralPromise;
    let responseJsonCrowdLayers = await crowdLayersPromise;

    map.tileLayers = tileLayers;
    map.polygonLayers = responseJsonPolygonLayers;
    map.classes = responseClasses;
    map.spectral = responseSpectral;

    if(responseJsonCrowdLayers)
    {
      map.crowdLayers = responseJsonCrowdLayers;
    }
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
      <select className="map-selector" onChange={this.selectMap} defaultValue="default">
          <option value="default" disabled hidden>Select a Map</option>
          {this.renderMapOptions()}
      </select>
    );
  }
}

export default MapSelector;