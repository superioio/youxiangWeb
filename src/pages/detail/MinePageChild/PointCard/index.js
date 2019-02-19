import React, { Component } from 'react';
import moment from 'moment';
import { dateFormat } from '@/utils';
import {
  exchangePoint,
  getPointList,
  getPointListByProduct,

} from "./api";
import { Flex, Icon, NavBar, Toast, Modal } from "antd-mobile";
import { withRouter } from "react-router-dom";
import styles from './styles.module.css';
import globalVal from '@/utils/global_val';
import { getRechargeByQRCode } from "../../../main/components/HomePage/api";
import { initWX } from '@/utils/global_api';

let barcode = null;
class PointCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pointCardList: [],// 积分卡
      selectedPointCardList: [], // 选中积分卡
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
    const { selectedPointCardList } = globalVal.routeIsFromPay
      ? globalVal.routePointCard : { selectedPointCardList: [] };
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
    if (pointCardList.error) {
      Toast.fail(pointCardList.error);
      return;
    }

    this.setState({
      isScanExpiry: false,
      pointCardList,
      selectedPointCardList,
    }, this.checkChooseStatus);
  }

  loadUnEffectiveData = async () => {
    Toast.loading("请稍后...", 3);

    const pointCardList = await getPointList(1, globalVal.userInfo.customerId);
    Toast.hide();
    if (pointCardList.error) {
      Toast.fail(pointCardList.error);
      return;
    }

    this.setState({
      isScanExpiry: true,
      pointCardList,
    });

  }

  itemCanPress = (item) => {
    const { isScanExpiry, overPayCash } = this.state;
    const isSelect = this.state.selectedPointCardList.some(n => n.id === item.id);
    const { effectiveTime } = item;
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
  onChoosePress = (item) => {
    if (!globalVal.routeIsFromPay) {
      return;
    }
    if (!this.itemCanPress(item)) {
      return;
    }

    const isSelect = this.state.selectedPointCardList.some(n => n.id === item.id);
    if (isSelect) {
      this.setState({//移除到选中列表中
        selectedPointCardList: this.state.selectedPointCardList.filter(n => n.id !== item.id),
      }, () => {
        this.checkChooseStatus();
      });
    } else {
      this.setState(prevState => ({//添加到选中列表中
        selectedPointCardList: [...prevState.selectedPointCardList, item],
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
      Toast.fail(result.error, 1);
      return;
    }
    Toast.loading("兑换成功", 2);
    resolve();
    this.loadEffectiveData();
  }

  onMorePress = () => {
    const { isScanExpiry } = this.state;
    if (isScanExpiry) {
      this.loadEffectiveData();
    } else {
      this.loadUnEffectiveData();
    }
  }

  onMarked = async (type, resultStr) => {
    var text = '未知: ';
    switch (type) {
      case window.plus.barcode.QR:
        text = 'QR: ';
        break;
      case window.plus.barcode.EAN13:
        text = 'EAN13: ';
        break;
      case window.plus.barcode.EAN8:
        text = 'EAN8: ';
        break;
      default:
        break;
    }
    alert(text + resultStr);

    barcode.cancel();
    barcode.close();

    const res = await getRechargeByQRCode(resultStr);
    if (res.error) {
      Toast.fail(res.error);
      return;
    }
    Toast.success('添加成功');

  }
  onScanPress = () => {

    if (window.plus && window.plus.barcode) {
      if (!barcode) {
        barcode = window.plus.barcode.create('barcode', [window.plus.barcode.QR], {
          top: '100px',
          left: '0px',
          width: '100%',
          height: '200px',
          position: 'static'
        });
        barcode.onmarked = this.onMarked;
        window.plus.webview.currentWebview().append(barcode);
      }
      barcode.start();
    }
    if (window.wx) {
      initWX();
      window.wx.ready(() => {
        // alert('wx ready0');
        window.wx.scanQRCode({
          needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
          scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
          success: async (result) => {
            const resultStr = result.resultStr; // 当needResult 为 1 时，扫码返回的结果

            //alert('resultStr', resultStr);

            const res = await getRechargeByQRCode(resultStr);

            //alert('res', JSON.stringify(res));

            if (res.error) {
              Toast.fail(res.error);
              return;
            }
            Toast.success('兑换成功');
          }
        });
      });
      window.wx.error(function (res) {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        //alert("wxerror :" +JSON.stringify(res));
      });
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
    const isSelect = this.state.selectedPointCardList.some(n => n.id === item.id);
    const isCanPress = this.itemCanPress(item);

    const closingUnit = globalVal.config.closingUnit;

    return (<div key={index}>
      <Flex className={isCanPress ? styles.tabContentItem : styles.tabOverPayCash}
        onClick={() => this.onChoosePress(item)}>
        <div className={styles.leftTabItem}>
          <div className={styles.leftText}>{item.faceValue}</div>
          <div className={styles.leftText}>积分</div>
        </div>
        <div className={styles.rightTabItem}>
          <div>{item.name}</div>
          <div>{"剩余 : " + item.balance + closingUnit}</div>
          <div className={styles.expireDateText}>{"有效期："}</div>
          <div className={styles.expireDateText}>{dateFormat(item.effectiveTime) + "-" + dateFormat(item.expiryTime)}</div>
        </div>
        <div className={styles.checkContain}>
          {this.renderCheck(isSelect)}
        </div>
      </Flex>
    </div>);
  }

  renderPointList = () => {
    const { pointCardList } = this.state;
    if (!pointCardList || !pointCardList.length) return;

    return (<div className={styles.tabContent}>
      {pointCardList.map((item, index) => this.renderPointItem(item, index))}
      <div className={styles.margin}></div>
    </div>);
  }

  renderFooter = () => {
    const { isScanExpiry } = this.state;
    return <div className={styles.footer}>
      <div className={styles.moreText} onClick={() => this.onMorePress()}>
        <span>{isScanExpiry ? '查看有效的积分卡' : '查看失效的积分卡'}</span>
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
            <span className={styles.exchangeText}>{"兑换积分卡"}</span>
          </div>
        </div>
      }
    </div>
  }
  renderScanCode = () => {
    return (<div className={styles.scanButton} >

    </div>)
  }

  render() {
    const { title } = this.props.location.state;
    return (
      <div className={styles.container}>
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={() => this.props.history.goBack()}
          rightContent={[
            <img
              onClick={this.onScanPress}
              className={styles.scanButtonImage}
              src={require('../../../../assets/images/scan.png')}
              alt="扫一扫"
            />
          ]}
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
