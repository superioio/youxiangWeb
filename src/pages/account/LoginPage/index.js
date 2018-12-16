import React, { Component } from 'react';


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

  render() {
    return (
      <div>
        登录页
      </div>
    );
  }
}

export default LoginPage;
