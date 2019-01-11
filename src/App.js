import React, { Component } from "react";
import "./App.css";
import Viewer from "./components/viewer/viewer";

const apiUrl = "https://api.birdsai.co/api/";
const wmsUrl = "https://wms.birdsai.co/";

class App extends Component {
    componentDidMount() {
        document.title = "Maps - Ellipsis Earth Intelligence"
    }

    render() {
        return (
            <div className="App">
                <Viewer 
                    apiUrl = {apiUrl}
                    wmsUrl = {wmsUrl}
                />
            </div>
        );
    }
}

export default App;
