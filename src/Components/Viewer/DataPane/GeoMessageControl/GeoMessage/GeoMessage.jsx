import React, { PureComponent } from 'react';
import Moment from 'moment';

import { 
  Card,  
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  Collapse,
  IconButton,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import ClearIcon from '@material-ui/icons/ClearOutlined';

import Utility from '../../../../../Utility';
import ViewerUtility from '../../../ViewerUtility';
import DataPaneUtility from '../../DataPaneUtility';

import './GeoMessage.css';
import ApiManager from '../../../../../ApiManager';


class GeoMessage extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      showImage: false,

      loadingImage: false,
      fullImage: null,

      fullImageAsThumbnail: false
    };
  }

  componentDidMount() {
    if (this.props.message.fullImage && !this.state.fullImageAsThumbnail) {
      this.setState({ fullImage: this.props.message.fullImage, fullImageAsThumbnail: true });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.message !== this.props.message) {
      if (this.props.message.fullImage && !this.state.fullImageAsThumbnail) {
        this.setState({ fullImage: this.props.message.fullImage, fullImageAsThumbnail: true });
      }
      else {
        this.setState({ fullImage: null, fullImageAsThumbnail: false });
      }
    }
  }

  showImage = () => {
    if (this.state.loadingImage) {
      return;
    }

    if (!this.state.fullImage) {
      this.setState({ loadingImage: true}, () => {
        this.getImageData()
          .then(fullImageBlob => {
            let reader = new FileReader();
            reader.readAsDataURL(fullImageBlob); 
            reader.onloadend = () => {
                let fullImage = reader.result;
                this.setState({ 
                  showImage: true, 
                  loadingImage: false, 
                  fullImage: fullImage 
                });
            };
          })
          .catch(err => {
            this.setState({ loadingImage: false });
          });
      });

    }
    else {
      this.setState({ showImage: true });
    }
  }

  getImageData = () => {
    let body = { 
      mapId: this.props.map.id, 
      geoMessageId: this.props.message.id,
      type: this.props.type
    };

    return ApiManager.post('/geoMessage/image', body, this.props.user);
  }

  onLightboxClose = () => {
    this.setState({ showImage: false });
  }

  onDeleteMessage = () => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    let body = {
      mapId: this.props.map.id,
      id: this.props.message.id
    };

    let urlType = null;
    if (this.props.type === ViewerUtility.standardTileLayerType) {
      urlType = 'tile';
    }
    else if (this.props.type === ViewerUtility.polygonLayerType) {
      urlType = 'polygon';
    }
    else if (this.props.type === ViewerUtility.customPolygonTileLayerType) {
      urlType = 'customPolygon';
    }
    else {
      return;
    }

    ApiManager.post(`/geomessage/${urlType}/deleteMessage`, body, this.props.user)
      .then(() => {
        this.props.onDeleteMessage(this.props.message);
      });
  }

  render() {
    let message = this.props.message;

    let isOwnCard = this.props.user && message.user.toLowerCase() === this.props.user.username.toLowerCase();
    let mayDelete = isOwnCard || this.props.map.accessLevel >= ApiManager.accessLevels.deleteGeomessages;

    let cardClass = 'geomessage-card';
    if (isOwnCard) {
      cardClass += ' geomessage-card-own';
    }

    let imageElement = null;
    if (message.thumbnail) {
      imageElement = (
        <div className='geomessage-card-thumbnail' onClick={this.showImage}>
          <img src={message.thumbnail}/>
          {this.state.loadingImage ? <CircularProgress className='loading-spinner'/> : null}
        </div>
      )
    }

    return (
      <div>
        <Card className={cardClass}>
          <CardHeader
            className='geomessage-card-header'
            title={
              <div className='geomessage-card-title'>
                {message.user}
              </div>
            }
            subheader={
              <div className='geomessage-card-subtitle'>
                {Moment(message.date).format('YYYY-MM-DD')}
              </div>
            }
            action={
              mayDelete ? 
                <CardActions className='geomessage-card-actions'>
                  <IconButton 
                    className='geomessage-card-action-button' 
                    aria-label='Delete'
                    onClick={this.onDeleteMessage}
                  >
                    <DeleteIcon/>
                  </IconButton>
                </CardActions> : null
            }
          />
          <CardContent className='geomessage-card-content'>
            <div>
              {message.message}
            </div>
            {imageElement}
          </CardContent>
        </Card>
         {
          this.state.fullImage && this.state.showImage ?
            <div className='geomessage-lightbox' onClick={this.onLightboxClose}>
              <div className='geomessage-lightbox-close-button'>
                <IconButton
                  onClick={this.onLightboxClose}
                  color='secondary'
                  aria-label='Close'
                >
                  <ClearIcon />
                </IconButton>
              </div>
              <img className='geomessage-lightbox-image' src={this.state.fullImage}></img>
            </div> :
            null
          }
      </div>

    )
  }
}

export default GeoMessage;
