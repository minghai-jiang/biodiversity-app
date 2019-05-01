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
          Change email
        </h1>
        {
          this.state.success ?
          <div className='main-content'>
            <h2>Success</h2>
            <p>
              We have sent you an e-mail to validate your e-mail address. Please follow the procedures in the mail.
            </p>
            <div>
              <NavLink to='/account/dashboard' style={{fontSize: '12pt'}}>
                Dashboard
              </NavLink>          
            </div>
          </div>
          :
          <form>
            <div className='login-input-label-div'>
              <div>
                New email
              </div>
              <div>
                <input className='login-input' type='email' tabIndex={0} ref='newEmailInput'></input>
              </div>
            </div>

            <div className='login-input-label-div' onClick={this.changeEmail.bind(this)} onKeyUp={this.onEnter.bind(this)}>
              <div className="button main-block-single-button" tabIndex={0}>
                Change email                                               
              </div>
            </div>
          </form>
        }
      </div>
    );
  }
}

export default ChangeEmail;
