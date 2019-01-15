import React, { Component } from "react";
import {
    Route
} from "react-router-dom";

import ProductsHome from "./products-home/products-home";
import ProductsWms from "./products-wms/products-wms";
import ProductsApi from "./products-api/products-api";


import "./product.css";

export class Products extends Component {
    render() {
        return (
            <div>
                <Route exact path="/products" component={ProductsHome}/>
                <Route path="/products/wms" component={ProductsWms}/>
                <Route path="/products/api" component={ProductsApi}/>
            </div>
        )
    }
}

export default Products;
