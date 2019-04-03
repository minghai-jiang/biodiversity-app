import React, { PureComponent} from 'react';
import SlidingPane from 'react-sliding-pane';
import PopupForm from '../../Popup-form/Popup-form';
import LineChart from './DV/LineChart';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import './InfoPane.css';
import 'react-sliding-pane/dist/react-sliding-pane.css';

export class InfoPane extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      openQueryPane: true,
      classes: [],
      indeces: [],
      GeoMessage: [],
      inputClass: '',
      sliderValue: 1,
      slider: [],
    }

    if (this.props && this.props.infoContent)
    {
      this.timestamp = this.props.infoContent.properties.timestamp;
    }
  }

  toggleQueryPane = (open) => {
    this.setState({ openQueryPane: open });
  };

  componentWillReceiveProps(nextProp){  
    if(nextProp && nextProp.infoContent && nextProp.infoContent.openPane && this.props.infoContent.openPane !== nextProp.infoContent.openPane)
    {
      this.toggleQueryPane(true);
    }
  };

  getClasses = () =>
  {
    let content = [];
    let classes = [];
    content.push(<h1 key='Classes'>Classes</h1>);
    content.push(<LineChart key ='classesTimestamps' props={this.props} type='class'/>);
    classes.push(<div key='containerClasses' className='LineChart'>{content}</div>);
    return classes;
  };

  getIndeces = (itemValue, filter = 1) =>
  {
    let content = [];
    let indeces = [];
    let options = [
      <option key='default' value="default" disabled hidden>Choose a class</option>,
      <option key='allClasses' value='all classes'>all classes</option>,
    ];
    content.push(<h1 key='Indices'>Indices</h1>);

    for (let i = 0; i < this.props.map.classes.length; i++)
    {
      let mapClass = this.props.map.classes[i];
      if (mapClass.timestampNumber === this.timestamp)
      {
        for (let j = 0; j < mapClass.classes.length; j++)
        {
          if (mapClass.classes[j].name !== 'blanc' && mapClass.classes[j].name !== 'mask')
          {
            options.push(<option key={mapClass.classes[j].name} value={mapClass.classes[j].name}>{mapClass.classes[j].name}</option>);
          }
        }
      }
    }

    if (itemValue)
    {
      content.push(<select key='classSelector' defaultValue={itemValue} onChange={this.onClassChange}>{options}</select>);
      content.push(<LineChart key={'indicesTimestamps' + itemValue} props={this.props} type='spectral' inputClass={itemValue} className='LineChart' filter={filter}/>)
    }
    else
    {
      content.push(<select key='classSelector' defaultValue={'default'} onChange={this.onClassChange}>{options}</select>);
    }

    indeces.push(<div key={'containerIndices'} className='LineChart'>{content}</div>);

    return indeces;
  };

  handleChange = (value) => {
    this.setState({sliderValue: value, indeces: this.getIndeces(this.state.inputClass, value)});
  };

  getSlider = () =>
  {
    let slider = [];
    const createSliderWithTooltip = Slider.createSliderWithTooltip;
    const SliderWithTooltip = createSliderWithTooltip(Slider);
    slider.push(<h2 key='CloudFilter Header'>Maximum cloud cover</h2>);
    slider.push(
      <SliderWithTooltip
        key='Slider'
        dots={false}
        step={0.01}
        defaultValue={this.state.sliderValue}
        min={0}
        max={1}
        onChange={this.handleChange}
        tipFormatter={v => Math.round(v*100) + '%'}
        marks={{0:'0%', 1: '100%'}}
      />);
    return slider;
  };

  componentDidMount()
  {
    let name;
    if(this.props.infoContent && this.props.infoContent.type === 'analyse')
    {
      name = 'Analysis of ' + this.props.infoContent.properties.type + ' ' + this.props.infoContent.properties.id;

      let classes = this.getClasses();
      let indeces = this.getIndeces();
      let slider = this.getSlider();

      this.setState({classes: classes, indeces: indeces, slider: slider})
    }
    else if(this.props.infoContent && this.props.infoContent.type === 'report')
    {
      name = 'GeoMessage';
      this.setState({GeoMessage: <PopupForm props={this.props.infoContent.properties} />})
    }

    this.paneName = name;
  }

  onClassChange = e =>
  {
    let itemValue = e.target.value;
    let indeces = this.getIndeces(itemValue);
    this.setState({inputClass: itemValue, indeces: indeces})
  }

  render() {
    if (this.props.map && this.props.infoContent)
    {     
      return (
          <SlidingPane
            className='query-pane'
            overlayClassName='modal-overlay'
            isOpen={this.state.openQueryPane}
            title={this.paneName}
            width={'75%'}
            onRequestClose={() => { this.toggleQueryPane(false); }}
          >
            {this.state.classes}
            {this.state.indeces}
            {this.state.indeces.length > 0 ? this.state.slider : null}
            {this.state.GeoMessage}

          </SlidingPane>
      );
    }
    else {
      return (
        <div></div>
      )
    }
  }
}

export default InfoPane;