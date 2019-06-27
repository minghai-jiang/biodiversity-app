import React, { PureComponent } from 'react';

import { 
  Card,
  Button,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  CircularProgress
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

import ViewerUtility from '../ViewerUtility';

import './SelectionPane.css';
import ApiManager from '../../../ApiManager';

const DELETE_CUSTOM_POLYGON_ACTION = 'delete_custom_polygon';

class SelectionPane extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      isOpen: false,
      loading: false
    };
  }  

  componentDidUpdate(prevProps) {
    if (!this.props.map || prevProps.map !== this.props.map || !this.props.element) {
      this.setState({ isOpen: false });
    }
    else if (prevProps.element !== this.props.element) {
      this.setState({ isOpen: true });
    }
  }

  open = () => {
    this.setState({ isOpen: true });
  }

  refresh = () => {
    this.forceUpdate();
  }

  deleteCustomPolygon = () => {
    this.setState({ loading: true }, () => {
      let body = {
        mapId: this.props.map.id,
        customPolygonId: this.props.element.feature.properties.id
      };
  
      ApiManager.post('/geomessage/customPolygon/deletePolygon', body, this.props.user)
        .then(() => {
          this.props.onDeselect();
          this.setState({ isOpen: false, loading: false });
        })
        .catch(err => {
          console.log(err);
          this.setState({ loading: false });
        });
    });

  }

  onCloseClick = () => {
    this.props.onDeselect();
    
    this.setState({ isOpen: false });
  }

  onElementActionClick = (action) => {
    if (action === DELETE_CUSTOM_POLYGON_ACTION) {
      this.deleteCustomPolygon();
    }
    else {
      this.props.onDataPaneAction(action);
    }
  }

  render() {
    if (!this.state.isOpen) {
      return null;
    }

    let map = this.props.map;
    let element = this.props.element;

    if (!map || !element) {
      return null;
    }

    let title = null;

    let user = this.props.user;
    let mapAccessLevel = map.accessLevel;

    let firstRowButtons = [];
    let secondRowButtons = [];

    firstRowButtons.push(
      <Button 
        key='analyse' 
        variant='outlined' 
        size='small' 
        className='selection-pane-button'
        onClick={() => this.onElementActionClick(ViewerUtility.dataPaneAction.analyse)}
        disabled={mapAccessLevel < ApiManager.accessLevels.aggregatedData}
      >
        Analyse
      </Button>
    );

    if (element.type !== ViewerUtility.drawnPolygonLayerType) {
      firstRowButtons.push((
        <Button 
          key='geoMessage' 
          variant='outlined' 
          size='small' 
          className='selection-pane-button'
          onClick={() => this.onElementActionClick(ViewerUtility.dataPaneAction.geoMessage)}
          disabled={mapAccessLevel < ApiManager.accessLevels.viewGeoMessages}
        >
          GeoMessage
        </Button>
      ));
    }


    if (element.type === ViewerUtility.standardTileLayerType) {
      title = 'Standard tile';
    }
    else if (element.type === ViewerUtility.polygonLayerType) {
      title = 'Polygon';
    }
    else if (element.type === ViewerUtility.customPolygonTileLayerType) {
      title = 'Custom polygon';

      secondRowButtons.push(
        <Button 
          key='edit' 
          variant='outlined' 
          size='small' 
          className='selection-pane-button'
          onClick={() => this.onElementActionClick(ViewerUtility.dataPaneAction.editCustomPolygon)}
          disabled={!user || mapAccessLevel < ApiManager.accessLevels.editOrDeleteCustomPolygons}
        >
          Edit
        </Button>,
        <Button 
          key='delete' 
          variant='outlined' 
          size='small' 
          className='selection-pane-button'
          onClick={() => this.onElementActionClick(DELETE_CUSTOM_POLYGON_ACTION)}
          disabled={!user || mapAccessLevel < ApiManager.accessLevels.alterOrDeleteCustomPolygons}
        >
          Delete
        </Button>
      );
    }
    else if (element.type === ViewerUtility.drawnPolygonLayerType) {
      title = 'Drawn polygon';

      firstRowButtons.push(
        <Button 
          key='add' 
          variant='outlined' 
          size='small' 
          className='selection-pane-button'
          onClick={() => this.onElementActionClick(ViewerUtility.dataPaneAction.createCustomPolygon)}
          disabled={
            !user || 
            mapAccessLevel < ApiManager.accessLevels.addCustomPolygons ||
            map.layers.customPolygon.length === 0
          }
        >
          Add
        </Button>
      );     
    }

    let elementProperties = element.feature.properties;
    let properties = [];

    for (let property in elementProperties) {

      if (element.type === ViewerUtility.drawnPolygonLayerType && property === 'id') {
        continue;
      }

      if (elementProperties.hasOwnProperty(property)) {
        properties.push((
          <div key={property}>
            {`${property}: ${elementProperties[property]}`}
          </div>
        ))
      }
    }

    return (
      <Card className='selection-pane'>
        <CardHeader
          className='card-header'
          title={
            <Button
              onClick={() => this.props.onFlyTo({
                type: ViewerUtility.flyToType.currentElement
              })}
            >
              <Typography variant="h6" component="h2" className='no-text-transform'>
                {title}
              </Typography>
            </Button>
          }
          action={
            <IconButton
              onClick={this.onCloseClick}
              aria-label='Close'
            >
              <ClearIcon />
            </IconButton>
          }
        />
        <CardContent className={'card-content'}>
          {properties}
          { this.state.loading ? <CircularProgress className='loading-spinner'/> : null}
        </CardContent>
        <CardActions className={'selection-pane-card-actions'}>
          <div key='first_row_buttons'>
            {firstRowButtons}
          </div>
          <div key='secont_row_buttons' style={ {marginLeft: '0px' }}>
            {secondRowButtons}
          </div>
        </CardActions>
      </Card>
    );
  }
}

export default SelectionPane;