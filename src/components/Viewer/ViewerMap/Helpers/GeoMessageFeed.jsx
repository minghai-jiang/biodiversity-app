import React, { PureComponent} from 'react';
import { Portal } from "react-leaflet-portal";
import Select from 'react-select';
import cloneDeep from 'lodash.clonedeep';
import { isMobile } from 'react-device-detect';


import {Message} from './GeoMessage';

import QueryUtil from '../../../Utilities/QueryUtil';

let GeoMessageFeedElements = [];
let returnChecked = (value) => {};
let GeoMessageFeed_map = null;
let GeoMessageFeed_props = {};
let GeoMessageFeed_page = 1;
let GeoMessageFeed_groups = null;
let GeoMessageFeed_selectedGroups = null;
let GeoMessageFeed_list;
let returnFeed = (value) => {};
let loadMore = () => {};


/*let flyToControl_map = null;
let flyToControl_mapRef = null;
let flyToElements = [];
let flyToType = 'middle';
let flyToID = 0;
let flyToIdTile = {
  tileX: 0,
  tileY: 0,
  zoom: 14
}
let flyToMiddle = {
  longitude: 0,
  latitude: 0,
  zoom: 14
}
let flyToControl_maxZoom = 18;
let flyToProps = {};
let returnChecked = (value) => {};*/

const GeoMessageFeed = {
  getElement: () => {

    if (!GeoMessageFeedElements || GeoMessageFeedElements.length < 2) {
      return null;
    }

    return ( 
      <Portal key="GeoMessageFeedPortal" position="bottomleft">
        <div 
          key='GeoMessageFeedContainer'
          className='leaflet-control-layers leaflet-control-layers-toggle GeoMessageFeed'
          onClick={buttonClick}
        >
        </div>
      </Portal>
    )
  },

  initialize: (props, map, checkedFunction, returnFeedFunction) => {

    returnChecked = checkedFunction;
    GeoMessageFeed_map = map;
    GeoMessageFeed_props = props;

    if (props.map)
    {
      feedLoop(1);
    }

    returnFeed = returnFeedFunction;

    return(GeoMessageFeedElements);
  },

  update: (props, map, checkedFunction, returnFeedFunction) => {

    returnChecked = checkedFunction;
    GeoMessageFeed_map = map;
    GeoMessageFeed_props = props;
    
    if (props.map)
    {
      feedLoop(GeoMessageFeed_page);
      scrollToBottom();
    }

    returnFeed = returnFeedFunction;

    return(GeoMessageFeedElements);
  },

  clear: () => {
    GeoMessageFeedElements = [];
    returnChecked = (value) => {};

    GeoMessageFeed_map = null;
    GeoMessageFeed_props = {};
    GeoMessageFeed_page = 1;
  }
}

function scrollToBottom()
{
  if (GeoMessageFeed_list)
  {
    const scrollHeight = GeoMessageFeed_list.scrollHeight;
    const height = GeoMessageFeed_list.clientHeight;
    const maxScrollTop = scrollHeight - height;
    GeoMessageFeed_list.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }
};

function buttonClick()
{
  feedLoop('click');
}

function onGroupChange (value) {
  GeoMessageFeed_selectedGroups = value;

  feedLoop('group_change');
}

async function feedLoop(page)
{

  if (GeoMessageFeedElements && GeoMessageFeedElements.length === 0 || page === 'click' || page === 'group_change')
  {
    if (page !== 'group_change') {
      let mapGroups = GeoMessageFeed_props.map.groups;

      // Adding admin group as filtering option.
      // It is not included as API response due to it being a special group.
      if (!mapGroups.includes('admin')) {
        mapGroups.push('admin'); 
      }

      GeoMessageFeed_groups = [];
  
      mapGroups.forEach(group => {
        GeoMessageFeed_groups.push({
          value: group,
          label: group
        });
      });

      GeoMessageFeed_selectedGroups = cloneDeep(GeoMessageFeed_groups);
    }

    GeoMessageFeedElements = [];
    GeoMessageFeedElements.push({type: 'button', pageNumber: 0, messages: <button key={'GeoMessageFeedButton'} onClick={loadMore} className='button'>Load more</button>});
    GeoMessageFeedElements.push(await getFeed(1));

    if (page === 'click' || page === 'group_change')
    {
      GeoMessageFeed_page = 1;
      makeFeed();
    }
  }
  else if (page > GeoMessageFeed_page)
  {
    let response = await getFeed(page);
    if (response.type !== 'none')
    {
      GeoMessageFeedElements.push(await getFeed(page));
      GeoMessageFeed_page = GeoMessageFeed_page + 1;
    }
    else if(response.type === 'none')
    {
      GeoMessageFeedElements[0].type = 'none';
      GeoMessageFeedElements[0].messages = (<p key={GeoMessageFeedElements[0].key + 'noMore'}>Nothing more to load</p>);
    }

    makeFeed()
  }

}

async function getFeed(page)
{
  let messages = [];
  let apiUrl = GeoMessageFeed_props.apiUrl;
  let headers = {};
  if (GeoMessageFeed_props.user)
  {
    headers["Authorization"] = "Bearer " + GeoMessageFeed_props.user.token;
  }

  let feed = null;
  let userGroups = []
  if (GeoMessageFeed_selectedGroups && GeoMessageFeed_selectedGroups.length > 0) {
    GeoMessageFeed_selectedGroups.forEach(option => {
      userGroups.push(option.value);
    });

    feed = await QueryUtil.postData(apiUrl + 'geoMessage/feed', 
      {
        mapId: GeoMessageFeed_props.map.uuid,
        page: page, 
        userGroups: userGroups,
      },
      headers
    );
  }
  
  if (feed && feed.length > 0)
  {
    for (let j = 0; j < feed.length; j++)
    {
      feed[j].apiUrl = GeoMessageFeed_props.apiUrl;
      feed[j].mapId = GeoMessageFeed_props.map.uuid;
      feed[j].headers = headers;

      messages.push(<Message key={feed[j].uuid} info={feed[j]} user={GeoMessageFeed_props.user} trigger={buttonClick}/>);
    }

    return({type:'page', pageNumber: page, messages: messages});
  }
  else
  {
    return({type:'none'});
  }
}

loadMore = () =>
{
  feedLoop(GeoMessageFeed_page + 1);
  scrollToBottom();
}

async function makeFeed()
{
  let feedContent = [];

  for (var i = 1; i < GeoMessageFeedElements.length; i++)
  {
    feedContent.push(GeoMessageFeedElements[i].messages);
  }

  feedContent.push(GeoMessageFeedElements[0].messages);

  const customStyles = {
    menu: (provided, state) => ({
      ...provided,
      marginTop: '0px',
      position: 'static'
    })
  };

  let selectElement = (<div></div>);
  if (GeoMessageFeed_groups && GeoMessageFeed_groups.length > 0) {
    selectElement = (
      <Select
        className='select-groups'
        placeholder={'Select groups for feed'}
        styles={customStyles}
        isMulti
        isClearable={true}
        defaultValue={GeoMessageFeed_selectedGroups}
        options={GeoMessageFeed_groups}
        noOptionsMessage={() => {return 'All groups selected';}}
        onChange={onGroupChange}
      />
    );
  }

  let feed = (
    <div 
      type='GeoMessageFeed' 
      openpane={'true'}
      random={Math.random()}
    >
      {selectElement}
      <div
        className='GeoMessageContainer feed'
        key={'GeoMessageContainer' + GeoMessageFeedElements[1].key}
        ref={(div) => {GeoMessageFeed_list = div;}}        
        id={GeoMessageFeedElements[1].key}
      >
        {feedContent}
      </div>
    </div>

  );

  returnFeed(feed);
}

export default GeoMessageFeed;
