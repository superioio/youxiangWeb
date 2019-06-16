import axios from '@/utils/http';

//用户登出
export async function logout() {
  return await axios.get('/api/customer/logout')
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("getCardList error" + error);
      return [];
    });
}


export async function createPayOrder() {
  return { prepay_id: 1, signSgin: 2 };
  return await axios.get('/api/payorder')
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log("createPayOrder error" + error);
      return null;
    });
}