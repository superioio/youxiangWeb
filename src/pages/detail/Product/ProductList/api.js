import axios from '@/utils/http'

//获取商品列表
export async function getProductList(productCategoryId, name, cityCode) {
    return await axios.get('/api/product/getlistforcustomer', {
        params: {
            productCategoryId : productCategoryId,
            name : '',
            productType : '',
            cityCode : cityCode,
            offset : 0,
            limit : 100,
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