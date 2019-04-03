import React, { PureComponent} from 'react';
import Papa from 'papaparse';
import Moment from 'moment';

import {FlexibleXYPlot, XAxis, YAxis, LineSeries, DiscreteColorLegend, Crosshair} from 'react-vis';
import './react-vis-style.css';

import QueryUtil from '../../../../Utilities/QueryUtil';

export class LineChart extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      lines: [],
      legend: [],
      crosshairValues: [],
      filterArray: [],
      cloud_cover: [],
    }

    this.map = this.props.props.map;
    this.props.props.infoContent &&  this.props.props.infoContent.headers ? this.headers = this.props.props.infoContent.headers : this.headers = {};
    this.infoContent = this.props.props.infoContent;
    this.data = null;
    this.ticksX = [];
    this.ymax = [0,0];
  };

  _onMouseLeave = () => {
    //this.setState({crosshairValues: []});
  };

  _onNearestX = (value, {index}) => {
    //this.setState({crosshairValues: this.data.data.map(d => d.data[index])});
  };

  componentWillReceiveProps = (nextProps) =>
  {
    if (nextProps.filter !== this.props.filter && this.state.cloud_cover.length > 0)
    {
      let filterArray = [];
      for (let i = 0; i < this.state.cloud_cover.length; i++)
      {
        if (this.state.cloud_cover[i] > nextProps.filter)
        {
          filterArray.push(i);
        }
      }
      this.setState({filterArray: filterArray});
      this.renderLines(filterArray);
    }
  };

  componentDidMount = async () => {
    if(!this.map && !this.infoContent)
    {
      return null;
    }

    let rawGraphDataPromise;

    let body = {
      mapId:  this.map.uuid,
    };

    if(this.props.type === 'spectral')
    {
      body.class = this.props.inputClass;
    }

    if (!this.infoContent.properties.hasAggregatedData)
    {
      let geometry = {
        'type': 'FeatureCollection',
        'features':[{
          properties:
          {},
          geometry:{
            type: this.infoContent.properties.type,
            coordinates:this.infoContent.properties.coordinates,
            }
          }]
        }

      body.geometry = geometry;
      rawGraphDataPromise = await QueryUtil.postData(
        this.infoContent.properties.apiUrl + 'data/' + this.props.type + '/customPolygon/timestamps',
        body,
        this.headers 
      );
    }
    else
    {
      body.polygonId = this.infoContent.id;      
      rawGraphDataPromise = await QueryUtil.postData(
        this.infoContent.properties.apiUrl + 'data/' + this.props.type + '/polygon/timestamps',
        body,
        this.headers 
      );
    }
  
    let rawGraphData = await rawGraphDataPromise;

    if (rawGraphData && !rawGraphData.includes('no data'))
    {
      let graphData = Papa.parse(rawGraphData).data;
      let data = {};
      data.data = [];
      let filter = [];
      let cloud_cover = [];

      let y_index = graphData[0].indexOf('date_from');
      
      //ticks
      for (let i = 1; i < graphData.length; i++)
      {
        this.ticksX.push(Moment(graphData[i][y_index]).unix() * 1000);
      }

      //columns
      for (let i = 1; i < graphData[0].length; i++)
      {
        let column = [];
        for (let j = 1; j < graphData.length; j++)
        {
          if (typeof(graphData[j][i]) !== 'undefined')
          {
            if (graphData[0][i] !== 'cloud_cover')
            {
              let date = Moment(graphData[j][y_index]).unix() * 1000;   
              column.push({x: date, y: parseFloat(graphData[j][i])});
            }
            else if(graphData[0][i] === 'cloud_cover' && this.props.filter)
            {
              cloud_cover.push(parseFloat(graphData[j][i]));
              if (parseFloat(graphData[j][i]) > this.props.filter)
              {
                filter.push(j);
              }
            }
          }
        }

        let excludes = ['no class', 'date_to', 'date_from', 'blanc', 'cloud_cover'];

        //make data from columns
        if (graphData[0][i] === 'area')
        {
          if(this.props.type === 'spectral')
          {
            this.ymax = [-1, 1];
          }
          else
          {
            this.ymax = [0, parseFloat(graphData[1][i])];
          }
        }
        else if(!excludes.includes(graphData[0][i]))
        {
          data.data.push({name: graphData[0][i], data: column});
        }
      }

      this.setState({filterArray: filter, cloud_cover: cloud_cover});
      if (!this.data)
      {
        this.data = data;
      }
      this.renderLines(filter);
    }
    else
    {
      let content = <p>{rawGraphData}</p>;
      this.setState({lines: content});
    }
  };

  renderLines = (filterArray) =>
  {
    let lines = [];
    let legend = [];
    let color;
    let data = JSON.parse(JSON.stringify(this.data));
    //let filterArray = this.state.filterArray;
    let filter = this.props.filter;


    if(typeof(data) !== 'undefined')
    {
      for (let i = 0; i < data.data.length; i++)
      {       
        for (let j = 0; j < this.infoContent.properties[this.props.type].length; j++)
        {
          if (this.infoContent.properties[this.props.type][j].name === data.data[i].name)
          {
            this.infoContent.properties[this.props.type][j].color ? color = this.infoContent.properties[this.props.type][j].color : color = '000';
            break;
          }
        }

        if(filterArray.length > 0)
        {
        
          for (let k = filterArray.length - 1; k >= 0; k--)
          {
            data.data[i].data.splice(filterArray[k], 1);
          }
        }

        if (data.data[i].data.length > 1 && data.data[i].name !== 'max')
        {
          lines.push(<LineSeries
            key={data.data[i].name + filter}
            curve={'curveMonotoneX'}
            data={data.data[i].data}
            color={'#' + color}
            onNearestX={i === 0 ? this._onNearestX : null}
            name={data.data[i].name}
          />);

          legend.push({title: data.data[i].name, color: '#' + color})
        }
        else
        {
          lines.push(<p key='No Data'>No Data</p>)
        }
      }
    }
    else
    {
      lines.push(<p key='No Data'>No Data</p>);
    }

    this.setState({lines: lines, legend: legend});
  };

  render(){
    let axixStyle = {
      line: {stroke: '#808080'},
      ticks: {stroke: '#808080'},
      text: {stroke: 'none', fill: '#545454', fontWeight: 600}};
      if (this.state.lines.length > 0 && this.state.lines[0].type !== 'p')
      {
        return(
          <FlexibleXYPlot
            key={'FlexibleXYPlot' + this.props.type + this.props.filter}
            height={200}
            yDomain={this.ymax}
          >
            <XAxis
              key={'XAxis' + this.props.type + this.props.filter}
              attr="x"
              attrAxis="y"
              orientation="bottom"
              tickFormat={function tickFormat(d){return Moment(d).format('DD-MM-YY')}}
              tickLabelAngle = {-35}
              style={axixStyle}
              tickValues={this.ticksX}
            />
            <YAxis
              key={'YAxis' + this.props.type + this.props.filter}
              attr="y"
              attrAxis="x"
              orientation="left"
              style={axixStyle}
            />
            {this.state.lines}
            <Crosshair
              key={'crossHair' + this.props.type + this.props.filter}
              values={this.state.crosshairValues}
              className={'test-class-name'}
            />
            <DiscreteColorLegend
              key={'DiscreteColorLegend' + this.props.type + this.props.filter}
              orientation='horizontal'
              items={this.state.legend} />
          </FlexibleXYPlot>
        );
      }
      else if(this.state.lines[0] && this.state.lines[0].type === 'p')
      {
        return(this.state.lines[0]);
      }
      else
      {
        return(<p>Loading Data</p>);
      }
  }
}

export default LineChart;