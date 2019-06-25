const TILE = 'tile';
const STANDARD_TILE = 'standard_tile';
const POLYGON = 'polygon';
const CUSTOM_POLYGON = 'custom_polygon'

const ViewerUtility = {

  tileLayerType: TILE,
  standardTileLayerType: STANDARD_TILE,
  polygonLayerType: POLYGON,
  customPolygonTileLayerType: CUSTOM_POLYGON,

  drawnPolygonLayerType: 'drawn_polygon',

  tileLayerZIndex: 200,
  standardTileLayerZIndex: 1000,
  polygonLayerZIndex: 1001,
  customPolygonLayerZIndex: 1100,
  selectedElementLayerZIndex: 1150,
  drawnPolygonLayerZIndex: 1151,

  dataPaneAction: {
    analyse: 'analyse',
    geoMessage: 'geoMessage',
    createCustomPolygon: 'create_custom_polygon',
    editCustomPolygon: 'edit_custom_polygon',
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
  },

  flyToType: {
    map: 'map',
    currentLocation: 'current_location',
    currentElement : 'current_element',

    location: 'location',
    standardTile: STANDARD_TILE,
    polygon: POLYGON,
    customPolygon: CUSTOM_POLYGON
  }


}

export default ViewerUtility;