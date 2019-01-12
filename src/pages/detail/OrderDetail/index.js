import React, { Component } from 'react';
import styles from './styles.module.css';
import { datetimeFormat, getStatus } from '@/utils';
import { cancelOrder } from './api'
import { Flex, Icon, NavBar, Toast, Modal } from "antd-mobile";
import { withRouter } from "react-router-dom";

class OrderDetail extends Component {

  renderContent(order, isFromPay) {
    // const eCodes = (!isFromPay && order.productResp.productType === 1) ? order.extInfo.split(';') : [];
    return (<div className={styles.contentContain}>
      <span className={styles.titleText}>订单信息</span>
      <div className={styles.content}>
        <div className={styles.contentRow}>
          <span className={styles.nameText}>订单号</span >
          <span className={styles.contentText}> {order.orderCode}</span>
        </div>
        <div className={styles.contentRow}>
          <span className={styles.nameText}>下单时间</span>
          <span className={styles.contentText}> {datetimeFormat(order.orderTime)}</span>
        </div>
        {order.productResp.productType === 0 ?
          <div className={styles.contentRow}>
            <span className={styles.nameText}>服务时间</span>
            <span className={styles.contentText}> {datetimeFormat(order.serviceTime)}</span>
          </div> : <div></div>}
        {order.productResp.productType === 0 ?
          <div className={styles.contentRow}>
            <span className={styles.nameText}>服务地点</span>
            <span className={styles.contentText}> {order.customerCityName + order.customerAddress}</span>
          </div>
          : <div></div>}
        <div className={styles.contentRow}>
          <span className={styles.nameText}>商品名称</span >
          <span className={styles.contentText}> {order.productResp.name}</span>
        </div>
        {order.productResp.productType === 0 ?
          <div className={styles.contentRow}>
            <span className={styles.nameText}>服务电话</span>
            <span className={styles.contentText}> {order.customerMobile}</span>
          </div> : <div></div>}
        {!isFromPay ? <div className={styles.contentRow}>
          <span className={styles.nameText}>订单状态</span>
          <span className={[styles.contentText, styles.importantText]}> {getStatus(order.status)}</span>
        </div> : <div></div>}
        <div className={styles.contentRow}>
          <span className={styles.nameText}>商品描述</span>
          <span className={styles.contentText}> {order.productResp.description}</span>
        </div>
        {/*{(!isFromPay && order.productResp.productType === 1) ? this.renderECodes(eCodes) : <div></div>}*/}
      </div>
      <span> 备注: </span>
      <div className={styles.remark}>
        <span>  {order.customerRemark}</span>
      </div>
      {(!isFromPay && order.productResp.productType === 0) ? <div className={`${styles.content} ${styles.noBorderBottom}`}>
        <div className={styles.contentRow}>
          <span className={styles.nameText}>服务人员</span>
          <span className={styles.contentText}> {order.workerName}</span>
        </div>
        <div className={styles.contentRow}>
          <span className={styles.nameText}>联系电话</span>
          <span className={styles.contentText}> {order.workerMobile}</span>
        </div>
      </div> : <div></div>}
      <div className={`${styles.content} ${styles.noBorderBottom}`}>
        <span className={styles.titleText}>订单明细</span>
        <Flex className={styles.contentRow}>
          <Flex.Item className={styles.nameText}>单价</Flex.Item>
          <Flex.Item className={`${styles.contentTextRight} ${styles.importantText}`}> {order.productPrice + "积分/" + order.productResp.unitName}</Flex.Item>
        </Flex>
        <Flex className={styles.contentRow}>
          <Flex.Item className={styles.nameText}>购买数量</Flex.Item>
          <Flex.Item className={`${styles.contentTextRight} ${styles.importantText}`}> {order.count}</Flex.Item>
        </Flex>
        <Flex className={styles.contentRow}>
          <Flex.Item className={styles.nameText}>金额</Flex.Item>
          <Flex.Item className={`${styles.contentTextRight} ${styles.importantText}`}> {order.totalAmount + "积分"}</Flex.Item>
        </Flex>
      </div>
      <div className={`${styles.content} ${styles.noBorderBottom}`}>
        <Flex className={styles.contentRow}>
          <Flex.Item className={styles.nameText}>代金券支付</Flex.Item>
          <Flex.Item className={`${styles.contentTextRight} ${styles.importantText}`}> {order.payVoucher + "积分"}</Flex.Item>
        </Flex>
        <Flex className={styles.contentRow}>
          <Flex.Item className={styles.nameText}>积分支付</Flex.Item>
          <Flex.Item className={`${styles.contentTextRight} ${styles.importantText}`}> {order.payPoint + "积分"}</Flex.Item>
        </Flex>
        <Flex className={styles.contentRow}>
          <Flex.Item className={styles.nameText}>储值卡支付</Flex.Item>
          <Flex.Item className={`${styles.contentTextRight} ${styles.importantText}`}> {order.payRechargeCard + "积分"}</Flex.Item>
        </Flex>
        <Flex className={styles.contentRow}>
          <Flex.Item className={styles.nameText}>现金支付</Flex.Item>
          <Flex.Item className={`${styles.contentTextRight} ${styles.importantText}`}> {order.payment + "积分"}</Flex.Item>
        </Flex>
      </div>
    </div>);
  }

  onCancelPress = async () => {
    const alert = Modal.alert;

    alert('取消订单', '确认取消订单吗？',
      [{ text: "取消", onPress: () => { return null } },
      { text: "确认", onPress: () => this.confirm() },
      ]
    );
  }

  confirm = async () => {
    Toast.loading("请稍后...", 3);
    const result = await cancelOrder(this.props.location.state.order.id);
    Toast.hide();
    if (result.error) {
      Toast.fail(result.error);
      return;
    }
    this.props.history.goBack();
  }
  onPayPress = () => {
    alert('点击了支付按钮');
  }
  onWechatPayPress = () => {
    alert('点击了微信支付按钮');
  }

  onBackListPress = () => {
    this.props.history.push('/');
  }

  renderBackToList() {
    return (
      <div className={styles.buttonsColumn}>
        <Flex className={`${styles.payButton} ${styles.wechatPayButton}`} onClick={this.onBackListPress}>
          <span className={styles.centerText}>返回首页</span>
        </Flex>
      </div>
    );
  }
  renderCancelButton(isUnpaid) {
    return isUnpaid ? (<div className={styles.buttonsRow}>
      <div className={`${styles.button} ${styles.cancelBtn}`} onClick={this.onCancelPress}>
        <span className={styles.centerText}>取消订单</span>
      </div>
      {/*<Flex.Item className={`${styles.button} ${styles.payBtn}`} onClick={this.onPayPress}>*/}
      {/*<span className={styles.centerText}>支付订单</span>*/}
      {/*</Flex.Item>*/}
    </div>) : null;
  }

  renderPayButton() {
    return (
      <div className={styles.buttonsColumn}>
        <Flex className={`${styles.payButton} ${styles.wechatPayButton}`} onClick={this.onWechatPayPress}>
          <span className={styles.centerText}>微信支付</span>
        </Flex>
      </div>
    );
  }

  renderECodes(eCodes) {
    return (<div className={styles.eCodeRow}>
      {eCodes.map((item, index) =>
        <div className={styles.eCodeText}>{item}</div>
      )}
    </div>
    )
  }


  render() {
    return (
      <div className={styles.container}>
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={() => this.props.history.go(-2)}
        >订单详情</NavBar>
        {this.renderContent(this.props.location.state.order, this.props.location.state.isFromPay)}
        {this.props.location.state.isFromPay ? this.renderBackToList() : this.renderCancelButton(this.props.location.state.isUnpaid)}
        {/*{this.props.location.state.isFromPay ? this.renderPayButton() : this.renderCancelButton(this.props.location.state.isUnpaid)}*/}
      </div>
    );
  }
}

export default withRouter(OrderDetail);
