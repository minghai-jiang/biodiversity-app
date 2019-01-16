import React, { Component } from "react";
import { NavLink } from "react-router-dom";

export class ProductsHome extends Component {
    render() {
        return (
            <div>
                <div className="main-block main-block-first product-block-first">
                    <div className="main-block-content main-block-content-left">
                        <img className="products-top-image" src="/images/logo-black-subtitle.png" alt="Ellipsis Earth Intelligence logo black"/>

                        <p>
                            Ellipsis Product is an easy to use API and WMS that allows you to query and visualise
                            the vast amount of geographic information in our database.
                        </p>
                    </div>                    
                </div>      

                <div className="main-block main-block-first main-block-accented product-block-accented">
                    <div className="main-block-content main-block-content-left">
                        <h3>
                            WMS
                        </h3>

                        <p className="product-end-paragraph">
                            Our WMS is a collection of images in a tile structure. Each individual image can be described
                            and accessed using a specifically structured URL. Based on this structure one can easily make 
                            interactive maps in the same way as in the Ellipsis map app.
                        </p>

                        <NavLink to="/products/wms" className="button-a">
                            <div className="button button-accented main-block-single-button product-single-button">
                                WMS Documentation                                                
                            </div>
                        </NavLink>

                        <h3>
                            API
                        </h3>

                        <p className="product-end-paragraph">
                            Ellipsis provides a REST API that allows you to query our aggregated raw data directly. 
                            We aggregate data to both standard OpenStreetMap tiles on zoom level 14, which means they 
                            are tiles of no more than 2.5 by 2.5 kilometers, and custom polygons that are map specific.
                        </p>

                        <NavLink to="/products/api" className="button-a">
                            <div className="button button-accented main-block-single-button product-single-button">
                                API Documentation                                               
                            </div>
                        </NavLink>
                    </div>
                </div>    

                <div className="main-block">
                    <div className="main-block-content main-block-content-left">
                        <h4>
                            About the data
                        </h4>

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
                            Based on this data we provide a visualisation in the form of a WMS and aggregated data in the 
                            form of an API.
                        </p>

                        <h4>
                            Accessibility
                        </h4>

                        <p>
                            Ellipsis maintains various monitoring services for a broad range of customers.
                            We call these <span className="key-words">self-updating maps</span>. Some of these maps are public and can be viewed and used by anyone, 
                            others are private and can only be accessed if you have the required login credentials.
                        </p>

                        <h4>
                            Obtaining the custom polygons
                        </h4>

                        <p>
                            The shapefile containing the custom polygons of a map to which the data has been aggregated can be 
                            downloaded from the tab of the map in the Ellipsis maps app.
                        </p>
                    </div>                    
                </div>                
            </div>
        )
    }
}

export default ProductsHome;
