import React, { PureComponent } from 'react';
import { TileLayer } from 'react-leaflet';
import L from 'leaflet';

import ApiManager from '../../../../ApiManager';

const tileLayerTypes = [ 
  {
    name: 'images', 
    checked: true,
    stacking: true,
    zIndex: 1000
  },
  {
    name: 'labels', 
    checked: true,
    stacking: false,
    zIndex: 2000,
  },
  {
    name: 'indices', 
    checked: false,
    stacking: false,
    zIndex: 3000
  }
];

class TileLayersControl extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {

    };
  }  

  componentDidUpdate(prevProps) {
    if (!this.props.map || !this.props.timestampRange) {
      this.props.onLayersChange([]);
      return;
    }

    let differentMap = this.props.map !== prevProps.map;
    let differentTimestamp = !prevProps.timestampRange || 
      this.props.timestampRange.start !== prevProps.timestampRange.start ||
      this.props.timestampRange.end !== prevProps.timestampRange.end

    if (differentMap || differentTimestamp) {
      let newLeafletTileLayers = this.prepareLayers(this.props.map, this.props.timestampRange);

      this.props.onLayersChange(newLeafletTileLayers);
    }
  }

  prepareLayers = (map, timestampRange) => {
    let leafletTileLayersGrouped = [];

    // Loop through all types, so they are created in the order they should appear.
    for (let i = 0; i < tileLayerTypes.length; i++) {
      let tileLayerType = tileLayerTypes[i];

      let timestampStart = tileLayerType.stacking ? timestampRange.start : timestampRange.end;
      let timestampEnd = timestampRange.end;      

      for (let y = timestampStart; y <= timestampEnd; y++) {
        
        let mapTimestamp = map.timestamps[y];

        if (!mapTimestamp) {
          continue;
        }

        // Find the layer information of the timestamp.
        let mapTimestampTileLayers = map.layers.tile.find(x => x.timestampNumber === mapTimestamp.timestampNumber);

        if (!mapTimestampTileLayers) {
          continue;
        }

        // Find all layers of the current type.
        let mapTimestampTileLayersOfType = mapTimestampTileLayers.layers.filter(x => x.type === tileLayerType.name);

        for (let p = 0; p < mapTimestampTileLayersOfType.length; p++) {
          let tileLayer = mapTimestampTileLayersOfType[p];

          let leafletTileLayersGroup = leafletTileLayersGrouped.find(x => x.type === tileLayer.type && x.name === tileLayer.name);

          if (!leafletTileLayersGroup) {
            leafletTileLayersGroup = {
              type: tileLayer.type,
              name: tileLayer.name,
              zIndexOffset: p * map.timestamps.length,
              leafletTileLayers: []
            };

            leafletTileLayersGrouped.push(leafletTileLayersGroup);
          }

          let key = `${map.id}_${mapTimestamp.timestampNumber}_${tileLayer.type}_${tileLayer.name}`;
          let url = `${ApiManager.apiUrl}/tileService/${map.id}/${mapTimestamp.timestampNumber}/${tileLayer.name}/{z}/{x}/{y}`;
          let zIndex = tileLayerType.zIndex + leafletTileLayersGroup.zIndexOffset + leafletTileLayersGroup.leafletTileLayers.length;

          let leafletTileLayer = (<TileLayer
            key={key}
            url={url}
            tileSize={256}
            noWrap={true}
            maxZoom={map.zoom}
            format={'image/png'}
            zIndex={zIndex}
            bounds = {L.latLngBounds(L.latLng(map.yMin, map.xMin), L.latLng(map.yMax, map.xMax))}
          />);

          leafletTileLayersGroup.leafletTileLayers.push(leafletTileLayer);
        }
      }
    }

    let leafletTileLayers = [];

    for (let i = 0; i < leafletTileLayersGrouped.length; i++) {
      leafletTileLayers.push(leafletTileLayersGrouped[i].leafletTileLayers);
    }

    return leafletTileLayers;
  }

  render() {
    return null;
  }
}

export default TileLayersControl;
