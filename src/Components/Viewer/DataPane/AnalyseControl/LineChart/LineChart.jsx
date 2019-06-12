import React, { PureComponent} from 'react';
import Moment from 'moment';

import {
  FlexibleXYPlot, 
  XAxis, 
  YAxis, 
  LineMarkSeries, 
  DiscreteColorLegend, 
  Crosshair, 
  Highlight
} from 'react-vis';

import './react-vis-style.css';
import './LineChart.css';

const NO_DATA_RESULT = 'no data';
const GRAPH_COLUMN_EXCLUDES = [
  'no class', 
  'date_to', 
  'date_from', 
  'blanc', 
  'timestamp', 
  'area'
];
const DATE_COLUMN_NAME = 'date_to';
const MASK_COLUMN_NAME = 'mask';
const BLANC_COLUMN_NAME = 'blanc';
const NO_CLASS_COLUMN_NAME = 'no class';

export class LineChart extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      classesGraph: null,
      spectralIndicesGraph: null
    }
  };

  componentWillMount = () => {
    let graphs = this.prepareGraphs();
    this.setState({ classesGraph: graphs.classes, spectralIndicesGraph: graphs.spectralIndices });
  }

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data) {
      let graphs = this.prepareGraphs();
      this.setState({ classesGraph: graphs.classes, spectralIndicesGraph: graphs.spectralIndices });
    }
  }

  prepareGraphs = () => {

    let data = this.props.data;

    if (!data) {
      return null;
    }

    let mapClasses = getUniqueLabels(this.props.map.classes, 'classes');
    let classColumnInfo = mapClasses.filter(x => x.name !== NO_CLASS_COLUMN_NAME && x.name !== BLANC_COLUMN_NAME);    

    let classesGraph = this.prepareGraphsAux(data.classes, classColumnInfo, false);
    // let spectralIndicesGraph = this.prepareGraphsAux(data.spectralIndices);
    let spectralIndicesGraph = null;
    
    return {
      classes: classesGraph,
      spectralIndices: spectralIndicesGraph
    };    
  }

  prepareGraphsAux = (data, columnInfo, isSpectralIndices) => {
    if (data.raw === NO_DATA_RESULT) {
      return (
        <div>
          No data.
        </div>
      );
    }

    let adjustedColumnInfo = [];
    for (let i = 0; i < columnInfo.length; i++) {

      let color = columnInfo[i].color;

      if (color === 'ffffffff') {
        color = 'bababaff';
      }

      adjustedColumnInfo.push({
        name: columnInfo[i].name,
        color: color
      });
    }

    let parsedData = data.parsed;
    let filteredColumnNames = parsedData.meta.fields.filter(x => adjustedColumnInfo.find(y => y.name === x));

    let series = [];    

    for (let i = 0; i < filteredColumnNames.length; i++ ) {

      let columnName = filteredColumnNames[i];

      let seriesData = [];

      for (let x = 0; x < parsedData.data.length; x++) {

        let row = parsedData.data[x];

        let value = row[columnName];
        let date = Moment(row[DATE_COLUMN_NAME]).unix() * 1000;

        if (!isSpectralIndices && columnName === MASK_COLUMN_NAME && row[BLANC_COLUMN_NAME]) {
          value += row[BLANC_COLUMN_NAME];
        }

        seriesData.push({
          x: date,
          y: value
        });
      }

      let color = null;
      if (!isSpectralIndices) {
        color = adjustedColumnInfo.find(y => y.name === columnName).color;
      }
      else {

      }

      color = `#${color}`;

      let seriesElement = (
        <LineMarkSeries
          key={columnName}
          name={columnName}
          curve={'curveMonotoneX'}
          data={seriesData}
          color={color}
          size={3}
        />
      );

      series.push(seriesElement);
    }

    let axisStyle = {
      line: {stroke: '#808080'},
      ticks: {stroke: '#808080'},
      text: {stroke: 'none', fill: '#545454', fontWeight: 200, fontSize: '10px'},
    };

    let xAxis = (
      <XAxis
        key={'x_axis'}
        attr='x'
        attrAxis='y'
        orientation='bottom'
        tickFormat={function tickFormat(d){return Moment(d).format('YY-MM-DD')}}
        tickLabelAngle={-35}
        style={axisStyle}
        left={50}
        tickSizeOuter={3}
        tickTotal={8}
      />
    );

    let yAxis = (
      <YAxis
        key={'y_axis' + this.props.type + this.props.filter}
        attr="y"
        attrAxis="x"
        orientation="left"
        style={axisStyle}
        left={10}
        tickSizeOuter={3}
      />
    );

    let legendItems = [];
    for (let i = 0; i < adjustedColumnInfo.length; i++) {
      legendItems.push({
        title: adjustedColumnInfo[i].name,
        color: `#${adjustedColumnInfo[i].color}`
      });
    }

    let legend = (
      <DiscreteColorLegend
        key={'legend'}
        orientation='horizontal'
        items={legendItems}
      />
    );

    let graph = (
      <FlexibleXYPlot
        key={'plot'}
        height={200}
      >
        {/* {[xAxis, yAxis, ...series]} */}
        {xAxis}
        {yAxis}
        {series}
        {legend}
      </FlexibleXYPlot>
    );


    return graph;    
  }

  render() {
    if (!this.state.classesGraph) {
      return null;
    }

    return this.state.classesGraph;
  }
}

function getUniqueLabels(timestampLabels, type) {
  let uniqueLabels = [];

  for (let i = 0; i < timestampLabels.length; i++) {
    let timestamp = timestampLabels[i];

    for (let x = 0; x < timestamp[type].length; x++) {
      let label = timestamp[type][x];

      let uniqueLabel = uniqueLabels.find(y => y.name === label.name);

      if (!uniqueLabel) {
        uniqueLabels.push(label);
      }
    }
  }

  return uniqueLabels;
}

export default LineChart;