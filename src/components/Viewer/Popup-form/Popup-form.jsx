import React, { Component } from "react";
import Jimp from 'jimp';

import QueryUtil from '../../Utilities/QueryUtil';

import "./Popup-form.css";

export class PopupForm extends Component {

  loadingImage = false;
  imageResult = null;

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      clouds: false,
      classification: false,
      notification: {
        type: 'hidden',
        text: '',
      },
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event)
  {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    // if (file.size > 2000000) {
    //   alert('Image too large (max 2 MB).');
    //   return;
    // }

    this.loadingImage = true;

    reader.onloadend = () => {
      let buffer = Buffer.from(reader.result.split(',')[1], 'base64');
      Jimp.read(buffer)        
        .then(image => {
          if (image.bitmap.width > 1920 || image.bitmap.height > 1080) {
            return image.scaleToFit(1920, 1080);
          }
          else {
            return image;
          }
        })
        .then(image => {
          return image.getBufferAsync(Jimp.MIME_JPEG);
        })
        .then(imageBuffer => {
          let maxSize = 5 * 1000 * 1000; // 5 MB
          if (imageBuffer.length > maxSize) {
            alert(`Image too large (max ${maxSize} MB).`);
            return;
          }

          let base64 = imageBuffer.toString('base64');

          this.imageResult = base64;
          this.loadingImage = false;
        })
        .catch(err => {
          this.loadingImage = false;
          alert('Invalid image type.');
        });
    }

    reader.readAsDataURL(file);
  }


  async handleSubmit(event) {
    event.preventDefault();

    if (this.loadingImage) {
      alert('Image is done loading. Try again in a few moments.');
      return;
    }

    let props = this.props.properties;
    let feedbackResult;

    let body = {
      mapId:  props.uuid,
      timestamp: props.timestamp,
      isMask: this.state.clouds,
      isClassification: this.state.classification,
      message: this.state.text,
    }

    if (this.imageResult) {
      body.image = this.imageResult;
    }

    if (props.custom === true)
    {
      body.customPolygonId = props.id;

      feedbackResult = await QueryUtil.postData(
        props.apiUrl + 'geoMessage/customPolygon/addMessage', 
        body, 
        props.headers
      );
    }
    else if(props.type === 'Polygon')
    {
      body.polygonId = props.id;

      feedbackResult = await QueryUtil.postData(
        props.apiUrl + 'geoMessage/polygon/addMessage', 
        body, 
        props.headers
      );
    }
    else
    {
      body.tileX = props.tileX;
      body.tileY = props.tileY;
      body.zoom = props.zoom;

      feedbackResult = await QueryUtil.postData(
        props.apiUrl + 'geoMessage/tile/addMessage',
        body,
        props.headers
      );
    }

    let notification; let type;
    if(feedbackResult === 'OK')
    {
      type = 'notification';
      notification = 'Thanks for submitting this message';
    }

    this.setState({text: '', clouds: false, classification: false, notification: {type: type, text: notification}});

    this.props.messageTrigger();
  }

  render() {
    let props = this.props.properties;
    const id = props.tileX + '.' + props.tileY + '.' + props.zoom;
    
    return (
      <div id='formDiv'>
        <form key={id} id='popupForm' onSubmit={this.handleSubmit}>
          <label>
            <h3>Type a GeoMessage</h3>
            <textarea name="text" value={this.state.text} onChange={this.handleChange} placeholder='GeoMessage' maxLength='3000'/>
          </label><br/>
          <h4>Is there something wrong?</h4>
          <p>There is a problem with:</p>
          <label>
            <input type="checkbox" name="clouds" checked={this.state.clouds} onChange={this.handleChange}/>
              Clouds
            <br/>
          </label>
          <label>
            <input type="checkbox" name="classification" checked={this.state.classification} onChange={this.handleChange}/>
              Classification
            <br/>
          </label>
          <div>
            <input type="file" accept='image/*' onChange={(e)=>this.handleImageChange(e)} />
          </div>
          <div>
            <input type="submit" value="Submit" className="button"/>
          </div>
        </form>
        <div key={id + 'notification' + this.state.notification.text} className={this.state.notification.type}>{this.state.notification.text}</div>
      </div>
    );
  }
}

export default PopupForm;
