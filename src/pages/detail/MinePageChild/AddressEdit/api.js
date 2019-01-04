import axios from '@/utils/http';
import Qs from 'qs';

//添加地址
export async function addAddr(info) {
  return await axios.post('/api/customer/addaddress',
    Qs.stringify({
      customerId: info.customerId,
      gender: info.gender,
      cityCode: info.cityCode,
      address: info.address,
      mobile: info.mobile,
      name: info.name,
      remark: info.remark,
      isDefault: info.isDefault,
    })
  )
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("addAddr error" + error);
      return null;
    });
}

//编辑地址
export async function editAddr(info) {
  return await axios.post('/api/customer/updateaddress',
    Qs.stringify({
      id: info.id,
      customerId: info.customerId,
      gender: info.gender,
      cityCode: info.cityCode,
      address: info.address,
      mobile: info.mobile,
      name: info.name,
      remark: info.remark,
      isDefault: info.isDefault,
    })
  )
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("editAddr error" + error);
      return null;
    });
}