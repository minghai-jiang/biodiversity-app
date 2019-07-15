import FileSaver from 'file-saver';

const TILE = 'tile';
const STANDARD_TILE = 'standard_tile';
const POLYGON = 'polygon';
const CUSTOM_POLYGON = 'custom_polygon'

const ViewerUtility = {

  admin: 'admin',

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
    measurements: 'measurements'
  },

  specialClassName: {
    allClasses: 'all classes',
    mask: 'mask',
    blanc: 'blanc',
    noClass: 'no class',
    cloudCover: 'cloud_cover'
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
  },

  download: (filename, text, mime) => {
    let blob = new Blob([text], {type: `${mime};charset=utf-8`});
    FileSaver.saveAs(blob, filename);
  },

  createGeoJsonLayerStyle: (color, weight, fillOpacity) => {
    return {
      color: color ? color : '#3388ff',
      weight: weight ? weight : 1, 
      fillOpacity: fillOpacity ? fillOpacity : 0.06
    };
  },

  isPrivateProperty: 'isPrivate'

}

export default ViewerUtility;