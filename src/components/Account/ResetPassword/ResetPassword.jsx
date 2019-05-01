import React, { PureComponent } from 'react';
import { NavLink } from 'react-router-dom';

class ResetPassword extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      success: false
    };
  }

  resetPassword = () => {
    let email = this.refs.emailInput.value;

    if (email === '') {
      return;
    }

    let bodyJson = JSON.stringify({
      email: email
    });

    fetch(
      `${this.props.apiUrl}account/resetPassword`,
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
      this.resetPassword();
    }
  }

  render() {
    return (
      <div className="login-block">
        <h1 className='account-title'>
          {this.props.localization["ResetPassword"]}
        </h1>
        {
          this.state.success ?
          <div className='main-content'>
            <h2>{this.props.localization["Success"]}</h2>
            <p>
              {this.props.localization["ResetPasswordSuccessMessage1"]}
            </p>
            <p>
              {this.props.localization["ResetPasswordSuccessMessage2"]}
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
                {this.props.localization["Email"]}
              </div>
              <div>
                <input className='login-input' type='email' tabIndex={0} ref='emailInput'></input>
              </div>
            </div>
            <div className='login-input-label-div' onClick={this.resetPassword.bind(this)} onKeyUp={this.onEnter.bind(this)}>
              <div className="button main-block-single-button" tabIndex={0}>
                {this.props.localization["ResetPassword"]}                                              
              </div>
            </div>
          </form>
        }

      </div>
    );
  }
}

export default ResetPassword;
