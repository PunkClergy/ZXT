const fin3plusUrl = '';
// 派工消息总列表
const u_nodeDetailGroupList = {
  URL: fin3plusUrl + "addressapi/nodeDetailGroupList",
  comParam: 'comParam',
  page: 'page'
}
// 客户列表
const u_companyList = {
  URL: fin3plusUrl + "addressapi/companyList",
  name: 'name',
  page: 'page'
}
// BD列表
const u_bDList = {
  URL: fin3plusUrl + "addressapi/bDList",
  name: 'name',
  page: 'page'
}
// 派工
const u_dispatchWork = {
  URL: fin3plusUrl + "addressapi/dispatchWork",
  companyType: 'companyType',
  companyId: 'companyId',
  companyName: 'companyName',
  content: 'content',
  bdId: 'bdId',
}
// 派工信息
const u_nodeDetailList = {
  URL: fin3plusUrl + "addressapi/nodeDetailList",
  read: 'read',
  companyId: 'companyId',
}
// 发送消息
const u_nodeSubmit = {
  URL: fin3plusUrl + "addressapi/nodeSubmit",
  read: 'read',
  companyId: 'companyId',
}
// 我的二维码
const u_qrcode = {
  URL: fin3plusUrl + "companyapi/qrcode",
}
// 扫码客户清单
const u_myCompanyList = {
  URL: fin3plusUrl + "companyapi/myCompanyList",
  name: 'name',
  page: 'page'
}
// 手工及扫码新建客户报备
const u_customerList = {
  URL: fin3plusUrl + "notifyCustomerApi/myCustomerList",
  customerName: 'customerName',
  page: 'page'
}
// 渠道月度考核目标
const u_qdTaskRecord = {
  URL: fin3plusUrl + "/deviceBuyApi/qdTaskRecord",
  page: 'page'
}

// 受让客户
const u_transferCustomerList = {
  URL: fin3plusUrl + "notifyCustomerApi/transferCustomerList",
  customerName: 'customerName',
  page: 'page'
}

const u_noticeList = {
  URL: fin3plusUrl + "promotionalApi/noticeList",
  title: 'title',
  page: 'page'
}
// 删除客户报备
const u_delCustomer = {
  URL: fin3plusUrl + "notifyCustomerApi/delCustomer",
}
// 新增扫码客户
const u_addOrUpateMyCompany = {
  URL: fin3plusUrl + "companyapi/addOrUpateMyCompany",
}
// 手工新建客户
const u_addOrUpdateCustomer = {
  URL: fin3plusUrl + "notifyCustomerApi/addOrUpdateCustomer",
}
// 重置密码
const u_resetMyCompanyPassword = {
  URL: fin3plusUrl + "companyapi/resetMyCompanyPassword",
  userId: 'userId'
}
// 确认客户资料
const u_comfirmMyCompany = {
  URL: fin3plusUrl + "companyapi/comfirmMyCompany",
  companyId: 'companyId'
}
// 生成个人二维码
const u_getInviteCodeImg = {
  URL: fin3plusUrl + "userapi/getInviteCodeImg",
}
const u_getSharelinkTitleImg = {
  URL: fin3plusUrl + "shareApi/getSharelinkTitleImg",
}

module.exports = {
  u_qdTaskRecord,
  u_transferCustomerList,
  u_noticeList,
  u_delCustomer,
  u_addOrUpdateCustomer,
  u_customerList,
  u_getSharelinkTitleImg,
  u_getInviteCodeImg,
  u_comfirmMyCompany,
  u_resetMyCompanyPassword,
  u_addOrUpateMyCompany,
  u_myCompanyList,
  u_qrcode,
  u_nodeSubmit,
  u_nodeDetailList,
  u_dispatchWork,
  u_bDList,
  u_companyList,
  u_nodeDetailGroupList,
}