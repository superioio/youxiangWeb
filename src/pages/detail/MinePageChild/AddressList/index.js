import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { Toast, NavBar, Icon, Modal } from 'antd-mobile';
import globalVal from '@/utils/global_val';
import { getAddrList, deleteAddress, setIsDefault } from './api';
import styles from './styles.module.css';


let timeOutEvent;

class AddressList extends Component {

  // #region 构造器
  constructor(props) {
    super(props);
    this.state = {
      addrList: [],
    };
  }
  // #endregion

  // #region 生命周期
  async componentDidMount() {
    await this.getAddrList();
  }
  // #endregion

  // #region 响应方法

  onNavAddressEdit = (item) => {
    console.log('item', item);
    if (item) {
      this.props.history.push({
        pathname: '/AddressEdit',
        state: { isAdd: false, addrInfo: item }
      });
    } else {
      this.props.history.push({
        pathname: '/AddressEdit',
        state: { isAdd: true }
      });
    }
  }

  onItemTouchStart = () => {
    timeOutEvent = setTimeout(() => {
      const operation = Modal.operation;
      operation([
        { text: '设为默认', onPress: this.onSetDefaultAddress },
        { text: '删除地址', onPress: this.onConfrimDelete },
      ])
    }, 500);
  }

  onItemTouchMove = (e) => {
    clearTimeout(timeOutEvent);
    timeOutEvent = 0;
    e.preventDefault();
  }

  onItemTouchEnd = (e) => {
    clearTimeout(timeOutEvent);
    timeOutEvent = 0;
    e.preventDefault();
  }

  onConfrimDelete = async () => {
    const alert = Modal.alert;

    alert('取消订单', '确认删除地址吗？',
      [{ text: "取消", onPress: () => { return null } },
      { text: "确认", onPress: this.deleteConfirm },
      ]
    );

  }

  deleteConfirm = async () => {
    this.setState({
      isPopDeleteConfrim: false,
    });
    Toast.loading("请稍后...", 3);
    const data = await deleteAddress(this.selectAddressId);
    Toast.hide();
    if (data.code === 100000) {
      this.getAddrList();
      Toast.show('删除成功');
    } else {
      Toast.show('删除失败');
    }
  }


  onSetDefaultAddress = async () => {
    this.setState({
      isPopDeleteConfrim: false,
    });
    Toast.loading("请稍后...", 3);
    const data = await setIsDefault(this.selectAddressId, 1);
    Toast.hide();
    if (data.code === 100000) {
      this.getAddrList();
      Toast.show('设置成功');
    } else {
      Toast.show('设置失败');
    }
  }



  // #endregion

  // #region 方法
  async getAddrList() {
    Toast.loading("请稍后...", 3);
    const addrList = await getAddrList(globalVal.userInfo.customerId);//获取用户地址列表
    Toast.hide();
    this.setState({
      addrList: addrList
    });
  }
  // #endregion

  renderNavbar = () => {
    return (<NavBar
      mode="light"
      icon={<Icon type="left" />}
      onLeftClick={this.onBack}
      rightContent={<div onClick={() => { this.onNavAddressEdit() }}>
        新增地址
      </div>}
    >上门地址</NavBar>);
  }

  renderItemLeftOutPay = (item) => {
    const { id, address, name, gender, mobile, isDefault } = item;
    return (<div className={styles.itemLeft}
      // onLongPress={() => { this.onPop(id) }}
      onTouchStart={this.onItemTouchStart}
      onTouchMove={this.onItemTouchMove}
      onTouchEnd={this.onItemTouchEnd}
    >
      <div className={styles.itemFirstLine}>
        <div className={styles.firstLineText}>{address}</div>
        {isDefault ? (<div className={styles.isDefault}>
          <div className={styles.isDefaultText}>默认</div>
        </div>) : null}
      </div>
      <div className={styles.itemSecondLine}>
        <div className={styles.secondLineText}>{name}</div>
        <div className={`${styles.secondLineText} ${styles.marginLeft20}`}>
          {gender === 1 ? "先生" : "女士"}
        </div>
        <div className={`${styles.secondLineText} ${styles.marginLeft20}`}>{mobile}</div>
      </div>
    </div>);
  }

  renderItemLeftInPay = (item) => {
    const { id, address, name, gender, mobile } = item;
    return (<div
      className={styles.itemLeft}
      onClick={this.onSetAddress}
    // onLongPress={() => { this.onPop(id) }}
    >
      <div className={styles.itemFirstLine}>
        <div className={styles.firstLineText}>{address}</div>
      </div>
      <div className={styles.itemSecondLine}>
        <div className={styles.secondLineText}>{name}</div>
        <div className={[styles.secondLineText, styles.marginLeft20]}>{gender === 1 ? "先生" : "女士"}</div>
        <div className={[styles.secondLineText, styles.marginLeft20]}>{mobile}</div>
      </div>
    </div>);
  }


  renderAddressItem = (item) => {
    const isFromPay = this.props.location.state.isPay;
    return (<div key={item.id} className={styles.itemContain}>
      {isFromPay ? this.renderItemLeftInPay(item) : this.renderItemLeftOutPay(item)}
      <div className={styles.itemRight}>
        <div
          className={styles.itemRightButton}
          onClick={() => this.onNavAddressEdit(item)}>
          <div className={styles.addText}>编辑</div>
        </div>
      </div>
    </div>);
  }

  renderAddrList = () => {
    const { addrList } = this.state;
    if (!addrList) return;

    return (<div className={styles.contentContainer}>
      {addrList.map(addr => {
        return this.renderAddressItem(addr);
      })}
    </div>);
  }

  render() {
    return (
      <div className={styles.container}>
        {this.renderNavbar()}
        {this.renderAddrList()}
      </div>
    );
  }
}

export default withRouter(AddressList);
