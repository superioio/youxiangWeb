import axios from '@/utils/http';

// 注册
export async function requestReg(mobile, name) {
  return await axios.post('/api/customer/register', {
    params: {
      mobile: mobile,
      name: name,
    }
  })
    .then(function (response) {
      return JSON.parse(response.data).data;
    })
    .catch(function (error) {
      console.log("requestReg error" + error);
      return null;
    });
}