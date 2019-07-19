import React, { PureComponent } from 'react';

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

import './LegendControl.css';
import ApiManager from '../../../../ApiManager';

class LegendControl extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
    };
  }

  componentDidMount() {
    if (this.props.map) {
      this.createLegendElement();
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.map) {
      this.setState({ legend: null });
    }
    else if (prevProps.map !== this.props.map) {
      this.createLegendElement();
    }
  }

  createLegendElement = () => {

    let getTypes = (collection, property, filter) => {
      let types = [];

      for (let i = 0; i < collection.length; i++) {
        let timestamp = collection[i];

        let timestampTypes = timestamp;
        if (property) {
          timestampTypes = timestamp[property];
        }

        for (let x = 0; x < timestampTypes.length; x++) {
          let type = timestampTypes[x];

          if (filter && filter.includes(type.name)) {
            continue;
          }

          if (!types.find(x => x.name === type.name)) {
            types.push(type);
          }
        }
      }

      return types;
    }

    let map = this.props.map;

    let availableClasses = getTypes(map.classes, 'classes', [
      ViewerUtility.specialClassName.blanc, ViewerUtility.specialClassName.mask, ViewerUtility.specialClassName.noClass
    ]);
    let availableMeasurements = getTypes(map.measurements, 'measurements');
    let availablePolygonLayers = getTypes(map.layers.polygon, 'layers');
    let availableCustomPolygonLayers = map.layers.customPolygon;

    let legendElements = [];

    let createLegendLines = (collection) => {
      for (let i = 0; i < collection.length; i++) {
        let type = collection[i];
        legendElements.push(
          <div key={legendElements.length} className='legend-line'>
            <span>{type.name}</span>
            <span className='legend-label' style={{ backgroundColor: `#${type.color}`}}></span>
          </div>
        )
      }
    }

    if (availableClasses.length > 0) {
      legendElements.push(<div key='classes' className='legend-line legend-line-header'>{this.props.localization['Classes']}</div>)
      createLegendLines(availableClasses);
    }
    if (availableMeasurements.length > 0) {
      legendElements.push(<div key='measurements' className='legend-line legend-line-header'>{this.props.localization['Measurements']}</div>)
      createLegendLines(availableMeasurements);
    }
    if (availablePolygonLayers.length > 0) {
      legendElements.push(<div key='polygon_layers' className='legend-line legend-line-header'>{this.props.localization['Polygon layers']}</div>);
      createLegendLines(availablePolygonLayers);
    }
    if (availableCustomPolygonLayers.length > 0) {
      legendElements.push(<div key='custom_polygon_layers' className='legend-line legend-line-header'>{this.props.localization['Custom polygon layers']}</div>);
      createLegendLines(availableCustomPolygonLayers);
    }

    this.setState({ legend: legendElements });
  }

  render() {
    if (this.props.home || !this.state.legend) {
      return null;
    }

    return (
      <Card className='data-pane-card'>
        <CardHeader
          className='card-header'
          title={
            <Typography variant="h6" component="h2" className='no-text-transform'>
              {this.props.localization['Legend']}
            </Typography>
          }
        />
        <CardContent className='legend-content'>
          {this.state.legend}
        </CardContent>
      </Card>
    )
  }
}

export default LegendControl;
