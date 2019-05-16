import React, {Component} from 'react';
import SlidingPane from 'react-sliding-pane';
import LineChart from './DV/LineChart';
import Slider from 'rc-slider';
import QueryUtil from '../../../Utilities/QueryUtil';
import Papa from 'papaparse';
import Table from './DV/Table';
import GeoMessage from './GeoMessage';

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import './InfoPane.css';
import 'react-sliding-pane/dist/react-sliding-pane.css';

export class InfoPane extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      openQueryPane: true,
      classes: [],
      indeces: [],
      GeoMessage: [],
      inputClass: '',
      classSliderValue: 1,
      spectralSliderValue: 1,
      classesSlider: [],
      indecesSlider: [],
      data: {},
      save: [],
      selectedCrowdLayer: 'default',
      crowdProperties: {}
    }

    if (this.props && this.props.infoContent && this.props.infoContent.properties)
    {
      this.timestamp = this.props.infoContent.properties.timestamp;
      this.props.user ? this.headers = {Authorization: "Bearer " + this.props.user.token} : this.headers = undefined;
    }

    this.handleSaveSubmit = this.handleSaveSubmit.bind(this);
    this.handleUpdateSubmit = this.handleUpdateSubmit.bind(this);
    this.onPropertyChange = this.onPropertyChange.bind(this);
  }

  toggleQueryPane = (open) => {
    this.setState({ openQueryPane: open });
  };

  componentWillReceiveProps(nextProp){
    let openpane = false;

    if (nextProp.infoContent && nextProp.infoContent.props && nextProp.infoContent.props.openpane === 'true')
    {
      openpane = true;
    }

    if (nextProp.infoContent && nextProp.infoContent.type === 'div' && openpane === true && this.props.infoContent.props.random !== nextProp.infoContent.props.random)
    {
      this.toggleQueryPane(true);
    }

    if(nextProp && nextProp.infoContent && nextProp.infoContent.openpane && this.props.infoContent.random !== nextProp.infoContent.random)
    {
      this.toggleQueryPane(true);
    }
  };

  getOptions = () =>
  {
    let options = [
      <option key='default' value="default" disabled hidden>Choose a class</option>,
      <option key='allClasses' value='all classes'>all classes</option>,
    ];


    for (let i = 0; i < this.props.map.classes.length; i++)
    {
      let mapClass = this.props.map.classes[i];
      if (mapClass.timestampNumber === this.timestamp)
      {
        for (let j = 0; j < mapClass.classes.length; j++)
        {
          if (mapClass.classes[j].name !== 'blanc' && mapClass.classes[j].name !== 'mask')
          {
            options.push(<option key={mapClass.classes[j].name} value={mapClass.classes[j].name}>{mapClass.classes[j].name}</option>);
          }
        }
      }
    }

    return options;
  }

  getClasses = async(filter = 1) =>
  {
    let content = [];
    let classes = [];
    let data = await this.getData('class');

    content.push(<h1 key='Classes'>Classes</h1>);
    if (data)
    {
      content.push(<LineChart key ={'classesTimestamps' + filter} props={this.props} type='class' data={data.graphData} filter={filter}/>);
      content.push(<Table key='classTable' type={'class'} data={data.tableData}/>)
    }
    else
    {
      content.push(<p key='noClassData'>No Class Data</p>);
    }

    classes.push(<div key='containerClasses' className='LineChart'>{content}</div>);
    return classes;
  };

  getIndeces = async(itemValue, filter = 1) =>
  {
    let content = [];
    let indeces = [];
    let currentValue = itemValue ? itemValue : 'all classes';
    let defaultValue = itemValue ? itemValue : 'default';
    let data = await this.getData('spectral', currentValue);

    let options = this.getOptions();

    content.push(<h1 key='Indices'>Indices</h1>);
    content.push(<select key='classSelector' defaultValue={defaultValue} onChange={this.onClassChange}>{options}</select>);
    if (itemValue)
    {
      if(data && data.tableData && data.tableData.data && data.tableData.data.length > 1)
      {
        content.push(<LineChart key={'indicesTimestamps' + itemValue + filter} props={this.props} type='spectral' inputClass={currentValue} className='LineChart' filter={filter} data={data.graphData}/>)
        content.push(<Table key={'indecesTable' + itemValue} type={itemValue} data={data.tableData}/>)
      }
      else
      {
        content.push(<p key={'noDataFor' + itemValue}>No data for {currentValue}</p>);
      }
    }

    indeces.push(<div key={'containerIndices'} className='LineChart'>{content}</div>);

    return indeces;
  };

  handleChange = async(value, type) => {
    let stateName = type + 'SliderValue';
    if(type === 'spectral')
    {
      let indeces = await this.getIndeces(this.state.inputClass, value);
      this.setState({spectralSliderValue: value, indeces: indeces});
    }
    else
    {
      let classes = await this.getClasses(value);
      this.setState({classSliderValue: value, classes: classes});
    }
  };

  getSlider = (type) =>
  {
    let slider = [];
    const createSliderWithTooltip = Slider.createSliderWithTooltip;
    const SliderWithTooltip = createSliderWithTooltip(Slider);
    slider.push(<h2 key={type + 'CloudFilter Header'}>Maximum cloud cover</h2>);
    slider.push(
      <SliderWithTooltip
        key='Slider'
        dots={false}
        step={0.01}
        defaultValue={this.state[type + 'SliderValue']}
        min={0}
        max={1}
        onChange={(value) => this.handleChange(value, type)}
        tipFormatter={v => Math.round(v*100) + '%'}
        marks={{0:'0%', 1: '100%'}}
      />);
    return slider;
  };

  getData = async(type, spectralClass) =>
  {
    if (this.state.data[type])
    {
      if (type === 'class')
      {
        return(this.state.data[type]);
      }
      else if (type === 'spectral')
      {
        if (this.state.data[type][spectralClass])
        {
          return(this.state.data[type][spectralClass]);
        }
        else
        {
          let data = this.state.data;
          data[type][spectralClass] = await this.getDataFromServer(type, spectralClass);
          this.setState({data: data});
          return data[type][spectralClass];
        }
      }
    }
    else
    {
      if (type === 'class')
      {       
        let data = this.state.data;
        data[type] = await this.getDataFromServer(type);
        this.setState({data: data});
        return data[type];
      }
      else if (type === 'spectral')
      {
        let data = this.state.data;
        data[type] = {};
        data[type][spectralClass] = await this.getDataFromServer(type, spectralClass);
        this.setState({data: data});
        return data[type][spectralClass];
      }
    }
  };

  getDataFromServer = async(type, spectralClass) =>
  {
    let rawGraphDataPromise;

    let body = {
      mapId:  this.props.map.uuid,
    };

    if(type === 'spectral')
    {
      body.class = spectralClass;
    }

    if (this.props.infoContent.properties.hasAggregatedData === false  || this.props.infoContent.properties.custom)
    {
      let geometry = {
        'type': 'FeatureCollection',
        'features':[{
          type: 'Feature',
          properties:
          {},
          geometry:{
            type: this.props.infoContent.properties.type,
            coordinates:this.props.infoContent.properties.coordinates,
            }
          }]
        }

      body.geometry = geometry;
      rawGraphDataPromise = await QueryUtil.postData(
        this.props.infoContent.properties.apiUrl + 'data/' + type + '/customPolygon/timestamps',
        body,
        this.headers 
      );
    }
    else
    {
      let kind = this.props.infoContent.properties.kind;
      if (kind === 'polygon')
      {
        body.polygonId = this.props.infoContent.id;
      }
      else
      {
        body.tileX = this.props.infoContent.properties.tileX;
        body.tileY = this.props.infoContent.properties.tileY;
        body.zoom = this.props.infoContent.properties.zoom;
      }

      rawGraphDataPromise = await QueryUtil.postData(
        this.props.infoContent.properties.apiUrl + 'data/' + type + '/' + kind + '/timestamps',
        body,
        this.headers 
      );
    }
  
    let rawGraphData = await rawGraphDataPromise;

    return (this.prepareData(rawGraphData));
  };

  prepareData = async(rawGraphData) =>
  {
    rawGraphData = await rawGraphData;
    if (rawGraphData && !rawGraphData.includes('no data'))
    {
      let tableData = Papa.parse(rawGraphData, {dynamicTyping: true, skipEmptyLines: true});
      let graphData = Papa.parse(rawGraphData, {dynamicTyping: true, skipEmptyLines: true, header: true});

      return ({tableData: tableData, graphData: graphData});
    }
  };

  componentWillMount = () => {
    if(this.props.infoContent && this.props.infoContent.type === 'analyse')
    {
      if (this.props.infoContent.properties.custom)
      {
        this.paneName = 'Analysis of Custom Polygon';
      }
      else
      {
        this.paneName = 'Analysis of ' + this.props.infoContent.id;
      }
    }
    else if(this.props.infoContent && this.props.infoContent.type === 'report')
    {
      if (this.props.infoContent.properties.custom)
      {
        this.paneName = 'GeoMessage for Custom Polygon';
      }
      else
      {
        this.paneName = 'GeoMessage for ' + this.props.infoContent.id;
      }
    }
    else if(this.props.infoContent && this.props.infoContent.type === 'save')
    {
      this.paneName = 'Save Custom Polygon';
    }
    else if(this.props.infoContent && this.props.infoContent.type === 'update')
    {
      this.paneName = 'Update Custom Polygon';
    }
  };

  componentDidMount = () =>
  {
    this.update();
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props !== prevProps) {
      this.update();
    }
  }

  update = async () => {
    let info = this.props.infoContent;

    if (!info) {
      return;
    }

    let type = info.type;

    if (type === 'analyse')
    {
      let classes = await this.getClasses();
      let classesSlider = this.getSlider('class');
      let indeces = await this.getIndeces();
      let indecesSlider = this.getSlider('spectral');

      await this.setState({classes: classes, indeces: indeces, classesSlider: classesSlider, indecesSlider: indecesSlider})
    }
    else if (type === 'report')
    {
      this.setState({GeoMessage: <GeoMessage properties={info.properties} user={this.props.user}/>})
    }
    else if (type === 'save' || type === 'update')
    {
      let options = [<option key='default' value="default" disabled hidden>Choose a layer</option>];
      let properties = [];

      let defaultLayerValue = 'default';
      let currentProperties = {};

      if (type === 'update') {
        defaultLayerValue = info.id.properties.layer;
      }

      for (let i = 0; i < info.properties.crowdLayers.length; i++)
      {
        let crowdLayer = info.properties.crowdLayers[i];
        currentProperties[crowdLayer.name] = {};
        options.push(<option key={crowdLayer.name} value={crowdLayer.name}>{crowdLayer.name}</option>);
        let layerProps = [];

        for (let j = 0; j < crowdLayer.properties.length; j++)
        {
          let propertyName = crowdLayer.properties[j];
          let defaultValue = '';

          if (type === 'update' && info.id.properties[propertyName]) {
            defaultValue = info.id.properties[propertyName];
            currentProperties[crowdLayer.name][propertyName] = defaultValue;
          }

          layerProps.push(
            <label key={propertyName + 'Label'}>{propertyName}
              <br/>
              <input 
                type='text' 
                name={crowdLayer.name + ';' + propertyName} 
                key={propertyName} 
                defaultValue={defaultValue}
                onChange={this.onPropertyChange}
              />
              <br/>
            </label>
          );
        }

        let hidden = 'hidden';
        if (type === 'update' && crowdLayer.name === info.id.properties.layer) {
          hidden = '';
        }

        properties.push(
          <div 
            key={crowdLayer.name + 'propertyContainer'} 
            id={crowdLayer.name} 
            className={hidden}
          >
            {layerProps}
          </div>
        );
      }

      let select = (
        <select 
          key='classSelector' 
          defaultValue={defaultLayerValue} 
          onChange={this.onCrowdLayerChange}
        >
          {options}
        </select>
      );

      let submitClass = 'button hidden';
      let onSubmit = this.handleSaveSubmit;
      if (type === 'update') {
        submitClass = 'button';
        onSubmit = this.handleUpdateSubmit;
      }

      let form = (
        <div className='saveFormContainer'>
          <form key={'form'} onSubmit={onSubmit}>
            {select}
            {properties}
            <input type="submit" value="Submit" className={submitClass}/>
          </form>
        </div>
      );

      this.setState({ save: form, crowdProperties: currentProperties, selectedCrowdLayer: defaultLayerValue });
    }
  }

  handleSaveSubmit = async (event) => {
    event.preventDefault();
    let properties = {};
    if (this.state.crowdProperties[this.state.selectedCrowdLayer]) {
      properties = this.state.crowdProperties[this.state.selectedCrowdLayer]
    }

    let geometry = {
      'type': 'FeatureCollection',
      'features':[{
        type: 'Feature',
        properties: properties,
        geometry:{
          type: 'MultiPolygon',
          coordinates:[this.props.infoContent.properties.coordinates],
          }
        }]
    }

    let addResult = await QueryUtil.postData(
      this.props.infoContent.properties.apiUrl + 'geoMessage/customPolygon/addPolygon',
      {
        mapId:  this.props.map.uuid,
        timestamp: this.props.infoContent.properties.timestamp,
        geometry: geometry,
        features: {},
        layer: this.state.selectedCrowdLayer,
      }, this.headers
    );

    if (await addResult === 'OK') {
      this.props.infoContent.mapRef.closePopup();
      this.props.infoContent.refresh('customPolygon');
      this.props.infoContent.checkLayer(this.state.selectedCrowdLayer);
      //this.props.infoContent.clearLayers(this.props.infoContent.e.layer);
      this.toggleQueryPane(false);
    }
  };

  handleUpdateSubmit = async (event) => {
    event.preventDefault();

    let newLayer = this.state.selectedCrowdLayer;
    let info = this.props.infoContent;

    let properties = {};

    if (this.state.crowdProperties[newLayer]) {
      properties = this.state.crowdProperties[newLayer]
    }

    let result = await QueryUtil.postData(
      this.props.infoContent.properties.apiUrl + 'geoMessage/customPolygon/alterPolygon',
      {
        mapId:  this.props.map.uuid,
        customPolygonId: info.id.id,
        newLayerName: newLayer,
        newProperties: properties
      }, 
      this.headers
    );

    if (await result === 'OK') {
      this.props.infoContent.id.refresh('customPolygon');
      this.toggleQueryPane(false);
    }
  };

  onCrowdLayerChange = (event) =>
  {
    const value = event.target.value;
    let container = document.getElementsByClassName('saveFormContainer')[0].children[0].children;
    for (let i = 0; i < container.length; i++)
    {
      if (container[i].type === 'submit' || container[i].id === event.target.value)
      {
        container[i].classList.remove("hidden");
      }
      else if (container[i].tagName !== 'SELECT')
      {
        container[i].classList.add("hidden");
      }
    }
    this.setState({selectedCrowdLayer: value});
  };

  onPropertyChange = (event) =>
  {
    const value = event.target.value;
    let name = event.target.name.split(';');
    let crowdProperties = this.state.crowdProperties;
    
    try
    {
      crowdProperties[name[0]][name[1]] = value;
    }
    catch
    {
      crowdProperties[name[0]] = {};
      crowdProperties[name[0]][name[1]] = value;
    }

    this.setState({crowdProperties: crowdProperties});
  }

  onClassChange = async(e) =>
  {
    let itemValue = e.target.value;
    let indeces = await this.getIndeces(itemValue);

    this.setState({inputClass: itemValue, indeces: indeces})
  }

  render() {

    let paneContent = [];
    let key = '';
    if (this.props.map && this.props.infoContent)
    {
      let content = [];

      if(this.props.infoContent.type === 'analyse')
      {
        if (this.props.map.timestamps.length >= 1)
        {
          content.push(this.state.classes);
          if (this.state.classes[0] && this.state.classes[0].props.children[1]) {
            if (this.state.classes && this.state.classes.length > 0 && this.state.classes[0].props.children[1].props.data && this.state.classes[0].props.children[1].props.data.data.length > 1)
            {
              content.push(this.state.classesSlider);
            }
          }

          content.push(this.state.indeces);
          if (this.state.indeces[0] && this.state.indeces[0].props.children[2])
          {
            if (this.state.indeces && this.state.inputClass !== '' && this.state.indeces.length > 0 && this.state.indeces[0].props.children[2].props.data && this.state.indeces[0].props.children[2].props.data.data.length > 1)
            {
              content.push(this.state.indecesSlider);
            }
          }
        }
        else
        {
          content.push(<p key='notEnoughData'>Not enough timestamps available for analysis.</p>);
        }

        if(content.length === 0 || content[0].length === 0)
        {
          content.push(<p key='loadingData'>Loading Data <br/><img  className='loading-spinner' src='/images/spinner.png' alt='spinner'/></p>);
        }

        if (content.length >= 1)
        {
          paneContent = <div className='graphContainer' key={'graph' + this.props.infoContent.type + this.props.infoContent.id + this.props.infoContent.properties.id}>{content}</div>
        }

        key = this.props.infoContent.type + this.props.infoContent.id + this.props.infoContent.properties.id;
      }
      else if (this.props.infoContent.props && this.props.infoContent.props.type === 'GeoMessageFeed')
      {
        this.paneName = 'GeoMessage Feed';
        paneContent = this.props.infoContent;
      }

      return (
          <SlidingPane
            key={key}
            className='query-pane'
            overlayClassName='modal-overlay'
            isOpen={this.state.openQueryPane}
            title={this.paneName}
            width={'0'}
            onRequestClose={() => { this.toggleQueryPane(false); }}
          >
            {paneContent}
            {this.state.GeoMessage}
            {this.state.save}
          </SlidingPane>
      );
    }
    else {
      return (
        <div></div>
      )
    }
  }
}

export default InfoPane;