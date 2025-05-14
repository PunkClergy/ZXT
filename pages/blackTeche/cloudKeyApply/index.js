const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  byPost,
  byGet
} = require('../../../utils/request/http')
const {
  u_vehicleApplyApiApprove
} = require('../../../utils/request/order')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    params: {},
    vehie_items: {},
    allowuse: 1
  },
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
  // 获取当前年月日 时分
  handleCurrentDate() {
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    };

    const formatTime = (date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    };

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1); // 改为获取明天

    const currentDate = formatDate(now);
    const tomorrowDate = formatDate(tomorrow);
    const currentTime = formatTime(now);

    this.setData({
      startDate: currentDate, // 今天作为开始日期
      endDate: tomorrowDate, // 明天作为结束日期
      startTime: currentTime,
      endTime: currentTime
    });
  },
  // 内容输入回调
  handleBindinput(evt) {
    const {
      params
    } = this.data
    params[evt.currentTarget.dataset.item] = evt.detail.value
    this.setData({
      params: {
        ...params
      }
    })
  },
  // 跳转车辆列表选择车辆
  handleJumpCarList() {
    console.log(this.data)
    const {
      endDate,
      endTime,
      startDate,
      startTime,
      params
    } = this.data
    wx.setStorageSync('cloud_info', {
      endDate,
      endTime,
      startDate,
      startTime,
      params
    });
    wx.navigateTo({
      url: '/pages/carManager/carList/carList?source=' + '/pages/blackTeche/cloudKeyApply/index',
    })
  },
  // 切换选项
  handleToggleEnable(evt) {
    this.setData({
      allowuse: evt.detail.value
    })
  },

  // 提交参数
  handleSubmit() {
    const {
      params,
      vehie_items,
      startDate, // 今天作为开始日期
      endDate, // 明天作为结束日期
      startTime,
      endTime,
      allowuse
    } = this.data
    const temp = {
      platenumber: allowuse == 1 ? params?.platenumber : vehie_items.platenumber,
      usecarstartdate: startDate + ' ' + startTime,
      usecarenddate: endDate + ' ' + endTime,
      bak: params.bak
    }
    byPost(getApp().data.k1swUrl + u_vehicleApplyApiApprove.URL, temp, function (res) {
      if (res.data.code == 1000) {
        wx.removeStorageSync('cloud_info');
        wx.reLaunch({
          url: '/pages/blackTeche/cloudKey/index',
        })
      } else {
        showToast(res.data.msg)
      }
    });
  },
  // 选择日期
  bindTimeChange(evt) {
    const category = evt.currentTarget.dataset.index
    const value = evt.detail.value
    this.setData({
      [category]: value
    })
  },
  onLoad(options) {
    console.log(options.datails)
    if (options.datails) {
      this.setData({
        vehie_items: JSON.parse(options.datails),
        allowuse: 2
      })
    }
  },

  onReady() {
    this.initialiImageBaseConversion()
  },

  onShow() {
    const value = wx.getStorageSync('cloud_info');
    if (value) {
      this.setData({
        ...value
      })
    } else {
      this.handleCurrentDate()
    }
  },

})