//const UPLOAD_IMAGE_URL = 'https://shijia.wiselink.net.cn/Tencent_web1/upload';
const HELP_URL = '://wechat.wiselink.net.cn/xinlingshouxcx2.html';
const fin3plusUrl = '';
const fin3plusImgUrl = "https://fin3.wiselink.net.cn/fin3img/";
// const fin3plusUrl = "http://localhost:8083/travelplatform/";
// const fin3plusImgUrl = "http://192.168.43.73:8082/fin3img/";

const k3aUrl = "";

// const k3aUrl = "https://k3a.wiselink.net.cn/";

const uploadImgUrl = "https://fin3.wiselink.net.cn/fin/h5Car/saveImg";

const TYPE = 5;
const IS_SEND = 1;
const DEFAULT_INVITATION_CODE = 'R4UU';

/**
 * 登录
 */
var userLogin = {
  LOGIN_API: k3aUrl + "api/login",
  USERNAME: 'username',
  PASSWORD: 'password',
  CODE: 'code',
  COMPANYID: 'companyId',
  TYPE: 'type'
}

/**
 * 修改密码
 */
var updatePassword = {
  URL: k3aUrl + "api/updatePassword",
  newPassword: 'newPassword',
  userId: 'userId'
}

var updateUserName = {
  URL: k3aUrl + "api/updateUserName",
  newUserName: 'newUserName',
  userId: 'userId'
}

/**
 * 获得待租列表
 */
var getRentReadyCarList = {
  URL: fin3plusUrl + "dzBussinessMobileApi/getRentReadyCarList",
  companyId: 'companyId',
  platenumber: 'platenumber',
  modelName: 'modelName',
  comParam: 'comParam',
  page: 'page'
}

/**
 * 获得车辆列表
 */
var getCarList = {
  URL: fin3plusUrl + "dzBussinessMobileApi/getCarList",
  companyId: 'companyId',
  platenumber: 'platenumber',
  modelName: 'modelName',
  comParam: 'comParam',
  page: 'page'
}
/**
 * 获得当前油量和定位
 */
var getOilAddress = {
  URL: fin3plusUrl + "dzBussinessMobileApi/getOilAddress",
  sn: 'sn'
}

var getEndOilAddress = {
  URL: fin3plusUrl + "dzBussinessMobileApi/getEndOilAddress",
  sn: 'sn',
  id: 'id',
  oilPrice: 'oilPrice',
}

/**
 * 开始租车
 */
var rentStart = {
  URL: fin3plusUrl + "dzBussinessMobileApi/rentStart",
  vehId: 'vehId',
  oil: 'oil',
  panelStartImg: 'panelStartImg',
}

/**
 * 还租
 */
var rentEnd = {
  URL: fin3plusUrl + "dzBussinessMobileApi/rentEnd",
  id: 'id',
  oil: 'oil',
  vehId: 'vehId',
  oilPrice: 'oilPrice',
  realcost: 'realcost',
  panelEndImg: 'panelEndImg',
}

/**
 * 获取在租列表和历史
 */
var getRentingAndHistory = {
  URL: fin3plusUrl + "dzBussinessMobileApi/getRentingAndHistory",
  companyId: 'companyId',
  comParam: 'comParam',
  status: 'status',
  page: 'page',
  vehId: 'vehId'
}

/**
 * 油量详情
 */
var oilDetailList = {
  URL: fin3plusUrl + "dzBussinessMobileApi/oilDetailList",
  rows: 'rows',
  page: 'page',
  lable_SN: 'lable_SN',
  CarStateOilStartTime: 'CarStateOilStartTime',
  CarStateOilEndTime: 'CarStateOilEndTime'
}


/**
 * 注册编辑车辆
 */
var regOrUpdateDevice = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/',
  vehicleSerialCode: 'vehicleSerialCode', //车系编码
  vehicleModeCode: 'vehicleModeCode', //车型编码
  faultType: 'faultType', //车系代码
  carModelCode: 'carModelCode', //车型代码
  platenumber: 'platenumber',
  vin: 'vin',
  vehicleModeName: 'vehicleModeName',
  vehicleSerialName: 'vehicleSerialName',
  sn: 'sn',
  code: 'code',
  managerId: 'managerId',
  isAppReg: 'isAppReg',
  companyid: 'companyid',
  id: 'id'
}


/**
 * 删除车辆
 */
var delVehicle = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/deleteVehicle',
  vehicleId: 'vehicleId',
}


var regOrUpdateCar = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/',
  platenumber: 'platenumber',
  vin: 'vin',
  vehicleModeName: 'vehicleModeName',
  vehicleSerialName: 'vehicleSerialName',
  isAppReg: 'isAppReg',
  companyid: 'companyid',
  xsgw: 'xsgw',
  id: 'id'
}

var batchAddCar = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/batchAddCar',
  companyid: 'companyid',
}

/**
 * 获取油价设置
 */
var getOilSet = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/getOilSet',
  companyId: 'companyId',
}

/**
 * 保存油价设置
 */
var saveOilSet = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/saveOilSet',
  companyId: 'companyId',
  oilSet: 'oilSet',
  fwSet: 'fwSet'
}


/**
 * 获得车务列表
 */
var carManagerList = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/carManagerList',
  companyId: 'companyId',
  page: 'page',
  realname: 'realname'
}
/**
 * 新增或修改车务
 */
var updateOrInsertCarManager = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/updateOrInsertCarManager',
  id: 'id',
  companyid: 'companyid',
  name: 'name',
  username: 'username',
  mobile: 'mobile'
}

/**
 * 重置车务登录密码
 */
var carManagerResetPassword = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/carManagerResetPassword',
  id: 'id',
}

/**
 * 删除车务
 */
var delCarManager = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/delCarManager',
  id: 'id',
}


var pay = {
  URL: k3aUrl + "api/pay",
  amount: 'amount',
  userId: 'userId',
}

var buyCount = {
  URL: k3aUrl + "api/buyCount",
  buyCount: 'buyCount',
  companyId: 'companyId',
}

var buyCountRecord = {
  URL: k3aUrl + "api/buyCountRecord",
  companyId: 'companyId',
  page: 'page',
}

var getCompanyInfo = {
  URL: k3aUrl + "api/getCompanyInfo",
  companyId: 'companyId',
}

/**
 * 获得车辆位置
 */
var getCarPoisiton = {
  URL: fin3plusUrl + 'carapi/getCarPoisiton',
  sn: 'sn'
}

/**
 * 车辆行驶轨迹
 */
var getTrackPlayback = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/getTrackPlayback',
  SN: 'sn',
  STARTDATE: 'startDate',
  ENDDATE: 'endDate'
}

/**
 * 获得车辆报警列表
 */
var getVehicleWarnList = {
  URL: fin3plusUrl + "dzBussinessMobileApi/getVehicleWarnList",
  companyId: 'companyId',
  platenumber: 'platenumber',
  modelName: 'modelName',
  comParam: 'comParam',
  sn: 'sn',
  page: 'page'
}

/**
 * 获得油量价格列表
 */
var getOilPriceList = {
  URL: fin3plusUrl + "dzBussinessMobileApi/getOilPriceList",
  companyId: 'companyId'
}

/**
 * 远程控车
 */
var operation = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/operation',
  operationType: 'operationType',
  sn: 'sn',
  code: 'code',
}

/**
 * 获得车辆状态
 */
var getCarStatus = {
  URL: fin3plusUrl + 'dzBussinessMobileApi/getCarStatus',
  sn: 'sn'
}


/**
 * 获得油量设备列表
 */
var getOilDeviceList = {
  URL: fin3plusUrl + "dzBussinessMobileApi/getOilDeviceList",
  companyId: 'companyId',
  sn: 'sn',
  page: 'page'
}

/**
 * 判断是否显示油量，并保存读取油量记录
 */
var isShowOil = {
  URL: fin3plusUrl + "dzBussinessMobileApi/isShowOil",
  companyId: 'companyId',
  oilDeviceIdc: 'oilDeviceIdc',
  vehId: 'vehId',
  oil: 'oil'
}

var hasShowOil = {
  URL: fin3plusUrl + "dzBussinessMobileApi/hasShowOil",
  companyId: 'companyId',
  oilDeviceIdc: 'oilDeviceIdc',
}

/**
 * 还车  判断是否显示油量，并保存读取油量记录
 */
var getBlueEndOil = {
  URL: fin3plusUrl + "dzBussinessMobileApi/getBlueEndOil",
  oilDeviceIdc: 'oilDeviceIdc',
  id: 'id',
  oilPrice: 'oilPrice',
  oil: 'oil',
}

/**
 * 获得设备使用记录
 */
var getOilDeviceUseRecord = {
  URL: fin3plusUrl + "dzBussinessMobileApi/getOilDeviceUseRecord",
  companyId: 'companyId',
  sn: 'sn',
  page: 'page'
}

var saveOilLog = {
  URL: fin3plusUrl + "dzBussinessMobileApi/saveOilLog",
  idc: 'idc',
  mobilemode: 'mobilemode',
  vehid: 'vehid',
  msg: 'msg',
}

var getJ23Price = {
  URL: k3aUrl + "api/getJ23Price",
  companyId: 'companyId',
  type: 'type'
}

var getProvinces = {
  URL: k3aUrl + "api/getProvinces",
}

var getCitys = {
  URL: k3aUrl + "api/getCitys",
  provinceId: 'provinceId',
}

/**
 * 添加更新单子
 */
var updateOrInsertOrder = {
  URL: k3aUrl + "api/updateOrInsertOrder",
  companyId: 'companyId',
  linkman: 'linkman',
  linkmobile: 'linkmobile',
  linkaddress: 'linkaddress',
  deviceCount: 'deviceCount',
  cost: 'cost',
}

var companyReg = {
  URL: k3aUrl + "api/companyReg",
  companyType: 'companyType',
  name: 'name',
  chargename: 'chargename',
  chargemobile: 'chargemobile',
  province: 'province',
  city: 'city',
  address: 'address',
}


/**
 * 添加更新单子
 */
var updateOrInsertOrder = {
  URL: k3aUrl + "api/updateOrInsertOrder",
  companyId: 'companyId',
  linkman: 'linkman',
  linkmobile: 'linkmobile',
  linkaddress: 'linkaddress',
  deviceCount: 'deviceCount',
  cost: 'cost',
}

/**
 * 购买记录
 */
var buyRecord = {
  URL: k3aUrl + "api/buyRecord",
  companyId: 'companyId',
  page: 'page'
}

var payRecord = {
  URL: k3aUrl + "api/payRecord",
  companyId: 'companyId',
  page: 'page'
}

var getFin3Company = {
  URL: k3aUrl + "api/getFin3Company",
  companyId: 'companyId'
}


/**
 * 获得openId
 */
var getOpenIdUrl = {
  URL: fin3plusUrl + "wx/getOpenId",
  CODE: 'code',
  APP: 'app'
}
/**
 * 发送验证码
 */
var SendValidateCodePar = {
  SEND_VALIDATE_API: fin3plusUrl + 'api/sendYzm',
  PHONE: 'mobile',
  TYPE: 'type',
  IS_SEND: 'isSend',
  INVITA_CODE: 'companyInvitationCode',
  OPEN_ID: 'openId'
}

var SendRegValidateCode = {
  SEND_VALIDATE_API: fin3plusUrl + 'carOwner/sendValidateCode',
  PHONE: 'phone'
}


var CarOwnerReg = {
  URL: fin3plusUrl + 'carOwner/reg',
  NAME: 'name',
  MOBILE: 'mobile',
  PASSWORD: 'password',
  YZCODE: 'yzcode'
}

var forgetPassword = {
  URL: fin3plusUrl + 'carOwner/forgetPassword',
  MOBILE: 'mobile',
  PASSWORD: 'password',
  YZCODE: 'yzcode'
}

// var updatePassword = {
//   URL: fin3plusUrl + 'carOwner/updatePassword',
//   USERNAME: 'username',
//   OLDPASSWORD: 'oldPassword',
//   NEWPASSWORD: 'newPassword'
// }

/**
 * 登录
 */
var LogoinPar = {
  LOGIN_API: fin3plusUrl + "api/findAccount",
  YZCODE: 'yzcode',
  MOBILE: 'mobile',
  OPEN_ID: 'openId',
  COMPANYID: 'companyId'
}



/**
 * 请求车辆位置
 */
var RequestCarList = {
  REQUEST_API: fin3plusUrl + 'renterApi/getCarPoisitonByCode',
  MANAGERID: 'managerId',
  CODE: 'code',
  OPENID: 'openId',
}

var RequestCarList2 = {
  REQUEST_API: k3aUrl + 'carapi/getAllCarPoisiton',
}

var ControlCar = {
  CONTROL_CAR_URL: fin3plusUrl + 'h5Car/operation',
  OPERATIONYPE: 'operationType',
  CODE: 'code',
}

/**
 * 上传图片
 */
var UploadImageUrl = {
  UPLOAD_API: fin3plusUrl + "h5Car/saveImg",
  CODE: 'code',
}
/**
 * 上传身份证
 */
var UploadUserCardImageUrl = {
  UPLOAD_API: fin3plusUrl + "wx/saveImg",
  ID: 'id',
}

/**
 * 分享二维码
 */
var shareCodeUrl = {
  URL: fin3plusUrl + "wx/shareCode2",
  CONTROLCODE: 'controlCode',
  USERID: 'userId',
  SN: 'sn',
  STARTDATE: 'startDate',
  ENDDATE: 'endDate'
}

/**
 * 用户下单
 */
var createOrderUrl = {
  URL: fin3plusUrl + "wx/createOrder",
  CONTROLCODE: 'controlCode',
  USERID: 'userId',
  DEPOSIT: 'deposit'
}

/**
 * 查询用户正在进行的订单
 */
var findUserProgressOrder = {
  URL: fin3plusUrl + "wx/findUserProgressOrder",
  USERID: 'userId'
}

/**
 * 查询用户订单列表
 */
var findUserOrderList = {
  URL: fin3plusUrl + "wx/findUserOrderList",
  USERID: 'userId'
}

var findManagerOrderList = {
  URL: fin3plusUrl + "h5CarManager/workList",
  MANAGERID: 'managerId',
  PAGE: 'page'
}

/**
 * 用户转租的订单
 */
var findUserShareOrderList = {
  URL: fin3plusUrl + "wx/findUserShareOrderList",
  USERID: 'userId'
}

/**
 * 订单支付
 */
var orderPay = {
  URL: fin3plusUrl + "wx/orderPay",
  ORDERID: 'orderId'
}

/**
 * 验证链接是否有效
 */
var isControlCodeExpire = {
  URL: fin3plusUrl + "wx/isControlCodeExpire",
  CONTROLCODE: 'controlCode',
}

/**
 * 还车
 */
var returnVehicle = {
  URL: fin3plusUrl + "wx/returnVehicle",
  ORDERID: 'orderId',
  CONTROLCODE: 'controlCode',
}

/**
 * 预支付押金
 */
var prePayDeposit = {
  URL: fin3plusUrl + "consumption/activeAccount",
  CUSTOMERID: 'customerId',
  COMPANYID: 'companyId',
  CONTROLCODE: 'controlCode',
  PAYMENTTYPE: 'paymentType'
}


/**
 * 获取用户信息
 */
var getUser = {
  URL: fin3plusUrl + 'wx/getUser',
  USERID: 'userId'
}

/**
 * 获得车管和员工信息
 */
var getManager = {
  URL: fin3plusUrl + 'h5CarManager/getCarManagerInfo',
  MANAGERID: 'managerId'
}

/**
 * 完成任务
 */
var finishWork = {
  URL: fin3plusUrl + 'h5CarManager/finishWork',
  CONTROLCODE: 'controlCode'
}

/**
 * 员工使用车辆
 */
var useCar = {
  URL: fin3plusUrl + 'h5CarManager/useCar',
  SN: 'sn',
  EMPLOYEEID: 'employeeId',
}

/**
 * 租车协议地址
 */
var agreement = {
  URL: fin3plusUrl + 'agreement.html',
}

/**
 * 证件提交
 */
var UploaderPhotoPar = {
  UPLOADER_PHOTO_API: uploadImgUrl,
  code: 'code',
  img1Arr: 'img1Arr',
}

/**
 * 获取控制密码
 */
var RequestControlPwd = {
  REQUEST_CONTROL_PWD_UR: fin3plusUrl + 'vehicle/getBluetoothPassword',
  SN: 'sn',
}


/**
 * 获得任务
 */
var getWork = {
  URL: fin3plusUrl + 'h5CarManager/getWork',
  CONTROLCODE: 'controlCode'
}

/**
 * 获得员工正在使用的车辆
 */
var getUserUseingCar = {
  URL: fin3plusUrl + 'h5CarManager/getUserUseingCar',
  EMPLOYEEID: 'employeeId'
}

/**
 * 员工还车
 */
var returnCar = {
  URL: fin3plusUrl + 'renterApi/returnCar',
  CONTROLCODE: 'code'
}

/**
 * 员工还车
 */
var useCarList = {
  URL: fin3plusUrl + 'h5CarManager/useCarList',
  EMPLOYEEID: 'employeeId',
  PAGE: 'page'
}

var getProductNo = {
  URL: fin3plusUrl + 'vehicleList/getProductBySnAndCode',
  SN: 'sn',
  CODE: 'code'
}
/**
 * 获得车系
 */
var getCarSerial = {
  URL: fin3plusUrl + 'vehicleList/getVehicleSerialsByProductNo',
  PRODUCTNO: 'productNo'
}

var getVehicleModelsBySerialId = {
  URL: fin3plusUrl + 'vehicleList/getVehicleModelsBySerialId',
  vehicleSerialId: 'vehicleSerialId',
  productNo: 'productNo'
}



var myCarList = {
  URL: fin3plusUrl + 'carOwner/myCars',
  EMPLOYEEID: 'employeeId',
}


var setMainCar = {
  URL: fin3plusUrl + 'carOwner/setMainCar',
  managerId: 'managerId',
  mappingId: 'mappingId'
}

/**
 * 我分享的车辆
 */
var myShareCarList = {
  URL: fin3plusUrl + 'carOwner/myShareCarList',
  MANAGERID: 'managerId',
  PAGE: 'page'
}

var receiveShareCarList = {
  URL: fin3plusUrl + 'carOwner/receiveShareCarList',
  MANAGERID: 'managerId',
  PAGE: 'page'
}

var cancelShareCar = {
  URL: fin3plusUrl + 'carOwner/cancelShareCar',
  controlCode: 'controlCode'
}

var getShareCodeBySn = {
  URL: fin3plusUrl + 'carOwner/getShareCodeBySn',
  shareUserId: 'shareUserId',
  sn: 'sn'
}
var menulist = {
  URL: k3aUrl + 'deskapi/menulist',
  menuId: '56',
}
var bannerlist = {
  URL: k3aUrl + 'api/bannerlist',
  menuId: '56',
}
var getServiceFiled = {
  URL: k3aUrl + 'cwapi/getServiceFiled',
}
var serviceList = {
  URL: k3aUrl + 'cwapi/serviceList',
}
var orderSubmit = {
  URL: k3aUrl + 'cwapi/orderSubmit',
}
var orderList = {
  URL: k3aUrl + 'cwapi/orderList',
  days: 'day',
  orderTypes: 'orderTypes',
  status: 'status',
  page: 'page'
}
var orderDetail = {
  URL: k3aUrl + 'cwapi/orderDetail',
  orderId: 'orderId',
}
var carHotspotList = {
  URL: k3aUrl + 'hotpotapi/carHotspotList',
}
var rentedCarParklotList = {
  URL: k3aUrl + 'hotpotapi/rentedCarParklotList',
}
var carParkingList = {
  URL: k3aUrl + 'cpapi/carParkingList',
}
var selfservicePlatformLis = {
  URL: k3aUrl + 'sspapi/selfservicePlatformList',
  page: 'page'
}
var midMenulist = {
  URL: k3aUrl + 'deskapi/midMenulist',
}

var rentVehicleList = {
  URL: k3aUrl + "rentKeyApi/rentVehicleList",
  companyId: 'companyId',
  platenumber: 'platenumber',
  modelName: 'modelName',
  comParam: 'comParam',
  page: 'page'
}
var sendRentKey = {
  URL: k3aUrl + "rentKeyApi/sendRentKey",
}
var cancelRentKey = {
  URL: k3aUrl + "rentKeyApi/cancelRentKey",
}

var slfAdd = {
  URL: fin3plusUrl + 'deviceBuyApi/j22FileUpload',
  companyid: 'companyid',
}
var rentRecord = {
  URL: fin3plusUrl + 'rentKeyApi/rentRecord',
  vehId: 'vehId',
  page: 'page'
}
var getShutdownClaim = {
  URL: fin3plusUrl + "insuranceApi/getShutdownClaim",
  claimGuid: 'claimGuid',
}
// 获取失联险理赔数据
var getLoseClaim = {
  URL: fin3plusUrl + "insuranceApi/getLoseClaim",
  claimGuid: 'claimGuid',
}
var improveShutdownClaimFile = {
  URL: fin3plusUrl + 'insuranceApi/improveShutdownClaimFile',
}
var improveLoseClaimFile = {
  URL: fin3plusUrl + 'insuranceApi/improveLoseClaimFile',
}
module.exports = {
  improveLoseClaimFile,
  getLoseClaim,
  improveShutdownClaimFile,
  getShutdownClaim,
  rentRecord: rentRecord,
  slfAdd: slfAdd,
  cancelRentKey: cancelRentKey,
  sendRentKey: sendRentKey,
  rentVehicleList: rentVehicleList,
  midMenulist: midMenulist,
  selfservicePlatformLis: selfservicePlatformLis,
  carParkingList: carParkingList, //
  carHotspotList: carHotspotList, //
  rentedCarParklotList: rentedCarParklotList,
  orderDetail: orderDetail,
  orderList: orderList,
  orderSubmit: orderSubmit,
  serviceList: serviceList,
  getServiceFiled: getServiceFiled,
  bannerlist: bannerlist,
  menulist: menulist,
  UserLogin: userLogin,
  getRentReadyCarList: getRentReadyCarList,
  getOilAddress: getOilAddress,
  rentStart: rentStart,
  rentEnd: rentEnd,
  getRentingAndHistory: getRentingAndHistory,
  oilDetailList: oilDetailList,
  updatePassword: updatePassword,
  updateUserName: updateUserName,
  getOilSet: getOilSet,
  saveOilSet: saveOilSet,
  getCarList: getCarList,
  getCarPoisiton: getCarPoisiton,
  getTrackPlayback: getTrackPlayback,
  getVehicleWarnList: getVehicleWarnList,
  getOilPriceList: getOilPriceList,
  getEndOilAddress: getEndOilAddress,
  operation: operation,
  getCarStatus: getCarStatus,
  regOrUpdateCar: regOrUpdateCar,
  batchAddCar: batchAddCar,
  getOilDeviceList: getOilDeviceList,
  isShowOil: isShowOil,
  getOilDeviceUseRecord: getOilDeviceUseRecord,
  updateOrInsertOrder: updateOrInsertOrder,
  buyRecord: buyRecord,
  hasShowOil: hasShowOil,
  getBlueEndOil: getBlueEndOil,
  getFin3Company: getFin3Company,
  saveOilLog: saveOilLog,
  carManagerList: carManagerList,
  carManagerResetPassword: carManagerResetPassword,
  updateOrInsertCarManager: updateOrInsertCarManager,
  delCarManager: delCarManager,
  pay: pay,
  getCompanyInfo: getCompanyInfo,
  payRecord: payRecord,
  buyCount: buyCount,
  buyCountRecord: buyCountRecord,
  getJ23Price: getJ23Price,
  getProvinces: getProvinces,
  getCitys: getCitys,
  companyReg: companyReg,




  SendValidateCodePar: SendValidateCodePar,
  LogoinPar: LogoinPar,
  TYPE: TYPE,
  IS_SEND: IS_SEND,
  DEFAULT_INVITATION_CODE: DEFAULT_INVITATION_CODE,
  RequestCarList: RequestCarList,
  RequestCarList2: RequestCarList2,
  //UploadImageUrl: UploadImageUrl,
  getUser: getUser,
  getManager: getManager,
  UploaderPhotoPar: UploaderPhotoPar,
  RequestControlPwd: RequestControlPwd,
  ControlCar: ControlCar,
  HELP_URL: HELP_URL,
  UploadUserCardImageUrl: UploadUserCardImageUrl,
  shareCodeUrl: shareCodeUrl,
  getOpenIdUrl: getOpenIdUrl,
  createOrderUrl: createOrderUrl,
  fin3plusUrl: fin3plusUrl,
  fin3plusImgUrl: fin3plusImgUrl,
  findUserProgressOrder: findUserProgressOrder,
  findUserOrderList: findUserOrderList,
  findManagerOrderList: findManagerOrderList,
  findUserShareOrderList: findUserShareOrderList,
  orderPay: orderPay,
  returnVehicle: returnVehicle,
  prePayDeposit: prePayDeposit,
  agreement: agreement,
  isControlCodeExpire: isControlCodeExpire,
  finishWork: finishWork,
  getWork: getWork,
  useCar: useCar,
  getUserUseingCar: getUserUseingCar,
  returnCar: returnCar,
  useCarList: useCarList,
  SendRegValidateCode: SendRegValidateCode,
  CarOwnerReg: CarOwnerReg,
  getCarSerial: getCarSerial,
  getVehicleModelsBySerialId: getVehicleModelsBySerialId,
  getProductNo: getProductNo,
  regOrUpdateDevice: regOrUpdateDevice,
  myCarList: myCarList,
  delVehicle: delVehicle,
  myShareCarList: myShareCarList,
  cancelShareCar: cancelShareCar,
  getShareCodeBySn: getShareCodeBySn,
  forgetPassword: forgetPassword,
  // updatePassword:updatePassword,
  setMainCar: setMainCar,
  receiveShareCarList: receiveShareCarList

}