const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  u_scheduledCarList,
  u_scheduledCarApiDel,
  u_scheduledaddOrUpdate
} = require('../../../utils/request/order')
const {
  u_childUserList,
  u_delChildUser,
  u_getMenuTree
} = require('../../../utils/request/data_info')
const {
  byGet,
  byPost
} = require('../../../utils/request/http')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
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
    c_tabs: [{
        name: '车辆管控',
        value: '1'
      },
      {
        name: '新增管控',
        value: '2'
      }
    ], //tabs切换签
    c_activeTab: 1, // 默认选中的Tab索引
    days: [],
    params: {}, //新增管控数据部分字段
    starttime: '00:00', //开始管控时间
    endtime: "08:00", //结束管控时间
    allowuse: 1, //任务类型
    vehids: null, //车辆
    btnState: '新增',
    id: '', //修改标志
    tree: []
  },
  // 切换复选框状态
  handleCheck(e) {
    const id = e.currentTarget.dataset.id;
    const tree = this.data.tree;
    this.toggleCheck(tree, id);
    this.updateParentStates(tree);
    this.setData({
      tree: [...tree]
    });
  },

  // 切换展开状态
  toggleExpand(e) {
    const id = e.currentTarget.dataset.id;
    const tree = this.data.tree;
    this.toggleNodeExpand(tree, id);
    this.setData({
      tree: [...tree]
    });
  },

  // 递归切换节点展开状态
  toggleNodeExpand(nodes, targetId) {
    nodes.forEach(node => {
      if (node.id === targetId) {
        node.isExpanded = !node.isExpanded;
      } else if (node.children) {
        this.toggleNodeExpand(node.children, targetId);
      }
    });
  },

  // 递归切换选中状态
  toggleCheck(nodes, targetId) {
    nodes.forEach(node => {
      if (node.id === targetId) {
        node.checked = !node.checked;
        this.toggleChildren(node.children, node.checked);
      } else if (node.children) {
        this.toggleCheck(node.children, targetId);
      }
    });
  },

  // 切换子节点状态
  toggleChildren(children, checked) {
    if (!children) return;
    children.forEach(child => {
      child.checked = checked;
      this.toggleChildren(child.children, checked);
    });
  },

  // 更新所有父节点状态
  updateParentStates(nodes) {
    nodes.forEach(node => {
      if (node.children && node.children.length) {
        this.checkParentState(node);
        this.updateParentStates(node.children);
      }
    });
  },

  // 计算父节点状态
  checkParentState(node) {
    const children = node.children;
    const allChecked = children.every(child => child.checked);
    const someChecked = children.some(child => child.checked || child.indeterminate);
    node.checked = allChecked;
    node.indeterminate = !allChecked && someChecked;
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
    const param = {
      [u_childUserList.page]: this.data.g_page,
    };
    byGet(getApp().data.k1swUrl + u_childUserList.URL, param).then(response => {
      if (response.statusCode == 200) {
        if (this.data.g_page > 1 && response.data.content.length === 0) {
          showToast(`已加载全部数据：共${this.data.g_items.length}条`);
        }
        this.setData({
          g_items: this.data.g_items.concat(response.data.content),
          g_total: Number(response.data.count || 0).toLocaleString()
        }, () => {
          // hideLoading();
        });
      } else {
        showToast('请求失败，请稍后再试');
        hideLoading();
      }
    })
  },
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.initList();
    });
  },
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.initList();
    });
  },
  // 生成日期数据
  initDay() {
    const days = Array.from({
      length: 7
    }, (_, index) => {
      const value = (index + 1) % 7
      const labels = ['一', '二', '三', '四', '五', '六', '日']
      const label = `周${labels[index]}`
      return {
        label,
        value,
        active: false
      }
    })
    this.setData({
      days
    })
  },
  // 选择管控车辆
  handleCarList() {
    let temp = {
      title: this.data.title,
      params: this.data.params,
      starttime: this.data.starttime,
      endtime: this.data.endtime,
      allowuse: this.data.allowuse,
      dayofweek: this.data.days
        .filter(item => item.active)
        .map(item => item.value),
      days: this.data.days
    }
    wx.navigateTo({
      url: `/pages/carManager/carList/carList?source=/pages/blackTeche/timedVehicle/index&flagMulti=1&info=${JSON.stringify(temp)}`
    })
  },
  // 新增管控车辆字段输入回调
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
  // 设置开始管控时间
  handleBindStartTimeChange(e) {
    this.setData({
      starttime: e.detail.value
    });
  },
  // 设置结束管控时间
  hadnlebindEndTimeChange(e) {
    this.setData({
      endtime: e.detail.value
    });
  },
  // 任务类型单选切换
  handleToggleEnable(evt) {
    this.setData({
      allowuse: evt.detail.value
    })
  },
  // 生效日期选择
  handleToggleDay(e) {
    const dayValue = parseInt(e.currentTarget.dataset.day);
    const days = this.data.days.map(item => {
      if (item.value === dayValue) {
        return {
          ...item,
          active: !item.active
        };
      }
      return item;
    });
    this.setData({
      days
    });
  },
  // 提交管控数据
  handleSubmit() {

    return
    let temp = {
      id: this.data.id,
      title: this.data.title,
      ...this.data.params,
      starttime: this.data.starttime,
      endtime: this.data.endtime,
      allowuse: this.data.allowuse,
      vehids: this.data.vehids,
      dayofweek: this.data.days
        .filter(item => item.active)
        .map(item => item.value),

    }
    byPost(getApp().data.k1swUrl + u_scheduledaddOrUpdate.URL, temp, (response) => {
      console.log(response)
      this.setData({
        title: '',
        params: {},
        starttime: "00:00",
        endtime: "09:00",
        allowuse: 1,
        vehids: null,
        c_activeTab: 1,
        btnState: '新增',
        g_page: 1, //列表页码
        g_items: [],
      }, () => {
        this.initDay()
        this.initList()
      })

    });
  },
  // 修改管控
  handleEdit(evt) {
    const info = evt.currentTarget.dataset.item
    console.log(info)
    const dayofweek = info.dayofweek.split(",").map(Number);
    const days = this.data.days
    const newDays = days.map(day => ({
      ...day,
      active: Array.isArray(dayofweek) ?
        dayofweek.includes(day.value) : day.value === dayofweek
    }));
    this.setData({
      id: info?.id,
      c_activeTab: 2,
      btnState: '修改',
      ...info,
      days: newDays,
      params: {
        title: info.title,
        bak: info.bak
      }
    })
  },
  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    if (flag == '账号列表') {
      this.setData({
        c_activeTab: 1,
        btnState: '新增'
      })
    } else {
      this.setData({
        c_activeTab: 2,
      })
    }
  },


  // 删除列表数据
  handleDelete(evt) {
    const id = evt.currentTarget.dataset.item.id
    byPost(getApp().data.k1swUrl + u_scheduledCarApiDel.URL, {
      scheduledId: id
    }, (response) => {
      this.setData({
        g_page: 1, //列表页码
        g_items: [],
      }, () => {
        this.initList()
      })

    });
  },
  convertMenuData(originalData) {
    const convertNode = (node) => {
      if (node.isdelete === 1) return null;
      const converted = {
        id: node.id,
        name: node.name,
        checked: false,
        indeterminate: false,
        isExpanded: true,
        children: []
      };
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          const convertedChild = convertNode(child);
          if (convertedChild) {
            converted.children.push(convertedChild);
          }
        });
      }
      return converted;
    }
    const result = [{
      id: 1,
      name: '全部',
      checked: false,
      indeterminate: false,
      isExpanded: true,
      children: []
    }];
    originalData.forEach(item => {
      if (item.parentid === -1 && item.isdelete === 0) {
        const converted = convertNode(item);
        if (converted) {
          result[0].children.push(converted);
        }
      }
    });

    return result;
  },
  // 获取权限树数据
  inittMenuTree() {
    byGet(getApp().data.k1swUrl + u_getMenuTree.URL, {}).then(response => {
      if (response.statusCode == 200) {
        const list = response.data.content
        const convertedData = this.convertMenuData(list);
        this.setData({
          tree: convertedData
        })
      } else {
        showToast('请求失败，请稍后再试');
        hideLoading();
      }
    })
  },
  onLoad(options) {
    if (options.black) {
      console.log(JSON.parse(options.info))
      this.setData({
        ...JSON.parse(options.info),
        days: JSON.parse(options.info)?.days,
        vehids: options.black,
        platenumbers: options.platenumbers,
        c_activeTab: 2
      })
    } else {
      this.initDay()
    }
    this.initList()

    this.inittMenuTree()
  },
  onShow() {
    this.initialiImageBaseConversion()

  },
})