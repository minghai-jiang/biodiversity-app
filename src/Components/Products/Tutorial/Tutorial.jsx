import React, { Component } from "react";
import "./Tutorial.css";

import LoadUpdateUtil from '../../Utilities/LoadUpdateUtil';


export class ProductsTutorial extends Component {

    render() {
        return (
            <div>     
                <div className="main-block">
                    <h1 className="main-block-header">
                        Ellipsis-Earth tutorial
                    </h1>
                    <div className="main-block-content main-block-content-left">
                        <LoadUpdateUtil 
                          contentUrl={'/markdown/tutorial.md'}
                          isMarkdown={true}
                        />
                    </div>                        
                </div>     
            </div>
        );
    }
}

export default ProductsTutorial;
