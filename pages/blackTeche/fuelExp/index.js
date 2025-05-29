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
  u_addOrUpdate,
  u_addList
} = require('../../../utils/request/order')
const {
  byGet,
  byPost
} = require('../../../utils/request/http')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_background_tabs_1: '', //tabs背景
    s_background_tabs_2: '', //tabs背景
    s_background_tabs_active_1: '', //tabs背景
    s_background_tabs_active_2: '', //tabs背景
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_page: 1, //列表页码
    g_items: [], //列表数据
    c_tabs: [{
        name: '报销记录',
        value: '1'
      },
      {
        name: '新增报销',
        value: '2'
      }
    ], //tabs切换签
    c_activeTab: 2,
    params: {},
    file: null,
    g_triggered: false, //下拉刷新状态
  },
  // 全屏背景图
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
      path: '/assets/images/home/car-bg.png',
      key: 's_background_picture_of_the_front_page'
    }, {
      path: '/assets/images/home/1-1.png',
      key: 's_background_tabs_1'
    }, {
      path: '/assets/images/home/2-1.png',
      key: 's_background_tabs_active_1'
    }, {
      path: '/assets/images/home/1-2.png',
      key: 's_background_tabs_2'
    }, {
      path: '/assets/images/home/2-2.png',
      key: 's_background_tabs_active_2'
    }, ];
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
  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    if (flag == '验证记录') {
      this.setData({
        c_activeTab: 1,
      })
    } else {
      this.setData({
        c_activeTab: 2,
      })
    }
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
      oilendDate: currentDate,
      oilendTime: currentTime,
      startDate: currentDate, // 今天作为开始日期
      endDate: tomorrowDate, // 明天作为结束日期
      startTime: currentTime,
      endTime: currentTime
    });
  },
  // 预览图片
  handlePreviewImage(evt) {
    console.log(evt)
    const images = evt.currentTarget.dataset.item
    wx.previewMedia({
      sources: [{
        url: images, // 图片路径
        type: 'image',
      }, ],
    });
  },
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.getOrderList();
    });
  },
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.getOrderList();
    });
  },
  getOrderList() {
    showLoading("加载中...");
    const param = {
      [u_addOrUpdate.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_addOrUpdate.URL, param).then(response => {
      if (response.statusCode == 200) {
        if (this.data.g_page > 1 && response.data.content.length === 0) {
          showToast(`已加载全部数据：共${this.data.g_items.length}条`);
        }
        this.setData({
          g_items: this.data.g_items.concat(response.data.content),
          g_total: Number(response.data.count || 0).toLocaleString()
        }, () => {
          hideLoading();
        });
      } else {
        showToast('请求失败，请稍后再试');
        hideLoading();
      }
    })
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
  // 上传图片或拍照
  chooseImage() {
    wx.chooseMedia({
      count: 1, // 最多选择1张图片
      mediaType: ['image'], // 只选择图片
      sourceType: ['album', 'camera'], // 允许从相册选择或拍照
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath; // 获取图片临时路径
        this.setData({
          file: tempFilePath,
        });
      },
      fail: (err) => {
        showToast('选择图片失败');
      },
    });
  },
  // 预览图片
  previewImage() {
    if (!this.data.file) return;
    wx.previewMedia({
      sources: [{
        url: this.data.file, // 图片路径
        type: 'image',
      }, ],
    });
  },
  bindTimeChange(evt) {
    const category = evt.currentTarget.dataset.index
    const value = evt.detail.value
    this.setData({
      [category]: value
    })
  },
  handleSubmit() {

    const {
      params,
      oilendDate,
      oilendTime,
      startDate, // 今天作为开始日期
      endDate, // 明天作为结束日期
      startTime,
      endTime,
      file
    } = this.data
    let temp = {
      ...params,
      usecarstartdate: startDate + ' ' + startTime,
      usecarenddate: endDate + ' ' + endTime,
      oildate: oilendDate + ' ' + oilendTime,
      oilinvoiceimg: file || ''
    }

    byPost(getApp().data.k1swUrl + u_addList.URL, temp, (res) => {
      console.log(res)
      if (res.data.code == 1000) {
        this.setData({
          params: {},
          file: null,
          c_activeTab: 1,

          g_triggered: false,
          g_page: 1,
          g_items: []
        }, () => {
          this.handleCurrentDate() 
          this.getOrderList();
        })
      }
    });

  },
  onLoad(options) {
    this.getOrderList()

  },


  onReady() {
    this.handleCurrentDate()
  },

  onShow() {
    this.initialiImageBaseConversion()

  },

})