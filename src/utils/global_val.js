 import { sessionStorage } from "react";

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
  // async setUserInfo(value) {
  //     sessionStorage.setItem('userInfo', JSON.stringify(value));
  // },
  async getUserInfo() {
    return globalVal.userInfo;
    // const data = await sessionStorage.getItem('userInfo');
    // if (!data) {
    //   return {
    //     customerId: -1,
    //     customerName: '',
    //     customerMobile: '',
    //     sessionId: '',
    //     lastLoginTime: '',
    //   };
    // }
    // return JSON.parse(data);
  },
  imgUrl: 'http://148.70.110.127:8080/static/',
};
export default globalVal;