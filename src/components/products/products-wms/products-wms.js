import React, { Component } from "react";
import { NavLink } from "react-router-dom";

export class ProductsWms extends Component {
    render() {
        return (
            <div>     
                <div className="main-block">
                    <div className="main-block-header">
                        WMS User Guide
                    </div>
                    <div className="main-block-content main-block-content-left">
                        <p>
                            The Ellipsis WMS is mostly the same as Leaflet’s format. 
                            The Earth is subdivided into 2<sup>n</sup> by 2<sup>n</sup> images of 256 x 256 pixels, where n is the zoom-level.
                        </p>
                        <p>
                            The URL format of the WMS is:
                        </p>
                        <p className="code-block">
                            https://wms.ellipsis-earth.com/{"{map_name}"}/wms/{"{timestamp_number}"}/{"{layer}"}/{"{z}"}/{"{x}"}/{"{y}"}.png
                        </p>
                        <p>
                            Which maps are available can be obtained through our <NavLink to="/products/api">API</NavLink>
                            , as well as the available timestamps and 
                            layers for that map.
                        </p>
                    </div>                        
                </div>     
            </div>
        )
    }
}

export default ProductsWms;
