const orderDataCollection = [{
    name: '工单编号',
    value: 'orderno'
  }, {
    name: '工单下单时间',
    value: 'createdate'
  },
  {
    name: '创建人',
    value: 'createusername'
  },
  {
    name: '创建人联系方式',
    value: 'createusermobile'
  }
]
const orderHeadDataSet = [{
  name: '工单类型',
  img: '/assets/images/home/orderTypeIcon.png',
  value: 'ordertypename'
}]
const orderStateCollection = [{
    name: '待接单',
    value: 0,
    color: 'red'
  },
  {
    name: '待确认',
    value: 1,
    color: ''
  },
  {
    name: '已接单',
    value: 2,
    color: ''
  },
  {
    name: '进行中',
    value: 3,
    color: ''
  },
  {
    name: '待验收',
    value: 4,
    color: ''
  },
  {
    name: '已完结',
    value: 5,
    color: ''
  },
  {
    name: '已取消',
    value: 6,
    color: ''
  },
]
const vehicleDataCollection = [{
    name: '车架号',
    value: 'vin'
  }, {
    name: '油箱容积',
    value: 'xsgw'
  },
  {
    name: '车辆类型',
    value: ''
  },
  {
    name: '设备平台',
    value: ''
  },
  {
    name: '设备号',
    value: 'sn'
  }
]
const vehicleDataCollectionAdditional = [{
    name: '平台名称',
    value: 'platename'
  }, {
    name: '发送方式',
    value: 'sendmethod'
  },
  {
    name: 'APP/链接',
    value: 'applinkname'
  },
  {
    name: '账号',
    value: 'username'
  },
  {
    name: '密码',
    value: 'password'
  }
]
const vehicleHeadDataSet = [{
    name: '车辆信息',
    img: '/assets/images/home/orderTypeIcon.png',
    value: false
  },
  {
    name: '车牌号',
    img: '/assets/images/home/car.png',
    value: 'platenumber'
  },
  {
    name: '车辆信息',
    img: '/assets/images/rent/car@2x.png',
    multiLevel: 'vehicle',
    value1: 'vehicleModeName',
    value2: 'vehicleSerialName'
  },
]
const sendSingleOptions = [{
  id: 1,
  name: '内部车务'
}, {
  id: 2,
  name: '车务宝服务'
}]
module.exports = {
  orderDataCollection,
  orderHeadDataSet,
  orderStateCollection,
  vehicleDataCollection,
  vehicleDataCollectionAdditional,
  vehicleHeadDataSet,
  sendSingleOptions
}