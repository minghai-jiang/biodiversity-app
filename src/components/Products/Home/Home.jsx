import React, { Component } from "react";
import { NavLink } from "react-router-dom";

import L_U_HTML from '../../Utilities/LoadUpdateUtil';

export class ProductsHome extends Component {
  render() {
    return (
      <div>
        <div className="main-block-header">
            <h1>Products</h1>
        </div>

        <L_U_HTML 
          contentUrl={'/html/' + this.props.language + '/products/products-home.html'} 
        />

      </div>
    )
  }
}

export default ProductsHome;
