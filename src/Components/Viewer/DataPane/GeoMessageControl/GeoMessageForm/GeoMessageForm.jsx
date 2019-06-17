import React, { PureComponent } from 'react';
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
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';

import Utility from '../../../../../Utility';
import ViewerUtility from '../../../ViewerUtility';
import DataPaneUtility from '../../DataPaneUtility';

import './GeoMessageForm.css';
import ApiManager from '../../../../../ApiManager';

class GeoMessageForm extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      expanded: false,

      hasPermissions: false
    };
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
  }

  toggleExpand = () => {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    let user = this.props.user;
    let hasAddPermission = user && this.props.map.accessLevel >= ApiManager.accessLevels.addGeoMessages;
    let hasAddImagePermission = user && this.props.map.accessLevel >= ApiManager.accessLevels.addGeoMessageImage;

    let title = 'Add GeoMessage';
    if (!user) {
      title = 'Please login';
    }
    else if (!hasAddPermission) {
      title = 'Insufficient access';
    }

    let cardClassName = 'data-pane-card geomessage-form-card';
    if (this.state.expanded) {
      cardClassName += ' geomessage-form-card-expanded';
    }

    return (
      <Card className={cardClassName}>
        <CardHeader
          title={
            !this.state.expanded ? 
              <Button variant='outlined' onClick={this.toggleExpand} disabled={!hasAddPermission}>
                {title}
              </Button> : 
              <div className='geomessage-expanded-title'>
                Add GeoMessage
              </div>
          }
          action={
            this.state.expanded ?
              <IconButton
                className={this.state.expanded ? 'expand-icon' : 'expand-icon expanded'}
                onClick={this.toggleExpand}
                aria-expanded={this.state.expaneded}
                aria-label='Expand'
              >
                <ClearIcon />
              </IconButton> : null
          }
        />
        <Collapse in={this.state.expanded}>
          <CardContent>
            Expanded content
          </CardContent>
        </Collapse>
      </Card>
    )
  }
}

export default GeoMessageForm;
