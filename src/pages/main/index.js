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

  // #region 生命周期

  didFocus = (selectedTab) => {
    switch (selectedTab) {
      case 'homeTab':
        if (globalVal.homePageRef) {
          globalVal.homePageRef.didFocus();
        }
        break;
      case 'orderTab':
        if (globalVal.orderPageRef) {
          globalVal.orderPageRef.didFocus();
        }
        break;
      case 'mineTab':
        if (globalVal.minePageRef) {
          globalVal.minePageRef.didFocus();
        }
        break;
      default:
        break;

    }
  }

  // #endregion

  // #region 响应方法

  onChangeSelectedTab = (selectedTab) => {
    this.setState({
      selectedTab,
    });
    globalVal.selectedTab = selectedTab;

    this.didFocus(selectedTab);
  }

  // #endregion

  // #region render

  render() {
    return (
      <div className={styles.container}>
        <TabBar
          unselectedTintColor="#949494"
          tintColor="#33A3F4"
          barTintColor="white"
          prerenderingSiblingsNumber={0}
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
            <OrderPage />
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
              changeSelectedTab={(selectedTab) => { this.onChangeSelectedTab(selectedTab) }}
            />
          </TabBar.Item>
        </TabBar>
      </div >
    );
  }

  // #endregion
}

export default MainPage;
