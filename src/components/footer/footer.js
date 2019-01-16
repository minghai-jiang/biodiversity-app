import React, { Component } from "react";
import { NavLink } from "react-router-dom";

import "./footer.css";

export class Footer extends Component {

    render() {
        return (
            <div className="footer">
                <div className="footer-content">
                    <NavLink to="/">
                        <img className="footer-logo" src="/images/logo-white.png" alt="Ellipsis Earth Intelligence logo white"/>
                    </NavLink>
                    <br/>
                    info@ellipsis-earth.com
                </div>
            </div>
        )
    }
}

export default Footer;
