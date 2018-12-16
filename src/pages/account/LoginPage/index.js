import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Toast, Button, InputItem } from 'antd-mobile';
import { createForm } from 'rc-form';
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
      phoneNum: '',
      vetifyCode: '',
      password: '',
      bizId: ''
    };
  }
  // #endregion

  // #region 响应方法

  onLogin = () => {
    console.log('this.props.form.getFieldsValue()', this.props.form.getFieldsValue());

  }

  // #endregion

  // #region render方法

  renderPhoneLogin = () => {
    const { getFieldProps } = this.props.form;
    return (<div>
      <div className={styles.title}>登录</div>
      <div className={styles.phoneNumContain}>
        <InputItem
          {...getFieldProps('phoneNum')}
          type="phone"
          placeholder="请输入手机号"
          clear
          moneyKeyboardAlign="left"
          moneyKeyboardWrapProps={moneyKeyboardWrapProps}
        />
        <Button className={styles.phoneNumButton} onClick={() => this.onGetVCode()}>
          <div> {this.state.timing == 60 ? '获取验证码' : this.state.timing + 's'}</div>
        </Button>
      </div>
      <div className={styles.phoneNumContain}>
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
        onClick={this.onLogin}
      >
        <div className={styles.loginButtonText}>登录</div>
      </Button>
      <div className={styles.switchLoginWay}>
        <Button
          on={this.onSwitchLoginWay}
        >
          <div className={styles.switchLoginWayText}>账号密码登录</div>
        </Button>
      </div>
    </div>);
  }

  renderAccountLogin = () => {

  }

  render() {
    const { isPhoneLogin } = this.state;
    return (
      <div style={styles.container}>
        {isPhoneLogin
          ? this.renderPhoneLogin() : this.renderAccountLogin()}
      </div>
    );
  }

  // #endregion
}

export default withRouter(createForm()(LoginPage));
