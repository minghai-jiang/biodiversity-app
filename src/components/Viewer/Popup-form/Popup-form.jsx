import React, { Component } from "react";
import QueryUtil from '../../Utilities/QueryUtil';

import "./Popup-form.css";

export class PopupForm extends Component {

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


  async handleSubmit(event) {
    event.preventDefault();
    let props = this.props.properties;
    let feedbackResult;

    if(props.type === 'Polygon')
    {
      feedbackResult = await QueryUtil.postData(
        props.apiUrl + 'geoMessage/polygon/addMessage',
        {
          mapId:  props.uuid,
          timestamp: props.timestamp,
          polygonId: props.id,
          isMask: this.state.clouds,
          isClassification: this.state.classification,
          message: this.state.text,
        }, props.headers
      );
    }
    else
    {
      feedbackResult = await QueryUtil.postData(
        props.apiUrl + 'geoMessage/tile/addMessage',
        {
          mapId:  props.uuid,
          timestamp: props.timestamp,
          tileX: props.tileX,
          tileY: props.tileY,
          zoom: props.zoom,
          isMask: this.state.clouds,
          isClassification: this.state.classification,
          message: this.state.text,
        }, props.headers
      );
    }

    let notification; let type;
    if(feedbackResult === 'OK')
    {
      type = 'notification';
      notification = 'Thanks for submitting this error';
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
          <input type="submit" value="Submit" className="button"/>
        </form>
        <div key={id + 'notification' + this.state.notification.text} className={this.state.notification.type}>{this.state.notification.text}</div>
      </div>
    );
  }
}

export default PopupForm;
