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
  u_buyDevice,
  u_buyRecord,
  u_getIndustry,
  u_getIntroduction,
  u_isNeedCarInfo,
  u_getDeviceClass
} = require('../../utils/request/data_info')
const {
  byGet,
  byPost, byPostJson
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
    c_activeTab: 1, //当前页签值
    // 下单参数
    g_core_functions: [], //所属功能
    g_core_functions_index: null, //当前功能
    g_core_functions_active: [],//当前所选功能
    g_core_type: [],// 设备类型
    g_core_type_index: null,// 当前选择设备类型
    g_industry: [], //所属行业
    g_industry_index: null, //当前行业
    whether_vehicle: false, //是否需要上次车辆信息
    tabs: [{
      id: 0,
      title: '车型1',
    }],
    currentIndex: 0,
    scrollLeft: 0,
    params: {},
    g_install_list: [{
      value: 0,
      name: '否'
    }, {
      value: 1,
      name: '是'
    }], // 是否安装
    g_install_index: 1,
    date: '2025-10-11',//上门取钥匙日期
    time: '18:30',//上门取钥匙时间
    c_address_type: '',// 地址选择类型
    c_select_address: false,//选择地址弹窗
    g_door_address: '',//上门地址
    g_receiving_address: '',//收货地址
    region: [],//地址 当前选择地区
    bak: '',//备注
  },
  bindDateChange(e) {
    this.setData({ date: e.detail.value });
  },
  bindTimeChange(e) {
    this.setData({ time: e.detail.value });
  },
  bindRegionChange(e) {
    this.setData({
      region: e.detail.value
    })
  },
  // 初始化当前时间
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
  // 行业数据
  initialiIndustry() {
    byGet(getApp().data.k1swUrl + u_getIndustry.URL, {}).then(response => {
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
  // 功能数据
  initialgetIntroduction() {
    byGet(getApp().data.k1swUrl + u_getIntroduction.URL, {}).then(response => {
      const list = response.data.content
      const simple_info = list.map(ele => {
        let simple_temp = {
          id: ele?.id,
          name: ele?.funname,
          state: false
        }
        return simple_temp
      })
      this.setData({
        g_core_functions: simple_info
      })
    })
  },
  // 获取设备类型数据
  initialgetType() {
    byGet(getApp().data.k1swUrl + u_getDeviceClass.URL, {}).then(response => {
      const list = response.data.content
      console.log(list)
      const simple_info = list.map(ele => {
        let simple_temp = {
          id: ele?.id,
          name: ele?.funname,
          state: false,
          ...ele
        }
        return simple_temp
      })
      this.setData({
        g_core_type: simple_info
      })
    })
  },
  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    if (flag == '采购订单') {
      this.setData({
        c_activeTab: 1,
      })
    } else {
      this.setData({
        c_activeTab: 2,
      })
    }
  },
  // 查询列表
  getOrderList() {
    showLoading("加载中...");
    const param = {
      // [u_buyRecord.days]: this.data.g_days,
      // [u_buyRecord.orderTypes]: this.data.g_orderTypes,
      // [u_buyRecord.status]: this.data.g_status,
      // [u_buyRecord.comParam]: this.data.g_comParam,
      [u_buyRecord.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_buyRecord.URL, param).then(response => {
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
  // 所属行业变化回到
  handleIndustryType(evt) {
    this.setData({
      g_industry_index: evt.detail.value
    }, () => {
      this.handleCalculate()
    })
  },
  // 所属功能之后回调
  handleFunction(evt) {
    const index = 1; // 1为单选 2为多选
    const item = evt?.currentTarget?.dataset?.item;
    if (!item?.id) return;
    const { g_core_functions_active = [], g_core_functions = [] } = this.data;
    const targetId = item.id;
    const updatedActive = index === 1
      ? [item]
      : g_core_functions_active.some(i => i?.id === targetId)
        ? g_core_functions_active.filter(i => i?.id !== targetId)
        : [...g_core_functions_active, item];
    const updatedFunctions = g_core_functions.map(func => {
      if (index === 1) {
        return { ...func, state: func.id === targetId };
      } else {
        return func.id === targetId
          ? { ...func, state: !g_core_functions_active.some(i => i?.id === func.id) }
          : func;
      }
    });
    this.setData({
      g_core_functions_active: updatedActive,
      g_core_functions: updatedFunctions
    });
  },
  // 所属设备类型回调
  handleEquipmentType(evt) {
    const item = evt?.currentTarget?.dataset?.item
    console.log(item)
    this.setData({
      g_core_type_index: item
    })
  },
  // 操作行业或功能数据后的回调
  handleCalculate() {
    const {
      g_core_functions_index,
      g_industry_index,
      g_industry,
      g_core_functions
    } = this.data
    if (g_industry_index == null || g_core_functions_index == null) return
    const parmas = {
      introduction: g_core_functions[g_core_functions_index]?.name,
      industry: g_industry[g_industry_index]?.name
    }
    byGet(getApp().data.k1swUrl + u_isNeedCarInfo.URL, parmas).then(response => {
      const state = response.data.content
      this.setData({
        whether_vehicle: state
      })
    })
  },
  // 切换tab
  handleSwitchVicheTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentIndex: index
    })
  },
  // 添加tab
  hadnleAddTab() {
    const newTabs = this.data.tabs
    const newId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id + 1 : 0

    newTabs.push({
      id: newId,
      title: `车型 ${newId + 1}`,
    })

    this.setData({
      tabs: newTabs,
      currentIndex: newTabs.length - 1,
      scrollLeft: 10000 // 滚动到最右边
    })
  },
  // 删除tab
  hadnleCloseTab(e) {
    if (this.data.tabs.length === 1) return

    const id = e.currentTarget.dataset.id
    const newTabs = this.data.tabs.filter(tab => tab.id !== id)
    const newIndex = Math.min(this.data.currentIndex, newTabs.length - 1)

    this.setData({
      tabs: newTabs,
      currentIndex: newIndex
    }, () => {
      this.setData({
        buycount: this.data.tabs.length
      })
    })
  },
  // 输入框内容改变回调
  handleBindinput(evt) {
    const params = this.data?.params
    params[evt.currentTarget.dataset.item] = evt.detail.value
    this.setData({
      params: {
        ...params
      }
    }, () => {
      this.setData({
        buycount: this.data.tabs.length
      })
    })
  },
  // 启动方式
  handleBatterylift(evt) {
    const params = this.data?.params
    params['runtype' + evt?.currentTarget.dataset.id] = evt.currentTarget.dataset.item
    this.setData({
      params: {
        ...params
      }
    })
  },
  // 数量改变
  handleNumBindinput(evt) {
    this.setData({
      buycount: evt.detail.value
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
      g_industry_index: evt.detail.value
    })
  },
  // 跳转到详情
  handleView(evt) {
    wx.navigateTo({
      url: '/pages/orderList/orderDetails/orderDetails?info=' + JSON.stringify(evt.currentTarget.dataset.item),
    })
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
  // 提交参数
  /**
 * 提交表单数据
 * 
 * 从 this.data 中提取用户输入和选择的数据，进行必要校验后，构造提交参数并发送请求。
 */
  handleSubmit() {
    const {
      buycount = 0,                // 购买设备数量（默认为 0）
      params = {},                 // 动态表单字段（如车辆信息等）
      g_core_functions = [],       // 所有可选功能列表，state 为 true 表示已选中
      g_industry = [],             // 行业选项列表
      g_industry_index = null,     // 当前选中的行业索引
      g_install_index = null,      // 是否安装（true/false 或其他标识，建议后续明确类型）
      g_core_type_index = null,    // 当前选中的设备类型对象（含 isneedcar 等属性）
      g_door_address = '',         // 上门取钥匙地址（格式：姓名 手机号 详细地址）
      g_receiving_address = '',    // 客户收货地址（格式：姓名 手机号 详细地址）
      date = '',                   // 预约日期
      time = '',                   // 预约时间
      bak = ''                     // 备注信息
    } = this.data;

    // ========== 提取并处理关键字段 ==========

    // 1. 行业名称：根据选中索引从行业列表中获取
    const industry = g_industry_index !== null
      ? g_industry[g_industry_index]?.name?.trim() || null
      : null;

    // 2. 设备功能：筛选出 state 为 true 的功能项，提取名称并拼接为 "||" 分隔的字符串
    const devicefun = g_core_functions
      .filter(item => item?.state === true)
      .map(item => item?.name?.trim())
      .filter(name => name) // 过滤空字符串
      .join('||');

    // 3. 设备类型名称（注意：g_core_type_index 是对象，不是索引）
    const deviceclass = g_core_type_index?.name || null;

    // 4. 是否安装（直接使用原始值，建议后续明确其含义和类型）
    const isinstall = g_install_index;

    // 5. 解析上门地址（格式：姓名 手机 详细地址）
    const partsDoor = g_door_address.trim().split(/\s+/);
    const pickperson = partsDoor[0] || '';
    const pickmobile = partsDoor[1] || '';
    const pickaddress = partsDoor.slice(2).join(' ') || '';

    // 6. 拼接预约时间
    const picktime = `${date} ${time}`.trim();

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

    if (!devicefun) {
      showToast('请选择至少一个功能');
      return;
    }

    if (!deviceclass) {
      showToast('请选择设备类型');
      return;
    }

    if (!g_door_address.trim()) {
      showToast('请输入上门取钥匙地址（格式：姓名 手机 详细地址）');
      return;
    }

    if (!g_receiving_address.trim()) {
      showToast('请输入客户收货地址（格式：姓名 手机 详细地址）');
      return;
    }

    // ========== 处理动态车辆信息（如果设备类型需要车辆信息） ==========

    // 正则用于匹配字段名，如 carmodel1, carserial2 等
    const CAR_FIELD_PATTERN = /^(\D+)(\d+)$/;

    // 从 params 中提取所有车辆索引（如 1, 2, 3...）
    const paramKeys = Object.keys(params);
    const carIndices = new Set(
      paramKeys
        .map(key => {
          const match = key.match(CAR_FIELD_PATTERN);
          return match ? parseInt(match[2], 10) : null;
        })
        .filter(index => index !== null)
    );

    // 如果设备类型要求提供车辆信息，但未填写任何车辆字段
    if (g_core_type_index?.isneedcar && carIndices.size === 0) {
      showToast('请至少填写一辆车的信息');
      return;
    }

    // 构建结构化的车辆列表：carList = [{ carmodel, carserial, runtype, ... }, ...]
    const carList = [];
    Array.from(carIndices)
      .sort((a, b) => a - b) // 按索引升序排列，保证顺序
      .forEach(index => {
        const carItem = {};
        paramKeys.forEach(key => {
          // 动态匹配字段，如 carmodel1 → 字段名 "carmodel"，值为 params[key]
          const regex = new RegExp(`^(.+?)${index}$`);
          const match = key.match(regex);
          if (match) {
            const fieldName = match[1];
            carItem[fieldName] = (params[key] || '').trim();
          }
        });
        carList.push(carItem);
      });

    // 校验每辆车的关键字段是否完整
    for (const car of carList) {
      if (!car.carmodel?.trim() || !car.carserial?.trim() || !car.runtype?.trim()) {
        // 尝试显示更友好的提示（若车型为空，则用“该车辆”代替）
        const modelName = car.carmodel?.trim() || '该车辆';
        showToast(`请补全【${modelName}】的车型、车架号和运营类型`);
        return;
      }
    }

    // ========== 构造最终提交参数 ==========

    const submitParams = {
      industry,           // 行业
      devicefun,          // 功能（"||" 分隔）
      deviceclass,        // 设备类型
      isinstall,          // 是否安装
      buycount: Number(buycount) || 0, // 购买数量（转为数字）
      pickperson,         // 上门联系人
      pickmobile,         // 上门联系电话
      pickaddress,        // 上门地址
      picktime,           // 预约时间
      takeperson,         // 收货联系人
      takemobile,         // 收货电话
      takeaddress,        // 收货地址
      bak,                // 备注
      carList: g_core_type_index?.isneedcar ? carList : [] // 仅当需要时提交车辆信息
    };

    // ========== 发送提交请求 ==========

    byPostJson(
      getApp().data.k1swUrl + u_buyDevice.URL,
      submitParams,
      (response) => {
        if (response.data?.code === 1000) {
          showToast(response.data?.msg || '提交成功');
          wx.navigateBack({ delta: 1 }); // 返回上一页
        } else {
          showToast(response.data?.msg || '提交失败，请稍后重试');
        }
      }
    );
  },
  // handleSubmit() {
  //   const {
  //     buycount = 0,//设备数量
  //     params = {},
  //     g_core_functions = [],       // 所属功能，state 为 true 表示选中
  //     g_industry = [],             // 所有行业集合
  //     g_industry_index = null,     // 当前选中行业索引
  //     g_install_index = null,      // 是否安装（建议明确默认值）
  //     g_core_type_index = null,    // 当前选中设备类型索引
  //     g_door_address,//上门地址
  //     g_receiving_address,//收货地址
  //     date,
  //     time,
  //     bak
  //   } = this.data;

  //   // 获取选中的行业名称
  //   const industry = g_industry_index != null ? g_industry[g_industry_index]?.name?.trim() : null;
  //   // 获取选中的功能
  //   const devicefun = g_core_functions
  //     .filter(item => item?.state === true)
  //     .map(item => item?.name?.trim())
  //     .filter(name => name)
  //     .join('||');
  //   // 获取设备类型名称
  //   const deviceclass = g_core_type_index?.name;
  //   // 获取是否安装
  //   const isinstall = g_install_index;
  //   //  上门地址
  //   const parts_door = g_door_address.trim().split(/\s+/);
  //   const pickperson = parts_door?.[0];
  //   const pickmobile = parts_door?.[1];
  //   const pickaddress = parts_door?.slice(2)?.join(' ');
  //   const picktime = `${date} ${time}`
  //   // 收货地址
  //   const parts_receiving = g_receiving_address.trim().split(/\s+/);
  //   const takeperson = parts_receiving?.[0];
  //   const takemobile = parts_receiving?.[1];
  //   const takeaddress = parts_receiving?.slice(2)?.join(' ');
  //   // 校验逻辑：使用提前 return，避免嵌套
  //   if (!industry) {
  //     showToast('请选择行业');
  //     return;
  //   }
  //   if (!devicefun) {
  //     showToast('请选择功能');
  //     return;
  //   }
  //   if (!deviceclass) {
  //     showToast('请选择设备类型');
  //     return;
  //   }
  //   if (!g_door_address) {
  //     showToast('请输入上门取钥匙地址');
  //     return;
  //   }
  //   if (!g_receiving_address) {
  //     showToast('请输入客户收货地址');
  //     return;
  //   }

  //   const CAR_FIELD_PATTERN = /^(\D+)(\d+)$/;
  //   const paramKeys = Object.keys(params);
  //   const carIndices = new Set(paramKeys.map(key => {
  //     const match = key.match(CAR_FIELD_PATTERN);
  //     return match ? parseInt(match[2], 10) : null;
  //   }).filter(index => index !== null));


  //   if (g_core_type_index?.isneedcar && carIndices.size === 0) {
  //     showToast('列表数据不得为空');
  //     return;
  //   }
  //   const carList = [];
  //   Array.from(carIndices).sort((a, b) => a - b).forEach(index => {
  //     const carItem = {};
  //     paramKeys.forEach(key => {
  //       const match = key.match(new RegExp(`^(.+?)${index}$`));
  //       if (match) {
  //         const fieldName = match[1];
  //         const value = params[key]?.trim() || '';
  //         carItem[fieldName] = value;
  //       }
  //     });
  //     carList.push(carItem)
  //   });
  //   for (let i = 0; i < carList.length; i++) {
  //     const car = carList[i];
  //     if (!car.carmodel?.trim() || !car.carserial?.trim() || !car.runtype?.trim()) {
  //       showToast(`请补全${car.carmodel}的信息`);
  //       return false;
  //     }
  //   }
  //   const submitParams = {
  //     industry,//行业
  //     devicefun,//功能
  //     deviceclass,//设备类型
  //     isinstall,//是否安装
  //     buycount: Number(buycount),//数量
  //     pickperson,
  //     pickmobile,
  //     pickaddress,
  //     picktime,
  //     takeperson,
  //     takemobile,
  //     takeaddress,
  //     bak,
  //     carList: g_core_type_index?.isneedcar ? carList?.map(item => ({
  //       ...item,
  //     })) : [],
  //   };
  //   byPostJson(
  //     getApp().data.k1swUrl + u_buyDevice.URL,
  //     submitParams,
  //     (response) => {
  //       if (response.data?.code == 1000) {
  //         wx.navigateBack({
  //           delta: 1
  //         });
  //         showToast(response.data?.msg || '提交成功');
  //       } else {
  //         showToast(response.data?.msg || '服务器返回未知错误');
  //       }
  //     }
  //   );

  // },
  onLoad(options) {
    this.getOrderList()
  },

  onReady() { },

  onShow() {
    this.initialiImageBaseConversion()
    this.initialiIndustry()
    this.initialgetIntroduction()
    this.initialgetType()
    this.initialDateTime()
  },
})