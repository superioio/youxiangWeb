

import axios from '@/utils/http';

export async function getJsTicket() {
  return await axios.get('/api/getJsTicket')
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("login error" + error);
      return null;
    });
}

export async function initWX() {
  if (window.wx) {
    const signature = getJsTicket();

    window.wx.config({
      debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: '', // 必填，公众号的唯一标识
      timestamp: '', // 必填，生成签名的时间戳
      nonceStr: '', // 必填，生成签名的随机串
      signature: signature,// 必填，签名
      jsApiList: ['scanQRCode'] // 必填，需要使用的JS接口列表
    });

  }
}