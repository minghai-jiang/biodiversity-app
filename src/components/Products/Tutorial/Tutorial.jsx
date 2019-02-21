import React, { Component } from "react";
import "./Tutorial.css";

import Markdown  from '../../Markdown/Markdown';

export class ProductsTutorial extends Component {

    render() {
        return (
            <div>     
                <div className="main-block">
                    <h1 className="main-block-header">
                        Ellipsis-Earth tutorial
                    </h1>
                    <div className="main-block-content main-block-content-left">
                        <Markdown publicFilesUrl={this.props.publicFilesUrl} file="tutorial"></Markdown>
                    </div>                        
                </div>     
            </div>
        );
    }
}

export default ProductsTutorial;
