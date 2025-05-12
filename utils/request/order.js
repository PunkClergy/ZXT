const fin3plusUrl = '';
const u_orderList = {
  URL: fin3plusUrl + 'cwapi/orderList',
  days: 'days',
  orderTypes: 'orderTypes',
  status: 'status',
  page: 'page',
  comParam: 'comParam'
}
const u_serviceList = {
  URL: fin3plusUrl + 'cwapi/serviceList',
}
const u_getServiceFiled = {
  URL: fin3plusUrl + 'cwapi/getServiceFiled',
}
// 查询订单支付敏感信息
const u_pay = {
  URL: fin3plusUrl + 'deviceBuyApi/pay',
  orderNum: 'orderNum'
}
// 油费报销列表 需要修改
const u_addOrUpdate = {
  URL: fin3plusUrl + 'oilReimbursementapi/list',
  page: 'page',
  comParam: 'comParam'
}
// 油费报销列表 需要修改
const u_addList = {
  URL: fin3plusUrl + 'oilReimbursementapi/addOrUpdate',
}
const u_scheduledaddOrUpdate = {
  URL: fin3plusUrl + 'scheduledCarApi/addOrUpdate',
}
const u_scheduledCarList = {  
  URL: fin3plusUrl + 'scheduledCarApi/list',
  page: 'page',
  comParam: 'comParam'
}
module.exports = {
  u_scheduledaddOrUpdate,
  u_scheduledCarList,
  u_addList,
  u_addOrUpdate,
  u_pay,
  u_orderList,
  u_serviceList,
  u_getServiceFiled
}