const fin3plusUrl = '';
const u_bannerlist = {
  URL: fin3plusUrl + 'api/bannerlist',
  terminalId: 'terminalId',
}
const u_midMenulist = {
  URL: fin3plusUrl + 'deskapi/midMenulist',
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
// 获取最新的token
const u_getUserinfo = {
  URL:'deskapi/getUserInfo',
}
module.exports = {
  u_getQrcodeImg,
  u_getUserinfo,
  u_logo,
  u_navlist,
  u_bannerlist,
  u_midMenulist,
  u_menulist,
  u_rightMenulist,
  u_termialList
}