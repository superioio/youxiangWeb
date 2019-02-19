import React, { Component } from 'react';
import { Icon, NavBar } from "antd-mobile";
import styles from './styles.module.css';
import globalVal from '@/utils/global_val';
import { withRouter } from "react-router-dom";

class ProductDetail extends Component {
  // #region 构造器

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
  // #endregion

  // #region 生命周期
  componentDidMount() {
    const product = globalVal.routeProductDetail;
    this.setState({
      product,
    });
  }
  // #endregion

  // #region 响应方法
  onOrderPress = () => {
    if (globalVal.userInfo.customerId === -1) {
      this.props.history.push('/LoginPage');
    }
    else {
      globalVal.routeIsFromProductDetail = true;
      this.props.history.push({ pathname: '/OrderPlace' });
    }

  }
  // #region render方法
  //src={require("@/assets/images/washingMachineHeader.png")}
  renderHeaderImg() {
    const { product } = this.state;
    return (<div className={styles.headerImgContain}>
      <img
        className={styles.headerImg}
        alt="商品缩略图"
        src={globalVal.imgUrl + product.headerImgUrl} />
    </div>);
  }
  renderPrice() {
    const { product } = this.state;
    const closingUnit = globalVal.config.closingUnit;
    return (<div className={styles.price}>
      <div className={styles.nameText} >{product.name}</div>
      <div className={styles.priceText}>{product.productPriceList[0].price + closingUnit + "/" + product.unitName}</div>
    </div>);
  }
  // src={require("@/assets/images/washingMachineDesc.png")}
  renderDescImg() {
    const { product } = this.state;
    return (<div className={styles.descImgContainer}>
      <img
        className={styles.descImg}
        alt="商品详情"
        src={globalVal.imgUrl + product.detailImgUrl}
      />
    </div>);
  }

  renderNavBar = () => {
    const { name } = globalVal.routeProductDetail;
    return (<NavBar
      mode="light"
      icon={<Icon type="left" />}
      onLeftClick={() => this.props.history.goBack()}
    >{name}</NavBar>);
  }

  render() {
    return (
      <div className={styles.container}>
        {this.renderNavBar()}
        <div className={styles.contentContainer}>
          {this.renderHeaderImg()}
          {this.renderPrice()}
          {this.renderDescImg()}
        </div>
        <div className={styles.place} onClick={this.onOrderPress}>
          <div>
            <span className={styles.placeText}>立即下单</span>
          </div>
        </div>
      </div>
    );
  }
  // #endregion
}

export default withRouter(ProductDetail);
