import React, { Component } from 'react';
import { Icon, NavBar } from "antd-mobile";
import styles from './styles.module.css';
import globalVal from '@/utils/global_val';
import { withRouter } from "react-router-dom";

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
    if (globalVal.userInfo.customerId === -1) {
      this.props.history.push('/LoginPage');
    }
    else {
      this.props.history.push({ pathname: '/OrderPlace', state: { product: this.state.product, prePage: 'product' } });
    }

  }
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
    return (<div className={styles.price}>
      <div className={styles.nameText} >{product.name}</div>
      <div className={styles.priceText}>{product.productPriceList[0].price + "元/" + product.unitName}</div>
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

  render() {
    return (
      <div className={styles.container}>
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={() =>
            this.props.location.state.productCategoryId ?
              this.props.history.push({ pathname: '/ProductList', state: { productCategoryId: this.props.location.state.productCategoryId, name: this.props.location.state.name } })
              : this.props.history.push('/')
          }
        >{this.props.location.state.productDetail.name}</NavBar>

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
}

export default withRouter(ProductDetail);
