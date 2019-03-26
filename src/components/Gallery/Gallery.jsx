import React, { Component } from "react";
/*import {
    Route
} from "react-router-dom";*/

import L_U_HTML from '../Utilities/LoadUpdateUtil';

import { Footer } from "../footer/footer";

export class Gallery extends Component {
    constructor(props) {
    super(props);

    this.state = {
      galleryItemUrl : null
    };
  }
   
  onGalleryChange = e => {
    let itemValue = e.target.value;
    let contentUrl = '/markdown/' + itemValue + '.md';
    this.setState({ galleryItemUrl : contentUrl });
  }

  render() {
    return (
      <div>
        <div className="main-block-header">
          <h1>Gallery</h1>
        </div>
        <div className="main-block main-block-first product-block-first">            
          <L_U_HTML 
            contentUrl={'/html/' + this.props.language + '/gallery/gallery.html'}
          />
        </div>
        <div className="main-block">
          <div className="main-block-content main-block-content-left">
            <h1>{this.props.localization['Gallery']}</h1>
            <select defaultValue="default" onChange={this.onGalleryChange}>
                <option value="default" disabled hidden>{this.props.localization['ChoosePrompt']}</option>
                <option value="tutorial">{this.props.localization['ApiTutorial']}</option>
		       <option value="Northern Paraguay deforestation">{this.props.localization['Northern Paraguay deforestation']}</option>
		       <option value="Flora management in the Netherlands">{this.props.localization['Flora management in the Netherlands']}</option>
		       <option value="Appendix">{this.props.localization['Appendix']}</option>
            </select>
          </div>
          <div className="main-block-content main-block-content-left">
            <L_U_HTML 
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
