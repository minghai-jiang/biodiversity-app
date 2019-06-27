import React, { PureComponent } from 'react';
import { NavLink } from 'react-router-dom';

import Footer from '../Footer/Footer';

import './Login.css';

import ApiManager from '../../ApiManager';
import ErrorHandler from '../../ErrorHandler';

class Login extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {

    };
  }

  login = () => {
    let username = this.refs.usernameInput.value;
    let password = this.refs.passwordInput.value;

    if (username === '' || password === '') {
      return;
    }

    username = username.toLowerCase();

    let body ={
      username: username,
      password: password
    };

    ApiManager.post(`/account/login`, body)
      .then(data => {
        let token = data.token;
        let user = {
          username: username,
          token: token,
        };

        this.props.onLogin(user);
      })
      .catch(error => {
        ErrorHandler.alert(error);
      });
  }

  onEnter = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.login();
    }
  }

  render() {
    return (
      <div>
        <div className='main-content'>
          <h1 className='account-title'>
            {this.props.localization['Login']}
          </h1>
          <form>
            <div className='login-input-label-div'>
              <div>
                {this.props.localization['Username']}
              </div>
              <div>
                <input className='login-input' tabIndex={0} ref='usernameInput'></input>
              </div>
            </div>
            <div className='login-input-label-div'>
              <div>
                {this.props.localization['Password']}
              </div>
              <div>
                <input className='login-input' tabIndex={0} type='password' ref='passwordInput' onKeyUp={this.onEnter.bind(this)}></input>
              </div>
            </div>
            <div className='login-input-label-div' onClick={this.login.bind(this)} onKeyUp={this.onEnter.bind(this)}>
              <div className="button main-block-single-button" tabIndex={0}>
                {this.props.localization['Login']}                                               
              </div>
            </div>
          </form>
          <div>
            <NavLink to='/account/register' style={{fontSize: '12pt'}}>
              {this.props.localization['SignUp']}
            </NavLink>          
          </div>
          <div>
            <NavLink to='/account/resetPassword' style={{fontSize: '12pt'}}>
              {this.props.localization['ForgotPasswordQuestion']}
            </NavLink>          
          </div>
        </div>
        <Footer></Footer>
      </div>
    );
  }
}

export default Login;
