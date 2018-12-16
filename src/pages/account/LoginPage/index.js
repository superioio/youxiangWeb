import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Toast, Button, InputItem } from 'antd-mobile';
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
      isPhoneLogin: true,
      timing: 60,
      password: '',
      bizId: ''
    };
  }
  // #endregion

  // #region 响应方法

  onLogin = () => {
    console.log('this.props.form.getFieldsValue()', this.props.form.getFieldsValue());
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
      console.log('getVerifyCode', getVerifyCode);
      const bizId = await getVerifyCode(phoneNum.split(' ').join(''));
      this.setState({
        bizId: bizId
      });
    }
  }
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

  renderPhoneLogin = () => {
    const { getFieldProps } = this.props.form;
    return (<div>
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
      <div
        className={styles.switchLoginWay}
        onClick={this.onSwitchLoginWay}
      >
        账号密码登录
      </div>
    </div>);
  }

  renderAccountLogin = () => {

  }

  render() {
    const { isPhoneLogin } = this.state;
    return (
      <div className={styles.container}>
        {isPhoneLogin
          ? this.renderPhoneLogin() : this.renderAccountLogin()}
      </div>
    );
  }

  // #endregion
}

export default withRouter(createForm()(LoginPage));
