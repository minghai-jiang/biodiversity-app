import React, { PureComponent } from 'react';
import { NavLink, Redirect } from 'react-router-dom';

class AccountDashboard extends PureComponent {
  constructor(props, context) {
    super(props, context);
  }

  logout = () => {
    this.props.onLogout();
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
          Account Management
        </h1>

        <div className='login-input-label-div'>
          <NavLink to='/account/changePassword' className="button-a">
            <div className="button button-accented main-block-single-button">
              Change password
            </div>
          </NavLink>    
        </div>

        <div className='login-input-label-div'>
          <NavLink to='/account/changeEmail' className="button-a">
            <div className="button button-accented main-block-single-button">
              Change email
            </div>
          </NavLink>    
        </div>

        <br/>

        <div className='login-input-label-div'>
          <div className="button-a" onClick={this.logout.bind(this)}>
            <div className="button button-accented main-block-single-button">
              Logout
            </div>
          </div>    
        </div>
      </div>
    );
  }
}

export default AccountDashboard;
