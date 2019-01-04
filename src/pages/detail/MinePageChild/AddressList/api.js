import axios from '@/utils/http';
import Qs from 'qs';

// 获取用户地址列表
export async function getAddrList(customerId) {
  return await axios.get('/api/customer/getaddresslist', {
    params: {
      customerId: customerId,
      offset: 0,//分页偏移量
      limit: 100,//此页显示数目
    }
  })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("getaddresslist error" + error);
      return null;
    });
}

// 删除地址
export async function deleteAddress(id) {
  return await axios.post('/api/customer/deleteaddress',
    Qs.stringify({
      id: id,
    })
  ).then(function (response) {
    return response;
  })
    .catch(function (error) {
      console.log("deleteAddress error" + error);
      return null;
    });
}

// 设为默认POST /api/customer/setaddressdefault
export async function setIsDefault(id, isDefault) {
  return await axios.post('/api/customer/setaddressdefault',
    Qs.stringify({
      id: id,
      isDefault: isDefault
    })
  )
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("setIsDefault error" + error);
      return null;
    });
}