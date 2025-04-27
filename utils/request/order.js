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
  orderNum:'orderNum'
}
module.exports = {
  u_pay,
  u_orderList,
  u_serviceList,
  u_getServiceFiled
}