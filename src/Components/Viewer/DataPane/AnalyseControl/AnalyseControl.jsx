import React, { PureComponent } from 'react';
import Papa from 'papaparse';
import LineChart from './LineChart/LineChart';
import Slider from 'rc-slider';

import { 
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  Collapse,
  IconButton,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SaveAlt from '@material-ui/icons/SaveAlt';


import Utility from '../../../../Utility';
import ViewerUtility from '../../ViewerUtility';
import DataPaneUtility from '../DataPaneUtility';

import './AnalyseControl.css';
import ApiManager from '../../../../ApiManager';

const Single = Slider.createSliderWithTooltip(Slider);

const DEFAULT_SELECTED_CLASS = 'default';

class AnalyseControl extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      classesLoading: false,
      spectralIndicesLoading: false,

      availableClasses: null,
      selectedClass: DEFAULT_SELECTED_CLASS,

      classesData: null,
      spectralIndicesData: {},

      classesExpanded: true,
      spectralIndicesExpanded: true,

      maxMask: 1
    };
  }

  componentDidMount() {
    this.setState({ classesLoading: true }, () => {
      this.getAvailableClasses();
      this.getData(ViewerUtility.dataGraphType.classes);
    });    
  }

  componentDidUpdate(prevProps) {
    let differentMap = this.props.map !== prevProps.map;
    if (differentMap) {
      this.getAvailableClasses();
    }

    if (!this.props.element) {
      this.setState({ classesData: null, spectralIndicesData: {} });
      return;
    }

    let differentElement = differentMap || DataPaneUtility.isDifferentElement(prevProps.element, this.props.element);

    if (differentElement) {
      this.setState({ 
          classesData: null,
          spectralIndicesData: {},
          classesLoading: true, 
          spectralIndicesLoading: true,  
        }, () => {
          this.getData(ViewerUtility.dataGraphType.classes);
          this.getData(ViewerUtility.dataGraphType.spectralIndices, this.state.selectedClass)
      });
    }
  }

  getAvailableClasses = () => {
    let availableClasses = [ViewerUtility.specialClassName.allClasses];

    for (let i = 0; i < this.props.map.classes.length; i++) {
      let timestampClasses = this.props.map.classes[i];

      for (let x = 0; x < timestampClasses.classes.length; x++) {
        let className = timestampClasses.classes[x].name;

        if (className === ViewerUtility.specialClassName.blanc || className === ViewerUtility.specialClassName.mask) {
          continue;
        }

        if (!availableClasses.includes(className)) {
          availableClasses.push(className);
        }
      }
    }

    this.setState({ availableClasses: availableClasses });
  }

  getData = async (type, className) => {
    let element = this.props.element;

    let body = {
      mapId: this.props.map.id,
      class: className
    };
    let urlType = null;

    if (element.type === ViewerUtility.standardTileLayerType) {
      body.tileX = element.feature.properties.tileX;
      body.tileY = element.feature.properties.tileY;
      body.zoom = element.feature.properties.zoom;

      urlType = 'tile';
    }
    else if (element.type === ViewerUtility.polygonLayerType && element.hasAggregatedData) {
      body.polygonId = element.feature.properties.id;

      urlType = 'polygon';
    }
    else if (element.type === ViewerUtility.customPolygonTileLayerType ||
      element.type === ViewerUtility.drawnPolygonLayerType || !element.hasAggregatedData) {
      body.geometry = {
        type: 'FeatureCollection',
        count: 1,
        features: [
          element.feature
        ]
      };

      urlType = 'customPolygon';
    }
    else {
      return;
    }

    let dataPromise = null;
    if (type === ViewerUtility.dataGraphType.classes) {
      dataPromise = ApiManager.post(`/data/class/${urlType}/timestamps`, body, this.props.user);
    }
    else if (type === ViewerUtility.dataGraphType.spectralIndices && className !== 'default') {
      dataPromise = ApiManager.post(`/data/spectral/${urlType}/timestamps`, body, this.props.user);
    }
    else {
      if (type === ViewerUtility.dataGraphType.classes) {
        this.setState({ classesLoading: false });                    
      }
      else {
        this.setState({ spectralIndicesLoading: false });                    
      }

      return;
    }
    
    let data = {};

    dataPromise
      .then(result => {
        data.raw = result;

        let parseFunc = async () => {
          let parsedData = Papa.parse(data.raw, {
            dynamicTyping: true, 
            skipEmptyLines: true, 
            header: true
          });

          return parsedData;
        };

        return parseFunc();
      })
      .then(result => {
        data.parsed = result;

        if (type === ViewerUtility.dataGraphType.classes) {
          this.setState({ classesData: data, classesLoading: false });          
        }
        else if (type === ViewerUtility.dataGraphType.spectralIndices) {
          let newSpectralIndicesData = {
            ...this.state.spectralIndicesData
          };

          newSpectralIndicesData[className] = data;

          this.setState({ spectralIndicesData: newSpectralIndicesData, spectralIndicesLoading: false });                    
        }
      })
      .catch(err => {
        if (type === ViewerUtility.dataGraphType.classes) {
          this.setState({ classesData: null, classesLoading: false });          
        }
        else if (type === ViewerUtility.dataGraphType.spectralIndices) {
          let newSpectralIndicesData = {
            ...this.state.spectralIndicesData
          };

          this.setState({ spectralIndicesData: newSpectralIndicesData, spectralIndicesLoading: false });                    
        }
      });
  }

  renderClassOptions = () => {
    let availableClasses = this.state.availableClasses;

    if (!availableClasses) {
      return null;
    }

    let classOptions = [];

    for (let i = 0; i < availableClasses.length; i++) {
      let className = availableClasses[i];

      classOptions.push(
        <MenuItem key={className} value={className}>{className}</MenuItem>
      )
    }

    return classOptions;
  }

  onSelectClass = (e) => {
    let selectedClass = e.target.value;

    if (!this.state.spectralIndicesData[selectedClass]) {
      this.setState({ 
        selectedClass: selectedClass, 
        spectralIndicesLoading: true 
        }, 
        () => this.getData(ViewerUtility.dataGraphType.spectralIndices, selectedClass)
      );
    }
    else {
      this.setState({ selectedClass: selectedClass });
    }
  }

  onMaxMaskChange = (value) => {
    this.setState({ maxMask: value });
  }

  onDownloadData = (isSpectralIndices) => {
    let csvData = null;

    if (!isSpectralIndices && this.state.classesData) {
      csvData = this.state.classesData.raw;
    }
    else if (this.state.spectralIndicesData[this.state.selectedClass]) {
      csvData = this.state.spectralIndicesData[this.state.selectedClass].raw;
    }

    let nameComponents = [this.props.map.name];

    let element = this.props.element;
    let elementProperties = element.feature.properties;

    if (element.type === ViewerUtility.standardTileLayerType) {
      nameComponents.push(
        'tile',
        elementProperties.tileX,
        elementProperties.tileY,
        elementProperties.zoom
      );
    }
    else if (element.type === ViewerUtility.polygonLayerType) {
      nameComponents.push(
        'polygon',
        elementProperties.id
      );
    }
    else if (element.type === ViewerUtility.customPolygonTileLayerType) {
      nameComponents.push(
        'customPolygon',
        elementProperties.id
      );
    } 
    if (element.type === ViewerUtility.drawnPolygonLayerType) {
      nameComponents.push(
        'drawnPolygon'
      );
    }

    if (!isSpectralIndices) {
      nameComponents.push('classes');
    }
    else {
      nameComponents.push(
        'measurements',
        this.state.selectedClass
      );
    }

    let fileName = nameComponents.join('_') + '.csv';

    downloadCsv(fileName, csvData)
  }

  render() {
    if (this.props.home) {
      return null;
    }

    return (
      <div>
        <Card className='data-pane-card'>
          <CardContent>
            <div>Max masked: {Math.round(this.state.maxMask * 100)}%</div>
            <Single
              dots={false}
              step={0.01}
              defaultValue={this.state.maxMask}
              value={this.state.maxMask}
              min={0}
              max={1}
              included={false}
              onChange={(value) => this.onMaxMaskChange(value)}
              tipFormatter={v => Math.round(v*100) + '%'}              
            />
          </CardContent>
        </Card>

        <Card className='data-pane-card'>
          <CardHeader
            title={
              <Typography variant="h6" component="h2" className='no-text-transform'>
                Classes
              </Typography>
            }
            action={
              <IconButton
                className={this.state.classesExpanded ? 'expand-icon expanded' : 'expand-icon'}
                onClick={() => this.setState({ classesExpanded: !this.state.classesExpanded })}
                aria-expanded={this.state.classesExpanded}
                aria-label='Show'
              >
                <ExpandMoreIcon />
              </IconButton>
            }
          />
          <Collapse in={this.state.classesExpanded}>
            <CardContent className='data-pane-card-content'>
              {this.state.classesLoading ? <CircularProgress className='loading-spinner'/> : null}
              {
                !this.state.classesLoading && this.state.classesData ?
                  <LineChart 
                    map={this.props.map} 
                    data={this.state.classesData} 
                    type={ViewerUtility.dataGraphType.classes}
                    maxMask={this.state.maxMask}
                  /> : null
              } 
            </CardContent>
            {
              !this.state.classesLoading && this.state.classesData ?
                <CardActions className='analyse-card-actions'>
                  <IconButton
                    onClick={() => this.onDownloadData(false)}
                    aria-label='Download data'
                  >
                    <SaveAlt />
                  </IconButton>
                </CardActions> : null
            }
          </Collapse>
        </Card>
        <Card className='data-pane-card'>
          <CardHeader
            title={
              <Typography variant="h6" component="h2" className='no-text-transform'>
                Spectral indices
              </Typography>
            }
            action={
              <IconButton
                className={this.state.spectralIndicesExpanded ? 'expand-icon expanded' : 'expand-icon'}
                onClick={() => this.setState({ spectralIndicesExpanded: !this.state.spectralIndicesExpanded })}
                aria-expanded={this.state.spectralIndicesExpanded}
                aria-label='Show'
              >
                <ExpandMoreIcon />
              </IconButton>
            }
          />
          <Collapse in={this.state.spectralIndicesExpanded}>
            <CardContent className='data-pane-card-content analyse-card-content'>
              {
                this.state.availableClasses ?
                  <Select 
                    className='class-selector' 
                    value={this.state.selectedClass} 
                    onChange={this.onSelectClass}
                    disabled={this.state.spectralIndicesLoading}>
                    <MenuItem value={DEFAULT_SELECTED_CLASS} disabled hidden>Select a class</MenuItem>
                    {this.renderClassOptions()}
                  </Select> : null
              }
              {
                !this.state.availableClasses || this.state.spectralIndicesLoading ? 
                  <div style={{ position: 'relative', height: '50px' }}>
                    <CircularProgress className='loading-spinner'/>
                  </div> : null
              }
              {
                !this.state.spectralIndicesLoading && this.state.spectralIndicesData[this.state.selectedClass] ?
                  <LineChart 
                    map={this.props.map} 
                    data={this.state.spectralIndicesData[this.state.selectedClass]} 
                    type={ViewerUtility.dataGraphType.spectralIndices}
                    maxMask={this.state.maxMask}
                  /> : null
              }
            </CardContent>
            {
              !this.state.spectralIndicesLoading && this.state.spectralIndicesData[this.state.selectedClass] ?
                <CardActions className='analyse-card-actions'>
                  <IconButton
                    onClick={() => this.onDownloadData(true)}
                    aria-label='Download data'
                  >
                    <SaveAlt />
                  </IconButton>
                </CardActions> : null
            }
          </Collapse>         
        </Card>
      </div>
    )
  }
}

function downloadCsv(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export default AnalyseControl;
