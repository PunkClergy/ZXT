const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  byPost
} = require('../../../utils/request/http')
const {
  u_dispatchWork,
} = require('../../../utils/request/dispatch')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    companyType: 1, //默认客户类型
    params: {},
    select_content_guestdata: {},
    select_content_bddata: {}
  },

  // 全屏背景
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
  // 切换客户类型
  handleBatterylift(evt) {
    const {
      item
    } = evt.currentTarget.dataset
    this.setData({
      companyType: item
    })
  },
  // 跳转选择列表
  handleSelectAddress() {
    const {
      companyType
    } = this.data
    const url = companyType == 1 ? '/pages/channel/guestList/index' : '/pages/channel/bdList/index'
    wx.navigateTo({
      url: `${url}?source=/pages/channel/placeAddWork/index`,
    })
  },
  // 获取缓存数据
  handleStorage() {
    const {
      companyType
    } = this.data;
    const cacheKey = companyType === 1 ? 'guestdata' : 'bddata';
    const info = wx.getStorageSync(cacheKey);
    const targetField = companyType == 1 ? 'select_content_guestdata' : 'select_content_bddata';
    this.setData({
      [targetField]: info,
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
  handleSubmit() {
    const {
      companyType,
      params,
      select_content_guestdata,
      select_content_bddata
    } = this.data
    const requestParam = {
      [u_dispatchWork.companyType]: companyType,
      [u_dispatchWork.companyId]: companyType == 1 ? select_content_guestdata.id : '',
      [u_dispatchWork.companyName]: companyType == 2 ? params.companyName : '',
      [u_dispatchWork.content]: params.content || '',
      [u_dispatchWork.bdId]: companyType == 2 ? select_content_bddata?.id : ''
    }
    byPost(getApp().data.k1swUrl + u_dispatchWork.URL, requestParam, (response) => {
      wx.removeStorage({
        key: 'guestdata',
        success() {}
      });
      wx.removeStorage({
        key: 'bddata',
        success() {

        }
      });
      wx.reLaunch({
        url: '/pages/channel/workSheet/index',
      })
    }, (error) => {
      showToast('获取信息失败，请重试');
    }, () => {
      hideLoading();
    });
  },
  onLoad(options) {

  },

  onReady() {

  },

  onShow() {
    this.initialiImageBaseConversion()
    this.handleStorage()
  },
})