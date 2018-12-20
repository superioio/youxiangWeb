import React, { Component } from 'react';
import { datetimeFormat, dateFormat, getStatus } from '@/utils';
import { exchangeCard, exchangeVoucher, getCardList, getDiscountList, getVoucherListByProduct, getCardListByProduct } from "./api";
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
      selectedList: [], //选中的代金券/积分卡列表
      showMore: true,
      overPayChash: false,

      moreText: '',
      tag:''
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
    let tag = this.props.location.state.tag;
    let moreText = '';
    Toast.loading("请稍后...", 3);
    switch (this.props.location.state.tag) {
      case "积分卡":
        list = await getCardList(2, globalVal.userInfo.customerId);
        tag = "积分卡";
        moreText = '查看失效的积分卡';
        break;
      case "添加积分卡":
        tag = "添加积分卡";
        moreText = '查看失效的积分卡';
        list = await getCardListByProduct(globalVal.userInfo.customerId, this.props.location.state.productId, globalVal.selectCity.code);
        this.setState({
          selectedList: this.props.location.state.cardInfoList,
        }, () => {
          this.checkChooseStatus(true);
        });
        break;
      case "代金券":
        list = await getDiscountList(2, globalVal.userInfo.customerId);
        moreText = '查看失效的代金劵';
        break;
      case "添加代金券":
        moreText = '查看失效的代金劵';
        list = await getVoucherListByProduct(globalVal.userInfo.customerId, this.props.location.state.productId, globalVal.selectCity.code);
        this.setState({
          selectedList: this.props.location.state.voucherInfoList,
        }, () => {
          this.checkChooseStatus(false);
        });

        break;
    }
    Toast.hide();
    this.setState({
      tag: tag,
      list: list,
      moreText,
    });
  }

  loadUnEffectiveData = async () => {
    let list = [];
    let title = '';
    let moreText = '';
    Toast.loading("请稍后...", 3);
    if (RegExp(/积分卡/).test(this.props.location.state.tag)) {
      list = await getCardList(1, globalVal.userInfo.customerId);
      title = '失效的积分卡';
      moreText = '查看有效的积分卡';
    } else {
      list = await getDiscountList(1, globalVal.userInfo.customerId);
      title = '失效的代金券';
      moreText = '查看有效的代金券';
    }
    this.setState({
      list: list,
      overPayChash: true,
      moreText,
    });
    Toast.hide();
  }

  //计算其他 代金券/储值卡 是否仍然可选,储值卡直接计算余额，代金券计算个数*单价
  checkChooseStatus(isCard) {
    const payChash = this.props.location.state.payCash;
    const price = this.props.location.state.price;
    let balance = 0;
    if (isCard) {
      this.state.selectedList.forEach(item => {
        balance += item.balance;
      });
    } else {
      this.state.selectedList.forEach(item => {
        balance += item.count * price;
      });
    }
    if (balance >= payChash) {
      this.setState({
        overPayChash: true,
      });
    } else {
      this.setState({
        overPayChash: false,
      });
    }
  }

  // #endregion

  // #region 响应方法

  //添加选中的代金券或者积分卡
  onSubmit = () => {
    const isChoose = (this.state.selectedList.length > 0) ? true : false;
    this.props.history.push({ pathname: '/CardAndDiscount', state:  {
        isChoose: isChoose, //选择了代金券或积分卡
        prePage: 'discount', // 是从代金劵或积分卡界面返回订单页
        tag: this.props.location.state.tag,//标识 此界面是 代金券 还是 积分卡
        selectedList: this.state.selectedList,//已经添加的积分卡/代金券
        orderInfo: this.state.orderInfo,//全部的订单信息 2018-12-20 add
      }})
    // this.props.location.state.setCardOrVoucherInfo(this.state.selectedList, isChoose);
    // this.props.location.goBack();
  }

  //选中一个代金券或者积分卡
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

  async onExchangePress() {
    Toast.loading("请稍后...", 3);
    this.props.location.state.tag == "积分卡"
        ? await exchangeCard(this.state.exchangeCode)
        : await exchangeVoucher(this.state.exchangeCode);
    Toast.hide();
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
    const { overPayChash } = this.state;
    const isSelect = this.state.selectedList.some(n => n.id === item.id);

    if (overPayChash && !isSelect) {
      return (<div key={index}>
        <Flex  className={`${styles.tabContentItem} ${styles.tabOverPayCash}`}>
          <div className={styles.leftTabItem}>
            <span className={styles.leftText}>{item.faceValue + "元"}</span>
          </div>
          <div className={styles.rightTabItem}>
            <div>{item.description + ":  剩余" + item.balance + "元"}</div>
            <div>{"有效期至" + dateFormat(item.expiryTime)}</div>
          </div>
          <div className={styles.checkContain}>
          </div>
        </Flex>
      </div>)
    }

    return (<div key={index}>
      <Flex  className={styles.tabContentItem} onClick={() => this.onChoosePress(item, true)}>
        <div className={styles.leftTabItem}>
          <span className={styles.leftText}>{item.faceValue + "元"}</span>
        </div>
        <div className={styles.rightTabItem}>
          <div>{item.description + ":  剩余" + item.balance + "元"}</div>
          <div>{"有效期至" + dateFormat(item.expiryTime)}</div>
        </div>
        <div className={styles.checkContain}>
          {this.renderCheck(isSelect)}
        </div>
      </Flex>
    </div>)
  }

  renderUnPressCardItem = (item, index) => {
    return (<div key={index}>
      <Flex className={styles.tabContentItem}>
        <div className={styles.leftTabItem}>
          <span className={styles.leftText}>{item.faceValue + "元"}</span>
        </div>
        <div className={styles.rightTabItem}>
          <div>{item.description + ":  剩余" + item.balance + "元"}</div>
          <div>{"有效期至" + dateFormat(item.expiryTime)}</div>
        </div>
      </Flex>
    </div>);
  }

  renderCardList = () => {
    const { list } = this.state;
    const { isPay } = this.props.location.state;
    if (!list) return;

    return (<div className={styles.tabContent}>
      {list.map((item, index) =>
          isPay ? this.renderCardItem(item, index) : this.renderUnPressCardItem(item, index))}
    </div>);
  }

  renderDiscountItem = (item, index) => {
    const { overPayChash } = this.state;
    const isSelect = this.state.selectedList.some(n => n.id === item.id);
    if (overPayChash && !isSelect) {
      return (<div key={index}>
        <Flex className={`${styles.tabContentItem}  ${styles.tabOverPayCash}`}>
          <div className={styles.leftTabItem}>
            <span className={styles.leftText}>{item.count + "个单位"}</span>
          </div>
          <div className={styles.rightTabItem}>
            <div className={styles.line }>{item.description}</div>
            <div>{"有效期至" + dateFormat(item.expiryTime)}</div>
          </div>
          <div className={styles.checkContain}>
          </div>
        </Flex>
      </div >);
    }

    return (<div key={index} >
      <Flex className={styles.tabContentItem} onClick={() => this.onChoosePress(item, false)}>
        <div className={styles.leftTabItem}>
          <span className={styles.leftText}>{item.count + "个单位"}</span>
        </div>
        <div className={styles.rightTabItem}>
          <div>{item.description}</div>
          <div>{"有效期至" + dateFormat(item.expiryTime)}</div>
        </div>
        <div className={styles.checkContain}>
          {this.renderCheck(isSelect)}
        </div>
      </Flex>
    </div>);
  }

  renderUnPressDiscountItem = (item, index) => {
    return (<div key={index} >
      <Flex className={styles.tabContentItem}>
        <div className={styles.leftTabItem}>
          <span className={styles.leftText}>{item.count + "个单位"}</span>
        </div>
        <div className={styles.rightTabItem}>
          <div>{item.description}</div>
          <div>{"有效期至" + dateFormat(item.expiryTime)}</div>
        </div>
      </Flex>
    </div>);
  }

  renderDiscountList() {
    const { list } = this.state;
    const { isPay } = this.props.location.state;
    if (!list) return;

    return (<div className={styles.tabContent}>
      {list.map((item, index) => isPay
          ? this.renderDiscountItem(item, index) : this.renderUnPressDiscountItem(item, index))}
    </div>);
  }

  render() {
    return (
        <div className={styles.container}>
          <NavBar
              mode="light"
              icon={<Icon type="left" />}
              onLeftClick={() =>
                  this.props.history.push({ pathname: '/CardAndDiscount', state:  {
                          isChoose: false, //从页面返回
                          prePage: 'discount', // 是从代金劵或积分卡界面返回订单页
                          tag: this.props.location.state.tag,//标识 此界面是 代金券 还是 积分卡
                          orderInfo: this.state.orderInfo,//全部的订单信息
                           }})
              }
          >{this.props.location.state.tag}</NavBar>
          {(this.props.location.state.tag === "添加积分卡" || this.props.location.state.tag === "积分卡") ? this.renderCardList() : this.renderDiscountList()}
          <div className={styles.footer}>
            <div className={styles.moreText} onClick={() => this.onMorePress(this.state.moreText)}>
              <span >{this.state.moreText}</span>
            </div>
            {(this.props.location.state.tag === "添加积分卡" || this.props.location.state.tag === "添加代金券") ?
                <div className={styles.exchangeBtn} onClick={() => this.onSubmit()}>
                  <div>
                    <span className={styles.exchangeText}>{"确定"}</span>
                  </div>
                </div> :
                <div className={styles.exchangeBtn} onClick={() => Modal.prompt('输入兑换码', '请输入您的兑换码',
                  [
                {text: '取消'},
                {
                  text: '确定',
                  onPress: exchangeCode => new Promise(( ) => {
                  this.setState({ exchangeCode });
                  this.onExchangePress();
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
