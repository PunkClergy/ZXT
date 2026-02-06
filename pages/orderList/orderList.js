const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const {
  u_navlist20,
} = require('../../utils/request/home')
const {
  u_buyDevice,
  u_buyRecord,
  u_getIndustry,
  u_getIntroduction,
  u_isNeedCarInfo,
  u_getDeviceClass,
  u_cancalCustomerOrder,
  u_delCustomerOrder
} = require('../../utils/request/data_info')
const {
  byGet,
  byPost, byPostJson, isLogin
} = require('../../utils/request/http')

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
    c_activeTab: 2, //当前页签值
    g_industry: [], //所属行业
    g_industry_index: null, //当前行业
    g_install_list: [{
      value: 0,
      name: '否'
    }, {
      value: 1,
      name: '是'
    }], // 是否安装

    g_install_index: 1,//是否安装当前选择

    c_address_type: '',// 地址选择类型
    c_select_address: false,//选择地址弹窗
    g_door_address: '',//上门地址
    g_receiving_address: '',//收货地址
    region: [],//地址 当前选择地区
    bak: '',//备注
    c_link: 'https://k1sw.wiselink.net.cn/', //域名
    tabList: [
    ],
    // 底部tabbar高度
    tabBarHeight: 80,
    currentTab: 1,
    tableData: [
      // {
      //   product: '租车MCCK',
      //   item: '服务费',
      //   price: 5999.00,
      //   checked: false
      // },
      // {
      //   product: '车队MCCK',
      //   item: '年度服务费',
      //   price: 360.00,
      //   checked: false
      // },
      // {
      //   product: '网约车MCCK',
      //   item: '月度服务费',
      //   price: 399.00,
      //   checked: false
      // },
      // {
      //   product: '金融MCCK',
      //   item: '试用转正式版服务费',
      //   price: 19999.00,
      //   checked: false
      // },
      // {
      //   product: '国际租车分时出行MCCK',
      //   item: '硬件更换费用',
      //   price: 2499.00,
      //   checked: false
      // }
    ],
    goodsList: [
      { id: 1, name: '无需邮寄' },
      { id: 2, name: '自行邮寄' },
      { id: 3, name: '上门取钥匙' }
    ],
    selectIndex: 0, // picker绑定的下标（默认选中第0项）
    selectItem: {}  // 存储当前选中的完整对象（方便后续取值
  },
  //  Tabs2选择钥匙邮寄方式
  onPickerChange(e) {
    const index = +e.detail.value;
    this.setData({ selectIndex: index, selectItem: this.data.goodsList[index] });
  },
  // All获取系统头部各区域高度
  initSystemInfo() {
    const { statusBarHeight: s } = wx.getWindowInfo()
    const m = wx.getMenuButtonBoundingClientRect()
    if (!m) return
    const n = m.height + (m.top - s) * 2
    const c = wx.getWindowInfo().screenWidth - m.right
    this.setData({
      height_from_head: s,
      head_height: s + n,
      capsule_distance_to_the_right: c
    })
  },
  // Tabs3全选/取消全选
  toggleAll() {
    const newValue = !this.data.allChecked;
    const tableData = this.data.tableData.map(item => ({
      ...item,
      checked: newValue
    }));

    this.setData({
      allChecked: newValue,
      tableData
    }, () => {
      this.calculateSelected();
    });
  },
  // Tabs3计算选中数量
  calculateSelected() {
    const count = this.data.tableData.filter(item => item.checked).length;
    const total = (this.data.tableData.reduce((sum, item) => {
      return item.checked ? sum + item.price : sum;
    }, 0)).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });;
    this.setData({
      selectedCount: count,
      priceTotal: total
    });
  },
  // Tabs3切换单个复选框
  toggleCheck(e) {
    const index = e.currentTarget.dataset.value;
    const key = `tableData[${index}].checked`;
    this.setData({
      [key]: !this.data.tableData[index].checked
    }, () => {
      this.calculateSelected();
      this.checkAllState();
    });
  },
  // Tabs3检查全选状态
  checkAllState() {
    const allChecked = this.data.tableData.every(item => item.checked);
    this.setData({
      allChecked
    });
  },
  // Tabs3提交操作
  submit() {
    const selectedItems = this.data.tableData.filter(item => item.checked);
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请选择支付项目',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '提示',
      content: `此功能暂时缺失`,
      showCancel: false
    });
  },
  // All获取底部导航数据
  initBottomDirectory() {
    byGet(this.data.c_link + u_navlist20.URL, {}).then(response => {
      console.log(response)
      if (response.statusCode == 200) {
        this.setData({
          tabList: response.data.content
        })
      }
    })
  },
  // All切换底部导航
  handleSwitchTabNavigation(evt) {
    const { currentTarget: { dataset: { index: idx = null } = {} } = {} } = evt ?? {};
    if (idx === null) return;
    const { tabList = [] } = this.data;
    const { pagePath: targetUrl } = tabList[idx] ?? {};
    if (!targetUrl) return;
    const [currentPage] = getCurrentPages().slice(-1);
    const { route: currentPath } = currentPage ?? {};
    if (!currentPath) return;
    const targetPurePath = targetUrl.split('?')[0];
    console.log(currentPath, targetPurePath);
    currentPath !== targetPurePath && wx.redirectTo({ url: `/${targetUrl}` });
  },
  // All 跳转登录
  handleOnExistingAccountTap() {
    (0, wx.navigateTo)({ url: '/pages/system/managerLoginView/loginView' })
  },


  // Tabs2选择地区
  bindRegionChange(e) {
    this.setData({
      region: e.detail.value
    })
  },
  // All初始化当前时间
  initialDateTime() {
    const now = new Date();
    // 获取年月日
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需+1
    const day = String(now.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;

    // 获取时分
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const time = `${hour}:${minute}`;

    console.log('date:', date); // 例如：2025-10-13
    console.log('time:', time); // 例如：16:57

    // 可以设置到 data 中用于页面显示
    this.setData({
      date: date,
      time: time
    });
  },
  // All全屏背景图
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
  // 行业数据
  initialiIndustry() {
    byGet((getApp().data.k1swUrl || this.data.c_link) + u_getIndustry.URL, {}).then(response => {
      const list = response.data.content
      const info = list.map(ele => {
        let temp = {
          id: ele,
          name: ele
        }
        return temp
      })
      this.setData({
        g_industry: info
      })
    })
  },


  // All切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    if (flag == '采购订单') {
      this.setData({
        c_activeTab: 1,
      })
    } else if (flag == '新增订单') {
      this.setData({
        c_activeTab: 2,
      })
    } else {
      this.setData({
        c_activeTab: 3,
      })
    }
  },
  // 查询列表
  getOrderList() {
    showLoading("加载中...");
    const param = {
      [u_buyRecord.page]: this.data.g_page,
    };
    byGet((getApp().data.k1swUrl || this.data.c_link) + u_buyRecord.URL, param).then(response => {
      hideLoading()
      if (response.statusCode == 200) {
        if (this.data.g_page > 1 && response.data.content.length === 0) {
          showToast(`已加载全部数据：共${this.data.g_items.length}条`);
        }
        this.setData({
          g_items: this.data.g_items.concat(response.data.content),
          g_total: Number(response.data.count || 0).toLocaleString()
        });
      } else {
        showToast('请求失败，请稍后再试');
      }
    })
  },
  // 订单列表触底懒加载
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.getOrderList();
    });
  },
  // 订单列表下拉刷新
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.getOrderList();
    });
  },
  // Tabs所属行业变化回到
  handleIndustryType(evt) {
    this.setData({
      g_industry_index: evt.detail.value
    }, () => {
      // 求价钱
    })
  },
  // 数量改变
  handleNumBindinput(evt) {
    this.setData({
      buycount: evt.detail.value
    })
  },
  // 邀请码改变
  handleInviteCodeBindinput(evt) {
    this.setData({
      inviteCode: evt.detail.value
    })
  },
  // 收货人发生改变
  handlePersonBindinput(evt) {
    this.setData({
      linkperson: evt.detail.value
    })
  },
  // 联系电话
  handleMobileBindinput(evt) {
    this.setData({
      linkmobile: evt.detail.value
    })
  },
  // 收货地址
  handleAddressBindinput(evt) {
    this.setData({
      bak: evt.detail.value
    })
  },
  // 是否安装切换函数
  handleVicheRadioChange(evt) {
    this.setData({
      g_install_index: evt.detail.value
    })
  },

  // 跳转到详情
  handleView(evt) {
    wx.navigateTo({
      url: '/pages/orderList/orderDetails/orderDetails?info=' + JSON.stringify(evt.currentTarget.dataset.item),
    })
  },
  // 跳转到原始订单详情
  handleOriginalView(evt) {
    wx.navigateTo({
      url: '/pages/orderList/details/details?info=' + JSON.stringify(evt.currentTarget.dataset.item),
    })
  },
  // 删除原始订单
  handleDelete(evt) {
    const requestParam = {
      orderId: evt?.currentTarget?.dataset?.item?.id
    }
    wx.showModal({
      title: '提示',
      content: '确定要删除订单吗？',
      success: (res) => {
        if (res.confirm) {
          showLoading()
          byPost((getApp().data.k1swUrl || this.data.c_link) + u_delCustomerOrder.URL, requestParam, (response) => {
            hideLoading()
            if (response.data.code !== 1000) {
              showToast(response.data.msg);
            } else {
              showToast(response.data.msg);
              this.setData({
                g_page: 1,
                g_items: []
              }, () => {
                this.getOrderList()
              })
            }
          }, (error) => {
            showToast('删除订单失败，请重试');
          }, () => {
            hideLoading();
          });
        }
      }
    });


  },
  // 取消原始订单
  handleCancel(evt) {
    const requestParam = {
      orderId: evt?.currentTarget?.dataset?.item?.id
    }
    wx.showModal({
      title: '提示',
      content: '确定要取消订单吗？',
      success: (res) => {
        if (res.confirm) {
          showLoading()
          byPost((getApp().data.k1swUrl || this.data.c_link) + u_cancalCustomerOrder.URL, requestParam, (response) => {
            hideLoading()
            if (response.data.code !== 1000) {
              showToast(response.data.msg);
            } else {
              showToast(response.data.msg);
              this.setData({
                g_page: 1, //列表页码
                g_items: [], //列表数据
              }, () => {
                this.getOrderList()
              })

            }
          }, (error) => {
            showToast('取消订单失败，请重试');
          }, () => {
            hideLoading();
          });
        }
      }
    });

  },
  // 选择地址弹窗调起
  handleSelectAddress(evt) {
    const addressType = evt?.currentTarget?.dataset?.type
    if (addressType == 'door') {
      // 取钥匙地址
      this.setData({
        c_address_type: addressType,
        c_select_address: true
      })
    }
    if (addressType == 'receiving') {
      this.setData({
        c_address_type: addressType,
        c_select_address: true
      })
    }
  },
  // 选择地址弹窗关闭
  handleHideSengKeyModal() {
    this.setData({
      c_select_address: false
    })
  },
  // 确认地址
  handleFormSubmit(evt) {
    const info = evt?.detail?.value
    const region = this.data.region
    if (this.data.c_address_type == 'door') {
      this.setData({
        g_door_address: `${info?.personName}  ${info?.mobile}  ${region?.join('')}${info?.bak}`
      }, () => {
        this.setData({
          c_select_address: false,
          region: []
        })
      })
    }
    if (this.data.c_address_type == 'receiving') {
      this.setData({
        g_receiving_address: `${info?.personName}  ${info?.mobile}  ${region?.join('')}${info?.bak}`
      }, () => {
        this.setData({
          c_select_address: false,
          region: []
        })
      })
    }

  },
  // 提交订单参数
  handleSubmit() {
    if (!isLogin()) {
      wx.navigateTo({
        url: '/pages/system/managerLoginView/loginView',
      });
      return;
    }
    const {
      inviteCode = null,           //邀请码
      g_industry = [],             // 行业选项列表
      g_industry_index = null,     // 当前选中的行业索引
      // 设备单价
      buycount = 0,                // 购买设备数量（默认为 0）
      g_install_index = null,      // 是否安装（true/false 或其他标识，建议后续明确类型）
      // 订单总价

      g_receiving_address = '',    // 客户收货地址（格式：姓名 手机号 详细地址）
      // 智信通地址
      // 客户上门取钥匙地址
      bak = ''                     // 备注信息
    } = this.data;

    // ========== 提取并处理关键字段 ==========

    // 1. 行业名称：根据选中索引从行业列表中获取
    const industry = g_industry_index !== null
      ? g_industry[g_industry_index]?.name?.trim() || null
      : null;



    // 4. 是否安装（直接使用原始值，建议后续明确其含义和类型）
    const isinstall = g_install_index;


    // 7. 解析收货地址（格式：姓名 手机 详细地址）
    const partsReceiving = g_receiving_address.trim().split(/\s+/);
    const takeperson = partsReceiving[0] || '';
    const takemobile = partsReceiving[1] || '';
    const takeaddress = partsReceiving.slice(2).join(' ') || '';


    // ========== 表单校验（使用提前 return 避免深层嵌套） ==========

    if (!industry) {
      showToast('请选择行业');
      return;
    }

    if (!g_receiving_address.trim()) {
      showToast('请输入客户收货地址（格式：姓名 手机 详细地址）');
      return;
    }



    // ========== 构造最终提交参数 ==========

    const submitParams = {
      industry,           // 行业
      isinstall,          // 是否安装
      buycount: Number(buycount) || 0, // 购买数量（转为数字）
      inviteCode,
      takeperson,         // 收货联系人
      takemobile,         // 收货电话
      takeaddress,        // 收货地址
      bak,                // 备注
    };
    console.log(submitParams)
    return
    // ========== 发送提交请求 ==========

    byPostJson(
      (getApp().data.k1swUrl || this.data.c_link) + u_buyDevice.URL,
      submitParams,
      (response) => {
        if (response.data?.code === 1000) {
          showToast(response.data?.msg || '提交成功');
          this.setData({
            inviteCode: null,
            buycount: null,
            g_page: 1,
            g_items: [],
            c_activeTab: 1, //当前页签值
            // 下单参数
            g_industry: [], //所属行业
            g_industry_index: null, //当前行业

            g_install_list: [{
              value: 0,
              name: '否'
            }, {
              value: 1,
              name: '是'
            }], // 是否安装
            g_install_index: 1,//是否安装当前选择
            c_address_type: '',// 地址选择类型
            c_select_address: false,//选择地址弹窗
            g_door_address: '',//上门地址
            g_receiving_address: '',//收货地址
            region: [],//地址 当前选择地区
            bak: '',//备注
          }, () => {
            this.getOrderList()
          })
        } else {
          showToast(response.data?.msg || '提交失败，请稍后重试');
        }
      }
    );
  },
  // 返回上一页面
  handleBackHome() {
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  // 获取当前登录状态
  initLoginStatus() {
    wx.getStorage({
      key: 'userKey', // 替换为你的缓存键值
      success: res => {
        this.setData({
          account: res?.data?.companyName || res?.data?.username
        })
      },
      fail(err) {
        console.error("获取失败", err); // 失败时的错误信息
      }
    });
  },
  onReady() {
    // 获取登录状态
    this.initLoginStatus()
  },
  onLoad(options) {
    wx.hideTabBar()
    getApp().data.funAreaId = '';
    // 获取底部导航数据
    this.initBottomDirectory()
    if (getApp()?.data?.userInfo?.token) {
      this.getOrderList()
    }
  },


  onShow() {
    this.initialiImageBaseConversion()
    this.initialiIndustry()
    this.initialDateTime()
    this.initSystemInfo()
  },
})