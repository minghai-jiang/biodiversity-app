import React, { Component } from "react";
import {
    Route
} from "react-router-dom";
import Modal from 'react-modal';

import "./components/main-menu/main-menu";
import MainMenu from "./components/main-menu/main-menu";

import Viewer from './components/Viewer/Viewer';
import Home from "./components/home/home";
import About from "./components/about/about";
import Contact from "./components/contact/contact";
import Products from "./components/products/products";

import "./App.css";

const apiUrl = "https://dev.api.ellipsis-earth.com/";

class App extends Component {
    componentDidMount() {
      document.title = "Ellipsis Earth Intelligence";
      Modal.setAppElement(this.el);
    }

    closeMenu = () => {
        var x = document.getElementById("main-menu");
        x.className = "";
    }

    render() {
        return (
            <div className="App" onClick={this.closeMenu}>
                <MainMenu>
                </MainMenu>
                <div className="content" ref={ref => this.el = ref}>
                    <Route exact path="/" component={Home}/>
                    <Route path="/maps" render={(props) => <Viewer apiUrl={apiUrl} {...props} />} />
                    <Route path="/products" component={Products}/>
                    <Route path="/about" component={About}/>
                    <Route path="/contact" component={Contact} />
                </div>               
            </div>   
        );
    }
}

export default App;
