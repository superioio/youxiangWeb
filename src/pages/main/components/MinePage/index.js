import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import globalVal from '@/utils/global_val';
import styles from './styles.module.css';

class MinePage extends Component {
  // #region 构造器
  constructor(props) {
    super(props);
    this.state = {
      isLogined: false,
    };
  }
  // #endregion


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

  didFocus = () => {
    if (globalVal.userInfo.customerId === -1) {
      this.setState({
        isLogined: false,
      });
    } else {
      this.setState({
        isLogined: true,
      });
    };
  }

  // #endregion

  // #region 响应方法

  onLoginPress = () => {
    this.props.history.push('/LoginPage');
  }

  onClick = (index) => {
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
        this.props.history.push({ pathname: '/CardAndDiscount', state: { tag: "代金券", isPay: false } });
        break;
      case 2:
        this.props.history.push({ pathname: '/CardAndDiscount', state: { tag: "积分卡", isPay: false } });
        break;
      case 3:
        this.props.history.push('/AddressList', { isPay: false });
        break;
      case 4:
        this.props.history.push('/Contact');
        break;
      case 5:
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
        <img
          className={styles.arrowImage}
          src={require('../../../../assets/images/arrow-right.png')}
          alt="箭头"
        />
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
          {this.renderButton('我的地址', 3)}
          {this.renderButton('联系客服', 4)}
          {this.renderButton('修改密码', 5)}
          {isLogined ? this.renderButton('退出登录', 6) : null}
        </div>
      </div>
    );
  }

  // #endregion
}

export default withRouter(MinePage);
