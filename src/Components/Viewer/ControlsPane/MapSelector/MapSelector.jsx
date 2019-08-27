import React, { PureComponent } from 'react';

import ApiManager from '../../../../ApiManager';
import ErrorHandler from '../../../../ErrorHandler';

import './MapSelector.css';
import ViewerUtility from '../../ViewerUtility';

const ADMIN_ATLAS = 'Development';

export class MapSelector extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      maps: [],
    };

    this.selectionOptions = {
      "ea53987e-842d-4467-91c3-9e23b3e5e2e8":
      {
        "name": "WNF biodiversiteitsmonitor",
        "options": ["timestamps", "polygonLayers", "getForms"]
      },
      "d9903b33-f5d1-4d57-992f-3d8172460126":
      {
        "name": "LNV maai en oogst kaart",
        "options": ["timestamps", "tileLayers", "classes", "measurements"]
      },
      "4a925aef-469b-4aac-995b-46be2dc2779f":
      {
        "name": "Netherlands soil",
        "options": ["timestamps", "measurements"]
      },
      "c4c9dbd9-d1e8-44ec-bf7f-e61b67ed0a8e": {
        "name": "Netherlands high resolution",
        "options": ["timestamps", "tileLayers"]
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.user !== prevProps.user) {
      this.getMaps();
    }
  }

  componentDidMount = () => {
    this.getMaps().then(this.getMetadata());
  }

  getMaps = async () => {
    ApiManager.get('/account/myMaps', null, this.props.user)
      .then(maps => {
        let mapsToSelect = Object.keys(this.selectionOptions);
        let newMaps = maps.filter(el => {return mapsToSelect.includes(el.id)});

        this.getMetadata(newMaps);
      })
      .catch(err => {
        ErrorHandler.alert(err);
      });
  }

  getMetadata = async(maps) => {
    if (typeof(maps) !== 'undefined' && maps.length > 0)
    {
      let promises = [];
      for(let key in this.selectionOptions)
      {
        promises.push(this.getMapMetadata(maps, key));
      }

      Promise.all(promises)
        .then(result => {
          let maps = {};
          for (var i = 0; i < result.length; i++)
          {
            let map = result[i];
            maps[map.id] = map;
          }
          
          this.props.onSelectMap(maps)
        })
    }
  }

  getMapMetadata = (maps, mapId) => {
    let map = maps.filter(el => {return el.id === mapId})[0];
    let body = {mapId: mapId};

    let promises = [];
    let mapOptions = this.selectionOptions[mapId].options;
    for (var i = 0; i < mapOptions.length; i++)
    {
      let type = mapOptions[i];
      let url = type === 'getForms' ? '/geomessage/getForms' : '/metadata/' + type;
      promises.push(ApiManager.post(url, body, this.props.user));
    }

    return Promise.all(promises)
      .then(results => {
        map.layers = {};

        map.timestamps = results[0];

        mapOptions.includes('polygonLayers') ? map.layers.polygon = results[mapOptions.indexOf('polygonLayers')] : map.layers.polygon = [];
        mapOptions.includes('tileLayers') ? map.layers.tile = results[mapOptions.indexOf('tileLayers')] : map.layers.tile = [];

        mapOptions.includes('classes') ? map.classes = results[mapOptions.indexOf('classes')] : map.classes = [];
        mapOptions.includes('measurements') ? map.measurements = results[mapOptions.indexOf('measurements')] : map.measurements = [];
        mapOptions.includes('getForms') ? map.forms = results[mapOptions.indexOf('getForms')] : map.forms = [];

        return map;
      })
      .catch(error => {console.log(error)})

    /*let timestampsPromise = ApiManager.post('/metadata/timestamps', body, this.props.user);
    let tileLayersPromise = ApiManager.post('/metadata/tileLayers', body, this.props.user);
    let polygonLayersPromise = ApiManager.post('/metadata/polygonLayers', body, this.props.user);
    let customPolygonLayersPromise = ApiManager.post('/geoMessage/customPolygon/layers', body, this.props.user);

    let classesPromise = ApiManager.post('/metadata/classes', body, this.props.user);
    let measurementsPromise = ApiManager.post('/metadata/measurements', body, this.props.user);
    let formsPromise = null;
    if (map.accessLevel >= ApiManager.accessLevels.viewGeoMessages) {
      formsPromise = ApiManager.post('/geomessage/getForms', body, this.props.user);
    }

    let promises = [
      timestampsPromise,
      tileLayersPromise,
      polygonLayersPromise,
      customPolygonLayersPromise,

      classesPromise,
      measurementsPromise,
      formsPromise
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
        if (results[6]) {
          map.forms = results[6]
        }

        map.metadataLoaded = true;
      })*/
  }

  render() {
    return null;
  }
}

export default MapSelector;
