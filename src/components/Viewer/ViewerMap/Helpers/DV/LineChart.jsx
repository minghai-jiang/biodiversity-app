import React, { PureComponent} from 'react';
import Moment from 'moment';

import {
  FlexibleXYPlot, 
  XAxis, 
  YAxis, 
  LineSeries, 
  DiscreteColorLegend, 
  Crosshair, 
  Highlight
} from 'react-vis';
import './react-vis-style.css';

export class LineChart extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      lastDrawLocation: null,
      showCrosshair: true,
      data: [],
      lines: [],
      meta: [],
    }

    this.map = this.props.props.map;
    this.props.props.infoContent &&  this.props.props.infoContent.headers ? this.headers = this.props.props.infoContent.headers : this.headers = {};
    this.infoContent = this.props.props.infoContent;
  };

  _onMouseLeave = () => {
    this.setState({crosshairValues: []});
  };

  _onNearestX = (value, {index}) => {
    this.setState({crosshairValues: this.state.data.map(d => d[index])});
  };

  componentWillMount = () => {
    if(!this.map && !this.infoContent)
    {
      return null;
    }

    let data = JSON.parse(JSON.stringify(this.props.data));

    if (data.data.length > 0)
    {
      let graphData = {};
      graphData.meta = {};
      graphData.meta.legend = [];
      graphData.meta.ticksX = [];
      graphData.meta.max = data.data[0].area;
  
      let excludes = ['no class', 'date_to', 'date_from', 'blanc', 'timestamp', 'area'];
  
      for (let i = 0; i < data.meta.fields.length; i++)
      {
        if (!excludes.includes(data.meta.fields[i]))
        {
          let classes = this.infoContent.properties[this.props.type];
          let color = 'fff';
          if (classes)
          {  
            for (let j = 0; j < classes.length; j++)
            {
              if(classes[j].name === data.meta.fields[i])
              {
                if(classes[j].color){color = classes[j].color};
                break;
              }
            }
          }
  
          graphData[data.meta.fields[i]] = {data:[], color: color};
          graphData.meta.legend.push({title: data.meta.fields[i], color: '#' + color});
        }
      }
  
      for (let i = 0; i < data.data.length; i++)
      {
        let row = data.data[i];
  
        let mask;
        let filter;
  
        if (this.props.type === 'class')
        {
          filter = this.props.filter * row.area;
          mask = row.mask ? row.mask : filter;
        }
        else
        {
          filter = this.props.filter;
          mask = row.cloud_cover ? row.cloud_cover : filter;
        }
  
  
        if (typeof(this.props.filter) === 'number' && mask <= filter)
        {
          for(let key in row)
          {
            if (graphData[key])
            {
              let date = Moment(row.date_from).unix() * 1000;
              graphData[key].data.push({x: date, y:row[key]})
              graphData.meta['ticksX'].push(date);
            }
          }
        }
      }
  
      let stateData = [];
      let lines = [];
      for(let key in graphData)
      {
        if (key !== 'meta' && graphData[key].data.length > 1)
        {
          let color = 'fff';
          lines.push(<LineSeries
            key={key + this.props.filter}
            curve={'curveMonotoneX'}
            data={graphData[key].data}
            color={'#' + graphData[key].color}
            onNearestX={this._onNearestX}
            name={key}
            style={{transform: 'translate(50px, 10px)'}}
          />);
          stateData.push(graphData[key].data);
        }
        else if(key !== 'meta')
        {
          lines.push(<p key='notEnoughData'>Not enough data for a graph</p>)
        }
      }
  
      this.setState({lines: lines, meta: graphData.meta, data: stateData});
    }
    else
    {
      let lines = [<p key='NoData'>No Data</p>];
      this.setState({lines: lines});
    }
  }

  crossHairData = (d) =>
  {
    let merged = [];
    let legendCopy = JSON.parse(JSON.stringify(this.state.meta.legend))
    for (let i = 0; i < legendCopy.length; i++)
    {
      let legendItem = legendCopy[i];
      delete legendItem.color;
      let crossHairItem = d[i];
      legendItem.value = d[i].y;
      merged.push(legendItem);
    }

    return (merged);
  };

  crossHairTitle = (d) =>
  {
    let title = {title: 'date', value: Moment(d[0].x).format('YYYY-MM-DD')}
    return title;
  };

  render(){
    let axixStyle = {
      line: {stroke: '#808080'},
      ticks: {stroke: '#808080'},
      text: {stroke: 'none', fill: '#545454', fontWeight: 200, fontSize: '10px'},
    };

    let lastDrawLocation = this.state.lastDrawLocation;
      
    if (this.state.lines.length > 0 && this.state.lines[0].type !== 'p')
    {
      let plot = [];

      let xAxis;
      let maxTick = 25;
      if (this.state.meta.ticksX && this.state.meta.ticksX.length/this.state.lines.length > maxTick)
      {
        xAxis = <XAxis
          key={'XAxis' + this.props.type + this.props.filter}
          attr="x"
          attrAxis="y"
          orientation="bottom"
          tickFormat={function tickFormat(d){return Moment(d).format('YY-MM-DD')}}
          tickLabelAngle = {-35}
          style={axixStyle}
          left={50}
          tickSizeOuter={3}
          tickTotal={maxTick}
        />;
      }
      else
      {
        xAxis = <XAxis
          key={'XAxis' + this.props.type + this.props.filter}
          attr="x"
          attrAxis="y"
          orientation="bottom"
          tickFormat={function tickFormat(d){return Moment(d).format('YY-MM-DD')}}
          tickLabelAngle = {-35}
          style={axixStyle}
          left={50}
          tickSizeOuter={3}
          tickValues={this.state.meta.ticksX}
        />;
      }

      plot.push(xAxis);

      let yAxix = <YAxis
        key={'YAxis' + this.props.type + this.props.filter}
        attr="y"
        attrAxis="x"
        orientation="left"
        style={axixStyle}
        left={10}
        tickSizeOuter={3}
      />;
      plot.push(yAxix);

      let lines = this.state.lines;
      plot.push(lines);

      // if (this.state.showCrosshair) {
      //   let crosshair = <Crosshair
      //     key={'crossHair' + this.props.type + this.props.filter}
      //     values={this.state.crosshairValues}
      //     className={'test-class-name'}
      //     itemsFormat={(d) => this.crossHairData(d)}
      //     titleFormat={(d) => this.crossHairTitle(d)}
      //   />;
      //   plot.push(crosshair);
      // }

      let discreteLegend = <DiscreteColorLegend
        key={'DiscreteColorLegend' + this.props.type + this.props.filter}
        orientation='horizontal'
        items={this.state.meta.legend}
      />;
      plot.push(discreteLegend);

      return(
        <FlexibleXYPlot
          key={'FlexibleXYPlot' + this.props.type + this.props.filter}
          height={200}
          ref={this.props.type + 'Chart'}
          style={{marginRight: 10}}
          onMouseLeave={this._onMouseLeave}
          xDomain={
            lastDrawLocation && [
              lastDrawLocation.left,
              lastDrawLocation.right
            ]
          }
          // yDomain={
          //   lastDrawLocation && [
          //     lastDrawLocation.bottom,
          //     lastDrawLocation.top
          //   ]
          // }
          
        >
          {plot}
          <Highlight
            enableY={false}
            onBrushStart={area => {
              this.setState({ showCrosshair: false });
            }}
            onBrushEnd={area => {
              this.setState({ lastDrawLocation: area, showCrosshair: true });
            }}            
          />
        </FlexibleXYPlot>
      );
    }
    else if(this.state.lines[0] && this.state.lines[0].type === 'p')
    {
      return(this.state.lines[0]);
    }
    else
    {
      return(<p>Loading Graph Data <img className='loading-spinner' src='/images/spinner.png' alt='spinner'/></p>);
    }
  }
}

export default LineChart;