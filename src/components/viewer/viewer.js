/* eslint-disable import/first */
import React, { PureComponent, createRef } from "react";

import "./viewer.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  Map,
  TileLayer,
  LayersControl,
  MapProps,
  WMSTileLayer,
  LayerGroup
} from "react-leaflet";
import L, { Layer } from "leaflet";
window.L = L;
import "leaflet-draw";
import produce from "immer";
import Moment from "moment";
import $ from 'jquery';

import { MapSelector } from "../map-selector/map-selector";
import { TimeRange } from "../time-range/time-range";
import { Graph } from "../graph/graph";
import { MaxMaskedSlider } from "../max-masked-slider/max-masked-slider";
import { relative } from "path";
const { BaseLayer, Overlay } = LayersControl;

const defaultMapParams = {
    tileSize: 256,
    attribution: "Bird'sAI",
    maxZoom: 14,
    noWrap: true
};

const defaultMap = {
    isPublic: true,
    name: "Select map",
    timestamps: [],
    uuid: "",
    wmsName: "Chaco"
};


const maskLabel = "mask";
const blancLabel = "blanc";

const clearIndex = "clear";
const maskedIndex = "masked";


const maskGraphLineName = "mask";


class Viewer extends PureComponent {
    mapRef = createRef();

    constructor(props, context) {
        super(props, context);

        this.state = {
            apiUrl: props.apiUrl,
            wmsUrl: props.wmsUrl,
            zoom: 3,
            hasLocation: false,
            lat: 40.509865,
            lon: -0.118092,
            timestampNumber: "0",
            map: defaultMap,
            layer: "image",
        
            timeStart: 0,
            timeEnd: 0,
        
            showGraph: false,
            classificationData: null,
            indicesData: null,   
            graphClassificationData: [],
            indicesData: [],
            
            maxMasked: 1
        };
    }

    componentDidMount() {
        const map = this.mapRef.current.leafletElement;
        var drawnItems = new L.featureGroup();
        map.addLayer(drawnItems);
        var drawControl = new L.Control.Draw({
            draw: {
                polygon: {
                allowIntersection: false
                },
                rectangle: true,
                marker: false,
                polyline: false,
                circle: false,
                circlemarker: false
            },
            edit: false
        });
        map.addControl(drawControl);
        map.on(L.Draw.Event.CREATED, this.onShapeDrawnClosure(drawnItems));

        $("#time-range-selector").hide();
        $("#graph-area").hide();
        $("#loading-label-div").hide();
    }

    onShapeDrawnClosure(drawnItems) {
        return async function onShapeDrawn(event) {
            $("#loading-label-div").show(); 

            drawnItems.clearLayers();
            const layer = event.layer;
            drawnItems.addLayer(layer);
            const latLngs = layer.getLatLngs()[0];

            var shapeCoords = new Array();
            for (let i = 0; i < latLngs.length; i++) {
                var coord = {
                x: latLngs[i].lng,
                y: latLngs[i].lat
                };

                shapeCoords.push(coord);
            }      

            const request = new Request(`${this.state.apiUrl}getTileData`);      

            let timestampUuids = new Array();
            for (let i = this.state.timeStart; i <= this.state.timeEnd && i < this.state.map.timestamps.length; i++) {
                timestampUuids.push(this.state.map.timestamps[i].uuid);
            }
            let requestParams = {
                timestampUuids: timestampUuids,
                shape: shapeCoords,
                getIndices: false,
            };

            let tileDataPromise = this.getTileData(request, requestParams);

            // The object containers will be used to lookup a plot by class/index name.
            // The array will be passed to the graph.
            // Both contain the same plots.
            let classificationDataObject = {};
            let classificationDataArray = [];
        
            let indicesDataObject = {};
            let indicesDataArray = [];

            // Initialize the plot for each classification class without any data points.
            for (let i = 0; i < this.state.map.classes.length; i++) {
                let $class = this.state.map.classes[i];
                classificationDataObject[$class.name] = {
                    name: $class.name,
                    x: [],
                    y: [],
                    t: [],
                    color: $class.color            
                };

                classificationDataArray.push(classificationDataObject[$class.name]);
            }

            // Initialize the plot for each spectral index without any data points.
            for (let i = 0; i < this.state.map.spectralIndices.length; i++) {
                let spectralIndex = this.state.map.spectralIndices[i];

                indicesDataObject[spectralIndex.name] = {
                    name: spectralIndex.name,
                    x: [],
                    y: [],
                    t: [],
                    color: spectralIndex.color
                };

                indicesDataArray.push(indicesDataObject[spectralIndex.name]);        
            }

            // Wait for the request to finish.
            let tileData = await tileDataPromise;

            for (let i = 0; i < tileData.classes.length; i++) {
                let classesTimestamp = tileData.classes[i];
                let matchingTimestamp = this.state.map.timestamps.find((e) => { return e.uuid === classesTimestamp.timestampUuid; });

                // Add a data point for each of the classes from the response, unless the value is NaN.
                for (let className in classesTimestamp.data) {
                    if (classesTimestamp.data.hasOwnProperty(className)) {
                        let value = classesTimestamp.data[className];
                        if (!isNaN(value)) {
                            let date = Moment(matchingTimestamp.date).format("YYYY-MM-DD");

                            let dataGraph = classificationDataObject[className];
                            let insertIndex = dataGraph.t.length;

                            for (let t = 0; t < dataGraph.t.length; t++) {
                                if (matchingTimestamp.date < dataGraph.t[t]) {
                                    insertIndex = t;
                                    break;
                                }
                            }

                            classificationDataObject[className].x.splice(insertIndex, 0, date);
                            classificationDataObject[className].y.splice(insertIndex, 0, value);
                            classificationDataObject[className].t.splice(insertIndex, 0, matchingTimestamp.date);
                        }            
                    }
                }
            }

            for (let i = 0; i < tileData.spectralIndices.length; i++) {
                let indicesTimestamp = tileData.spectralIndices[i];
                let matchingTimestamp = this.state.map.timestamps.find((e) => { return e.uuid === indicesTimestamp.timestampUuid; });

                // Add a data point for each of the spectral index from the response, unless the value is NaN.
                for (let indexName in indicesTimestamp.data) {
                    if (indicesTimestamp.data.hasOwnProperty(indexName)) {
                        let value = indicesTimestamp.data[indexName];

                        if (!isNaN(value)) {
                            let date = Moment(matchingTimestamp.date).format("YYYY-MM-DD");

                            let dataGraph = indicesDataObject[indexName];
                            let insertIndex = dataGraph.t.length;;

                            for (let t = 0; t < dataGraph.t.length; t++) {
                                if (matchingTimestamp.date < dataGraph.t[t]) {
                                    insertIndex = t;
                                    break;
                                }
                            }

                            indicesDataObject[indexName].x.splice(insertIndex, 0, date);
                            indicesDataObject[indexName].y.splice(insertIndex, 0, value);
                            indicesDataObject[indexName].t.splice(insertIndex, 0, matchingTimestamp.date);
                        }            
                    }
                }            
            }

            // Change the masked and clear graphs in pixels to a general mask graph in percentages from 0 to 1.
            // Both graphs should have the same number of columns in the same order, as both values should never
            // contain NaNs.
            // let maskDataGraph = classificationDataObject[maskLabel];
            // let blancDataGraph = classificationDataObject[blancLabel];
            // if (blancDataGraph && maskDataGraph) {
            //     for (let i = 0; i < blancDataGraph.y.length; i++) {
            //         let totalPixels = blancDataGraph.y[i] + maskDataGraph.y[i];
            //         maskDataGraph.y[i] = maskDataGraph.y[i] / totalPixels;
            //     }

            //     debugger;

            //     maskDataGraph.name = maskGraphLineName;
            //     maskDataGraph.color = "d3d3d3ff";

            //     delete classificationDataObject[maskLabel];
            //     delete classificationDataObject[blancLabel];

            //     classificationDataObject[maskGraphLineName] = maskDataGraph;
            // }

            let clearDataGraph = indicesDataObject[clearIndex];
            let maskedDataGraph = indicesDataObject[maskedIndex];
            if (clearDataGraph && maskedDataGraph) {
                for (let i = 0; i < clearDataGraph.y.length; i++) {
                    let totalPixels = clearDataGraph.y[i] + maskedDataGraph.y[i];
                    maskedDataGraph.y[i] = maskedDataGraph.y[i] / totalPixels;
                }

                maskedDataGraph.name = maskGraphLineName;
                maskedDataGraph.color = "d3d3d3ff";

                delete indicesDataObject[maskedIndex];
                delete indicesDataObject[clearIndex];

                indicesDataObject[maskGraphLineName] = maskedDataGraph;
            }

            this.setState({ 
                classificationData: classificationDataObject, 
                indicesData: indicesDataObject 
            },
            this.setGraphData);

        }.bind(this);
    }

    async getTileData(request, requestParams) {
        const response = await fetch(request, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify(requestParams),
            credentials: "include"
        });

        let data = await response.json();

        return data;
    }

    selectMap = map => {
        this.setState(
            produce(this.state, draft => {
                if (map) {
                    draft.map = map;
                } 
                else {
                    draft.map = defaultMap;
                }
            })
        );

        $("#graph-area").hide();
        $("#time-range-selector").show();
    };

    selectTimestampRange = (start, end) => {
        this.setState(
            produce(this.state, (draft) => {
                draft.timeStart = start;
                draft.timeEnd = end;
            })
        );
    };

    setMaxMasked= (max) => {
        this.setState({ maxMasked: (max / 100) }, () => {
            if (this.state.classificationData && this.state.indicesData) {
                this.setGraphData();
            }
        });
    }

    setGraphData = () => {
        let removeDatesLabels = [];
        let removeDatesIndices = [];

        let maskLabelsGraph = this.state.classificationData[maskGraphLineName];
        let maskIndicesGraph = this.state.indicesData[maskGraphLineName];

        // for (let i = 0; i < maskLabelsGraph.y.length; i++) {
        //     if (maskLabelsGraph.y[i] > this.state.maxMasked) {
        //         removeDatesLabels.push(maskLabelsGraph.x[i]);
        //     }
        // }

        for (let i = 0; i < maskIndicesGraph.y.length; i++) {
            if (maskIndicesGraph.y[i] > this.state.maxMasked) {
                removeDatesIndices.push(maskIndicesGraph.x[i]);
            }
        }

        let graphClassificationData = [];
        let graphIndicesData = [];

        for (let className in this.state.classificationData) {
            if (this.state.classificationData.hasOwnProperty(className)) {
                let graphData = this.state.classificationData[className];
                let x = [];
                let y = [];

                for (let i = 0; i < graphData.x.length; i++) {
                    if (!removeDatesLabels.includes(graphData.x[i])) {
                        x.push(graphData.x[i]);
                        y.push(graphData.y[i]);
                    }
                }

                let classData = {
                    name: className,
                    x: x,
                    y: y,
                    type: "scatter",
                    // mode: "lines+points",
                    marker: { color: graphData.color.substring(0, 6) }
                };

                graphClassificationData.push(classData);
            }
        }

        for (let indexName in this.state.indicesData) {
            if (this.state.indicesData.hasOwnProperty(indexName)) {
                let graphData = this.state.indicesData[indexName];
                let x = [];
                let y = [];
                    
                for (let i = 0; i < graphData.x.length; i++) {
                    if (!removeDatesIndices.includes(graphData.x[i])) {
                        x.push(graphData.x[i]);
                        y.push(graphData.y[i]);
                    }
                }

                let indexData = {
                    name: indexName,
                    x: x,
                    y: y,
                    type: "scatter",
                    // mode: "lines+points",
                    marker: { color: graphData.color.substring(0, 6) }
                };

                graphIndicesData.push(indexData);
            }
        }

        this.setState({
                graphClassificationData: graphClassificationData,
                graphIndicesData: graphIndicesData
            });

        $("#graph-area").show();
        $("#loading-label-div").hide(); 

        // Check whether the map has any spectral indices.
        // The map has no spectral indices if there is only one data-graph, which is the mask graph.
        if (graphIndicesData.length === 1) {
            $("#max-masked-slider-div").hide();
            $("#indices-data-graph").hide();
        }
        else {
            $("#max-masked-slider-div").show();
            $("#indices-data-graph").show();
        }
    }

    createWmsLayers = (layer, zIndex) => {
        var layers = [];

        for (var i = this.state.timeStart; i <= this.state.timeEnd; i++) {
            var timestamp = this.state.map.timestamps[i];
            var timestampNumber = 0;

            if (timestamp) {
                timestampNumber = timestamp.number;
            }

            layers.push(
                <WMSTileLayer
                    url={`${this.state.wmsUrl}${this.state.map.wmsName}/wms/${timestampNumber}/{layer}/{z}/{x}/{y}.png`}
                    tileSize={defaultMapParams.tileSize}
                    noWrap={defaultMapParams.noWrap}
                    maxZoom={defaultMapParams.maxZoom}
                    attribution={defaultMapParams.attribution}
                    layer={layer}
                    format="image/png"
                    zIndex={2}
                />
            );
        }
        
        return layers;
    };

    createClassificationLayer = (layer, zIndex) => {
        var layers = [];

        var timestamp = this.state.map.timestamps[this.state.timeEnd];
        var timestampNumber = 0;

        if (timestamp) {
            timestampNumber = timestamp.number;
        }

        layers.push(
            <WMSTileLayer
                url={`${this.state.wmsUrl}${this.state.map.wmsName}/wms/${timestampNumber}/{layer}/{z}/{x}/{y}.png`}
                tileSize={defaultMapParams.tileSize}
                noWrap={defaultMapParams.noWrap}
                maxZoom={defaultMapParams.maxZoom}
                attribution={defaultMapParams.attribution}
                layer={layer}
                format="image/png"
                // zIndex={zIndex}
            />            
        );

        return layers;
    }

    createMapLayers = () => {
        let imageLayer = null;
        let labelLayer = null;
        let imageLayers = [];
        let indicesLayers = [];
        let layers = [];

        let mapLayers = this.state.map.layers;

        if (!mapLayers) {
            return layers;
        }

        for (let i = 0; i < mapLayers.length; i++) {
            let layer = mapLayers[i];

            if (layer.name === "image") {
                imageLayers = this.createWmsLayers(layer.wmsName, 2);
                imageLayer = (
                    <Overlay checked name={layer.name} >
                        <LayerGroup>
                            {imageLayers}
                        </LayerGroup>              
                    </Overlay>
                );
            }
            else if (layer.name === "label") {
                labelLayer = (
                    <Overlay checked name={layer.name}>
                        <LayerGroup>
                            {this.createClassificationLayer(layer.wmsName, 200)}
                        </LayerGroup>
                    </Overlay>
                );
            }
            else {
                indicesLayers.push(
                    <Overlay name={layer.name}>
                        <LayerGroup>
                            {this.createClassificationLayer(layer.wmsName, 300)}
                        </LayerGroup>
                    </Overlay>
                );
            }    
        }

        if (imageLayer) {
            layers.push(imageLayer);
        }

        if (labelLayer) {
            layers.push(labelLayer);
        }

        for (let i = 0; i < indicesLayers.length; i++) {
            layers.push(indicesLayers[i]);
        }

        return layers;
    }

    render() {
        const position = [this.state.lat, this.state.lon];

        return (
            <div className="map">
                <div className="map-selector-div">
                    <MapSelector 
                        apiUrl={this.state.apiUrl} 
                        onSelect={this.selectMap} 
                    />
                </div>
                <div id="time-range-selector" className="time-range-selector">
                    <TimeRange 
                        timestamps={this.state.map.timestamps} 
                        onSlide={this.selectTimestampRange}
                    />
                </div>
                <div id="loading-label-div">
                    <span id="loading-label">Loading...</span>
                </div>
                <div id="graph-area">
                    <div id="max-masked-slider-div" className="max-masked-slider-div">
                        <MaxMaskedSlider 
                            onSlide={this.setMaxMasked}
                        />
                    </div>
                    <div className="classes-data-graph">
                        <Graph 
                            data={this.state.graphClassificationData}
                        />          
                    </div>
                    <div id="indices-data-graph" className="indices-data-graph">
                        <Graph 
                            data={this.state.graphIndicesData}
                        />
                    </div>
                </div>                
                <Map
                    center={position}
                    zoom={this.state.zoom}
                    onZoomEnd={this.handleZoomEnd}
                    onDragEnd={this.handleDragEnd}
                    style={{ height: "92.4vh" }}
                    onClick={this.handleClick}
                    onLocationfound={this.handleLocationFound}
                    ref={this.mapRef}
                >
                    <LayersControl position="topright">
                        <Overlay checked name="Base satellite">
                            <TileLayer
                                url="https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWhqaWFuZyIsImEiOiJjamhkNXU3azcwZW1oMzZvNjRrb214cDVsIn0.QZWgmabi2gRJAWr1Vr3h7w"
                                attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href = "https://www.mapbox.com/" > Mapbox</a >'
                                noWrap={true}
                            />
                        </Overlay>            
                        {this.createMapLayers()}
                    </LayersControl>
                </Map>
                {/* <b>{this.state.map ? this.state.map.wmsName : ""}</b> */}
            </div>
        );
    }
}

export default Viewer;
