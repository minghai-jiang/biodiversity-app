import React, { PureComponent } from 'react';

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
  TextField
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Utility from '../../../../Utility';
import ViewerUtility from '../../ViewerUtility';
import DataPaneUtility from '../DataPaneUtility';

import './CustomPolygonControl.css';
import ApiManager from '../../../../ApiManager';

class CustomPolygonControl extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      loading: false,

      selectedLayer: 'default',
      propertyValues: {}
    };
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
    let differentMap = (!prevProps.map && this.props.map) ||
      (prevProps.map && !this.props.map);

    if (!differentMap && prevProps.map && this.props.map) {
      differentMap = prevProps.map.id !== this.props.map.id;
    }

    if (differentMap) {
      this.setState({
        selectedLayer: 'default',
        propertyValues: {}
      });
      return;
    }

    let differentElement = (!prevProps.element && this.props.element) ||
      (prevProps.element && !this.props.element);

    if (!differentElement && prevProps.element && this.props.element) {
      let prevId = prevProps.element.feature.properties.id;
      let curId = this.props.element.feature.properties.id;
      differentElement = prevId !== curId;
    }

    if (differentElement) {
      this.setState({
        propertyValues: {}
      });
    }
  }

  onSelectLayer = (e) => {
    this.setState({ selectedLayer: e.target.value });
  }

  onPropertyValueChange = (e, property) => {
    let newPropertyValues = this.state.propertyValues;
    newPropertyValues[property] = e.target.value;

    this.setState({ propertyValues: newPropertyValues });
  }

  onSubmit = (e) => {
    this.setState({ loading: true }, () => {
      let layer = this.state.selectedLayer;

      let feature = this.props.element.feature;
      feature.properties = this.state.propertyValues;

      let geoJson = {
        type: 'FeatureCollection',
        count: 1,
        features: [feature]
      };

      let timestampNumber = this.props.map.timestamps[this.props.timestampRange.end].timestampNumber;

      let body = {
        mapId: this.props.map.id,
        timestamp: timestampNumber,
        layer: layer,
        geometry: geoJson
      };

      ApiManager.post('/geomessage/customPolygon/addPolygon', body, this.props.user)
        .then(() => {
          this.props.onAddCustomPolygon();
          this.setState({
            loading: false,
            propertyValues: {}
          });
        })
        .catch(err => {
          console.log(err);
          this.setState({ loading: false });
        });
    });
  }

  render() {
    let title = 'Add';
    if (this.props.isEdit) {
      title = 'Edit';
    }

    let layerSelect = null;
    let layers = this.props.map.layers.customPolygon;
    if (layers.length > 0) {
      let options = [
        <MenuItem value='default' disabled hidden>Select a layer</MenuItem>
      ];

      for (let i = 0; i < layers.length; i++) {
        let layerName = layers[i].name;
        options.push(
          <MenuItem value={layerName}>{layerName}</MenuItem>
        );          
      }

      layerSelect = (
        <Select 
          key='layer-selector' 
          className='selector' 
          onChange={this.onSelectLayer} 
          value={this.state.selectedLayer}
        >
          {options}
        </Select>
      );
    }
    else {
      layerSelect = 'No layers available.'
    }

    let propertyInputs = null;
    let selectedLayer = layers.find(x => x.name === this.state.selectedLayer)

    if (selectedLayer) {
      let inputs = [];

      for (let i = 0; i < selectedLayer.properties.length; i++) {
        let property = selectedLayer.properties[i];

        inputs.push(
          <TextField
            className='card-content-item data-pane-text-field'
            key={property}
            label={property}
            value={this.state.propertyValues[property]}
            onChange={(e) => this.onPropertyValueChange(e, property)}
          />
        );

        propertyInputs = (
          <div>
            {inputs}
            <div className='card-content-item'>
              <Button 
                className='card-submit-button'
                variant='contained' 
                color='primary'
                onClick={this.onSubmit}
                disabled={this.state.loading}
              >
                Submit
              </Button>
            </div>

          </div>
        );        
      }
    }

    return (
      <div>
        <Card className={'data-pane-card'}>
          <CardHeader
            className='data-pane-title-header'
            title={
              <Typography variant="h6" component="h2" className='no-text-transform'>
                {title}
              </Typography>
            }
          />
          <CardContent>
            {layerSelect}
            {propertyInputs}
            { this.state.loading ? <CircularProgress className='loading-spinner'/> : null}
          </CardContent>
          
        </Card>
      </div>
    );
  }
}



export default CustomPolygonControl;
