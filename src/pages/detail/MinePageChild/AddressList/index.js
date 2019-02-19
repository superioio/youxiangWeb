import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { Toast, NavBar, Icon, Modal } from 'antd-mobile';
import globalVal from '@/utils/global_val';
import { getAddrList, deleteAddress, setIsDefault } from './api';
import styles from './styles.module.css';


let timeOutEvent;
let longClick = 0;

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
    globalVal.routeAddrInfo = item;
    this.props.history.push({
      pathname: '/AddressEdit',
    });
  }

  onItemTouchStart = (id) => {
    longClick = 0;//设置初始为0
    timeOutEvent = setTimeout(() => {
      longClick = 1;//设置初始为0
      const operation = Modal.operation;
      operation([
        { text: '设为默认', onPress: () => this.onSetDefaultAddress(id) },
        { text: '删除地址', onPress: () => this.onConfrimDelete(id) },
      ])
    }, 500);
  }

  onItemTouchMove = (e) => {
    clearTimeout(timeOutEvent);
    timeOutEvent = 0;
    e.preventDefault();
  }

  onItemTouchEnd = (e, item, isFromPay) => {
    clearTimeout(timeOutEvent);
    if (timeOutEvent !== 0 && longClick === 0) {//点击
      if (isFromPay) {
        if(globalVal.routeOrderInfo.productResp.productType === 0 && !globalVal.routeOrderInfo.productResp.productPriceList.find( i =>  i.cityCode == item.cityCode)){
          Toast.fail('该城市不在所选商品服务区。')
          return;
        }
        globalVal.routeAddress = item;
        this.props.history.goBack();
      }
    }
    e.preventDefault();
  }

  onConfrimDelete = async (id) => {
    const alert = Modal.alert;

    alert('删除地址', '确认删除地址吗？',
      [{ text: "取消", onPress: () => { return null } },
      { text: "确认", onPress: () => this.deleteConfirm(id) },
      ]
    );

  }

  deleteConfirm = async (id) => {
    Toast.loading("请稍后...", 3);
    const data = await deleteAddress(id);
    Toast.hide();
    if (data.code === 100000) {
      await this.getAddrList();
      Toast.success('删除成功');
    } else {
      Toast.fail('删除失败');
    }
  }


  onSetDefaultAddress = async (id) => {
    Toast.loading("请稍后...", 3);
    const data = await setIsDefault(id, 1);
    Toast.hide();
    if (data.code === 100000) {
      await this.getAddrList();
      Toast.success('设置成功');
    } else {
      Toast.fail('设置失败');
    }
  }

  onBack = () => {
    this.props.history.goBack();
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

  renderItemLeft = (item, isFromPay) => {
    const { id, address, name, gender, mobile, isDefault } = item;
    return (<div
      className={styles.itemLeft}
      onTouchStart={() => this.onItemTouchStart(id)}
      onTouchMove={this.onItemTouchMove}
      onTouchEnd={(e) => this.onItemTouchEnd(e, item, isFromPay)}
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


  renderAddressItem = (item) => {
    const isFromPay = globalVal.routeIsFromPay;
    return (<div key={item.id} className={styles.itemContain}>
      {this.renderItemLeft(item, isFromPay)}
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
