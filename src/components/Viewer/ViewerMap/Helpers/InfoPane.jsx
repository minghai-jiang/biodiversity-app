import React, { PureComponent} from 'react';
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

export class InfoPane extends PureComponent {
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
    }

    if (this.props && this.props.infoContent)
    {
      this.timestamp = this.props.infoContent.properties.timestamp;
    }
  }

  toggleQueryPane = (open) => {
    this.setState({ openQueryPane: open });
  };

  componentWillReceiveProps(nextProp){
    if(nextProp && nextProp.infoContent && nextProp.infoContent.openPane && this.props.infoContent.random !== nextProp.infoContent.random)
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

    if (this.props.infoContent.properties.hasAggregatedData === false)
    {
      let geometry = {
        'type': 'FeatureCollection',
        'features':[{
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
  }

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
      this.paneName = 'Analysis of ' + this.props.infoContent.id;
    }
    else if(this.props.infoContent && this.props.infoContent.type === 'report')
    {
      this.paneName = 'GeoMessage for ' + this.props.infoContent.id;
    }
  };

  componentDidMount = async() =>
  {
    if(this.props.infoContent && this.props.infoContent.type === 'analyse')
    {
      this.paneName = 'Analysis of ' + this.props.infoContent.id
    }
    else if(this.props.infoContent && this.props.infoContent.type === 'report')
    {
      this.paneName = 'GeoMessage for ' + this.props.infoContent.id;
    }

    if(this.props.infoContent && this.props.infoContent.type === 'analyse')
    {
      let classes = await this.getClasses();
      let classesSlider = this.getSlider('class');
      let indeces = await this.getIndeces();
      let indecesSlider = this.getSlider('spectral');

      await this.setState({classes: classes, indeces: indeces, classesSlider: classesSlider, indecesSlider: indecesSlider})
    }
    else if(this.props.infoContent && this.props.infoContent.type === 'report')
    {
      this.setState({GeoMessage: <GeoMessage properties={this.props.infoContent.properties} user={this.props.user}/>})
    }
  }

  onClassChange = async(e) =>
  {
    let itemValue = e.target.value;
    let indeces = await this.getIndeces(itemValue);

    this.setState({inputClass: itemValue, indeces: indeces})
  }

  render() {
    let graph = [];
    if (this.props.map && this.props.infoContent)
    {
      let content = [];

      if(this.props.infoContent.type !== 'report')
      {
        if (this.props.map.timestamps.length > 1)
        {
          content.push(this.state.classes);
          this.state.classes.length > 0 && this.state.classes[0].props.children[2] && this.state.classes[0].props.children[2].type !== 'p' ? content.push(this.state.classesSlider) : content.push(null);

          content.push(this.state.indeces);
          this.state.indeces.length > 0 && this.state.inputClass !== '' && this.state.indeces[0].props.children[2] && this.state.indeces[0].props.children[2].type !== 'p' ? content.push(this.state.indecesSlider) : content.push(null);
        }
        else
        {
          content.push(<p key='notEnoughData'>Not enough timestamps available for analysis.</p>);
        }

        if(content[0].length === 0)
        {
          content.push(<p key='loadingData'>Loading Data <br/><img src='/images/spinner.png' alt='spinner'/></p>);
        }

        if (content.length > 1)
        {
          graph = <div className='graphContainer' key={'graph' + this.props.infoContent.type + this.props.infoContent.id + this.props.infoContent.properties.id}>{content}</div>
        }
      }

      return (
          <SlidingPane
            key={this.props.infoContent.type + this.props.infoContent.id + this.props.infoContent.properties.id}
            className='query-pane'
            overlayClassName='modal-overlay'
            isOpen={this.state.openQueryPane}
            title={this.paneName}
            width={'0'}
            onRequestClose={() => { this.toggleQueryPane(false); }}
          >
            {graph}
            {this.state.GeoMessage}
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