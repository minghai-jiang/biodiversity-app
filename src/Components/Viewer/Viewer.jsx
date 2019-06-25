import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';

import { Map, Marker, GeoJSON } from 'react-leaflet';
import 'leaflet-draw';
import L from 'leaflet';

import ApiManager from '../../ApiManager';

import Utility from '../../Utility';
import ViewerUtility from './ViewerUtility';

import TimestampSelector from './TimestampSelector/TimestampSelector';

import ControlsPane from './ControlsPane/ControlsPane';
import DataPane from './DataPane/DataPane';
import SelectionPane from './SelectionPane/SelectionPane';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import './Viewer.css';

// This block is purely to get the marker icon of Leaflet to work.
// Taken somewhere from the web.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const MAP_PANE_NAME = 'map_pane';
const CONTROL_PANE_NAME = 'control_pane';
const DATA_PANE_NAME = 'data_pane';

const DEFAULT_VIEWPORT = {
  center: [40.509865, -0.118092],
  zoom: 2
}

class Viewer extends PureComponent {

  controlsPane = null;
  leafletMap = null;
  setNewViewportTimer = null;
  drawnPolygonGeoJson = null;

  flyToInfo = null;

  constructor(props, context) {
    super(props, context);

    this.leafletMap = React.createRef();
    this.controlsPane = React.createRef();

    this.state = {
      leafletMapViewport: DEFAULT_VIEWPORT,
      isSmallWindow: isMobile,

      panes: isMobile ? [MAP_PANE_NAME] : [CONTROL_PANE_NAME, MAP_PANE_NAME],

      map: null,
      timestampRange: {
        start: 0,
        end: 0
      },

      leafletLayers: [],
      selectedElement: null,

      geolocation: null,
    };
  }

  initializeDrawingControl = () => {
    let map = this.leafletMap.current.leafletElement;
  
    let drawControl = new L.Control.Draw({
      draw: {
        polygon: true,
        rectangle: false,
        marker: false,
        polyline: false,
        circle: false,
        circlemarker: false
      },
      edit: false
    });
    
    map.addControl(drawControl);
    map.on(L.Draw.Event.CREATED, this.onShapeDrawnClosure);

  }

  onShapeDrawnClosure = (e) => {
    let layer = e.layer;
    
    let geoJson = layer.toGeoJSON();
    geoJson.geometry.type = 'MultiPolygon';
    geoJson.geometry.coordinates = [geoJson.geometry.coordinates];
    geoJson.properties.id = Math.random();

    let selectDrawnPolygon = () => {
      if (!this.state.map) {
        return;
      }

      this.selectFeature(ViewerUtility.drawnPolygonlayerType, geoJson, true);    
    }

    let drawnPolygonLayer = (
      <GeoJSON
        key={Math.random()}
        data={geoJson}
        style={'#00ffff'}
        zIndex={ViewerUtility.drawnPolygonLayerZIndex}
        onEachFeature={(_, layer) => layer.on({ click: selectDrawnPolygon })}
      />
    );

    let allLayers = [...this.state.leafletLayers, this.state.selectedElementLayer, drawnPolygonLayer];

    this.drawnPolygonGeoJson = geoJson;
    this.setState({ allLayers: allLayers, drawnPolygonLayer: drawnPolygonLayer }, () => {
      selectDrawnPolygon();
    });
    
  }  

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      this.setLocation, 
      () => this.setLocation(null), 
      { enableHighAccuracy: true }
    );

    this.onLeafletMapViewportChanged(DEFAULT_VIEWPORT);

    if (!isMobile) {
      window.addEventListener('resize', this.onWindowResize);  
      this.onWindowResize(null, () => {
        if (this.state.isSmallWindow) {
          this.setState({ panes: [MAP_PANE_NAME] }, () => this.leafletMap.current.leafletElement.invalidateSize());
        }
      });
    }

    this.initializeDrawingControl();
  }

  setLocation = (position) => {
    if (position) {      
      if (!this.state.geolocation || this.state.geolocation.latitude !== position.latitude || 
        this.state.geolocation.longitude !== position.longitude) {
          let newGeolocation = [position.coords.latitude, position.coords.longitude];
          this.setState({ geolocation: newGeolocation });
      }
    }

    setTimeout(() => {
        navigator.geolocation.getCurrentPosition(
          this.setLocation, 
          () => this.setLocation(null), 
          { enableHighAccuracy: true }
        );
      }, 
      1000 * 10
    );
  }

  onWindowResize = (_, cb) => {
    let isSmallWindow = window.innerWidth <= 600;
    
    if (this.state.isSmallWindow !== isSmallWindow) {
      let panes = this.state.panes;
      if (isSmallWindow) {
        panes = [MAP_PANE_NAME];
      }

      this.setState({ isSmallWindow: isSmallWindow, panes: panes }, cb);
    }
    else if (cb) {
      cb();
    }
  }

  openPane = (paneName) => {
    let currentPanes = this.state.panes;

    let changed = false;

    if (!isMobile && !this.state.isSmallWindow) {
      if (!currentPanes.includes(paneName)) {
        currentPanes.push(paneName);
        changed = true;
      }
      else if (paneName !== MAP_PANE_NAME) {
        currentPanes = Utility.arrayRemove(currentPanes, paneName);
        changed = true;
      }
    }
    else {
      if (!currentPanes.includes(paneName)) {
        currentPanes = [paneName];
        changed = true;
      }
    }

    if (changed) {
      currentPanes = [...currentPanes];
      this.setState({ panes: currentPanes }, () => {
        this.leafletMap.current.leafletElement.invalidateSize();
        this.attemptFlyTo();
      });
    }
  }

  onSelectMap = (map) => {
    this.drawnPolygonGeoJson = null;

    this.setState({ 
      map: map,
      selectedElement: null,
      drawnPolygonLayer: null,
      timestampRange: {
        start: map.timestamps.length - 1,
        end: map.timestamps.length - 1
      }
    }, () => {
      this.onFlyTo({ type: ViewerUtility.flyToType.map });
    });
  }

  onOpenGeoMessageFeed = () => {
    this.onDataPaneAction(ViewerUtility.dataPaneAction.feed);
  }

  onLayersChange = (layers) => {
    let allLayers = [...layers, this.state.selectedElementLayer, this.state.drawnPolygonLayer];
    this.setState({ allLayers: allLayers, leafletLayers: layers });
  }

  onSelectTimestamp = (timestampRange) => {
    if (this.state.timestampRange.start !== timestampRange.start || 
      this.state.timestampRange.end !== timestampRange.end) {
      this.setState({ timestampRange: timestampRange });
    }
  }

  onLeafletMapViewportChanged = (viewport) => {
    if (this.setNewViewportTimer) {
      clearTimeout(this.setNewViewportTimer);
    }    

    viewport.bounds = getLeafletMapBounds(this.leafletMap);

    this.setNewViewportTimer = setTimeout(
      () => {
        this.setState({ leafletMapViewport: viewport })
      }, 
      500
    );
  }

  selectFeature = (type, feature, hasAggregatedData) => {
    let element = {
      type: type,
      hasAggregatedData: hasAggregatedData,
      feature: feature,
    };

    let geoJson = {
      type: 'FeatureCollection',
      count: 1,
      features: [
        element.feature
      ]
    };

    let markerPane = this.leafletMap.current.leafletElement.getPane('markerPane');

    let selectedElementLayer = (
      <GeoJSON
        key={Math.random()}
        data={geoJson}
        style={'#00ffff'}
        pane={markerPane}
      />
    );

    let allLayers = [
      ...this.state.leafletLayers, 
      selectedElementLayer,
      this.state.drawnPolygonLayer
    ];

    this.setState({ 
      allLayers: allLayers, 
      selectedElement: element, 
      selectedElementLayer: selectedElementLayer 
    });
  }

  onDataPaneAction = (action) => {
    if (this.state.action !== action) {

      let panes = this.state.panes;
      let cb = null;
      
      if (!panes.includes(DATA_PANE_NAME)) {
        panes = [...panes];

        if (!isMobile && !this.state.isSmallWindow) {
          panes.push(DATA_PANE_NAME);
        }
        else {
          panes = [DATA_PANE_NAME];
        }
        
        cb = () => this.leafletMap.current.leafletElement.invalidateSize();
      }

      this.setState({ panes: panes, dataPaneAction: action }, cb);
    }
  }

  onFlyTo = (flyToInfo) => {
    this.flyToInfo = flyToInfo;
    let type = flyToInfo.type;

    if (type === ViewerUtility.flyToType.map) {
      let map = this.state.map;
      this.flyToInfo.target = L.latLngBounds(L.latLng(map.yMin, map.xMin), L.latLng(map.yMax, map.xMax));
    }
    else if (type === ViewerUtility.flyToType.currentLocation) {
      this.flyToInfo.target = this.state.geolocation;
    }
    else if (type === ViewerUtility.flyToType.currentElement && this.state.selectedElement) {
      let element = this.state.selectedElement;

      let geoJsonLayer = L.geoJSON({
        type: 'FeatureCollection',
        count: 1,
        features: [
          element.feature
        ]
      });

      this.flyToInfo.target = geoJsonLayer.getBounds();
      this.flyToInfo.layerType = element.type;

      if (element.type === ViewerUtility.flyToType.standardTile) {
        this.flyToInfo.layer = ViewerUtility.standardTileLayerType;
      }
      else {
        this.flyToInfo.layer = element.feature.properties.layer;
      }
    }
    else {
      this.getElementGeoJson()
        .then(geoJson => {
          let geoJsonLayer = L.geoJSON(geoJson);
          let bounds = geoJsonLayer.getBounds();
          
          this.flyToInfo.target = bounds;
          this.flyToInfo.layerType = this.flyToInfo.type;

          let feature = geoJson.features[0];
          let hasAggregatedData = true;

          if (type === ViewerUtility.flyToType.standardTile) {
            this.flyToInfo.layer = ViewerUtility.standardTileLayerType;
          }
          else {
            this.flyToInfo.layer = feature.properties.layer;

            if (this.flyToInfo.type === ViewerUtility.polygonLayerType) {
              let mapPolygonlayers = this.state.map.layers.polygon;

              for (let i = 0; i < mapPolygonlayers.length; i++) {
                let timestampPolygonLayers = mapPolygonlayers[i].layers;
                hasAggregatedData = timestampPolygonLayers.find(x => x.hasAggregatedData) ? true : false;
                if (hasAggregatedData) {
                  break;
                }
              }
            }
          }

          this.selectFeature(this.flyToInfo.type, feature, hasAggregatedData);
          this.attemptFlyTo();
        });
    }

    if (isMobile && !this.state.panes.includes(DATA_PANE_NAME)) {
      this.openPane(DATA_PANE_NAME);
    }
    else {
      this.attemptFlyTo();
    }
  }

  getElementGeoJson = () => {
    let map = this.state.map;
    let body = {
      mapId: map.id,
      timestamp: map.timestamps[this.state.timestampRange.end].timestampNumber
    };

    let type = this.flyToInfo.type;
    let url = null;

    if (type === ViewerUtility.flyToType.standardTile) {
      body.tileIds = [{...this.flyToInfo.elementId, zoom: map.zoom }];
      url = '/geometry/tiles';
    }
    else if (type === ViewerUtility.flyToType.polygon) {
      body.polygonIds = [this.flyToInfo.elementId];
      url = '/geometry/polygons';
    }
    else if (type === ViewerUtility.flyToType.polygon) {
      body.polygonIds = [this.flyToInfo.elementId];
      url = '/geoMessage/customPolygon/geometries';
    }

    return ApiManager.post(url, body, this.props.user);
  }

  attemptFlyTo = () => {
    if (!this.flyToInfo || !this.flyToInfo.target) {
      return;
    }

    if (this.state.panes.includes(MAP_PANE_NAME)) {

      if (this.flyToInfo.type === ViewerUtility.flyToType.currentLocation) {
        this.leafletMap.current.leafletElement.flyTo(this.flyToInfo.target);
      }
      else {
        this.leafletMap.current.leafletElement.flyToBounds(this.flyToInfo.target);
      }

      if (this.flyToInfo.layer) {
        this.controlsPane.current.selectLayer(this.flyToInfo.layerType, this.flyToInfo.layer);
      }

      this.flyToInfo = null;
    }
  }

  render() {

    let mapPaneStyle = {
      display: 'block',
      width: '100vw'
    };

    if (this.state.panes.includes(MAP_PANE_NAME)) {

      if (!isMobile) {
        if (this.state.panes.length === 2) {
          mapPaneStyle.width = '75vw';
        }
        else if (this.state.panes.length === 3) {
          mapPaneStyle.width = '50vw';
        }
      }

    }
    else {
      mapPaneStyle.display = 'none';
    }

    return (
      <div className='viewer'>
        
        <div className='viewer-main-container'>
          <ControlsPane
            ref={this.controlsPane}
            user={this.props.user}
            isOpen={this.state.panes.includes(CONTROL_PANE_NAME)}
            leafletMapViewport={this.state.leafletMapViewport}
            timestampRange={this.state.timestampRange}
            geolocation={this.state.geolocation}
            onSelectMap={this.onSelectMap}
            onOpenGeoMessageFeed={this.onOpenGeoMessageFeed}
            onLayersChange={this.onLayersChange}
            onFeatureClick={this.selectFeature}
            onFlyTo={this.onFlyTo}
          />
          
          <div className='viewer-pane map-pane' style={mapPaneStyle}>
            <TimestampSelector
              map={this.state.map}
              onSelectTimestamp={this.onSelectTimestamp}
            />
            <SelectionPane
              user={this.props.user}
              map={this.state.map}
              element={this.state.selectedElement}
              onDataPaneAction={this.onDataPaneAction}
              onFlyTo={this.onFlyTo}
            />
            <Map 
              center={DEFAULT_VIEWPORT.center} 
              zoom={DEFAULT_VIEWPORT.zoom}
              ref={this.leafletMap}
              maxZoom={19}
              onViewportChanged={this.onLeafletMapViewportChanged}
            >
              {this.state.allLayers}
              {this.state.geolocation ? <Marker position={this.state.geolocation}/> : null}
            </Map>
          </div>

          <DataPane
            user={this.props.user}
            isOpen={this.state.panes.includes(DATA_PANE_NAME)}
            map={this.state.map}
            timestampRange={this.state.timestampRange}
            action={this.state.dataPaneAction}
            element={this.state.selectedElement}
            onFlyTo={this.onFlyTo}
          />
        </div>

        <div className='viewer-menu'>
          <div className='button viewer-menu-button' onClick={() => this.openPane(CONTROL_PANE_NAME)}>
            <div className='viewer-menu-button-content'>
              {this.props.localization['ViewerControlsPane']}
            </div>
          </div>
          <div className='button viewer-menu-button' onClick={() => this.openPane(MAP_PANE_NAME)}>
            <div className='viewer-menu-button-content'>
              {this.props.localization['ViewerMapPane']}           
            </div>
          </div>
          <div className='button viewer-menu-button' onClick={() => this.openPane(DATA_PANE_NAME)}>
            <div className='viewer-menu-button-content'>
              {this.props.localization['ViewerDataPane']}        
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function getLeafletMapBounds(leafletMap) {
  let screenBounds = leafletMap.current.leafletElement.getBounds();
  let bounds = 
  {
    xMin: screenBounds.getWest(),
    xMax: screenBounds.getEast(),
    yMin: screenBounds.getSouth(),
    yMax: screenBounds.getNorth()
  }

  return bounds;
}

export default Viewer;
