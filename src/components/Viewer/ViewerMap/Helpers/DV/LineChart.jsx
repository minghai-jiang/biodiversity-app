import React, { PureComponent} from 'react';
//import Papa from 'papaparse';
import Moment from 'moment';

import {FlexibleXYPlot, XAxis, YAxis, LineSeries, DiscreteColorLegend, Crosshair} from 'react-vis';
import './react-vis-style.css';

export class LineChart extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      data: [],
      lines: [],
      meta: [],
      /*crosshairValues: [],
      filterArray: [],
      cloud_cover: [],*/
    }

    this.map = this.props.props.map;
    this.props.props.infoContent &&  this.props.props.infoContent.headers ? this.headers = this.props.props.infoContent.headers : this.headers = {};
    this.infoContent = this.props.props.infoContent;
    //this.data = null;
    //this.ticksX = [];
    //this.ymax = [0,0];
  };

  _onMouseLeave = () => {
    this.setState({crosshairValues: []});
  };

  _onNearestX = (value, {index}) => {
    this.setState({crosshairValues: this.data.data.map(d => d.data[index])});
  };

  componentWillReceiveProps = (nextProps) =>
  {
    /*if (nextProps.filter !== this.props.filter && this.state.cloud_cover.length > 0)
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
    }*/
  };

  componentWillMount = () => {
    if(!this.map && !this.infoContent)
    {
      return null;
    }

    let data = JSON.parse(JSON.stringify(this.props.data));

    let graphData = {};
    graphData.meta = {};
    graphData.meta.legend = [];
    graphData.meta.ticksX = [];
    graphData.meta.max = data.data[0].area;

    let excludes = ['no class', 'date_to', 'date_from', 'blanc', 'cloud_cover', 'timestamp', 'area'];

    for (let i = 0; i < data.meta.fields.length; i++)
    {
      if (!excludes.includes(data.meta.fields[i]))
      {
        let classes = this.infoContent.properties[this.props.type];
        let color = '';
        for (let j = 0; j < classes.length; j++)
        {
          if(classes[j].name === data.meta.fields[i])
          {
            color = classes[j].color;
            break;
          }
        }

        graphData[data.meta.fields[i]] = {data:[], color: color};
        graphData.meta.legend.push({title: data.meta.fields[i], color: '#' + color});
      }
    }

    console.log(this.props.filter);
    for (let i = 0; i < data.data.length; i++)
    {
      let row = data.data[i];

      let cloud_cover = row.cloud_cover ? row.cloud_cover : this.props.filter;

      if (typeof(this.props.filter) === 'number' && cloud_cover <= this.props.filter)
      {
        for(let key in row)
        {
          if (graphData[key])
          {
            let date = Moment(row.date_to).unix() * 1000;
            graphData[key].data.push({x: date, y:row[key]})
            graphData.meta['ticksX'].push(date);
          }
        }
      }
    }

    let lines = [];
    for(let key in graphData)
    {
      if (key !== 'meta' && graphData[key].data.length > 1)
      {
        let color = '000';
        lines.push(<LineSeries
          key={key + this.props.filter}
          curve={'curveMonotoneX'}
          data={graphData[key].data}
          color={'#' + graphData[key].color}
          //onNearestX={i === 0 ? this._onNearestX : null}
          name={key}
        />);
      }
      else if(key !== 'meta')
      {
        lines.push(<p key='notEnoughData'>Not enough data for a graph</p>)
      }
    }
    
    if (this.props.type === 'class')
    {
      graphData.meta['yMax'] = [0,graphData.meta.max];
    }
    else
    {
      graphData.meta['yMax']= [-1, 1];
    }

    this.setState({lines: lines, meta: graphData.meta});
  }

  render(){
    let axixStyle = {
      line: {stroke: '#808080'},
      ticks: {stroke: '#808080'},
      text: {stroke: 'none', fill: '#545454', fontWeight: 600}};
      console.log(this.state.meta)
      if (this.state.lines.length > 0 && this.state.lines[0].type !== 'p')
      {
        return(
          <FlexibleXYPlot
            key={'FlexibleXYPlot' + this.props.type + this.props.filter}
            height={200}
            yDomain={this.state.meta.yMax}
            ref={this.props.type + 'Chart'}
          >
            <XAxis
              key={'XAxis' + this.props.type + this.props.filter}
              attr="x"
              attrAxis="y"
              orientation="bottom"
              tickFormat={function tickFormat(d){return Moment(d).format('DD-MM-YY')}}
              tickLabelAngle = {-35}
              style={axixStyle}
              tickValues={this.state.meta.ticksX}
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
              items={this.state.meta.legend} />
          </FlexibleXYPlot>
        );
      }
      else if(this.state.lines[0] && this.state.lines[0].type === 'p')
      {
        return(this.state.lines[0]);
      }
      else
      {
        return(<p>Loading Graph Data <img src='/images/spinner.png' alt='spinner'/></p>);
      }
  }
}

export default LineChart;