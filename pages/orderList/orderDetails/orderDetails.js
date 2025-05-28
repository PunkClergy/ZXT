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
  u_orderConfirm,
  u_getOrderDetial,
  u_submitKeymailing,
  u_submitOrderInsall
} = require('../../../utils/request/data_info')
const {
  byPost,
  byGet
} = require('../../../utils/request/http')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 70, // 搜索框高度，默认值
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    navList: [],
    activeIndex: 0,
    navScrollLeft: 0,
    scrollIntoViewId: 'section10',
    currentIndex: 0,
    c_send_key_show_momal: false, //上传单号弹窗
    key_params: {}, //寄送钥匙物流信息
    c_install_show_momal: false, //申请安装弹窗
    install_params: {}, //安装信息
    startDate: '',
    startTime: ''

  },
  // 全屏背景
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
    const currentTime = formatTime(now);

    this.setData({
      startDate: currentDate,
      startTime: currentTime,
    });
  },
  // 切换导航
  handleSwitchNav(e) {
    const sectionId = e.currentTarget.dataset.id;
    this.setData({
      scrollIntoViewId: `section${sectionId}`
    });

  },
  // 请求详情
  initDetails(evt) {
    const {
      id
    } = evt || {};
    const orderIdField = u_getOrderDetial.orderId;
    const apiUrl = `${getApp().data.k1swUrl}${u_getOrderDetial.URL}`;
    const params = {
      [orderIdField]: id
    };
    const orderModules = [{
        key: 'carList',
        id: '10',
        name: '订单信息'
      }, {
        key: 'orderCostList',
        id: '11',
        name: '报价信息'
      },
      {
        key: 'orderKeyMailingList',
        id: '12',
        name: '寄送钥匙信息'
      },
      {
        key: 'orderLogisticsList',
        id: '13',
        name: '物流信息'
      },
      {
        key: 'orderInstallList',
        id: '14',
        name: '安装信息'
      },
    ];

    byGet(apiUrl, params)
      .then(response => {
        const info = response?.data?.content || {};
        const navList = orderModules
          .map(({
            key,
            id,
            name
          }) => {
            const items = info[key];
            return {
              key: key,
              list: items,
              id,
              name
            };
          })
          .filter(Boolean);
        this.setData({
          all_data: info,
          navList
        });
      })
      .catch(error => {
        console.error('订单详情请求失败:', error);
      });
  },
  // 车辆切换
  handleSwitchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentIndex: index,
      scrollLeft: (index - 2) * 120,
      scrollTop: 0,
    });
  },
  // 复制寄送钥匙地址功能
  handleCopyAddress() {
    wx.setClipboardData({
      data: '智信通 13676767654 北京市丰台区海鹰路智信通大厦2楼',
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'none'
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },
  // 取消上传物流单号弹窗
  handleHideSengKeyModal() {
    this.setData({
      key_params: {},
      c_send_key_show_momal: false
    })
  },
  // 上传or修改单号
  handleUploadTrackingNumber(evt) {
    console.log(evt)
    const info = evt?.currentTarget?.dataset?.item
    this.setData({
      key_params: info ? info : {}
    }, () => {
      this.setData({
        c_send_key_show_momal: true
      })
    })
  },
  // 上传单号提交
  handleFormSubmit(evt) {
    console.log(evt)
    const value = evt.detail.value
    if (!value?.name) {
      showToast('请输入快递名称')
      return
    }
    if (!value?.num) {
      showToast('请输入快递单号')
      return
    }
    const params = {
      [u_submitKeymailing.orderid]: this.data.all_data.id,
      [u_submitKeymailing.name]: value.name,
      [u_submitKeymailing.num]: value.num
    }
    byPost(getApp().data.k1swUrl + u_submitKeymailing.URL, params,
      (response) => {
        if (response.data.code == 1000) {
          this.setData({
            c_send_key_show_momal: false
          }, () => {
            this.initDetails(this.data.all_data)
          })
        }

      });

  },
  // 提交安装申请时间
  handleFormInstallSubmit(evt) {
    const value = evt?.detail?.value
    if (!value?.personname) {
      showToast('请输入联系人')
      return
    }
    if (!value?.mobile) {
      showToast('请输入联系电话')
      return
    }
    if (!value?.address) {
      showToast('请输入安装地址')
      return
    }
    const params = {
      [u_submitOrderInsall.orderid]: this.data.all_data.id,
      [u_submitOrderInsall.personname]: value.personname,
      [u_submitOrderInsall.mobile]: value.mobile,
      [u_submitOrderInsall.address]: value.address,
      [u_submitOrderInsall.installdate]: this.data.startDate + ' ' + this.data.startTime
    }
    byPost(getApp().data.k1swUrl + u_submitOrderInsall.URL, params,
      (response) => {
        if (response.data.code == 1000) {
          this.setData({
            c_install_show_momal: false
          }, () => {
            this.initDetails(this.data.all_data)
          })
        }

      });
    console.log(evt)
  },
  // 申请或修改
  handleInstall(evt) {
    const info = evt?.currentTarget?.dataset?.item
    this.setData({
      install_params: info ? info : {},
      c_install_show_momal: true
    }, () => {
      if (info?.installdate) {
        this.setData({
          startDate: info?.installdate?.substring(0, 10),
          startTime: (info?.installdate?.slice(-8))?.slice(0, -3)
        })
      }
    })
  },
  // 关闭安装
  handleHideInstallModal() {
    this.setData({
      c_install_show_momal: false
    })
  },
  // 时间更改
  bindTimeChange(e) {
    const category = e.currentTarget.dataset.index
    const value = e.detail.value
    this.setData({
      [category]: value
    })
  },
  // 去支付
  handleOneClickOrdering() {
    wx.navigateTo({
      url: '/pages/pay/index?info=' + JSON.stringify(this.data.all_data),
    })
  },
  onLoad(options) {
    if (options.info) {
      this.initDetails(JSON.parse(options.info))
    }
  },
  onReady() {},
  onShow() {
    this.initialiImageBaseConversion()
    this.handleCurrentDate()
  },
})