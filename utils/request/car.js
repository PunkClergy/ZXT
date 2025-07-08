const fin3plusUrl = '';
const u_carList = {
  // URL: fin3plusUrl + "dzBussinessMobileApi/getCarList",
  URL: fin3plusUrl + "carapi/getCarList",
  companyId: 'companyId',
  platenumber: 'platenumber',
  modelName: 'modelName',
  comParam: 'comParam',
  page: 'page'
}
const u_userInsureList = {
  URL: fin3plusUrl + "insuranceApi/userInsureList",
  page: 'page'
}
// 新增车辆
const u_addOrUpdateCar = {
  URL: fin3plusUrl + "carapi/addOrUpdateCar",
}
// 新增车辆钥匙
const u_safekeyapiaddOrUpdate = {
  URL: fin3plusUrl + "safekeyapi/addOrUpdate",
}
// 车务人员列表
const u_carManagerapi_list = {
  URL: fin3plusUrl + "carManagerapi/list",
  page: 'page',
  comParam: 'comParam'
}
// 新增车务人员
const u_carManagerapi_addOrUpdate = {
  URL: fin3plusUrl + "carManagerapi/addOrUpdate",
  page: 'page',
  comParam: 'comParam'
}
// 车务人员删除
const u_carManagerapi_del = {
  URL: fin3plusUrl + "/carManagerapi/del",
  id: 'id',
}
// 网约车列表
const u_wycRentVehicleList = {
  URL: fin3plusUrl + "/rentKeyApi/wycRentVehicleList",
  page: 'page'
}
const u_safekeyapiList = {
  URL: fin3plusUrl + "/safekeyapi/list",
  page: 'page'
}
const u_getPayPrice = {
  URL: fin3plusUrl + "insuranceApi/getPayPrice",
  page: 'page'
}
const u_newInsure = {
  URL: fin3plusUrl + "insuranceApi/newInsure",
}
// 批量
const u_batchNewWycInsure = {
  URL: fin3plusUrl + "insuranceApi/batchNewLoseInsure",
}
// 失联
const u_loseInsureList = {
  URL: fin3plusUrl + "insuranceApi/loseInsureList",
}
const u_newLoselnsure = {
  URL: fin3plusUrl + "insuranceApi/newLoseInsure",
}
// 批量
const u_batchNewLoseInsure = {
  URL: fin3plusUrl + "insuranceApi/batchNewWycInsure",
}
// 停运险理赔保单
const u_shutdownClaimList = {
  URL: fin3plusUrl + "insuranceApi/shutdownClaimList",
  page: 'page'
}
const u_newShutdownClaim = {
  URL: fin3plusUrl + "insuranceApi/newShutdownClaim",
}
// 停运险理赔第二部
const u_improveShutdownClaimFile = {
  URL: fin3plusUrl + "insuranceApi/improveShutdownClaimFile",
}
const u_getBatchWycPrice = {
  URL: fin3plusUrl + "insuranceApi/getBatchWycPrice",
}
const u_getBatchLosePrice={
  URL: fin3plusUrl + "insuranceApi/getBatchLosePrice",
}
module.exports = {
  u_getBatchLosePrice,
  u_getBatchWycPrice,
  u_improveShutdownClaimFile,
  u_newShutdownClaim,
  u_shutdownClaimList,
  u_batchNewWycInsure,
  u_batchNewLoseInsure,
  u_newLoselnsure,
  u_loseInsureList,
  u_userInsureList,
  u_newInsure,
  u_getPayPrice,
  u_safekeyapiaddOrUpdate,
  u_wycRentVehicleList,
  u_carManagerapi_del,
  u_carManagerapi_addOrUpdate,
  u_carManagerapi_list,
  u_carList,
  u_addOrUpdateCar,
  u_safekeyapiList
}