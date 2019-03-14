import React, { PureComponent} from 'react';
import $ from 'jquery';
import Moment from 'moment';
import 'jquery-ui/ui/widgets/slider';

import 'jquery-ui/themes/base/all.css'
import './TimestampSelector.css';

export class TimestampSelector extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      start: 0,
      end: 0,
    };
  }

  componentDidMount = () => {
    this.renderSlider();
  }

  renderSlider = () => {
    let timestamps = this.props.timestamps;
    if (timestamps) {
      let max = timestamps.length - 1;
      if (!max || max < 0) {
        max = 0;
      }
  
      $('#slider').slider({
        range: true,
        min: 0,
        max: max,
        values: [this.state.start, this.state.end],
        step: 1,
        slide: this.onSlide
      });
  
      var startTimestamp = timestamps[this.state.start];
      var endTimestamp = timestamps[this.state.end];
      var dateRangeText = '';    
  
      if (startTimestamp && endTimestamp) {
        let dateFormat = 'MMM Do YYYY';
  
        dateRangeText = 
          Moment(startTimestamp.dateFrom).format(dateFormat) + 
          ' - ' + 
          Moment(endTimestamp.dateFrom).format(dateFormat);
      }
  
      let sliderDateElement = $('#slider-date');
  
      if (dateRangeText === '') {
        sliderDateElement.hide();
      }
      else {
        sliderDateElement.show();
        sliderDateElement.text(dateRangeText);
      }
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.timestamps !== nextProps.timestamps) {
      this.setState({
        start: 0,
        end: 0,
      },
      () => { this.renderSlider(); });
    }
  }

  onSlide = (event, ui) => {
    this.setState({
      start: ui.values[0],
      end: ui.values[1]
    },
    () => { 
      this.renderSlider();
      this.props.onSlide(this.state.start, this.state.end); 
    }
    );
  }

  render() {
    if (this.props.timestamps) {
      return (
        <div>
          <div id='slider'></div>
          <div id='slider-date-div'>
            <span id='slider-date'>Date</span>
          </div>
        </div>
      )
    }
    else {
      return (
        <div>
        </div>
      )
    }
  }
}

export default TimestampSelector;