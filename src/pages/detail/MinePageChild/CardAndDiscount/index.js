import React, { Component } from 'react';
import { dateFormat } from '@/utils';
import {
  exchangeCard,
  exchangeVoucher,
  exchangePoint,
  getCardList,
  getDiscountList,
  getPointList,
  getVoucherListByProduct,
  getCardListByProduct,
  getPointListByProduct,

} from "./api";
// import moment from 'moment';
import { Flex, Icon, NavBar, Toast, Modal } from "antd-mobile";
import { withRouter } from "react-router-dom";
import styles from './styles.module.css';
import globalVal from '@/utils/global_val';

class CardAndDiscount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      exchangeCode: '1234',
      selectedList: [], //选中的代金券/积分卡/储值卡列表
      showMore: true,
      overPayCash: false,

      moreText: '',
      tag: ''
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
    let list = {};
    let title = '';
    let moreText = '';
    Toast.loading("请稍后...", 3);
    switch (this.props.location.state.tag) {
      case "储值卡":
        list = await getCardList(2, globalVal.userInfo.customerId);

        title = "我的储值卡";
        moreText = '查看失效的储值卡';
        break;
      case "选择储值卡":
        title = this.props.location.state.tag;
        moreText = '查看失效的储值卡';
        list = await getCardListByProduct(globalVal.userInfo.customerId, globalVal.routeOrderInfo.productId, globalVal.selectCity.code);
        this.setState({
          selectedList: this.props.location.state.cardInfoList,
        }, () => {
          this.checkChooseStatus(0);
        });
        break;
      case "代金券":
        title = "我的代金券";
        list = await getDiscountList(2, globalVal.userInfo.customerId);
        moreText = '查看失效的代金劵';
        break;
      case "选择代金券":
        title = this.props.location.state.tag;
        moreText = '查看失效的代金劵';
        list = await getVoucherListByProduct(globalVal.userInfo.customerId, globalVal.routeOrderInfo.productId, globalVal.selectCity.code);
        this.setState({
          selectedList: this.props.location.state.voucherInfoList,
        }, () => {
          this.checkChooseStatus(1);
        });

        break;
      case "积分卡":
        title = "我的积分卡";
        list = await getPointList(2, globalVal.userInfo.customerId);
        moreText = '查看失效的积分卡';
        break;
      case "选择积分卡":
        title = this.props.location.state.tag;
        moreText = '查看失效的积分卡';
        list = await getPointListByProduct(globalVal.userInfo.customerId, globalVal.routeOrderInfo.productId, globalVal.selectCity.code);
        this.setState({
          selectedList: this.props.location.state.pointInfoList,
        }, () => {
          this.checkChooseStatus(2);
        });

        break;
      default:
        break;
    }
    Toast.hide();

    this.setState({
      title: title,
      tag: this.props.location.state.tag,
      list: list,
      overPayCash: false,
      moreText,
    });
    if (list.error) {
      Toast.fail(list.error);
      return;
    }
  }

  loadUnEffectiveData = async () => {
    let list = [];
    let title = '';
    let moreText = '';
    Toast.loading("请稍后...", 3);
    if (RegExp(/积分卡/).test(this.props.location.state.tag)) {
      list = await getPointList(1, globalVal.userInfo.customerId);
      title = '失效的积分卡';
      moreText = '查看有效的积分卡';
    } else if (RegExp(/代金券/).test(this.props.location.state.tag)) {
      list = await getDiscountList(1, globalVal.userInfo.customerId);
      title = '失效的代金券';
      moreText = '查看有效的代金券';
    } else if (RegExp(/储值卡/).test(this.props.location.state.tag)) {
      list = await getCardList(1, globalVal.userInfo.customerId);
      title = '失效的储值卡';
      moreText = '查看有效的储值卡';
    }
    this.setState({
      title: title,
      list: list,
      overPayCash: true,
      moreText,
    });
    Toast.hide();
    if (list.error) {
      Toast.fail(list.error);
    }
  }

  //计算其他 代金券/储值卡/积分卡 是否仍然可选,储值卡直接计算余额，代金券计算个数*单价
  checkChooseStatus(isCard) {
    const needPayCash = this.props.location.state.needPayCash;
    const price = globalVal.routeOrderInfo.productPrice;
    let balance = 0;
    if (isCard === 0) {
      this.state.selectedList.forEach(item => {
        balance += item.balance;
      });
    } else if (isCard === 1) {
      this.state.selectedList.forEach(item => {
        balance += item.count * price;
      });
    } else if (isCard === 2) {
      this.state.selectedList.forEach(item => {
        balance += item.balance * item.projectResp.pointConversionRate;
      });
    }
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
    let cardInfoList = this.props.location.state.cardInfoList;
    let voucherInfoList = this.props.location.state.voucherInfoList;
    let pointInfoList = this.props.location.state.pointInfoList;
    if (RegExp(/储值卡/).test(this.props.location.state.tag)) {
      cardInfoList = this.state.selectedList;
    } else if (RegExp(/代金券/).test(this.props.location.state.tag)) {
      voucherInfoList = this.state.selectedList;
    } else if (RegExp(/积分卡/).test(this.props.location.state.tag)) {
      pointInfoList = this.state.selectedList;
    }
    globalVal.routeDiscount = {
      tag: this.props.location.state.tag,//标识 此界面是 代金券 还是 积分卡 还是 储值卡
      voucherInfoList: voucherInfoList,
      cardInfoList: cardInfoList,
      pointInfoList: pointInfoList
    };
    this.props.history.goBack();
  }

  //选中一个代金券/积分卡/储值卡
  onChoosePress = (info, isCard) => {
    const isSelect = this.state.selectedList.some(n => n.id === info.id);
    if (isSelect) {
      this.setState({//添加到选中列表中
        selectedList: this.state.selectedList.filter(n => n.id !== info.id),
      }, () => {
        this.checkChooseStatus(isCard);
      });
    } else {
      this.setState(prevState => ({//添加到选中列表中
        selectedList: [...prevState.selectedList, info],
      }), () => {
        this.checkChooseStatus(isCard);
      });
    }
  }

  async onExchangePress(exchangeCode, resolve) {
    let result;
    Toast.loading("请稍后...", 3);
    if (RegExp(/储值卡/).test(this.props.location.state.tag)) {
      result = await exchangeCard(exchangeCode, globalVal.userInfo.customerId)
    } else if (RegExp(/代金券/).test(this.props.location.state.tag)) {
      result = await exchangeVoucher(exchangeCode, globalVal.userInfo.customerId);
    } else if (RegExp(/积分卡/).test(this.props.location.state.tag)) {
      result = await exchangePoint(exchangeCode, globalVal.userInfo.customerId);
    }
    // result = this.props.location.state.tag === "积分卡"
    //   ? await exchangeCard(this.state.exchangeCode)
    //   : await exchangeVoucher(this.state.exchangeCode);
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

  renderCardItem = (item, index) => {
    const { overPayCash } = this.state;
    const isSelect = this.state.selectedList.some(n => n.id === item.id);

    if (overPayCash && !isSelect) {
      return (<div key={index}>
        <div className={styles.tabOverPayCash}>
          <div className={styles.leftTabItem}>
            <span className={styles.leftText}>{item.faceValue + "元"}</span>
          </div>
          <div className={styles.rightTabItem}>
            <div>{item.name}</div>
            <div>{"剩余 : " + item.balance + "元"}</div>
            <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至"+ dateFormat(item.expiryTime)}</div>
          </div>
          <div className={styles.checkContain}>
          </div>
        </div>
      </div>)
    }

    return (<div key={index}>
      <Flex className={styles.tabContentItem} onClick={() => this.onChoosePress(item, 0)}>
        <div className={styles.leftTabItem}>
          <span className={styles.leftText}>{item.faceValue + "元"}</span>
        </div>
        <div className={styles.rightTabItem}>
          <div>{item.name}</div>
          <div>{"剩余 : " + item.balance + "元"}</div>
          <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至"+ dateFormat(item.expiryTime)}</div>
        </div>
        <div className={styles.checkContain}>
          {this.renderCheck(isSelect)}
        </div>
      </Flex>
    </div>)
  }

  renderUnPressCardItem = (item, index) => {
    const { overPayCash } = this.state;
    return (<div key={index}>
      <Flex className={overPayCash ? styles.tabOverPayCash : styles.tabContentItem}>
        <div className={styles.leftTabItem}>
          <span className={styles.leftText}>{item.faceValue + "元"}</span>
        </div>
        <div className={styles.rightTabItem}>
          <div>{item.name}</div>
          <div>{"剩余 : " + item.balance + "元"}</div>
          <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至"+ dateFormat(item.expiryTime)}</div>
        </div>
      </Flex>
    </div>);
  }

  renderCardList = () => {
    const { list } = this.state;
    if (!list || !list.length) return;

    return (<div className={styles.tabContent}>
      {list.map((item, index) =>
        globalVal.routeIsFromPay
          ? this.renderCardItem(item, index) : this.renderUnPressCardItem(item, index))}
      <div className={styles.margin}></div>
    </div>);
  }

  renderDiscountItem = (item, index) => {
    const { overPayCash } = this.state;
    const isSelect = this.state.selectedList.some(n => n.id === item.id);
    if (overPayCash && !isSelect) {
      return (<div key={index}>
        <div className={styles.tabOverPayCash}>
          <div className={styles.leftTabItem}>
            <span className={styles.leftText}>{item.count + "个单位"}</span>
          </div>
          <div className={styles.rightTabItem}>
            <div className={styles.line}>{item.name}</div>
            <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至"+ dateFormat(item.expiryTime)}</div>
          </div>
          <div className={styles.checkContain}>
          </div>
        </div>
      </div>);
    }

    return (<div key={index}>
      <Flex className={styles.tabContentItem} onClick={() => this.onChoosePress(item, 1)}>
        <div className={styles.leftTabItem}>
          <span className={styles.leftText}>{item.count + "个单位"}</span>
        </div>
        <div className={styles.rightTabItem}>
          <div>{item.name}</div>
          <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至"+ dateFormat(item.expiryTime)}</div>
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
          <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至"+ dateFormat(item.expiryTime)}</div>
        </div>
      </Flex>
    </div>);
  }

  renderDiscountList() {
    const { list } = this.state;
    if (!list || !list.length) return;

    return (<div className={styles.tabContent}>
      {list.map((item, index) => globalVal.routeIsFromPay
        ? this.renderDiscountItem(item, index) : this.renderUnPressDiscountItem(item, index))}
      <div className={styles.margin}></div>
    </div>);
  }

  renderPointItem = (item, index) => {
    const { overPayCash } = this.state;
    const isSelect = this.state.selectedList.some(n => n.id === item.id);

    if (overPayCash && !isSelect) {
      return (<div key={index}>
        <div className={styles.tabOverPayCash}>
          <div className={styles.leftTabItem}>
            <span className={styles.leftText}>{item.faceValue + "积分"}</span>
          </div>
          <div className={styles.rightTabItem}>
            <div>{item.name}</div>
            <div>{"剩余 : " + item.balance + "积分"}</div>
            <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至"+ dateFormat(item.expiryTime)}</div>
          </div>
          <div className={styles.checkContain}>
          </div>
        </div>
      </div>)
    }

    return (<div key={index}>
      <Flex className={styles.tabContentItem} onClick={() => this.onChoosePress(item, 2)}>
        <div className={styles.leftTabItem}>
          <span className={styles.leftText}>{item.faceValue + "积分"}</span>
        </div>
        <div className={styles.rightTabItem}>
          <div>{item.name}</div>
          <div>{"剩余 : " + item.balance + "积分"}</div>
          <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至"+ dateFormat(item.expiryTime)}</div>
        </div>
        <div className={styles.checkContain}>
          {this.renderCheck(isSelect)}
        </div>
      </Flex>
    </div>)
  }
  renderUnPressPointItem = (item, index) => {
    const { overPayCash } = this.state;
    return (<div key={index}>
      <Flex className={overPayCash ? styles.tabOverPayCash : styles.tabContentItem}>
        <div className={styles.leftTabItem}>
          <span className={styles.leftText}>{item.faceValue + "积分"}</span>
        </div>
        <div className={styles.rightTabItem}>
          <div>{item.name}</div>
          <div>{"剩余 : " + item.balance + "积分"}</div>
          <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至"+ dateFormat(item.expiryTime)}</div>
        </div>
      </Flex>
    </div>);
  }

  renderPointList() {
    const { list } = this.state;
    if (!list || !list.length) return;

    return (<div className={styles.tabContent}>
      {list.map((item, index) => globalVal.routeIsFromPay
        ? this.renderPointItem(item, index) : this.renderUnPressPointItem(item, index))}
      <div className={styles.margin}></div>
    </div>);
  }

  renderListByTag(tag) {
    if (RegExp(/储值卡/).test(this.props.location.state.tag)) {
      return this.renderCardList()
    } else if (RegExp(/代金券/).test(this.props.location.state.tag)) {
      return this.renderDiscountList()
    } else if (RegExp(/积分卡/).test(this.props.location.state.tag)) {
      return this.renderPointList()
    }
  }

  render() {
    return (
      <div className={styles.container}>
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={() => this.props.history.goBack()}
        >{this.state.title}</NavBar>
        {this.renderListByTag(this.props.location.state.tag)}

        <div className={styles.footer}>
          <div className={styles.moreText} onClick={() => this.onMorePress(this.state.moreText)}>
            <span>{this.state.moreText}</span>
          </div>
          {(RegExp(/选择/).test(this.props.location.state.tag)) ?
            <div className={styles.exchangeBtn} onClick={() => this.onSubmit()}>
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
                    if(exchangeCode == ''){
                      Toast.fail('请填写正确的兑换码。',1);
                      return;
                    }
                    this.onExchangePress(exchangeCode, resolve);

                  }),
                },
              ], 'default', null, ['兑换码'])}
            >
              <div>
                <span className={styles.exchangeText}>{"兑换" + this.state.tag}</span>
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default withRouter(CardAndDiscount);
