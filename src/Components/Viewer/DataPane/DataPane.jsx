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
import CustomPolygonControl from './CustomPolygonControl/CustomPolygonControl';

class DataPane extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
    };
  }

  componentDidMount() {
  }

  onFlyTo = () => {
    let action = this.props.action;

    if (action === ViewerUtility.dataPaneAction.feed) {
      this.props.onFlyTo({ type: ViewerUtility.flyToType.map });      
    }
    else {
      this.props.onFlyTo({ type: ViewerUtility.flyToType.currentElement });
    }
  }

  render() {
    let style = {};
    if (!this.props.isOpen) {
      style = { display: 'none' };
    }

    let element = this.props.element;
    let action = this.props.action;
    let title = null;
    let idText = null;    

    if (!action) {
      return (
        <div className='viewer-pane data-pane' style={style}>
          Please select an action first.
        </div>
      );
    }
    else if (action === ViewerUtility.dataPaneAction.feed) {
      title = 'GeoMessage Feed';
      idText = this.props.map.name;
    }    
    else {
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
      else if (element.type === ViewerUtility.drawnPolygonLayerType) {
        title = 'Drawn polygon';
        idText = 'Drawn polygon';
      }
    }

    let actionControl = null;

    if (action === ViewerUtility.dataPaneAction.analyse) {
      actionControl = (
        <AnalyseControl
          user={this.props.user}
          map={this.props.map}
          element={this.props.element}          
        />
      );
    }
    else if (action === ViewerUtility.dataPaneAction.geoMessage || 
      action === ViewerUtility.dataPaneAction.feed) {
      actionControl = (
        <GeoMessageControl
          user={this.props.user}
          map={this.props.map}
          timestampRange={this.props.timestampRange}
          element={this.props.element}
          isFeed={action === ViewerUtility.dataPaneAction.feed}
          onFlyTo={this.props.onFlyTo}
        />
      );
    }
    else if (action === ViewerUtility.dataPaneAction.createCustomPolygon ||
      action === ViewerUtility.dataPaneAction.editCustomPolygon) {
        actionControl = (
          <CustomPolygonControl
            user={this.props.user}
            map={this.props.map}
            timestampRange={this.props.timestampRange}
            element={this.props.element}
            isEdit ={action === ViewerUtility.dataPaneAction.editCustomPolygon}
            onFlyTo={this.props.onFlyTo}
            onAddCustomPolygon={this.props.onAddCustomPolygon}
          />
        )
      }
    
    return (
      <div className='viewer-pane data-pane' style={style}>
        <Card className='data-pane-title-card'>
          <CardHeader
            className='data-pane-title-header'
            title={
              <Typography variant="h6" component="h2" className='no-text-transform'>
                {title}
              </Typography>
            }
            subheader={
              idText ? 
                <Button
                  onClick={this.onFlyTo}
                >
                  <div className='data-pane-title-card-subtitle'>
                    {idText}
                  </div>
                </Button> : null
            }
          />
        </Card>
        {actionControl}
      </div>
    );
  }
}

export default DataPane;
