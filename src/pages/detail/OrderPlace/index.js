import React, { Component } from 'react';
import globalVal from '@/utils/global_val';
import styles from './styles.module.css';
import { getDefaultAddress, placeOrder } from './api';
import { Toast, DatePicker, List, TextareaItem, NavBar, Icon } from "antd-mobile";
// import TimePicker from '../../../components/TimePicker';
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
      product: {
        productPriceList: [{}]
      },
      cardInfo: [],
      voucherInfo: [],
      saveMoneyByCard: 0,
      saveMoneyByVoucher: 0,
      isChooseCard: false,
      isChooseVoucher: false,
      payCash: 0,
      hasPlace: false
    };
  }

  // #endre

  // #endregion
  async componentDidMount() {
    switch (this.props.location.state.prePage) {
      case 'product':
        return this.fromProduct();
      case 'discount':
        return this.fromDiscount();
      case 'orderdetail':
        return this.orderDetail();
      default:
        return this.fromProduct();
    }
  }


  //从商品详情页面进入
  fromProduct = async () => {
    const product = this.props.location.state.product;
    const address = await getDefaultAddress(globalVal.userInfo.customerId);
    if (address.error) {
      Toast.fail(address.error);
      return;
    }
    const order = {};
    const productResp = product;
    // productResp.id = product.id;
    //  productResp.effectiveDays = product.effectiveDays;
    productResp.price = product.productPriceList[0].price;
    // productResp.name = product.name;
    //    productResp.description = product.description;
    //  productResp.unitName = product.unitName;
    order.productResp = productResp;
    order.productId = product.id;
    order.date = moment().add(product.effectiveDays, 'days').format();
    order.time = '';
    order.serviceTime = moment(`${order.date}`).unix() * 1000;
    order.customerName = address.name;
    order.customerCityCode = address.cityCode;
    order.customerCityName = address.cityName;
    order.customerAddress = address.address;
    order.customerMobile = address.mobile;
    order.status = 1;
    order.customerRemark = "";
    // order.workerName = "张三";
    // order.workerMobile = "13999999999";
    order.productPrice = product.productPriceList[0].price;
    order.lastNum = product.lastNum;
    order.count = product.lastNum;//最小购买数量
    order.totalAmount = 0;
    order.payVoucher = "";
    order.payRechargeCard = "";
    order.payment = "";
    order.voucherIds = '';//选中的代金券ID  1,2,3
    order.rechargeCardIds = '';//选中的积分卡ID  1,2,3
    order.cardMoneys = '';//选中的积分卡使用金额 暂时不用

    const payCash = order.productPrice * order.count;

    this.setState({
      orderInfo: order,
      product: product,
      address: address,
      payCash: payCash
    });
  }

  //从积分卡/代金券选择页面返回
  fromDiscount = () => {
    // this.setState({
    //   orderInfo: this.props.location.state.orderInfo,
    //   cardInfo: this.props.location.state.cardInfoList,
    //   voucherInfo: this.props.location.state.voucherInfoList
    // });
    //如果是从之前的界面返回，没有修改选择
    if (this.props.location.state.isCancel) {
      this.setState({
        payCash: this.props.location.state.payCash
      });
    } else {
      if (this.props.location.tag === '添加积分卡') {
        this.setState({
          isChooseCard: this.props.location.state.isChoose,
        });
      } else {
        this.setState({
          isChooseVoucher: this.props.location.state.isChoose,
        });
      }
    }
    //计算 代金券/积分卡 节约的金额
    this.calculatePayCash();
  };

  //从订单页返回
  orderDetail = () => {
    this.setState({
      payCash: this.props.location.state.orderInfo.payment,
      orderInfo: this.props.location.state.orderInfo
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
    orderInfo.totalAmount = orderInfo.productPrice * orderInfo.count;
    const isPay = order.payCash === 0 ? false : true;//如果仍需要支付金额不是0 ，则显示微信支付
    this.setState({
      hasPlace: true
    });
    this.props.history.push({ pathname: '/OrderDetail', state: { order: orderInfo, isPay: isPay, isUnpaid: true } });
    // this.props.navigation.navigate('OrderDetail', { order: orderInfo, isPay: isPay, isUnpaid: true })
  }

  onAddrPress = () => {
    alert("onAddrPress");
    // this.props.navigation.navigate('AddressList', {
    //   isPay: true,
    //   setAddress: (address) => {
    //     this.setState({
    //       address: address
    //     });
    //   }
    // });

  }

  //选择代金券或者积分卡,isCard: true，添加积分卡
  onChooseCardOrVoucherPress = (isCard) => {
    var tag = "";
    if (isCard) {
      tag = "添加积分卡";
    } else {
      tag = "添加代金券";
    }
    let needPayCash;
    if (isCard) {
      needPayCash = this.state.payCash + this.state.saveMoneyByCard;
    } else {
      needPayCash = this.state.payCash + this.state.saveMoneyByVoucher;
    }
    this.props.history.push({
      pathname: '/CardAndDiscount', state: {
        isPay: true, // 是从订单页进入代金劵或积分卡界面的
        tag: tag,
        productId: this.state.orderInfo.productResp.id,
        price: this.state.orderInfo.productPrice,//单价，主要用来计算还需要多少个代金券
        needPayCash: needPayCash,//还需支付的金额 + 已选积分卡的金额（或者已选代金券的金额）
        payCash: this.state.payCash,//还需支付的金额
        cardInfoList: this.state.cardInfo,//已经添加的积分卡
        voucherInfoList: this.state.voucherInfo,//已经添加的代金券
        orderInfo: this.state.orderInfo//全部的订单信息
        // setCardOrVoucherInfo: (info, isChoose) => {// info : 选择的积分卡或者代金券；isChoose：是否选择了，false为不用
        //   if (!isChoose) {
        //     //把所有界面相关对象重置
        //     if (isCard) {
        //       //计算需支付金额
        //       const payCash = this.state.payCash + this.state.saveMoneyByCard;
        //       this.setState({
        //         cardInfo: [],
        //         saveMoneyByCard: 0,
        //         isChooseCard: isChoose,
        //         payCash: payCash,
        //         rechargeCardIds: ''
        //       });
        //     } else {
        //       //计算需支付金额
        //       const payCash = this.state.payCash + this.state.saveMoneyByVoucher;
        //       this.setState({
        //         voucherInfo: [],
        //         saveMoneyByVoucher: 0,
        //         isChooseVoucher: isChoose,
        //         payCash: payCash,
        //         voucherIds: '',
        //       });
        //     }
        //     return;
        //   }
        //   //如果有选中的代金券和积分卡，则对界面绑定对象的赋值
        //   if (isCard) {
        //     this.setState({
        //       cardInfo: info,
        //       isChooseCard: isChoose
        //     });
        //   } else {//选择代金券，需要用户重新选择积分卡
        //     this.setState({
        //       cardInfo: [],
        //       saveMoneyByCard: 0,
        //       isChooseCard: false,
        //       voucherInfo: info,
        //       isChooseVoucher: isChoose
        //     });
        //   }
        //   this.calculatePayCash(isCard, info);
        // }
      }
    });
  }
  // #endregion

  //计算还需要支付多少钱，同时添加代金券/积分卡 的id字符串，界面显示代金券/积分卡对应的支付金额
  // calculatePayCash(tag, info) {
  //   let amount = 0;
  //   let ids = '';
  //   let payCash = this.state.payCash;
  //   if (tag === '添加积分卡') {
  //     payCash += this.state.saveMoneyByCard;//支付金额回到选择积分卡之前的状态
  //     for (const i of info) {
  //       amount += i.balance;
  //       ids += i.id + ",";//积分卡ID 字符串
  //     }
  //     amount = payCash > amount ? amount : payCash;
  //     this.setState({
  //       saveMoneyByCard: amount,
  //       orderInfo: {
  //         ...this.state.orderInfo,
  //         rechargeCardIds: ids
  //       },
  //     });
  //   } else {
  //     payCash += this.state.saveMoneyByVoucher;//支付金额回到选择代金券之前的状态
  //     payCash += this.state.saveMoneyByCard;//选择代金券，需要用户重新选择积分卡
  //     for (const i of info) {
  //       amount += i.count * this.state.orderInfo.productPrice;
  //       ids += i.id + ",";//代金券ID 字符串
  //     }
  //     this.setState({
  //       saveMoneyByVoucher: amount,
  //       orderInfo: {
  //         ...this.state.orderInfo,
  //         voucherIds: ids
  //       },
  //     });
  //   }
  //   payCash -= amount;
  //   payCash = payCash < 0 ? 0 : payCash;
  //   this.setState({
  //     payCash: payCash
  //   });
  // }
  calculatePayCash() {
    let cardAmount = 0;
    let voucherAmount = 0;
    let cardIds = '';
    let voucherIds = '';
    let payCash = 0;
    for (const i of this.props.location.state.cardInfoList) {
      cardAmount += i.balance;
      cardIds += i.id + ",";//积分卡ID 字符串
    }

    for (const i of this.props.location.state.voucherInfoList) {
      voucherAmount += i.count * this.props.location.state.orderInfo.productPrice;
      voucherIds += i.id + ",";//代金券ID 字符串
    }
    payCash = this.props.location.state.orderInfo.productPrice * this.props.location.state.orderInfo.count;
    cardAmount = (payCash - voucherAmount) > cardAmount ? cardAmount : payCash - voucherAmount;
    payCash = (payCash - cardAmount - voucherAmount) <= 0 ? 0 : (payCash - cardAmount - voucherAmount);

    this.props.location.state.orderInfo.rechargeCardIds = cardIds;
    this.props.location.state.orderInfo.voucherIds = voucherIds;
    this.setState({
      saveMoneyByCard: cardAmount,
      saveMoneyByVoucher: voucherAmount,
      payCash: payCash,
      orderInfo: this.props.location.state.orderInfo,
      cardInfo: this.props.location.state.cardInfoList,
      voucherInfo: this.props.location.state.voucherInfoList
    });
  }

  // #region render

  renderTitle(text) {
    return (<div className={styles.title}>
      <span className={styles.greyText}>{text}</span>
    </div>);
  }

  renderAddressButton(text) {
    const { orderInfo } = this.state;
    return (<div onClick={() => this.onAddrPress()}>
      <div className={styles.addressButton}>
        <div className={styles.itemLeft}>
          <div className={styles.itemFirstLine}>
            <span className={styles.firstLineText}>{orderInfo.customerAddress}</span>
            {/*<span className={[styles.firstLineText, styles.marginLeft10]}>{number}</span>*/}
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
    return (<div className={styles.label}>
      <span>单价：</span>
      <span>{orderInfo.productResp.price + "元/" + orderInfo.productResp.unitName}</span>
    </div>)
  }

  renderVisitDateButton() {
    const { orderInfo } = this.state;
    // const { date, time } = orderInfo;
    const today = new Date();
    const minDate = new Date(today.setDate(today.getDate() + orderInfo.productResp.effectiveDays));
    return (
      <List className={styles.datePickContainer}>
        <DatePicker
          value={minDate}
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
    return (<div>
      <TextareaItem
        className={styles.remark}
        placeholder="备注信息"
        rows={2}
        onChange={(remark) => this.setState({
          orderInfo: {
            ...this.state.orderInfo,
            customerRemark: remark,
          }
        })}
        value={this.state.orderInfo.customerRemark}
      />
    </div>);
  }

  renderCard() {
    return (<div className={styles.card} onClick={() => this.onChooseCardOrVoucherPress(true)}>
      <div className={styles.label}>
        <span
          className={styles.greyText}>{this.state.saveMoneyByCard > 0 ? "可支付" + this.state.saveMoneyByCard + "元" : "请选择"}</span>
        <img
          className={styles.arrowImage}
          alt='积分卡'
          src={require('@/assets/images/arrow-right.png')}
        />
      </div>
    </div>);
  }

  renderVoucher() {
    return (<div onClick={() => this.onChooseCardOrVoucherPress(false)}>
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

  render() {
    return (
      <div className={styles.container}>
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={() =>
            this.props.history.push({ pathname: '/ProductDetail', state: { productDetail: this.state.orderInfo.productResp } })
          }
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
          {this.renderTitle('积分卡')}
          {this.renderCard()}
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
      </div>
    );
  }
}

export default withRouter(OrderPlace);
