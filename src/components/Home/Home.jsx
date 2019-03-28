import React, { Component } from "react";
//import { NavLink } from "react-router-dom";

import LoadUpdateUtil from '../Utilities/LoadUpdateUtil';
import { Footer } from "../footer/footer";

import "./Home.css";

export class Home extends Component {
  render() {
    return (
      <div>
        <div className="main-content">
          <div id="banner">
            <img id="banner-logo" src="/images/logo-white-subtitle.png" alt="Ellipsis Earth Intelligence"/>                    
          </div>

          <LoadUpdateUtil 
            contentUrl={'/html/' + this.props.language + '/home/home.html'}
          />
        </div>


        <Footer></Footer>
      </div>
    )
  }
}

export default Home;
