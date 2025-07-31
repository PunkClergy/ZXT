const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    sign: '',

    carBrands: [
      { name: "奥迪" },
      { name: "宝马" },
      { name: "保时捷" },
      { name: "奔驰" },
      { name: "本田" },
      { name: "大众" },
      { name: "丰田" },
      { name: "通用车型" }
    ],
    controlItems: [
      { name: "寻车", enabled: false },
      { name: "尾箱", enabled: false },
      { name: "启动", enabled: false },
      { name: "左中门", enabled: false },
      { name: "右中门", enabled: false },
      { name: "升窗", enabled: false },
      { name: "降窗", enabled: false },
      { name: "油路控制", enabled: false },
      { name: "布防控制", enabled: false }
    ],
  },

  onLoad: function (options) {
    const sign = options?.sign || ''
    this.setData({
      sign,
      headerTitle: this.getHeaderTitle(sign)
    })

  },
  onShow() {
    this.initialiImageBaseConversion()
  },
  // 标题计算逻辑
  getHeaderTitle(evt) {
    const titleMap = {
      1: '感应设置',
      3: '车型指令配置',
      4: '个性配置',
      5: '车辆转移',
      6: '编辑车辆',
      default: '设置'
    };
    return titleMap[evt] || titleMap.default;
  },
  // 全屏背景图
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
      path: '/assets/images/home/car-bg.png',
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
  // 切换开关状态
  handleToggleControl(e) {
    const index = e.currentTarget.dataset.index;
    const key = `controlItems[${index}].enabled`;
    this.setData({
      [key]: !this.data.controlItems[index].enabled
    });
    console.log(`${this.data.controlItems[index].name}状态:`, this.data.controlItems[index].enabled);
  },
  handleCarBrand(e) {
    const brand = e.currentTarget.dataset.brand;
    console.log("选择的品牌:", brand);
    // 这里可以添加导航逻辑
  },

})