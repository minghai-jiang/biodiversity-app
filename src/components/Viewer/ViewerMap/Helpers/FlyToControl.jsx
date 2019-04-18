import React, { PureComponent} from 'react';
import {Portal} from "react-leaflet-portal";
import L from "leaflet";

import QueryUtil from '../../../Utilities/QueryUtil';

let flyToControl_map = null;
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
let returnChecked = (value) => {};

const FlyToControl = {
  getElement: () => {
    if (!flyToElements || flyToElements.length === 0) {
      return null;
    }

    return ( 
      <Portal key="flyToPortal" position="bottomleft">
        <div 
          key='flyToContainer'
          className='leaflet-control-layers leaflet-control-layers-toggle flyTo'
          onClick={addActive}
        >
          <button key="closeButton" className='closeButton' onClick={closeFlyTo}>x</button>
          {flyToElements}
        </div>
      </Portal>
    )
  },

  initialize: (props, map, checkedFunction) => {
    flyToProps = props;
    flyToControl_map = props.map;
    flyToControl_mapRef = map;
    flyToControl_maxZoom = flyToControl_mapRef.getMaxZoom();

    returnChecked = checkedFunction;
    createOptions();

    return(flyToElements);
  },

  update: (props, map, center, checkedFunction) => {
    flyToProps = props;
    flyToControl_map = props.map;
    flyToControl_mapRef = map;
    flyToControl_maxZoom = flyToControl_mapRef.getMaxZoom();

    returnChecked = checkedFunction;

    flyToMiddle = {
      longitude: center.lng,
      latitude: center.lat,
      zoom: 14
    }

    createOptions();

    return(flyToElements);
  },

  clear: () => {
    flyToControl_map = null;
    flyToControl_mapRef = null;
    flyToElements = [];
    flyToType = 'middle';
    flyToID = 0;
    flyToIdTile = {
      tileX: 0,
      tileY: 0,
      zoom: 14
    };
    flyToMiddle = {
      longitude: 0,
      latitude: 0,
      zoom: 14
    };
    flyToControl_maxZoom = 18;
    flyToProps = {};
  },
}

function createOptions()
{
  if(flyToControl_map)
  {
    let formElements = [];
    formElements.push(<h1 key='flyToTitle'>Fly to:</h1>)
    let options = ['polygons', 'tiles'];
    let select = [<option value="middle" key={flyToControl_map.uuid + 'middleOption'}>Middle Point</option>];

    for (let i = 0; i < options.length; i++)
    {
      let typeShort = options[i].substring(0, options[i].length - 1);
      select.push(<option value={options[i]} key={flyToControl_map.uuid + options[i] + 'Option'}>{typeShort}</option>);
    }

    formElements.push(<label key={flyToControl_map.uuid + 'typeSelectLabel'}>Select id type: <br/><select defaultValue="middle" key={flyToControl_map.uuid + 'typeSelect'} onChange={onOptionChange}>{select}</select></label>);

    formElements.push(<div key={flyToControl_map.uuid + 'middlePointContainer'} className='optionContainer middle'>
                        <label key={flyToControl_map.uuid + 'latitudeInputLabel'}>Latitude: <br/>
                          <input key={flyToControl_map.uuid + 'latitudeInput'} type='number' pattern="(\-)?(\d+)((\.|\,|\d){1,5})?" step='0.0001' placeholder={flyToMiddle.latitude} min='-90' max='90' onChange={onIdChange} id='latitude'/>
                        </label>
                       <label key={flyToControl_map.uuid + 'longitudeInputLabel'}>Longitude: <br/>
                          <input key={flyToControl_map.uuid + 'longitudeInput'} type='number' pattern="(\-)?(\d+)((\.|\,|\d){1,5})?" step='0.0001' placeholder={flyToMiddle.longitude} min='-180' max='180' onChange={onIdChange} id='longitude'/>
                        </label>
                        <label key={flyToControl_map.uuid + 'zoomMiddleInputLabel'}>Zoom: <br/>
                          <input key={flyToControl_map.uuid + 'zoomMiddleInput'} type='number' placeholder={flyToMiddle.zoom} onChange={onIdChange} min='0' max={flyToControl_maxZoom} id='middleZoom'/>
                        </label>
                      </div>);

    formElements.push(<div key={flyToControl_map.uuid + 'polygonOptionsContainer'} className='optionContainer polygons hidden'>
                        <label key={flyToControl_map.uuid + 'idInputLabel'}>ID: <br/>
                          <input key={flyToControl_map.uuid + 'idInput'} type='number' placeholder={flyToID} onChange={onIdChange}/>
                        </label>
                      </div>);

    formElements.push(<div key={flyToControl_map.uuid + 'tilesOptionsContainer'} className='optionContainer tiles hidden'>
                        <label key={flyToControl_map.uuid + 'tileXInputLabel'}>tileX: <br/>
                          <input key={flyToControl_map.uuid + 'tileXInput'} type='number' placeholder={flyToIdTile.tileX} onChange={onIdChange} id='tileX'/>
                        </label>
                        <label key={flyToControl_map.uuid + 'tileYInputLabel'}>tileY: <br/>
                          <input key={flyToControl_map.uuid + 'tileYInput'} type='number' placeholder={flyToIdTile.tileY} onChange={onIdChange} id='tileY'/>
                        </label>
                        <label key={flyToControl_map.uuid + 'zoomTileInputLabel'}>Zoom: <br/>
                          <input key={flyToControl_map.uuid + 'zoomTileInput'} type='number' placeholder={flyToIdTile.zoom} onChange={onIdChange} min='0' max={flyToControl_maxZoom} id='tileZoom'/>
                        </label>
                      </div>);

    formElements.push(<input type="submit" value="Fly To" className="button" key={flyToControl_map.uuid + 'submitButton'}/>);
    flyToElements.push(<form key={flyToControl_map.uuid} onSubmit={handleSubmit}>{formElements}</form>);
  }
}

function onOptionChange(e)
{
  let itemValue = e.target.value;

  let containers = document.getElementsByClassName('optionContainer');
  for (let i = 0; i < containers.length; i++)
  {
    if (containers[i].classList.contains(itemValue))
    {
      containers[i].classList.remove('hidden');
    }
    else
    {
      containers[i].classList.add('hidden');
    }
  }

  flyToType = itemValue;
}

function onIdChange(e)
{
  let itemValue = e.target.value;
  for (let i = 0; i < ['.', ','].length; i++)
  {
    let char = ['.', ','][i];
    if(itemValue.indexOf(char) > 0)
    {
      if(itemValue.split(char)[1].length > 4)
      {
        e.target.value = Math.round(e.target.value * 1000) / 1000;
      }
    }
  }

  let id = e.target.id.indexOf(flyToType) > -1 ? e.target.id.split(flyToType)[1].toLowerCase() : e.target.id;

  if (flyToType === 'polygons')
  {
    flyToID = parseInt(itemValue);
  }
  else if(flyToType === 'tiles')
  {
    flyToIdTile[id] = parseInt(itemValue);
  }
  else if (flyToType = 'middle')
  {
    flyToMiddle[id] = parseFloat(itemValue);
  }
}

async function handleSubmit(e)
{
  e.preventDefault();

  if (flyToType === 'middle')
  {
    flyToControl_mapRef.flyTo([flyToMiddle.latitude, flyToMiddle.longitude], flyToMiddle.zoom);
  }
  else
  {
    let apiUrl = flyToProps.apiUrl;
    let headers = {};
    if (flyToProps.user) {
      headers["Authorization"] = "Bearer " + flyToProps.user.token;
    }

    let typeShort = flyToType.substring(0, flyToType.length - 1);
    let body = {mapId: flyToControl_map.uuid, timestamp: flyToProps.timestampRange.end, }

    if (flyToType === 'polygons')
    {
      body['polygonIds'] = [flyToID]
    }
    else if(flyToType === 'tiles')
    {
      body['tileIds'] = [flyToIdTile];
    }
    
    let idGeometry = await QueryUtil.postData(
      apiUrl + 'geometry/' + flyToType,
      body,
      headers
    );
    
    if (idGeometry.features && idGeometry.features.length > 0)
    {
      let geoJsonLayer = L.geoJson(idGeometry);
      let bounds = geoJsonLayer.getBounds();
      flyToControl_mapRef.flyToBounds(bounds);
      let name = idGeometry.features[0].properties.layer ? idGeometry.features[0].properties.layer : 'Standard Tiles';
      let id = body['tileIds'] ? body['tileIds'] : body['polygonIds'];
      returnChecked({name: name, type: flyToType, id:id, center: bounds.getCenter()});
    }
  }
}

function closeFlyTo(e)
{
  if(e.target.tagName === 'BUTTON')
  {    
    let flyTo = document.getElementsByClassName('flyTo')[0];
    flyTo.classList.remove('active');
  }
}

function addActive(e)
{
  if(e.target.tagName === 'DIV')
  { 
    let flyTo = document.getElementsByClassName('flyTo')[0];
    flyTo.classList.add('active');
  }
}




export default FlyToControl;
