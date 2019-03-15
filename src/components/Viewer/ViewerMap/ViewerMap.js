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

import "./ViewerMap.css";
import PopupForm from '../../Popup-form/Popup-form';
const QueryUtil = require('../../Utilities/QueryUtil').default;

const imagesTileLayer = 'images';
const labelsTileLayer = 'labels';
const indicesTileLayer = 'indices';
//const changesTileLayer = 'changes';

const tileLayers = [ 
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
const maxPolygon = 200;

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
      popupProps: {}
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

      // this.getPolygonsJson(nextProps);
    }

  }

  prepareLayers = async (props) => {
    let map = props.map;
    if (!map || !map.tileLayers) {
      return {};
    }

    this.state.checkedLayers.length = 0;
    
    let preparedtileLayers = [];

    for (var i = 0; i < map.tileLayers.length; i++)
    {
      let timestamp = map.tileLayers[i];

      let layerTypes = [];

      for (var j = 0; j < timestamp.layers.length; j++)
      {
        let tileLayer = timestamp.layers[j];
        let url = props.apiUrl + 'tileLayer/' + map.uuid + '/' + timestamp.timestampNumber + '/' + tileLayer.name + '/{z}/{x}/{y}';

        let zIndex;
        let checked;
        let stacking;
        for (var k = 0; k < tileLayers.length; k++)
        {
          if (tileLayers[k].name === tileLayer.type)
          {
            zIndex = tileLayers[k].zIndex;
            checked = tileLayers[k].checked;
            stacking = tileLayers[k].stacking;
            break;
          }
        }

        if (checked && !this.state.checkedLayers.includes(tileLayer.name)) {
          this.state.checkedLayers.push(tileLayer.name);
        }
        
        layerTypes.push({
          layerName: tileLayer.name,
          stacking: stacking,
          checked: checked,
          layer: 
          <TileLayer
            url={url}
            tileSize={mapParams.tileSize}
            noWrap={mapParams.noWrap}
            maxZoom={mapParams.maxZoom}
            attribution={mapParams.attribution}
            format={mapParams.format}
            zIndex={zIndex + (j + 1) + map.tileLayers.length}
            key={i}
            // errorTileUrl={props.publicFilesUrl + 'images/dummy_tile.png'}
            bounds = {L.latLngBounds(L.latLng(map.yMin, map.xMin), L.latLng(map.yMax, map.xMax))}
          />
        });
      }

      preparedtileLayers.push({
        timestampNumber: timestamp.timestampNumber,
        layers: layerTypes
      });
    }

    return preparedtileLayers;
  }

  getPolygonsJson = async (props) =>
  {
    let headers = [];
    let map = props.map;
    let layerGeoJsons = [];
    let mapRef = this.mapRef.current.leafletElement;
    let screenBounds = mapRef.getBounds();
    let screenXY = 
    {
      xMin: screenBounds.getWest(),
      xMax: screenBounds.getEast(),
      yMin: screenBounds.getSouth(),
      yMax: screenBounds.getNorth()
    }
    
    if (!map) {
      return;
    }

    if (props.user) {
      headers["Authorization"] = "BEARER " + props.user.token;
    }

    for (let i = 0; i < map.polygonLayers.length; i++) {
      if(map.polygonLayers[i].timestampNumber === props.timestampRange.end)
      {
        for (let j = 0; j < map.polygonLayers[i].layers.length; j++)
        {
          let responseJson = await QueryUtil.getData(
            this.props.apiUrl + 'metadata/polygonsCount',
            {
              mapId:  map.uuid,
              timestamp: props.timestampRange.end,
              layer: map.polygonLayers[i].layers[j].name,
              xMin: screenXY.xMin,
              xMax: screenXY.xMax,
              yMin: screenXY.yMin,
              yMax: screenXY.yMax
            },
            { headers }
          );

          if(responseJson.count <= maxPolygon)
          {
            responseJson = await QueryUtil.getData(
              this.props.apiUrl + 'geometry/polygon/bounds',
              {
                mapId:  map.uuid,
                timestamp: props.timestampRange.end,
                layer: map.polygonLayers[i].layers[j].name,
                xMin: screenXY.xMin,
                xMax: screenXY.xMax,
                yMin: screenXY.yMin,
                yMax: screenXY.yMax
              },
              { headers }
            );
          }

          responseJson['name'] = map.polygonLayers[i].layers[j].name;
          responseJson['color'] = map.polygonLayers[i].layers[j].color;
          layerGeoJsons.push(responseJson);
        }
      }
    }

    this.setState({ layerGeoJsons: layerGeoJsons });
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
    if (!this.state.checkedLayers.includes(e.name)) {
      this.state.checkedLayers.push(e.name);
    }
  }

  onOverlayRemove = (e) => {
    let index = this.state.checkedLayers.indexOf(e.name);
    if (index > -1) {
      this.state.checkedLayers.splice(index, 1);
    }

    console.log(this.state.checkedLayers);
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
    this.createDrawButton(map, {rectangle: true});
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
    let tileLayers = [];

    let map = this.props.map;
    let timestampRange = this.props.timestampRange;

    if (!map || !timestampRange || !this.state.preparedtileLayers) {
      return null;
    }

    for (var i = timestampRange.start; i <= timestampRange.end; i++)
    {
      let timestamp = this.state.preparedtileLayers[i];

      for (var j = 0; j < timestamp.layers.length; j++)
      {
        let tileLayer = timestamp.layers[j];

        if (tileLayer.stacking || i === timestampRange.end)
        {

          if (!tileLayers[tileLayer.layerName])
          {
            tileLayers[tileLayer.layerName] = []
            tileLayers[tileLayer.layerName]['checked'] = tileLayer.checked;
            tileLayers[tileLayer.layerName]['key'] = tileLayer.key;
          }          

          tileLayers[tileLayer.layerName].push(tileLayer.layer);
        }
      }
    }

    for (let key in tileLayers)
    {
      let r = Math.random();
      controlOverlays.push(
        <LayersControl.Overlay name={key} key={r} checked={this.state.checkedLayers.includes(key)}>
          <LayerGroup name={key}>
            {tileLayers[key]}
          </LayerGroup>
        </LayersControl.Overlay>
      );
    }

    return controlOverlays;
  }

  createGeojsonLayerControl = () => {
    let map = this.props.map;
    let layers = [];
    let polygonCount = 0;

    if (!map) {
      return null;
    }

    let layerGeoJsons = this.state.layerGeoJsons;

    for (let i = 0; i < layerGeoJsons.length; i++)
    {
      let geoJson;
      if (layerGeoJsons[i]['count'] <= maxPolygon)
      {
        let r = Math.random();
        geoJson = 
          <GeoJSON
            data={layerGeoJsons[i]}
            onEachFeature={this.onEachFeature}
            style={{color: '#' + layerGeoJsons[i].color, weight: 1}}
            key={r}
          />
      }
      else
      {
        polygonCount += layerGeoJsons[i].count;
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

    if(polygonCount !== 0)
    {
      let bounds = L.latLngBounds(
            L.latLng(map.yMin, map.xMin),
            L.latLng(map.yMax, map.xMax)
          );

      let style = '"' +
        'background-color: #02646433; ' +
        'border-radius: 50%; ' +
        'border: 2px solid #026464;"';

      let icon = L.divIcon(
      {
        html: '<div style='+ style +'>'+
            polygonCount +
          '</div>',
        iconSize: [50, 50],
        iconAnchor: [0, 0],
        popupAnchor: [0, 0],
        className: 'polygonCircle'
      });
      
      let marker = <Marker position={bounds.getCenter()} icon={icon} style={''}/>
      layers.push(marker);
    }
    return layers;
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

  makeKey = (length) => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
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
          <LayersControl position="topright">
            { this.createGeojsonLayerControl() }
          </LayersControl>
        </Map>
        <PopupForm props={this.state.popupProps} />
      </div>
    );
  }
}

export default ViewerMap;
