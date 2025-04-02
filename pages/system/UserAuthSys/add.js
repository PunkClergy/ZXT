const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  u_addOrUpdateChildUser,
} = require('../../../utils/request/data_info')
const {
  byPost
} = require('../../../utils/request/http')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    params: {},
    eye_show_hide: true,
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
  // 密码处小眼睛
  handleshowHide() {
    const eye = this.data.eye_show_hide
    this.setData({
      eye_show_hide: !eye
    })
  },


  //提交内容
  handleSubmit() {
    const {
      params
    } = this.data;
    const requiredFields = [{
        key: 'username',
        message: '请输入账号'
      },
      {
        key: 'realname',
        message: '请输入姓名'
      },
      {
        key: 'password',
        message: '请输入密码'
      },
      {
        key: 'mobile',
        message: '请输入手机号'
      },
    ];
    for (const {
        key,
        message
      } of requiredFields) {
      if (!params?.[key]) {
        showToast(message);
        return;
      }
    }
    showLoading();
    byPost(`${getApp().data.k1swUrl}${u_addOrUpdateChildUser.URL}`, {
      ...params
    }, (response) => {
      console.log(response?.data?.code)
      if (response?.data?.code != 1000) {
        showToast(response?.data?.msg);
        hideLoading();
        return
      }

      showToast('添加成功');
      // wx.reLaunch({
      //   url: '/pages/system/UserAuthSys/index',
      // })
      wx.navigateBack({
        delta: 1
      });
    }, (error) => {
      hideLoading();
      showToast('提交失败，请稍后重试');
    });
  },

  onLoad(options) {
    this.setData({
      params: JSON.parse(options?.params || {})
    })
  },

  onReady() {
    this.initialiImageBaseConversion()
  },


  onShow() {

  },


})