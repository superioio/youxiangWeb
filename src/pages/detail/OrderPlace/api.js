import axios from '@/utils/http'
import Qs from 'qs';

//获取默认地址
export async function getDefaultAddress(customerId) {
  return await axios.get('/api/customer/getdefaultaddress', {
    params: {
      customerId: customerId,
    }
  })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("getVoucherList error" + error);
      return null;
    });
}
//下单
export async function placeOrder(orderInfo, customerId, cidycode) {
  const voucherIds = orderInfo.voucherIds.substring(0, orderInfo.voucherIds.length - 1);
  const rechargeCardIds = orderInfo.rechargeCardIds.substring(0, orderInfo.rechargeCardIds.length - 1);
  const pointIds = orderInfo.pointsCardIds.substring(0, orderInfo.pointsCardIds.length - 1);
  const cityCode = cidycode.substr(0, 4) + '00';
  return await axios.post('/api/orderinfo/customerplaceorder',
    Qs.stringify({
      customerId: customerId,
      productId: orderInfo.productId,
      customerCityCode: cityCode,
      count: orderInfo.count,
      customerAddress: orderInfo.customerAddress,
      customerMobile: orderInfo.customerMobile,
      customerName: orderInfo.customerName,
      customerRemark: orderInfo.customerRemark,
      serviceTime: orderInfo.serviceTime,
      voucherIds: voucherIds,
      rechargeCardIds: rechargeCardIds,
      pointIds: pointIds,
    })
  ).then(function (response) {
    return response;
  }).catch(function (error) {
    console.log("placeOrder error" + error);
    return null;
  });
}

//查看可用的代金券
export async function getVoucherList(customerId, productId, cityCode, ) {
  return await axios.get('/api/voucher/findbygoodsattrpage', {
    params: {
      customerId: customerId,
      productId: productId,
      cityCode: cityCode,
      pageSize: 100,
      pageNum: 1
    }
  })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("getVoucherList error" + error);
      return null;
    });
}

//查看可用的充值卡
export async function getCardList(customerId, productId, cityCode, ) {
  return await axios.get('/api/rc/findbygoodsattrpage', {
    params: {
      customerId: customerId,
      productId: productId,
      cityCode: cityCode,
      pageSize: 100,
      pageNum: 1
    }
  })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("getCardList error" + error);
      return null;
    });
}


// 创建微信支付订单
export async function createPayOrder(params) {
  // return { prepay_id: 1, paySign: 2 }; // mock数据
  return await axios.post('/api/wxpay/unifiedorder', Qs.stringify(params))
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("createPayOrder error" + error);
      return null;
    });
}