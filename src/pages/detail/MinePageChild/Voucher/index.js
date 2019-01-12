import React, { Component } from 'react';
import { dateFormat } from '@/utils';
import {
  exchangeVoucher,
  getDiscountList,
  getVoucherListByProduct,
} from "./api";
// import moment from 'moment';
import { Flex, Icon, NavBar, Toast, Modal } from "antd-mobile";
import { withRouter } from "react-router-dom";
import styles from './styles.module.css';
import globalVal from '@/utils/global_val';

class Voucher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exchangeCode: '1234',

      voucherList: [],
      selectedVoucherList: [],
      showMore: true,
      overPayCash: false,

      moreText: '查看失效的代金劵',
      title: ''
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
    const { selectedVoucherList } = globalVal.routeVoucher;
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
      title,
      moreText: '查看失效的代金劵',
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
      moreText: '查看有效的代金券',
      voucherList,
      overPayCash: true,
    });

  }

  //计算其他 代金券/储值卡/积分卡 是否仍然可选,储值卡直接计算余额，代金券计算个数*单价
  checkChooseStatus() {
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
  onChoosePress = (info) => {
    const isSelect = this.state.selectedVoucherList.some(n => n.id === info.id);
    if (isSelect) {
      this.setState({//添加到选中列表中
        selectedVoucherList: this.state.selectedVoucherList.filter(n => n.id !== info.id),
      }, () => {
        this.checkChooseStatus();
      });
    } else {
      this.setState(prevState => ({//添加到选中列表中
        selectedVoucherList: [...prevState.selectedVoucherList, info],
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
    if (RegExp(/有效/).test(moreText)) {
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
    const { overPayCash } = this.state;
    const isSelect = this.state.selectedVoucherList.some(n => n.id === item.id);
    if (overPayCash && !isSelect) {
      return (<div key={index}>
        <div className={styles.tabOverPayCash}>
          <div className={styles.leftTabItem}>
            <span className={styles.leftText}>{item.count + "个单位"}</span>
          </div>
          <div className={styles.rightTabItem}>
            <div className={styles.line}>{item.name}</div>
            <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至" + dateFormat(item.expiryTime)}</div>
          </div>
          <div className={styles.checkContain}>
          </div>
        </div>
      </div>);
    }

    return (<div key={index}>
      <Flex className={styles.tabContentItem} onClick={() => this.onChoosePress(item)}>
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
  renderUnPressDiscountItem = (item, index) => {
    const { overPayCash } = this.state;
    return (<div key={index}>
      <Flex className={overPayCash ? styles.tabOverPayCash : styles.tabContentItem}>
        <div className={styles.leftTabItem}>
          <span className={styles.leftText}>{item.count + "个单位"}</span>
        </div>
        <div className={styles.rightTabItem}>
          <div>{item.name}</div>
          <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至" + dateFormat(item.expiryTime)}</div>
        </div>
      </Flex>
    </div>);
  }

  renderDiscountList() {
    const { voucherList } = this.state;
    if (!voucherList || !voucherList.length) return;

    return (<div className={styles.tabContent}>
      {voucherList.map((item, index) => globalVal.routeIsFromPay
        ? this.renderDiscountItem(item, index) : this.renderUnPressDiscountItem(item, index))}
      <div className={styles.margin}></div>
    </div>);
  }

  renderFooter = () => {
    const { moreText, title } = this.state;
    return <div className={styles.footer}>
      <div className={styles.moreText} onClick={() => this.onMorePress(moreText)}>
        <span>{moreText}</span>
      </div>
      {(RegExp(/选择/).test(title)) ?
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
            <span className={styles.exchangeText}>{"兑换" + this.state.title}</span>
          </div>
        </div>
      }
    </div>
  }


  render() {
    const { title } = this.state;
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
