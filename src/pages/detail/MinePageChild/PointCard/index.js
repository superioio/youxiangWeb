import React, { Component } from 'react';
import { dateFormat } from '@/utils';
import {
  exchangePoint,
  getPointList,
  getPointListByProduct,

} from "./api";
// import moment from 'moment';
import { Flex, Icon, NavBar, Toast, Modal } from "antd-mobile";
import { withRouter } from "react-router-dom";
import styles from './styles.module.css';
import globalVal from '@/utils/global_val';

class PointCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pointCardList: [],
      exchangeCode: '1234',
      selectedPointCardList: [], //选中的代金券/积分卡/储值卡列表
      showMore: true,
      overPayCash: false,

      moreText: '查看失效的积分卡',
      title: '',
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
    const { selectedPointCardList } = globalVal.routePointCard;
    const { title } = this.props.location.state;
    let pointCardList;
    Toast.loading("请稍后...", 3);
    switch (title) {
      case "我的积分卡":
        pointCardList = await getPointList(2, globalVal.userInfo.customerId);
        break;
      case "选择积分卡":
        pointCardList = await getPointListByProduct(globalVal.userInfo.customerId, globalVal.routeOrderInfo.productId, globalVal.selectCity.code);
        break;
      default:
        break;
    }
    Toast.hide();

    this.setState({
      title,
      pointCardList,
      selectedPointCardList,
    }, this.checkChooseStatus);
    if (pointCardList.error) {
      Toast.fail(pointCardList.error);
      return;
    }
  }

  loadUnEffectiveData = async () => {
    Toast.loading("请稍后...", 3);

    const pointCardList = await getPointList(1, globalVal.userInfo.customerId);

    this.setState({
      title: '失效的积分卡',
      moreText: '查看有效的积分卡',

      pointCardList,
      overPayCash: true,
    });
    Toast.hide();
    if (pointCardList.error) {
      Toast.fail(pointCardList.error);
    }
  }

  //计算其他 代金券/储值卡/积分卡 是否仍然可选,储值卡直接计算余额，代金券计算个数*单价
  checkChooseStatus() {
    const { needPayCash } = this.props.location.state;
    const { selectedPointCardList } = this.state;
    let balance = 0;

    selectedPointCardList.forEach(item => {
      balance += item.balance * item.projectResp.pointConversionRate;
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
    const selectedPointCardList = this.state.selectedPointCardList;
    globalVal.routePointCard = {
      selectedPointCardList,
    };
    this.props.history.goBack();
  }

  // 选中一个积分卡
  onChoosePress = (info) => {
    const isSelect = this.state.selectedPointCardList.some(n => n.id === info.id);
    if (isSelect) {
      this.setState({//移除到选中列表中
        selectedPointCardList: this.state.selectedPointCardList.filter(n => n.id !== info.id),
      }, () => {
        this.checkChooseStatus();
      });
    } else {
      this.setState(prevState => ({//添加到选中列表中
        selectedPointCardList: [...prevState.selectedPointCardList, info],
      }), () => {
        this.checkChooseStatus();
      });
    }
  }

  async onExchangePress(exchangeCode, resolve) {
    Toast.loading("请稍后...", 3);
    const result = await exchangePoint(exchangeCode, globalVal.userInfo.customerId);
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

  renderPointItem = (item, index) => {
    const { overPayCash } = this.state;
    const isSelect = this.state.selectedPointCardList.some(n => n.id === item.id);

    if (overPayCash && !isSelect) {
      return (<div key={index}>
        <div className={styles.tabOverPayCash}>
          <div className={styles.leftTabItem}>
            <span className={styles.leftText}>{item.faceValue + "积分"}</span>
          </div>
          <div className={styles.rightTabItem}>
            <div>{item.name}</div>
            <div>{"剩余 : " + item.balance + "积分"}</div>
            <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至" + dateFormat(item.expiryTime)}</div>
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
          <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至" + dateFormat(item.expiryTime)}</div>
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
          <div className={styles.expireDateText}>{"有效期：" + dateFormat(item.effectiveTime) + "至" + dateFormat(item.expiryTime)}</div>
        </div>
      </Flex>
    </div>);
  }

  renderPointList = () => {
    const { pointCardList } = this.state;
    if (!pointCardList || !pointCardList.length) return;

    return (<div className={styles.tabContent}>
      {pointCardList.map((item, index) => globalVal.routeIsFromPay
        ? this.renderPointItem(item, index) : this.renderUnPressPointItem(item, index))}
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
        {this.renderPointList()}
        {this.renderFooter()}
      </div>
    );
  }
}

export default withRouter(PointCard);
