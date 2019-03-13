import React, { Component } from "react";

import L_U_HTML from '../../Utilities/Load&UpdateHTML';

import './Documentation.css';

export class ProductsDocumentation extends Component {
  render() {
    return (
      <div>     
        <div className="main-block">
          <div className="main-block-header">
            Documentation
          </div>
          <div className='main-block-content main-block-content-left documentation-block'>
            {/* <Markdown publicFilesUrl={this.props.publicFilesUrl} file="documentation"></Markdown> */}
            <L_U_HTML 
              contentUrl={'/markdown/Documentation.md'}
              isMarkdown={true}
            />
          </div>                        
        </div>     
      </div>
    )         
  }
}

export default ProductsDocumentation;
