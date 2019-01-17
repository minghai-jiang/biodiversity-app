import React, { Component } from "react";
import { NavLink } from "react-router-dom";

import "./main-menu.css";

export class MainMenu extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            hidden: false,
        };
    }

    componentDidMount = () => {

    }

    toggleMenu = (event) => {
        var x = document.getElementById("main-menu");
        if (x.className === "") {
            x.className = "responsive";
        } 
        else {
            x.className = "";
        }

        event.stopPropagation();
    }

    render() {
        let displayStyle = {
            display: "block"
        };

        if (this.state.hidden) {
            displayStyle.display = "hidden";
        }

        return (
            <div id="main-menu" style={displayStyle}>
                <ul>
                    <li>
                        <NavLink to="/" className="main-menu-logo-item">
                            <img className="main-menu-logo" src="/images/logo-white.png" alt="Ellipsis Earth Intelligence logo white"/>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/" className="main-menu-item">
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/maps" className="main-menu-item">
                            Maps
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/products" className="main-menu-item">
                            Products
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/about" className="main-menu-item">
                            About Us
                        </NavLink>
                    </li>
                    {/* <li>
                        <NavLink to="/contact" className="main-menu-item">
                            Contact
                        </NavLink>
                    </li> */}
                    {/* <li style={{float: "right"}}>
                        <NavLink to="/login" className="main-menu-item">
                            Login
                        </NavLink>
                    </li> */}
                </ul> 
                <a href="javascript:void(0);" className="icon" onClick={this.toggleMenu}>
                    <img src="/images/three-lines.png"></img>
                </a>          
            </div>
        )
    }
}

export default MainMenu;
