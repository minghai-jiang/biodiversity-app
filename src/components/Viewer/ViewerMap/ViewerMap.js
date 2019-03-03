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
  Polygon
} from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";

const imagesWmsLayerType = 'images';
const labelsWmsLayerType = 'labels';
const indicesWmsLayerType = 'indices';
const changesWmsLayerType = 'changes';

const wmsLayerTypes = [ 
  {
    name: imagesWmsLayerType, 
    checked: true,
    stacking: true,
    zIndex: 100
  },
  {
    name: labelsWmsLayerType, 
    checked: true,
    stacking: false,
    zIndex: 200,
  },
  {
    name: indicesWmsLayerType, 
    checked: false,
    stacking: false,
    zIndex: 300
  },
  {
    name: changesWmsLayerType,
    checked: false,
    stacking: true,
    zIndex: 400
  }
];

const getPolygonJsonWaitTime = 1000;

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

      preparedWmsLayerTypes: null,
      checkedLayers: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.map !== this.props.map || 
      nextProps.timestampRange !== this.props.timestampRange ||
      nextProps.timestampRange.start !== this.props.timestampRange.start || 
      nextProps.timestampRange.end !== this.props.timestampRange.end) {

      let layerGeoJsons = [];

      if (nextProps.map.polygonLayers) {
        for (let i = 0; i < nextProps.map.polygonLayers.length; i++) {
          layerGeoJsons.push({
            name: nextProps.map.polygonLayers[i].name
          })
        }
        this.getPolygonsJson(nextProps);
      }

      let layers = this.prepareLayers(nextProps);

      this.setState({ layerGeoJsons: layerGeoJsons, preparedWmsLayerTypes: layers });
    }
  }

  prepareLayers = (props) => {
    let map = props.map;
    if (!map || !map.wmsLayerTypes) {
      return {};
    }

    let preparedWmsLayerTypes = [];

    for (let x = 0; x < wmsLayerTypes.length; x++) {
      let wmsLayerType = wmsLayerTypes[x];

      let mapWmsLayerType = map.wmsLayerTypes.find(l => l.name === wmsLayerType.name);

      if (!mapWmsLayerType) {
        continue;
      }

      let typeWmsLayers = [];

      for (let i = 0; i< mapWmsLayerType.layers.length; i++) {
        let wmsLayerName = mapWmsLayerType.layers[i];

        let timestampWmsElements = [];
        for (let y = 0; y < map.timestamps.length; y++) 
        {
          let timestamp = map.timestamps[y];
          let timestampNumber = timestamp.number;

          let url = `${this.props.apiUrl}wms/${map.id}/${timestampNumber}/${wmsLayerType.name}/${wmsLayerName}/{z}/{x}/{y}`;
          timestampWmsElements.push(             
            <TileLayer
              url={url}
              tileSize={mapParams.tileSize}
              noWrap={mapParams.noWrap}
              maxZoom={mapParams.maxZoom}
              attribution={mapParams.attribution}
              format={mapParams.format}
              zIndex={wmsLayerType.zIndex + (y + 1) + timestampWmsElements.length}
              key={y}
            />
          );
        }

        typeWmsLayers.push({
          name: wmsLayerName,
          timestampElements: timestampWmsElements
        });
      }

      preparedWmsLayerTypes.push({
        name: wmsLayerType.name,
        layers: typeWmsLayers
      })
    }

    return preparedWmsLayerTypes;
  }

  getPolygonsJson = async (props) =>
  {
    let headers = {
      "Content-Type": "application/json"
    };
    if (props.user) {
      headers["Authorization"] = "BEARER " + props.user.token;
    }

    let bounds = this.mapRef.current.leafletElement.getBounds();
    let x1 = bounds.getWest();
    let x2 = bounds.getEast();
    let y1 = bounds.getSouth();
    let y2 = bounds.getNorth();

    let map = props.map;

    if (!map) {
      return;
    }

    let polygonLayers = map.polygonLayers;

    if (!polygonLayers) {
      return;
    }

    let timestamp = props.map.timestamps[props.timestampRange.end];
    let requestArgs = {
      mapId: props.map.id,
      timestampNumber: timestamp.number,
      x1: x1,
      x2: x2,
      y1: y1,
      y2: y2
    };

    let promises = [];
    let layerGeoJsons = [];

    for (let i = 0; i < polygonLayers.length; i++) {
      let polygonLayer = polygonLayers[i];
      let layerName = polygonLayer.name;

      requestArgs.layer = layerName;
      let promise = fetch(`${props.apiUrl}utilities/getPolygonsJsonBounds`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestArgs)
        });

      promises.push(promise);
    }

    for (let i = 0; i < polygonLayers.length; i++) {
      let polygonLayer = polygonLayers[i];
      let layerName = polygonLayer.name;

      requestArgs.layer = layerName;

      try
      {
        let response = await promises[i];

        if (!response.ok) {
          continue;
        }

        let json = await response.json();
        console.log(layerName + ' count: ' + json.count);
        
        if (!json.features) {
          continue;
        }

        layerGeoJsons.push({
          name: layerName,
          geoJson: json
        });
      }
      catch (error) {
        alert(error);
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
    
    console.log(this.state.checkedLayers);
  }

  onOverlayRemove = (e) => {
    let index = this.state.checkedLayers.indexOf(e.name);
    if (index > -1) {
      this.state.checkedLayers.splice(index, 1);
    }

    console.log(this.state.checkedLayers);
  }

  componentDidMount = () => {
    let map = this.mapRef.current.leafletElement;
    map.on('moveend', this.onMapMoveEnd);
    map.on('overlayadd', this.onOverlayAdd);
    map.on('overlayremove', this.onOverlayRemove);
    
    //Draw items
    var drawnItems = new L.featureGroup();
    map.addLayer(drawnItems);
    var drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false
        },
        rectangle: true,
        marker: false,
        polyline: false,
        circle: false,
        circlemarker: false
      },
      edit: false
    });
    map.addControl(drawControl);
    map.on(L.Draw.Event.CREATED, this.onShapeDrawnClosure(drawnItems));
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

      this.props.onShapeDrawn(shapeCoords);
    }.bind(this);
  }

  renderWmsLayers = () => {
    var controlOverlays = [];

    let map = this.props.map;
    let timestampRange = this.props.timestampRange;

    if (!map || !timestampRange || !this.state.preparedWmsLayerTypes) {
      return null;
    }

    for (let x = 0; x < wmsLayerTypes.length; x++) {
      let wmsLayerType = wmsLayerTypes[x];

      let preparedWmsLayerType = this.state.preparedWmsLayerTypes.find(l => l.name === wmsLayerType.name);

      if (!preparedWmsLayerType) {
        continue;
      }

      for (let i = 0; i < preparedWmsLayerType.layers.length; i++) {
        let wmsLayer = preparedWmsLayerType.layers[i];

        let layerElements = [];
        if (wmsLayerType.stacking) {
          layerElements = wmsLayer.timestampElements.slice(timestampRange.start, timestampRange.end + 1);
        }
        else {
          layerElements = [wmsLayer.timestampElements[timestampRange.end]];
        }

        controlOverlays.push(
          <LayersControl.Overlay name={wmsLayer.name} key={wmsLayer.name + i} checked={wmsLayerType.checked}>
            <LayerGroup name={wmsLayer.name}>
              {layerElements}
            </LayerGroup>              
          </LayersControl.Overlay>
        );
      }
    }
    
    return controlOverlays;
  }

  createGeojson = () => {
    let map = this.props.map;
    let timestampRange = this.props.timestampRange;

    if (!map || !timestampRange || !map.polygonLayers) {
      return null;
    }

    let layerGeoJsons = this.state.layerGeoJsons;

    var layers = [];

    for (let i = 0; i < map.polygonLayers.length; i++) {
      let polygonLayer = map.polygonLayers[i];

      let polygonsJsonContainer = layerGeoJsons.find(x => x.name === polygonLayer.name);
      let polygonsJson = null;
      if (polygonsJsonContainer) {
        polygonsJson = polygonsJsonContainer.geoJson;
      }

      let layer = (
        <LayersControl.Overlay key={this.makeKey(10)} name={polygonLayer.name} checked={this.state.checkedLayers.includes(polygonLayer.name)}>
          <GeoJSON data={polygonsJson} onEachFeature={this.onEachFeature} style={{color: '#0000ff', weight: 5, opacity: 0.65}}/>
        </LayersControl.Overlay> 
      ) 

      layers.push(layer);
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
      <Map
        center={[this.state.lat, this.state.lon]}
        zoom={this.state.zoom}
        style={{ height: "92.4vh" }}  
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
          {this.renderWmsLayers()}
        </LayersControl>
        <LayersControl position="topright">
          {this.createGeojson()}
        </LayersControl>
      </Map>
    );
  }
}

export default ViewerMap;
