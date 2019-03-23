import React, { PureComponent, createRef } from 'react';

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  Map,
  TileLayer,
  GeoJSON,
  LayersControl,
  LayerGroup,
  FeatureGroup,
  Popup,
  Polygon,
  Marker
} from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";

import {Portal} from "react-leaflet-portal";

import "./ViewerMap.css";
import PopupForm from '../../Popup-form/Popup-form';
const QueryUtil = require('../../Utilities/QueryUtil').default;

const imagesTileLayer = 'images';
const labelsTileLayer = 'labels';
const indicesTileLayer = 'indices';
//const changesTileLayer = 'changes';

const tileLayerTypes = [ 
  {
    name: imagesTileLayer, 
    checked: true,
    stacking: true,
    zIndex: 100
  },
  {
    name: labelsTileLayer, 
    checked: true,
    stacking: false,
    zIndex: 200,
  },
  {
    name: indicesTileLayer, 
    checked: false,
    stacking: false,
    zIndex: 300
  }
/*  {
    name: changesTileLayer,
    checked: false,
    stacking: true,
    zIndex: 400
  }*/
];

const getPolygonJsonWaitTime = 1000;
const maxPolygon = 500;

let randomKey = 0;

let mapParams = {
  tileSize: 256,
  attribution: 'Ellipsis Earth Intelligence',
  maxZoom: 14,
  noWrap: true,
  format: 'image/png'
};

export class ViewerMap extends PureComponent {
  mapRef = createRef();
  getPolygonJsonTimeout = null;

  constructor(props) {
    super(props);
    this.state = {
      zoom: 3,
      lat: 40.509865,
      lon: -0.118092,
      layerGeoJsons: [],

      preparedtileLayers: null,
      checkedLayers: [],
      popupProps: {},
      polygonCounts: {},
      legend: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    let differentMap = nextProps.map !== this.props.map;
    
    if (differentMap ||
        nextProps.timestampRange !== this.props.timestampRange ||
        nextProps.timestampRange.start !== this.props.timestampRange.start || 
        nextProps.timestampRange.end !== this.props.timestampRange.end) {

        if (differentMap) {
          let bounds = L.latLngBounds(L.latLng(nextProps.map.yMin, nextProps.map.xMin), L.latLng(nextProps.map.yMax, nextProps.map.xMax));
        
          if (this.props.map === null)
          {
            this.mapRef.current.leafletElement.flyToBounds(bounds);
          }
          else
          {
            let old_bounds = L.latLngBounds(L.latLng(this.props.map.yMin, this.props.map.xMin), L.latLng(this.props.map.yMax, this.props.map.xMax));
            
            if (!bounds.contains(old_bounds))
            {
              this.mapRef.current.leafletElement.flyToBounds(bounds);
            }
          }

          this.prepareLayers(nextProps)
            .then(layers => {
              this.setState({ preparedtileLayers: layers });
            });
        }
    }
  }

  prepareLayers = async (props) => {
    let map = props.map;
    if (!map || !map.tileLayers) {
      return [];
    }

    this.state.checkedLayers.length = 0;
    
    let preparedtileLayers = [];

    for (var i = 0; i < tileLayerTypes.length; i++)
    {
      let tileLayerType = tileLayerTypes[i];

      let mapTileLayerType = map.tileLayers.find(x => x.type === tileLayerType.name);

      if (!mapTileLayerType) {
        continue;
      }

      let tileLayersOfTypes = [];

      for (var j = 0; j < mapTileLayerType.layers.length; j++)
      {
        let tileLayerName = mapTileLayerType.layers[j];

        if (tileLayerType.checked && !this.state.checkedLayers.includes(tileLayerName)) {
          this.state.checkedLayers.push(tileLayerName);
        }

        let tileLayersOfType = tileLayerTypes.find(x => x.name === tileLayerName);

        if (!tileLayersOfType) {
          tileLayersOfType = {
            name: tileLayerName,
            timestampElements: []
          };

          tileLayersOfTypes.push(tileLayersOfType);
        }

        mapTileLayerType.timestamps.forEach(timestampNumber => {
          let url = `${props.apiUrl}tileLayer/${map.uuid}/${timestampNumber}/${tileLayerName}/{z}/{x}/{y}`;

          tileLayersOfType.timestampElements.push({
            timestampNumber: timestampNumber,
            element: (<TileLayer
              url={url}
              tileSize={mapParams.tileSize}
              noWrap={mapParams.noWrap}
              maxZoom={mapParams.maxZoom}
              attribution={mapParams.attribution}
              format={mapParams.format}
              zIndex={tileLayerType.zIndex + (tileLayersOfType.timestampElements.length + 1)}
              key={timestampNumber + '.' + j}
              errorTileUrl={props.publicFilesUrl + 'images/dummy_tile.png'}
              bounds = {L.latLngBounds(L.latLng(map.yMin, map.xMin), L.latLng(map.yMax, map.xMax))}
            />)
          });
        })
      }

      preparedtileLayers.push({
        type: tileLayerType.name,
        layers: tileLayersOfTypes
      });
    }

    return preparedtileLayers;
  }

  getPolygonsJson = async (props) =>
  {
    let map = props.map;
    let mapRef = this.mapRef.current.leafletElement;
    let screenBounds = mapRef.getBounds();
    let bounds = 
    {
      xMin: screenBounds.getWest(),
      xMax: screenBounds.getEast(),
      yMin: screenBounds.getSouth(),
      yMax: screenBounds.getNorth()
    }
    
    if (!map) {
      return;
    }

    let geoJsonPromises = [];

    for (let i = 0; i < map.polygonLayers.length; i++) {
      if (map.polygonLayers[i].timestampNumber === props.timestampRange.end)
      {
        for (let j = 0; j < map.polygonLayers[i].layers.length; j++)
        {
          let geoJsonPromise = this.getPolygonsJsonAux(
            props.apiUrl,
            props.user, 
            map.uuid, 
            props.timestampRange.end, 
            bounds, 
            map.polygonLayers[i].layers[j].name,
            map.polygonLayers[i].layers[j].color);

          geoJsonPromises.push(geoJsonPromise);          
        }
      }
    }

    let layerGeoJsons = [];
    let polygonCounts ={};

    for (let i = 0; i < geoJsonPromises.length; i++) {
      let layerGeoJson = await geoJsonPromises[i];
      layerGeoJsons.push(layerGeoJson);
      polygonCounts[layerGeoJson.name] = layerGeoJson.count;
    }

    randomKey = Math.random();

    this.getLegend('onMove');
    this.setState({ layerGeoJsons: layerGeoJsons, polygonCounts: polygonCounts});
  }

  getPolygonsJsonAux = async (apiUrl, user, mapUuid, timestampEnd, bounds, layerName, layerColor) => {
    let headers = {};
    if (user) {
      headers["Authorization"] = "BEARER " + user.token;
    }

    let polygonIdResult = await QueryUtil.getData(
      apiUrl + 'metadata/polygons',
      {
        mapId:  mapUuid,
        timestamp: timestampEnd,
        layer: layerName,
        xMin: bounds.xMin,
        xMax: bounds.xMax,
        yMin: bounds.yMin,
        yMax: bounds.yMax,
        limit: maxPolygon
      },
      { headers }
    );

    //console.log(polygonIdResult.ids, polygonIdResult.ids.length)
    if (typeof(polygonIdResult.ids) !== 'undefined' && polygonIdResult.ids.length > 0)
    {
      let polygonsGeoJson = await QueryUtil.getData(
        apiUrl + 'geometry/polygons',
        {
          mapId:  mapUuid,
          timestamp: timestampEnd,
          polygonIds: polygonIdResult.ids
        },
        { headers }
      );

      polygonsGeoJson.name = layerName;
      polygonsGeoJson.color = layerColor;
      polygonsGeoJson.count = polygonIdResult.count

      return polygonsGeoJson;
    }
    else {
      return {
        name: layerName,
        color: layerColor,
        count: polygonIdResult.count
      };
    }
  }

  onMapMoveEnd = (e) =>
  {
    let f = () => {
      this.getPolygonsJson(this.props);
    }

    clearTimeout(this.getShapeJsonTimeout);
    this.getShapeJsonTimeout = setTimeout(f.bind(this), getPolygonJsonWaitTime);
  }

  onOverlayAdd = (e) => {
    let checkedLayers = this.state.checkedLayers;
    if (!checkedLayers.includes(e.name)) {
      checkedLayers.push(e.name);
    }

    this.getLegend('onAdd');
    this.setState({checkedLayers: checkedLayers});
  }

  onOverlayRemove = (e) => {
    let checkedLayers = this.state.checkedLayers;
    
    let index = checkedLayers.indexOf(e.name);
    if (index > -1) {
      checkedLayers.splice(index, 1);
    }

    this.getLegend('onRemove');
    this.setState({checkedLayers: checkedLayers});
  }

  createDrawButton = (map, type) => {
    var drawnItems = new L.featureGroup();
    map.addLayer(drawnItems);
    
    let draw = {
      polygon: false,
      rectangle: false,
      marker: false,
      polyline: false,
      circle: false,
      circlemarker: false
    };

    if(type)
    {
      for (let key in type)
      {
        draw[key] = type[key];
      }
    }

    var drawControl = new L.Control.Draw({
      draw: draw,
      edit: false
    });
    
    map.addControl(drawControl);
    map.on(L.Draw.Event.CREATED, this.onShapeDrawnClosure(drawnItems));
  }

  componentDidMount = () => {
    let map = this.mapRef.current.leafletElement;
    map.on('moveend', this.onMapMoveEnd);
    map.on('overlayadd', this.onOverlayAdd);
    map.on('overlayremove', this.onOverlayRemove);
    
    //Draw items
    this.createDrawButton(map, {polygon: {allowIntersection: false }});
    // this.createDrawButton(map, {rectangle: true});
  }

  onShapeDrawnClosure(drawnItems) {
    return function onShapeDrawn(event) {
      drawnItems.clearLayers();
      const layer = event.layer;
      drawnItems.addLayer(layer);
      const latLngs = layer.getLatLngs()[0];

      var shapeCoords = [];
      for (let i = 0; i < latLngs.length; i++) {
        var coord = {
          x: latLngs[i].lng,
          y: latLngs[i].lat
        };

        shapeCoords.push(coord);
      }

      let map = this.props.map;
      
      if (event.layerType === 'rectangle' && map)
      {
        let headers = [];
        if (this.props.user)
        {
          headers["Authorization"] = "BEARER " + this.props.user.token;
        }

        this.setState({popupProps: {
          uuid: map.uuid,
          bounds: event.layer.getBounds(),
          timestamp: this.props.timestampRange.end,
          header: headers
        }});

        let form = document.getElementById('formDiv');
        form.classList.add('block');
      }

      this.props.onShapeDrawn(shapeCoords);
    }.bind(this);
  }

  renderTileLayers = () => {
    let controlOverlays = [];

    let map = this.props.map;
    let timestampRange = this.props.timestampRange;

    if (!map || !timestampRange || !this.state.preparedtileLayers) {
      return null;
    }

    for (let i = 0; i < tileLayerTypes.length; i++) {
      let tileLayerType = tileLayerTypes[i];

      let tileLayersOfTypes = this.state.preparedtileLayers.find(x => x.type === tileLayerType.name);

      if (!tileLayersOfTypes) {
        continue;
      }

      let timestampStart = tileLayerType.stacking ? timestampRange.start : timestampRange.end;

      let layerElements = [];

      tileLayersOfTypes.layers.forEach(layer => {
        let layerName = layer.name;

        for (let j = timestampStart; j <= timestampRange.end; j++) {

          let timestampNumber = map.timestamps[j].timestampNumber;
          let timestampElement = layer.timestampElements.find(x => x.timestampNumber === timestampNumber);

          if (!timestampElement) {
            continue;
          }

          layerElements.push(timestampElement.element);
        }

        controlOverlays.push(
          <LayersControl.Overlay name={layerName} key={map.name + layerName} checked={this.state.checkedLayers.includes(layerName)}>
            <LayerGroup name={layerName} key={layerName}>
              {layerElements}
            </LayerGroup>
          </LayersControl.Overlay>
        );
      })
    }

    return controlOverlays;
  }

  createGeojsonLayerControl = () => {
    let map = this.props.map;
    let layers = [];

    if (!map) {
      return null;
    }

    let layerGeoJsons = this.state.layerGeoJsons;

    for (let i = 0; i < layerGeoJsons.length; i++)
    {
      let geoJson;
      if (layerGeoJsons[i].count <= maxPolygon && layerGeoJsons[i].type)
      {
        geoJson = 
          <GeoJSON
            data={layerGeoJsons[i]}
            onEachFeature={this.onEachFeature}
            style={{color: '#' + layerGeoJsons[i].color, weight: 1}}
            key={randomKey}
            zIndex={1000}
          />
      }

      let checked = this.state.checkedLayers.includes(layerGeoJsons[i].name);

      let r = Math.random();
      let layer = (
        <LayersControl.Overlay
          key={r}
          name={layerGeoJsons[i].name}
          checked={checked}
        >
          <LayerGroup name={layerGeoJsons[i].name} key={i}>
            {geoJson}
          </LayerGroup>
        </LayersControl.Overlay> 
      ); 

      layers.push(layer);
    }

    if (layers.length > 0)
    {
      return (<LayersControl position="topright">{layers}</LayersControl>);
    }
    else
    {
      return null;
    }
  }

  legendLoop = (type) => {
    let map = this.props.map;
    let legend = [];
    let timestamp = this.props.timestampRange

    let type2 = '';
    let name = '';
    if(type === 'polygon')
    {
      type = 'polygonLayers';
      type2 = 'layers';
    }
    else
    {
      type2 = type;
      name = type[0].toUpperCase() + type.substr(1);;
    }

    if (type && map[type] !== undefined)
    {
      if (map[type].length > 0)
      {
        if(name !== '')
        {
          legend.push(<h2 key={type + 'Header'}>{name}</h2>);
        } 

        for (let i = 0; i < map[type].length; i++)
        {
          if(map[type][i].timestampNumber === timestamp.end)
          {
            if (map[type][i][type2])
            {
              for (let j = 0; j < map[type][i][type2].length; j++)
              {
                if (map[type][i][type2][j].name !== 'no class' && map[type][i][type2][j].name !== 'blanc' && map[type][i][type2][j].name !== 'mask')
                {
                  let count;
                  if (this.state.checkedLayers.includes(map[type][i][type2][j].name))
                  {
                    if(this.state.polygonCounts[map[type][i][type2][j].name] > maxPolygon)
                    {
                      count = <span> {' on screen: '} <span style={{color: 'red'}}>{this.state.polygonCounts[map[type][i][type2][j].name]}</span></span>;
                    }
                    else
                    {  
                      count = ' on screen: ' + this.state.polygonCounts[map[type][i][type2][j].name];
                    }
                  }

                  let style = {background: '#'+map[type][i][type2][j].color};

                  if(typeof(count) !== 'undefined' && this.state.checkedLayers.includes(map[type][i][type2][j].name))
                  {
                    count = <span className='onScreenCount' key={'count' + type + i + '.' + j}>{count}</span>;
                  }

                  legend.push(<p key={type + i + '.' + j}><i key={i} style={style}></i>{map[type][i][type2][j].name}{count}</p>);
                  
                }
              }
            }
            break;
          }
        }
      }
    }
    return legend;
  }

  getLegend = (onType = 'rest') => {
    let map = this.props.map;
    let legend = [];
    let timestamp = this.props.timestampRange

    if (!map || !timestamp) {
      return null;
    }

    //Classes
    if (map.classes.length > 0 || map.spectral.length > 0)
    {
      legend.push(<h1 key='tileLayerHeader'>Tile Layers</h1>);
      legend.push(this.legendLoop('classes'));
    }

    
    //Polygon Layers
    if (map.polygonLayers.length > 0)
    {
      legend.push(<h1 key='PolygonLayerHeader'>Polygon Layers</h1>);
      legend.push(this.legendLoop('polygon'));
      legend.push(<p key="maxPolygon" className="maxPolygon">Max polygons per layer: {maxPolygon}</p>);
    }

    console.log(onType);

    if (onType === 'onAdd' || onType === 'onRemove' || onType === 'onMove')
    {
      this.setState({legend: legend});
    }
  }

  onEachFeature = (feature, layer) => {
    if (feature.properties) {
      let popupContent = '';

      for (let property in feature.properties) {
        if (feature.properties.hasOwnProperty(property)) {      
          popupContent += `<span><strong>${property}</strong>: ${feature.properties[property]}<br/></span>`
        }
      }
      layer.bindPopup(popupContent);
    }
  }

  render() {
    return (
      <div className='mapContainer'>
        <Map
          center={[this.state.lat, this.state.lon]}
          zoom={this.state.zoom}
          ref={this.mapRef}
        >
          <LayersControl position="topright">
            <LayersControl.Overlay checked name="Base satellite">
              <TileLayer
                url="https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWhqaWFuZyIsImEiOiJjamhkNXU3azcwZW1oMzZvNjRrb214cDVsIn0.QZWgmabi2gRJAWr1Vr3h7w"
                attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href = "https://www.mapbox.com/" > Mapbox</a >'
                noWrap={true}
                zIndex={0}
              />
            </LayersControl.Overlay>
            { this.renderTileLayers() }
          </LayersControl>
          { this.createGeojsonLayerControl() }
          <Portal position="bottomright">
            <div className='leaflet-control-layers leaflet-control-layers-toggle legend' key={'legendContainer'}>{ this.state.legend }</div>
          </Portal>
        </Map>
        <PopupForm props={this.state.popupProps} />
      </div>
    );
  }
}

export default ViewerMap;