import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import "./products-tutorial.css";

import Markdown  from '../../markdown/Markdown';

export class ProductsTutorial extends Component {

    render() {
        return (
            <div>     
                <div className="main-block">
                    <h1 className="main-block-header">
                        Ellipsis-Earth tutorial
                    </h1>
                    <div className="main-block-content main-block-content-left">
                        <Markdown file="tutorial"></Markdown>
                    </div>                        
                </div>     
            </div>
        );
    }
}

export default ProductsTutorial;
