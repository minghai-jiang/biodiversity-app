import React, { Component } from "react";
import {
    Route
} from "react-router-dom";

import ProductsHome from "./products-home/products-home";
import ProductsDocumentation from "./products-documentation/products-documentation";
import ProductsTutorial from "./products-tutorial/products-tutorial";

import { Footer } from "../footer/footer";


import "./product.css";

export class Products extends Component {
    render() {
        return (
            <div>
                <div className="main-content">
                    <Route exact path="/products" component={ProductsHome}/>
                    <Route path="/products/documentation" component={ProductsDocumentation}/>
                    <Route path="/products/tutorial" component={ProductsTutorial}/>
                </div>
                <Footer></Footer>
            </div>
        )
    }
}

export default Products;
