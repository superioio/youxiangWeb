import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Toast, Button, InputItem, NavBar, Icon } from 'antd-mobile';
import { createForm } from 'rc-form';
import { requestReg } from './api';
// import globalVal from '@/utils/global_val';
import styles from './styles.module.css';

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    onTouchStart: e => e.preventDefault(),
  };
}

class RegPage extends Component {
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

  onReg = async () => {
    Toast.loading("", 3);
    const { phoneNum, name } = this.props.form.getFieldsValue();
    if (!phoneNum) {
      Toast.info('请先填写电话号码', 1);
      return;
    }
    if (!name) {
      Toast.info('请先填写姓名', 1);
      return;
    }

    const res = await requestReg(phoneNum.split(' ').join(''), name);
    if (res) {
      this.props.history.goBack();
    }
    Toast.hide();
  }


  onBack = () => {
    this.props.history.goBack();
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

  render() {
    const { getFieldProps } = this.props.form;
    return (
      <div className={styles.container}>
        {this.renderNavBar()}
        <div className={styles.title}>注册</div>
        <div className={styles.phoneNumContain}>
          <InputItem
            {...getFieldProps('phoneNum')}
            type="phone"
            placeholder="请输入手机号"
            clear
            moneyKeyboardAlign="left"
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
          />
        </div>
        <div className={styles.vetifyCodeInputContain}>
          <InputItem
            {...getFieldProps('name')}
            placeholder="请输入姓名"
            clear
            moneyKeyboardAlign="left"
            moneyKeyboardWrapProps={moneyKeyboardWrapProps}
          />
        </div>
        <Button
          className={styles.loginButton}
          type="primary"
          onClick={this.onReg}
        >
          注册
        </Button>
      </div>
    );
  }

  // #endregion
}


export default withRouter(createForm()(RegPage));
