
const globalVal = {
  selectCity: {
    code: '110100',
    name: '北京',
  },
  selectedTab: 'homeTab',
  userInfo: {
    customerId: -1,
    customerName: '',
    customerMobile: '',
    sessionId: '',
    lastLoginTime: Date.now(),
  },
  setSelectCity(value) {
    localStorage.setItem('selectCity', JSON.stringify(value));
  },
  getSelectCity() {
    const selectCity = localStorage.getItem('selectCity');
    if (!selectCity) {
      return {
        code: '110100',
        name: '北京',
      };
    }
    return JSON.parse(selectCity);
  },
  setUserInfo(value) {
    localStorage.setItem('userInfo', JSON.stringify(value));
  },
  getUserInfo() {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      return {
        customerId: -1,
        customerName: '',
        customerMobile: '',
        sessionId: '',
        lastLoginTime: Date.now(),
      };
    }
    return JSON.parse(userInfo);
  },
  imgUrl: `/static/`,
  // imgUrl: 'http://admin.offline.ue-link.cn/static/',
  // imgUrl: 'http://148.70.110.127:8080/static/',

  routeIsFromPay: null,
  routeAddrInfo: null,
  routeSelectCity: null,
  routeProductCategory: null, // { id:1,name:'家庭保洁'}
  routeProductDetail: null,

  routeOrderInfo: null,
  routeAddress: null,
  routePayCash: null,
  routeIsFromProductDetail: null,

  routePointCard: null,
  routeStoredCard: null,
  routeVoucher: null,

  homePageRef: null,
  orderPageRef: null,
  minePageRef: null,

  wxInitParams: {
    appId: '',
    timestamp: '',
    nonceStr: '',
    signature: '',
  }
};
export default globalVal;