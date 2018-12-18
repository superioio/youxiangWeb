import React, { Component } from 'react';
import {Flex, Icon, NavBar} from "antd-mobile";
import styles from './styles.module.css';
import globalVal from '@/utils/global_val';
import {withRouter} from "react-router-dom";

class ProductDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      product: {
        productPriceList: [{
          price: 0
        }]
      },
    };
  }

  componentDidMount() {
    this.setState({
      product: this.props.location.state.productDetail
    });
  }

  onOrderPress = () => {
    if (globalVal.userInfo.customerId == -1) {
      this.props.history.push('/LoginPage');
    }
    else {
      this.props.history.push({ pathname: '/OrderPlace', state: { product: this.state.product }});
    }

  }
  // src={ globalVal.imgUrl + product.headerImgUrl}
  renderHeaderImg() {
    const { product } = this.state;
    return (<div className={styles.headerImgContain}>
      <img
          className={styles.headerImg}
          alt="商品缩略图"
          src = {require("@/assets/images/washingMachineHeader.png")}/>
    </div>);
  }
  renderPrice() {
    const { product } = this.state;
    return (<div className={styles.price}>
      <div className={styles.nameText} >{product.name}</div>
      <div className={styles.priceText}>{product.productPriceList[0].price + "元/" + product.unitName}</div>
    </div>);
  }
 // src={ globalVal.imgUrl + product.detailImgUrl }
  renderDescImg() {
    const { product } = this.state;
    return (<div className={styles.descImgContainer}>
      <img
          className={styles.descImg}
          alt="商品详情"
          src = {require("@/assets/images/washingMachineDesc.png")}/>
    </div>);
  }

  render() {
    return (
        <div className={styles.container}>
          <NavBar
              mode="light"
              icon={<Icon type="left" />}
              onLeftClick={() => this.props.history.goBack()}
          >{ this.props.location.state.productDetail.name}</NavBar>
            {this.renderHeaderImg()}
            {this.renderPrice()}
            {this.renderDescImg()}
          <div className={styles.place} onClick={this.onOrderPress}>
            <div>
              <span className={styles.placeText}>立即下单</span>
            </div>
          </div>
        </div>
    );
  }
}

export default withRouter(ProductDetail);
