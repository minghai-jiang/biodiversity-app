import React, { PureComponent } from 'react';
import Papa from 'papaparse';

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

class GeoMessageControl extends PureComponent {

  geomessagesContainerCard = null;

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

    if (!this.props.element) {
      this.setState({ rawGeoMessages: null, geoMessageElements: null });
      return;
    }

    let differentElement = differentMap || DataPaneUtility.isDifferentElement(prevProps.element, this.props.element);

    if (differentElement) {
      this.setState({ loading: true }, this.getGeoMessages);
    }
  }

  getGeoMessages = () => {

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


    ApiManager.post(`/geoMessage/${urlType}/getMessages`, body, this.props.user)
      .then(result => {
        let rawGeoMessages = null;
        let geoMessageElements = [];

        if (result[0]) {
          rawGeoMessages = result[0].messages;

          for (let i = 0; i < rawGeoMessages.length; i++) {
            let message = rawGeoMessages[i];
            let deleted = message.deleteDate;

            if (!deleted) {
              geoMessageElements.push(
                <GeoMessage
                  key={message.id}
                  user={this.props.user}
                  map={this.props.map}
                  message={message}
                  type={element.type}
                />
              );
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

        this.setState({ 
          loading: false, 
          rawGeoMessages: rawGeoMessages, 
          geoMessageElements: geoMessageElements 
        },
        () => {
          let c = this.geomessagesContainerCard.current;
          c.scrollTop = c.scrollHeight;
        });
      })
      .catch(err => {
        this.setState({ loading: false, rawGeoMessages: null, geoMessageElements: null });
      });
  }

  render() {
    if (this.state.loading) {
      return <CircularProgress className='loading-spinner'/>;
    }

    return (
      <div className='geomessage-control'>
        <Card ref={this.geomessagesContainerCard} className='data-pane-card geomessage-messages-card'>
          {this.state.geoMessageElements}
        </Card>
        <GeoMessageForm
          user={this.props.user}
          map={this.props.map}
          element={this.props.element}
        />
      </div>
    );
  }
}



export default GeoMessageControl;
