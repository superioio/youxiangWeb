import axios from '../../../../utils/http'

export async function getOrderList(customerId) {
  return await axios.get('/api/orderinfo/customerlistpage', {
    params: {
      status: "0",//订单状态【0为全部，1代付款，2待派单，3待服务，4已完成，5取消待审核，6取消审核未通过，7已取消】
      customerId: customerId,
      pageSize: 100,
      pageNum: 1
    }
  })
    .then(function (response) {
      return JSON.parse(response.data).data;
    })
    .catch(function (error) {
      console.log("getOrderList error" + error);
      return null;
    });
}

export async function getOrderListByStatus(status, customerId) {
  return await axios.get('/api/orderinfo/customerlistpage', {
    params: {
      status: status,//订单状态【0为全部，1代付款，2待派单，3待服务，4已完成，5取消待审核，6取消审核未通过，7已取消】
      customerId: customerId,
      pageSize: 100,
      pageNum: 1
    }
  })
    .then(function (response) {
      return JSON.parse(response.data).data;
    })
    .catch(function (error) {
      console.log("getOrderList error" + error);
      return null;
    });
}
