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
import ViewerUtility from '../../../ViewerUtility';

const NO_DATA_RESULT = 'no data\n';
const DATE_COLUMN_NAME = 'date_to';

const CLOUD_COVER_COLUMN_INFO = {
  name: 'cloud_cover',
  color: 'bababaff'
};

export class LineChart extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      data: null
    }
  };

  componentWillMount = () => {
    let graph = this.prepareGraph();
    this.setState({ graph: graph });
  }

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data || this.props.type !== prevProps.type) {
      let graph = this.prepareGraph();
      this.setState({ graph: graph });
    }
  }

  prepareGraph = () => {
    let data = this.props.data;
    let type = this.props.type;

    if (!data || !type) {
      return null;
    }

    let isSpectralIndices = type === ViewerUtility.dataGraphType.spectralIndices;
    let parsedData = data.parsed;

    if (data.raw === NO_DATA_RESULT || !parsedData || parsedData.data.length === 0) {
      return (
        <div>
          No data
        </div>
      );
    }

    let columnInfo = null;

    if (!isSpectralIndices) {
      let mapClasses = getUniqueLabels(this.props.map.classes, 'classes');
      columnInfo = mapClasses.filter(x => x.name !== ViewerUtility.specialClassName.noClass && x.name !== ViewerUtility.specialClassName.blanc);    
    }
    else if (type === ViewerUtility.dataGraphType.spectralIndices) {
      columnInfo = getUniqueLabels(this.props.map.spectralIndices, 'indices');
    }
    else {
      return null;
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

    if (isSpectralIndices) {
      adjustedColumnInfo.push(CLOUD_COVER_COLUMN_INFO);
    }

    let filteredColumnNames = parsedData.meta.fields.filter(x => adjustedColumnInfo.find(y => y.name === x));

    let series = [];    

    for (let i = 0; i < filteredColumnNames.length; i++ ) {

      let columnName = filteredColumnNames[i];

      let seriesData = [];

      for (let x = 0; x < parsedData.data.length; x++) {

        let row = parsedData.data[x];

        let value = row[columnName];
        let date = Moment(row[DATE_COLUMN_NAME]).unix() * 1000;

        if (!isSpectralIndices && columnName === ViewerUtility.specialClassName.mask && 
          row[ViewerUtility.specialClassName.blanc]) {
          value += row[ViewerUtility.specialClassName.blanc];
        }

        seriesData.push({
          x: date,
          y: value
        });
      }

      let color = `#${adjustedColumnInfo.find(y => y.name === columnName).color}`;

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
        {xAxis}
        {yAxis}
        {series}
        {legend}
      </FlexibleXYPlot>
    );

    return graph;
  }

  render() {
    return this.state.graph;
  }
}

function getUniqueLabels(timestampLabels, property) {
  let uniqueLabels = [];

  for (let i = 0; i < timestampLabels.length; i++) {
    let timestamp = timestampLabels[i];

    for (let x = 0; x < timestamp[property].length; x++) {
      let label = timestamp[property][x];

      let uniqueLabel = uniqueLabels.find(y => y.name === label.name);

      if (!uniqueLabel) {
        uniqueLabels.push(label);
      }
    }
  }

  return uniqueLabels;
}

export default LineChart;