import React, { Component } from "react";
import {
    Route
} from "react-router-dom";
import Modal from 'react-modal';
import { withRouter } from 'react-router';

import MainMenu from "./components/MainMenu/MainMenu";

import Viewer from './components/Viewer/Viewer';
import Home from "./components/home/home";
import About from "./components/about/about";
import Contact from "./components/contact/contact";
import Products from "./components/products/products";
import Login from './components/Login/Login';

import "./App.css";

const localStorageUserItem = 'user';

const apiUrl = "https://dev.api.ellipsis-earth.com/";

class App extends Component {
  constructor(props, context) {
    super(props, context)
    document.title = "Ellipsis Earth Intelligence";

    this.state = {
      user: null
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
          onLogout={this.onLogout}
        />
        <div className="content" ref={ref => this.el = ref}>
          <Route exact path="/" component={Home}/>
          <Route 
            path="/maps" 
            render={() => 
              <Viewer apiUrl={apiUrl} user={this.state.user}/>
            } 
          />
          <Route path="/products" component={Products}/>
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
