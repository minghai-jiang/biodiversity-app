import React, { Component, PureComponent } from 'react';
import PopupForm from '../../Popup-form/Popup-form';
import Moment from 'moment';
import FlyToControl from './FlyToControl';

import ApiManager from '../../../../ApiManager';

import './GeoMessage.css';

export default class GeoMessage extends PureComponent {
  constructor(props, context)
  {
    super(props, context)
    this.state = {
      messages: [],
    }
    this.type = '';
    if (this.props.properties.custom)
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

  getMessages = async () =>
  {
    let messages = [];
    let messagesPromise;

    let body = {
      mapId: this.props.properties.uuid,
    };

    if (this.props.properties.custom && this.props.properties.custom === true)
    {
      body.customPolygonIds = [this.props.properties.id];

      messagesPromise = ApiManager.fetch('POST', '/geoMessage/customPolygon/getMessages', body, this.props.user);
    }
    else if (this.props.properties.type && this.props.properties.type === 'Polygon')
    {
      body.polygonIds = [this.props.properties.id];

      messagesPromise = ApiManager.fetch('POST', '/geoMessage/polygon/getMessages', body, this.props.user);
    }
    else
    {
      body.tileIds = [{
        tileX: this.props.properties.tileX,
        tileY: this.props.properties.tileY,
        zoom: this.props.properties.zoom,
      }];
      
      messagesPromise = ApiManager.fetch('POST', '/geoMessage/tile/getMessages', body, this.props.user);
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
              messages.push(
                <Message key={message.id} info={message} map={this.props.map} user={this.props.user} trigger={this.messageTrigger}/>
              );
            }
          }
        }
      }
    }

    return messages.reverse();
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
    else {
      geoMessages.push(<div key='no-message-div' style={{ marginLeft: '1.5em', marginTop: '1em' }}>No messages</div>);
    }

    return(
      <div>
        {
          this.props.user ? 
          <PopupForm properties={this.props.properties} messageTrigger={this.messageTrigger}/> :
          null
        }
        {geoMessages}
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

  deleteMessage = async (e, info, trigger) =>
  {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    let url = '';
    let body = {}; 

    if (info.kind)
    {
      url = '/geoMessage/' + info.kind + '/deleteMessage';
      body = { mapId: info.uuid, id: info.id };
    }
    else
    {
      let type = info.type;
      if (info.type === 'custom polygon')
      {
        type = 'customPolygon';
      }

      url = '/geoMessage/' + type + '/deleteMessage';
      body = { mapId: info.mapId, id: info.uuid };
    }

    ApiManager.fetch('POST', url, body, this.props.user)
      .then(() => {
        trigger();
      });
  }

  getImage = (info) => {
    if (!info.thumbnail || info.gettingImage) {
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
      mapId: info.mapId ? info.mapId : info.uuid, 
      geoMessageId: info.mapId ? info.uuid : info.id
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

    ApiManager.fetch('POST', `/geoMessage/image`, body, this.props.user)
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
    let isOwnMessage = this.props.user && this.props.user.username === info.user;
    if (isOwnMessage) {
      className += ' own';
    }
    else {
      className += ' other';
    }

    let canDelete = (isOwnMessage && this.props.map.accessLevel >= 400) || (!isOwnMessage && this.props.map.accessLevel >= 600);

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

    return (
      <div className={className} key={info.id + 'container'}>
        {typeListItem}
        <div className='GeoMessage'>
          <div className='GeoName' key={info.id + 'name'}>{info.user}</div>     
          <div className='GeoUserGroup' key={info.id + 'userGroup'}>{userGroups}</div>
          <div className='GeoMessage' key={info.id + 'message'}>{info.message}</div>
          <table>
            <tr>
              <td>
              {
                info.thumbnail && !this.state.imageData ? 
                  <div className='GeoGetImage' key={info.id + 'thumbnail-li'} style={{ width: 'auto' }}>
                    <img src={info.thumbnail} key={info.id + 'thumbnail'} style={{'width': 'auto', 'cursor': 'zoom-in'}} onClick={() => this.getImage(info)}></img>
                  </div> :
                  null
              }
              </td>
              <td style={{ width: '100%', textAlign: 'right', verticalAlign: 'bottom' }}>
                <div>
                  <div className='GeoDate' key={info.id + 'date'}>{Moment(info.date).format('YYYY-MM-DD HH:mm')}</div>
                  {
                    canDelete ? (
                      <div className='GeoDelete'>
                        <img 
                          src='/images/trash.png' 
                          onClick={(event) => this.deleteMessage(event, info, this.props.trigger)}
                          style={{ width: '1.7em', opacity: '0.7', cursor: 'pointer' }}
                        />                      
                      </div>
                    ) : null
                  }
                </div>

              </td>
            </tr>
          </table>
          {
            this.state.imageData ? 
              <div id='lightbox' className={this.state.imageData ? 'GeoImage' : ''} key={info.id + 'image'} style={{'cursor': 'zoom-out'}} onClick={() => {this.setState({ imageData: null })}}>
                <img src={this.state.imageData}></img>
              </div> :
              null
          }
        </div>
      </div>
    );
  };
}