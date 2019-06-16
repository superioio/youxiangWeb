
import axios from '@/utils/http';
import { Toast } from "antd-mobile";
import globalVal from '@/utils/global_val';

export async function getJsTicket(clientKey, timestamp, nonceStr, url) {
  console.log('getJsTicket');
  return await axios.get('/api/wechatpublic/getsignature', {
    params: {
      clientKey: clientKey,
      timestamp: timestamp,
      nonceStr: nonceStr,
      url: url
    }
  })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("getJsTicket error" + error);
      return null;
    });
}

function randomStrCode(len) {
  var d,
    e,
    b = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    c = "";
  for (d = 0; len > d; d += 1) {
    e = Math.random() * b.length;
    e = Math.floor(e);
    c += b.charAt(e);
  }
  return c;
}

export async function initWX() {
  //if (window.wx) {
  if (globalVal.wxInitParams.signature === '') {
    const clientKey = '7a4dd7faa7f3ce1613581703c5e264e4';
    const timestamp = new Date().getTime();
    const nonceStr = randomStrCode(16);
    const url = window.location.href;
    const res = await getJsTicket(clientKey, timestamp, nonceStr, url);

    if (res.error) {
      Toast.fail(res.error);
      return;
    }

    globalVal.wxInitParams = {
      appid: res.appid,
      timestamp: "" + timestamp,
      nonceStr: nonceStr,
      signature: res.signature,
    };
  }
  window.wx.config({
    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: globalVal.wxInitParams.appid, // 必填，公众号的唯一标识
    timestamp: globalVal.wxInitParams.timestamp, // 必填，生成签名的时间戳
    nonceStr: globalVal.wxInitParams.nonceStr, // 必填，生成签名的随机串
    signature: globalVal.wxInitParams.signature,// 必填，签名
    jsApiList: ['scanQRCode'] // 必填，需要使用的JS接口列表
  });
  // }
}

export async function getConfig() {
  return await fetch('/config.json', { responseType: 'json' })
    .then(response => {
      return response.json();
    })
    .then(function (json) {
      return json;
    });
}

export function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

export async function getOpenId(code) {
  return await axios.get('/api/getOpenId', {
    params: {
      code: code,
    }
  })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("getOpenId error" + error);
      return null;
    });
}