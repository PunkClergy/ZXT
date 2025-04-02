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
module.exports = {
  u_getCitys,
  u_getProvinces,
  u_companyImprove,
  u_childUserList,
  u_addOrUpdateChildUser,
  u_companyInfo
}