import React, { Component } from "react";

import LoadUpdateUtil from '../../Utilities/LoadUpdateUtil';

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
            <LoadUpdateUtil 
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
