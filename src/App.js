import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import MainPage from './pages/main';
import LoginPage from './pages/account/LoginPage';
import RegPage from './pages/account/RegPage';
import ProductList from './pages/detail/Product/ProductList';
import ProductDetail from './pages/detail/Product/ProductDetail';
import OrderDetail from './pages/detail/OrderDetail';
import OrderPlace from './pages/detail/OrderPlace';


import 'antd-mobile/dist/antd-mobile.css';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Route path="/" exact component={MainPage} />
          <Route path="/LoginPage" exact component={LoginPage} />
          <Route path="/RegPage" exact component={RegPage} />

          <Route path="/ProductList" exact component={ProductList} />
          <Route path="/ProductDetail" exact component={ProductDetail} />

          <Route path="/OrderDetail" exact component={OrderDetail} />
          <Route path="/OrderPlace" exact component={OrderPlace} />
        </div>
      </Router>
    );
  }
}

export default App;
