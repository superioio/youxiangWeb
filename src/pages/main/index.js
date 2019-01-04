import React, { Component } from 'react';
import { TabBar } from 'antd-mobile';
import globalVal from '@/utils/global_val'
import HomePage from './components/HomePage';
import OrderPage from './components/OrderPage';
import MinePage from './components/MinePage';
import styles from './styles.module.css';


class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: globalVal.selectedTab,
    };
  }

  onChangeSelectedTab = (selectedTab) => {
    this.setState({
      selectedTab,
    });
    globalVal.selectedTab = selectedTab;
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
            onPress={() => { this.onChangeSelectedTab('homeTab') }}
          >
            <HomePage />
          </TabBar.Item>
          <TabBar.Item
            title="订单"
            key="order"
            icon={<div className={styles.orderTabIcon} />}
            selectedIcon={<div className={styles.orderTabSelectedIcon} />}
            selected={this.state.selectedTab === 'orderTab'}
            onPress={() => { this.onChangeSelectedTab('orderTab') }}
          >
            <OrderPage
              selected={this.state.selectedTab === 'orderTab'}
              changeSelectedTab={(selectedTab) => { this.onChangeSelectedTab(selectedTab) }}
            />
          </TabBar.Item>
          <TabBar.Item
            title="我的"
            key="mine"
            icon={<div className={styles.mineTabIcon} />}
            selectedIcon={<div className={styles.mineTabSelectedIcon} />}
            selected={this.state.selectedTab === 'mineTab'}
            onPress={() => { this.onChangeSelectedTab('mineTab') }}
          >
            <MinePage
              selected={this.state.selectedTab === 'mineTab'}
              changeSelectedTab={(selectedTab) => { this.onChangeSelectedTab(selectedTab) }}
            />
          </TabBar.Item>
        </TabBar>
      </div >
    );
  }
}

export default MainPage;
