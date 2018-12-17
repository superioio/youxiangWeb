import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import MainPage from './pages/main';
import LoginPage from './pages/account/LoginPage';
import RegPage from './pages/account/RegPage';
import ForgotPassPage from './pages/account/ForgotPassPage';
import ProductList from './pages/detail/Product/ProductList';
import OrderDetail from './pages/detail/OrderDetail';

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
          <Route path="/ForgotPassPage" exact component={ForgotPassPage} />

          <Route path="/ProductList" exact component={ProductList} />

          <Route path="/OrderDetail" exact component={OrderDetail} />
        </div>
      </Router>
    );
  }
}

export default App;
