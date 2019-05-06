import React, { Component } from "react";
import {
    Route
} from "react-router-dom";

import AccountManagement from './Management/Management';
import ChangePassword from './ChangePassword/ChangePassword';
import ChangeEmail from './ChangeEmail/ChangeEmail';
import ResetPassword from './ResetPassword/ResetPassword';
import Register from './Register/Register';
import MapManagement from './MapManagement/MapManagement';
import { Footer } from '../footer/footer';

import "./Account.css";

export class Account extends Component {
  render() {
    return (
      <div>
        <div className="main-content">
          <Route 
            exact 
            path="/account" 
            render={() => 
              <div>
                {this.props.localization['AccountManagement']}
              </div>
            } 
          />
          <Route 
            path="/account/management" 
            render={() => 
              <AccountManagement 
                apiUrl={this.props.apiUrl} 
                language={this.props.language} 
                localization={this.props.localization}
                user={this.props.user}
                onLogout={this.props.onLogout}
              />
            } 
          />
          <Route 
            path="/account/changePassword" 
            render={() => 
              <ChangePassword 
                apiUrl={this.props.apiUrl} 
                language={this.props.language} 
                localization={this.props.localization}
                user={this.props.user}
              />
            } 
          />
          <Route 
            path="/account/changeEmail" 
            render={() => 
              <ChangeEmail 
                apiUrl={this.props.apiUrl} 
                language={this.props.language} 
                localization={this.props.localization}
                user={this.props.user}
              />
            } 
          />
          <Route 
            path="/account/register" 
            render={() => 
              <Register 
                apiUrl={this.props.apiUrl} 
                language={this.props.language} 
                localization={this.props.localization}
              />
            } 
          />
          <Route 
            path="/account/resetPassword" 
            render={() => 
              <ResetPassword 
                apiUrl={this.props.apiUrl} 
                language={this.props.language} 
                localization={this.props.localization}
              />
            } 
          />
          <Route 
            path="/account/mapManagement" 
            render={() => 
              <MapManagement 
                apiUrl={this.props.apiUrl} 
                language={this.props.language} 
                localization={this.props.localization}
                user={this.props.user}
                onLogout={this.props.onLogout}
              />
            } 
          />
        </div>
        <Footer></Footer>
      </div>
    )
  }
}

export default Account;
