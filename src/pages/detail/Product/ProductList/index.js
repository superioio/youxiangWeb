import React, { Component } from 'react';
import { Flex, Icon, NavBar, Toast } from "antd-mobile";
import { getProductList } from './api'
import globalVal from '@/utils/global_val';
import styles from './styles.module.css';
import { withRouter } from "react-router-dom";

class ProductList extends Component {
  // #region 构造器

  constructor(props) {
    super(props);
    this.state = {
      list: []
    };
  }

  // #endregion

  // #region 生命周期

  async componentDidMount() {
    const { code } = globalVal.selectCity;
    const { id, name } = globalVal.routeProductCategory;
    Toast.loading("请稍后...", 3);
    const list = await getProductList(id, name, code);
    Toast.hide();
    if (list.error) {
      Toast.fail(list.error);
      return;
    }
    this.setState({
      list: list
    });
  }

  // #endregion

  // #region 响应方法
  //点击商品
  onProductPress(productDetail) {
    globalVal.routeProductDetail = productDetail;
    this.props.history.push({ pathname: '/ProductDetail' });
  }
  // #endregion

  // #region render方法

  renderList(list) {
    console.log('list', list);
    return (<div className={styles.producList}>
      {list.map((item, index) => {
        const price = item.productPriceList ? item.productPriceList[0].price : 0;
        return (<div key={index} >
          <Flex onClick={() => this.onProductPress(item)} className={styles.product}>
            <img
              className={styles.leftImage}
              src={globalVal.imgUrl + item.thumbnailUrl}
              alt="图片" />
            <div className={styles.rightText}>
              <div className={styles.titleText}>{item.name}</div>
              <div className={styles.nameText}>{item.description}</div>
              <div className={styles.priceText}>
                {price + "元/" + item.unitName}</div>
            </div>
          </Flex>
        </div>);
      })
      }</div>);
  }

  renderNavBar = () => {
    const productCategoryName = globalVal.routeProductCategory
      ? globalVal.routeProductCategory.name : '';

    return (<NavBar
      mode="light"
      icon={<Icon type="left" />}
      onLeftClick={() =>
        this.props.history.push('/')
      }
    >{productCategoryName}</NavBar>)
  };


  render() {
    return (
      <div className={styles.container}>
        {this.renderNavBar()}
        {this.renderList(this.state.list)}
      </div>
    );
  }

  // #endregion
}

export default withRouter(ProductList);
