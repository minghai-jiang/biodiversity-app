import React, { PureComponent } from 'react';
import { GeoJSON } from 'react-leaflet';

import { 
  Card,  
  CardHeader,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  Input,
  Checkbox,
  ListItemText,
  InputLabel,
  FormControl
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Utility from '../../../../Utility';
import ViewerUtility from '../../ViewerUtility';
import DataPaneUtility from '../DataPaneUtility';

import './GeoMessageControl.css';
import ApiManager from '../../../../ApiManager';

import GeoMessage from './GeoMessage/GeoMessage';
import GeoMessageForm from './GeoMessageForm/GeoMessageForm';

const SCROLL_LOAD_THRESHOLD = 1000;
const NO_GROUP_NAME = 'no group';

const REFRESH_MODE = {
  applyToMap: 1,
  reconstructOnly: 2,
  full: 3
};

class GeoMessageControl extends PureComponent {

  geomessagesContainerCard = null;

  rawGeoMessages = [];

  feedPage = 1;
  noMoreFeedMessages = false;
  feedScrollLoading = false;

  geoJsonElements = [];

  constructor(props, context) {
    super(props, context);

    this.geomessagesContainerCard = React.createRef();

    this.state = {
      loading: false,

      geoMessageElements: [],
      
      availableGroups: [],

      filtersExpanded: true,
      filterSettings: this.createEmptyFilterSettings()
    };
  }

  componentDidMount() {
    let newState = { 
      loading: true,
      availableGroups: [...this.props.map.groups, NO_GROUP_NAME]
    }; 

    this.setState(newState, this.getGeoMessages);
  }

  componentDidUpdate(prevProps) {
    let differentMap = this.props.map !== prevProps.map;

    if (differentMap) {
      this.setState({ 
        availableGroups: [...this.props.map.groups, NO_GROUP_NAME], 
        filterSettings: this.createEmptyFilterSettings()
      });
    }

    let update = false;

    if (this.props.isFeed && !prevProps.isFeed) {
      this.rawGeoMessages = [];
      this.setState({ geoMessageElements: [] });
    }

    if (this.props.isFeed) {
      update = !prevProps.isFeed || differentMap;
      if (update) {
        this.feedPage = 1;
        this.noMoreFeedMessages = false;
      }
    }
    else {
      if (!this.props.element && (this.rawGeoMessages || this.state.geoMessageElements)) {
        this.rawGeoMessages = [];
        this.setState({ geoMessageElements: [] });
        return;
      }

      let differentElement = DataPaneUtility.isDifferentElement(prevProps.element, this.props.element);
      let differentAction = prevProps.isFeed !== this.props.isFeed;

      update = differentMap || differentElement || differentAction;
    }

    if (update) {
      this.setState({ loading: true }, this.getGeoMessages);
    }
  }

  createEmptyFilterSettings = () => {
    return {
      applyToMap: false,
      selectedGroups: [],
      selectedForms: []
    };
  }

  getGeoMessages = () => {
    let geoMessagesPromise = null;

    let cb = () => {
      this.setState({ loading: false }, () => {
        if (!this.props.isFeed) {
          this.scrollGeoMessagesToBottom();
        }
      });
    }

    if (!this.props.isFeed) {
      geoMessagesPromise = this.getElementMessages(cb);
    }
    else {
      geoMessagesPromise = this.getFeedMessages(cb);
    }

    geoMessagesPromise
      .catch(err => {
        console.error(err);
        this.setState({ loading: false });
      });
  }

  getElementMessages = (cb) => {
    let urlType = null;
    let body = {
      mapId: this.props.map.id
    };

    let element = this.props.element;
    let elementProperties = element.feature.properties;

    if (element.type === ViewerUtility.standardTileLayerType) {
      body.tileIds = [{
        tileX: elementProperties.tileX,
        tileY: elementProperties.tileY,
        zoom: elementProperties.zoom
      }];

      urlType = 'tile';
    }
    else if (element.type === ViewerUtility.polygonLayerType) {
      body.polygonIds = [elementProperties.id];

      urlType = 'polygon';
    }
    else if (element.type === ViewerUtility.customPolygonTileLayerType) {
      body.customPolygonIds = [elementProperties.id]

      urlType = 'customPolygon';
    }
    else {
      return;
    }

    return ApiManager.post(`/geoMessage/${urlType}/getMessages`, body, this.props.user)
      .then(result => {
        let rawGeoMessages = null;
        let geoMessageElements = [];

        if (result[0]) {
          rawGeoMessages = result[0].messages;

          for (let i = 0; i < rawGeoMessages.length; i++) {
            let message = rawGeoMessages[i];
            let deleted = message.deleteDate;

            if (!deleted) {
              geoMessageElements.push(this.createGeomessageElement(message, false));
            }
          }
        }
        else if (result[0]) {
          geoMessageElements.push(
            <div>
              No messages.
            </div>
          );
        };

        this.rawGeoMessages = rawGeoMessages;
        this.setState({ geoMessageElements: geoMessageElements }, cb);
      }); 
  }

  getFeedMessages = (cb) => {
    let body = {
      mapId: this.props.map.id,
      page: this.feedPage,
      userGroups: this.state.filterSettings.selectedGroups
    };

    this.feedPage = this.feedPage + 1;

    return ApiManager.post(`/geoMessage/feed`, body, this.props.user)
      .then(result => {
        this.rawGeoMessages = this.rawGeoMessages.concat(result);

        if (result.length === 0) {
          this.noMoreFeedMessages = true;
        }

        this.constructGeoMessageElements(cb);
      });
  }

  constructGeoMessageElements = (cb) => {
    let geoMessageElements = [];

    let rawGeoMessages = this.rawGeoMessages;
    let filterSettings = this.state.filterSettings;

    let filteredElements = [];

    for (let i = 0; i < rawGeoMessages.length; i++) {
      let message = rawGeoMessages[i];

      if (filterSettings.selectedForms.length > 0 && 
        (!message.form || !filterSettings.selectedForms.includes(message.form.formName))) {
        continue;
      }

      let deleted = message.deleteDate;

      if (!deleted) {
        geoMessageElements.push(this.createGeomessageElement(message, true));

        let findFunc = (x) => {
          if (x.type !== message.type) {
            return false;
          }

          if (x.type !== ViewerUtility.standardTileLayerType) {
            return x.elementId === message.elementId;
          }
          else {
            return x.elementId.tileX === message.elementId.tileX &&
              x.elementId.tileY === message.elementId.tileY &&
              x.elementId.zoom === message.elementId.zoom;
          }
        };

        if (!filteredElements.find(findFunc)) {
          filteredElements.push({
            elementId: message.elementId,
            type: message.type
          });
        }        
      }
    }

    let getGeometry = (type) => {
      let elementsOfType = filteredElements.filter(x => x.type === type);

      if (elementsOfType.length === 0) {
        return [];
      }

      let map = this.props.map;
      let timestampRange = this.props.timestampRange;

      let elementIds = [];
      for (let i = 0; i < elementsOfType.length; i++){
        elementIds.push(elementsOfType[i].elementId);
      }

      let body = {
        mapId: map.id,
        timestamp: map.timestamps[timestampRange.end].timestampNumber
      };

      let url = '';
      if (type === ViewerUtility.standardTileLayerType) {
        url = '/geometry/tiles';
        body.tileIds = elementIds;
      }
      else if (type === ViewerUtility.polygonLayerType) {
        url = '/geometry/polygons';
        body.polygonIds = elementIds;
      }
      else if (type === ViewerUtility.customPolygonTileLayerType) {
        url = '/geoMessage/customPolygon/geometries';
        body.customPolygonIds = elementIds;
      }

      return ApiManager.post(url, body, this.props.user)
        .then(geoJson => {
          return (
            <GeoJSON
              key={Math.random()}
              data={geoJson}
              style={{ color: `#ff0000`, weight: 1, opacity: 0.3 }}
              zIndex={ViewerUtility.customPolygonLayerZIndex}
              onEachFeature={(feature, layer) => layer.on({ click: () => this.props.onFeatureClick(feature) })}
            />
          );        
        });
    }

    let standardTilesPromise = getGeometry(ViewerUtility.standardTileLayerType);
    let polygonPromise = getGeometry(ViewerUtility.polygonLayerType);
    let customPolygonPromise = getGeometry(ViewerUtility.customPolygonTileLayerType);

    Promise.all([standardTilesPromise, polygonPromise, customPolygonPromise])
      .then(results => {
        this.geoJsonElements = results;
        if (this.state.filterSettings.applyToMap) {
          this.props.onLayersChange(results, true);
        }

        this.setState({ geoMessageElements: geoMessageElements}, cb);
      });

  }

  createGeomessageElement = (message, feedMode) => {
    return (
      <GeoMessage
        key={message.id}
        user={this.props.user}
        map={this.props.map}
        message={message}
        type={feedMode ? message.type : this.props.element.type}
        isFeed={feedMode}
        onDeleteMessage={this.onDeleteMessage}
        onFlyTo={this.props.onFlyTo}
      />
    );
  }

  onNewMessage = (newMessage) => {
    let newGeoMessageElement = this.createGeomessageElement(newMessage, false);

    let newGeoMessageElements = [...this.state.geoMessageElements, newGeoMessageElement];

    this.setState({ geoMessageElements: newGeoMessageElements }, this.scrollGeoMessagesToBottom);
  }

  onDeleteMessage = (deletedMessage) => {
    let newGeoMessageElements = this.state.geoMessageElements.filter(
      x => x.props.message.id !== deletedMessage.id
    );
    
    this.setState({ geoMessageElements: newGeoMessageElements }, this.scrollGeoMessagesToBottom);
  }

  scrollGeoMessagesToBottom = () => {
    setTimeout(() => {
      let c = this.geomessagesContainerCard.current;
      c.scrollTop = c.scrollHeight;
    }, 10);
  }

  onGeoMessagesScroll = () => {
    if (!this.props.isFeed || this.noMoreFeedMessages || this.state.loading 
      || this.feedScrollLoading) {
      return;
    }

    let messagesContainer = this.geomessagesContainerCard.current;

    let diff = messagesContainer.scrollHeight - messagesContainer.scrollTop;

    if (diff > SCROLL_LOAD_THRESHOLD) {
      return;
    }

    this.feedScrollLoading = true;    

    let oldScrollHeight = messagesContainer.scrollHeight;

    this.getFeedMessages(() => {
      this.setState({ loading: false})
      setTimeout(messagesContainer.scrollTop = oldScrollHeight, 100);
      this.feedScrollLoading = false;
    })
      .catch(err => {
        console.error(err);
        this.setState({ loading: false });
      });
  }

  onFilterChange = (e, property, isCheckbox, refreshMode) => {
    let filterSettings = {
      ...this.state.filterSettings
    };

    if (!isCheckbox) {
      filterSettings[property] = e.target.value;
    }
    else {
      filterSettings[property] = e.target.checked;
    }

    if (this.getFeedMessagesTimer) {
      clearTimeout(this.getFeedMessagesTimer);
    }

    this.setState({ filterSettings: filterSettings }, () => {
      let refreshFunc = null;

      if (refreshMode === REFRESH_MODE.applyToMap) {
        if (this.state.filterSettings.applyToMap) {
          this.props.onLayersChange(this.geoJsonElements, true);
        }
        else {
          this.props.onLayersChange(null, true);
        }
        return;
      }
      else if (refreshMode === REFRESH_MODE.reconstructOnly) {
        refreshFunc = (cb) => this.constructGeoMessageElements(cb);
      }
      else if (refreshMode === REFRESH_MODE.full) {
        refreshFunc = (cb) => {
          this.feedPage = 1;
          this.noMoreFeedMessages = false;
          this.rawGeoMessages = [];
          this.getFeedMessages(cb)
            .catch(err => {
              console.error(err);
              this.setState({ loading: false });
            });
        };
      }

      let updateGeoMessages = () => {
        this.setState({ loading: true }, () => {
          refreshFunc(() => { this.setState({ loading: false })});
        });
      };
  
      this.getFeedMessagesTimer = setTimeout(updateGeoMessages, 1000);
    });    
  }

  onExpandClick = () => {
    this.setState({ filtersExpanded: !this.state.filtersExpanded});
  }

  renderFilterSection = () => {
    let filterSection = (
      <Card className='data-pane-card groups-filter-card'>
        <CardHeader
          className='data-pane-title-header groups-filter-card-header'
          title={
            <Typography variant="h6" component="h2" className='no-text-transform'>
              Filters
            </Typography>
          }
          action={
            <IconButton
              className={this.state.filtersExpanded ? 'expand-icon expanded' : 'expand-icon'}
              onClick={this.onExpandClick}
              aria-expanded={this.state.filtersExpanded}
              aria-label='Show'
            >
              <ExpandMoreIcon />
            </IconButton>
          }
        />
        <Collapse in={this.state.filtersExpanded}>
          <CardContent className='data-pane-card-content'>
            <Checkbox 
              color='primary'              
              onChange={(e) => this.onFilterChange(e, 'applyToMap', true, REFRESH_MODE.applyToMap)}
              checked={this.state.filterSettings.applyToMap}
            />
            Apply to map
            <FormControl className='card-form-control selector-single'>
              <InputLabel htmlFor='select-multiple-checkbox-groups'>Groups filter</InputLabel>
              <Select
                className='selector'
                multiple
                value={this.state.filterSettings.selectedGroups}
                onChange={(e) => this.onFilterChange(e, 'selectedGroups', false, REFRESH_MODE.full)}
                input={<Input id='select-multiple-checkbox-groups' />}
                renderValue={selected => selected.join(', ')}
              >
                {this.state.availableGroups.map(name => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={this.state.filterSettings.selectedGroups.includes(name)} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>              
            </FormControl>
            <FormControl className='card-form-control selector-single'>
              <InputLabel htmlFor='select-multiple-checkbox-forms'>Forms filter</InputLabel>
              <Select
                className='selector'
                multiple
                value={this.state.filterSettings.selectedForms}
                onChange={(e) => this.onFilterChange(e, 'selectedForms', false, REFRESH_MODE.reconstructOnly)}
                input={<Input id='select-multiple-checkbox-forms' />}
                renderValue={selected => selected.join(', ')}
              >
                {this.props.map.forms.map(form => (
                  <MenuItem key={form.formName} value={form.formName}>
                    <Checkbox checked={this.state.filterSettings.selectedForms.includes(form.formName)} />
                    <ListItemText primary={form.formName} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Collapse>              
      </Card>
    );

    return filterSection;
  }

  render() {
    if (this.props.home) {
      return null;
    }

    let isFeed = this.props.isFeed;
    let className = 'data-pane-card geomessage-messages-card';
    if (isFeed) {
      className += ' geomessage-messages-card-feed';
    }

    return (
      <div className='geomessage-control'>
        {isFeed ? this.renderFilterSection() : null}
        <Card 
          ref={this.geomessagesContainerCard} 
          className={className}
          onScroll={this.onGeoMessagesScroll}
        >
          {
            this.state.loading ?
              <CircularProgress className='loading-spinner'/> : 
              this.state.geoMessageElements
          }
        </Card>
        {
          !isFeed ? 
            <GeoMessageForm
              user={this.props.user}
              map={this.props.map}
              timestampRange={this.props.timestampRange}
              element={this.props.element}
              onNewMessage={this.onNewMessage}
            /> : null
        }

      </div>
    );
  }
}



export default GeoMessageControl;
