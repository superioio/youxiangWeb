import axios from '@/utils/http'
import Qs from 'qs';

//获取商品大类
export async function getCategoryList() {
  return await axios.get('/api/product/getcategorylist', {
    params: {
      name: '',
      status: 1,
      pageSize: 100,
      pageNum: 1,
    }
  })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("getCardList error" + error);
      return [];
    });
}

//获取商品列表
export async function getProductList(productCategoryId, name, cityCode) {
  return await axios.get('/api/product/getlistforcustomer', {
    params: {
      productCategoryId: productCategoryId,
      name: '',
      productType: '',
      cityCode: cityCode,
      offset: 0,
      limit: 3,
    }
  })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("getCardList error" + error);
      return [];
    });
}

//根据二维码充值
export async function getRechargeByQRCode(code) {
  return await axios.post('/api/point/chargebyqrcode',
      Qs.stringify({
        qrCode: code,
    }))
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("getRechargeByQRCode error" + error);
      return [];
    });
}

// //暂时不用
// function getBannerImgs() {
//   return axios.get('/user/12345/permissions');
// }
// export async function loadPage() {
//   return (axios.all([getCategoryList()/*, getBannerImgs()*/])
//     .then(axios.spread(function (acct, perms) {
//       // Both requests are now complete
//
//     })));
// }
