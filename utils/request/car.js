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
const u_houseFlowList = {
  URL: fin3plusUrl + "unmannedStoreApi/unmannedStoreList",
  page: 'page'
}
const u_phouseFlowList = {
  URL: fin3plusUrl + "houseFlowApi/houseFlowList",
  page: 'page'
}
const u_unmannedStoreApidel = {
  URL: fin3plusUrl + "unmannedStoreApi/del",
  page: 'page'
}
const u_houseFlowApidel = {
  URL: fin3plusUrl + "houseFlowApi/del",
  page: 'page'
}
const u_userInsureList = {
  URL: fin3plusUrl + "insuranceApi/userInsureList",
  page: 'page'
}
const u_loseInsureList = {
  URL: fin3plusUrl + "insuranceApi/loseInsureList",
  page: 'page'
}
// 新增车辆
const u_addOrUpdateCar = {
  URL: fin3plusUrl + "carapi/addOrUpdateCar",
}
const u_houseFlowApirAdd = {
  URL: fin3plusUrl + "unmannedStoreApi/addOrUpdate",
}
const u_paddOrUpdate = {
  URL: fin3plusUrl + "houseFlowApi/addOrUpdate",
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
// 失联险保单列表
const u_loseClaimList = {
  URL: fin3plusUrl + "insuranceApi/loseClaimList",
  page: 'page'
}
const u_newShutdownClaim = {
  URL: fin3plusUrl + "insuranceApi/newShutdownClaim",
}
// 停运险理赔第二部
const u_improveShutdownClaimFile = {
  URL: fin3plusUrl + "insuranceApi/improveShutdownClaimFile",
}
// 失联险第二部
const u_improveLoseClaimFile = {
  URL: fin3plusUrl + "insuranceApi/improveLoseClaimFile",
}
const u_getBatchWycPrice = {
  URL: fin3plusUrl + "insuranceApi/getBatchWycPrice",
}
const u_getBatchLosePrice = {
  URL: fin3plusUrl + "insuranceApi/getBatchLosePrice",
}
// 停运险停保
const u_stopShutDowninsure = {
  URL: fin3plusUrl + "insuranceApi/stopShutDownInsure",
}
// 失联险停保
const u_stopLossContact = {
  URL: fin3plusUrl + "insuranceApi/stopLoseInsure",
}
// 停运险投保变更
const u_updateShutDownInsure = {
  URL: fin3plusUrl + "insuranceApi/updateShutDownInsure",
}
// 失联险投保变更
const u_updateLoseInsure = {
  URL: fin3plusUrl + "insuranceApi/updateLoseInsure",
}
const u_newLoseClaim = {
  URL: fin3plusUrl + "insuranceApi/newLoseClaim",
}
const u_vehBindCarManager = {
  URL: fin3plusUrl + "rentKeyApi/vehBindCarManager",
}
const u_carapiDeleteCar = {
  URL: fin3plusUrl + "carapi/deleteCar",
}
const u_sendInfo = {
  URL: fin3plusUrl + "renterApi/uploadControlRecord",
}
const u_uploadLog = {
  URL: fin3plusUrl + "loggerapi/uploadLog",
}
// 视频物料
const u_promotionalApi = {
  URL: fin3plusUrl + "promotionalApi/list",
  page: 'page'
}
const u_promotionalApiWxBooklist = {
  URL: fin3plusUrl + "promotionalApi/wxFilelist",
  page: 'page'
}


module.exports = {
  u_promotionalApiWxBooklist,
  u_promotionalApi,
  u_uploadLog,
  u_sendInfo,
  u_carapiDeleteCar,
  u_vehBindCarManager,
  u_improveLoseClaimFile,
  u_newLoseClaim,
  u_loseClaimList,
  u_updateLoseInsure,
  u_stopLossContact,
  u_updateShutDownInsure,
  u_stopShutDowninsure,
  u_getBatchLosePrice,
  u_getBatchWycPrice,
  u_improveShutdownClaimFile,
  u_newShutdownClaim,
  u_shutdownClaimList,
  u_houseFlowList,
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
  u_safekeyapiList,
  u_houseFlowApirAdd,
  u_unmannedStoreApidel,
  u_paddOrUpdate,
  u_phouseFlowList,
  u_houseFlowApidel
}