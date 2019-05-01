import React, { PureComponent } from 'react';
import { NavLink } from 'react-router-dom';

class Register extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      success: false
    };
  }

  register = () => {
    let username = this.refs.usernameInput.value;
    let password = this.refs.passwordInput.value;
    let repeatPassword = this.refs.repeatPasswordInput.value;
    let email = this.refs.emailInput.value;

    if (username === '' || password === '' || repeatPassword === '' || email === '') {
      return;
    }

    if (password !== repeatPassword) {
      alert('Password and the repeat password do not match.');
      return;
    }

    let bodyJson = JSON.stringify({
      username: username,
      password: password,
      email: email
    });

    fetch(
      `${this.props.apiUrl}account/register`,
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },  
        body: bodyJson
      }
    )
    .then(async response => {      
      if (response.ok) {
        this.setState({ success: true });
      }
      else {
        let errorJson = await response.json();
        throw new Error(`Status: ${errorJson.status}\n${errorJson.message}`);
      }
    })
    .catch(error => {
      alert(error);
    });
  }

  onEnter = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      this.register();
    }
  }

  render() {
    return (
      <div className="login-block">
        <h1 className='account-title'>
          Register
        </h1>
        {
          this.state.success ?
            <div className='main-content'>
              <h2>Registration success</h2>
              <p>
                We have sent you an e-mail to validate your e-mail address. Please follow the procedures in the mail.
              </p>
              <p>
                You can now login using the your credentials.
              </p>
              <div>
                <NavLink to='/login' style={{fontSize: '12pt'}}>
                  Login
                </NavLink>          
              </div>
            </div>
            :
            <form>
              <div className='login-input-label-div'>
                <div>
                  Username
                </div>
                <div>
                  <input className='login-input' tabIndex={0} ref='usernameInput'></input>
                </div>                
              </div>
              <div className='login-input-label-div'>
                <div>
                  Password
                </div>
                <div>
                  <input className='login-input' tabIndex={0} type='password' ref='passwordInput'></input>
                </div>
              </div>

              <div className='login-input-label-div'>
                <div>
                  Repeat password
                </div>
                <div>
                  <input className='login-input' tabIndex={0} type='password' ref='repeatPasswordInput' onKeyUp={this.onEnter.bind(this)}></input>
                </div>
              </div>

              <div className='login-input-label-div'>
                <div>
                  E-mail
                </div>
                <div>
                  <input className='login-input' tabIndex={0} type='email' ref='emailInput' onKeyUp={this.onEnter.bind(this)}></input>
                </div>
              </div>
              <div className='login-input-label-div' onClick={this.register.bind(this)} onKeyUp={this.onEnter.bind(this)}>
                <div className="button main-block-single-button" tabIndex={0}>
                  Register                                               
                </div>
              </div>
            </form>
        }

      </div>
    );
  }
}

export default Register;
