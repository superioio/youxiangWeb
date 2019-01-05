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
      orderInfo: null,
      address: {},
      cardInfo: [],
      voucherInfo: [],
      pointCardInfo: [],
      saveMoneyByPoint: 0,
      saveMoneyByCard: 0,
      saveMoneyByVoucher: 0,
      payCash: 0,
      hasPlace: false
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
    console.log('getAddressInfo', globalVal.routeAddress);
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
        Toast.fail(address.error);
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
    if (!globalVal.routeDiscount) return;

    const orderInfo = globalVal.routeOrderInfo;
    let { cardInfoList, voucherInfoList, pointInfoList } = globalVal.routeDiscount;
    let cardAmount = 0;
    let voucherAmount = 0;
    let pointAmount = 0;
    let cardIds = '';
    let voucherIds = '';
    let pointCardIds = '';
    var payCash = 0;
    for (const i of cardInfoList) {
      cardAmount += i.balance;
      cardIds += i.id + ",";//储值卡ID 字符串
    }

    for (const i of voucherInfoList) {
      voucherAmount += i.count * orderInfo.productPrice;
      voucherIds += i.id + ",";//代金券ID 字符串
    }

    for (const i of pointInfoList) {
        pointAmount += i.balance * i.projectResp.pointConversionRate;
        pointCardIds += i.id + ",";//积分卡ID 字符串
    }
    payCash = orderInfo.productPrice * orderInfo.count;
    voucherAmount = voucherAmount > payCash ? payCash : voucherAmount;
    //如果代金券已经抵扣全部，则把其余的支付方式置空
    if(voucherAmount === payCash){
      cardAmount = 0;
      pointAmount = 0;
      cardInfoList = [];
      pointInfoList = [];
      cardIds  = '';
      pointCardIds = '';
    } else {
      cardAmount = (payCash - voucherAmount) > cardAmount ? cardAmount : payCash - voucherAmount;
      pointAmount = (payCash - voucherAmount - cardAmount) > pointAmount ? pointAmount : payCash - voucherAmount - cardAmount;
    }
    payCash = (payCash - cardAmount - voucherAmount - pointAmount) <= 0 ? 0 : (payCash - cardAmount - voucherAmount - pointAmount);
    globalVal.routePayCash = payCash;
    orderInfo.rechargeCardIds = cardIds;
    orderInfo.voucherIds = voucherIds;
    orderInfo.pointCardIds = pointCardIds;
    this.setState({
      saveMoneyByCard: cardAmount,
      saveMoneyByVoucher: voucherAmount,
      cardInfo: cardInfoList,
      voucherInfo: voucherInfoList,
      saveMoneyByPoint: pointAmount,
      pointCardInfo: pointInfoList,
    });
  };


  // #region 相应方法

  //确认下单按钮
  onOrderPress = async () => {
    Toast.loading("请稍后...", 3);
    const order = await placeOrder(this.state.orderInfo, globalVal.userInfo.customerId);
    Toast.hide();
    if (order.error) {
      Toast.fail(order.error);
      return;
    }
    let orderInfo = this.state.orderInfo;
    orderInfo.id = order.orderId;
    orderInfo.payment = order.payCash;
    orderInfo.payVoucher = this.state.voucherInfo.length;
    orderInfo.payRechargeCard = this.state.saveMoneyByCard;
    orderInfo.payPoint = this.state.saveMoneyByPoint;
    orderInfo.totalAmount = orderInfo.productPrice * orderInfo.count;
    const isFromPay = order.payCash === 0 ? false : true;//如果仍需要支付金额不是0 ，则显示微信支付
    this.setState({
      hasPlace: true
    });
    this.props.history.push({ pathname: '/OrderDetail', state: { order: orderInfo, isFromPay: isFromPay, isUnpaid: true } });
    // this.props.navigation.navigate('OrderDetail', { order: orderInfo, isFromPay: isFromPay, isUnpaid: true })
  }

  onAddrPress = () => {
    globalVal.routeOrderInfo = this.state.orderInfo;
    globalVal.routePayCash = this.state.payCash;
    globalVal.routeIsFromPay = true;
    this.props.history.push({ pathname: '/AddressList', state: { isFromPay: true } });
  }

  //选择代金券或者积分卡,isCard: true，添加积分卡
  onChooseCardOrVoucherPress = (type) => {
    var tag = "";
    let needPayCash;
    if (type === 0) {
      tag = "选择储值卡";
      needPayCash = this.state.payCash + this.state.saveMoneyByCard;
    } else if (type === 1) {
      tag = "选择代金券";
      needPayCash = this.state.payCash + this.state.saveMoneyByVoucher;
    } else if (type === 2){
      tag = "选择积分卡";
      needPayCash = this.state.payCash + this.state.saveMoneyByPoint;
    }
    globalVal.routeOrderInfo = this.state.orderInfo;
    globalVal.routePayCash = this.state.payCash;
    globalVal.routeIsFromProductDetail = null;
    globalVal.routeIsFromPay = true;// 是从订单页进入代金劵或积分卡界面的
    this.props.history.push({
      pathname: '/CardAndDiscount', state: {
        tag: tag,
        needPayCash: needPayCash,//还需支付的金额 + 已选 积分卡/储值卡/代金券 的金额
        cardInfoList: this.state.cardInfo,//已经添加的储值卡
        voucherInfoList: this.state.voucherInfo,//已经添加的代金券
        pointInfoList: this.state.pointCardInfo,//已经添加的积分卡
      }
    });
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
      <span>{orderInfo.productResp.price + "元/" + orderInfo.productResp.unitName}</span>
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

  renderVisitTimeButton = () => {
    // const { orderInfo } = this.state;
    // const { date, time } = orderInfo;
    return (<div>
      <div className={styles.label}>
        <span>上门时间：</span>
        {/*<TimePicker*/}
        {/*date={date}*/}
        {/*time={time}*/}
        {/*confrim={(time) => {*/}
        {/*this.setState({*/}
        {/*orderInfo: {*/}
        {/*...orderInfo,*/}
        {/*time,*/}
        {/*serviceTime: moment(`${date} ${time}`).unix() * 1000,*/}
        {/*}*/}
        {/*});*/}
        {/*}}*/}
        {/*/>*/}
      </div>
    </div>);
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
              const payCash = this.state.payCash - this.state.orderInfo.productPrice;
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
            const payCash = this.state.payCash + this.state.orderInfo.productPrice;
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
    return this.state.pointCardInfo.length > 0 ?
        (<div className={styles.cardDisabled}>
      <div className={styles.label}>
        <span
          className={styles.greyText}>{this.state.saveMoneyByCard > 0 ? "可支付" + this.state.saveMoneyByCard + "元" : "请选择"}</span>
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
          className={styles.greyText}>{this.state.saveMoneyByCard > 0 ? "可支付" + this.state.saveMoneyByCard + "元" : "请选择"}</span>
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
          className={styles.greyText}>{this.state.saveMoneyByVoucher > 0 ? "已节省" + this.state.saveMoneyByVoucher + "元" : "请选择"}</span>
        <img
          className={styles.arrowImage}
          alt='代金券'
          src={require('@/assets/images/arrow-right.png')}
        />
      </div>
    </div>);
  }
  renderPointCard() {
   return this.state.cardInfo.length > 0 ?
       (<div className={`${styles.card} ${styles.cardDisabled}`}>
          <div className={styles.label}>
      <span
          className={styles.greyText}>{this.state.saveMoneyByPoint > 0 ? "可支付" + this.state.saveMoneyByPoint + "元" : "请选择"}</span>
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
          className={styles.greyText}>{this.state.saveMoneyByPoint > 0 ? "可支付" + this.state.saveMoneyByPoint + "元" : "请选择"}</span>
        <img
            className={styles.arrowImage}
            alt='积分卡'
            src={require('@/assets/images/arrow-right.png')}
        />
      </div>
    </div>) ;
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
            globalVal.routeDiscount = null;
            this.props.history.goBack()
          }}
        >下 单</NavBar>
        <div className={styles.contentContainer}>
          {this.renderTitle('地址')}
          {this.renderAddressButton()}
          {this.renderTitle('服务')}
          {this.renderUnitPriceLabel()}
          {this.renderVisitDateButton()}
          {/*{this.renderVisitTimeButton()}*/}
          {this.renderNumberButton()}
          {this.renderTitle('备注')}
          {this.renderReMark()}
          {this.renderTitle('代金券')}
          {this.renderVoucher()}
          {this.renderTitle('储值卡')}
          {this.renderRechargeCard()}
          {this.renderTitle('积分卡')}
          {this.renderPointCard()}
        </div>
        <div className={styles.place} >
          <div className={styles.placeLeft}>
            <span className={styles.placeLeftText}>{"需支付: " + this.state.payCash + "元"}</span>
          </div>
          <div className={styles.placeRight}>
            <div
              className={styles.placeRightButton}
              onClick={this.onOrderPress}
            >
              <span className={styles.placeRightText}>下一步</span>
            </div>
          </div>
        </div>
      </div >
    );
  }
}

export default withRouter(OrderPlace);
