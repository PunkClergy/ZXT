const fin3plusUrl = '';
// 余额设备统计(购买充值首页)
const u_blanceAndDeviceReport = {
  URL: fin3plusUrl + 'deviceBuyApi/blanceAndDeviceReport',
}

const u_payRecord = {
  URL: fin3plusUrl + "deviceBuyApi/payRecord",
  companyId: 'companyId',
  page: 'page'
}
const u_getCompanyInfo = {
  URL: fin3plusUrl + "api/getCompanyInfo",
  companyId: 'companyId',
}
const u_buyCount = {
  URL: fin3plusUrl + "api/buyCount",
  buyCount: 'buyCount',
  companyId: 'companyId',
}
// 购买记录
const u_buyRecord = {
  URL: fin3plusUrl + "deviceBuyApi/buyRecord",
  num: 'num',
  page: 'page',
  days: 'days',
  status: 'status',
  comParam: 'comParam'
}
// MCCK生成订单
const u_buyMcckDevice = {
  URL: fin3plusUrl + "deviceBuyApi/buyMcckDevice",
  orderBO: 'orderBO'
}
// 自助取还设备购买表格上传
const u_mcckFileUpload = {
  URL: fin3plusUrl + "deviceBuyApi/mcckFileUpload",
}

module.exports = {
  u_blanceAndDeviceReport,
  u_payRecord,
  u_getCompanyInfo,
  u_buyCount,
  u_buyRecord,
  u_buyMcckDevice,
  u_mcckFileUpload
}