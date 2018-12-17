import React, { Component } from 'react';
import styles from './styles.module.css';
import { datetimeFormat, getStatus } from '@/utils';
import {cancelOrder, getPayCheck} from './api'
import {Flex, Icon, NavBar, Toast,Modal} from "antd-mobile";

class OrderDetail extends Component {

  renderContent(order, isPay) {
    let payVoucher = order.payVoucher * order.productPrice;//代金券支付金额
    // let payment = order.totalAmount - payVoucher - order.payRechargeCard;//需支付金额
    // payment = payment > 0 ? payment : 0;
    return (<div className={{ flex: 1 }}>
      <span className={styles.titleText}>订单信息</span>
      <div className={styles.content}>
        <div className={styles.contentRow}>
          <span  className={styles.nameText}>服务类型</span >
          <span className={styles.contentText}> {order.productResp.name}</span>
        </div>
        <div className={styles.contentRow}>
          <span className={styles.nameText}>服务时间</span>
          <span className={styles.contentText}> {datetimeFormat(order.serviceTime)}</span>
        </div>
        <div className={styles.contentRow}>
          <span className={styles.nameText}>服务地点</span>
          <span className={styles.contentText}> {order.customerCityName + order.customerAddress}</span>
        </div>
        <div className={styles.contentRow}>
          <span className={styles.nameText}>服务电话</span>
          <span className={styles.contentText}> {order.customerMobile}</span>
        </div>
        {!isPay ? <div className={styles.contentRow}>
          <span className={styles.nameText}>订单状态</span>
          <span className={[styles.contentText, styles.importantText]}> {getStatus(order.status)}</span>
        </div> : <div></div>}
        <div className={styles.contentRow}>
          <span className={styles.nameText}>商品描述</span>
          <span className={styles.contentText}> {order.productResp.description}</span>
        </div>
      </div>
      <span> 备注: </span>
      <div className={styles.remark}>
        <span> {order.customerRemark} </span>
      </div>
      {!isPay ? <div className={`${styles.content} ${styles.noBorderBottom}`}>
        <div className={styles.contentRow}>
          <span className={styles.nameText}>服务人员</span>
          <span className={styles.contentText}> {order.workerName}</span>
        </div>
        <div className={styles.contentRow}>
          <span className={styles.nameText}>联系电话</span>
          <span className={styles.contentText}> {order.workerMobile}</span>
        </div>
      </div> : <div></div>}
      <div  className={`${styles.content} ${styles.noBorderBottom}`}>
        <span className={styles.titleText}>订单明细</span>
        <Flex className={styles.contentRow}>
          <Flex.Item className={styles.nameText}>单价</Flex.Item>
          <Flex.Item className={`${styles.contentTextRight} ${styles.importantText}`}> {order.productPrice + "元/" + order.productResp.unitName}</Flex.Item>
        </Flex>
        <Flex className={styles.contentRow}>
          <Flex.Item className={styles.nameText}>服务数量</Flex.Item>
          <Flex.Item className={`${styles.contentTextRight} ${styles.importantText}`}> {order.count}</Flex.Item>
        </Flex>
        <Flex className={styles.contentRow}>
          <Flex.Item className={styles.nameText}>金额</Flex.Item>
          <Flex.Item className={`${styles.contentTextRight} ${styles.importantText}`}> {order.totalAmount + "元"}</Flex.Item>
        </Flex>
      </div>
      <div className={`${styles.content} ${styles.noBorderBottom}`}>
        <Flex className={styles.contentRow}>
          <Flex.Item className={styles.nameText}>使用代金券支付</Flex.Item>
          <Flex.Item className={`${styles.contentTextRight} ${styles.importantText}`}> {payVoucher + "元"}</Flex.Item>
        </Flex>
        <Flex className={styles.contentRow}>
          <Flex.Item className={styles.nameText}>使用积分支付</Flex.Item>
          <Flex.Item className={`${styles.contentTextRight} ${styles.importantText}`}> {order.payRechargeCard + "元"}</Flex.Item>
        </Flex>
        <Flex className={styles.contentRow}>
          <Flex.Item className={styles.nameText}>尚需支付</Flex.Item>
          <Flex.Item className={`${styles.contentTextRight} ${styles.importantText}`}> {order.payment + "元"}</Flex.Item>
        </Flex>
      </div>
    </div>);
  }

  onCancelPress = async () => {
      const alert = Modal.alert;
        alert('取消订单', '确认取消订单吗？', [
          { text: '取消', onPress: () => {return null }},
          {
            text: '确认',
            onPress: () => this.confirm,
          },
        ])

    // Alert.alert('取消订单','确认取消订单吗？',
    //     [{text:"取消", onClick: ()=> { return null}},
    //       {text:"确认", onClick:this.confirm},
    //     ]
    // );
  }

  confirm = async() => {
    Toast.loading("请稍后...", 3);
    await cancelOrder(this.props.location.state.order.id);
    Toast.hide();
    this.props.history.goBack();
  }
  onPayPress = () => {
    alert('点击了支付按钮');
  }
  onWechatPayPress = () => {
    alert('点击了微信支付按钮');
  }

  renderCancelButton(isUnpaid) {
    return isUnpaid ? (<Flex className={styles.buttonsRow}>
          <Flex.Item className={`${styles.button} ${styles.cancelBtn}`} onClick={this.onCancelPress}>
            <span className={styles.centerText}>取消订单</span>
          </Flex.Item>
          <Flex.Item className={`${styles.button} ${styles.payBtn}`} onClick={ this.onPayPress}>
            <span className={styles.centerText}>支付订单</span>
          </Flex.Item>
        </Flex>
    ) : null;
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

  render() {
    return (
        <div className={styles.container}>
          <NavBar
              mode="light"
              icon={<Icon type="left" />}
              onLeftClick={() =>
              {
                if(this.props.location.state.isPay){
                  this.props.history.goBack();
                } else {
                  this.props.history.goBack();
                }
              }}
          >订单详情</NavBar>
            {this.renderContent(this.props.location.state.order, this.props.location.state.isPay)}
            {this.props.location.state.isPay ? this.renderPayButton() : this.renderCancelButton(this.props.location.state.isUnpaid)}

        </div>
    );
  }
}

export default OrderDetail;
