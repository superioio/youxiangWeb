import React, { Component } from 'react';
import { TabBar } from 'antd-mobile';
import HomePage from './components/HomePage';
import OrderPage from './components/OrderPage';
import MinePage from './components/MinePage';
import styles from './styles.module.css';

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'homeTab',
    };
  }

  render() {
    return (
      <div className={styles.container}>
        <TabBar
          unselectedTintColor="#949494"
          tintColor="#33A3F4"
          barTintColor="white"
        >
          <TabBar.Item
            title="首页"
            key="home"
            icon={<div className={styles.homeTabIcon} />}
            selectedIcon={<div className={styles.homeTabSelectedIcon} />}
            selected={this.state.selectedTab === 'homeTab'}
            onPress={() => {
              this.setState({
                selectedTab: 'homeTab',
              });
            }}
          >
            <HomePage />
          </TabBar.Item>
          <TabBar.Item
            title="订单"
            key="order"
            icon={<div className={styles.orderTabIcon} />}
            selectedIcon={<div className={styles.orderTabSelectedIcon} />}
            selected={this.state.selectedTab === 'orderTab'}
            onPress={() => {
              this.setState({
                selectedTab: 'orderTab',
              });
            }}
          >
            <OrderPage />
          </TabBar.Item>
          <TabBar.Item
            title="我的"
            key="mine"
            icon={<div className={styles.mineTabIcon} />}
            selectedIcon={<div className={styles.mineTabSelectedIcon} />}
            selected={this.state.selectedTab === 'mineTab'}
            onPress={() => {
              this.setState({
                selectedTab: 'mineTab',
              });
            }}
          >
            <MinePage />
          </TabBar.Item>
        </TabBar>
      </div >
    );
  }
}

export default MainPage;
