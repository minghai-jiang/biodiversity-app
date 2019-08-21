import React, { Component } from "react";
import { NavLink } from "react-router-dom";

import "./MainMenu.css";

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

  // logout = () => {
  //   this.props.onLogout();
  // }

  changeLanguage = (language) => {
    if (this.props.onLanguageChange) {
      this.props.onLanguageChange(language);
    }
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
            <NavLink exact to="/" className="main-menu-logo-item">
              <img className="main-menu-logo" src="/images/Logo_wide_small.png" alt="logo Biodiversiteitsmonitor"/>
            </NavLink>
          </li>
          <li style={{display: this.props.user ? 'none' : 'block', float: "right"}}>
            <NavLink to="/login" className="main-menu-item">
              <span >
                {this.props.localization['Login']}
              </span>
            </NavLink>
          </li>

          {/* <li style={{display: this.props.user ? 'block' : 'none', float: "right"}}>
            <a className='main-menu-item' style={{cursor: 'pointer'}} onClick={this.logout.bind(this)}>Logout</a>
          </li> */}

          <li style={{display: this.props.user ? 'block' : 'none', float: "right"}}>
            <NavLink to="/account/management" className="main-menu-item">
              {this.props.user ? this.props.user.username : ''}
            </NavLink>
          </li>
        </ul>
        <a href={void(0)} className="icon" onClick={this.toggleMenu}>
          <img alt="hamburger-menu" src="/images/three-lines.png"></img>
        </a>
      </div>
    )
  }
}

export default MainMenu;
