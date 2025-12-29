const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default

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
    mp4_url: '',
    title: '',
    // 视频封面（可选）
    videoPoster: 'https://k1sw.wiselink.net.cn/img/book/8/3fdf8eda-7b81-41ca-9e47-0d4c4fc90beabanner-05.png',
    c_link: 'https://k1sw.wiselink.net.cn/'
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

  downloadVideo() {
    const { mp4_url } = this.data;
    if (!mp4_url) {
      this.setData({
        tipText: '视频地址为空，无法下载',
        tipType: 'error'
      });
      return;
    }

    this.setData({
      isDownloading: true,
      tipText: '正在下载视频...',
      tipType: 'info'
    });

    // 1. 下载视频到临时文件
    wx.downloadFile({
      url: mp4_url,
      success: (res) => {
        if (res.statusCode === 200) {
          // 2. 保存视频到相册（需要用户授权）
          wx.saveVideoToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              this.setData({
                isDownloading: false,
                tipText: '视频已成功下载到相册',
                tipType: 'success'
              });
            },
            fail: (err) => {
              this.handleDownloadError(err, '保存到相册失败');
            }
          });
        } else {
          this.handleDownloadError(res, '下载视频失败');
        }
      },
      fail: (err) => {
        this.handleDownloadError(err, '下载视频失败');
      }
    });
  },
  handleDownloadError(err, msg) {
    let errorMsg = msg;
    // 处理授权拒绝的情况
    if (err.errMsg.includes('auth deny') || err.errMsg.includes('authorize fail')) {
      errorMsg = '需要授权才能保存视频到相册，请在设置中开启权限';
    } else if (err.errMsg) {
      errorMsg += `：${err.errMsg}`;
    }

    this.setData({
      isDownloading: false,
      tipText: errorMsg,
      tipType: 'error'
    });
    console.error('下载错误：', err);
  },
  onLoad(options) {
    if (options.url) {
      this.setData({
        mp4_url: `${this.data.c_link}/img/${options.url}`,
        title: options.title
      })
    }
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

  onUnload() {
    // 页面卸载时暂停视频
    if (this.videoContext) {
      this.videoContext.pause();
    }
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