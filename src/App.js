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
import PointCard from './pages/detail/MinePageChild/PointCard';
import StoredCard from './pages/detail/MinePageChild/StoredCard';
import Voucher from './pages/detail/MinePageChild/Voucher';


import AddressEdit from './pages/detail/MinePageChild/AddressEdit';
import AddressList from './pages/detail/MinePageChild/AddressList';
import Contact from './pages/detail/MinePageChild/Contact';
import { getConfig, getQueryString, getOpenId } from '@/utils/global_api';
import globalVal from '@/utils/global_val';

import 'antd-mobile/dist/antd-mobile.css';
import './App.css';

getConfig().then(config => {
  globalVal.config = config;
});


class App extends Component {
  componentWillMount() {
    this.getCode();
  }

  async getCode() { // 非静默授权，第一次有弹框
    const code = getQueryString('code'); // 截取路径中的code，如果没有就去微信授权，如果已经获取到了就直接传code给后台获取openId
    if (code == null || code === '') {
      const local = window.location.href;
      window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + window.APPID + '&redirect_uri=' + encodeURIComponent(local) + '&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect'
    } else {
      const data = await getOpenId(code); //把code传给后台获取用户信息
      globalVal.wxInitParams.openId = data.openId;
    }
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Route path="/" exact component={MainPage} />
          <Route path="/LoginPage" exact component={LoginPage} />
          <Route path="/RegPage" exact component={RegPage} />
          <Route path="/PointCard" exact component={PointCard} />
          <Route path="/StoredCard" exact component={StoredCard} />
          <Route path="/Voucher" exact component={Voucher} />
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
