Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 视频地址（请替换为你自己的有效视频链接，需配置小程序downloadFile白名单）
    videoUrl: 'https://example.com/test-video.mp4',
    // 视频封面（可选）
    videoPoster: 'https://k1sw.wiselink.net.cn/img/book/8/3fdf8eda-7b81-41ca-9e47-0d4c4fc90beabanner-05.png',
    // 播放状态
    isPlaying: false,
    // 下载状态
    isDownloading: false,
    // 提示信息
    tipText: '',
    tipType: 'info'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取视频上下文
    this.videoContext = wx.createVideoContext('video-player', this);
    this.setData({
      tipText: '请点击按钮操作视频',
      videoUrl:''
    });
  },

  /**
   * 切换播放/暂停
   */
  togglePlay() {
    if (this.data.isPlaying) {
      this.videoContext.pause();
    } else {
      this.videoContext.play();
    }
  },

  /**
   * 视频开始播放回调
   */
  onVideoPlay() {
    this.setData({
      isPlaying: true,
      tipText: '视频正在播放'
    });
  },

  /**
   * 视频暂停播放回调
   */
  onVideoPause() {
    this.setData({
      isPlaying: false,
      tipText: '视频已暂停'
    });
  },

  /**
   * 视频播放错误回调
   */
  videoError(e) {
    this.setData({
      tipText: `播放失败：${e.detail.errMsg}`,
      tipType: 'error'
    });
    console.error('视频播放错误：', e);
  },

  /**
   * 下载视频到本地相册
   */
  downloadVideo() {
    const { videoUrl } = this.data;
    if (!videoUrl) {
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
      url: videoUrl,
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

  /**
   * 处理下载错误
   */
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

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载时暂停视频
    if (this.videoContext) {
      this.videoContext.pause();
    }
  }
});