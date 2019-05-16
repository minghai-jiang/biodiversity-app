import React, { Component, PureComponent } from 'react';
import PopupForm from '../../Popup-form/Popup-form';
import QueryUtil from '../../../Utilities/QueryUtil';
import Moment from 'moment';
import FlyToControl from './FlyToControl';

import './GeoMessage.css';

export default class GeoMessage extends PureComponent {
  constructor(props, context)
  {
    super(props, context)
    this.state =
    {
      messages: [],
    }
    this.type = '';
    if(this.props.properties.custom)
    {
      this.type = 'customPolygon';
    }
    else
    {
      this.type = this.props.properties.kind;
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
    let messages = [];
    let messagesPromise;

    if(this.props.properties.custom && this.props.properties.custom === true)
    {
      messagesPromise = await QueryUtil.postData(
        this.props.properties.apiUrl + 'geoMessage/customPolygon/getMessages',
        {
          mapId: this.props.properties.uuid,
          customPolygonIds: [this.props.properties.id]
        },
        this.props.properties.headers 
      );
    }
    else if (this.props.properties.type && this.props.properties.type === 'Polygon')
    {
      messagesPromise = await QueryUtil.postData(
        this.props.properties.apiUrl + 'geoMessage/polygon/getMessages',
        {
          mapId: this.props.properties.uuid,
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

            if (typeof(message.deleteDate) !== 'string')
            {            
              message.kind = this.type;
              message.uuid = this.props.properties.uuid;
              message.headers = this.props.properties.headers;
              message.apiUrl = this.props.properties.apiUrl;
              messages.push(<Message key={message.id} info={message} user={this.props.user} trigger={this.messageTrigger}/>);
            }
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

export class Message extends Component {
  constructor(props, context)
  {
    super(props, context)
    this.state = {
      imageData: null
    }
  };

  deleteMessage = async(e, info, trigger) =>
  {

    let url = '';
    let body = {}; 

    if(info.kind)
    {
      url = info.apiUrl + 'geoMessage/' + info.kind + '/deleteMessage';
      body = { mapId: info.uuid, id: info.id };
    }
    else
    {
      let type = info.type;
      if(info.type === 'custom polygon')
      {
        type = 'customPolygon';
      }

      url = info.apiUrl + 'geoMessage/' + type + '/deleteMessage';
      body = { mapId: info.mapId, id: info.uuid };
    }

    let messagesDeletePromise= await QueryUtil.postData(
      url,
      body,
      info.headers 
    );

    if (await messagesDeletePromise === 'OK')
    {
      trigger();
    }
  }

  getImage = (info) => {
    if (!info.image || info.gettingImage) {
      return;
    }

    if (info.imageData) {
      if (this.state.imageData) {
        this.setState({ imageData: null });
      }
      else {
        this.setState({ imageData: info.imageData });
      }
      return;
    }

    info.gettingImage = true;

    let body = { 
      mapId: info.uuid, 
      geoMessageId: info.id
    };    

    if (info.type) {
      body.type = info.type
    }
    else if (info.kind === 'customPolygon') {
      body.type = 'custom polygon';
    }
    else {
      body.type = info.kind;
    }

    QueryUtil.postData(`${info.apiUrl}geoMessage/image`, body, info.headers)
      .then(imageData => {
        info.imageData = imageData.image;
        info.gettingImage = false;
        this.setState({ imageData: imageData.image });
      })
      .catch(err => {
        info.gettingImage = false;
        alert('An error occurred while getting image.');
      })


  }

  render = () => 
  {
    let propsList = [];
    let loopObj = {
      processed: 'processed',
      mask: 'isMask',
      classification: 'isClassification',
    };

    let info = this.props.info;

    for (let key in loopObj) {
      if (info && info[loopObj[key]]) {
        propsList.push(<li className={key} key={info.id + key}>{key}</li>)
      };
    }

    let userGroups = '';
    if (info.userGroups) {    
      for (var i = 0; i < info.userGroups.length; i++) {
        userGroups += info.userGroups[i];
      }
    }

    let className = 'messageContainer';
    if (this.props.user && this.props.user.username === info.user) {
      className += ' own';
    }
    else {
      className += ' other';
    }

    let typeListItem = [];
    if (info && info.type) {
      let showID = info.elementId;

      if (info.type === 'tile') {
        showID = 'tileX:' + info.elementId.tileX + ' tileY: ' + info.elementId.tileY;
      }

      typeListItem.push(
        <div className='GeoType' key={info.id + 'type'}>
          <button className='button linkButton' onClick={() => FlyToControl.flyTo(info.type, info.elementId)}>
            <h1>{info.type}</h1>
            <span>{showID}</span>
          </button>
        </div>);
    }

    return(
      <div className={className} key={info.id + 'container'}>
        {typeListItem}
        <ul key={info.id + 'messageList'}>
          <li className='GeoName' key={info.id + 'name'}>{info.user}</li>
          <li className='GeoUserGroup' key={info.id + 'userGroup'}>{userGroups}</li>
          <li className='GeoMessage' key={info.id + 'message'}>{info.message}</li>
          <ul className='GeoPropsList' key={info.id + 'propsList'}>
            {propsList}
          </ul>
          <li className='GeoLayer' key={info.id + 'layer'}>{info.layer}</li>
          <li className='GeoDate' key={info.id + 'date'}>{Moment(info.date).format('DD-MM-YYYY HH:mm')}</li>
          <li className='GeoGetImage' key={info.id + 'image'}>
            <button key={info.id + 'delete'} onClick={() => this.getImage(info)} disabled={!info.image}>          
              View image
            </button>
          </li>
          <li className='GeoDelete'>
            <button key={info.id + 'delete'} className='button' onClick={(event) => this.deleteMessage(event, info, this.props.trigger)}>
              Delete
            </button>
          </li>
          <li className={this.state.imageData ? 'GeoImage' : ''}>
            <img src={this.state.imageData}></img>
          </li>
        </ul>
      </div>
    );
  };
}