import React, { PureComponent } from 'react';
import { NavLink, Redirect } from 'react-router-dom';

class ChangeEmail extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      success: false
    };
  }

  changeEmail = () => {
    let newEmail = this.refs.newEmailInput.value;

    if (newEmail === '') {
      return;
    }

    let bodyJson = JSON.stringify({
      newEmail: newEmail
    });

    fetch(
      `${this.props.apiUrl}account/changeEmail`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.props.user.token
        },  
        body: bodyJson
      }
    )
    .then(async (response) => {      
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
      this.changeEmail();
    }
  }

  render() {
    if (!this.props.user) {
      return (
        <Redirect to='/login'></Redirect>
      )
    }

    return (
      <div className="login-block">
        <h1 className='account-title'>
          {this.props.localization["ChangeEmail"]}
        </h1>
        {
          this.state.success ?
          <div className='main-content'>
            <h2>{this.props.localization["Success"]}</h2>
            <p>
              {this.props.localization["ChangeEmailSuccessMessage"]}
            </p>
            <div>
              <NavLink to='/account/management' style={{fontSize: '12pt'}}>
                {this.props.localization["AccountManagement"]}
              </NavLink>          
            </div>
          </div>
          :
          <form>
            <div className='login-input-label-div'>
              <div>
                {this.props.localization['NewEmail']}
              </div>
              <div>
                <input className='login-input' type='email' tabIndex={0} ref='newEmailInput'></input>
              </div>
            </div>

            <div className='login-input-label-div' onClick={this.changeEmail.bind(this)} onKeyUp={this.onEnter.bind(this)}>
              <div className="button main-block-single-button" tabIndex={0}>
                {this.props.localization["ChangeEmail"]}                                               
              </div>
            </div>
          </form>
        }
      </div>
    );
  }
}

export default ChangeEmail;
