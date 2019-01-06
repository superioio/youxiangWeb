import React, { Component } from 'react';
import styles from './styles.module.css';
import {Icon, NavBar} from "antd-mobile";

class Contact extends Component {
  render() {
    return (
        <div className={styles.container}>
          <NavBar
              mode="light"
              icon={<Icon type="left" />}
              onLeftClick={() => this.props.history.goBack()}
          >联系我们</NavBar>
          <div className={styles.mobile}>客服电话： < a href="tel://4000852818" className={styles.mobile} >4000852818 </a></div>
          <div className={styles.mobile}>联系地址：    北京市昌平区</div>
        </div>
    );
  }
}

export default Contact;
