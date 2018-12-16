import React, {Component} from 'react';
import {Flex, Toast} from 'antd-mobile';
import globalVal from '@/utils/global_val';
import styles from './styles.module.css';
import {getOrderListByStatus} from './api';
import {dateFormat, getStatusCode, getStatus} from '@/utils';
import { withRouter } from 'react-router-dom';

class OrderPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogined: false,
      orders: [],
      selectTab: 'unpaid',
    };
  }

  // #region 生命周期

  componentDidMount() {
    this.didFocus();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.selected) {
      this.didFocus();
    }
  }
  // #endregion

  // #region 私有方法

  didFocus = async () => {
    if (globalVal.userInfo.customerId === -1) {
      this.setState({
        isLogined: false,
      });
    } else {
      this.setState({
        isLogined: true,
      });
      Toast.loading("请稍后...", 30);
      const orders = await getOrderListByStatus(1, globalVal.userInfo.customerId);//默认 待付款
      Toast.hide();
      //console.log(JSON.stringify(orders));
      this.setState({
        orders: orders
      });
    }
    ;
  }
  // #endregion



  componentWillUnmount() {
    //this.didFocusListener.remove();
  }

  // #region 响应方法

  //点击tab，获取对应的order list
  async onTabPress(tabName, tab) {
    this.setState({
      selectTab: tab
    });
    Toast.loading("请稍后...", 3);
    const orders = await getOrderListByStatus(getStatusCode(tabName), globalVal.userInfo.customerId);
    Toast.hide();
    this.setState({
      orders: orders
    });

  }

  onLoginPress = () => {
    //this.props.navigation.navigate('Login');
  }

  // #endregion

  // #region render

  renderHeader() {
    return (<Flex className={styles.header}>
      <span className={styles.headerText}>我的订单</span>
    </Flex>);
  }

  renderTabButton(text, tab, isSelected) {
    return (<Flex.Item className={[styles.tabButton, isSelected && {
      borderBottomColor: 'rgb(241, 128, 54)',
      borderBottomWidth: 4,
    }]} onClick={() => this.onTabPress(text, tab)}>
      <span>{text}</span>
    </Flex.Item>);
  }

  renderTabsHeader() {
    const {selectTab} = this.state;
    return (<Flex className={styles.tabsHeader}>
      {this.renderTabButton('待付款', "unpaid", "unpaid" === selectTab)}
      {this.renderTabButton('待服务', "paid", "paid" === selectTab)}
      {this.renderTabButton('已完成', "completed", "completed" === selectTab)}
      {this.renderTabButton('已取消', "cancel", "cancel" === selectTab)}
      {this.renderTabButton('全部', "all", "all" === selectTab)}
    </Flex>);
  }

  onOrderPress(order) {
    const isUnpaid = this.state.selectTab === "unpaid" ;
    alert("order" + order.name);
    // this.props.navigation.navigate('OrderDetail', { order: order, isPay: false, isUnpaid: isUnpaid })
  }

  renderTabsContent() {
    const {orders} = this.state;
    if (!orders) return null;

    return (<div className={styles.tabContent}>
      {orders.map((item, index) => <div key={index} className={styles.tabContentItem}>
        <Flex className={styles.tabContentHeader}>
          <span>{item.productResp.name}</span>
          <span className={styles.tabContentStatus}>{getStatus(item.status)}</span>
        </Flex>
        <div onClick={() => this.onOrderPress(item)}>
          <Flex className={styles.tabContentBody}>
            <div className={styles.tabContentLeft}>
              <img
                  className={styles.tabContentImage}
                  src={require('../../../../assets/images/clean1.png')}
              />
            </div>
            <div className={styles.tabContentRight}>
              <div className={styles.tabContentText}>{dateFormat(item.serviceTime)}</div>
              <div className={styles.tabContentText}>{item.customerCityName + item.customerAddress}</div>
              <div className={styles.tabContentText}>{item.count + item.productResp.unitName}</div>
            </div>
          </Flex>
        </div>
      </div>)}
    </div>);
  }

  renderUnLogin = () => {

    return (<div className={styles.unLogin}>
      <span className={styles.unLoginLabel}>登录后可查看订单</span>
      <div className={styles.unLoginButton} onClick={this.onLoginPress}>
        <span className={styles.unLoginText}>登录</span>
      </div>
    </div>);
  }

  render() {
    const {isLogined} = this.state;
    if (!isLogined) return this.renderUnLogin();

    return (
        <div className={styles.container}>
          {this.renderHeader()}
          {this.renderTabsHeader()}
          {this.renderTabsContent()}
        </div>
    );
  }

}

export default withRouter(OrderPage) ;
