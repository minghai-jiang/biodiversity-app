import React, { Component } from "react";

import Markdown  from '../../Markdown/Markdown';

import "./Documentation.css";

export class ProductsDocumentation extends Component {
  render() {
    return (
      <div>     
        <div className="main-block">
          <div className="main-block-header">
            Documentation
          </div>
          <div className="main-block-content main-block-content-left">
            <Markdown publicFilesUrl={this.props.publicFilesUrl} file="documentation"></Markdown>
          </div>                        
        </div>     
      </div>
    )         
  }
}

export default ProductsDocumentation;
