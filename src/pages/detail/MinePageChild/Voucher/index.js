import React, { Component } from 'react';
import moment from 'moment';
import { dateFormat } from '@/utils';
import {
  exchangeVoucher,
  getDiscountList,
  getVoucherListByProduct,
} from "./api";
import { Flex, Icon, NavBar, Toast, Modal } from "antd-mobile";
import { withRouter } from "react-router-dom";
import styles from './styles.module.css';
import globalVal from '@/utils/global_val';

class Voucher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      voucherList: [], // 代金劵
      selectedVoucherList: [],// 选中的代金劵

      exchangeCode: '1234',
      overPayCash: false,
      isScanExpiry: false, // 查看失效代金劵或是查看有效代金劵
    };
  }

  // #endregion

  // #region 生命周期

  async componentDidMount() {
    this.loadEffectiveData();
  }

  // #endregion

  // #region 方法
  loadEffectiveData = async () => {
    const { selectedVoucherList } = globalVal.routeIsFromPay ?
      globalVal.routeVoucher : { selectedVoucherList: [] };
    const { title } = this.props.location.state;
    let voucherList;
    Toast.loading("请稍后...", 3);
    switch (title) {
      case "我的代金券":
        voucherList = await getDiscountList(2, globalVal.userInfo.customerId);
        break;
      case "选择代金券":
        voucherList = await getVoucherListByProduct(globalVal.userInfo.customerId, globalVal.routeOrderInfo.productId, globalVal.selectCity.code);
        break;
      default:
        break;
    }
    Toast.hide();
    if (voucherList.error) {
      Toast.fail(voucherList.error);
      return;
    }

    this.setState({
      isScanExpiry: false,
      voucherList,
      selectedVoucherList,
    }, this.checkChooseStatus);
  }

  loadUnEffectiveData = async () => {
    let voucherList = [];

    Toast.loading("请稍后...", 3);
    voucherList = await getDiscountList(1, globalVal.userInfo.customerId);
    Toast.hide();
    if (voucherList.error) {
      Toast.fail(voucherList.error);
    }

    this.setState({
      isScanExpiry: true,
      voucherList,
    });

  }

  itemCanPress = (item) => {
    const { isScanExpiry, overPayCash } = this.state;
    const { effectiveTime } = item;
    const isSelect = this.state.selectedPointCardList.some(n => n.id === item.id);
    if (isScanExpiry) {
      return false;
    } else if (overPayCash && !isSelect) {
      return false;
    } else if (moment(effectiveTime).isAfter(moment())) {
      return false;
    }
    return styles.tabContentItem;
  }

  //计算其他 代金券/储值卡/积分卡 是否仍然可选,储值卡直接计算余额，代金券计算个数*单价
  checkChooseStatus() {
    if (!globalVal.routeIsFromPay) {
      return;
    }

    const { needPayCash } = this.props.location.state;
    const { productPrice } = globalVal.routeOrderInfo;
    let balance = 0;

    this.state.selectedVoucherList.forEach(item => {
      balance += item.count * productPrice;
    });

    if (balance >= needPayCash) {
      this.setState({
        overPayCash: true,
      });
    } else {
      this.setState({
        overPayCash: false,
      });
    }
  }

  // #endregion

  // #region 响应方法

  //添加选中的代金券或者积分卡
  onSubmit = () => {
    const selectedVoucherList = this.state.selectedVoucherList;

    globalVal.routeVoucher = {
      selectedVoucherList,
    };
    this.props.history.goBack();
  }

  //选中一个代金券
  onChoosePress = (item) => {
    if (!globalVal.routeIsFromPay) {
      return;
    }
    if (!this.itemCanPress(item)) {
      return;
    }

    const isSelect = this.state.selectedVoucherList.some(n => n.id === item.id);
    if (isSelect) {
      this.setState({//添加到选中列表中
        selectedVoucherList: this.state.selectedVoucherList.filter(n => n.id !== item.id),
      }, () => {
        this.checkChooseStatus();
      });
    } else {
      this.setState(prevState => ({//添加到选中列表中
        selectedVoucherList: [...prevState.selectedVoucherList, item],
      }), () => {
        this.checkChooseStatus();
      });
    }
  }

  async onExchangePress(exchangeCode, resolve) {
    Toast.loading("请稍后...", 3);
    const result = await exchangeVoucher(exchangeCode, globalVal.userInfo.customerId);

    Toast.hide();
    if (result.error) {
      Toast.fail(result.error);
      return;
    }
    Toast.loading("兑换成功", 2);
    resolve();
    this.loadEffectiveData();
  }

  //点击  “查看更多”  按钮，此时应该隐藏 “查看更多”
  onMorePress = async (moreText) => {
    const { isScanExpiry } = this.state;
    if (isScanExpiry) {
      this.loadEffectiveData();
    } else {
      this.loadUnEffectiveData();
    }
  }

  // #endregion

  // #region render

  renderCheck = (isSelect) => {
    if (!isSelect) return null;

    return (<div className={styles.check}>
      <span className={styles.checkText}>✓</span>
    </div>);
  }

  renderDiscountItem = (item, index) => {
    const isCanPress = this.itemCanPress(item);
    const isSelect = this.state.selectedVoucherList.some(n => n.id === item.id);

    return (<div key={index}>
      <Flex className={isCanPress ? styles.tabContentItem : styles.tabOverPayCash}
        onClick={() => this.onChoosePress(item)}>
        <div className={styles.leftTabItem}>
          <span className={styles.leftText}>{item.count + "个单位"}</span>
        </div>
        <div className={styles.rightTabItem}>
          <div>{item.name}</div>
          <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至" + dateFormat(item.expiryTime)}</div>
        </div>
        <div className={styles.checkContain}>
          {this.renderCheck(isSelect)}
        </div>
      </Flex>
    </div>);
  }

  renderDiscountList() {
    const { voucherList } = this.state;
    if (!voucherList || !voucherList.length) return;

    return (<div className={styles.tabContent}>
      {voucherList.map((item, index) => this.renderDiscountItem(item, index))}
      <div className={styles.margin}></div>
    </div>);
  }

  renderFooter = () => {
    const { isScanExpiry } = this.state;
    return <div className={styles.footer}>
      <div className={styles.moreText} onClick={() => this.onMorePress()}>
        <span>{isScanExpiry ? '查看有效的代金劵' : '查看失效的代金劵'}</span>
      </div>
      {globalVal.routeIsFromPay ?
        <div className={styles.exchangeBtn} onClick={this.onSubmit}>
          <div>
            <span className={styles.exchangeText}>{"确定"}</span>
          </div>
        </div> :
        <div className={styles.exchangeBtn} onClick={() => Modal.prompt('输入兑换码', '请输入您的兑换码',
          [
            { text: '取消' },
            {
              text: '确定',
              onPress: exchangeCode => new Promise((resolve, reject) => {
                if (exchangeCode === '') {
                  Toast.fail('请填写正确的兑换码。', 1);
                  return;
                }
                this.onExchangePress(exchangeCode, resolve);

              }),
            },
          ], 'default', null, ['兑换码'])}
        >
          <div>
            <span className={styles.exchangeText}>{"兑换代金劵"}</span>
          </div>
        </div>
      }
    </div>
  }


  render() {
    const { title } = this.props.location.state;
    return (
      <div className={styles.container}>
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={() => this.props.history.goBack()}
        >
          {title}
        </NavBar>
        {this.renderDiscountList()}

        {this.renderFooter()}
      </div>
    );
  }
}

export default withRouter(Voucher);
