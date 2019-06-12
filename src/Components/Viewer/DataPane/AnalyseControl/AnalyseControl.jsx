import React, { PureComponent } from 'react';
import Papa from 'papaparse';
import LineChart from './LineChart/LineChart';

import { 
  Card,
  Checkbox,
  CardHeader,
  CardContent,
  Collapse,
  IconButton,
  Typography,
  CircularProgress,
  Button
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Utility from '../../../../Utility';
import ViewerUtility from '../../ViewerUtility';

import './AnalyseControl.css';
import ApiManager from '../../../../ApiManager';

class AnalyseControl extends PureComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      loading: false,

      data: null
    };
  }

  componentDidMount() {
    this.setState({ loading: true }, this.getData);    
  }

  componentDidUpdate(prevProps) {
    let differentElement = !prevProps.element || this.props.element.key !== prevProps.element.key;

    if (differentElement) {
      this.setState({ loading: true }, this.getData);
    }
  }

  getData = () => {
    let element = this.props.element;

    let body = {
      mapId: this.props.map.id,
      class: 'all classes'
    };
    let urlType = null;

    if (element.type === ViewerUtility.standardTileLayerType) {
      body.tileX = element.feature.properties.tileX;
      body.tileY = element.feature.properties.tileY;
      body.zoom = element.feature.properties.zoom;

      urlType = 'tile';
    }

    let classesDataPromise = ApiManager.post(`/data/class/${urlType}/timestamps`, body, this.props.user);
    let spectralIndicesDataPromise = ApiManager.post(`/data/spectral/${urlType}/timestamps`, body, this.props.user);

    let data = {
      classes: {},
      spectralIndices: {}
    };

    Promise.all([classesDataPromise, spectralIndicesDataPromise])
      .then(results => {
        data.classes.raw = results[0];
        data.spectralIndices.raw = results[1];

        let options = {
          dynamicTyping: true, 
          skipEmptyLines: true, 
          header: true
        };

        let parseFunc = async () => {
          let classesParsed = Papa.parse(data.classes.raw, options);
          let spectralIndicesParsed = Papa.parse(data.classes.raw, options);

          return [classesParsed, spectralIndicesParsed];
        };

        return parseFunc();
      })
      .then(results => {
        data.classes.parsed = results[0];
        data.spectralIndices.parsed = results[1];

        this.setState({ data: data, loading: false });
      })
      .catch(err => {
      });

  }

  render() {

    let element = this.props.element;
    let idText = null;

    if (element.type === ViewerUtility.standardTileLayerType) {
      idText = `${element.feature.properties.tileX}, ${element.feature.properties.tileY}, ${element.feature.properties.zoom}`;
    }

    let dataSection = null;

    if (this.state.loading) {
      dataSection = (<CircularProgress className='loading-spinner'/>);
    }
    else if (this.state.data) {
      dataSection = (
        <Card className='data-pane-card'>
          <CardHeader
            title={
              <Typography variant="h6" component="h2" className='no-text-transform'>
                Classes
              </Typography>
            }
          />
          <CardContent>
            <LineChart map={this.props.map} data={this.state.data}/>
          </CardContent>
        </Card>
      );
    }

    return (
      <div>
        <Card>
          <CardHeader
            title={
              <Button>
                <Typography variant="h6" component="h2" className='no-text-transform'>
                  Standard tile
                </Typography>
              </Button>
            }
            subheader={idText}
          />
        </Card>
        {dataSection}
      </div>
    )
  }
}



export default AnalyseControl;
