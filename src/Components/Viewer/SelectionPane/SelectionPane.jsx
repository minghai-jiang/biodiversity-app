import React, { PureComponent } from 'react';

import { 
  Card,
  Button,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Typography
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
      isOpen: false
    };
  }  

  componentDidUpdate(prevProps) {
    if (!this.props.map || prevProps.map !== this.props.map) {
      this.setState({ isOpen: false });
    }
    else if (!prevProps.element || prevProps.element.key !== this.props.element.key) {
      this.setState({ isOpen: true });
    } 
  }

  onCloseClick = () => {
    this.setState({ isOpen: false });
  }

  onElementActionClick = (action) => {
    this.props.onDataPaneAction(action);
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
    let buttons = [];

    let user = this.props.user;
    let mapAccessLevel = map.accessLevel;

    if (element.type === ViewerUtility.standardTileLayerType ||
      element.type === ViewerUtility.polygonLayerType ||
      element.type === ViewerUtility.customPolygonTileLayerType) {

      let analyseButton = (
        <Button 
          key='analyse' 
          variant='outlined' 
          size='small' 
          className='selection-pane-button'
          onClick={() => this.onElementActionClick(ViewerUtility.dataPaneActions.analyse)}
          disabled={mapAccessLevel < ApiManager.accessLevels.aggregatedData || !element.hasAggregatedData}
        >
          Analyse
        </Button>
      );
      
      let geomessageButton = (
        <Button 
          key='geomessage' 
          variant='outlined' 
          size='small' 
          className='selection-pane-button'
          onClick={() => this.onElementActionClick(ViewerUtility.dataPaneActions.geomessage)}
          disabled={mapAccessLevel < ApiManager.accessLevels.viewGeoMessages}
        >
          Geomessage
        </Button>
      );

      buttons.push(
        <div key='general_actions'>
          {analyseButton}
          {geomessageButton}
        </div>
      )
    }

    if (element.type === ViewerUtility.standardTileLayerType) {
      title = 'Standard tile';
    }
    else if (element.type === ViewerUtility.polygonLayerType) {
      title = 'Polygon';
    }
    else if (element.type === ViewerUtility.customPolygonTileLayerType) {
      title = 'Custom polygon';

      buttons.push(
        <div key='specific_actions' className='specific-actions'>
          <Button 
            key='alter' 
            variant='outlined' 
            size='small' 
            className='selection-pane-button'
            onClick={() => this.onElementActionClick(ViewerUtility.dataPaneActions.alterCustomPolygon)}
            disabled={!user || mapAccessLevel < ApiManager.accessLevels.alterOrDeleteCustomPolygons}
          >
            Alter
          </Button>
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
        </div>
      );      
    }

    let elementProperties = element.feature.properties;
    let properties = [];
    
    for (let property in elementProperties) {
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
            <Button>
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
        </CardContent>
        <CardActions className={'selection-pane-card-actions'}>
          {buttons}
        </CardActions>
      </Card>
    );
  }
}

export default SelectionPane;
