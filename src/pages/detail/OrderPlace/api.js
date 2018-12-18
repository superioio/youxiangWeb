import axios from '@/utils/http'
import Qs from 'qs'

//获取默认地址
export async function getDefaultAddress(customerId) {
    return await axios.get('/api/customer/getdefaultaddress', {
        params: {
            customerId : customerId,
        }
    })
        .then(function (response) {
            return JSON.parse(response.data).data;
        })
        .catch(function (error) {
            console.log("getVoucherList error" + error);
            return null;
        });
}
//下单
export async function placeOrder(orderInfo,customerId) {
    const voucherIds = orderInfo.voucherIds.substring(0,orderInfo.voucherIds.length-1);
    const rechargeCardIds = orderInfo.rechargeCardIds.substring(0,orderInfo.rechargeCardIds.length-1);
     return await axios.post('/api/orderinfo/customerplaceorder',
        Qs.stringify({
            customerId : customerId,
            productId : orderInfo.productId,
            customerCityCode : orderInfo.customerCityCode,
            count : orderInfo.count,
            customerAddress : orderInfo.customerAddress,
            customerMobile : orderInfo.customerMobile,
            customerName : orderInfo.customerName,
            customerRemark : orderInfo.customerRemark,
            serviceTime : orderInfo.serviceTime,
            voucherIds : voucherIds,
            rechargeCardIds : rechargeCardIds,
        })
    ).then(function (response) {
        return JSON.parse(response.data).data;
    }) .catch(function (error) {
        console.log("placeOrder error" + error);
        return null;
    });
}

//查看可用的代金券
export async function getVoucherList(customerId, productId, cityCode, ) {
    return await axios.get('/api/voucher/findbygoodsattrpage', {
        params: {
            customerId : customerId,
            productId: productId,
            cityCode: cityCode,
            pageSize: 100,
            pageNum: 1
        }
    })
        .then(function (response) {
            return JSON.parse(response.data).data;
        })
        .catch(function (error) {
            console.log("getVoucherList error" + error);
            return null;
        });
}

//查看可用的充值卡
export async function getCardList(customerId, productId, cityCode, ) {
    return await axios.get('/api/rc/findbygoodsattrpage', {
        params: {
            customerId : customerId,
            productId: productId,
            cityCode: cityCode,
            pageSize: 100,
            pageNum: 1
        }
    })
        .then(function (response) {
            return JSON.parse(response.data).data;
        })
        .catch(function (error) {
            console.log("getCardList error" + error);
            return null;
        });
}

