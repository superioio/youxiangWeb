import React, { Component } from 'react';
import { Flex, Toast, NavBar, Tabs, PullToRefresh } from 'antd-mobile';
import globalVal from '@/utils/global_val';
import styles from './styles.module.css';
import { getOrderListByStatus } from './api';
import { dateFormat, getStatusCode, getStatus } from '@/utils';
import { withRouter } from 'react-router-dom';

const tabs = [
  { title: '待付款', },
  { title: '待服务', },
  { title: '已完成', },
  { title: '已取消', },
  { title: '全部', },
];

class OrderPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogined: false,
      unpaidOrders: [],
      paidOrders: [],
      completedOrders: [],
      cancelOrders: [],
      allOrders: [],

      refreshing: false,
    };
  }

  // #region 生命周期

  componentDidMount() {
    if (this.props.selected) {
      this.didFocus();
    }
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
      this.requestOrders('待付款');
    };
  }
  // #endregion



  componentWillUnmount() {
    //this.didFocusListener.remove();
  }

  // #region 响应方法

  //点击tab，获取对应的order list
  onTabPress = ({ title }) => {
    const orders = this.getCurrentOrders(title);
    if (orders.length > 0) return;

    this.requestOrders(title);
  }

  onRefresh = async (tab) => {
    this.setState({ refreshing: true });
    await this.requestOrders(tab);
    this.setState({ refreshing: false });
  }

  onLoginPress = () => {
    this.props.history.push('/LoginPage');
  }

  // #endregion

  // #region方法

  requestOrders = async (tabName) => {
    Toast.loading("请稍后...", 3);
    const orders = await getOrderListByStatus(getStatusCode(tabName), globalVal.userInfo.customerId);
    Toast.hide();
    if (orders.error) {
      Toast.fail(orders.error);
      return;
    }
    switch (tabName) {
      case '待付款':
        this.setState({
          unpaidOrders: orders
        });
        break;
      case '待服务':
        this.setState({
          paidOrders: orders
        });
        break;
      case '已完成':
        this.setState({
          completedOrders: orders
        });
        break;
      case '已取消':
        this.setState({
          cancelOrders: orders
        });
        break;
      case '全部':
        this.setState({
          allOrders: orders
        });
        break;

      default:
        break;
    }
  }

  getCurrentOrders = (tab) => {
    let orders = [];
    switch (tab) {
      case '待付款':
        orders = this.state.unpaidOrders;
        break;
      case '待服务':
        orders = this.state.paidOrders;
        break;
      case '已完成':
        orders = this.state.completedOrders;
        break;
      case '已取消':
        orders = this.state.cancelOrders;
        break;
      case '全部':
        orders = this.state.allOrders;
        break;
      default:
        break;
    }
    return orders;
  }

  // #endregion

  // #region render

  renderHeader() {
    return <NavBar
      mode="light"
    >我的订单</NavBar>
  }

  onOrderPress(order) {
    const isUnpaid = this.state.selectTab === "unpaid";
    this.props.history.push({
      pathname: '/OrderDetail', state: {
        order: order, isFromPay: false, isUnpaid: isUnpaid
      }
    });
  }

  renderTabsContent(tab) {
    const orders = this.getCurrentOrders(tab);
    if (!orders || orders.length === 0 || JSON.stringify(orders) === "{}") return (<div
      className={styles.emptyTabContent}
      style={{ height: document.documentElement.clientHeight - 140 }}>暂无订单</div>);
    return (
      <PullToRefresh
        damping={60}
        ref={el => this.ptr = el}
        style={{
          height: document.documentElement.clientHeight - 140,
          overflow: 'auto',
        }}
        direction={'down'}
        refreshing={this.state.refreshing}
        onRefresh={this.onRefresh}
      >
        <div className={styles.tabContent} style={{ minHeight: document.documentElement.clientHeight - 140 }}>
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
                    alt="商品缩略图"
                    src={globalVal.imgUrl + item.productResp.thumbnailUrl}
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
        </div>
      </PullToRefresh >);
  }

  renderUnLogin = () => {

    return (<div className={styles.unLogin}>
      <span className={styles.unLoginLabel}>登录后可查看订单</span>
      <div className={styles.unLoginButton} onClick={this.onLoginPress}>
        <span className={styles.unLoginText}>登录</span>
      </div>
    </div>);
  }

  renderTabs = () => {
    return (<Tabs tabs={tabs}
      initialPage={0}
      onTabClick={(tab) => { this.onTabPress(tab); }}
    >
      {this.renderTabsContent('待付款')}
      {this.renderTabsContent('待服务')}
      {this.renderTabsContent('已完成')}
      {this.renderTabsContent('已取消')}
      {this.renderTabsContent('全部')}
    </Tabs>);
  }

  render() {
    const { isLogined } = this.state;
    if (!isLogined) return this.renderUnLogin();

    return (
      <div className={styles.container}>
        {this.renderHeader()}
        {this.renderTabs()}
      </div>
    );
  }

}

export default withRouter(OrderPage);
