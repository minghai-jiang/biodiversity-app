import React, { PureComponent} from 'react';
import Slider from 'rc-slider';
import Moment from 'moment';

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import './TimestampSelector.css';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
var marks = {};

export class TimestampSelector extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      start: 0,
      end: 0,
    };
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.timestamps !== nextProps.timestamps)
    {
      this.setState({ start: 0, end: 0 });
    }
  }

  handleChange = (value) => {
    this.setState({start: value[0], end: value[1]}, () => {
      this.props.onSlide(this.state.start, this.state.end);
    });
  }

  getMarks = () => {
    let timestamps = this.props.timestamps;
    let dateFormat = 'MMM Do YYYY';
    
    for (let i = 0; i < timestamps.length; i++)
    {
      marks[timestamps[i].timestampNumber] = Moment(timestamps[i].dateFrom).format(dateFormat);
    }
  }

  render() {
    
    if (this.props.timestamps)
    {
      let timestamps = this.props.timestamps;
      let style = {width: '50vw'}

      this.getMarks();

      return (
      <div style={style}>
        <Range
          key='range'
          dots={false}
          step={1}
          defaultValue={[this.state.start, this.state.end]}
          value={[this.state.start, this.state.end]}
          min={0}
          max={timestamps.length - 1}
          onChange={this.handleChange}
          tipFormatter={value => marks[value]}
        />
      </div>);
    }
    else
    {
      return <div></div>
    }
  }
}

export default TimestampSelector;