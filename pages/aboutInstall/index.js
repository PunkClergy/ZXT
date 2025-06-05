const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  u_installapiDel,
  u_getMenuTree,
  u_installapiAddOrUpdate,
  u_roleapiaddOrUpdate,
  u_installapiList,
  u_installapiBuyRecord,
  u_setMenuTree
} = require('../../utils/request/data_info')
const {
  byGet,
  byPost
} = require('../../utils/request/http')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
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
    c_activeTab: 2, // 默认选中的Tab索引
    params: {}, //新增管控数据部分字段
    id: '', //修改标志
    g_order_list: [],
    c_current_info: {},
    c_current_id: '',
    c_current_order: '请选择订单',
    startDate: '2025-03-20',
    startTime: '19:00',
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
  // 管控列表数据
  initList() {
    showLoading()
    const params = {
      [u_installapiList.page]: this.data.g_page,
    };

    byGet(`${getApp().data.k1swUrl}${u_installapiList.URL}`, params).then(response => {
      if (response.data.code == 1000) {
        if (this.data.g_page > 1 && response.data.content.length === 0) {
          showToast(`已加载全部数据：共${this.data.g_items.length}条`);
        }
        this.setData({
          g_items: this.data.g_items.concat(response.data.content),
          g_total: Number(response.data.count || 0).toLocaleString()
        }, () => {
          hideLoading();
        });
      }
    })
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

    const tomorrowDate = formatDate(tomorrow);
    const currentTime = formatTime(now);

    this.setData({
      startDate: tomorrowDate, // 今天作为开始日期
      startTime: currentTime,
    });
  },

  // 订单列表
  initOrderList() {
    showLoading()
    byGet(`${getApp().data.k1swUrl}${u_installapiBuyRecord.URL}`, {}).then(response => {
      if (response.data.code == 1000) {
        if (this.data.g_page > 1 && response.data.content.length === 0) {
          showToast(`已加载全部数据：共${this.data.g_items.length}条`);
        }
        const allRes = response.data.content
        const list = allRes?.map((ele) => {
          let temp = {
            value: ele?.platformNum,
            name: ele?.salePlatform + ' ' + ele?.platformNum,
            orderid: ele?.id,
            linkman: ele?.linkman,
            linkmobile: ele?.linkmobile,
            linkaddress: ele?.linkaddress
          }
          return temp
        })
        this.setData({
          g_order_list: list,
        }, () => {
          hideLoading();
        });
      }
    })
  },
  // 选择订单
  handleProvincesPicker(evt) {
    const {
      g_order_list
    } = this.data
    const selectIndex = evt.detail.value;
    const selectedProvince = g_order_list?.[selectIndex];
    const selectedNum = selectedProvince?.value;
    const selectedId = selectedProvince?.id;
    const selectedName = selectedProvince?.name;
    this.setData({
      c_current_order: selectedName + selectedNum,
      c_current_id: selectedId,
      c_current_info: selectedProvince
    })
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
      g_items: [],
    }, () => {
      this.initList();
    });
  },

  // 新增账号字段输入回调
  handleBindinput(evt) {
    const {
      c_current_info
    } = this.data
    c_current_info[evt.currentTarget.dataset.item] = evt.detail.value
    this.setData({
      params: {
        ...c_current_info
      }
    })
  },


  //提交内容
  handleSubmit() {
    const {
      c_current_info,
      startDate,
      startTime
    } = this.data
    byPost(`${getApp().data.k1swUrl}${u_installapiAddOrUpdate.URL}`, {
      ...c_current_info,
      personname: c_current_info?.linkman,
      mobile: c_current_info?.linkmobile,
      address: c_current_info?.linkaddress,
      installdate: startDate + ' ' + startTime
    }, (response) => {
      if (response?.data?.code != 1000) {
        showToast(response?.data?.msg);
        hideLoading();
        return
      }
      this.setData({
        g_triggered: false,
        g_page: 1,
        g_items: [],
        c_activeTab: 1,
        g_order_list: [],
        c_current_info: {},
        c_current_id: '',
        c_current_order: '请选择订单'
      }, () => {
        this.initList();
      });

    }, (error) => {
      hideLoading();
      showToast('提交失败，请稍后重试');
    });
  },
  // 确认并支付
  handleConfirmPay() {},


  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    if (flag == '预约清单') {
      this.setData({
        c_activeTab: 1,
        params: {},
        id: ''
      })
    }
    if (flag == '预约安装') {
      if (this.data.c_activeTab != 2) {
        this.setData({
          c_activeTab: 2,
        })
      }
    }
  },

  // 删除列表数据
  handleDelete(evt) {
    const _this = this
    const id = evt?.currentTarget.dataset.id
    const params = {
      [u_installapiDel.id]: id
    }
    byGet(`${getApp().data.k1swUrl}${u_installapiDel.URL}`, params).then(allRes => {
      if (allRes?.data?.code == 1000) {
        _this.setData({
          g_triggered: false,
          g_page: 1,
          g_items: []
        }, () => {
          _this.initList()
        })
      }
    })
  },


  onLoad(options) {
    this.initList()
    this.initOrderList()
  },
  onShow() {
    this.initialiImageBaseConversion()
  },
})