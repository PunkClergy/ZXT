const fin3plusUrl = '';
const u_bannerlist = {
  URL: fin3plusUrl + 'deskapi/bannerlist',
  terminalId: 'terminalId',
}
const u_midMenulist = {
  URL: fin3plusUrl + 'deskapi/midMenulist',
}
const u_industryList ={
  URL: fin3plusUrl + 'promotionalApi/industryList',
}
const u_menulist = {
  URL: fin3plusUrl + 'deskapi/menulist',
  menuId: 'menuId',
  isDir:'isDir'
}
const u_rightMenulist ={
  URL:'deskapi/rightMenulist',
  menuId:'menuId',
  terminalId:'terminalId',
  isDir:'isDir'
}
const u_navlist = {
  URL:'deskapi/navlist',
}
const u_termialList = {
  URL:'deskapi/termialList',
}
// 获取Logo
const u_logo = {
  URL:'deskapi/logo',
}
// 获取群二维码
const u_getQrcodeImg = {
  URL:'deskapi/getQrcodeImg',
}
// 获取未选择的专区
const u_getNotHaveMidMenulist = {
  URL:'deskapi/getNotHaveMidMenulist',
}
// 获取最新的token
const u_getUserinfo = {
  URL:'deskapi/getUserInfo',
}
// 修改用户名
const u_updateUserName = {
  URL: "accountapi/setUsernameAndPassword",
  newUserName: 'newUserName',
  newPassword:'newPassword',
  userId: 'userId'
}
// 密码
const u_updatePassword = {
  URL:"api/updatePassword",
  newPassword: 'newPassword',
  userId: 'userId'
}
const u_setBtype ={
  URL:"accountapi/setBtype",
}
const u_applyMenus ={
  URL:"accountapi/applyMenus",
}
module.exports = {
  u_applyMenus,
  u_setBtype,
  u_updatePassword,
  u_updateUserName,
  u_getQrcodeImg,
  u_getUserinfo,
  u_logo,
  u_navlist,
  u_bannerlist,
  u_midMenulist,
  u_industryList,
  u_menulist,
  u_rightMenulist,
  u_termialList,
  u_getNotHaveMidMenulist
}