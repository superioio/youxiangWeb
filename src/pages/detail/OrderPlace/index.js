import React, { Component } from 'react';
import globalVal from '@/utils/global_val';
import styles from './styles.module.css';
import { getDefaultAddress, placeOrder } from './api';
import { Toast, DatePicker, List, TextareaItem, NavBar, Icon } from "antd-mobile";
import moment from 'moment';
import { withRouter } from "react-router-dom";

class OrderPlace extends Component {
  constructor(props) {
    super(props);
    this.state = {
      remark: '',
      orderInfo: {
        productResp: {}
      },
      address: {},
      selectedStoredCardList: [],
      selectedVoucherList: [],
      selectedPointCardList: [],
      saveMoneyByPoint: 0,
      saveMoneyByCard: 0,
      saveMoneyByVoucher: 0,
      payCash: 0
    };
  }

  // #endre

  // #endregion
  async componentDidMount() {
    await this.getOrderPlaceInfo();
    await this.getAddressInfo();
    this.getDiscountInfo();

    this.setState({
      orderInfo: globalVal.routeOrderInfo,
      address: globalVal.routeAddress,
      payCash: globalVal.routePayCash,
    });
  }

  getAddressInfo = async () => {
    if (globalVal.routeAddress) {
      globalVal.routeOrderInfo = {
        ...globalVal.routeOrderInfo,
        customerName: globalVal.routeAddress.name,
        customerCityCode: globalVal.routeAddress.cityCode,
        customerCityName: globalVal.routeAddress.cityName,
        customerAddress: globalVal.routeAddress.address,
        customerMobile: globalVal.routeAddress.mobile,
      }
    } else {
      const address = await getDefaultAddress(globalVal.userInfo.customerId);
      if (address.error) {
        if(this.state.orderInfo.productResp.productType === 0) Toast.fail(address.error);
        return;
      }
      globalVal.routeAddress = address;
      globalVal.routeOrderInfo = {
        ...globalVal.routeOrderInfo,
        customerName: globalVal.routeAddress.name,
        customerCityCode: globalVal.routeAddress.cityCode,
        customerCityName: globalVal.routeAddress.cityName,
        customerAddress: globalVal.routeAddress.address,
        customerMobile: globalVal.routeAddress.mobile,
      }
    }
  }


  //从商品详情页面进入
  getOrderPlaceInfo = async () => {
    if (globalVal.routeIsFromProductDetail) {
      globalVal.routeIsFromProductDetail = null;
      const product = globalVal.routeProductDetail;

      product.price = product.productPriceList[0].price;
      const orderInfo = {
        productResp: product,
        productId: product.id,
        date: moment().add(product.delayDays, 'days').format(),
        time: '',
        status: 1,
        customerRemark: "",
        productPrice: product.productPriceList[0].price,
        lastNum: product.lastNum,//最小购买数量
        count: product.lastNum,
        totalAmount: 0,
        payVoucher: "",
        payRechargeCard: "",
        payPoint: "",
        payment: "",
        voucherIds: '',//选中的代金券ID  1,2,3
        rechargeCardIds: '',//选中的储值卡ID  1,2,3
        pointsCardIds: '',//选中的积分卡ID  1,2,3
        cardMoneys: '',//选中的积分卡使用金额 暂时不用
      };
      orderInfo.serviceTime = moment(`${orderInfo.date}`).unix() * 1000;

      const payCash = orderInfo.productPrice * orderInfo.count;

      globalVal.routeOrderInfo = orderInfo;
      globalVal.routePayCash = payCash;
    }
  }

  //从积分卡/代金券/储值卡 选择页面返回
  getDiscountInfo = () => {
    let selectedStoredCardList = [];
    let selectedVoucherList = [];
    let selectedPointCardList = [];

    if (globalVal.routePointCard) {
      selectedPointCardList = globalVal.routePointCard.selectedPointCardList;
    }
    if (globalVal.routeStoredCard) {
      selectedStoredCardList = globalVal.routeStoredCard.selectedStoredCardList;
    }
    if (globalVal.routeVoucher) {
      selectedVoucherList = globalVal.routeVoucher.selectedVoucherList;
    }

    const orderInfo = globalVal.routeOrderInfo;
    let cardAmount = 0;
    let voucherAmount = 0;
    let pointAmount = 0;
    let cardIds = '';
    let voucherIds = '';
    let pointsCardIds = '';
    var payCash = 0;
    for (const i of selectedStoredCardList) {
      cardAmount += i.balance;
      cardIds += i.id + ",";//储值卡ID 字符串
    }

    for (const i of selectedVoucherList) {
      voucherAmount += i.count * orderInfo.productPrice;
      voucherIds += i.id + ",";//代金券ID 字符串
    }

    for (const i of selectedPointCardList) {
      pointAmount += i.balance * i.projectResp.pointConversionRate;
      pointsCardIds += i.id + ",";//积分卡ID 字符串
    }
    payCash = orderInfo.productPrice * orderInfo.count;
    voucherAmount = voucherAmount > payCash ? payCash : voucherAmount;
    //如果代金券已经抵扣全部，则把其余的支付方式置空
    if (voucherAmount === payCash) {
      cardAmount = 0;
      pointAmount = 0;
      selectedStoredCardList = [];
      selectedPointCardList = [];
      cardIds = '';
      pointsCardIds = '';
    } else {
      cardAmount = (payCash - voucherAmount) > cardAmount ? cardAmount : payCash - voucherAmount;
      pointAmount = (payCash - voucherAmount - cardAmount) > pointAmount ? pointAmount : payCash - voucherAmount - cardAmount;
    }
    payCash = (payCash - cardAmount - voucherAmount - pointAmount) <= 0 ? 0 : (payCash - cardAmount - voucherAmount - pointAmount);
    globalVal.routePayCash = payCash;
    orderInfo.rechargeCardIds = cardIds;
    orderInfo.voucherIds = voucherIds;
    orderInfo.pointsCardIds = pointsCardIds;
    this.setState({
      saveMoneyByCard: cardAmount,
      saveMoneyByVoucher: voucherAmount,
      selectedStoredCardList: selectedStoredCardList,
      selectedVoucherList: selectedVoucherList,
      saveMoneyByPoint: pointAmount,
      selectedPointCardList,
    });
  };


  // #region 相应方法

  //确认下单按钮
  onOrderPress = async () => {
    let citycode = this.state.orderInfo.customerCityCode;
    if(!this.state.orderInfo.customerCityCode || this.state.orderInfo.customerCityCode.length < 4){
      if(this.state.orderInfo.productResp.productType === 0){//服务类商品，必须选择地址
        Toast.fail('请选择一个收货地址。');
        return;
      } else {//电子卡，使用商品地址
        citycode = globalVal.selectCity.code;
        this.setState({
          orderInfo: {
            ...this.state.orderInfo,
            customerCityCode: globalVal.selectCity.code,
          }
        });
      }
    }

    Toast.loading("请稍后...", 3);
    const order = await placeOrder(this.state.orderInfo, globalVal.userInfo.customerId, citycode);
    Toast.hide();
    if (order.error) {
      Toast.fail(order.error);
      return;
    }
    let orderInfo = this.state.orderInfo;
    orderInfo.id = order.orderId;
    orderInfo.payment = order.payCash;
    orderInfo.payVoucher = this.state.saveMoneyByVoucher;
    orderInfo.payRechargeCard = this.state.saveMoneyByCard;
    orderInfo.payPoint = this.state.saveMoneyByPoint;
    orderInfo.totalAmount = orderInfo.productPrice * orderInfo.count;
    orderInfo.orderTime = new Date();

    this.props.history.push({ pathname: '/OrderDetail', state: { order: orderInfo, isFromPay: true, isUnpaid: true } });


    globalVal.routeOrderInfo = null;
    globalVal.routePayCash = null;
    globalVal.routePointCard = null;
    globalVal.routeStoredCard = null;
    globalVal.routeVoucher = null;
  }

  onAddrPress = () => {
    globalVal.routeOrderInfo = this.state.orderInfo;
    globalVal.routePayCash = this.state.payCash;
    globalVal.routeIsFromPay = true;
    this.props.history.push({ pathname: '/AddressList', state: { isFromPay: true } });
  }

  onChooseCardOrVoucherPress = (type) => {
    globalVal.routeOrderInfo = this.state.orderInfo;
    globalVal.routePayCash = this.state.payCash;
    globalVal.routeIsFromProductDetail = null;
    globalVal.routeIsFromPay = true;// 是从订单页进入

    let needPayCash;
    if (type === 0) {
      needPayCash = this.state.payCash + this.state.saveMoneyByCard;
      globalVal.routeStoredCard = {
        selectedStoredCardList: this.state.selectedStoredCardList,
      }
      this.props.history.push({
        pathname: '/StoredCard', state: {
          title: '选择储值卡',
          needPayCash,//还需支付的金额 + 已选 积分卡/储值卡/代金券 的金额
        }
      });
    } else if (type === 1) {
      needPayCash = this.state.payCash + this.state.saveMoneyByVoucher;
      globalVal.routeVoucher = {
        selectedVoucherList: this.state.selectedVoucherList,
      }
      this.props.history.push({
        pathname: '/Voucher', state: {
          title: '选择代金券',
          needPayCash,//还需支付的金额 + 已选 积分卡/储值卡/代金券 的金额
        }
      });
    } else if (type === 2) {
      needPayCash = this.state.payCash + this.state.saveMoneyByPoint;
      globalVal.routePointCard = {
        selectedPointCardList: this.state.selectedPointCardList,
      }
      this.props.history.push({
        pathname: '/PointCard', state: {
          title: '选择积分卡',
          needPayCash,//还需支付的金额 + 已选 积分卡/储值卡/代金券 的金额
        }
      });
    }
  }

  //修改商品数量的时候，重置所有已选的代金券/储值卡/积分卡
  resetPayment(count, payCash) {
    if (this.state.selectedStoredCardList.length > 0 || this.state.selectedVoucherList.length > 0 || this.state.selectedPointCardList.length > 0) {
      Toast.show('已选的代金券/储值卡/积分卡已被重置，请重新选择。', 2);
      payCash = count * this.state.orderInfo.productPrice;
    }

    this.setState({
      selectedStoredCardList: [],//已经添加的储值卡
      selectedVoucherList: [],//已经添加的代金券
      selectedPointCardList: [],//已经添加的积分卡
      voucherIds: '',//选中的代金券ID  1,2,3
      rechargeCardIds: '',//选中的储值卡ID  1,2,3
      pointsCardIds: '',//选中的积分卡ID  1,2,3
      saveMoneyByPoint: 0,
      saveMoneyByCard: 0,
      saveMoneyByVoucher: 0,
      orderInfo: {
        ...this.state.orderInfo,
        count: count,
      },
    });
    return payCash;
  }
  // #endregion

  // #region render

  renderTitle(text) {
    return (<div className={styles.title}>
      <span className={styles.greyText}>{text}</span>
    </div>);
  }

  renderAddressButton() {
    const { orderInfo } = this.state;
    if (!orderInfo) return null;

    return (<div onClick={() => this.onAddrPress()}>
      <div className={styles.addressButton}>
        <div className={styles.itemLeft}>
          <div className={styles.itemFirstLine}>
            <span className={styles.firstLineText}>{orderInfo.customerAddress}</span>
          </div>
          <div className={styles.itemSecondLine}>
            <span className={styles.secondLineText}>{orderInfo.customerName}</span>
            <span className={[styles.secondLineText, styles.marginLeft20]}>{orderInfo.customerMobile}</span>
          </div>
        </div>
        <img
          className={styles.arrowImage}
          alt='添加地址'
          src={require('../../../assets/images/arrow-right.png')}
        />
      </div>
    </div>);
  }

  renderUnitPriceLabel() {
    const { orderInfo } = this.state;
    if (!orderInfo) return null;
    // console.log('orderInfo', orderInfo);
    return (<div className={styles.label}>
      <span>单价：</span>
      <span>{orderInfo.productResp.price + "积分/" + orderInfo.productResp.unitName}</span>
    </div>)
  }

  renderVisitDateButton() {
    const { orderInfo } = this.state;
    if (!orderInfo) return null;

    const today = new Date();
    const minDate = new Date(today.setDate(today.getDate() + orderInfo.productResp.delayDays));
    return (
      <List className={styles.datePickContainer}>
        <DatePicker
          value={new Date(orderInfo.date)}
          className={styles.datePicker}
          minDate={minDate}  //最小时间
          minuteStep={30}
          format="YYYY-MM-DD  HH:mm"
          mode="datetime"
          extra="Optional"
          onChange={(date) => {
            this.setState({
              orderInfo: {
                ...orderInfo,
                date,
                serviceTime: moment(`${date}`).unix() * 1000,
              }
            });
          }}
        >
          <List.Item arrow="horizontal">上门时间:</List.Item>
        </DatePicker></List>
    );
  }

  renderNumberButton() {
    const { orderInfo } = this.state;
    if (!orderInfo) return null;

    return (
      <div className={styles.label}>
        <span>{"数量(" + orderInfo.productResp.unitName + ") : "}</span>
        <div className={styles.flexDirectionRow}>
          <div onClick={() => {
            let count = orderInfo.count;
            if (count === orderInfo.lastNum) {
              return null;
            } else {
              count -= 1;
              let payCash = this.state.payCash - this.state.orderInfo.productPrice;
              payCash = this.resetPayment(count, payCash);
              this.setState({
                orderInfo: {
                  ...this.state.orderInfo,
                  count: count,
                },
                payCash: payCash
              });
            }
          }}>
            <div className={styles.numberButton}>
              <span>-</span>
            </div>
          </div>
          <span className={styles.numberText}>{orderInfo.count}</span>
          <div onClick={() => {
            const count = this.state.orderInfo.count + 1;
            let payCash = this.state.payCash + this.state.orderInfo.productPrice;

            payCash = this.resetPayment(count, payCash);
            this.setState({
              orderInfo: {
                ...this.state.orderInfo,
                count: count,
              },
              payCash: payCash
            });
          }}>
            <div className={styles.numberButton}>
              <span>+</span>
            </div>
          </div>
        </div>
      </div>);
  }

  renderReMark() {
    const { orderInfo } = this.state;
    if (!orderInfo) return null;

    return (<div>
      <TextareaItem
        className={styles.remark}
        placeholder="备注信息"
        rows={2}
        onChange={(remark) => this.setState({
          orderInfo: {
            ...orderInfo,
            customerRemark: remark,
          }
        })}
        value={orderInfo.customerRemark}
      />
    </div>);
  }

  renderRechargeCard() {
    return this.state.selectedPointCardList.length > 0 ?
      (<div className={styles.cardDisabled}>
        <div className={styles.label}>
          <span
            className={styles.greyText}>{this.state.saveMoneyByCard > 0 ? "可支付" + this.state.saveMoneyByCard + "积分" : "请选择"}</span>
          <img
            className={styles.arrowImage}
            alt='储值卡'
            src={require('@/assets/images/arrow-right.png')}
          />
        </div>
      </div>)
      :
      (<div onClick={() => this.onChooseCardOrVoucherPress(0)}>
        <div className={styles.label}>
          <span
            className={styles.greyText}>{this.state.saveMoneyByCard > 0 ? "可支付" + this.state.saveMoneyByCard + "积分" : "请选择"}</span>
          <img
            className={styles.arrowImage}
            alt='储值卡'
            src={require('@/assets/images/arrow-right.png')}
          />
        </div>
      </div>);
  }

  renderVoucher() {
    return (<div onClick={() => this.onChooseCardOrVoucherPress(1)}>
      <div className={styles.label}>
        <span
          className={styles.greyText}>{this.state.saveMoneyByVoucher > 0 ? "已节省" + this.state.saveMoneyByVoucher + "积分" : "请选择"}</span>
        <img
          className={styles.arrowImage}
          alt='代金券'
          src={require('@/assets/images/arrow-right.png')}
        />
      </div>
    </div>);
  }
  renderPointCard() {
    return this.state.selectedStoredCardList.length > 0 ?
      (<div className={`${styles.card} ${styles.cardDisabled}`}>
        <div className={styles.label}>
          <span
            className={styles.greyText}>{this.state.saveMoneyByPoint > 0 ? "可支付" + this.state.saveMoneyByPoint + "积分" : "请选择"}</span>
          <img
            className={styles.arrowImage}
            alt='积分卡'
            src={require('@/assets/images/arrow-right.png')}
          />
        </div>
      </div>)
      :
      (<div className={styles.card} onClick={() => this.onChooseCardOrVoucherPress(2)}>
        <div className={styles.label}>
          <span
            className={styles.greyText}>{this.state.saveMoneyByPoint > 0 ? "可支付" + this.state.saveMoneyByPoint + "积分" : "请选择"}</span>
          <img
            className={styles.arrowImage}
            alt='积分卡'
            src={require('@/assets/images/arrow-right.png')}
          />
        </div>
      </div>);
  }

  render() {
    return (
      <div className={styles.container}>
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={() => {
            globalVal.routeOrderInfo = null;
            globalVal.routePayCash = null;
            globalVal.routePointCard = null;
            globalVal.routeStoredCard = null;
            globalVal.routeVoucher = null;
            this.props.history.goBack()
          }}
        >下 单</NavBar>
        <div className={styles.contentContainer}>
          {this.state.orderInfo.productResp.productType === 0 ?
            this.renderTitle('地址') : null
          }
          {this.state.orderInfo.productResp.productType === 0 ?
            this.renderAddressButton() : null
          }
          {/*{this.renderTitle('地址')}*/}
          {/*{this.renderAddressButton()}*/}
          {this.renderTitle('服务')}
          {this.renderUnitPriceLabel()}
          {this.state.orderInfo.productResp.productType === 0 ?
            this.renderVisitDateButton() : null}
          {/*{this.renderVisitTimeButton()}*/}
          {this.renderNumberButton()}
          {this.state.orderInfo.productResp.productType === 0 ?
              this.renderTitle('备注') : null}
          {this.state.orderInfo.productResp.productType === 0 ?
              this.renderReMark() : null}

          {this.renderTitle('代金券')}
          {this.renderVoucher()}
          {/*{this.renderTitle('储值卡')}*/}
          {/*{this.renderRechargeCard()}*/}
          {this.renderTitle('积分卡')}
          {this.renderPointCard()}
        </div>
        <div className={styles.place} >
          <div className={styles.placeLeft}>
            <span className={styles.placeLeftText}>{"需支付: " + this.state.payCash + "积分"}</span>
          </div>
          <div className={styles.placeRight}>
            <div
              className={styles.placeRightButton}
              onClick={this.onOrderPress}
            >
              <span className={styles.placeRightText}>确认订单</span>
            </div>
          </div>
        </div>
      </div >
    );
  }
}

export default withRouter(OrderPlace);
