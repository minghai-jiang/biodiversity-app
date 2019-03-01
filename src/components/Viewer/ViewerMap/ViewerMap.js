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

const imagesLayerType = 'images';
const labelsLayerType = 'labels';
const indicesLayerType = 'indices';
const changesLayerType = 'changes';

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
      layerGeoJsons: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.map || !nextProps.timestampRange) {
      return;
    }

    if (nextProps.map !== this.props.map || nextProps.timestampRange !== this.props.timestampRange ||
      nextProps.timestampRange.start !== this.props.timestampRange.start || 
      nextProps.timestampRange.end !== this.props.timestampRange.end) {
        
      this.getPolygonsJson(nextProps);
    }
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
        
        if (!json.features) {
          console.log(layerName + ' status: ' + json.status);
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
    this.getShapeJsonTimeout = setTimeout(f.bind(this), 2000);
  }

  componentDidMount = () => {
    let map = this.mapRef.current.leafletElement;
    map.on('moveend', this.onMapMoveEnd);
    
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

  createLayers = (layerType, stacking, checked, zIndex) => {
    var layers = [];

    let map = this.props.map;
    let timestampRange = this.props.timestampRange;

    if (map && timestampRange) {
      let timestampStart = stacking ? timestampRange.start : timestampRange.end;

      if (map.layerTypes.includes(layerType)) {
        let typeLayers = map.layers[layerType];
  
        for (let i = 0; i < typeLayers.length; i++) {
          let layerName = typeLayers[i].name;
          let zIndexOffset = i * (timestampRange.end - timestampStart);
          
          let timestampLayers = [];
          for (let y = timestampStart; y <= timestampRange.end; y++) 
          {
            let url = `${this.props.apiUrl}wms/${map.id}/${y}/${layerType}/${layerName}/{z}/{x}/{y}`;
            timestampLayers.push(             
              <TileLayer
                url={url}
                tileSize={mapParams.tileSize}
                noWrap={mapParams.noWrap}
                maxZoom={mapParams.maxZoom}
                attribution={mapParams.attribution}
                format={mapParams.format}
                zIndex={zIndex + zIndexOffset + timestampLayers.length}
                key={y}
              />
            );
          }

          layers.push(
            <LayersControl.Overlay checked name={layerName} key={i} checked={checked}>
              <LayerGroup name={layerName}>
                {timestampLayers}
              </LayerGroup>              
            </LayersControl.Overlay>
          );
        }
      }
      return layers;
    }  
  }

  createGeojson = () => {
    let map = this.props.map;
    let timestampRange = this.props.timestampRange;

    if (!map || !timestampRange || !map.polygonLayers) {
      return null;
    }

    let layerGeoJsons = this.state.layerGeoJsons;

    var layers = [];
    //var popups = [];

    for (let i = 0; i < map.polygonLayers.length; i++) {
      // debugger;
      let polygonLayer = map.polygonLayers[i];

      let polygonsJsonContainer = layerGeoJsons.find(x => x.name === polygonLayer.name);
      let polygonsJson = null;
      if (polygonsJsonContainer) {
        polygonsJson = polygonsJsonContainer.geoJson;
        // debugger;
      }   

      let polygons = [];
      if (polygonsJson) {
        for (let i = 0; i < polygonsJson.features.length; i++)
        {
          let propertiesArray = [];
  
          if (polygonsJson.features[i].properties)
          {
            let properties = polygonsJson.features[i].properties
            for (let key in properties)
            {
              propertiesArray.push(
                <span key={i+key}>
                  <strong>{key}</strong>: {polygonsJson.features[i].properties[key]}
                  <br/>
                </span>);
            }
          }
  
          //popups.push(<Popup key={i}>{propertiesArray}</Popup>);
          polygons.push(
            <Polygon key={'s'+i} positions={polygonsJson.features[i].geometry.coordinates}>
              <Popup key={i}>{propertiesArray}</Popup>
            </Polygon>
          );
        } 
      }

      let layer = (
        <LayersControl.Overlay name={polygonLayer.name}>
          {/* <GeoJSON key={polygonLayer.name + i} data={polygonsJson} style={{color: '#006400', weight: 5, opacity: 0.65}}/> */}
          <FeatureGroup key='FG' color="purple">
            {polygons}
          </FeatureGroup>
        </LayersControl.Overlay> 
      ) 

      layers.push(layer);
    }

    return layers;
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
          {this.createLayers(imagesLayerType, true, true, 100)}
          {this.createLayers(labelsLayerType, false, true, 200)}
          {this.createLayers(indicesLayerType, false, false, 300)}
          {this.createLayers(changesLayerType, true, false, 400)}
        </LayersControl>
        <LayersControl position="topright">
          {this.createGeojson()}
        </LayersControl>
      </Map>
    );
  }
}

export default ViewerMap;
