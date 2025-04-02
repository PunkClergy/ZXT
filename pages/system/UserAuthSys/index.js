const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  u_childUserList,
  u_delChildUser
} = require('../../../utils/request/data_info')
const {
  byGet
} = require('../../../utils/request/http')

Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    params: {},
    items: [{}, {}]
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


  // 获取子账号列表
  initialiInfo() {
    const _this = this
    byGet(`${getApp().data.k1swUrl}${u_childUserList.URL}`, {}).then(allRes => {
      _this.setData({
        items: allRes.data.content
      })
    })
  },
  // 点击添加子账号
  handleShowSendKeyModal() {
    wx.navigateTo({
      url: '/pages/system/UserAuthSys/add',
    })
  },

  // 编辑
  handleEdit(evt) {
    const item = evt?.currentTarget?.dataset?.item;
    if (!item) {
      console.warn('未找到需要编辑的数据');
      return;
    }
    const params = {
      username: item.username,
      realname: item.realname,
      mobile: item.mobile,
      password: item.password,
      id: item.id,
    };
    wx.navigateTo({
      url: '/pages/system/UserAuthSys/add?params=' + JSON.stringify(params),
    })

  },
  // 删除
  handleDelete(evt) {
    const _this = this
    const id = evt?.currentTarget.dataset.id
    const params = {
      [u_delChildUser.id]: id
    }
    byGet(`${getApp().data.k1swUrl}${u_delChildUser.URL}`, params).then(allRes => {
      if (allRes?.data?.code == 1000) {
        _this.initialiInfo()
      }
    })
  },
  onLoad(options) {
    this.initialiInfo()
  },

  onReady() {
    this.initialiImageBaseConversion()
  },


  onShow() {
    this.initialiInfo()
  },


})