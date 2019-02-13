import React, { PureComponent } from 'react';
import Papa from 'papaparse';

import "./map-selector.css";

let csvParseConfig = {
  skipEmptyLines: true
};

export class MapSelector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      maps: []
    };
  }

  componentDidMount = () => {
    fetch(
      `${this.props.apiUrl}queries/publicMaps`,
      {
        method: 'POST'
      }
    )
    .then(response => {
      return response.text();
    })
    .then(data => {
      let parsedCsv = Papa.parse(data, csvParseConfig);

      let mapIdHeaderIndex = parsedCsv.data[0].indexOf('map_id');
      let mapNameHeaderIndex = parsedCsv.data[0].indexOf('name');

      let maps = [];
      for (let i = 1; i < parsedCsv.data.length; i++) {
        let mapId = parsedCsv.data[i][mapIdHeaderIndex];
        let mapName = parsedCsv.data[i][mapNameHeaderIndex];
        maps.push({
          id: mapId,
          name: mapName
        });
      }

      this.setState({ maps: maps });
    })
    .catch(error => {
      alert(error);
    });
  }

  selectMap = (e) => {
    if (!e.target.value) {
      this.props.onSelect();
    } 
    else {
      let map = this.state.maps.find(x => x.id === e.target.value);
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
    if (!map.timestamps) {
      let bodyJson = JSON.stringify({
        mapId: map.id
      });

      let response = await fetch(
        `${this.props.apiUrl}queries/timestamps_map`,
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },  
          body: bodyJson,
        }
      );


      if (response.status === 200) {
        let dataCsv = await response.text();

        let parsedCsv = Papa.parse(dataCsv, csvParseConfig);
  
        let timestampNumberHeaderIndex = parsedCsv.data[0].indexOf('timestamp');
        let dateFromHeaderIndex = parsedCsv.data[0].indexOf('date_from');
        let dateToHeaderIndex = parsedCsv.data[0].indexOf('date_to');
  
        let timestamps = [];
        for (let i = 1; i < parsedCsv.data.length; i++) {
          let timestampNumber = parsedCsv.data[i][timestampNumberHeaderIndex];
          let dateFrom = parsedCsv.data[i][dateFromHeaderIndex];
          let dateTo = parsedCsv.data[i][dateToHeaderIndex];

          timestamps.push({
            number: timestampNumber,
            dateFrom: dateFrom,
            dateTo: dateTo
          });
        }

        timestamps.sort((a, b) => { 
          if (a.date > b.date) {
            return 1;
          }
          else if (a.date < b.date) {
            return -1;
          }
          else {
            return 0;
          }
        });

        map.timestamps = timestamps;
      }
      else {
        throw `${response.status}: ${response.message}`;       
      }
    }
  };

  getMapLayers = async (map) => {
    if (!map.layers) {
      let bodyJson = JSON.stringify({
        mapId: map.id
      });

      let response = await fetch(
        `${this.props.apiUrl}queries/layers_map`,
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },  
          body: bodyJson,
        }
      )

      if (response.status === 200) {
        let dataCsv = await response.text();

        let parsedCsv = Papa.parse(dataCsv, csvParseConfig);
  
        let layerTypeHeaderIndex = parsedCsv.data[0].indexOf('type');
        let layerNameHeaderIndex = parsedCsv.data[0].indexOf('name');
  
        let layerTypes = []
        let layers = {};
        for (let i = 1; i < parsedCsv.data.length; i++) {
          let type = parsedCsv.data[i][layerTypeHeaderIndex];
          let name = parsedCsv.data[i][layerNameHeaderIndex];

          if (!layerTypes.includes(type)) {
            layerTypes.push(type);
            layers[type] = [];
          }

          if (!layers[type].find(x => x.name === name)) {
            layers[type].push({
              type: type,
              name: name
            });
          }
        }

        map.layerTypes = layerTypes;
        map.layers = layers;
      }
      else {
        throw `${response.status}: ${response.message}`;       
      }       
    }
  };

  renderMapOptions = () => {
    let options = [];
    for (let i = 0; i < this.state.maps.length; i++) {
      let map = this.state.maps[i];
      options.push(
        <option value={map.id} key={i}>{map.name}</option>
      );
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
