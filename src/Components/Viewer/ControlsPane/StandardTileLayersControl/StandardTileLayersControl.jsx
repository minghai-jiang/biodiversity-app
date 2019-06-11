import React, { PureComponent } from 'react';
import { GeoJSON } from 'react-leaflet';

import { 
  Card,
  Checkbox,
  CardHeader,
  CardContent,
  Collapse,
  IconButton,
  Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Utility from '../../../../Utility';
import ViewerUtility from '../../ViewerUtility';

import './StandardTileLayersControl.css';

import ApiManager from '../../../../ApiManager';

const STANDARD_TILES_LAYERS_DISPLAY_NAME = 'standard tiles';
const STANDARD_TILES_LAYER = { 
  type: STANDARD_TILES_LAYERS_DISPLAY_NAME, 
  name: STANDARD_TILES_LAYERS_DISPLAY_NAME 
};

const MAX_TILES = 500;

class StandardTileLayersControl extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      availableLayers: [],
      selectedLayers: [],

      options: [],

      expanded: true
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

        availableLayers = [STANDARD_TILES_LAYER];
        selectedLayers = [];

        this.setState({ 
          availableLayers: availableLayers, 
          selectedLayers: selectedLayers
        });
      }
      
      this.prepareLayers(this.props.map, this.props.timestampRange, selectedLayers)
        .then(leafletLayers => {
          this.props.onLayersChange(leafletLayers);
        });
    }
  }

  createLayerCheckboxes = () => {
    let options = [];

    let availableLayers = this.state.availableLayers;
    let selectedLayers = this.state.selectedLayers;

    for (let i = 0; i < availableLayers.length; i++) {

      let availableLayer = availableLayers[i];
      let checked = selectedLayers.find(x => x === availableLayer) ? true : false;

      let option = (
        <div key={availableLayer.name}>
          <Checkbox 
            key={availableLayer.name} 
            classes={{ root: 'layers-control-checkbox' }}
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

  prepareLayers = async (map, timestampRange, selectedLayers) => {
    if (!selectedLayers.includes(STANDARD_TILES_LAYER)) {
      return;
    }

    let bounds = this.props.leafletMapViewport.bounds;

    let body =  {
      mapId: map.id,
      timestamp: map.timestamps[timestampRange.end].timestampNumber,
      xMin: bounds.xMin,
      xMax: bounds.xMax,
      yMin: bounds.yMin,
      yMax: bounds.yMax,
      zoom: map.zoom,
      limit: MAX_TILES
    }

    let leafletGeojsonLayer = await ApiManager.post('/metadata/tiles', body, this.props.user)
      .then(standardTileIds => {
        if (!standardTileIds || standardTileIds.count === 0 || standardTileIds.count > MAX_TILES) {
          return null;
        }

        body = {
          mapId: map.id,
          timestamp: map.timestamps[timestampRange.end].timestampNumber,
          tileIds: standardTileIds.ids
        }

        return ApiManager.post('/geometry/tiles', body, this.props.user);
      })
      .then(standardTilesGeoJson => {
        if (!standardTilesGeoJson) {
          return [];
        }

        return (
          <GeoJSON
            key={Math.random()}
            data={standardTilesGeoJson}
            style={{ color: 'cornflowerblue', weight: 1, opacity: 0.3 }}
            zIndex={ViewerUtility.standardTileLayerZIndex}
            onEachFeature={(feature, layer) => layer.on({ click: () => this.onFeatureClick(feature) })}
          />
        );        
      });

    return leafletGeojsonLayer;
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
      this.prepareLayers(this.props.map, this.props.timestampRange, newSelectedLayers) 
        .then(standardTilesLayers => {
          this.props.onLayersChange(standardTilesLayers);
        });
    }
  }

  onExpandClick = () => {
    this.setState({ expanded: !this.state.expanded });
  }

  onFeatureClick = (feature) => {
    this.props.onFeatureClick(feature);
  }

  render() {

    if (!this.props.map) {
      return null;
    }

    return (
      <Card className='layers-contol'>
        <CardHeader
          className='card-header'
          title={
            <Typography gutterBottom variant="h6" component="h2">
              Standard tiles
            </Typography>
          }
          action={
            <IconButton
              className={this.state.expanded ? 'expand-icon expanded' : 'expand-icon'}
              onClick={this.onExpandClick}
              aria-expanded={this.state.expanded}
              aria-label='Show'
            >
              <ExpandMoreIcon />
            </IconButton>
          }
        />
        <Collapse in={this.state.expanded}>
          <CardContent
            className={'card-content'}
          >
            {this.createLayerCheckboxes()}
          </CardContent>
        </Collapse>
      </Card>
    );
  }
}

export default StandardTileLayersControl;
