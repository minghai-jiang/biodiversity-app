import React, { PureComponent } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';

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

class GeoMessageControl extends PureComponent {

  geomessagesContainerCard = null;

  feedPage = 1;
  noMoreFeedMessages = false;
  feedScrollLoading = false;

  constructor(props, context) {
    super(props, context);

    this.geomessagesContainerCard = React.createRef();

    this.state = {
      loading: false,

      rawGeoMessages: null,
      geoMessageElements: null,
      
      availableGroups: [],
      selectedGroups: []
    };
  }

  componentDidMount() {
    this.setState({ 
      loading: true,
      availableGroups: [...this.props.map.groups, NO_GROUP_NAME]
    }, this.getGeoMessages);
  }

  componentDidUpdate(prevProps) {
    let differentMap = this.props.map !== prevProps.map;

    if (differentMap) {
      this.setState({ 
        availableGroups: [...this.props.map.groups, NO_GROUP_NAME], 
        selectedGroups: []
      });
    }

    let update = false;

    if (this.props.isFeed) {
      update = !prevProps.isFeed || differentMap;
      if (update) {
        this.feedPage = 1;
        this.noMoreFeedMessages = false;
      }
    }
    else {
      if (!this.props.element && (this.state.rawGeoMessages || this.state.geoMessageElements)) {
        this.setState({ rawGeoMessages: null, geoMessageElements: null });
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

  getGeoMessages = () => {
    let geoMessagesPromise = null;

    if (!this.props.isFeed) {
      geoMessagesPromise = this.getElementMessages();
    }
    else {
      geoMessagesPromise = this.getFeedMessages();
    }

    geoMessagesPromise
      .then(results => {
        this.setState({ 
          loading: false, 
          rawGeoMessages: results.rawGeoMessages, 
          geoMessageElements: results.geoMessageElements 
        }, () => {
          if (!this.props.isFeed) {
            this.scrollGeoMessagesToBottom();
          }
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({ loading: false, rawGeoMessages: null, geoMessageElements: null });
      });
  }

  getElementMessages = () => {
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

        return {
          rawGeoMessages: rawGeoMessages,
          geoMessageElements: geoMessageElements
        };
      }); 
  }

  getFeedMessages = () => {
    let body = {
      mapId: this.props.map.id,
      page: this.feedPage,
      userGroups: this.state.selectedGroups
    };

    this.feedPage = this.feedPage + 1;

    return ApiManager.post(`/geoMessage/feed`, body, this.props.user)
      .then(result => {
        let rawGeoMessages = result;
        let geoMessageElements = [];

        if (result.length === 0) {
          this.noMoreFeedMessages = true;
        }

        for (let i = 0; i < rawGeoMessages.length; i++) {
          let message = rawGeoMessages[i];
          let deleted = message.deleteDate;

          if (!deleted) {
            geoMessageElements.push(this.createGeomessageElement(message, true));
          }
        }

        return {
          rawGeoMessages: rawGeoMessages,
          geoMessageElements: geoMessageElements
        };
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

    this.getFeedMessages()
      .then(results => {
        this.setState({ 
          loading: false, 
          rawGeoMessages: [...this.state.rawGeoMessages, ...results.rawGeoMessages], 
          geoMessageElements: [...this.state.geoMessageElements, ...results.geoMessageElements] 
        }, () => {
          setTimeout(messagesContainer.scrollTop = oldScrollHeight, 100);
          this.feedScrollLoading = false;
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({ loading: false, rawGeoMessages: null, geoMessageElements: null });
      });
  }

  onSelectGroup = (e) => {
    let selectedGroups = e.target.value;
    this.setState({ selectedGroups: selectedGroups });

    if (this.getFeedMessagesTimer) {
      clearTimeout(this.getFeedMessagesTimer);
    }

    this.getFeedMessagesTimer = setTimeout(() => {
      this.feedPage = 1;
      this.noMoreFeedMessages = false;
      this.setState({ loading: true }, () => {
        this.getFeedMessages()
          .then(results => {
            this.setState({ 
              loading: false, 
              rawGeoMessages: [results.rawGeoMessages], 
              geoMessageElements: [results.geoMessageElements] 
            });
          })
          .catch(err => {
            console.error(err);
            this.setState({ loading: false, rawGeoMessages: null, geoMessageElements: null });
          });;
      })
    }, 1000)
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
        {
          isFeed ? 
            <Card className='data-pane-card groups-filter-card'>
              <CardContent>
                <FormControl className='card-form-control selector-single'>
                  <InputLabel htmlFor='select-multiple-checkbox'>Groups filter</InputLabel>
                  <Select
                    className='selector'
                    multiple
                    value={this.state.selectedGroups}
                    onChange={this.onSelectGroup}
                    input={<Input id='select-multiple-checkbox' />}
                    renderValue={selected => selected.join(', ')}
                  >
                    {this.state.availableGroups.map(name => (
                      <MenuItem key={name} value={name}>
                        <Checkbox checked={this.state.selectedGroups.includes(name)} />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card> : null
        }
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
