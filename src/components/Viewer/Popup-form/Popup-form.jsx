import React, { Component } from "react";
import QueryUtil from '../../Utilities/QueryUtil';

import "./Popup-form.css";

export class PopupForm extends Component {

constructor(props) {
    super(props);
    this.state = {
      text: '',
      clouds: false,
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
    let props = this.props.props;

    let feedbackResult = await QueryUtil.postData(
    props.apiUrl + 'feedback/error/add',
    {
      mapId:  props.uuid,
      timestamp: props.timestamp,
      tileX: props.tileX,
      tileY: props.tileY,
      zoom: props.zoom,
      isMask: this.state.clouds,
      message: this.state.text,
    }, props.headers
  );

    let notification; let type;
    if(feedbackResult === 'OK')
    {
      type = 'notification';
      notification = 'Thanks for submitting this error';
    }

    this.setState({text: '', clouds: false, notification: {type: type, text: notification}});
    this.forceUpdate();
  }

  render() {
    let props = this.props.props;
    const id = props.tileX + '.' + props.tileY + '.' + props.zoom;
    
    return (
      <div id='formDiv'>
        <form key={id} id='popupForm' onSubmit={this.handleSubmit}>
          <h3>What's wrong with this square?</h3>
          <label>
            <input type="checkbox" name="clouds" checked={this.state.clouds} onChange={this.handleChange}/>
            This is a problem with clouds
            <br/>
          </label>
          <label>
            <h4>Give a small description of the mistake</h4>
            <textarea name="text" value={this.state.text} onChange={this.handleChange} placeholder='A small description of the mistake.' maxLength='3000'/>
          </label><br/>
          <input type="submit" value="Submit" className="button"/>
        </form>
        <div className={this.state.notification.type}>{this.state.notification.text}</div>
      </div>
    );
  }
}

export default PopupForm;
