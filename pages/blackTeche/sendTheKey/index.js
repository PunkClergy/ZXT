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
  u_updateRentKey
} = require('../../../utils/request/order')
const {
  u_carList
} = require('../../../utils/request/car')
const {
  byGet,
  byPost
} = require('../../../utils/request/http')
const {
  u_rentRecord,
  u_sendRentKey,
  u_cancelRentKey
} = require('../../../utils/request/self')
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
    c_fin3_link: 'https://fin3.wiselink.net.cn/fin/',
    y_items: [],
    y_page: 1,
    y_triggered: false,
    c_tabs: [{
      name: '报销记录',
      value: '1'
    },
    {
      name: '新增报销',
      value: '2'
    }
    ], //tabs切换签
    c_activeTab: 1,
    params: {},
    file: null,
    g_triggered: false, //下拉刷新状态
    c_send_key_show_momal: false,
    startDate: '2025-03-20', //历史轨迹查询时间
    startTime: '19:00', //历史轨迹查询时间
    endDate: '2025-03-20', //历史轨迹查询时间
    endTime: '19:00', //历史轨迹查询时间
    copied: false,
    controlcode: '',
    c_edit_key_show_momal: false,
    g_edit_info: {}
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
  // 发送电子钥匙弹窗
  handleShowSendKeyModal(evt) {
    const info = evt.currentTarget.dataset.item
    this.setData({
      cellData: info,
      c_send_key_show_momal: true,
      vehId: info.id
    });
  },
  handleHideSengKeyModal() {
    this.setData({
      cellData: {},
      c_send_key_show_momal: false
    })
  },
  handleHideEditKeyModal() {
    this.setData({
      c_edit_key_show_momal: false,
      g_edit_info: {}
    })
  },
  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    if (flag == '发送钥匙') {
      this.setData({
        c_activeTab: 1,
      })
    } else {
      this.setData({
        c_activeTab: 2,
      })
    }
  },
  // 触底执行
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.getOrderList();
    });
  },
  // 电子钥匙发送记录到底执行
  handleKeyLower() {
    const page = this.data.y_page;
    this.setData({
      y_page: page + 1,
    }, () => {
      this.getKeySendingList()
    });
  },
  // 下拉操作执行
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.getOrderList();
    });
  },
  handleKeyRefresh() {
    this.setData({
      y_triggered: false,
      y_page: 1,
      y_items: []
    }, () => {
      this.getKeySendingList();
    });
  },
  // 请求车辆列表
  getOrderList() {
    showLoading("加载中...");
    const param = {
      [u_addOrUpdate.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_carList.URL, param).then(response => {
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
  // 搜索记录
  bindblurSea(evt) {
    this.setData({
      comParam: evt.detail.value,
      y_triggered: false,
      y_page: 1,
      y_items: []
    }, () => {
      this.getKeySendingList()
    })
  },
  // 请求发送记录列表
  getKeySendingList: async function (evt) {
    showLoading("加载中...");
    try {
      const app = getApp();
      const url = app.data.k1swUrl + u_rentRecord.URL;
      const params = {
        [u_rentRecord.page]: this.data.y_page
      };
      const response = await byGet(url, params);
      const resp = response.data;
      if (this.data.y_page > 1 && resp.content.length === 0) {
        showToast(`已加载全部数据：共${this.data.y_items.length}条`);
        return;
      }
      this.setData({
        y_total: resp.count || 0,
        y_items: [...this.data.y_items, ...resp.content],
      });
    } catch (error) {
      showToast("数据加载失败，请重试");
    } finally {
      hideLoading();
    }
  },
  // 查看照片
  handleViewPhotos(evt) {
    const info = evt?.currentTarget?.dataset?.item;
    if (!info) {
      showToast('无效数据');
      return;
    }
    const g_images = [info.img1, info.img2, info.img3, info.img4, info.img5]
      .filter(img => img != null && img !== ''); 
    if (g_images.length < 1) {
      showToast('无可查看照片');
      return;
    }

    const images = g_images.map(ele => {
      return this.data.c_fin3_link + ele.replace(/\\/g, "/");
    });

    wx.previewImage({
      urls: images // 需要预览的图片http链接列表
    });
  },
  // 提交发送钥匙
  handleFormSubmit(evt) {
    const {
      startDate,
      startTime,
      endDate,
      endTime,
      vehId
    } = this.data;
    const formData = evt.detail.value;
    const validations = [{
      field: formData.personName,
      message: '请输入使用人'
    },
    {
      field: formData.mobile,
      message: '请输入手机号'
    }
    ];

    const validationError = validations.find(({
      field
    }) => !field);
    if (validationError) {
      showToast(validationError.message);
      return;
    }

    const buildDateTime = (date, time) =>
      `${date || ''} ${time ? `${time}:00` : '00:00:00'}`.trim();

    const requestParams = {
      vehId: vehId,
      startDate: buildDateTime(startDate, startTime),
      endDate: buildDateTime(endDate, endTime),
      personName: formData.personName,
      mobile: formData.mobile,
      bak: formData.bak
    };

    const API_ENDPOINTS = {
      baseURL: getApp().data.k1swUrl,
      sendRentKey: u_sendRentKey.URL
    };
    const submitRequest = async () => {
      try {
        const response = await byGet(
          `${API_ENDPOINTS.baseURL}${API_ENDPOINTS.sendRentKey}`,
          requestParams
        );

        if (response.data.code !== 1000) {
          throw new Error(response.data.msg);
        }


        this.setData({
          c_send_key_show_momal: false,
          g_items: [],
          y_items: [],
          y_page: 1,
        }, () => {
          showToast('发送成功');
          setTimeout(() => {
            this.getKeySendingList()
            this.getOrderList()
          }, 1000)
        });

      } catch (error) {
        showToast(error.message || '请求失败，请稍后重试');
      }
    };

    submitRequest();
  },
  bindTimeChange(evt) {
    const category = evt.currentTarget.dataset.index
    const value = evt.detail.value
    this.setData({
      [category]: value
    })

  },
  handleCance(evt) {
    const params = {
      [u_cancelRentKey.controlCode]: evt.currentTarget.dataset.item.controlcode
    }
    byGet(getApp().data.k1swUrl + u_cancelRentKey.URL, params).then(response => {
      console.log(response.data)
      if (response.data.code == 1000) {
        this.setData({
          c_send_key_show_momal: false,
          g_items: [],
          y_items: [],
          y_page: 1,
        }, () => {
          this.getKeySendingList()
          this.getOrderList()
        });
      } else {
        showToast(response.data.msg)
      }
    });
  },
  handleCopy(evt) {
    const text = evt.currentTarget.dataset.item.simplecode
    wx.setClipboardData({
      data: text,
      success: () => {
        this.setData({
          copied: true
        })
      }
    });
  },
  handleForward(evt) {
    console.log(evt)
    const controlcode = evt.currentTarget.dataset.item.controlcode
    const bak = evt?.currentTarget?.dataset?.item?.bak
    this.setData({
      controlcode: controlcode,
      bak: bak
    });
  },
  handleEditKey(evt) {
    console.log(evt.currentTarget.dataset.item)
    this.setData({
      c_edit_key_show_momal: true,
      g_edit_info: evt.currentTarget.dataset.item
    })

  },
  handleFormEdit() {
    const {
      startDate,
      startTime,
      endDate,
      endTime,
      g_edit_info
    } = this.data;
    const buildDateTime = (date, time) =>
      `${date || ''} ${time ? `${time}:00` : '00:00:00'}`.trim();
    const requestParams = {
      controlCode: g_edit_info.controlcode,
      startDate: buildDateTime(startDate, startTime),
      endDate: buildDateTime(endDate, endTime),
    };

    byPost(
      `${getApp().data.k1swUrl}${u_updateRentKey.URL}`, requestParams,
      (response) => {
        if (response.data.code == 1000) {
          this.setData({
            g_edit_info: {},
            c_edit_key_show_momal: false,
            y_triggered: false,
            y_page: 1,
            y_items: []
          }, () => {
            this.getKeySendingList()
          })
        }
      },
      (error) => {

      }
    );
    console.log(requestParams)
  },
  onLoad(options) {
    this.getOrderList()
    this.getKeySendingList()
  },


  onReady() {
    this.handleCurrentDate()
  },

  onShow() {
    this.initialiImageBaseConversion()
    this.handleCurrentDate()
  },
  onShareAppMessage() {
    return {
      title: `请前往${this.data.bak || '车主指定位置'}寻找车辆`,
      path: '/pages/desk/desk?scene=' + this.data.controlcode,
    }
  }

})