import React, { Component } from 'react';
import {Flex, Icon, NavBar, Toast} from "antd-mobile";
import { getProductList } from './api'
import globalVal from '@/utils/global_val';
import styles from './styles.module.css';
import {withRouter} from "react-router-dom";

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: []
    };
  }

  async componentDidMount() {
    const params = this.props.location.state;
    Toast.loading("请稍后...", 3);
    const list = await getProductList(params.productCategoryId, params.name, globalVal.selectCity.code);
    Toast.hide();
    if(list.error){
      Toast.fail(list.error);
      return;
    }
    this.setState({
      list: list
    });
  }


  renderList(list) {
    return (<div className={styles.producList}>
      {list.map((item, index) =>
          <div key={index} >
            <Flex onClick={() => this.onProductPress(item)} className={styles.product}>
              <img
                  className={styles.leftImage}
                  src={globalVal.imgUrl + item.thumbnailUrl} />
              <div className={styles.rightText}>
                <div className={styles.titleText}>{item.name}</div>
                <div className={styles.nameText}>{item.description}</div>
                <div className={styles.priceText}>{item.productPriceList[0].price + "元/" + item.unitName}</div>
              </div>
            </Flex>
          </div>
      )}</div>);
  }


  //点击商品
  onProductPress(productDetail) {
    this.props.history.push({ pathname: '/ProductDetail', state: { productDetail: productDetail,productCategoryId: this.props.location.state.productCategoryId, name: this.props.location.state.name } });
    //this.props.navigation.navigate('ProductDetail', { productDetail: productDetail })
  }
  render() {
    return (
        <div className={styles.container}>
          <NavBar
              mode="light"
              icon={<Icon type="left" />}
              onLeftClick={() =>
                  this.props.history.push('/')
              }
          >{this.props.location.state.name}</NavBar>
            {this.renderList(this.state.list)}
        </div>
    );
  }
}

export default withRouter(ProductList) ;
