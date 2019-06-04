import React, { Component } from "react";
import {
    Route
} from "react-router-dom";
import Modal from 'react-modal';
import { withRouter } from 'react-router';

import './Extensions/Array';

import ApiManager from './ApiManager';
import ErrorHandler from './ErrorHandler';

import MainMenu from "./components/MainMenu/MainMenu";
import Viewer from './components/Viewer/Viewer';
import Home from "./components/Home/Home";
import About from "./components/About/About";
import Products from "./components/Products/Products";
import Login from './components/Login/Login';
import Sector from './components/Sectors/Sectors';
import Gallery from './components/Gallery/Gallery';
import Account from './components/Account/Account';

import "./App.css";

const localStorageUserItem = 'user';

class App extends Component {
  constructor(props, context) {
    super(props, context)
    document.title = "Ellipsis Earth Intelligence";

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
    var x = document.getElementById("main-menu");
    x.className = "";
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
        <div className="App" onClick={this.closeMenu}>
          <MainMenu
            user={this.state.user}
            language={this.state.language}
            localization={this.state.localization}
            onLanguageChange={this.onLanguageChange}
          />
          <div className="content" ref={ref => this.el = ref}>
            <Route exact path="/"
              render={() =>
                <Home
                  language={this.state.language}
                />
              }
            />
            <Route
              path="/viewer"
              render={() =>
                <Viewer 
                  user={this.state.user}
                  language={this.state.language}
                  localization={this.state.localization}
                />
              }
            />
            <Route path="/products"
              render={() =>
                <Products
                  language={this.state.language}
                  localization={this.state.localization}
                />
              }
            />
            <Route
              path="/sectors"
              render={() =>
                <Sector
                  language={this.state.language}
                  localization={this.state.localization}
                />
              }
            />
            <Route
              path="/gallery"
              render={() =>
                <Gallery
                  language={this.state.language}
                  localization={this.state.localization}
                />
              }
            />
            <Route
              path="/about"
              render={() =>
                <About
                  language={this.state.language}
                  localization={this.state.localization}
                />
            }
            />
            <Route
              path="/login"
              render={() =>
                <Login
                  onLogin={this.onLogin}
                  language={this.state.language}
                  localization={this.state.localization}
                />
              }
            />
            <Route
              path="/account"
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
        </div>
      );
    }
    else {
      return null;
    }
  }

}

export default withRouter(App);
