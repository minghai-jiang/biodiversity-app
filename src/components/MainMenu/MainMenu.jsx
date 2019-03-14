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

  logout = () => {
    this.props.onLogout();
  }

  changeLanguage = (language) => {
    debugger;
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
              <img className="main-menu-logo" src="/images/logo-white.png" alt="Ellipsis Earth Intelligence logo white"/>
            </NavLink>
          </li>
          <li>
            <NavLink to="/viewer" className="main-menu-item">
              {this.props.localization['Viewer']}
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className="main-menu-item">
              {this.props.localization['Products']}
            </NavLink>
          </li>
          <li>
            <NavLink to="/sectors" className="main-menu-item">
              {this.props.localization['Sectors']}
            </NavLink>
          </li>
          <li>
            <NavLink to="/gallery" className="main-menu-item">
              {this.props.localization['Gallery']}
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className="main-menu-item">
              {this.props.localization['AboutUs']}
            </NavLink>
          </li>
          <li style={{float: "right"}}>              
            <a class="main-menu-item dropdown">
              <button class="dropbtn">
                Language 
              </button>
              <div class="dropdown-content">
                <a href="#" onClick={() => this.changeLanguage('english')}>English</a>
                <a href="#" onClick={() => this.changeLanguage('spanish')}>Spanish</a>
              </div>
            </a> 
          </li>
          <li style={{display: this.props.user ? 'none' : 'block', float: "right"}}>
            <NavLink to="/login" className="main-menu-item">
              {this.props.localization['Login']}
            </NavLink>
          </li>

          <li style={{display: this.props.user ? 'block' : 'none', float: "right"}}>              
            <a className='main-menu-item' style={{cursor: 'pointer'}} onClick={this.logout.bind(this)}>Logout</a>
          </li>
          <li style={{display: this.props.user ? 'block' : 'none', float: "right"}}>              
            <a className='main-menu-item no-hover'>{this.props.user ? this.props.user.username : ''}</a>
            {/* {this.props.user.username} */}
          </li>
        </ul> 
        <a href="javascript:void(0);" className="icon" onClick={this.toggleMenu}>
          <img alt="hamburger-menu" src="/images/three-lines.png"></img>
        </a>          
      </div>
    )
  }
}

export default MainMenu;
