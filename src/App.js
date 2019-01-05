import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import MainPage from './pages/main';
import LoginPage from './pages/account/LoginPage';
import RegPage from './pages/account/RegPage';
import ProductList from './pages/detail/Product/ProductList';
import ProductDetail from './pages/detail/Product/ProductDetail';
import OrderDetail from './pages/detail/OrderDetail';
import OrderPlace from './pages/detail/OrderPlace';
import CitySelector from './pages/detail/CitySelector';
import CardAndDiscount from './pages/detail/MinePageChild/CardAndDiscount';
import AddressEdit from './pages/detail/MinePageChild/AddressEdit';
import AddressList from './pages/detail/MinePageChild/AddressList';
import Contact from './pages/detail/MinePageChild/Contact';


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
          <Route path="/CardAndDiscount" exact component={CardAndDiscount} />
          <Route path="/AddressEdit" exact component={AddressEdit} />
          <Route path="/AddressList" exact component={AddressList} />
          <Route path="/Contact" exact component={Contact} />

          <Route path="/ProductList" exact component={ProductList} />
          <Route path="/ProductDetail" exact component={ProductDetail} />

          <Route path="/OrderDetail" exact component={OrderDetail} />
          <Route path="/OrderPlace" exact component={OrderPlace} />

          <Route path="/CitySelector" exact component={CitySelector} />
        </div>
      </Router>
    );
  }
}

export default App;
