import React, { PureComponent, createRef } from 'react';

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  Map,
  TileLayer,
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
  mapMoveEvents = [];

  constructor(props) {
    super(props);
    this.state = {
      zoom: 3,
      lat: 40.509865,
      lon: -0.118092,
      geojson: null,
    };
  };

  getData(url)
  {
    fetch(url)
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        else {
          throw "Failed to retrieve documents.";
        }
      })
      .then(text => {

          this.setState({ geojson: JSON.parse(text) });

      })
      .catch(error => {
        alert(error);
      });
  };

  onMapMoveEnd = (e) =>
  {
    var length = 0;
    if (this.mapMoveEvents)
    {
      length = this.mapMoveEvents.length;  
    }

    this.mapMoveEvents.push(length);

    let f = function()
    {
      let new_length = this.mapMoveEvents.length;

      if (length === new_length - 1)
      {
        console.log(e.target.getBounds());
        this.mapMoveEvents = [];
        length = 0;
      }
    }

    setTimeout (f.bind(this), 250);
  }

  onFeatureGroupAdd = (e) => {

    this.mapRef.current.leafletElement.on('moveend', this.onMapMoveEnd);

  }

  onFeatureGroupRemove = (e) => {
    
    this.mapRef.current.leafletElement.off('moveend');
    this.mapMoveEvents = [];

  }

  componentDidMount = () => {
    const map = this.mapRef.current.leafletElement;
    
    //GeoJSON
    this.getData('./districts.json');

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
            timestampLayers.push(             
              <TileLayer
                url={`${this.props.apiUrl}wms/${map.id}/${y}/${layerType}/${layerName}/{z}/{x}/{y}`}
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
      var layers = [];
      //var popups = [];

      let geojson = this.state.geojson;
      if (geojson !== null)
      {
        for (let i = 0; i < geojson.features.length; i++)
        {
          let propertiesArray = [];

          if (geojson.features[i].properties)
          {
            let properties = geojson.features[i].properties
            for (let key in properties)
            {
              propertiesArray.push(<span key={i+key}><strong>{key}</strong>: {geojson.features[i].properties[key]}<br/></span>);
            }
          }

          //popups.push(<Popup key={i}>{propertiesArray}</Popup>);
          layers.push(<Polygon key={'s'+i} positions={geojson.features[i].geometry.coordinates}><Popup key={i}>{propertiesArray}</Popup></Polygon>);
        }

        return <LayersControl.Overlay name="GeoJSON"><FeatureGroup key='FG' color="purple" onAdd={this.onFeatureGroupAdd} onRemove ={this.onFeatureGroupRemove}>{layers}</FeatureGroup></LayersControl.Overlay>; 
      }
      else
      {
        return null;
      }
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
          {this.createGeojson()}
        </LayersControl>
      </Map>
    );
  }
}

export default ViewerMap;
