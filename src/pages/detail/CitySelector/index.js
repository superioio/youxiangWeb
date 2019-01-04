import React, { Component } from 'react';
import { NavBar, Icon, Toast } from 'antd-mobile';
import { getCityLocation } from '@/utils/location';
import { getCityList } from './api';
import { withRouter } from "react-router-dom";
import globalVal from '@/utils/global_val';
import styles from "./styles.module.css";

class CitySelector extends Component {
  // #region 构造器

  constructor(props) {
    super(props);
    this.state = {
      locationCity: {},
      citys: [],
    };
  }

  // #endregion

  // #region 生命周期

  async componentDidMount() {
    const cityList = await getCityList();
    if (cityList.error) {
      Toast.fail(cityList.error);
      return;
    }

    this.setState({
      citys: this.convertCityList(cityList),
    });
    Toast.loading("", 3);
    getCityLocation()
      .then(res => {
        if (res.status === 0) {
          const { result } = res;
          const {
            addressComponent: { city, adcode }
          } = result;

          const locationCity = {
            code: adcode,
            name: city,
          };
          this.setState({
            locationCity,
          });
        }
        Toast.hide();
      })
      .catch(err => {
        Toast.hide();
        console.warn('获取失败' + err);
      });
  }

  // #endregion

  // #region 私有方法

  convertCityList = (cityList) => {
    const cityGroup = {
      A: [], B: [], C: [], D: [], E: [], F: [], G: [],
      H: [], I: [], J: [], K: [], L: [], M: [], N: [],
      O: [], P: [], Q: [], R: [], S: [], T: [],
      U: [], V: [], W: [], X: [], Y: [], Z: [],
    };
    cityList.forEach(city => {
      cityGroup[city.cityPinyin].push({
        name: city.cityName,
        code: city.cityCode,
      });
    });

    return cityGroup;
  }

  // #endregion 

  // #region 响应方法

  onBack = () => {
    this.props.history.goBack();
  }
  onSelectCity = (city) => {
    city.code = city.code.substr(0,4) + '00';
    globalVal.routeSelectCity = city;
    this.props.history.goBack();
  }

  // #endregion

  // #region render方法

  renderNavbar = () => {
    return (<NavBar
      mode="light"
      icon={<Icon type="left" />}
      onLeftClick={this.onBack}
    >城市选择</NavBar>);
  }

  renderCitys = () => {
    const { citys } = this.state;
    return Object.keys(citys)
      .filter(key => citys[key].length > 0)
      .map((key) => {
        const keyView = <div key={key} className={styles.contentTitle}>
          <div className={styles.contentTitleText}>{key}</div>
        </div>;
        const values = citys[key].map(city => <div key={city.code} className={styles.contentCity}>
          <div className={styles.contentButton} onClick={() => { this.onSelectCity(city) }}>
            <div>{city.name}</div>
          </div>
        </div>);

        return [keyView, ...values];
      });
  }

  renderContent = () => {
    const { locationCity } = this.state;

    return (<div className={styles.contentContain} >
      <div className={styles.contentInnerContain}>
        <div className={styles.contentTitle}>
          <div className={styles.contentTitleText}>当前定位城市</div>
        </div>
        <div className={styles.contentCity}
          onClick={() => { this.onSelectCity(locationCity) }} >
          <div className={styles.contentCityText}>{locationCity.name}</div>
        </div>
        {this.renderCitys()}
      </div>
    </div>);
  }

  render() {
    return (
      <div className={styles.container}>
        {this.renderNavbar()}
        {this.renderContent()}
      </div>
    );
  }

  // #endregion
}

export default withRouter(CitySelector);
