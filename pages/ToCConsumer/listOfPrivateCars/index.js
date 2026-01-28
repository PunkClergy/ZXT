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
    deviceIDC: "",  // 默认设备ID
    orgKey: [0x33, 0x69, 0x45, 0x22, 0x83, 0x78],  // 原始密钥
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
  onLoad: function (options) {
    this.setData({
      deviceIDC: `${options?.sn}`,
      orgKey: options?.bluetoothKey
    }, () => {
      if (options?.flag == 1) {
        this.navigateToUserInfo(1)
      }
    })

  },
  onShow() {
    this.initialiImageBaseConversion()
  },
  handleTransformation(number) {
    const numStr = number.toString();
    // 分割成每两个字符一组
    const bytes = [];
    for (let i = 0; i < numStr.length; i += 2) {
      const byteStr = numStr.substring(i, i + 2);
      bytes.push(parseInt(byteStr, 16)); // 按16进制解析
    }
    return bytes
  },
  // 导航到各个设置页面 
  navigateToUserInfo(evt) {
    const sign = evt?.currentTarget?.dataset?.sign || evt;
    const actionMap = {
      2: {
        title: '工程模式',
        placeholderText: '请输入操作密码',
        callback: (content) => {
          if (content == '666888') {
            wx.navigateTo({
              url: '/pages/ToCConsumer/listOfPrivateCars/engineering/index',
            })
          } else {
            wx.showToast({
              title: '密码错误',
              icon: 'none'
            })
          }
        },
        fallback: () => console.log('用户取消输入操作密码')
      },
      default: {
        url: `/pages/ToCConsumer/listOfPrivateCars/setting/index?sign=${sign}&deviceIDC=${this.data.deviceIDC}&orgKey=${this.data.orgKey}`
      }
    };
    const action = actionMap[sign] || actionMap.default;
    if (action.url) {
      if (sign == 1) {
        wx.showModal({
          title: '提示',
          content: '如未与设备配对,请先执行蓝牙配对操作',
          complete: (res) => {
            if (res.confirm) {
              wx.navigateTo(action);
            }
          }
        })
      } else {
        wx.navigateTo(action);
      }


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