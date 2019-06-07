import React, { Component } from 'react';
import {
    Route
} from 'react-router-dom';
import Modal from 'react-modal';
import { withRouter } from 'react-router';

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import teal from '@material-ui/core/colors/teal';

import ApiManager from './ApiManager';
import ErrorHandler from './ErrorHandler';

import MainMenu from './Components/MainMenu/MainMenu';
import Viewer from './Components/Viewer/Viewer';
import Home from './Components/Home/Home';
import About from './Components/About/About';
import Products from './Components/Products/Products';
import Login from './Components/Login/Login';
import Sector from './Components/Sectors/Sectors';
import Gallery from './Components/Gallery/Gallery';
import Account from './Components/Account/Account';

import './App.css';

const localStorageUserItem = 'user';

const theme = createMuiTheme({
  palette: {
    primary: teal
  },
});

class App extends Component {
  constructor(props, context) {
    super(props, context)
    document.title = 'Ellipsis Earth Intelligence';

    this.state = {
      init: false,
      user: null,
    };
  }

  componentDidMount() {
    Modal.setAppElement('body');

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
    if (this.state.init) {
      return (
        <div className='App' onClick={this.closeMenu}>
          <ThemeProvider theme={theme}>
            <MainMenu
              user={this.state.user}
              language={this.state.language}
              localization={this.state.localization}
              onLanguageChange={this.onLanguageChange}
            />
            <div className='content' ref={ref => this.el = ref}>
              <Route exact path='/'
                render={() =>
                  <Home
                    language={this.state.language}
                  />
                }
              />
              <Route
                path='/viewer'
                render={() =>
                  <Viewer 
                    user={this.state.user}
                    language={this.state.language}
                    localization={this.state.localization}
                  />
                }
              />
              <Route path='/products'
                render={() =>
                  <Products
                    language={this.state.language}
                    localization={this.state.localization}
                  />
                }
              />
              <Route
                path='/sectors'
                render={() =>
                  <Sector
                    language={this.state.language}
                    localization={this.state.localization}
                  />
                }
              />
              <Route
                path='/gallery'
                render={() =>
                  <Gallery
                    language={this.state.language}
                    localization={this.state.localization}
                  />
                }
              />
              <Route
                path='/about'
                render={() =>
                  <About
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
    else {
      return null;
    }
  }

}

export default withRouter(App);
