const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
Page({
  data: {

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
  onLoad: function () {

  },

  onShow() {
    this.initialiImageBaseConversion()
  },
  // 导航到各个设置页面 
  navigateToUserInfo(evt) {
    const sign = evt.currentTarget.dataset.sign;
    const actionMap = {
      2: {
        title: '工程模式',
        placeholderText: '请输入操作密码',
        callback: (content) => console.log('工程模式密码:', content),
        fallback: () => console.log('用户取消输入操作密码')
      },
      7: {
        title: '删除车辆',
        placeholderText: '请输入登录密码',
        callback: (content) => console.log('删除车辆密码:', content),
        fallback: () => console.log('用户取消输入登录密码')
      },
      default: {
        url: `/pages/listOfPrivateCars/setting/index?sign=${sign}`
      }
    };
    const action = actionMap[sign] || actionMap.default;
    if (action.url) {
      wx.navigateTo(action);
    } else {
      wx.showModal({
        title: action.title,
        editable: true,
        placeholderText: action.placeholderText,
        success(res) {
          res.confirm ? action.callback(res.content) : action.fallback();
        }
      });
    }
  }
















})