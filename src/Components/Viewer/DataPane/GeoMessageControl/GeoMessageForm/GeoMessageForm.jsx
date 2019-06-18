import React, { PureComponent } from 'react';
import Moment from 'moment';
import { readAndCompressImage } from 'browser-image-resizer';

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
  TextField,
  Input
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';

import Utility from '../../../../../Utility';
import ViewerUtility from '../../../ViewerUtility';
import DataPaneUtility from '../../DataPaneUtility';

import './GeoMessageForm.css';
import ApiManager from '../../../../../ApiManager';

const IMAGE_MIME_TYPES = ['image/gif', 'image/jpeg', 'image/png'];
const MAX_IMAGE_DIMENSIONS = {
  width: 1920,
  height: 1080
};
const MAX_IMAGE_SIZE = 10000000;

class GeoMessageForm extends PureComponent {

  uploadedImage = null;

  fileUploadRef = null;

  constructor(props, context) {
    super(props, context);

    // this.messageInputRef = React.createRef();
    this.fileUploadRef = React.createRef();

    this.state = {
      expanded: false,
      loading: false,

      hasPermissions: false,
      messageText: null
    };
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
  }

  toggleExpand = () => {
    this.setState({ expanded: !this.state.expanded });
  }

  onImageChange = (e) => {
    e.preventDefault();

    let file = e.target.files[0];
    
    if (!IMAGE_MIME_TYPES.includes(file.type)) {
      alert('Invalid image type.');
      return;
    }

    this.setState({ loading: true }, () => {
      const imgConfig = {
        quality: 0.8,
        maxWidth: MAX_IMAGE_DIMENSIONS.width,
        maxHeight: MAX_IMAGE_DIMENSIONS.height,
        autoRotate: true
      };

      readAndCompressImage(file, imgConfig)
        .then(image => {

          if (image.size > MAX_IMAGE_SIZE) {
            alert(`Image too large (max ${(MAX_IMAGE_SIZE / 1000).toFixed(2)} MB).`);
            this.setState({ loading: false });
            return;
          }

          return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = function() {
              resolve(reader.result);
            };
            reader.readAsDataURL(image);
          });
        })
        .then(base64 => {
          this.uploadedImage = base64;
          this.setState({ loading: false });
        })
        .catch(err => {
          this.setState({ loading: false });          
          alert('Invalid image type.');
        });
    });
  }

  onGeoMessageSubmit = () => {
    this.setState({ loading: true }, () => {

      let timestamp = this.props.map.timestamps[this.props.timestampRange.end];

      let body = {
        mapId: this.props.map.id,
        timestamp: timestamp.timestampNumber,
        message: this.state.messageText,
        image: this.uploadedImage
      };
      
      let element = this.props.element;
      let elementProperties = element.feature.properties;
      let urlType = null;

      if (element.type === ViewerUtility.standardTileLayerType) {
        body.tileX = elementProperties.tileX;
        body.tileY = elementProperties.tileY;
        body.zoom = elementProperties.zoom;
  
        urlType = 'tile';
      }
      else if (element.type === ViewerUtility.polygonLayerType) {
        body.polygonId = elementProperties.id;
  
        urlType = 'polygon';
      }
      else if (element.type === ViewerUtility.customPolygonTileLayerType) {
        body.customPolygonId = elementProperties.id;        
  
        urlType = 'customPolygon';
      }
      else {
        return;
      }

      ApiManager.post(`/geomessage/${urlType}/addMessage`, body, this.props.user)
        .then(result => {
          let newMessage = {
            id: result.id,
            user: this.props.user.username,
            message: this.state.messageText,
            thumbnail: this.uploadedImage,
            fullImage: this.uploadedImage,
            date: Moment().format()
          };

          this.props.onNewMessage(newMessage);

          this.fileUploadRef.current.value = '';
          this.setState({ expanded: false, loading: false, messageText: '' });
        })
        .catch(err => {
          alert('An error occurred while adding a GeoMessage.');
          this.fileUploadRef.current.value = '';
          this.setState({ loading: false });
        });
    });
  }

  onMessageChange = (e) => {
    this.setState({ messageText: e.target.value });
  }

  render() {
    let user = this.props.user;
    let hasAddPermission = user && this.props.map.accessLevel >= ApiManager.accessLevels.addGeoMessages;
    let hasAddImagePermission = user && this.props.map.accessLevel >= ApiManager.accessLevels.addGeoMessageImage;

    let title = 'Add GeoMessage';
    if (!user) {
      title = 'Please login';
    }
    else if (!hasAddPermission) {
      title = 'Insufficient access';
    }

    let cardClassName = 'data-pane-card geomessage-form-card';
    if (this.state.expanded) {
      cardClassName += ' geomessage-form-card-expanded';
    }

    return (
      <Card className={cardClassName}>
        <CardHeader
          className='geomessage-form-card-header'
          title={
            !this.state.expanded ? 
              <Button 
                className='geomessage-add-expand-button'
                variant='outlined' 
                onClick={this.toggleExpand} 
                disabled={!hasAddPermission}
              >
                {title}
              </Button> : 
              <div className='geomessage-expanded-title'>
                Add GeoMessage
              </div>
          }
          action={
            this.state.expanded ?
              <IconButton
                className={this.state.expanded ? 'expand-icon' : 'expand-icon expanded'}
                onClick={this.toggleExpand}
                aria-expanded={this.state.expaneded}
                aria-label='Expand'
              >
                <ClearIcon />
              </IconButton> : null
          }
        />
        <Collapse in={this.state.expanded}>
          <CardContent className='data-pane-card-content'>
            <TextField
              className='geomessage-text-input-form'
              label='Message'
              multiline
              InputProps={{
                className: 'geomessage-text-input'
              }}
              value={this.state.messageText}
              onChange={this.onMessageChange}
            />
            <div className='geomessage-form-card-item'>
            {
              hasAddImagePermission ?
                <div>
                  <div className='geomessage-upload-image-label'>
                    Upload image
                  </div>
                  <input 
                    ref={this.fileUploadRef} 
                    type='file' 
                    accept='image/*' 
                    onChange={this.onImageChange}
                  />
                </div>
                : 'Insufficient permissions to add image'
            }
            </div>  
            <Button 
              className='geomessage-form-card-item geomessage-submit-button'
              variant='contained' 
              color='primary'
              onClick={this.onGeoMessageSubmit}
              disabled={this.state.loading}
            >
              Submit
            </Button>
            { this.state.loading ? <CircularProgress className='loading-spinner'/> : null}
          </CardContent>
        </Collapse>
      </Card>
    )
  }
}

export default GeoMessageForm;
