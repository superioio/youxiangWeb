import React, { Component } from 'react';
import { Flex,Toast } from 'antd-mobile';
import Swiper from 'swiper/dist/js/swiper.js'
import 'swiper/dist/css/swiper.min.css'
import styles from './styles.module.css';
import { getCategoryList, getProductList, getCityList } from './api';
import globalVal from '../../../../utils/global_val';

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

        // this.didFocusListener = this.props.navigation.addListener(
        //     'didFocus',
        //     this.didFocus,
        // );

    }

    didFocus = () => {
    }


    async componentDidMount() {
        var mySwiper = new Swiper('.swiper-container', {
            autoplay: true,
            loop: true,
            pagination : {
                el: '.swiper-pagination',
            }
        });

       // SplashScreen.hide();
        Toast.loading("请稍后...", 30);
      //  loadingUtil.showLoading();
        const allCategoryList = await getCategoryList();
        allCategoryList.sort((pre, cur) => pre.priority - cur.priority);

        const categoryList = allCategoryList.slice(0, 4);
        const moreCategoryList = allCategoryList.slice(4);
        const moreCategoryGroupRequest = moreCategoryList.map((category) => {
            return getProductList(category.id, category.name, globalVal.selectCity.code);
        });



        const result = await Promise.all(moreCategoryGroupRequest);
        const moreCategoryGroup = result.map((productList, index) => {
            return {
                category: moreCategoryList[index],
                productList,
            };
        });
        Toast.hide();
      //  loadingUtil.dismissLoading();

        this.setState({
            categoryList,
            moreCategoryGroup,
        });
    }

    componentWillUnmount() {
        this.didFocusListener.remove();
    }
    // #endregion

    // #region 响应方法

    onCityPress(){
        alert("city");
        // this.props.navigation.navigate('CitySelector', {
        //     refresh: (city) => {
        //         globalVal.selectCity = city;
        //         this.setState({
        //             selectCity: city,
        //         });
        //     }
        // });
    }

    onProductPress(id, name) {
        alert("onProductPress" + id + name);
       // this.props.navigation.navigate('ProductList', { productCategoryId: id, name: name })
    }

    onProductDetailPress(productDetail) {
        alert("productDetail" + productDetail.name);
      //  this.props.navigation.navigate('ProductDetail', { productDetail: productDetail })
    }

    // #endregion

    // #region 私有方法

    setGlobalCityList = async () => {
        const cityList = await getCityList();
        globalVal.cityList = cityList;
    }

    setGlobalUserInfo = async () => {
        const userInfo = await globalVal.getUserInfo();
        if (userInfo.customerId === -1) return;

        const timeSpan = (Date.now() - userInfo.lastLoginTime) / 1000 / 60 / 60 / 24; // 天数
        if (timeSpan < 30) {
            globalVal.userInfo = userInfo;
        } else {
            globalVal.userInfo = {
                customerId: -1,
            };
            //Toast.show('您的登录信息已过期，请重新登录');
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
                    src={require('../../../../assets/images/map.png')}  />
                <span className={styles.cityButtonText}>{selectCity.name}</span>
                <img
                    className={styles.cityButtonImage}
                    src={require( '../../../../assets/images/arrow-down.png')} />
            </div>
        );
    }

    renderCarouse = () => {
        return (
            <div className="swiper-container">
                <div className="swiper-wrapper">
                    <div className="swiper-slide">
                        <img
                            className={styles.carousel}
                            src={require('../../../../assets/images/Carouse1.png')} />
                    </div>
                    <div className="swiper-slide"> <img
                        className={styles.carousel}
                        src={require('../../../../assets/images/Carouse2.png')} />
                    </div>
                </div>
                <div className='swiper-pagination'></div>
            </div>);
            // <Swiper autoplay={true}>
            {/*<Image*/}
                {/*style={styles.carousel}*/}
                {/*resizeMode='cover'*/}
                {/*source={require('../../../assets/images/Carouse1.png')} />*/}
            {/*<Image*/}
                {/*style={styles.carousel}*/}
                {/*resizeMode='cover'*/}
                {/*source={require('../../../assets/images/Carouse2.png')} />*/}
        {/*</Swiper>);*/}
    }

    renderMenu = () => {
        const { categoryList } = this.state;

        return (<Flex  justify="center" className={styles.menu}>
            {categoryList.map((item, index) => <Flex.Item key={index}>
                    <div className={styles.menuButton}  onClick={() => this.onProductPress(item.id, item.name)} >
                        <img
                            className={styles.menuButtonImage}
                            src={globalVal.imgUrl + item.thumbnailUrl} />
                        <span className={styles.menuButtonText}>{item.name}</span>
                    </div>
            </Flex.Item>)}
        </Flex>);
    }

    renderAd() {
        return (<img
                className={styles.carousel}
                src={require('../../../../assets/images/ad.png')} />
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
                                    src={globalVal.imgUrl + product.thumbnailUrl} />
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

export default HomePage;
