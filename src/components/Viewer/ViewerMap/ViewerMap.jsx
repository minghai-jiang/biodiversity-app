import React, { PureComponent, createRef } from 'react';
import { isMobile } from 'react-device-detect';

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  Map,
  LayersControl,
  Marker,
  Popup
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
import GeoMessageFeed from './Helpers/GeoMessageFeed';
import DrawingControl from './Helpers/DrawingControl';

const getPolygonJsonWaitTime = 1000;
const maxPolygons = isMobile ? 500 : 3000;
const maxStandardTiles = isMobile ? 500 : 3000;

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export class ViewerMap extends PureComponent {
  mapRef = createRef();
  getPolygonJsonTimeout = null;

  lastGeoLocationUpdate = null;
  geolocation = null;

  maxZoom = 19;

  lastBounds = null;

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

    this.maxZoom = 19;
  }

  setLocation = (position) => {
    this.geolocation = [position.coords.latitude, position.coords.longitude];
    this.forceUpdate();
    setTimeout(() => {
      navigator.geolocation.getCurrentPosition(this.setLocation, null, { enableHighAccuracy: true });
      }, 
      1000 * 60
    );
  }

  componentDidMount = async () => {
    let map = this.mapRef.current.leafletElement;
    map.on('moveend', this.onMapMoveEnd);
    map.on('overlayadd', this.onOverlayAdd);
    map.on('overlayremove', this.onOverlayRemove);
    // map.on('click', this.onClick);

    let screenBounds = map.getBounds();
    let bounds = 
    {
      xMin: screenBounds.getWest(),
      xMax: screenBounds.getEast(),
      yMin: screenBounds.getSouth(),
      yMax: screenBounds.getNorth()
    }

    TileLayersControl.initialize(this.props);
    PolygonLayersControl.initialize(this.props, bounds, maxPolygons, map, this.onClick);
    StandardTilesLayerControl.initialize(this.props, bounds, maxStandardTiles, map, this.onClick);
    CrowdLayersControl.initialize(this.props, bounds, maxPolygons, map, this.refreshMap, this.onClick);

    LegendControl.initialize(this.props, maxPolygons, maxStandardTiles);    
    FlyToControl.initialize(this.props, map, this.flyToChecked);
    GeoMessageFeed.initialize(this.props, map, this.flyToChecked, this.props.infoContent);
    DrawingControl.initialize(map, this.onShapeDrawn, this.user, this.getPopupContent, this.props, this.mapRef.current.leafletElement, this.refreshMap);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setLocation.bind(this), null, { enableHighAccuracy: true });



      // navigator.geolocation.watchPosition((position) => {

      //   let currentTime = (new Date).getTime();

      //   if (!this.lastGeoLocationUpdate || this.lastGeoLocationUpdate + (1000 * 20) > currentTime) {
      //     console.log('Updating');
      //     this.lastGeoLocationUpdate = currentTime;
      //     this.forceUpdate();
      //   }

      // }, (err) => {  }, { enableHighAccuracy: true });
    }
  }

  componentWillUnmount = () => {
    TileLayersControl.clear();
    PolygonLayersControl.clear();
    StandardTilesLayerControl.clear();
    CrowdLayersControl.clear();
    LegendControl.clear();
    FlyToControl.clear();
    GeoMessageFeed.clear();
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
        GeoMessageFeed.clear();

        let limitZoom = TileLayersControl.update(nextProps);
        if (limitZoom) {
          this.maxZoom = nextProps.map.zoom;
        }
        else {
          this.maxZoom = 19;
        }
  
        this.mapRef.current.leafletElement.setMaxZoom(this.maxZoom);

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

      let map = this.mapRef.current.leafletElement;
      let screenBounds = map.getBounds();
      let bounds = 
      {
        xMin: screenBounds.getWest(),
        xMax: screenBounds.getEast(),
        yMin: screenBounds.getSouth(),
        yMax: screenBounds.getNorth()
      }

      if (!differentMap) {
        let limitZoom = TileLayersControl.update(nextProps);
        if (limitZoom) {
          this.maxZoom = nextProps.map.zoom;
        }
        else {
          this.maxZoom = 19;
        }
      }

      LegendControl.update(nextProps, [], []);
      FlyToControl.update(nextProps, map, boundsFlyTo.getCenter(), this.flyToChecked);
      GeoMessageFeed.update(nextProps, map, this.flyToChecked, this.props.infoContent);
      DrawingControl.update(this.props.user, this.props);

      let tilePromise = StandardTilesLayerControl.update(nextProps, bounds);
      let polygonPromise = PolygonLayersControl.update(nextProps, bounds);
      let customPolygonPromise = CrowdLayersControl.update(nextProps, bounds, this.refreshMap);

      await tilePromise;
      await polygonPromise;
      await customPolygonPromise;
    }
  }

  getPolygonsJson = async (props, type = 'all') =>
  {
    if (!this.mapRef || !this.mapRef.current)
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

    GeoMessageFeed.update(props, map, this.flyToChecked, this.props.infoContent);
    GeoMessageFeed.getElement();

    if (type === 'all')
    {
      let tilePromise = StandardTilesLayerControl.update(props, bounds);
      let polygonPromise = PolygonLayersControl.update(props, bounds);
      let customPolygonPromise = CrowdLayersControl.update(props, bounds, this.refreshMap);

      await tilePromise;
      await polygonPromise;
      await customPolygonPromise;

      let standardTilesInfo = StandardTilesLayerControl.getElement();
      let polygonsInfo = PolygonLayersControl.getElement();
      
      LegendControl.update(this.props, polygonsInfo.polygonCounts, standardTilesInfo.polygonCounts);
      DrawingControl.update(this.props.user, this.props);
    }

    if (type === 'customPolygon')
    {
      await CrowdLayersControl.update(props, bounds, this.refreshMap);
    }


    this.forceUpdate();
  }

  onMapMoveEnd = (e) =>
  {
    // let map = this.mapRef.current.leafletElement;
    // let screenBounds = map.getBounds();

    // let bounds = 
    // {
    //   xMin: screenBounds.getWest(),
    //   xMax: screenBounds.getEast(),
    //   yMin: screenBounds.getSouth(),
    //   yMax: screenBounds.getNorth()
    // }

    let f = () => {
      this.getPolygonsJson(this.props);
    }

    // if (this.lastBounds 
    //   && Math.abs(this.lastBounds.xMin - bounds.xMin) < 0.01
    //   && Math.abs(this.lastBounds.xMax - bounds.xMax) < 0.01
    //   && Math.abs(this.lastBounds.yMin - bounds.yMin) < 0.01
    //   && Math.abs(this.lastBounds.yMax - bounds.yMax) < 0.01) {
    //   // console.log('Ignoring move end.');
    //   return;
    // }

    // // console.log('Executing move end.');

    // this.lastBounds = bounds;

    clearTimeout(this.getPolygonJsonTimeout);
    this.getPolygonJsonTimeout = setTimeout(f.bind(this), getPolygonJsonWaitTime);
  }

  onOverlayAdd = (e) => {
    let checkedLayers = this.state.checkedLayers;
    if (!checkedLayers.includes(e.name)) {
      checkedLayers.push(e.name);
    }

    this.mapRef.current.leafletElement.closePopup();

    let limitZoom = TileLayersControl.onOverlayAdd(e);
    if (limitZoom) {
      this.maxZoom = this.props.map.zoom;
      this.mapRef.current.leafletElement.setMaxZoom(this.maxZoom);
    }

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
    //this.forceUpdate();
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

    let limitZoom = TileLayersControl.onOverlayRemove(e);
    if (!limitZoom) {
      this.maxZoom = 19;
      if (this.mapRef.current) {
        this.mapRef.current.leafletElement.setMaxZoom(this.maxZoom);
      }
    }

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
    else if(value.type === 'tiles')
    {
      StandardTilesLayerControl.onOverlayAdd(value, this.refreshMap);
    }
    else
    {
      CrowdLayersControl.onOverlayAdd(value, this.refreshMap);
    }
  }

  render() {
    return (
      <div className='mapContainer'>
        <Map
          center={[this.state.lat, this.state.lon]}
          zoom={this.state.zoom}
          ref={this.mapRef}
          maxZoom={this.maxZoom}
          zoomSnap={0.25}
        >
          <LayersControl position="topright">
            { TileLayersControl.getElement() }
          </LayersControl>
          <LayersControl position="topright">
            { StandardTilesLayerControl.getElement().polygonControlOverlays }
          </LayersControl>
          <LayersControl position="topright">
            { PolygonLayersControl.getElement().polygonControlOverlays }
          </LayersControl>
          <LayersControl position="topright" className='layers-icon'>
            { CrowdLayersControl.getElement().polygonControlOverlays }
          </LayersControl>

          { LegendControl.getElement() }
          { FlyToControl.getElement() }
          { GeoMessageFeed.getElement() }
          { PolygonLayersControl.onFeatureClick(this.props, this.getPopupContent) }
          { StandardTilesLayerControl.onFeatureClick(this.props, this.getPopupContent) }
          { CrowdLayersControl.onFeatureClick(this.props, this.getPopupContent) }
          { DrawingControl.onFeatureClick() }
          {
            this.geolocation ?
              <Marker position={this.geolocation}>
                <Popup>You are here</Popup>
              </Marker> :
              null
          }
  
        </Map>
      </div>
    );
  }
}

export default ViewerMap;