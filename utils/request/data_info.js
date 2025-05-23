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
  page: 'page'
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
const u_getProductType = {
  URL: fin3plusUrl + "deviceBuyApi/getProductType",
}
// 获取国家列表
const u_getCountry = {
  URL: fin3plusUrl + "deviceBuyApi/getCountry",
}
// 获取价格类型列表
const u_getDeviceVersion = {
  URL: fin3plusUrl + "deviceBuyApi/getDeviceVersion",
  typeId: 'typeId'
}
// 获取销售代号列表
const u_getDeviceType = {
  URL: fin3plusUrl + "deviceBuyApi/getDeviceType",
  productTypeId: 'producttypeid'
}
// 设备购买（数据全部由用户填写）
const u_buyDevice = {
  URL: fin3plusUrl + "deviceBuyApi/buyDevice"
}
// 地址列表
const u_addressapiList = {
  URL: fin3plusUrl + "addressapi/list"
}
// 地址新增
const u_addOrUpdate = {
  URL: fin3plusUrl + "addressapi/addOrUpdate"
}
// 价格计算
const u_priceCalculation = {
  URL: fin3plusUrl + "deviceBuyApi/priceCalculation"
}
// 询价单
const u_inquirySheet = {
  URL: fin3plusUrl + "deviceBuyApi/inquirySheet"
}
// 渠道为客户设置价格
const u_devaddOrUpdate = {
  URL: fin3plusUrl + "devicePriceApi/addOrUpdate"
}
const u_list = {
  URL: fin3plusUrl + "devicePriceApi/list",
  companyName: 'companyName',
  page: 'page'
}
const u_del = {
  URL: fin3plusUrl + "devicePriceApi/del",
  id: 'id',
}
// 确认
const u_orderConfirm = {
  URL: fin3plusUrl + "deviceBuyApi/orderConfirm",
  orderNum: 'orderNum',
}
// 获取行业列表
const u_getIndustry = {
  URL: fin3plusUrl + "deviceBuyApi/getIndustry",
}
// 获取核心功能
const u_getIntroduction = {
  URL: fin3plusUrl + "deviceBuyApi/getIntroduction",
}
// 获取销售代号
const u_saleCode = {
  URL: fin3plusUrl + "deviceBuyApi/getSaleCode",
}
// 获取下单类型
const u_isNeedCarInfo = {
  URL: fin3plusUrl + "deviceBuyApi/isNeedCarInfo",
}
// 获取权限树接口
const u_getMenuTree = {
  URL: fin3plusUrl + "userapi/getMenuTree",
}
// 获取完善信息数据
const u_getRoles = {
  URL: fin3plusUrl + "companyapi/getRoles",
}
// 角色列表
const u_roleapiList = {
  URL: fin3plusUrl + "roleapi/list",
  page:'page'
}
// 角色删除
const u_roleapidel = {
  URL: fin3plusUrl + "roleapi/del",
  page:'page'
}
// 角色删除
const u_roleapiaddOrUpdate = {
  URL: fin3plusUrl + "roleapi/addOrUpdate",
  page:'page'
}


module.exports = {
  u_roleapiaddOrUpdate,
  u_roleapidel,
  u_roleapiList,
  u_getRoles,
  u_getMenuTree,
  u_isNeedCarInfo,
  u_saleCode,
  u_getIntroduction,
  u_getIndustry,
  u_orderConfirm,
  u_del,
  u_list,
  u_devaddOrUpdate,
  u_inquirySheet,
  u_getProductType,
  u_priceCalculation,
  u_addOrUpdate,
  u_addressapiList,
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