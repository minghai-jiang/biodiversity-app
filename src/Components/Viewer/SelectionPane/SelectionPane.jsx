import React, { PureComponent } from 'react';
import Moment from 'moment';

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
import SaveAlt from '@material-ui/icons/SaveAlt';

import ViewerUtility from '../ViewerUtility';

import './SelectionPane.css';
import ApiManager from '../../../ApiManager';

const DELETE_CUSTOM_POLYGON_ACTION = 'delete_custom_polygon';

class SelectionPane extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      isOpen: false,
      loading: true,
      data: null,
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.map || prevProps.map !== this.props.map || !this.props.element) {
      this.setState({ isOpen: false });
    }
    else if (prevProps.element !== this.props.element) {
      this.setState({ isOpen: true });
      this.getData();
    }
  }

  getData = () =>
  {
    let element = this.props.element;

    let body = {
      mapId: 'ea53987e-842d-4467-91c3-9e23b3e5e2e8',
      polygonIds: [element.feature.id]
    };

    let dataPromise = ApiManager.post(`/geoMessage/${element.type}/getMessages`, body, this.props.user);
    let messages = [];

    dataPromise
      .then(result => {
        if (result.length === 0)
        {
          this.setState({ data: <p>{ViewerUtility.noScore}</p>, loading: false});
        }
        else
        {
          for (var i = 0; i < result[0].messages.length; i++)
          {
            if(result && result[0].messages[i].form && result[0].messages[i].form.formName === "Kruidenrijkheid")
            {
              messages.push(result[0].messages[i]);
            }
          }

          messages.sort(function(a,b){return Moment(b.form.answers[0].answer).format('X') - Moment(a.form.answers[0].answer).format('X')});

          if (messages.length > 0)
          {
            console.log(messages)
            
            let score = messages[messages.length - 1].form.answers[1].answer;
            let scoreText = messages[messages.length - 1].form.answers[2].answer;
            let data = [
              <p key='scoreHeader'>{ViewerUtility.score}</p>,
              <div className={'score score_' + score} key={element.feature.id + '_score_' + score}><span>{score}</span></div>,
              <p key={element.feature.id + '_scoreText_' + scoreText}>{scoreText}</p>
            ]
            
            this.setState({ data: data, loading: false});
          }
          else
          {
            this.setState({ data: <p>{ViewerUtility.noScore}</p>, loading: false});
          }
        }

      })
      .catch(err => {
        console.error(err);
      });
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
          this.props.onDeleteCustomPolygon();
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

  onDownload = () => {
    let element = this.props.element;

    if (!element) {
      return;
    }

    let type = element.type;
    let feature = element.feature;

    let nameComponents = [this.props.map.name];

    if (type === ViewerUtility.standardTileLayerType) {
      nameComponents.push(
        'tile',
        feature.properties.tileX,
        feature.properties.tileY,
        feature.properties.zoom
      );
    }
    else if (type === ViewerUtility.polygonLayerType) {
      nameComponents.push('polygon', feature.properties.id);
    }
    else if (type === ViewerUtility.customPolygonTileLayerType) {
      nameComponents.push('customPolygon', feature.properties.id);
    }
    else if (type === ViewerUtility.drawnPolygonLayerType) {
      nameComponents.push('drawnPolygon');
    }

    let fileName = nameComponents.join('_').replace(' ', '_') + '.geojson';

    let geoJson = {
      type: 'FeatureCollection',
      count: 1,
      features: [feature]
    };

    ViewerUtility.download(fileName, JSON.stringify(geoJson), 'application/json');
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
        {this.props.localization['ANALYSE']}
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
        {this.props.localization['GeoMessage']}
        </Button>
      ));
    }


    if (element.type === ViewerUtility.standardTileLayerType) {
      title = this.props.localization['Standard tile'];
    }
    else if (element.type === ViewerUtility.polygonLayerType) {
      title = this.props.localization['Polygon'];
    }
    else if (element.type === ViewerUtility.customPolygonTileLayerType) {
      title = this.props.localization['Custom polygon'];

      secondRowButtons.push(
        <Button
          key='edit'
          variant='outlined'
          size='small'
          className='selection-pane-button'
          onClick={() => this.onElementActionClick(ViewerUtility.dataPaneAction.editCustomPolygon)}
          disabled={!user || mapAccessLevel < ApiManager.accessLevels.editOrDeleteCustomPolygons}
        >
          {this.props.localization['EDIT']}
        </Button>,
        <Button
          key='delete'
          variant='outlined'
          size='small'
          className='selection-pane-button'
          onClick={() => this.onElementActionClick(DELETE_CUSTOM_POLYGON_ACTION)}
          disabled={!user || mapAccessLevel < ApiManager.accessLevels.alterOrDeleteCustomPolygons}
        >
          {this.props.localization['DELETE']}
        </Button>
      );
    }
    else if (element.type === ViewerUtility.drawnPolygonLayerType) {
      title = this.props.localization['Drawn polygon'];

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
          {this.props.localization['ADD']}
        </Button>
      );
    }

    let elementProperties = element.feature.properties;
    let properties = [];

    let selectionPaneClass = 'selection-pane';

    for (let property in elementProperties) {

      let propertyValue = elementProperties[property];

      if (element.type === ViewerUtility.drawnPolygonLayerType && property === 'id') {
        continue;
      }
      if (element.type === ViewerUtility.customPolygonTileLayerType
        && property === ViewerUtility.isPrivateProperty) {
        if (propertyValue === true) {
          selectionPaneClass += ' selection-pane-private';
        }
        continue;
      }

      if (elementProperties.hasOwnProperty(property)) {
        properties.push((
          <div key={property}>
            {`${property}: ${propertyValue}`}
          </div>
        ))
      }
    }

    return (
      <Card className={selectionPaneClass}>
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
            <div>
              <IconButton
                onClick={this.onCloseClick}
                aria-label='Close'
              >
                <ClearIcon />
              </IconButton>
            </div>
          }
        />
        <CardContent className={'card-content'}>
          { this.state.loading ? <CircularProgress className='loading-spinner'/> : this.state.data}
        </CardContent>
        {
          !this.state.loading ? (<CardActions className={'selection-pane-card-actions'}>
            <div key='first_row_buttons'>
              {firstRowButtons}
            </div>
            <div key='secont_row_buttons' style={ {marginLeft: '0px' }}>
              {secondRowButtons}
            </div>
          </CardActions>) : null
      }
      </Card>
    );
  }
}

export default SelectionPane;
