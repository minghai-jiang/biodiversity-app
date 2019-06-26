import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import ProductsHome from './Home/Home';
import ProductsDocumentation from './Documentation/Documentation';
import ProductsTutorial from './Tutorial/Tutorial';

import Footer from '../Footer/Footer';

import './Products.css';

export class Products extends Component {
  render() {
    return (
      <div>
        <div className='main-content'>
          <Route
            exact
            path='/products'
            render={() =>
              <ProductsHome language={this.props.language} localization={this.props.localization}/>
            }
          />
          <Route
            path='/products/documentation'
            render={() =>
              <ProductsDocumentation language={this.props.language}/>
            }
          />
          <Route
            path='/products/tutorial'
            render={() =>
              <ProductsTutorial language={this.props.language}/>
            }
          />
        </div>
        <Footer></Footer>
      </div>
    )
  }
}

export default Products;
