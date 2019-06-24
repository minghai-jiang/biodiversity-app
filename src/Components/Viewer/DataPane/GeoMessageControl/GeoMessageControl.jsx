import React, { PureComponent } from 'react';

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
      
    };
  }

  componentDidMount() {
    this.setState({ loading: true }, this.getGeoMessages);
  }

  componentDidUpdate(prevProps) {
    let differentMap = this.props.map !== prevProps.map;

    let update = false;

    if (this.props.action === ViewerUtility.dataPaneAction.feed) {
      update = differentMap;
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
      let differentAction = prevProps.action !== this.props.action;

      update = differentMap || differentElement || differentAction;
    }

    if (update) {
      this.setState({ loading: true }, this.getGeoMessages);
    }
  }

  getGeoMessages = () => {
    let geoMessagesPromise = null;

    if (this.props.action === ViewerUtility.dataPaneAction.geoMessage) {
      geoMessagesPromise = this.getElementMessages();
    }
    else if (this.props.action === ViewerUtility.dataPaneAction.feed) {
      geoMessagesPromise = this.getFeedMessages();
    }
    else {
      return;
    }

    geoMessagesPromise
      .then(results => {
        this.setState({ 
          loading: false, 
          rawGeoMessages: results.rawGeoMessages, 
          geoMessageElements: results.geoMessageElements 
        }, () => {
          if (this.props.action !== ViewerUtility.dataPaneAction.feed) {
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
      page: this.feedPage
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
    if (this.props.action !== ViewerUtility.dataPaneAction.feed) {
      return;
    }

    if (this.noMoreFeedMessages) {
      return;
    }

    if (this.state.loading) {
      return;
    }

    let c = this.geomessagesContainerCard.current;

    let diff = c.scrollHeight - c.scrollTop;

    if (diff > SCROLL_LOAD_THRESHOLD) {
      return;
    }

    if (this.feedScrollLoading) {
      return;
    }

    this.feedScrollLoading = true;    

    let oldScrollHeight = c.scrollHeight;

    this.getFeedMessages()
      .then(results => {
        this.setState({ 
          loading: false, 
          rawGeoMessages: [...this.state.rawGeoMessages, ...results.rawGeoMessages], 
          geoMessageElements: [...this.state.geoMessageElements, ...results.geoMessageElements] 
        }, () => {
          setTimeout(c.scrollTop = oldScrollHeight, 100);
          this.feedScrollLoading = false;
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({ loading: false, rawGeoMessages: null, geoMessageElements: null });
      });
  }

  render() {
    if (this.state.loading) {
      return <CircularProgress className='loading-spinner'/>;
    }

    return (
      <div className='geomessage-control'>
        <Card 
          ref={this.geomessagesContainerCard} 
          className='data-pane-card geomessage-messages-card'
          onScroll={this.onGeoMessagesScroll}
        >
          {this.state.geoMessageElements}
        </Card>
        <GeoMessageForm
          user={this.props.user}
          map={this.props.map}
          timestampRange={this.props.timestampRange}
          element={this.props.element}
          onNewMessage={this.onNewMessage}
        />
      </div>
    );
  }
}



export default GeoMessageControl;
