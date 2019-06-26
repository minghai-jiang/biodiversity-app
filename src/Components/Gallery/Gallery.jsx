import React, { Component } from "react";
import { Redirect } from 'react-router-dom';

/*import {
    Route
} from "react-router-dom";*/

import LoadUpdateUtil from '../Utilities/LoadUpdateUtil';

import { Footer } from "../Footer/Footer";

import "./Gallery.css";

export class Gallery extends Component {
    constructor(props) {
    super(props);

    this.state = {
      galleryItemUrl : null
    };
  }

  onAppChange = e => {
    window.open(e.target.value, '_blank');
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
          <div className="galleryItem">
            <h2>Ellipsis Viewer</h2>
            <a href='https://ellipsis-earth.com/viewer' target="_blank"><img src="/images/GalleryScreen.jpg"/></a>
            <div className="buttonContainer">
              <a href="https://ellipsis-earth.com/viewer" target="_blank" className="button-a">
                <div className="button button-accented main-block-single-button">
                  Ellipsis Viewer
                </div>
              </a>
              <a href="https://github.com/ellipsis-earth/ellipsis-app" target="_blank" className="button-a">
                <div className="button button-accented main-block-single-button">
                  Source code
                </div>
              </a>
            </div>
          </div>


            <h1>{this.props.localization['Analysis']}</h1>
            <select defaultValue="default" onChange={this.onMonitoringServiceChange}>
              <option value="default" disabled hidden>{this.props.localization['ChoosePrompt']}</option>
              <option value="tutorial">{this.props.localization['ApiTutorial']}</option>
              <option value="Documentation">{this.props.localization['Documentation']}</option>
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
