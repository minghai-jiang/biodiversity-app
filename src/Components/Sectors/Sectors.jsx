import React, { Component } from 'react';

import LoadUpdateUtil from '../Utilities/LoadUpdateUtil';

import Footer from '../Footer/Footer';

import './Sectors.css';

export class Sector extends Component {
    constructor(props) {
    super(props);

    this.state = {
      sectorItemUrl : null
    };
  }

  onSectorChange = e => {
    let itemValue = e.target.value;
    let contentUrl = '/html/' + this.props.language + '/sectors/sectors-select/' + itemValue + '.html';
    this.setState({ sectorItemUrl : contentUrl });
  }

  render() {
    return (
      <div>
        <div className='main-block-header'>
            <h1>{this.props.localization['sectors']}</h1>
        </div>

        <LoadUpdateUtil
            contentUrl={'/html/' + this.props.language + '/sectors/sectors-home.html'}
        />

        <div className='main-block main-block-first main-block-accented product-block-accented'>
          <div className='main-block-content main-block-content-left'>
            <h1>{this.props.localization['SelectSector']}</h1>
            <select defaultValue='default' onChange={this.onSectorChange}>
              <option value='default' disabled hidden>{this.props.localization['ChoosePrompt']}</option>
              <option value='Consultancyengineering'>{this.props.localization['ConsultancyEngineering']}</option>
              <option value='Forestry'>{this.props.localization['Forestry']}</option>
              <option value='GovernmentAgencies'>{this.props.localization['Government']}</option>
              <option value='NGOs'>{this.props.localization['Ngo']}</option>
              <option value='Agrobusiness'>{this.props.localization['Agrobusiness']}</option>
            </select>
          </div>
        </div>

        <div className='pre_dynamic main-block'>
          <LoadUpdateUtil contentUrl={this.state.sectorItemUrl}/>
        </div>
        <Footer></Footer>
        </div>
    )
  }
}

export default Sector;
