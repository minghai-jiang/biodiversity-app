import React, { Component } from "react";
import {
    Route,
    BrowserRouter
} from "react-router-dom";
import "./components/main-menu/main-menu";

import MainMenu from "./components/main-menu/main-menu";

import Viewer from "./components/viewer/viewer";
import Home from "./components/home/home";
import About from "./components/about/about";
import Contact from "./components/contact/contact";
import Products from "./components/products/products"


import "./App.css";

const apiUrl = "https://api.birdsai.co/api/";
const wmsUrl = "https://wms.birdsai.co/";

class App extends Component {
    componentDidMount() {
        document.title = "Ellipsis Earth Intelligence"
    }

    render() {
        return (
            <BrowserRouter>
                <div className="App">
                    <MainMenu>
                    </MainMenu>
                    <div className="content">
                        <Route exact path="/" component={Home}/>
                        <Route path="/maps" render={(props) => <Viewer apiUrl={apiUrl} wmsUrl = {wmsUrl} {...props} />} />
                        <Route path="/products" component={Products}/>
                        <Route path="/about" component={About}/>
                        <Route path="/contact" component={Contact} />
                    </div>               
                </div>
            </BrowserRouter>           
        );
    }
}

export default App;
