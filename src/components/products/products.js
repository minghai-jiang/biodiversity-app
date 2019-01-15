import React, { Component } from "react";
import {
    Route
} from "react-router-dom";

import ProductsHome from "./products-home/products-home";
import ProductsWms from "./products-wms/products-wms";
import ProductsApi from "./products-api/products-api";

import { Footer } from "../footer/footer";


import "./product.css";

export class Products extends Component {
    render() {
        return (
            <div>
                <div className="main-content">
                    <Route exact path="/products" component={ProductsHome}/>
                    <Route path="/products/wms" component={ProductsWms}/>
                    <Route path="/products/api" component={ProductsApi}/>
                </div>
                <Footer></Footer>
            </div>
        )
    }
}

export default Products;
