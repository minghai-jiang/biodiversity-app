import React, { Component } from "react";
//import { NavLink } from "react-router-dom";

import LoadUpdateUtil from '../../Utilities/LoadUpdateUtil';

export class ProductsHome extends Component {
  render() {
    return (
      <div>
        <div className="main-block-header">
            <h1>{this.props.localization["products"]}</h1>
        </div>

        <LoadUpdateUtil
          contentUrl={'/html/' + this.props.language + '/products/products-home.html'}
        />

      </div>
    )
  }
}

export default ProductsHome;
