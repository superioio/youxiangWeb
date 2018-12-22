import axios from '@/utils/http'
import Qs from 'qs'

//计算客户需要在线支付的金额
export async function getPayCash(id) {
    return await axios.get('/api/orderinfo/customerneedpaycash', {
        params: {
            id : id,
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

//支付前校验
export async function getPayCheck(id) {
    return await axios.get('/api/orderinfo/prepaymentcheck', {
        params: {
            id : id,
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



//取消订单
export async function cancelOrder(id) {
    return await axios.post('/api/orderinfo/customercancelorder',
        Qs.stringify({
            id: id,
        })
    ).then(function (response) {
        return response;
    }) .catch(function (error) {
        console.log("cancelOrder error" + error);
        return null;
    });
}