import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import globalVal from '@/utils/global_val';
import styles from './styles.module.css';
import { logout, createPayOrder } from './api';

class MinePage extends Component {
  // #region 构造器
  constructor(props) {
    super(props);
    globalVal.minePageRef = this;

    this.state = {
      isLogined: false,
    };

    this.prepay_id = null;
    this.paySign = null;
  }
  // #endregion

  // #region 生命周期

  componentDidMount() {
    this.didFocus();
  }

  componentWillUnmount() {
    globalVal.minePageRef = null;
  }


  didFocus = async () => {
    if (globalVal.userInfo.customerId === -1) {
      this.setState({
        isLogined: false,
      });
    } else {
      this.setState({
        isLogined: true,
      });
    };

    const { prepay_id, paySign } = await createPayOrder();
    this.prepay_id = prepay_id;
    this.paySign = paySign;
  }

  // #endregion

  // #region 响应方法

  onLoginPress = () => {
    this.props.history.push('/LoginPage');
  }

  onClick = async (index) => {
    if (index === 7) {
      // 调起微信支付
      console.log(' window.wx', window.wx);
      window.wx.chooseWXPay({
        appId: globalVal.wxInitParams.appId,
        timeStamp: globalVal.wxInitParams.timestamp,
        nonceStr: globalVal.wxInitParams.nonceStr,
        package: this.prepay_id,
        signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
        paySign: this.paySign, // 支付签名
        success: function (res) {
          Toast.info('支付成功');
          // 支付成功后的回调函数
        }
      });
      return;
    }

    if (index === 5) return;
    const { isLogined } = this.state;
    if (index === 6) {
      this.setState({
        isLogined: false,
      });
      globalVal.userInfo = {
        customerId: -1,
        customerName: '',
        customerMobile: '',
        sessionId: '',
      };
      globalVal.setUserInfo(globalVal.userInfo);
      const res = await logout();
      if (res.error) {
        Toast.fail(res.error);
        return;
      }
      Toast.info('退出成功', 1);
    }

    if (!isLogined) {
      this.props.history.push('/LoginPage');
      return;
    }
    switch (index) {
      case 0:
        this.props.changeSelectedTab('orderTab');
        break;
      case 1:
        globalVal.routeIsFromPay = false;
        this.props.history.push({ pathname: '/Voucher', state: { title: "我的代金券" } });
        break;
      case 2:
        globalVal.routeIsFromPay = false;
        this.props.history.push({ pathname: '/PointCard', state: { title: "我的积分卡" } });
        break;
      case 3:
        globalVal.routeIsFromPay = false;
        this.props.history.push({ pathname: '/StoredCard', state: { title: "我的储值卡" } });
        break;
      case 4:
        globalVal.routeIsFromPay = false;
        this.props.history.push({ pathname: '/AddressList', state: { isFromPay: false } });
        break;
      case 5:
        this.props.history.push('/Contact');
        break;
      case 6:
        break;
      default:
        break;
    }
  }

  // #endregion


  // #region render方法

  renderHeader = () => {
    const userInfo = globalVal.userInfo;
    return (<div className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.customerNameText}>{userInfo.customerName}</div>
        <div className={styles.headerText}>{userInfo.customerMobile}</div>
      </div>
      <div>
        <img
          src={require('../../../../assets/images/head.png')}
          alt="头像"
        />
      </div>
    </div>);
  }

  renderHeaderUnLogin = () => {
    return (<div className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.loginButton} onClick={this.onLoginPress}>
          <span className={styles.headerLoginText}>
            点击登录/注册
          </span>
        </div>
      </div>
      <div>
        <img
          src={require('../../../../assets/images/head.png')}
          alt="头像"
        />
      </div>
    </div>);
  }

  renderButton = (text, index) => {
    return (<div onClick={() => this.onClick(index)}>
      <div className={styles.button}>
        <div>{text}</div>
        {index === 5 ?
          < a href="tel://4000852818"  >400-0852-818</a>
          : <img
            className={styles.arrowImage}
            src={require('../../../../assets/images/arrow-right.png')}
            alt="箭头"
          />
        }

      </div>
    </div>);
  }

  render() {
    const { isLogined } = this.state;
    return (
      <div className={styles.container}>
        {isLogined ? this.renderHeader() : this.renderHeaderUnLogin()}
        <div className={styles.buttonList}>
          {this.renderButton('我的订单', 0)}
          {this.renderButton('代金劵', 1)}
          {this.renderButton('积分卡', 2)}
          {/*{this.renderButton('储值卡', 3)}*/}
          {this.renderButton('我的地址', 4)}
          {this.renderButton('联系客服', 5)}
          {isLogined ? this.renderButton('退出登录', 6) : null}
          {this.renderButton('微信支付', 7)}
        </div>
      </div>
    );
  }

  // #endregion
}

export default withRouter(MinePage);
