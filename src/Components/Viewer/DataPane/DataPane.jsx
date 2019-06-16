import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';
import { 
  Card,  
  CardHeader,
  Typography,
  Button
} from '@material-ui/core';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import './DataPane.css';
import ViewerUtility from '../ViewerUtility';

import AnalyseControl from './AnalyseControl/AnalyseControl';
import GeoMessageControl from './GeoMessageControl/GeoMessageControl';

class DataPane extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    let style = {};
    if (!this.props.isOpen) {
      style = { display: 'none' };
    }

    let element = this.props.element;


    if (!element) {
      return (
        <div className='viewer-pane data-pane' style={style}>
          Please select an element on the map and an action first.
        </div>
      );
    }

    let title = null;
    let idText = null;

    if (element.type === ViewerUtility.standardTileLayerType) {
      title = 'Standard tile';
      idText = `${element.feature.properties.tileX}, ${element.feature.properties.tileY}, ${element.feature.properties.zoom}`;
    }
    else if (element.type === ViewerUtility.polygonLayerType) {
      title = 'Polygon';
      idText = element.feature.properties.id;
    }
    else if (element.type === ViewerUtility.customPolygonTileLayerType) {
      title = 'Custom polygon';
      idText = element.feature.properties.id;
    }

    let action = this.props.action;
    let actionControl = null;

    if (this.props.action === ViewerUtility.dataPaneAction.analyse) {
      actionControl = (
        <AnalyseControl
          user={this.props.user}
          map={this.props.map}
          element={this.props.element}          
        />
      );
    }
    else if (action === ViewerUtility.dataPaneAction.geomessage || action === ViewerUtility.dataPaneAction.feed) {
      actionControl = (
        <GeoMessageControl
          user={this.props.user}
          map={this.props.map}
          element={this.props.element}
          action={action}
        />
      );
    }
    
    return (
      <div className='viewer-pane data-pane' style={style}>
        <Card>
          <CardHeader
            title={
              <Button>
                <Typography variant="h6" component="h2" className='no-text-transform'>
                  {title}
                </Typography>
              </Button>
            }
            subheader={
              <div className='data-pane-title-card-subtitle'>
                {idText}
              </div>
            }
          />
        </Card>
        {actionControl}
      </div>
    );
  }
}

export default DataPane;
