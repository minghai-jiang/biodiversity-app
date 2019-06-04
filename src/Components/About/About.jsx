import React, { Component } from "react";
import LoadUpdateUtil from '../Utilities/LoadUpdateUtil';

import Footer from "../Footer/Footer";

import "./About.css";

export class About extends Component {
    render() {
      return (
        <div>
          <LoadUpdateUtil 
            contentUrl={'/html/' + this.props.language + '/about/about.html'}
          />
        
        <Footer></Footer>
      </div>
    )
  }
}

export default About;
