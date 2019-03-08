import React, { Component } from "react";
/*import {
    Route
} from "react-router-dom";*/

import L_U_HTML from '../Utilities/Load&UpdateHTML';

import { Footer } from "../footer/footer";

export class Gallery extends Component {
    constructor(props) {
    super(props);

    this.state = {
      Gallery : null
    };
  }
   
  onGalleryChange = e => {
     this.setState({ Gallery : e.target.value });
  }

  render() {
    return (
      <div>
        <div className="main-block-header">
          <h1>Gallery</h1>
        </div>
        <div className="main-block main-block-first product-block-first">
          <div className="main-block-content main-block-content-left">
            <img className="products-top-image" src="/images/logo-black-subtitle.png" alt="Ellipsis Earth Intelligence logo black"/>
            <p>
              In this gallery you find a few notebooks demonstrating some powerful use cases of the Ellipsis API.
              Each of these notebooks is fully built on the API and does not require any other local data sets.
              All examples can therefore immediately be implemented in any application at any place.
            </p>
          </div>
        </div>
        <div className="main-block main-block-first main-block-accented product-block-accented">
          <div className="main-block-content main-block-content-left">
            <h1>Gallery</h1>
            <select defaultValue="default" onChange={this.onGalleryChange}>
               <option value="default" disabled hidden>Please choose...</option>
               <option value="Northern_Paraguay_deforestation">Northern Paraguay deforestation</option>
            </select>
          </div>
        </div>
        <div className="main-block">
          <div className="main-block-content main-block-content-left">
            <L_U_HTML publicFilesUrl={this.props.publicFilesUrl} type='Gallery' contentName={this.state.Gallery}></L_U_HTML>
          </div>
        </div>
        <Footer></Footer>
        </div>
    )
  }
}

export default Gallery;