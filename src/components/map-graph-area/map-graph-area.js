import React, { PureComponent, createRef } from "react";
import $ from 'jquery';
import slider from 'jquery-ui/ui/widgets/slider';

import Moment from "moment";
import { Graph } from "../graph/graph";

import 'jquery-ui/themes/base/all.css'

export class MapGraphArea extends PureComponent {

    clearIndexName = "clear";
    maskedIndexName = "masked";

    mapGraphClassesGraphId = "#map-graph-area-classes-graph";
    mapGraphIndicesGraphId = "#map-graph-area-indices-graph";

    mapGraphCloudCoverSliderId = "#map-graph-area-max-cloudcover-slider";
    mapGraphCloudCoverSliderLabelId = "#map-graph-area-max-cloudcover-slider-label";
    

    constructor(props, context) {
        super(props, context);
        this.state = {
            maxMasked = 1,

            classesData,
            indicesData
        };
    }

    componentDidMount = () => {
    }

    componentWillReceiveProps = (nextProps) => {
    }

    render() {
        return (
            <div>
                
            </div>
        )
    }
}
