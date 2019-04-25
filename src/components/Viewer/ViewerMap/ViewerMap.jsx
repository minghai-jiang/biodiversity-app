import React, { PureComponent, createRef } from 'react';

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  Map,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";


import "./ViewerMap.css";

import TileLayersControl from './Helpers/TileLayersControl';
import PolygonLayersControl from './Helpers/PolygonLayersControl';
import StandardTilesLayerControl from './Helpers/StandardTilesLayerControl';
import CrowdLayersControl from './Helpers/CrowdLayersControl';
import LegendControl from './Helpers/LegendControl';
import FlyToControl from './Helpers/FlyToControl';
import DrawingControl from './Helpers/DrawingControl';

const getPolygonJsonWaitTime = 1000;
const maxPolygons = 3000;
const maxStandardTiles = 3000;

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
    PolygonLayersControl.initialize(this.props, bounds, maxPolygons, map);
    StandardTilesLayerControl.initialize(this.props, bounds, maxStandardTiles, map);
    CrowdLayersControl.initialize(this.props, bounds, maxPolygons, map);


    LegendControl.initialize(this.props, maxPolygons, maxStandardTiles);
    
    FlyToControl.initialize(this.props, map, this.flyToChecked);
    
    DrawingControl.initialize(map, this.onShapeDrawn, this.user, this.getPopupContent, this.props, this.mapRef.current.leafletElement, this.refreshMap);
  }

  componentWillUnmount = () => {
    TileLayersControl.clear();
    PolygonLayersControl.clear();
    StandardTilesLayerControl.clear();
    CrowdLayersControl.clear();
    LegendControl.clear();
    FlyToControl.clear();
  }

  componentWillReceiveProps = async (nextProps) => {
    let differentMap = nextProps.map !== this.props.map;
    
    if (differentMap ||
        nextProps.timestampRange !== this.props.timestampRange ||
        nextProps.timestampRange.start !== this.props.timestampRange.start || 
        nextProps.timestampRange.end !== this.props.timestampRange.end) {

      let boundsFlyTo;

      if (differentMap) {
        TileLayersControl.clear();
        PolygonLayersControl.clear();
        StandardTilesLayerControl.clear();
        CrowdLayersControl.clear();
        LegendControl.clear();
        FlyToControl.clear();

        let bounds = L.latLngBounds(L.latLng(nextProps.map.yMin, nextProps.map.xMin), L.latLng(nextProps.map.yMax, nextProps.map.xMax));
        boundsFlyTo = bounds;
      
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
      else
      {
        let bounds = L.latLngBounds(L.latLng(this.props.map.yMin, this.props.map.xMin), L.latLng(this.props.map.yMax, this.props.map.xMax));
        boundsFlyTo = bounds;
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

      LegendControl.update(nextProps, [], []);
      FlyToControl.update(nextProps, map, boundsFlyTo.getCenter(), this.flyToChecked);
      DrawingControl.update(this.props.user, this.props);

      await PolygonLayersControl.update(nextProps, bounds);
      await StandardTilesLayerControl.update(nextProps, bounds);
      await CrowdLayersControl.update(nextProps, bounds, this.refreshMap);
    }
  }

  getPolygonsJson = async (props, type = 'all') =>
  {
    if(!this.mapRef || !this.mapRef.current)
    {
      return null;
    }
    let map = this.mapRef.current.leafletElement;
    let screenBounds = map.getBounds();
    let bounds = 
    {
      xMin: screenBounds.getWest(),
      xMax: screenBounds.getEast(),
      yMin: screenBounds.getSouth(),
      yMax: screenBounds.getNorth()
    }

    if (type === 'all')
    {
      await PolygonLayersControl.update(props, bounds);
      let polygonsInfo = PolygonLayersControl.getElement();

      await StandardTilesLayerControl.update(props, bounds);
      let standardTilesInfo = StandardTilesLayerControl.getElement();

      await CrowdLayersControl.update(props, bounds, this.refreshMap);
      let crowdInfo = CrowdLayersControl.getElement();
      
      LegendControl.update(this.props, polygonsInfo.polygonCounts, standardTilesInfo.polygonCounts);
      DrawingControl.update(this.props.user, this.props);
    }

    if (type = 'customPolygon')
    {
      await CrowdLayersControl.update(props, bounds, this.refreshMap);
      let crowdInfo = CrowdLayersControl.getElement();
    }


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
    CrowdLayersControl.onOverlayAdd(e);
    LegendControl.onOverlayAdd(e);
    LegendControl.update(this.props, PolygonLayersControl.getElement().polygonCounts, StandardTilesLayerControl.getElement().polygonCounts);
    DrawingControl.update(this.props.user, this.props);

    // this.setState({checkedLayers: checkedLayers});

    this.forceUpdate();
  }

  refreshMap = (type) => {
    this.forceUpdate();
    this.getPolygonsJson(this.props, type);
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
    CrowdLayersControl.onOverlayRemove(e);
    LegendControl.onOverlayRemove(e);
    LegendControl.update(this.props, PolygonLayersControl.getElement().polygonCounts, StandardTilesLayerControl.getElement().polygonCounts);

    this.forceUpdate();
  }

  checkLayer = (layer) => 
  {
    CrowdLayersControl.onOverlayAdd({name: layer});
  }

  getPopupContent = (content) => {
    content.checkLayer = this.checkLayer;
    this.props.infoContent(content);
  }

  onShapeDrawn = (shapeCoords) => {
    // Do something useful.
    //console.log(shapeCoords);
  }

  flyToChecked = (value) => {
    if (value.type === 'polygons')
    {
      PolygonLayersControl.onOverlayAdd(value, this.refreshMap);
    }
    else
    {
      StandardTilesLayerControl.onOverlayAdd(value, this.refreshMap);
    }
  }

  render() {
    return (
      <div className='mapContainer'>
        <Map
          center={[this.state.lat, this.state.lon]}
          zoom={this.state.zoom}
          ref={this.mapRef}
          maxZoom={18}
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

          {
            CrowdLayersControl.getElement().polygonControlOverlays ? 
              <LayersControl position="topright">
                { CrowdLayersControl.getElement().polygonControlOverlays }
              </LayersControl> :
              null
          }

          { LegendControl.getElement() }
          { FlyToControl.getElement() }
          { PolygonLayersControl.onFeatureClick(this.props, this.getPopupContent) }
          { StandardTilesLayerControl.onFeatureClick(this.props, this.getPopupContent) }
          { CrowdLayersControl.onFeatureClick(this.props, this.getPopupContent) }
          { DrawingControl.onFeatureClick() }
        </Map>
        {/* <PopupForm props={this.state.popupProps} /> */}
      </div>
    );
  }
}

export default ViewerMap;