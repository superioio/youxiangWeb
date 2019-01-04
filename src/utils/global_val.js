
const globalVal = {
  selectCity: {
    code: '110000',
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
  setUserInfo(value) {
    sessionStorage.setItem('userInfo', JSON.stringify(value));
  },
  getUserInfo() {
    const userInfo = sessionStorage.getItem('userInfo');
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
  imgUrl: 'http://admin.offline.ue-link.cn/static/',
  //imgUrl: 'http://148.70.110.127:8080/static/',

  routeIsFromPay: null,
  routeAddrInfo: null,
  routeSelectCity: null,
  routeProductCategory: null, // { id:1,name:'家庭保洁'}
  routeProductDetail: null,

  routeOrderInfo: null,
  routeAddress: null,
  routePayCash: null,
  routeIsFromProductDetail: null,

  routeDiscount: null,
};
export default globalVal;