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
// 获取区县
const u_getAreas = {
  URL: fin3plusUrl + "companyapi/getAreas",
  cityId: 'cityId'
}
//公司信息完善
const u_companyImprove = {
  URL: fin3plusUrl + "companyapi/companyImprove",
}
// 子账户列表
const u_childUserList = {
  URL: fin3plusUrl + "accountapi/childUserList",
  page: 'page'
}
// 渠道合租协议列表
const u_channelAgreementList = {
  URL: fin3plusUrl + "/promotionalApi/channelAgreementList",
  page: 'page'
}
// 车务
const u_carManagerList = {
  URL: fin3plusUrl + "rentKeyApi/carManagerList",
  page: 'page'
}
// 获取公司信息
const u_companyInfo = {
  URL: fin3plusUrl + "companyapi/companyInfo",
}
// 删除子账户
const u_delChildUser = {
  URL: fin3plusUrl + "accountapi/delChildUser",
  id: 'id'
}
// 订单购买记录
const u_buyRecord = {
  URL: fin3plusUrl + "deviceBuyApi/customerOrderList",
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
// const u_buyDevice = {
//   URL: fin3plusUrl + "deviceBuyApi/buyDevice"
// }
const u_buyDevice = {
  URL: fin3plusUrl + "deviceBuyApi/submitCustomerOrder"
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
  URL: fin3plusUrl + "publicApi/getIndustry",
}
// 原始订单取消
const u_cancalCustomerOrder = {
  URL: fin3plusUrl + "deviceBuyApi/cancalCustomerOrder",
}
// 原始订单删除
const u_delCustomerOrder = {
  URL: fin3plusUrl + "deviceBuyApi/delCustomerOrder",
}
// 获取核心功能
// const u_getIntroduction = {
//   URL: fin3plusUrl + "deviceBuyApi/getIntroduction",
// }
const u_getIntroduction = {
  URL: fin3plusUrl + "deviceBuyApi/getDeviceFun",
}
// 获取设备类型
const u_getDeviceClass = {
  URL: fin3plusUrl + "publicApi/getDeviceClass",
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
  URL: fin3plusUrl + "roleapi/getMenuTree",
}
// 获取完善信息数据
const u_getRoles = {
  URL: fin3plusUrl + "companyapi/getRoles",
}
// 角色列表
const u_roleapiList = {
  URL: fin3plusUrl + "roleapi/list",
  page: 'page'
}
// 角色删除
const u_roleapidel = {
  URL: fin3plusUrl + "roleapi/del",
  id: 'id',
  page: 'page'
}
// 角色删除
const u_roleapiaddOrUpdate = {
  URL: fin3plusUrl + "roleapi/addOrUpdate",
  page: 'page'
}

// 设置权限
const u_setMenuTree = {
  URL: fin3plusUrl + "roleapi/setMenuTree",
  roleId: 'roleId',
  menuIds: 'menuIds'
}
// 订单详情
const u_getOrderDetial = {
  URL: fin3plusUrl + "deviceBuyApi/getOrderDetial",
  orderId: 'orderId'
}
// 原始订单详情
const u_customerOrderDetail = {
  URL: fin3plusUrl + "deviceBuyApi/customerOrderDetail",
  orderId: 'orderId'
}
// 移交管理员
const u_transferAdminUser = {
  URL: fin3plusUrl + "accountapi/transferAdminUser",
  targetUserId: 'targetUserId'
}
// 提交寄送钥匙单号
const u_submitKeymailing = {
  URL: fin3plusUrl + "deviceBuyApi/submitKeymailing",
  orderid: 'orderid',
  num: 'num',
  name: 'name'
}
// 申请安装
const u_submitOrderInsall = {
  URL: fin3plusUrl + "deviceBuyApi/submitOrderInsall",
  orderid: 'orderid',
  personname: 'personname',
  mobile: 'mobile',
  address: 'address',
  installdate: 'installdate'
}
const u_myCustomerService = {
  URL: fin3plusUrl + "deskapi/myCustomerService",
}
const u_addMessage = {
  URL: fin3plusUrl + "userapi/addMessage",
}
const u_zxtInvoicelnfo = {
  URL: fin3plusUrl + "deskapi/zxtInvoiceInfo",
}
const u_zxtShippingAddress = {
  URL: fin3plusUrl + "deskapi/zxtShippingAddress",
}
// 预约安装列表
const u_installapiList = {
  URL: fin3plusUrl + "installapi/list",
  page: 'page'
}
// 取消预约安装
const u_installapiDel = {
  URL: fin3plusUrl + "installapi/del",
  id: 'id'
}
// 订单列表
const u_installapiBuyRecord = {
  URL: fin3plusUrl + "deviceBuyApi/buyRecord",
}
// 预约安装
const u_installapiAddOrUpdate = {
  URL: fin3plusUrl + "installapi/addOrUpdate",
}
// 获取角色
const u_GetRole = {
  URL: fin3plusUrl + "roleapi/getRole",
}
// 新增账号
const u_addOrUpdateChildUser = {
  URL: fin3plusUrl + "accountapi/addOrUpdateChildUser",
}
const u_shopApiList = {
  URL: fin3plusUrl + "shopapi/list",
}
// 电子围栏列表
const u_efenceList = {
  URL: fin3plusUrl + "efenceApi/efenceList",
}
// 电子围栏新增
const u_saveOrUpdateEfence = {
  URL: fin3plusUrl + "efenceApi/saveOrUpdateEfence",
}
// 电子围栏删除
const u_deleteEfence = {
  URL: fin3plusUrl + "efenceApi/deleteEfence",
}
// 电子围栏绑定车辆
const u_efenceBindVeh = {
  URL: fin3plusUrl + "efenceApi/efenceBindVeh",
}
const u_efenceUnbindVeh = {
  URL: fin3plusUrl + "efenceApi/efenceUnbindVeh",
}
const u_vehUnBindCarManager = {
  URL: fin3plusUrl + "rentKeyApi/vehUnBindCarManager",
}
const u_getShopLink = {
  URL: fin3plusUrl + "deskapi/getShopLink",
}
const u_willingkey = {
  URL: fin3plusUrl + "deviceBuyApi/willingKey",
}
const u_getMyCoupon = {
  URL: fin3plusUrl + "accountapi/getMyCoupon",
  
}
module.exports = {
  u_channelAgreementList,
  u_getMyCoupon,
  u_willingkey,
  u_getShopLink,
  u_vehUnBindCarManager,
  u_efenceUnbindVeh,
  u_efenceBindVeh,
  u_deleteEfence,
  u_saveOrUpdateEfence,
  u_efenceList,
  u_carManagerList,
  u_shopApiList,
  u_GetRole,
  u_getAreas,
  u_installapiAddOrUpdate,
  u_installapiBuyRecord,
  u_installapiDel,
  u_installapiList,
  u_zxtShippingAddress,
  u_zxtInvoicelnfo,
  u_addMessage,
  u_myCustomerService,
  u_submitOrderInsall,
  u_submitKeymailing,
  u_transferAdminUser,
  u_setMenuTree,
  u_getOrderDetial,
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
  u_buyRecord,
  u_getDeviceClass,
  u_cancalCustomerOrder,
  u_delCustomerOrder,
  u_customerOrderDetail
}