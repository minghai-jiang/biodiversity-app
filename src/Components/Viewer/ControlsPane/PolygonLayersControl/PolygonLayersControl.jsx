import React, { PureComponent } from 'react';
import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';

import Checkbox from '@material-ui/core/Checkbox';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import Utility from '../../../../Utility';

import './PolygonLayersControl.css';

import ApiManager from '../../../../ApiManager';

const MAX_POLYGONS = 500;

class PolygonLayersControl extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      availableLayers: [],
      selectedLayers: [],

      options: []
    };
  }

  componentDidMount() {
    this.props.onLayersChange([]);
  }

  componentDidUpdate(prevProps) {
    if (!this.props.map || !this.props.timestampRange) {
      this.props.onLayersChange([]);
      return;
    }

    let differentMap = this.props.map !== prevProps.map;

    let differentTimestamp = !prevProps.timestampRange || 
      this.props.timestampRange.start !== prevProps.timestampRange.start ||
      this.props.timestampRange.end !== prevProps.timestampRange.end;

    let differentBounds = !prevProps.leafletMapViewport ||
      this.props.leafletMapViewport.bounds.xMin !== prevProps.leafletMapViewport.bounds.xMin ||
      this.props.leafletMapViewport.bounds.xMax !== prevProps.leafletMapViewport.bounds.xMax ||
      this.props.leafletMapViewport.bounds.yMin !== prevProps.leafletMapViewport.bounds.yMin ||
      this.props.leafletMapViewport.bounds.yMax !== prevProps.leafletMapViewport.bounds.yMax;

    if (differentMap || differentTimestamp || differentBounds) {

      let availableLayers = this.state.availableLayers;
      let selectedLayers = this.state.selectedLayers;

      if (differentMap) {
        availableLayers = this.getAvailableLayers(this.props.map);
        selectedLayers = [];

        this.setState({ 
          availableLayers: availableLayers, 
          selectedLayers: selectedLayers
        });
      }

      this.prepareLayers(this.props.map, this.props.timestampRange, availableLayers, selectedLayers)
        .then(leafletLayers => {
          this.props.onLayersChange(leafletLayers);
        });
    }
  }

  getAvailableLayers = (map) => {
    let availableLayers = [];

    for (let i = 0; i < map.layers.polygon.length; i++) {

      let mapTimestampPolygonLayers = map.layers.polygon[i];

      for (let y = 0; y < mapTimestampPolygonLayers.layers.length; y++) {
        let layer = mapTimestampPolygonLayers.layers[y];

        let availableLayer = availableLayers.find(x => x.name === layer.name);

        if (!availableLayer) {
          availableLayers.push({
            name: layer.name,
            color: layer.color,
            hasAggregatedData: layer.hasAggregatedData
          });
        }
      }
    }

    return availableLayers;  
  }

  createLayerCheckboxes = () => {
    let options = [];

    let availableLayers = this.state.availableLayers;
    let selectedLayers = this.state.selectedLayers;

    for (let i = 0; i < availableLayers.length; i++) {

      let availableLayer = availableLayers[i];
      let checked = selectedLayers.find(x => x === availableLayer) ? true : false;

      let option = (
        <div>
          <Checkbox 
            key={availableLayer.name} 
            classes={{ root: 'controls-pane-checkbox' }}
            color='primary'
            value={availableLayer.name} 
            name={availableLayer.name}
            onChange={this.onLayerChange}
            checked={checked}
          />
          {availableLayer.name}
        </div>
      )

      options.push(option);
    }

    return options;
  }

  prepareLayers = async (map, timestampRange, availableLayers, selectedLayers) => {
    let promises = [];
    
    for (let i = 0; i < availableLayers.length; i++) {

      let polygonLayer = availableLayers[i]

      if (!selectedLayers.find(x => x.name === polygonLayer.name)) {
        continue;
      }

      let bounds = this.props.leafletMapViewport.bounds;

      let body = {
        mapId: map.id,
        timestamp: map.timestamps[timestampRange.end].timestampNumber,
        layer: polygonLayer.name,
        xMin: bounds.xMin,
        xMax: bounds.xMax,
        yMin: bounds.yMin,
        yMax: bounds.yMax,
        zoom: map.zoom,
        limit: MAX_POLYGONS
      }

      let leafletGeojsonLayerPromise = ApiManager.post('/metadata/polygons', body, this.props.user)
        .then(polygonIds => {
          if (polygonIds.count > MAX_POLYGONS) {
            return null;
          }

          body = {
            mapId: map.id,
            timestamp: map.timestamps[timestampRange.end].timestampNumber,
            polygonIds: polygonIds.ids
          }

          return ApiManager.post('/geometry/polygons', body, this.props.user);
        })
        .then(polygonsGeoJson => {
          if (!polygonsGeoJson) {
            return [];
          }

          return (
            <GeoJSON
              key={Math.random()}
              data={polygonsGeoJson}
              style={{ color: `#${polygonLayer.color}`, weight: 1, opacity: 0.3 }}
              zIndex={4000 + i}
            />
          );        
        });

      promises.push(leafletGeojsonLayerPromise);
    }

    let leafletGeoJsonLayers = await Promise.all(promises);

    return leafletGeoJsonLayers;
  }

  onLayerChange = (e) => {
    let layerName = e.target.value;
    let checked = e.target.checked;

    let isSelected = this.state.selectedLayers.find(x => x.name === layerName);

    let newSelectedLayers = null;
    let changed = false;

    if (checked && !isSelected) {
      let availableLayer = this.state.availableLayers.find(x => x.name === layerName);

      newSelectedLayers = [...this.state.selectedLayers, availableLayer];

      changed = true; 
    }
    else if (!checked && isSelected) {
      newSelectedLayers = Utility.arrayRemove(this.state.selectedLayers, isSelected);

      newSelectedLayers = [...newSelectedLayers];

      changed = true;
    }

    if (changed) {
      this.setState({ selectedLayers: newSelectedLayers });

      this.prepareLayers(this.props.map, this.props.timestampRange, this.state.availableLayers, newSelectedLayers)
        .then(standardTilesLayers => {
          this.props.onLayersChange(standardTilesLayers);
        });
    }
  }

  render() {

    if (!this.props.map) {
      return null;
    }

    return (
      <Card className='tile-layers-contol'>
        <CardContent>
          <Typography gutterBottom variant="h6" component="h2">
            Polygon layers
          </Typography>
          {this.createLayerCheckboxes()}
        </CardContent>
      </Card>
    );
  }
}

export default PolygonLayersControl;
