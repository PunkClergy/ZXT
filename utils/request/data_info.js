const fin3plusUrl = '';
// 获取省份列表
const u_getProvinces = {
  URL: fin3plusUrl + "companyapi/getProvinces",
  provinceId: 'provinceId'
}
// 获取城市列表
const u_getCitys = {
  URL: fin3plusUrl + "companyapi/getCitys",
  provinceId: 'provinceId'
}
//公司信息完善
const u_companyImprove = {
  URL: fin3plusUrl + "companyapi/companyImprove",
}
// 子账户列表
const u_childUserList = {
  URL: fin3plusUrl + "companyapi/childUserList",
}
// 创建或更新子账号
const u_addOrUpdateChildUser = {
  URL: fin3plusUrl + "companyapi/addOrUpdateChildUser",
}
// 获取公司信息
const u_companyInfo = {
  URL: fin3plusUrl + "companyapi/companyInfo",
}
// 删除子账户
const u_delChildUser = {
  URL: fin3plusUrl + "companyapi/delChildUser",
  id: 'id'
}
// 订单购买记录
const u_buyRecord = {
  URL: fin3plusUrl + "deviceBuyApi/buyRecord",
  days: 'days',
  orderTypes: 'orderTypes',
  status: 'status',
  page: 'page',
  comParam: 'comParam'
}
// 获取类别列表
const u_getDeviceType = {
  URL: fin3plusUrl + "deviceBuyApi/getDeviceType",
}
// 获取国家列表
const u_getCountry = {
  URL: fin3plusUrl + "deviceBuyApi/getCountry",
}
// 获取硬件版本列表
const u_getDeviceVersion = {
  URL: fin3plusUrl + "deviceBuyApi/getDeviceVersion",
  typeId: 'typeId'
}
// 设备购买（数据全部由用户填写）
const u_buyDevice = {
  URL: fin3plusUrl + "deviceBuyApi/buyDevice"
}
module.exports = {
  u_buyDevice,
  u_getDeviceType,
  u_getCountry,
  u_getDeviceVersion,
  u_getCitys,
  u_getProvinces,
  u_companyImprove,
  u_childUserList,
  u_addOrUpdateChildUser,
  u_companyInfo,
  u_delChildUser,
  u_buyRecord
}