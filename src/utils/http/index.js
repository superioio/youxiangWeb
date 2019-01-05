import axios from 'axios';
import {Toast }from "antd-mobile";
// import Toast from '../Toast';

var instance = axios.create({
  timeout: 5000,
  headers: {
    'X-Custom-Header': 'foobar',
    "Access-Control-Allow-Headers": "Authorization,Origin, X-Requested-With, Content-Type, Accept"
    // 'Content-Type': 'application/x-www-form-urlencoded'
  },
  withCredentials: true,
  // `transformResponse` allows changes to the response data to be made before
  // it is passed to then/catch
  transformResponse: [function (data) {
    /**
     * 通过返回的data，来统一处理异常
     */
    return data;
    // Alter defaults after instance has been created 处理token
    // instance.defaults.headers.common['Authorization'] = token;
  }],
});

// 出错的回调
const errorCallback = (error) => {
  Toast.fail(error.toString());
  return Promise.reject(error);
};

// 接口返回值的拦截器
instance.interceptors.response.use((response) => {
  try {
    const { data } = response;
    if (JSON.parse(data).error) {
      throw JSON.parse(data).error.message || '接口发生错误';
    }
    return JSON.parse(data).data;
  }
  catch (e) {
    //Toast.fail(e);
    return {error: e};
  }
}, errorCallback);

export default instance;