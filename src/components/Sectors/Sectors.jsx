import React, { Component } from "react";
/*import {
    Route
} from "react-router-dom";*/

import LoadUpdateUtil from '../Utilities/LoadUpdateUtil';

import { Footer } from "../footer/footer";

import "./Sectors.css";

export class Sector extends Component {
    constructor(props) {
    super(props);

    this.state = {
      Sector : null
    };
  }
   
  onSectorChange = e => {
     this.setState({ Sector : e.target.value });
  }

  render() {
    return (
      <div>
        <div className="main-block-header">
            <h1>Sectors</h1>
        </div>
        <div className="main-block main-block-first product-block-first">
          <div className="main-block-content main-block-content-left">
            <img className="products-top-image" src="/images/logo-black-subtitle.png" alt="Ellipsis Earth Intelligence logo black"/>
            <p>Information on landscape conditions and dynamics is valuable for various fields and purposes.</p>
            <p>Select your sector to find what we can do for you.</p>
          </div>
        </div>
        <div className="main-block main-block-first main-block-accented product-block-accented">
          <div className="main-block-content main-block-content-left">
            <h1>Select sector</h1>
            <select defaultValue="default" onChange={this.onSectorChange}>
               <option value="default" disabled hidden>Please choose...</option>
               <option value="Consultancyengineering">Consultanty or Engineering</option>
               <option value="Forestry">Forestry</option>
               <option value="GovernmentAgencies">Government</option>
               <option value="NGOs">NGO</option>
            </select>
          </div>
        </div>
        <div className="pre_dynamic main-block">
          <LoadUpdateUtil publicFilesUrl={this.props.publicFilesUrl} type='Sector' contentName={this.state.Sector}></LoadUpdateUtil>
        </div>
        <Footer></Footer>
        </div>
    )
  }
}

export default Sector;