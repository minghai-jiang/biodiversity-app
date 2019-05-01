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
          {this.props.localization["Register"]}
        </h1>
        {
          this.state.success ?
            <div className='main-content'>
              <h2>{this.props.localization["Success"]}</h2>
              <p>
                {this.props.localization["RegisterSuccessMessage1"]}
              </p>
              <p>
                {this.props.localization["RegisterSuccessMessage2"]}
              </p>
              <div>
                <NavLink to='/login' style={{fontSize: '12pt'}}>
                  {this.props.localization["Login"]}
                </NavLink>          
              </div>
            </div>
            :
            <form>
              <div className='login-input-label-div'>
                <div>
                  {this.props.localization["Username"]}
                </div>
                <div>
                  <input className='login-input' tabIndex={0} ref='usernameInput'></input>
                </div>                
              </div>
              <div className='login-input-label-div'>
                <div>
                  {this.props.localization["Password"]}
                </div>
                <div>
                  <input className='login-input' tabIndex={0} type='password' ref='passwordInput'></input>
                </div>
              </div>

              <div className='login-input-label-div'>
                <div>
                  {this.props.localization["PasswordRepeat"]}
                </div>
                <div>
                  <input className='login-input' tabIndex={0} type='password' ref='repeatPasswordInput' onKeyUp={this.onEnter.bind(this)}></input>
                </div>
              </div>

              <div className='login-input-label-div'>
                <div>
                  {this.props.localization["Email"]}
                </div>
                <div>
                  <input className='login-input' tabIndex={0} type='email' ref='emailInput' onKeyUp={this.onEnter.bind(this)}></input>
                </div>
              </div>
              <div className='login-input-label-div' onClick={this.register.bind(this)} onKeyUp={this.onEnter.bind(this)}>
                <div className="button main-block-single-button" tabIndex={0}>
                  {this.props.localization["Register"]}                                               
                </div>
              </div>
            </form>
        }

      </div>
    );
  }
}

export default Register;
