const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  u_inquirySheet
} = require('../../utils/request/data_info')
const {
  byGet
} = require('../../utils/request/http')
const {
  FIELD_CONFIG
} = require('../../utils/Inspect/filterColl').default
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    currentIndex: 0,
    scrollLeft: 0,
    scrollTop:0,
    tabs: [],
    ladder: false
  },

  // 切换tab
  handleSwitchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentIndex: index,
      scrollLeft: (index - 2) * 120,
      scrollTop:0,
      ladder: false
    });
  },
  // 阶梯价格显示和隐藏
  handleTabLadder() {
    const ladder = this.data.ladder
    this.setData({
      ladder: !ladder
    })
  },
  // 全图背景
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
  // 获取询价单
  handleuInquirySheet() {
    // 空值处理函数
    const formatValue = (value) => {
      if (value === null || value === undefined) return '-';
      if (typeof value === 'string' && value.trim() === '') return '-';
      return value;
    };

    byGet(getApp().data.k1swUrl + u_inquirySheet.URL, {}).then(response => {
      const {
        content: responseData
      } = response.data;
      console.log(FIELD_CONFIG)
      const formattedTabs = responseData.map(item => ({
        title: item.devicetypeName || '未知设备类型',
        list: FIELD_CONFIG.map(({
          key,
          label
        }) => ({
          key,
          label,
          value: formatValue(item[key])
        }))
      }));

      this.setData({
        tabs: formattedTabs,
        aggregate: responseData
      });
    });
  },
  onLoad(options) {},


  onReady() {

  },

  onShow() {
    this.initialiImageBaseConversion()
    this.handleuInquirySheet()
  },


  onHide() {

  },
})