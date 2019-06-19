import React, { PureComponent } from 'react';
import Papa from 'papaparse';
import LineChart from './LineChart/LineChart';

import { 
  Card,  
  CardHeader,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  Collapse,
  IconButton,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Utility from '../../../../Utility';
import ViewerUtility from '../../ViewerUtility';
import DataPaneUtility from '../DataPaneUtility';

import './AnalyseControl.css';
import ApiManager from '../../../../ApiManager';

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
      spectralIndicesExpanded: true
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
      this.setState({ classesLoading: true }, () => this.getData(ViewerUtility.dataGraphType.classes));
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

  getData = (type, className) => {
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
    else if (element.type === ViewerUtility.polygonLayerType) {
      body.polygonId = element.feature.properties.id;

      urlType = 'polygon';
    }
    else if (element.type === ViewerUtility.customPolygonTileLayerType) {
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
    else if (type === ViewerUtility.dataGraphType.spectralIndices) {
      dataPromise = ApiManager.post(`/data/spectral/${urlType}/timestamps`, body, this.props.user);
    }
    else {
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

  render() {
    return (
      <div>
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
                  /> : null
              } 
            </CardContent>
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
            <CardContent className='data-pane-card-content'>
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
                  /> : null
              }
            </CardContent>
          </Collapse>         
        </Card>
      </div>
    )
  }
}



export default AnalyseControl;
