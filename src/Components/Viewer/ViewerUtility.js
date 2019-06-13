const ViewerUtility = {

  tileLayerType: 'tile',
  standardTileLayerType: 'standard_tile',
  polygonLayerType: 'polygon',
  customPolygonTileLayerType: 'custom_polygon',

  drawnPolygonlayerType: 'drawn_polygon',

  tileLayerZIndex: 200,
  standardTileLayerZIndex: 1000,
  polygonLayerZIndex: 1001,
  customPolygonLayerZIndex: 1100,
  drawnPpolygonLayerZIndex: 1200,

  dataPaneAction: {
    analyse: 'analyse',
    geomessage: 'geoMessage',
    alterCustomPolygon: 'alter_custom_polygon',
    feed: 'geomessage_feed'
  },

  dataGraphType: {
    classes: 'classes',
    spectralIndices: 'spectral_indices'
  }
}

export default ViewerUtility;