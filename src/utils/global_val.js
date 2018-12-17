
const globalVal = {
  cityList: [],
  selectCity: {
    code: '110000',
    name: '北京',
  },
  userInfo: {
    customerId: 8,
    customerName: '张军',
    customerMobile: '183888888',
    sessionId: '',
    lastLoginTime: Date.now(),
  },
  setUserInfo(value) {
    sessionStorage.setItem('userInfo', JSON.stringify(value));
  },
  getUserInfo() {
    const userInfo = sessionStorage.getItem('userInfo');
    if (!userInfo) {
      return {};
    }
    return JSON.parse(userInfo);
  },
  imgUrl: 'http://148.70.110.127:8080/static/',
};
export default globalVal;