import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import './Footer.css';

export class Footer extends Component {

  render() {
    return (
      <footer className='footer'>
        <div className='footer-content'>
          <NavLink to='/'>
              <img className='footer-logo' src='/images/logo-white.png' alt='Ellipsis Earth Intelligence logo white'/>
          </NavLink>
          <br/>
          info@ellipsis-earth.com
        </div>
      </footer>
  )
  }
}

export default Footer;
