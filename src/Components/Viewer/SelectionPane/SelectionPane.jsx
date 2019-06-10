import React, { PureComponent } from 'react';

import { 
  Card,
  Checkbox,
  CardHeader,
  CardContent,
  Collapse,
  IconButton,
  Typography
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

import ViewerUtility from '../ViewerUtility';

import './SelectionPane.css';

class SelectionPane extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      isOpen: false
    };
  }  

  componentDidUpdate(prevProps) {
    if (!prevProps.element || prevProps.element.key !== this.props.element.key) {
      this.setState({ isOpen: true });
    } 
  }

  onCloseClick = () => {
    this.setState({ isOpen: false });
  }

  render() {

    if (!this.state.isOpen) {
      return null;
    }

    let element = this.props.element;

    if (!element) {
      return null;
    }

    let title = 'Standard tile';
    if (element.type === ViewerUtility.polygonLayerType) {
      title = 'Polygon';
    }
    else if (element.type === ViewerUtility.customPolygonTileLayerType) {
      title = 'Custom polygon';
    }

    let elementProperties = element.feature.properties;
    let properties = [];
    
    for (let property in elementProperties) {
      if (elementProperties.hasOwnProperty(property)) {
        properties.push((
          <div key={property}>
            {`${property}: ${elementProperties[property]}`}
          </div>
        ))
      }
    }

    debugger;

    return (
      <Card className='selection-pane'>
        <CardHeader
          className='card-header'
          title={
            <Typography gutterBottom variant="h6" component="h2">
              {title}
            </Typography>
          }
          action={
            <IconButton
              onClick={this.onCloseClick}
              aria-label='Close'
            >
              <ClearIcon />
            </IconButton>
          }
        />
        <CardContent className={'card-content'}>
          {properties}
        </CardContent>
      </Card>
    );
  }
}

export default SelectionPane;
