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

export class LineChartScore extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      data: null,
    }
  };

  componentWillMount = () => {
    let graphElements = this.prepareGraph();
    this.setState({ graphElements: graphElements });
  }

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data)
    {
      let graphElements = this.prepareGraph();
      this.setState({ graphElements: graphElements });
    }
  }

  prepareGraph = () => {
    let data = this.props.data.data;
    if (!data || data.length === 0) {
      return null;
    }

    let color = '#000';
    let lineData = [];

    for (var i = 0; i < data.length; i++)
    {
      let date = Moment(data[i].date).format('X') * 1000;
      lineData.push({
        x: date,
        y: data[i].score,
      });
    }

    let line = <LineMarkSeries
          key={'id_score'}
          name={'score'}
          curve={'curveMonotoneX'}
          data={lineData}
          color={color}
          size={3}
        />;

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
        tickFormat={function tickFormat(d){return Moment(d).format('DD-MM-YYYY')}}
        tickLabelAngle={-35}
        style={axisStyle}
        left={50}
        tickSizeOuter={3}
        tickTotal={data.length + 1}
      />
    );

    let yAxis = (
      <YAxis
        key={'y_axis'}
        attr="y"
        attrAxis="x"
        orientation="left"
        style={axisStyle}
        left={10}
        tickSizeOuter={3}
      />
    );

    return [xAxis, yAxis, line];
  }

  render() {
    if (!this.state.graphElements) {
      return null;
    }

    return (
      <FlexibleXYPlot
        key={'plot'}
        height={200}
        yDomain={[0, 4]}
      >
        {this.state.graphElements}
      </FlexibleXYPlot>
    );
  }
}

export default LineChartScore;