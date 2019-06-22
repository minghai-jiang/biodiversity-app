import React, { Component } from "react";
/*import {
    Route
} from "react-router-dom";*/

import LoadUpdateUtil from '../Utilities/LoadUpdateUtil';

import { Footer } from "../footer/footer";

export class Gallery extends Component {
    constructor(props) {
    super(props);

    this.state = {
      galleryItemUrl : null
    };
  }

  onAppChange = e => {
    let itemValue = e.target.value;
    //redirect
  }


  onMonitoringServiceChange = e => {
    let itemValue = e.target.value;
    let contentUrl = '/markdown/' + itemValue + '.md';
    this.setState({ galleryItemUrl : contentUrl });
  }

  render() {
    return (
      <div>
        <div className="main-block-header">
          <h1>{this.props.localization["gallery"]}</h1>
        </div>
        <div className="main-block main-block-first product-block-first">
          <LoadUpdateUtil
            contentUrl={'/html/' + this.props.language + '/gallery/gallery.html'}
          />
        </div>
        <div className="main-block">
          <div className="main-block-content main-block-content-left">
          <h1>{this.props.localization['Apps']}</h1>
          <select defaultValue="default" onChange={this.onAppChange}>
            <option value="default" disabled hidden>{this.props.localization['ChoosePrompt']}</option>
            <option value="https://ellipsis-earth.com/viewer" >{this.props.localization['Ellipsis Viewer']}</option>
          </select>


            <h1>{this.props.localization['Analysis']}</h1>
            <select defaultValue="default" onChange={this.onMonitoringServiceChange}>
              <option value="default" disabled hidden>{this.props.localization['ChoosePrompt']}</option>
              <option value="Northern Paraguay deforestation">{this.props.localization['Northern Paraguay deforestation']}</option>
              <option value="Flora management in the Netherlands">{this.props.localization['Flora management in the Netherlands']}</option>
              <option value="Appendix">{this.props.localization['Appendix']}</option>
            </select>


          </div>
          <div className="main-block-content main-block-content-left">

            <LoadUpdateUtil
              contentUrl={this.state.galleryItemUrl}
              isMarkdown={true}
            />
          </div>
        </div>
        <Footer></Footer>
        </div>
    )
  }
}

export default Gallery;
