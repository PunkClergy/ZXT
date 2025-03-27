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
module.exports = {
  u_carList,
  u_addOrUpdateCar
}