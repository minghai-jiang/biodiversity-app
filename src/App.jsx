import React, { Component } from "react";
import {
    Route
} from "react-router-dom";
import Modal from 'react-modal';
import { withRouter } from 'react-router';

import MainMenu from "./components/MainMenu/MainMenu";

import Viewer from './components/Viewer/Viewer';
import Home from "./components/Home/Home";
import About from "./components/About/About";
import Contact from "./components/contact/contact";
import Products from "./components/Products/Products";
import Login from './components/Login/Login';
import Sector from './components/Sectors/Sectors';
import Gallery from './components/Gallery/Gallery';
import Account from './components/Account/Account';

import "./App.css";

const localStorageUserItem = 'user';

const apiUrl = "https://api.ellipsis-earth.com/";
const publicFilesUrl = "https://public.ellipsis-earth.com/";

//const apiUrl = "https://dev.api.ellipsis-earth.com/";
// const publicFilesUrl = "https://dev.public.ellipsis-earth.com/";

// const apiUrl = "http://localhost:7552/";
// const publicFilesUrl = "http://localhost:3000/";

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

    if (userJson) {
      user = JSON.parse(userJson);

      fetch(
        `${apiUrl}account/validateLogin`,
        {
          method: 'GET',
          headers: {
            "Authorization": "Bearer " + user.token
          }
        }
      )
      .then(response => {
        if (response.ok) {
          this.setState({ user: user, init: true });
        }
        else {
          this.setState({ init: true });
          localStorage.removeItem(localStorageUserItem);
        }
      })
      .catch(error => {
        this.setState({ init: true });
        localStorage.removeItem(localStorageUserItem);
      });
    }
    else {
      this.setState({ init: true });
    }
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
        alert(err);
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
                <Viewer apiUrl={apiUrl} user={this.state.user}/>
              }
            />
            <Route path="/products"
              render={() =>
                <Products
                  publicFilesUrl={publicFilesUrl}
                  language={this.state.language}
                  localization={this.state.localization}
                />
              }
            />
            <Route
              path="/sectors"
              render={() =>
                <Sector
                  publicFilesUrl={publicFilesUrl}
                  language={this.state.language}
                  localization={this.state.localization}
                />
              }
            />
            <Route
              path="/gallery"
              render={() =>
                <Gallery
                  publicFilesUrl={publicFilesUrl}
                  language={this.state.language}
                  localization={this.state.localization}
                />
              }
            />
            <Route
              path="/about"
              render={() =>
                <About
                  publicFilesUrl={publicFilesUrl}
                  language={this.state.language}
                  localization={this.state.localization}
                />
            }
            />
            <Route path="/contact" component={Contact} />
            <Route
              path="/login"
              render={() =>
                <Login
                  apiUrl={apiUrl}
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
                  apiUrl={apiUrl}
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
