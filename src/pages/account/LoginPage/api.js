import axios from '@/utils/http';

//获取验证码
export async function getVerifyCode(mobile) {
  console.log('mobile', mobile);
  return await axios.get('/api/signin/customersendcode', {
    params: {
      mobile: mobile,
    }
  })
    .then(function (response) {
      console.log('response', response);
      return JSON.parse(response.data).data.bizId;
    })
    .catch(function (error) {
      console.log("getVerifyCode error" + error);
      return null;
    });
}

//登录
export async function login(mobile, identifyingCode, bizId) {
  return await axios.get('/api/signin/customersignin', {
    params: {
      mobile: mobile,
      identifyingCode: identifyingCode,
      bizId: bizId,
    }
  })
    .then(function (response) {
      return JSON.parse(response.data).data;
    })
    .catch(function (error) {
      console.log("login error" + error);
      return null;
    });
}