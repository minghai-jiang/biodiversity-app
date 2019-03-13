import React, { Component } from "react";
import {
    Route
} from "react-router-dom";
import Modal from 'react-modal';
import { withRouter } from 'react-router';

import MainMenu from "./components/MainMenu/MainMenu";

import Viewer from './components/Viewer/Viewer';
import Home from "./components/Home/Home";
import About from "./components/about/about";
import Contact from "./components/contact/contact";
import Products from "./components/Products/Products";
import Login from './components/Login/Login';
import Sector from './components/Sectors/Sectors';
import Gallery from './components/Gallery/Gallery'

import "./App.css";

const localStorageUserItem = 'user';

const apiUrl = "https://api.ellipsis-earth.com/";
//const publicFilesUrl = "https://public.ellipsis-earth.com/";

// const apiUrl = "https://dev.api.ellipsis-earth.com/";
// const publicFilesUrl = "https://dev,public.ellipsis-earth.com/";

//const apiUrl = "http://localhost:7552/";
const publicFilesUrl = "http://localhost:3000/";

class App extends Component {
  constructor(props, context) {
    super(props, context)
    document.title = "Ellipsis Earth Intelligence";

    let language = localStorage.getItem(localStorageUserItem);
    if (!language) {
      language = 'english';
    }

    this.state = {
      user: null,
      language: language
    };


    this.retrieveUser();
  }

  componentDidMount() {
    Modal.setAppElement(this.el);
  }

  closeMenu = () => {
    var x = document.getElementById("main-menu");
    x.className = "";
  }

  retrieveUser = () => {
    let user = null;
    let userJson = localStorage.getItem(localStorageUserItem);

    if (userJson) {
      user = JSON.parse(userJson);

      fetch(
        `${apiUrl}account/ping`,
        {
          method: 'GET',
          headers: {
            "Authorization": "BEARER " + user.token
          }
        }
      )
      .then(response => {
        if (response.ok) {
          this.setState({ user: user });
        }
        else {
          localStorage.removeItem(localStorageUserItem);
        }
      })
      .catch(error => {
        localStorage.removeItem(localStorageUserItem);
      });
    }
  }

  retrieveLanguage = () => {

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

  render() {
    return (
      <div className="App" onClick={this.closeMenu}>
        <MainMenu
          user={this.state.user}
          language={this.state.language}
          onLogout={this.onLogout}
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
          <Route path="/Products" 
            render={() =>
              <Products 
                publicFilesUrl={publicFilesUrl} 
                language={this.state.language}
              />
            }
          />
          <Route 
            path="/Sectors" 
            render={() => 
              <Sector 
                publicFilesUrl={publicFilesUrl}
                language={this.state.language}
              />
            }
          />
          <Route 
            path="/Gallery" 
            render={() => 
              <Gallery 
                publicFilesUrl={publicFilesUrl}
                language={this.state.language}                
              />
            }
          />
          <Route path="/about" component={About}/>
          <Route path="/contact" component={Contact} />
          <Route 
            path="/login" 
            render={() => 
              <Login apiUrl={apiUrl} onLogin={this.onLogin}/> 
            }
          />
        </div>               
      </div>   
    );
  }
}

export default withRouter(App);
