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
const maxPolygon = 200;

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
              key={j}
              errorTileUrl={props.publicFilesUrl + 'images/dummy_tile.png'}
              // bounds = {L.latLngBounds(L.latLng(map.yMin, map.xMin), L.latLng(map.yMax, map.xMax))}
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

    for (let i = 0; i < geoJsonPromises.length; i++) {
      let layerGeoJson = await geoJsonPromises[i];
      layerGeoJsons.push(layerGeoJson);
    }

    randomKey = Math.random();

    this.setState({ layerGeoJsons: layerGeoJsons });
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

    if (polygonIdResult.ids)
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

      return polygonsGeoJson;
    }
    else {
      return {
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
    if (!this.state.checkedLayers.includes(e.name)) {
      this.state.checkedLayers.push(e.name);
    }
  }

  onOverlayRemove = (e) => {
    let index = this.state.checkedLayers.indexOf(e.name);
    if (index > -1) {
      this.state.checkedLayers.splice(index, 1);
    }
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
            <LayerGroup name={layerName}>
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
    let polygonCount = 0;

    if (!map) {
      return null;
    }

    let layerGeoJsons = this.state.layerGeoJsons;

    for (let i = 0; i < layerGeoJsons.length; i++)
    {
      let geoJson;
      if (layerGeoJsons[i].count <= maxPolygon)
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
      
      let marker = <Marker position={bounds.getCenter()} icon={icon} style={''} zIndex={2000}/>
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
