import axios from '@/utils/http'

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
