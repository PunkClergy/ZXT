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
  u_willingkey,
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
    c_screen_height: _handleWindowInfo.windowHeight || 0,
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
    startTime: '',
    g_keys_type: [{ value: 1, name: '不寄钥匙，自行组装' }, { value: 2, name: '上门取件' }, { value: 3, name: '自行邮寄' }],// 钥匙邮寄方式
    g_keys_type_index: 0,
    date: '2025-10-11',//上门取钥匙日期
    time: '18:30',//上门取钥匙时间
    region: [],//地址 当前选择地区

  },
  // 跳转到优惠券列表
  handleUseCoupon() {
    wx.navigateTo({
      url: '/pages/coupon/index?tab=1&back=true',
    })
  },
  // 钥匙邮寄方式切换函数
  handleKeysCurrType(evt) {
    this.setData({
      g_keys_type_index: evt?.currentTarget?.dataset?.item?.value
    })
  },
  // 选择取件日期
  takeBindDateChange(e) {
    this.setData({ date: e.detail.value });
  },
  // 选择取件时间
  takeBindTimeChange(e) {
    this.setData({ time: e.detail.value });
  },
  // 选择地址弹窗调起
  handleSelectAddress() {
    this.setData({
      c_select_address: true
    })
  },
  // 选择地区
  bindRegionChange(e) {
    this.setData({
      region: e.detail.value
    })
  },
  // 确认上门取钥匙地址
  handleKeysFormSubmit(evt) {
    const info = evt?.detail?.value
    const region = this.data.region
    this.setData({
      g_door_address: `${info?.personName}  ${info?.mobile}  ${region?.join('')}${info?.bak}`
    }, () => {
      this.setData({
        c_select_address: false,
        region: []
      })
    })
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
    // === 工具函数（内联定义）===
    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    const formatTime = (d) => {
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    };

    // === 静态配置（内联）===
    const ORDER_MODULES = [
      { key: 'carList', id: '10', name: '订单信息' },
      { key: 'orderCostList', id: '11', name: '报价信息' },
      { key: 'orderKeyMailingList', id: '12', name: '寄送钥匙信息' },
      { key: 'orderLogisticsList', id: '13', name: '物流信息' },
      { key: 'orderInstallList', id: '14', name: '安装信息' }
    ];

    // === 主逻辑开始 ===
    const { id } = evt || {};
    if (!id) {
      console.warn('订单ID缺失，无法加载详情');
      return;
    }

    const apiUrl = `${getApp().data.k1swUrl}${u_getOrderDetial.URL}`;
    const params = { [u_getOrderDetial.orderId]: id };

    byGet(apiUrl, params)
      .then(response => {
        const info = response?.data?.content || {};
        const now = new Date();

        // 构建 navList
        const navList = ORDER_MODULES.map(({ key, id, name }) => ({
          key,
          id,
          name,
          list: info[key] || []
        }));

        // 默认日期时间
        let pickupDate = formatDate(now);
        let pickupTime = formatTime(now);

        // 安全解析 pickupdate
        const pickup = info?.orderPickup;
        if (pickup?.pickupdate) {
          const parts = pickup.pickupdate.trim().split(/\s+/);
          if (parts.length >= 2) {
            pickupDate = parts[0];
            // 确保时间部分至少有 HH:mm 格式
            const timeParts = parts[1].split(':');
            pickupTime = timeParts.length >= 2 ? parts[1] : formatTime(now);
          } else if (parts.length === 1 && /^\d{4}-\d{2}-\d{2}$/.test(parts[0])) {
            pickupDate = parts[0];
            // 时间仍用当前时间
          }
        }

        // 拼接取件地址（过滤空值）
        const g_door_address = pickup
          ? [pickup.personname, pickup.mobile, pickup.address]
            .filter(item => item != null && item !== '')
            .join(' ')
          : '';
        // 更新数据
        this.setData({
          g_keys_type_index: info.willingKey || 2,
          g_door_address,
          date: pickupDate,
          time: pickupTime,
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
  // 复制寄送钥匙单号
  handleCopyNum(evt) {
    console.log(evt)
    wx.setClipboardData({
      data: evt?.currentTarget?.dataset?.item?.num,
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
      c_select_address: false,
      c_send_key_show_momal: false
    })
  },

  // 确定钥匙邮寄方式
  handleSendingKeyFunction() {
    const willing = this.data.g_keys_type_index//类型 1不邮寄 2上面取件
    const g_door_address = this.data.g_door_address
    const date = this.data.date
    const time = this.data.time
    const partsDoor = g_door_address?.trim().split(/\s+/);
    const pamsg = {
      orderId: this.data.all_data?.id,
      willing,
      pickupPerson: willing == 2 ? partsDoor?.[0] : '',
      pickupMobile: willing == 2 ? partsDoor?.[1] : '',
      pickupAddress: willing == 2 ? partsDoor?.slice(2)?.join(' ') : '',
      pickupTime: willing == 2 ? `${date} ${time}`?.trim() : ''
    }
    byPost(getApp().data.k1swUrl + u_willingkey.URL, pamsg, (response) => {
      if (response.data.code == 1000) {
        showToast(response.data?.msg)
        this.initDetails(this.data.all_data)
      }
    });
  },
  // 上传or修改单号
  handleUploadTrackingNumber(evt) {
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
      url: `/pages/pay/index?info=${JSON.stringify(this.data.all_data)}&coupon=${JSON.stringify(this.data.couponText)}`
    })
  },
  onLoad(options) {
    console.log(options, '222')
    if (options.info) {
      this.initDetails(JSON.parse(options.info))
      this.setData({
        numInfo: JSON.parse(options.info)
      })
    }
  },
  onReady() { },
  // 获取已选择优惠券
  handleGetStorageCoupon() {
    wx.getStorage({
      key: 'coupon',
      success: (res) => {
        const coupon = res.data
        this.setData({
          couponText: coupon
        })
      }
    })
  },
  onShow() {
    if (this?.data?.numInfo) {
      this.initDetails(this.data.numInfo)
    }
    // 获取缓存
    this.handleGetStorageCoupon()
    this.initialiImageBaseConversion()
    this.handleCurrentDate()
  },
})