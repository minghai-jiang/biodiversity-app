import React, { PureComponent} from "react";
import $ from 'jquery';
import 'jquery-ui/ui/widgets/slider';

import 'jquery-ui/themes/base/all.css';
import "./max-masked-slider.css";

export class MaxMaskedSlider extends PureComponent {
    maxMaskedSliderId = "max-masked-slider";
    maxMaskedSliderLabelId = "max-masked-slider-label";

    sliderMax = 100;

    constructor(props, context) {
        super(props, context);
        this.state = {
            value: this.sliderMax
        };
    }

    componentDidMount = () => {
        this.renderSlider();
    }

    renderSlider = () => {
        $(`#${this.maxMaskedSliderId}`).slider({
            min: 0,
            max: this.sliderMax,
            values: [this.state.value],
            slide: this.onSlide
        });

        $(`#${this.maxMaskedSliderLabelId}`).text(`Max masked: ${this.state.value}%`);
    }

    onSlide = (event, ui) => {
        this.setState(
            { value: ui.values[0] },
            () => {
                this.renderSlider();
                this.props.onSlide(this.state.value);
            }
        );
    }

    render() {
        return (
        <div>
            <div id={this.maxMaskedSliderId}></div>
            <div id="label-div">
                <span id={this.maxMaskedSliderLabelId}></span>
            </div>
        </div>
        )
    }
}
