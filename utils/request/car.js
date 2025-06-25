const fin3plusUrl = '';
const u_carList = {
  // URL: fin3plusUrl + "dzBussinessMobileApi/getCarList",
  URL:fin3plusUrl + "carapi/getCarList",
  companyId: 'companyId',
  platenumber: 'platenumber',
  modelName: 'modelName',
  comParam: 'comParam',
  page: 'page'
}
// 新增车辆
const u_addOrUpdateCar = {
  URL: fin3plusUrl + "carapi/addOrUpdateCar",
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

module.exports = {
  u_wycRentVehicleList,
  u_carManagerapi_del,
  u_carManagerapi_addOrUpdate,
  u_carManagerapi_list,
  u_carList,
  u_addOrUpdateCar
}