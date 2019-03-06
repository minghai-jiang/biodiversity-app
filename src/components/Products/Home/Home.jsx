import React, { Component } from "react";
import { NavLink } from "react-router-dom";

export class ProductsHome extends Component {
  render() {
    return (
      <div>
        <div className="main-block-header">
            <h1>Products</h1>
        </div>
        <div className="main-block main-block-first product-block-first">
          <div className="main-block-content main-block-content-left">
            <img className="products-top-image" src="/images/logo-black-subtitle.png" alt="Ellipsis Earth Intelligence logo black"/>

            <p>
              Ellipsis' product is an easy to use API that allows you to query and visualize the vast amount of geographic information in our database. 
              On top of this we offer an open-source interactive viewer to easily engage people on your projects.
            </p>
          </div>                    
        </div>      

        <div className="main-block main-block-first main-block-accented product-block-accented">
          <div className="main-block-content main-block-content-left">
            <h3>
              API
            </h3>

            <p className="product-end-paragraph">
              Ellipsis provides a REST API that allows you to query our aggregated data directly.
              It also offers attractive and interactive visualizations that can be easily imported in your favorite framework,
              such as arcGIS or Leaflet.
            </p>

            <NavLink to="/products/documentation" className="button button-accented main-block-double-button product-double-button">
              Documentation
            </NavLink>
            <NavLink to="/products/tutorial" className="button button-accented main-block-double-button product-double-button">
              Tutorial
            </NavLink>

            <h3>
              Viewer
            </h3>

            <p className="product-end-paragraph">              
              The Ellipsis viewer offers low threshold access to all Ellipsis data.
              Explore our interactive maps and/or export data to be processed in your application of choice.
            </p>

            <NavLink to="/viewer" className="button button-accented main-block-double-button product-double-button">
              Viewer
            </NavLink>

          </div>
        </div>    

        <div className="main-block">
          <div className="main-block-content main-block-content-left">
            <h2>
              About the data
            </h2>

            <p>
              Ellipsis data is acquired and processed on a resolution of 10 by 10 meters. 
              We currently provide three types of data:
            </p>

            <ul>
              <li>
                Spectral indices, to assess the condition of a region.
              </li>
              <li>
                Classification, to assess the land cover type of a region.
              </li>
              <li>
                Sudden change, to assess whether an abrupt event has occurred in a region.
              </li>
            </ul>

            <p>
              We aggregate data to both standard OpenStreetMap tiles as well as to custom polygons that are map specific.
            </p>

            <h2>
                Accessibility
            </h2>

            <p>
              Ellipsis maintains various monitoring services for a broad range of customers.
              We call these <span className="key-words">self-updating maps</span>. Some of these maps are public and can be viewed and used by anyone, 
              others are private and can only be accessed if you have the required login credentials.
            </p>
          </div>                    
        </div>                
      </div>
    )
  }
}

export default ProductsHome;
