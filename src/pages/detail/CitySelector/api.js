import axios from '@/utils/http'

//获取城市列表
export async function getCityList() {
  return await axios.get('/api/syscity/getcitylist',{
          params: {
              cityCode: 'all',
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