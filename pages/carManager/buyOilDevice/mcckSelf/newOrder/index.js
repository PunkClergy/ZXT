const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../../../utils/public').default
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../../../utils/Inspect/tips')
Page({
  data: {
    s_background_picture_of_the_front_page: '', //全图背景
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 70, // 搜索框高度，默认值
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_triggered: false, //下拉刷新状态
    c_add_car_show_momal: false, //添加车辆
    c_import_car_show_momal: false, //导入车辆
    g_car_items: []
  },
  handleRefresh() {
    this.setData({
      g_triggered: false,
    });
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
  handleMcckAdd() {
    this.setData({
      c_add_car_show_momal: true
    })
  },
  handleFormSubmit(evt) {
    const _this = this
    const formData = evt.detail.value;
    const items = _this?.data?.g_car_items
    const validations = [{
        field: formData.vehicleSerialName,
        message: '请输入车系'
      },
      {
        field: formData.personName,
        message: '请输入车型'
      },
      {
        field: formData.ccdate,
        message: '请输入年款'
      },
      {
        field: formData.vin,
        message: '请输入车架号'
      },
      {
        field: formData.batterylift,
        message: '请选择启动方式'
      },
    ];
    const validationError = validations.find(({
      field
    }) => !field);
    if (validationError) {
      showToast(validationError.message);
      return;
    }
    items?.push(formData)
    _this.setData({
      g_car_items: items
    }, () => {
      _this.setData({
        c_add_car_show_momal: false
      })
    })
    console.log(_this.data.g_car_items)








  },
  handleHideSengKeyModal() {
    this.setData({
      c_add_car_show_momal: false
    })
  },
  handleChooseFile() {
    this.setData({
      c_import_car_show_momal: true
    })
  },
  handleImport() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const tempFile = res.tempFiles[0];
        console.log(tempFile)
        this.setData({
          fileData: tempFile,
          fileName: tempFile.name
        });
      },
      fail: (err) => {
        console.error('选择文件失败', err);
      }
    });

  },
  handleHideImportModal() {
    this.setData({
      c_import_car_show_momal: false
    })
  },
  handleFormImportSubmit() {
    const _this = this
    const items = _this.data.g_car_items
    if (!this.data.fileData) {
      showToast('请先选择文件')
      return;
    }
    _this.setData({
      g_car_items: items.concat([{}, {}])
    }, () => {
      _this.setData({
        c_import_car_show_momal: false
      })
    })
    return
    const {
      path
    } = this.data.fileData;
    wx.uploadFile({
      url: 'https://example.com/upload',
      filePath: path,
      name: 'file',
      success: (res) => {
        const result = JSON.parse(res.data);
        console.log('服务器返回数据:', result);
      },
      fail: (err) => {
        showToast('上传失败');
      }
    });
  },
  onLoad(options) {

  },

  onReady() {
    this.initialiImageBaseConversion()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})