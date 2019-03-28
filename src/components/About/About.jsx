import React, { Component } from "react";
import L_U_HTML from '../Utilities/LoadUpdateUtil';

import { Footer } from "../footer/footer";

import "./About.css";

export class About extends Component {
    render() {
      return (
        <div>
          <L_U_HTML 
            contentUrl={'/html/' + this.props.language + '/about/about.html'}
          />
        
        <Footer></Footer>
      </div>
    )
  }
}

export default About;
