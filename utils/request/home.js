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
module.exports = {
  u_navlist,
  u_bannerlist,
  u_midMenulist,
  u_menulist,
  u_rightMenulist,
  u_termialList
}