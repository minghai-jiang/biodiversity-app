import React, { PureComponent} from 'react';
import Slider from 'rc-slider';
import Moment from 'moment';

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import './TimestampSelector.css';

const Single = Slider.createSliderWithTooltip(Slider);
const Range = Slider.createSliderWithTooltip(Slider.Range);

export class TimestampSelector extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      range: false,
      start: 0,
      end: 0,
      dates: [0]
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.map !== prevProps.map && this.props.map) {
      let lastTimestamp = this.props.map.timestamps.length - 1;
      let timestamps = this.props.map.timestamps;
      let dateFormat = 'YYYY-MM-DD';

      let dates = [];
      for (let i = 0; i < timestamps.length; i++) {
        dates[i] = Moment(timestamps[i].dateTo).format(dateFormat);
      }

      this.setState({
        start: lastTimestamp,
        end: lastTimestamp,
        dates: dates
      });
    }
  }

  onSlide = (value) => {
    let timestampRange = {};

    if (!this.state.range) {
      timestampRange = {
        start: value,
        end: value
      };
    }
    else {
      timestampRange = {
        start: value[0],
        end: value[1]
      };
    }

    this.setState({ start: timestampRange.start, end: timestampRange.end });
    this.props.onSelectTimestamp(timestampRange);
  }

  onRangeToggleChange = (e) => {
    let timestampRange = {
      start: this.state.end,
      end: this.state.end
    };

    this.setState({
      start: timestampRange.end,
      end: timestampRange.end,
      range: e.target.checked
    });

    this.props.onSelectTimestamp(timestampRange);
  }

  render() {
    if (!this.props.map) {
      return null;
    }

    let slider = (
      <Single
        dots={false}
        step={1}
        defaultValue={this.state.end}
        value={this.state.end}
        min={0}
        max={this.props.map.timestamps.length - 1}
        included={false}
        onChange={this.onSlide}
        tipFormatter={value => this.state.dates[value]}
      />
    );

    if (this.state.range) {
      slider = (
        <Range
          dots={false}
          step={1}
          defaultValue={[this.state.start, this.state.end]}
          value={[this.state.start, this.state.end]}
          min={0}
          max={this.props.map.timestamps.length - 1}
          onChange={this.onSlide}
          tipFormatter={value => this.state.dates[value]}
        />
      );
    }

    let dateText = null;
    if (this.props.map) {
      if (!this.state.range) {
        dateText = this.state.dates[this.state.end];
      }
      else {
        dateText = this.state.dates[this.state.start] + ' - ' + this.state.dates[this.state.end];
      }
    }

    return (
      <div className='timestamp-selector'>
        <div>
          {this.props.localization['Timestamps']} (
          <input type='checkbox' id='timestamp-range' onChange={this.onRangeToggleChange} checked={this.state.range}/>
          {this.props.localization['Range']});
        </div>
        {slider}
        <div>{dateText}</div>
      </div>
    );
  }
}

export default TimestampSelector;
