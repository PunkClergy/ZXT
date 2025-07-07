const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const {
  u_newShutdownClaim,
  u_loseInsureList,
  u_shutdownClaimList,
  u_userInsureList,

} = require('../../utils/request/car')
const {
  byPost,
  byGet,
  byPostJson
} = require('../../utils/request/http')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
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
    g_triggered: false, //下拉刷新状态
    c_activeTab: 1, // 默认选中的Tab索引
    params: {}, //新增管控数据部分字段
    warrantyList: [],
    warrantIndex: 0,
    params: {},
    startDate: '2025-03-20', //历史轨迹查询时间
    startTime: '19:00', //历史轨迹查询时间
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
    },];
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
  // 理赔记录
  initList() {
    const param = {
      [u_shutdownClaimList.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_shutdownClaimList.URL, param).then(response => {
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
  // 选择单号回调
  bindPickerChange(e) {
    const index = e.detail.value;  // 获取选中项的索引 
    this.setData({
      warrantIndex: index
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
  // 触底请求
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.initList();
    });
  },
  // 下拉刷新
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.initList();
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
  //提交内容
  handleSubmit() {
    const {
      startDate,
      startTime,
    } = this.data;
    const buildDateTime = (date, time) =>
      `${date || ''} ${time ? `${time}:00` : '00:00:00'}`.trim();
    const info = {
      startDate: buildDateTime(startDate, startTime),
      insuranceId: this.data.warrantyList[this.data.warrantIndex]?.id,
      ...this.data.params
    }
    byPost(getApp().data.k1swUrl + u_newShutdownClaim.URL, info, function (response) {
      if (response.data.code == 1000) {
        console.log(response)
      } else {
        // 处理接口返回的错误
        wx.showToast({
          title: response.data.msg || '投保失败',
          icon: 'none'
        });
      }
    });
  },
  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    console.log(flag)
    if (flag == '理赔记录') {
      this.setData({
        c_activeTab: 1,
        params: {},
      })
    }
    if (flag == '理赔提交') {
      if (this.data.c_activeTab != 2) {
        this.setData({
          c_activeTab: 2,
        })
      }
    }
  },
  // 请求保单列表
  initWarranty() {
    byGet(getApp().data.k1swUrl + u_userInsureList.URL, {}).then(response => {
      if (response.statusCode == 200) {
        const resn = response.data.content
        const info = resn.map(ele => {
          let objectInfo = {
            value: ele?.insuranceNo || '',
            name: ele?.insuranceNo || '',
            id: ele?.id
          }
          return objectInfo
        })
        this.setData({
          warrantyList: info
        })
      } else {
        showToast('请求失败，请稍后再试');
        hideLoading();
      }
    })
  },
  bindTimeChange(evt) {
    const category = evt.currentTarget.dataset.index
    const value = evt.detail.value
    this.setData({
      [category]: value
    })

  },
  onLoad(options) {
    this.handleCurrentDate()
  },
  onShow() {
    this.setData({
      c_activeTab: 1,
      params: {}
    })
    this.initList()
    this.initialiImageBaseConversion()
  },
  onReady() {
    this.initWarranty()
  },
})