import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Toast, Button, InputItem, NavBar, Icon } from 'antd-mobile';
import { createForm } from 'rc-form';
import { login, getVerifyCode } from './api';
import globalVal from '@/utils/global_val';
import styles from './styles.module.css';

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    onTouchStart: e => e.preventDefault(),
  };
}

class LoginPage extends Component {
  // #region 构造器
  constructor(props) {
    super(props);
    this.state = {
      timing: 60,
      bizId: ''
    };
  }
  // #endregion

  // #region 响应方法

  onLogin = async () => {
    Toast.loading("", 3);
    const { phoneNum, vetifyCode } = this.props.form.getFieldsValue();
    if (!phoneNum) {
      Toast.info('请先填写电话号码', 1);
      return;
    }
    if (!vetifyCode) {
      Toast.info('请先填写验证码', 1);
      return;
    }

    const userInfo = await login(phoneNum.split(' ').join(''), vetifyCode, this.state.bizId);

    if (userInfo && userInfo.customerId) {
      userInfo.lastLoginTime = Date.now();
      globalVal.setUserInfo(userInfo);
      globalVal.userInfo = userInfo;
      this.props.history.goBack();
    }
    Toast.hide();
    if (userInfo.error) {
      Toast.fail(userInfo.error);
      return;
    }
  }

  onGetVCode = async () => {
    const { getFieldProps } = this.props.form;
    const phoneNum = getFieldProps('phoneNum').value;
    if (!phoneNum) {
      Toast.info('请先填写电话号码', 1);
      return;
    }

    if (this.state.timing === 60) {
      this.countDown();
      const result = await getVerifyCode(phoneNum.split(' ').join(''));
      if (result.error) {
        Toast.fail(result.error);
        return;
      }
      this.setState({
        bizId: result.bizId
      });
    }
  }

  onBack = () => {
    this.props.history.goBack();
  }

  onNavReg = () => {
    this.props.history.push('/RegPage');
  }

  // #endregion

  // #region 私有方法
  countDown() {
    if (this.state.timing === 0) {
      this.setState({
        timing: 60,
      })
    } else {
      this.setState({
        timing: this.state.timing - 1,
      });
      setTimeout(this.countDown.bind(this), 1000);
    }
  }
  // #endregion

  // #region render方法

  renderNavBar = () => {
    return (<NavBar
      mode="light"
      icon={<Icon type="left" />}
      onLeftClick={this.onBack}
    ></NavBar>);
  }
  // rightContent={<div onClick={this.onNavReg}>
  //   注册
  // </div>}

  render() {
    const { getFieldProps } = this.props.form;
    return (
      <div className={styles.container}>
        {this.renderNavBar()}
        <div className={styles.title}>登录</div>
        <div className={styles.phoneNumContain}>
          <div className={styles.phoneNumInputContain}>
            <InputItem
              {...getFieldProps('phoneNum')}
              type="phone"
              placeholder="请输入手机号"
              clear
              moneyKeyboardAlign="left"
              moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            />
          </div>
          <Button onClick={this.onGetVCode}>
            <div className={styles.phoneNumButton}>
              {this.state.timing === 60 ? '获取验证码' : this.state.timing + 's'}
            </div>
          </Button>
        </div>
        <div className={styles.vetifyCodeInputContain}>
          <InputItem
            {...getFieldProps('vetifyCode')}
            type="number"
            placeholder="请输入短信验证码"
            clear
            moneyKeyboardAlign="left"
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
          />
        </div>
        <Button
          className={styles.loginButton}
          type="primary"
          onClick={this.onLogin}
        >
          登录
      </Button>
      </div>
    );
  }

  // #endregion
}

export default withRouter(createForm()(LoginPage));
