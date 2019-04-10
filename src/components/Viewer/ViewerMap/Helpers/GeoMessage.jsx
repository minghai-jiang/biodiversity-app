import React, { Component, PureComponent } from 'react';
import PopupForm from '../../Popup-form/Popup-form';
import QueryUtil from '../../../Utilities/QueryUtil';
import Moment from 'moment';

import './GeoMessage.css';

export default class GeoMessage extends PureComponent {
  constructor(props, context)
  {
    super(props, context)
    this.state =
    {
      messages: [],
    }
  };

  scrollToBottom()
  {
    if (this.messageList)
    {
      const scrollHeight = this.messageList.scrollHeight;
      const height = this.messageList.clientHeight;
      const maxScrollTop = scrollHeight - height;
      this.messageList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  };

  componentDidUpdate()
  {
    this.scrollToBottom();
  }

  getMessages = async() =>
  {
    console.log('getMessages', this.props)
    let messages = [];
    let messagesPromise;

    if (this.props.properties.type && this.props.properties.type === 'Polygon')
    {
      messagesPromise = await QueryUtil.postData(
        this.props.properties.apiUrl + 'geoMessage/polygon/getMessages',
        {
          mapId: this.props.properties.uuid,
          timestamp: this.props.properties.timestamp,
          polygonIds: [this.props.properties.id],
        },
        this.props.properties.headers 
      );
    }
    else
    {
      messagesPromise = await QueryUtil.postData(
        this.props.properties.apiUrl + 'geoMessage/tile/getMessages',
        {
          mapId: this.props.properties.uuid,
          tileIds: [{
            tileX: this.props.properties.tileX,
            tileY: this.props.properties.tileY,
            zoom: this.props.properties.zoom,
          }],
        },
        this.props.properties.headers 
      );
    }


    let allMessagesInfo = await messagesPromise;
    if (allMessagesInfo)
    {
      for (let i = 0; i < allMessagesInfo.length; i++)
      {
        let messageInfo = allMessagesInfo[i];
        if (messageInfo.messages)
        {        
          for (let j = 0; j < messageInfo.messages.length; j++)
          {
            let message = messageInfo.messages[j];
            messages.push(<Message key={message.id} info={message} user={this.props.user}/>);
          }
        }
      }
    }

    return(messages)
  };

  componentWillMount = async() =>
  {
    let messages = await this.getMessages();
    this.setState({messages: messages});
  };

  messageTrigger = async() =>
  {
    let messages = await this.getMessages();
    this.setState({messages: messages});
  }

  render = () => 
  {
    let geoMessages = [];
    if (this.state.messages.length > 0)
    {
      geoMessages.push(
        <div
          className='GeoMessageContainer'
          key='GeoMessageContainer'
          ref={(div) => {this.messageList = div;}}
        >
          {this.state.messages}
        </div>
      )
    }

    return(
      <div>
        {geoMessages}
        <PopupForm properties={this.props.properties} messageTrigger={this.messageTrigger}/>
      </div>
    );
  };
}

class Message extends Component {
  constructor(props, context)
  {
    super(props, context)
    this.state =
    {

    }
  };

  render = () => 
  {
    let propsList = [];
    let loopObj = {
      processed: 'processed',
      mask: 'isMask',
      classification: 'isClassification',
    };

    for (let key in loopObj)
    {
      if(this.props.info && this.props.info[loopObj[key]]){propsList.push(<li className={key} key={this.props.info.id + key}>{key}</li>)};
    }

    let userGroups = '';
    for (var i = 0; i < this.props.info.userGroups.length; i++)
    {
      userGroups += this.props.info.userGroups[i];
    }

    let className = 'messageContainer';
    if (this.props.user.username === this.props.info.user)
    {
      className += ' own';
    }

    return(
      <div className={className} key={this.props.info.id + 'container'}>
        <ul key={this.props.info.id + 'messageList'}>
          <li className='GeoName' key={this.props.info.id + 'name'}>{this.props.info.user}</li>
          <li className='GeoUserGroup' key={this.props.info.id + 'userGroup'}>{userGroups}</li>
          <li className='GeoMessage' key={this.props.info.id + 'message'}>{this.props.info.message}</li>
          <ul className='GeoPropsList' key={this.props.info.id + 'propsList'}>
            {propsList}
          </ul>
          <li className='GeoDate' key={this.props.info.id + 'date'}>{Moment(this.props.info.date).format('DD-MM-YYYY HH:mm')}</li>
        </ul>
      </div>
    );
  };
}