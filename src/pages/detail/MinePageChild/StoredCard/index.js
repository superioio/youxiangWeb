import React, { Component } from 'react';
import moment from 'moment';
import { dateFormat } from '@/utils';
import {
  exchangeCard,
  getCardList,
  getCardListByProduct,
} from "./api";
// import moment from 'moment';
import { Flex, Icon, NavBar, Toast, Modal } from "antd-mobile";
import { withRouter } from "react-router-dom";
import styles from './styles.module.css';
import globalVal from '@/utils/global_val';

class StoredCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storedCardList: [], // 储值卡
      selectedStoredCardList: [], // 选中的储值卡
      exchangeCode: '1234',

      overPayCash: false,
      isScanExpiry: false, // 查看失效积分卡或是查看有效积分卡
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
    const { selectedStoredCardList } = globalVal.routeIsFromPay
      ? globalVal.routeStoredCard : { selectedStoredCardList: [] };
    const { title } = this.props.location.state;
    let storedCardList;
    Toast.loading("请稍后...", 3);
    switch (title) {
      case "我的储值卡":
        storedCardList = await getCardList(2, globalVal.userInfo.customerId);
        break;
      case "选择储值卡":
        storedCardList = await getCardListByProduct(globalVal.userInfo.customerId, globalVal.routeOrderInfo.productId, globalVal.selectCity.code);
        break;
      default:
        break;
    }
    Toast.hide();

    if (storedCardList.error) {
      Toast.fail(storedCardList.error);
      return;
    }

    this.setState({
      isScanExpiry: false,
      storedCardList,
      selectedStoredCardList,
    }, this.checkChooseStatus);

  }

  loadUnEffectiveData = async () => {
    Toast.loading("请稍后...", 3);

    const storedCardList = await getCardList(1, globalVal.userInfo.customerId);

    Toast.hide();
    if (storedCardList.error) {
      Toast.fail(storedCardList.error);
      return;
    }

    this.setState({
      isScanExpiry: true,
      storedCardList,
    });
  }

  itemCanPress = (item) => {
    const { isScanExpiry, overPayCash } = this.state;
    const { effectiveTime } = item;
    const isSelect = this.state.selectedStoredCardList.some(n => n.id === item.id);
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
    const { needPayCash } = this.props.location.state;
    const { selectedStoredCardList } = this.state;
    let balance = 0;
    selectedStoredCardList.forEach(item => {
      balance += item.balance;
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
    const selectedStoredCardList = this.state.selectedStoredCardList;

    globalVal.routeStoredCard = {
      selectedStoredCardList,
    };
    this.props.history.goBack();
  }

  //选中一个代金券/积分卡/储值卡
  onChoosePress = (item) => {
    if (!globalVal.routeIsFromPay) {
      return;
    }
    if (!this.itemCanPress(item)) {
      return;
    }

    const isSelect = this.state.selectedStoredCardList.some(n => n.id === item.id);
    if (isSelect) {
      this.setState({//添加到选中列表中
        selectedStoredCardList: this.state.selectedStoredCardList.filter(n => n.id !== item.id),
      }, () => {
        this.checkChooseStatus();
      });
    } else {
      this.setState(prevState => ({//添加到选中列表中
        selectedStoredCardList: [...prevState.selectedStoredCardList, item],
      }), () => {
        this.checkChooseStatus();
      });
    }
  }

  async onExchangePress(exchangeCode, resolve) {
    Toast.loading("请稍后...", 3);
    const result = await exchangeCard(exchangeCode, globalVal.userInfo.customerId)

    Toast.hide();
    if (result.error) {
      Toast.fail(result.error,1);
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

  renderCardItem = (item, index) => {
    const isSelect = this.state.selectedStoredCardList.some(n => n.id === item.id);
    const isCanPress = this.itemCanPress(item);

    return (<div key={index}>
      <Flex className={isCanPress ? styles.tabContentItem : styles.tabOverPayCash}
        onClick={() => this.onChoosePress(item)}>
        <div className={styles.leftTabItem}>
          <span className={styles.leftText}>{item.faceValue + "元"}</span>
        </div>
        <div className={styles.rightTabItem}>
          <div>{item.name}</div>
          <div>{"剩余 : " + item.balance + "元"}</div>
          <div className={styles.expireDateText}>{"有效期："}</div>
          <div className={styles.expireDateText}>{dateFormat(item.effectiveTime) + "-" + dateFormat(item.expiryTime)}</div>
        </div>
        <div className={styles.checkContain}>
          {this.renderCheck(isSelect)}
        </div>
      </Flex>
    </div>)
  }

  renderCardList = () => {
    const { storedCardList } = this.state;
    if (!storedCardList || !storedCardList.length) return;

    return (<div className={styles.tabContent}>
      {storedCardList.map((item, index) => this.renderCardItem(item, index))}
      <div className={styles.margin}></div>
    </div >);
  }

  renderFooter = () => {
    const { isScanExpiry } = this.state;
    return <div className={styles.footer}>
      <div className={styles.moreText} onClick={() => this.onMorePress()}>
        <span>{isScanExpiry ? '查看有效的储值卡' : '查看失效的储值卡'}</span>
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
            <span className={styles.exchangeText}>{"兑换储值卡"}</span>
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
        {this.renderCardList()}
        {this.renderFooter()}
      </div>
    );
  }
}

export default withRouter(StoredCard);
