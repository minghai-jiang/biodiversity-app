import React, { Component } from "react";
// import { NavLink } from "react-router-dom";

import Markdown  from '../../markdown/Markdown';

import "./products-documentation.css";

export class ProductsDocumentation extends Component {
    render() {
        return (
            <div>     
                <div className="main-block">
                    <div className="main-block-header">
                        Documentation
                    </div>
                    <div className="main-block-content main-block-content-left">
                        <Markdown file="documentation"></Markdown>
                    </div>                        
                </div>     
            </div>
        )
    }
}

export default ProductsDocumentation;
