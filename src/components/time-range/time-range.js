import React, { PureComponent} from "react";
import $ from 'jquery';
import produce from "immer";
import Moment from "moment";

import 'jquery-ui/themes/base/all.css'
import "./time-range.css";


export class TimeRange extends PureComponent {
    constructor(props, context) {
        super(props, context)
        this.state = {
            max: 0,
            start: 0,
            end: 0,
            timestamps: props.timestamps
        };
    }

    componentDidMount = () => {
        this.renderSlider();
    }

    renderSlider = () => {
        var max = this.state.timestamps.length - 1;
        if (!max || max < 0) {
            max = 0;
        }

        $("#slider").slider({
            range: true,
            min: 0,
            max: max,
            values: [this.state.start, this.state.end],
            step: true,
            slide: this.onSlide
        });

        var startTimestamp = this.state.timestamps[this.state.start];
        var endTimestamp = this.state.timestamps[this.state.end];
        var dateRangeText = "";    

        if (startTimestamp && endTimestamp) {
            let dateFormat = "MMM Do YYYY";

            dateRangeText = 
                Moment(startTimestamp.date).format(dateFormat) + 
                " - " + 
                Moment(endTimestamp.date).format(dateFormat);
        }

        let sliderDateElement = $("#slider-date");

        if (dateRangeText === "") {
            sliderDateElement.hide();
        }
        else {
            sliderDateElement.show();
            sliderDateElement.text(dateRangeText);
        }
    }

    componentWillReceiveProps = (nextProps) => {

        let newStart = this.state.start;
        let newEnd = this.state.end;
        if (this.state.timestamps !== nextProps.timestamps) {
            newStart = 0;
            newEnd = 0;
        }

        this.setState(
            produce(this.state, (draft) => {
                draft.timestamps = nextProps.timestamps;
                draft.start = newStart;
                draft.end = newEnd;
            }),
            () => { this.renderSlider(); }
        );
    }

  onSlide = (event, ui) => {
    this.setState(
      produce(this.state, draft => {
        draft.start = ui.values[0];
        draft.end = ui.values[1];
      })
    );

    this.props.onSlide(this.state.start, this.state.end);
  }

    render() {
        return (
            <div>
                <div id="slider"></div>
                <div id="slider-date-div">
                    <span id="slider-date">Date</span>
                </div>
            </div>
        )
    }
}
