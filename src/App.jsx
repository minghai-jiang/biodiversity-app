import React, { Component } from 'react';
import {
    Route
} from 'react-router-dom';
import Modal from 'react-modal';
import { withRouter } from 'react-router';

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import teal from '@material-ui/core/colors/teal';
import grey from '@material-ui/core/colors/grey';

import ApiManager from './ApiManager';
import ErrorHandler from './ErrorHandler';

import MainMenu from './Components/MainMenu/MainMenu';
import Viewer from './Components/Viewer/Viewer';
import Login from './Components/Login/Login';
import Account from './Components/Account/Account';

import './App.css';

const localStorageUserItem = 'user';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#b3ce8c'
    },
    secondary: {
      main: '#f5f5f5'
    }
  },
});

class App extends Component {
  constructor(props, context) {
    super(props, context)
    document.title = 'Biodiversiteitsmonitor';

    this.state = {
      init: false,
      hideMenu: false,

      user: null,
    };
  }

  componentDidMount() {
    Modal.setAppElement('body');

    let url = new URL(window.location.href);
    let hideMenu = url.searchParams.get('hideMenu') === '1';

    this.setState({ hideMenu: hideMenu });

    this.retrieveLanguage()
      .then(() => {
        return this.retrieveUser();
      });
  }

  closeMenu = () => {
    var x = document.getElementById('main-menu');
    x.className = '';
  }

  retrieveUser = async () => {
    let user = null;
    let userJson = localStorage.getItem(localStorageUserItem);

    if (!userJson) {
      this.setState({ init: true });
      return;
    }

    user = JSON.parse(userJson);

    ApiManager.get(`/account/validateLogin`, null, user)
      .then(() => {
        if (user.username) {
          user.username = user.username.toLowerCase();
        }
        
        this.setState({ user: user, init: true });
      })
      .catch(() => {
        this.setState({ init: true });
        localStorage.removeItem(localStorageUserItem);
      });    
  }

  retrieveLanguage = async () => {
    let language = localStorage.getItem('language');
    if (!language) {
      language = 'english';
    }

    await this.setLanguage(language);
  }

  setLanguage = async (language) => {
    await fetch('/localization/' + language + '.json')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
      })
      .then(json => {
        localStorage.setItem('language', language);
        this.setState({
          language: language,
          localization: json
        });
      })
      .catch(err => {
        ErrorHandler.alert(err);
      });
  }

  onLogin = (user) => {
    localStorage.setItem(localStorageUserItem, JSON.stringify(user));
    this.setState({ user: user }, () => {
      this.props.history.push('/');
    });
  }

  onLogout = () => {
    localStorage.removeItem(localStorageUserItem);
    this.setState({ user: null });
  }

  onLanguageChange = (language) => {
    if (language !== this.state.language) {
      this.setLanguage(language);
    }
  }

  render() {
    if (!this.state.init) {
      return null;
    }

    let contentClassName = 'content';
    if (this.state.hideMenu) {
      contentClassName += ' content-full';
    }

    return (
      <div className='App' onClick={this.closeMenu}>
        <ThemeProvider theme={theme}>
          {
            this.state.hideMenu ? 
              null :
              <MainMenu
                user={this.state.user}
                language={this.state.language}
                localization={this.state.localization}
                onLanguageChange={this.onLanguageChange}
              />
          }

          <div className={contentClassName} ref={ref => this.el = ref}>
            <Route exact path='/'
              render={() =>
                <Viewer 
                  user={this.state.user}
                  language={this.state.language}
                  localization={this.state.localization}
                />
              }
            />
            <Route
              path='/login'
              render={() =>
                <Login
                  onLogin={this.onLogin}
                  language={this.state.language}
                  localization={this.state.localization}
                />
              }
            />
            <Route
              path='/account'
              render={() =>
                <Account
                  user={this.state.user}
                  language={this.state.language}
                  localization={this.state.localization}
                  onLogout={this.onLogout}
                />
              }
            />
          </div>
        </ThemeProvider>          
      </div>
    );
    
  }

}

export default withRouter(App);
