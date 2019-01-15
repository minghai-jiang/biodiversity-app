import React, { Component } from "react";
import { NavLink } from "react-router-dom";

export class ProductsApi extends Component {
    render() {
        return (
            <div>     
                <div className="main-block">
                    <div className="main-block-header">
                        API User Guide
                    </div>
                    <div className="main-block-content main-block-content-left">
                        <p>
                            All API calls should be in the following format:
                        </p>
                        <p className="code-block">
                            https://api.ellipsis-earth.com/api/{"{method_name}"}
                        </p>
                        <p>
                            Where {"{method_name}"} should be substituted with the name of the API you want to call. 
                            For example, if you want to call the login function, you would make a POST request to:
                        </p>
                        <p className="code-block">
                            https://api.ellipsis-earth.com/api/login
                        </p>
                    </div>                        
                </div>     
            </div>
        )
    }
}

export default ProductsApi;
