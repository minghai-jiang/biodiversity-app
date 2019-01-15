import React, { Component } from "react";
import { NavLink } from "react-router-dom";

import "./footer.css";

export class Footer extends Component {

    render() {
        return (
            <div className="footer">
                <div className="footer-content">
                    <img src="/images/logo-white.png" className="footer-logo"></img>
                    <br></br>
                    info@ellipsis-earth.com
                </div>
            </div>
        )
    }
}

export default Footer;
