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
    geoMessage: 'geoMessage',
    alterCustomPolygon: 'alter_custom_polygon',
    feed: 'geomessage_feed'
  },

  dataGraphType: {
    classes: 'classes',
    spectralIndices: 'spectral_indices'
  },

  specialClassName: {
    allClasses: 'all classes',
    mask: 'mask',
    blanc: 'blanc',
    noClass: 'no class'
  },

  geomessageFormType: {
    text: 'text',
    numeric: 'numeric',
    boolean: 'boolean'
  }


}

export default ViewerUtility;