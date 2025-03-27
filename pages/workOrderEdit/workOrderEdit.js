const urlUtil = require('../../utils/url-util.js');
const appUtil = require('../../utils/app-util')
Page({
  data: {
    c_card_collection: [{
      title: '车辆信息',
      id: 1,
      selected_icon: 'f11.png',
      unchecked_icon: 'f1.png'
    }, {
      title: '工单信息',
      id: 2,
      selected_icon: 'g11.png',
      unchecked_icon: 'g1.png'
    }, {
      title: '派单信息',
      id: 3,
      selected_icon: 'p11.png',
      unchecked_icon: 'p1.png'
    }, {
      title: '价格信息',
      id: 4,
      selected_icon: 'j11.png',
      unchecked_icon: 'j1.png'
    }], //卡片集合
    s_background_picture_of_the_front_page: '', //背景图
    s_vhcl_nfrmtn_ndx: 1, //车辆信息下Tab索引
    s_work_nfrmtn_ndx: 1, //工单信息下Tab索引
    s_crrntly_slctd_lbl: 1, //当前选中Card签
    g_vhcl_nfrmtn: '', //车辆信息
    g_wrk_rdr_nfrmtn: '', //工单信息
    g_slf_srvc_pck_p_nd_rtrn_nfrmtn: '', //自助取还信息
    g_gnrl_nfrmtn: '', // 通用信息
    g_srvc_nfrmtn: '', // 服务信息  
    g_dsptch_nfrmtn: '', // 派单信息

    tabs: ["工单信息", "任务信息"], // Tabs 标题
    currentIndex: 0, // 当前选中的 Tab 索引
    scrollTopId: '' // 当前滚动的目标元素 id
  },
  handleTabChange(e) {
    const { index } = e.currentTarget.dataset; // 获取点击的索引
    this.setData({ currentIndex: index }); // 更新当前索引
  },
  // 点击锚点跳转
  handleScrollTo(e) {
    const { target } = e.currentTarget.dataset; // 获取目标 id
    this.setData({ scrollTopId: target }); // 更新数据，触发滚动
    setTimeout(() => {
      this.setData({ scrollTopId: '' }); // 清空 id，避免影响后续操作
    }, 500); // 延迟清空，确保滚动完成
  },
  // 获取工单详情
  initialiInfo(eve) {
    console.log(eve)
    const _this = this
    const param = {
      [urlUtil.orderDetail.orderId]: eve
    };
    appUtil.byGet(getApp().data.k1swUrl + urlUtil.orderDetail.URL, param, function (res) {
      const response = res.data.content
      let vhclTemp = {
        platenumber: response.vehicle.platenumber, // 车牌号
        vehicleSerialName: response.vehicle.vehicleSerialName, // 汽车品牌
        vehicleModeName: response.vehicle.vehicleModeName, // 车型
        vin: response.vehicle.vin, // 车架号
        xsgw: response.vehicle.xsgw, // 邮箱容积
        sn: response.vehicle.sn, // 设备号
        createDate: response.vehicle.createDate // 注册时间
      }
      _this.setData({
        g_vhcl_nfrmtn: vhclTemp
      })
    })
  },
  // 获取服务信息的工单类型
  initialiServiceCollection: function (e) {
    const _this = this
    appUtil.byGet(getApp().data.k1swUrl + urlUtil.serviceList.URL, {}, function (res) {
      const response = res.data.content
      console.log(response)
    })
  },
  //  获取服务信息中每种工单类型下的数据字段
  initialiServiceFiled() {
    const _this = this
    appUtil.byGet(getApp().data.k1swUrl + urlUtil.getServiceFiled.URL, {}, function (res) {
      const response = res.data.content
      console.log(response)
    })
  },
  // 切换标签的事件处理函数
  handleSwitchTags(e) {
    const {
      index
    } = e.currentTarget.dataset;
    this.setData({
      s_crrntly_slctd_lbl: index
    });
  },
  handleSwitchBseVhcl(e) {
    const _this = this
    const index = e.target.dataset.index
    _this.setData({
      s_vhcl_nfrmtn_ndx: index
    })
  },
  handleSwitchWork(e) {
    const _this = this
    const index = e.target.dataset.index
    _this.setData({
      s_work_nfrmtn_ndx: index
    })
  },
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
      path: '/assets/images/index/bg.png',
      key: 's_background_picture_of_the_front_page'
    }];
    const promises = imageMap.map(item =>
      new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
          filePath: item.path,
          encoding: 'base64',
          success: (res) => {
            resolve({
              [item.key]: `data:image/png;base64,${res.data}`
            });
          }
        });
      })
    );

    Promise.all(promises)
      .then(results => {
        const dataToUpdate = results.reduce((acc, curr) => ({
          ...acc,
          ...curr
        }), {});
        _this.setData(dataToUpdate);
      });
  },
  onLoad(options) {
    const id = options?.id || 24
    this.initialiInfo(id)
  },

  onReady() {
    this.initialiImageBaseConversion()
  },

  onShow() {

  },
})