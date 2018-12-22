import React, { Component } from 'react';
import { Flex, Carousel, Toast } from 'antd-mobile';
import styles from './styles.module.css';
import { getCategoryList, getProductList, getCityList } from './api';
import globalVal from '@/utils/global_val';
import { withRouter } from "react-router-dom";

class HomePage extends Component {
  // #region 构造器
  constructor(props) {
    super(props);
    this.state = {
      selectCity: globalVal.selectCity,
      categoryList: [],// 商品类别列表
      moreCategoryGroup: [],// 商品类别，第5个以后的商品列表
    };
    this.setGlobalCityList();
    this.setGlobalUserInfo();
  }


  async componentDidMount() {
    Toast.loading("请稍后...", 3);
    const allCategoryList = await getCategoryList();
    if(allCategoryList.error){
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
    if(result.error){
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

  onProductPress(id, name) {
    this.props.history.push({ pathname: '/ProductList', state: { productCategoryId: id, name: name } });
    // this.props.navigation.navigate('ProductList', { productCategoryId: id, name: name })
  }

  onProductDetailPress(productDetail) {
    this.props.history.push({ pathname: '/ProductDetail', state: { productDetail: productDetail } });
    //  this.props.navigation.navigate('ProductDetail', { productDetail: productDetail })
  }

  // #endregion

  // #region 私有方法

  setGlobalCityList = async () => {
    const cityList = await getCityList();
    if(cityList.error){
      Toast.fail(cityList.error);
      return;
    }
    globalVal.cityList = cityList;
  }

  setGlobalUserInfo = async () => {
    const userInfo = await globalVal.getUserInfo();
    if(userInfo.error){
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
      };
      Toast.info('您的登录信息已过期，请重新登录');
    }
  }

  // #endregion

  // #region render方法

  renderCityButton = () => {
    const { selectCity } = this.state;
    return (
      <div className={styles.cityButton} onClick={this.onCityPress}>
        <img
          className={styles.cityButtonImage}
          src={require('../../../../assets/images/map.png')}
          alt="广告"
        />
        <span className={styles.cityButtonText}>{selectCity.name}</span>
        <img
          className={styles.cityButtonImage}
          src={require('../../../../assets/images/arrow-down.png')}
          alt="广告"
        />
      </div>
    );
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
              <div className={styles.menuButton}>
                <img
                  className={styles.acceptButtonImage}
                  src={globalVal.imgUrl + product.thumbnailUrl}
                  alt="广告"
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

  // #endregion

  render() {
    return (
      <div className={styles.container}>
        <Flex className={styles.cityContainer}>
          {this.renderCityButton()}
        </Flex>
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
}

export default withRouter(HomePage);
