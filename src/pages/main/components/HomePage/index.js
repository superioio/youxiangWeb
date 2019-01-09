import React, { Component } from 'react';
import { Flex, Carousel, Toast } from 'antd-mobile';
import styles from './styles.module.css';
import { getCategoryList, getProductList, getRechargeByQRCode } from './api';
import globalVal from '@/utils/global_val';
import {initWX} from '@/utils/global_api';
import { withRouter } from "react-router-dom";

let barcode = null;

class HomePage extends Component {
  // #region 构造器
  constructor(props) {
    super(props);
    globalVal.homePageRef = this;
    this.setGlobalSelectCity();
    this.setGlobalUserInfo();
    this.state = {
      selectCity: globalVal.selectCity,
      categoryList: [],// 商品类别列表
      moreCategoryGroup: [],// 商品类别，第5个以后的商品列表
    };
  }

  // #endregion

  // #region 生命周期

  componentDidMount() {
    this.didFocus();
  }

  didFocus = async () => {
    if (globalVal.routeSelectCity) {
      this.setState({
        selectCity: globalVal.routeSelectCity,
      }, () => {
        globalVal.routeSelectCity = null;
        globalVal.selectCity = this.state.selectCity;
        globalVal.setSelectCity(globalVal.selectCity);
      });
    }

    Toast.loading("请稍后...", 3);
    const allCategoryList = await getCategoryList();
    if (allCategoryList.error) {
      Toast.hide();
      Toast.fail(allCategoryList.error);
      return;
    }
    allCategoryList.sort((pre, cur) => pre.priority - cur.priority);

    const categoryList = allCategoryList.slice(0, 4);
    const moreCategoryList = allCategoryList.slice(4);
    const moreCategoryGroupRequest = moreCategoryList.map((category) => {
      return getProductList(category.id, category.name, globalVal.selectCity.code);
    });

    const result = await Promise.all(moreCategoryGroupRequest);
    if (result.error) {
      Toast.hide();
      Toast.fail(result.error);
      return;
    }
    const moreCategoryGroup = result.map((productList, index) => {
      return {
        category: moreCategoryList[index],
        productList,
      };
    });
    Toast.hide();

    this.setState({
      categoryList,
      moreCategoryGroup,
    });
  }

  // #endregion


  // #region 响应方法

  onCityPress = () => {
    this.props.history.push({ pathname: '/CitySelector' });
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
      window.wx.scanQRCode({
        needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
        success: async (result) => {
          const resultStr = result.resultStr; // 当needResult 为 1 时，扫码返回的结果

          alert('resultStr', resultStr);

          const res = await getRechargeByQRCode(resultStr);

          alert('res', JSON.stringify(res));

          if (res.error) {
            Toast.fail(res.error);
            return;
          }
          Toast.success('添加成功');
        }
      });
    }

  }

  onProductPress(id, name) {
    globalVal.routeProductCategory = {
      id,
      name,
    };
    this.props.history.push({ pathname: '/ProductList' });
  }

  onProductDetailPress(productDetail) {
    globalVal.routeProductDetail = productDetail;
    this.props.history.push({ pathname: '/ProductDetail' });
  }

  // #endregion

  // #region 私有方法

  setGlobalUserInfo = () => {
    const userInfo = globalVal.getUserInfo();
    if (userInfo.error) {
      Toast.fail(userInfo.error);
      return;
    }
    if (userInfo.customerId === -1) return;

    const timeSpan = (Date.now() - userInfo.lastLoginTime) / 1000 / 60 / 60 / 24; // 天数
    if (timeSpan < 30) {
      globalVal.userInfo = userInfo;
    } else {
      globalVal.userInfo = {
        customerId: -1,
        sessionId: ''
      };
      Toast.info('您的登录信息已过期，请重新登录');
    }
  }
  setGlobalSelectCity = () => {
    const selectCity = globalVal.getSelectCity();
    globalVal.selectCity = selectCity;
  }

  // #endregion

  // #region render方法

  renderCityButton = () => {
    const { selectCity } = this.state;
    return (
      <div className={styles.cityButtonContain} >
        <div className={styles.cityButton} onClick={this.onCityPress}>
          <img
            className={styles.cityButtonImage}
            src={require('../../../../assets/images/map.png')}
            alt="箭头"
          />
          <span className={styles.cityButtonText}>{selectCity.name}</span>
          <img
            className={styles.cityButtonImage}
            src={require('../../../../assets/images/arrow-down.png')}
            alt="箭头"
          />
        </div>
      </div>
    );
  }

  renderScanCode = () => {
    return (<div className={styles.scanButton} onClick={this.onScanPress}>
      <img
        className={styles.scanButtonImage}
        src={require('../../../../assets/images/scan.png')}
        alt="扫一扫"
      />
    </div>)
  }

  renderCarouse = () => {
    return (
      <Carousel
        autoplay={true}
        infinite
      >
        <div>
          <img
            className={styles.carousel}
            src={require('../../../../assets/images/Carouse1.png')}
            alt="广告"
          />
        </div>
        <div>
          <img
            className={styles.carousel}
            src={require('../../../../assets/images/Carouse2.png')}
            alt="广告"
          />
        </div>
      </Carousel>);
  }

  renderMenu = () => {
    const { categoryList } = this.state;

    return (<Flex justify="between" className={styles.menu}>
      {categoryList.map((item, index) => <Flex.Item key={index}>
        <div className={styles.menuButton} onClick={() => this.onProductPress(item.id, item.name)} >
          <img
            className={styles.menuButtonImage}
            src={globalVal.imgUrl + item.thumbnailUrl}
            alt="服务"
          />
          <div className={styles.menuButtonText}>{item.name}</div>
        </div>
      </Flex.Item>)}
    </Flex>);
  }

  renderAd = () => {
    return (<img
      className={styles.carousel}
      src={require('../../../../assets/images/ad.png')}
      alt="广告"
    />
    );
  }

  renderCategroyItem = (categoryGroup) => {
    const { category, productList } = categoryGroup;
    return (<div>

      <Flex className={styles.acceptTop}>
        <Flex.Item >
          <div className={styles.acceptTopText}>{category.name}</div>
        </Flex.Item>
        <Flex.Item onClick={() => this.onProductPress(category.id, category.name)} className={styles.acceptTopButton}>
          <div className={styles.acceptTopButtonText}>更多 ></div>
        </Flex.Item>
      </Flex>
      <Flex className={styles.acceptMain}>
        {
          productList.map((product, index) => {
            return (<Flex.Item key={index} onClick={() => this.onProductDetailPress(product)}>
              <div className={styles.moreMenuButton}>
                <img
                  className={styles.acceptButtonImage}
                  src={globalVal.imgUrl + product.thumbnailUrl}
                  alt="缩略图"
                />
                <div className={styles.menuButtonText}>{product.name}</div>
              </div>
            </Flex.Item>);
          })
        }
      </Flex>
    </div>);
  }

  renderMoreCategory = () => {
    const { moreCategoryGroup } = this.state;

    return (moreCategoryGroup.map((categoryGroup, index) => {
      return (<div className={styles.acceptContainer} key={index}>
        {this.renderCategroyItem(categoryGroup)}
      </div>);
    }));
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.cityContainer}>
          {this.renderCityButton()}
          {this.renderScanCode()}
        </div>
        <div className={styles.adContainer}>
          {/* 轮播广告 */}
          {this.renderCarouse()}
        </div>
        <div className={styles.menuContainer}>
          {/* 菜单 */}
          {this.renderMenu()}
        </div>

        <div className={styles.adContainer}>
          {/* 广告 */}
          {this.renderAd()}
        </div>
        {this.renderMoreCategory()}
      </div>
    );
  }

  // #endregion
}

export default withRouter(HomePage);
