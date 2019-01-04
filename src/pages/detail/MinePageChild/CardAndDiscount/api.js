import axios from '@/utils/http'
import Qs from 'qs'

//获取充值卡列表
export async function getCardList(status, customerId) {
    return await axios.get('/api/rc/findbycustomeridpage', {
        params: {
            customerId : customerId,
            status: status,//0为所有，1为不可用【包括过期、停用和余额为0】，2为可用
            pageSize: 100,
            pageNum: 1
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

//获取积分卡列表
export async function getPointList(status, customerId) {
    return await axios.get('/api/point/findbycustomeridpage', {
        params: {
            customerId : customerId,
            status: status,//0为所有，1为不可用【包括过期、停用和余额为0】，2为可用
            pageSize: 100,
            pageNum: 1
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
//获取代金券列表
export async function getDiscountList(status, customerId) {
    return await axios.get('/api/voucher/findbycustomeridpage', {
        params: {
            customerId : customerId,
            status: status,//0为所有，1为不可用【包括过期、停用和余额为0】，2为可用
            pageSize: 100,
            pageNum: 1
        }
    })
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            console.log("getDiscountList error" + error);
            return null;
        });
}

//兑换充值卡
export async function exchangeCard(keyStr, phoneNumber) {
    return await axios.post('/api/rcexchangecode/customerselfcodecharge',
        Qs.stringify({
            keyt : keyStr,
            mobile: phoneNumber
        })
    )
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            console.log("exchangeDiscount error" + error);
            return null;
        });
}

//兑换积分卡
export async function exchangePoint(keyStr, phoneNumber) {
    return await axios.post('/api/pointexchangecode/customerselfcodecharge',
        Qs.stringify({
            keyt : keyStr,
            mobile: phoneNumber
        })
    )
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            console.log("exchangeDiscount error" + error);
            return null;
        });
}
//兑换代金券
export async function exchangeVoucher(keyStr,phoneNumber) {
    return await axios.post('/api/voucherexchangecode/customerselfcodecharge',
        Qs.stringify({
            keyt : keyStr,
            mobile: phoneNumber
        })
    )
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            console.log("exchangeDiscount error" + error);
            return null;
        });
}

//根据具体的商品获得代金券列表
export async function getVoucherListByProduct(customerId, productId, cityCode) {
    return await axios.get('/api/voucher/findbygoodsattrpage', {
        params: {
            customerId : customerId,
            productId : productId,
            cityCode: cityCode,
            pageSize: 100,
            pageNum: 1
        }
    })
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            console.log("getDiscountList error" + error);
            return null;
        });
}
//根据具体的商品获得储值卡列表
export async function getCardListByProduct(customerId, productId, cityCode) {
    return await axios.get('/api/rc/findbygoodsattrpage', {
        params: {
            customerId : customerId,
            productId :productId,
            cityCode: cityCode,
            pageSize: 100,
            pageNum: 1
        }
    })
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            console.log("getDiscountList error" + error);
            return null;
        });
}

//根据具体的商品获得积分卡列表
export async function getPointListByProduct(customerId, productId, cityCode) {
    return await axios.get('/api/point/findbygoodsattrpage', {
        params: {
            customerId : customerId,
            productId :productId,
            cityCode: cityCode,
            pageSize: 100,
            pageNum: 1
        }
    })
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            console.log("getDiscountList error" + error);
            return null;
        });
}
