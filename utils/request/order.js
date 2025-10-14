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
// 油费报销列表
const u_scheduledCarList = {
  URL: fin3plusUrl + 'scheduledCarApi/list',
  page: 'page',
  comParam: 'comParam'
}
// 油费报销删除
const u_scheduledCarApiDel = {
  URL: fin3plusUrl + 'scheduledCarApi/del',
}
// 油费审批
const u_scheduledCarApiExam = {
  URL: fin3plusUrl + 'oilReimbursementapi/approve',
}
// 电子钥匙-申请
const u_vehicleApplyApiApprove = {
  URL: fin3plusUrl + 'vehicleApplyApi/applyCar',
}
// 电子钥匙-列表
const u_vehicleApplyApiList = {
  URL: fin3plusUrl + 'vehicleApplyApi/list',
  page: 'page',
}
// 电子钥匙-归还
const u_retrunCar = {
  URL: fin3plusUrl + 'vehicleApplyApi/retrunCar',
}
// 电子钥匙审批
const u_vehicleApplyApiApproveKey = {
  URL: fin3plusUrl + 'vehicleApplyApi/approve',
}
const u_updateRentKey = {
  URL: fin3plusUrl + 'rentKeyApi/updateRentKey',
}
const u_getCarBluetoothKeyByCode = {
  URL: fin3plusUrl + 'renterApi/getCarBluetoothKeyByCode',
}
// 修改的电子钥匙
module.exports = {
  u_getCarBluetoothKeyByCode,
  u_updateRentKey,
  u_vehicleApplyApiApproveKey,
  u_retrunCar,
  u_vehicleApplyApiList,
  u_vehicleApplyApiApprove,
  u_scheduledCarApiExam,
  u_scheduledCarApiDel,
  u_scheduledaddOrUpdate,
  u_scheduledCarList,
  u_addList,
  u_addOrUpdate,
  u_pay,
  u_orderList,
  u_serviceList,
  u_getServiceFiled
}