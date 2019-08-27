import React, { PureComponent } from 'react';
import Papa from 'papaparse';
import LineChart from './LineChart/LineChart';
import LineChartScore from './LineChart/LineChartScore';
import SoilTable from './Table/SoilTable';
import Slider from 'rc-slider';
import Moment from 'moment';

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
      scoreLoading: true,
      classesLoading: false,
      measurementsLoading: true,
      soilLoading: true,

      availableClasses: null,
      selectedClass: DEFAULT_SELECTED_CLASS,

      classesData: null,
      measurementsData: {},
      soilData: {},
      scoreData: null,

      classesExpanded: true,
      measurementsExpanded: true,
      soilExpanded: true,
      scoreExpanded: true,

      maxMask: 1
    };
  }

  componentDidMount() {
    this.setState({ classesLoading: true }, () => {
      let map = 'd9903b33-f5d1-4d57-992f-3d8172460126';
      let map2 = '4a925aef-469b-4aac-995b-46be2dc2779f';
      let map3 = 'ea53987e-842d-4467-91c3-9e23b3e5e2e8';

      this.getAvailableClasses(map);
      this.getData(ViewerUtility.dataGraphType.classes, null, map);
      this.getData(ViewerUtility.dataGraphType.measurements, this.state.selectedClass, map)
      this.getData(ViewerUtility.dataGraphType.soil, 'all classes', map2)
      this.getData(ViewerUtility.score, null, map3)
    });
  }

  componentDidUpdate(prevProps) {
    let differentMap = this.props.map !== prevProps.map;
    if (differentMap) {
      this.getAvailableClasses('d9903b33-f5d1-4d57-992f-3d8172460126');
    }

    if (!this.props.element) {
      this.setState({ classesData: null, measurementsData: {} });
      return;
    }

    let differentElement = differentMap || DataPaneUtility.isDifferentElement(prevProps.element, this.props.element);

    if (differentElement) {
      let map = 'd9903b33-f5d1-4d57-992f-3d8172460126';
      let map2 = '4a925aef-469b-4aac-995b-46be2dc2779f';
      let map3 = 'ea53987e-842d-4467-91c3-9e23b3e5e2e8';

      this.setState({
          classesData: null,
          measurementsData: {},
          classesLoading: true,
          measurementsLoading: true,
        }, () => {
          this.getData(ViewerUtility.dataGraphType.classes, null, map);
          this.getData(ViewerUtility.dataGraphType.measurements, this.state.selectedClass, map)
          this.getData(ViewerUtility.dataGraphType.soil, 'all classes', map2)
          this.getData(ViewerUtility.score, null, map3)
      });
    }
  }

  getAvailableClasses = (mapID) => {
    let availableClasses = [];

    let map = this.props.map[mapID];

    if (!map.perClass) {
      availableClasses.push(ViewerUtility.specialClassName.allClasses);
    }
    else {
      for (let i = 0; i < map.classes.length; i++) {
        let timestampClasses = map.classes[i];

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
    }

    this.setState({ availableClasses: availableClasses });
  }

  getData = async (type, className, mapID) => {
    let element = this.props.element;

    let body = {
      mapId: this.props.map[mapID].id,
      class: className
    };

    let urlType = null;

    if (element.type === ViewerUtility.standardTileLayerType) {
      body.tileX = element.feature.properties.tileX;
      body.tileY = element.feature.properties.tileY;
      body.zoom = element.feature.properties.zoom;

      urlType = 'tile';
    }
    else if (type === ViewerUtility.score)
    {
      body['polygonIds'] = [element.feature.id];
      urlType = 'polygon';
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
    else if (type === ViewerUtility.dataGraphType.soil)
    {
      body.polygonId = element.feature.properties.id;

      urlType = 'polygon';
    }
    else {
      return;
    }

    let dataPromise = null;
    if (type === ViewerUtility.dataGraphType.classes) {
      dataPromise = ApiManager.post(`/data/class/${urlType}/timestamps`, body, this.props.user);
    }
    else if (type === ViewerUtility.score)
    {
      dataPromise = ApiManager.post(`/geoMessage/${urlType}/getMessages`, body, this.props.user);
    }
    else if ((type === ViewerUtility.dataGraphType.measurements || ViewerUtility.dataGraphType.soil) && className !== 'default') {
      dataPromise = ApiManager.post(`/data/measurement/${urlType}/timestamps`, body, this.props.user);
    }
    else {
      if (type === ViewerUtility.dataGraphType.classes) {
        this.setState({ classesLoading: false });
      }
      else if (type === ViewerUtility.score)
      {
        this.setState({ scoreLoading: false });
      }
      else {
        this.setState({ measurementsLoading: false });
      }

      return;
    }

    let data = {};

    dataPromise
      .then(result => {
        if (type === ViewerUtility.score)
        {
          let messages = [];

          if (result.length === 0)
          {
            this.setState({ scoreData: <p>Dit perceel heeft nog geen score</p>, scoreLoading: false});
          }
          else
          {
            for (var i = 0; i < result[0].messages.length; i++)
            {
              if(result && result[0].messages[i].form && result[0].messages[i].form.formName === "Kruidenrijkheid")
              {
                let tempObj = {
                  date: result[0].messages[i].form.answers[0].answer,
                  score: result[0].messages[i].form.answers[1].answer
                };
                messages.push(tempObj);
              }
            }

            messages.sort(function(a,b){return Moment(b.date).format('X') - Moment(a.date).format('X')});
            
            return { data: messages};
          }
        }
        else
        {
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
        }
      })
      .then(result => {
        data.parsed = result;

        if (type === ViewerUtility.dataGraphType.classes) {
          this.setState({ classesData: data, classesLoading: false });
        }
        else if (type === ViewerUtility.dataGraphType.measurements) {
          let newmeasurementsData = {
            ...this.state.measurementsData
          };

          newmeasurementsData[className] = data;

          this.setState({ measurementsData: newmeasurementsData, measurementsLoading: false });
        }
        else if (type === ViewerUtility.dataGraphType.soil) {
          this.setState({ soilData: result, soilLoading: false });
        }
        else
        {
          this.setState({ scoreData: result, scoreLoading: false });
        }
      })
      .catch(err => {
        if (type === ViewerUtility.dataGraphType.classes) {
          this.setState({ classesData: null, classesLoading: false });
        }
        else if (type === ViewerUtility.dataGraphType.measurements) {
          let newmeasurementsData = {
            ...this.state.measurementsData
          };

          this.setState({ measurementsData: newmeasurementsData, measurementsLoading: false });
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
    let map = 'd9903b33-f5d1-4d57-992f-3d8172460126';

    if (!this.state.measurementsData[selectedClass]) {
      this.setState({
        selectedClass: selectedClass,
        measurementsLoading: true
        },
        () => this.getData(ViewerUtility.dataGraphType.measurements, selectedClass, map)
      );
    }
    else {
      this.setState({ selectedClass: selectedClass });
    }
  }

  onMaxMaskChange = (value) => {
    this.setState({ maxMask: value });
  }

  onDownloadData = (isMeasurements) => {
    let csvData = null;

    if (!isMeasurements && this.state.classesData) {
      csvData = this.state.classesData.raw;
    }
    else if (this.state.measurementsData[this.state.selectedClass]) {
      csvData = this.state.measurementsData[this.state.selectedClass].raw;
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

    if (!isMeasurements) {
      nameComponents.push('classes');
    }
    else {
      nameComponents.push(
        'measurements',
        this.state.selectedClass
      );
    }

    let fileName = nameComponents.join('_') + '.csv';

    ViewerUtility.download(fileName, csvData, 'text/csv');
  }

  render() {
    if (this.props.home) {
      return null;
    }
    
    let measurementsData = Object.entries(this.state.measurementsData).length === 0 && this.state.measurementsData.constructor === Object;
    return (
      <div>
      <Card className='data-pane-card'>
          <CardHeader
            title={
              <Typography variant="h6" component="h2" className='no-text-transform'>
                {ViewerUtility.score}
              </Typography>
            }
            action={
              <IconButton
                className={this.state.scoreExpanded ? 'expand-icon expanded' : 'expand-icon'}
                onClick={() => this.setState({ scoreExpanded: !this.state.scoreExpanded })}
                aria-expanded={this.state.scoreExpanded}
                aria-label='Show'
              >
                <ExpandMoreIcon />
              </IconButton>
            }
          />
          <Collapse in={this.state.scoreExpanded}>
            <CardContent className='data-pane-card-content'>
              {this.state.scoreLoading ? <CircularProgress className='loading-spinner'/> : null}
              {
                !this.state.scoreLoading && this.state.scoreData ?
                  <LineChartScore data={this.state.scoreData}/> : <p>{ViewerUtility.noScore}</p>
              }
            </CardContent>
          </Collapse>
        </Card>

        <Card className='data-pane-card'>
          <CardContent>
            <div>{this.props.localization['Max masked']}: {Math.round(this.state.maxMask * 100)}%</div>
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
                {this.props.localization['Classes']}
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
            <CardContent className='data-pane-card-content' key={this.props.map['d9903b33-f5d1-4d57-992f-3d8172460126'] ? 'LineChartClassesCard-d9903b33-f5d1-4d57-992f-3d8172460126' : 'LineChartClassesCard'}>
              {this.state.classesLoading ? <CircularProgress className='loading-spinner'/> : null}
              {
                !this.state.classesLoading && this.state.classesData && this.props.map['d9903b33-f5d1-4d57-992f-3d8172460126'] ?
                  <LineChart
                    map={this.props.map['d9903b33-f5d1-4d57-992f-3d8172460126'] ? this.props.map['d9903b33-f5d1-4d57-992f-3d8172460126'] : null}
                    data={this.state.classesData}
                    type={ViewerUtility.dataGraphType.classes}
                    maxMask={this.state.maxMask}
                    key={this.props.map['d9903b33-f5d1-4d57-992f-3d8172460126'] ? 'LineChartClasses-d9903b33-f5d1-4d57-992f-3d8172460126' : 'LineChartClasses'}
                  /> : null
              }
            </CardContent>
          </Collapse>
          </Card>

          <Card className='data-pane-card'>
          <CardHeader
            title={
              <Typography variant="h6" component="h2" className='no-text-transform'>
                {this.props.localization['Measurements']}
              </Typography>
            }
            action={
              <IconButton
                className={this.state.measurementsExpanded ? 'expand-icon expanded' : 'expand-icon'}
                onClick={() => this.setState({ measurementsExpanded: !this.state.measurementsExpanded })}
                aria-expanded={this.state.measurementsExpanded}
                aria-label='Show'
              >
                <ExpandMoreIcon />
              </IconButton>
            }
          />
          <Collapse in={this.state.measurementsExpanded}>
            <CardContent className='data-pane-card-content analyse-card-content'>
              {
                this.state.availableClasses ?
                  <Select
                    className='class-selector'
                    value={this.state.selectedClass}
                    onChange={this.onSelectClass}
                    disabled={this.state.measurementsLoading}>
                    <MenuItem value={DEFAULT_SELECTED_CLASS} disabled hidden>{this.props.localization['Select a class']}</MenuItem>
                    {this.renderClassOptions()}
                  </Select> : null
              }
              {
                !this.state.availableClasses || this.state.measurementsLoading ?
                  <div style={{ position: 'relative', height: '50px' }}>
                    <CircularProgress className='loading-spinner'/>
                  </div> : null
              }
              {
                !this.state.measurementsLoading && this.state.measurementsData[this.state.selectedClass] ?
                  <LineChart
                    map={this.props.map['d9903b33-f5d1-4d57-992f-3d8172460126']}
                    data={this.state.measurementsData[this.state.selectedClass]}
                    type={ViewerUtility.dataGraphType.measurements}
                    maxMask={this.state.maxMask}
                  /> : null
              }
            </CardContent>
          </Collapse>
        </Card>

        <Card className='data-pane-card'>
          <CardHeader
            title={
              <Typography variant="h6" component="h2" className='no-text-transform'>
                {this.props.localization['Soil']}
              </Typography>
            }
            action={
              <IconButton
                className={this.state.soilExpanded ? 'expand-icon expanded' : 'expand-icon'}
                onClick={() => this.setState({ soilExpanded: !this.state.soilExpanded })}
                aria-expanded={this.state.soilExpanded}
                aria-label='Show'
              >
                <ExpandMoreIcon />
              </IconButton>
            }
          />
          <Collapse in={this.state.soilExpanded}>
            <CardContent className='data-pane-card-content analyse-card-content'>
              { this.state.soilLoading ? <CircularProgress className='loading-spinner'/> : null }
              {
                !this.state.soilLoading ?
                <SoilTable
                  map={this.props.map['4a925aef-469b-4aac-995b-46be2dc2779f'] ? this.props.map['4a925aef-469b-4aac-995b-46be2dc2779f'] : null}
                  key={this.props.map['d9903b33-f5d1-4d57-992f-3d8172460126'] ? 'Soil-d9903b33-f5d1-4d57-992f-3d8172460126' : 'NoSoilTable'}
                  data={this.state.soilData}
                  element={this.props.element}
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
