import axios from '@/utils/http';
import Qs from 'qs';

// 注册
export async function requestReg(mobile, name) {
  return await axios.post('/api/customer/register',
    Qs.stringify({
      mobile: mobile,
      name: name,
    })
  )
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("requestReg error" + error);
      return null;
    });
}