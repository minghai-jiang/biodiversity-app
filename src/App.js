import React, { Component } from "react";
import {
    Route,
    NavLink,
    BrowserRouter
  } from "react-router-dom";
import "./components/main-menu/main-menu";

import MainMenu from "./components/main-menu/main-menu";

import Viewer from "./components/viewer/viewer";
import Home from "./components/home/home";

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
                    <div class="content">
                        <Route exact path="/" component={Home}/>
                        <Route path="/maps" render={(props) => <Viewer apiUrl={apiUrl} wmsUrl = {wmsUrl} {...props} />} />
                        <Route path="/products" />
                        <Route path="/about" />
                        <Route path="/contact" />
                    </div>               
                </div>
            </BrowserRouter>           
        );
    }
}

export default App;
