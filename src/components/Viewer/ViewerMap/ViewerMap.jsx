import React, { PureComponent, createRef } from 'react';

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  Map,
  //Popup,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";


import "./ViewerMap.css";

// import PopupForm from '../../Popup-form/Popup-form';

import TileLayersControl from './Helpers/TileLayersControl';
import PolygonLayersControl from './Helpers/PolygonLayersControl';
import StandardTilesLayerControl from './Helpers/StandardTilesLayerControl';
import LegendControl from './Helpers/LegendControl';
import DrawingControl from './Helpers/DrawingControl';

const getPolygonJsonWaitTime = 1000;
const maxPolygons = 1;
const maxStandardTiles = 5000;

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

  componentDidMount = async () => {
    let map = this.mapRef.current.leafletElement;
    map.on('moveend', this.onMapMoveEnd);
    map.on('overlayadd', this.onOverlayAdd);
    map.on('overlayremove', this.onOverlayRemove);
    map.on('click', this.onClick);

    let screenBounds = map.getBounds();
    let bounds = 
    {
      xMin: screenBounds.getWest(),
      xMax: screenBounds.getEast(),
      yMin: screenBounds.getSouth(),
      yMax: screenBounds.getNorth()
    }

    TileLayersControl.initialize(this.props);
    await PolygonLayersControl.initialize(this.props, bounds, maxPolygons);
    await StandardTilesLayerControl.initialize(this.props, bounds, maxStandardTiles);

    LegendControl.initialize(this.props, maxPolygons, maxStandardTiles);
    console.log('LegendControl.initialize', this.props, maxPolygons, maxStandardTiles);
    
    DrawingControl.initialize(map, this.onShapeDrawn);
  }

  componentWillReceiveProps = async (nextProps) => {
    let differentMap = nextProps.map !== this.props.map;
    
    if (differentMap ||
        nextProps.timestampRange !== this.props.timestampRange ||
        nextProps.timestampRange.start !== this.props.timestampRange.start || 
        nextProps.timestampRange.end !== this.props.timestampRange.end) {

      if (differentMap) {
        PolygonLayersControl.clear();
        StandardTilesLayerControl.clear();

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
      } 
      
      TileLayersControl.update(nextProps);

      let map = this.mapRef.current.leafletElement;
      let screenBounds = map.getBounds();
      let bounds = 
      {
        xMin: screenBounds.getWest(),
        xMax: screenBounds.getEast(),
        yMin: screenBounds.getSouth(),
        yMax: screenBounds.getNorth()
      }

      LegendControl.update(nextProps, []);

      await PolygonLayersControl.update(nextProps, bounds);
      await StandardTilesLayerControl.update(nextProps, bounds);

    }
  }

  getPolygonsJson = async (props) =>
  {
    let map = this.mapRef.current.leafletElement;
    let screenBounds = map.getBounds();
    let bounds = 
    {
      xMin: screenBounds.getWest(),
      xMax: screenBounds.getEast(),
      yMin: screenBounds.getSouth(),
      yMax: screenBounds.getNorth()
    }


    await PolygonLayersControl.update(props, bounds);
    let polygonsInfo = PolygonLayersControl.getElement();

    await StandardTilesLayerControl.update(props, bounds);
    let standardTilesInfo = StandardTilesLayerControl.getElement();

    LegendControl.update(this.props, polygonsInfo.polygonCounts, standardTilesInfo.polygonCounts);

    this.forceUpdate();
  }

  onMapMoveEnd = (e) =>
  {
    let f = () => {
      this.getPolygonsJson(this.props);
    }

    clearTimeout(this.getPolygonJsonTimeout);
    this.getPolygonJsonTimeout = setTimeout(f.bind(this), getPolygonJsonWaitTime);
  }

  onOverlayAdd = (e) => {
    let checkedLayers = this.state.checkedLayers;
    if (!checkedLayers.includes(e.name)) {
      checkedLayers.push(e.name);
    }

    TileLayersControl.onOverlayAdd(e);
    PolygonLayersControl.onOverlayAdd(e);
    StandardTilesLayerControl.onOverlayAdd(e);
    LegendControl.onOverlayAdd(e);
    LegendControl.update(this.props, PolygonLayersControl.getElement().polygonCounts);
    LegendControl.update(this.props, StandardTilesLayerControl.getElement().polygonCounts);

    // this.setState({checkedLayers: checkedLayers});

    this.forceUpdate();
  }

  onClick = (e) => {
    this.forceUpdate();
  }

  onOverlayRemove = (e) => {
    let checkedLayers = this.state.checkedLayers;
    
    let index = checkedLayers.indexOf(e.name);
    if (index > -1) {
      checkedLayers.splice(index, 1);
    }

    TileLayersControl.onOverlayRemove(e);
    PolygonLayersControl.onOverlayRemove(e);
    StandardTilesLayerControl.onOverlayRemove(e);
    LegendControl.onOverlayRemove(e);
    LegendControl.update(this.props, PolygonLayersControl.getElement().polygonCounts);
    LegendControl.update(this.props, StandardTilesLayerControl.getElement().polygonCounts);

    this.forceUpdate();
  }

  getPopupContent = (content) => {
    this.props.infoContent(content);
  }

  onShapeDrawn = (shapeCoords) => {
    // Do something useful.
    console.log(shapeCoords);
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
            { TileLayersControl.getElement() }
          </LayersControl>

          {
            PolygonLayersControl.getElement().polygonControlOverlays ? 
              <LayersControl position="topright">
                { PolygonLayersControl.getElement().polygonControlOverlays }
              </LayersControl> :
              null
          }

          {
            StandardTilesLayerControl.getElement().polygonControlOverlays ?
              <LayersControl position="topright">
                { StandardTilesLayerControl.getElement().polygonControlOverlays }
              </LayersControl> :
              null
          }

          { LegendControl.getElement() }
          { StandardTilesLayerControl.onFeatureClick(this.props, this.getPopupContent) }
        </Map>
        {/* <PopupForm props={this.state.popupProps} /> */}
      </div>
    );
  }
}

export default ViewerMap;