import React, { Component } from "react";
import { NavLink } from "react-router-dom";

import L_U_HTML from '../Utilities/Load&UpdateHTML';
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

          <L_U_HTML 
            contentUrl={'/html/' + this.props.language + '/home/home.html'}
          />
        </div>


        <Footer></Footer>
      </div>
    )
  }
}

export default Home;
