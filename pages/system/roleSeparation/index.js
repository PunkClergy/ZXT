const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  u_roleapidel,
  u_getMenuTree,
  u_roleapiaddOrUpdate,
  u_childUserList,
  u_setMenuTree,
  u_GetRole, u_addOrUpdateChildUser
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
    c_activeTab: 1, // 默认选中的Tab索引
    params: {}, //新增管控数据部分字段
    btnState: '新增',
    id: '', //修改标志
    tree: [],
    c_send_key_show_momal: false,
    g_uesr_details: {},
    user_text: '新增',

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
  // 下拉刷新
  handleRefresh() {
    this.setData({
      g_page: 1,
      g_items: [],
    }, () => {
      this.initList();
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
  // 人员列表
  initList() {
    console.log(this.data.id)
    byGet(`${getApp().data.k1swUrl}${u_childUserList.URL}`, { roleId: this.data.id }).then(response => {
      if (response.data.code == 1000) {
        this.setData({
          g_items: response.data.content,
          g_total: Number(response.data.count || 0).toLocaleString()
        });
      }
    })
    return
  },

  // 新增账号字段输入回调
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
  //  处理提交的权限树数据
  getCheckedIds(treeData) {
    const checkedIds = [];

    function traverse(nodes) {
      nodes.forEach(node => {
        if (node.checked === true) {
          checkedIds.push(node.id);
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    }
    traverse(treeData);
    return checkedIds;
  },
  // 设置权限
  handleSetMenuTree(evt) {
    const checkedIds = this.getCheckedIds(this.data.tree).toString();
    const params = {
      [u_setMenuTree.roleId]: evt,
      [u_setMenuTree.menuIds]: checkedIds
    }
    byPost(
      `${getApp().data.k1swUrl}${u_setMenuTree.URL}`, params,
      (response) => {
        if (response.data.code == 1000) {

        }
      },
      (error) => { }
    );
  },
  //提交内容
  handleSubmit() {

    const {
      id
    } = this.data;

    const checkedIds = this.getCheckedIds(this.data.tree).toString();
    const params = {
      [u_setMenuTree.roleId]: id,
      [u_setMenuTree.menuIds]: checkedIds
    }
    console.log(params, id)
    byPost(
      `${getApp().data.k1swUrl}${u_setMenuTree.URL}`, params,
      (response) => {
        if (response.data.code == 1000) {
          
        }
      },
      (error) => { }
    );
  },
  // 修改管控
  handleEdit(evt) {
    console.log(evt.currentTarget.dataset.item)
    const info = evt.currentTarget.dataset.item
    console.log(info)
    this.setData({
      c_send_key_show_momal: true,
      g_uesr_details: info,
      user_text: '修改'
    })
  },
  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    if (flag == '人员列表') {
      this.setData({
        c_activeTab: 1,
        btnState: '新增',
        params: {},
        id: ''
      })
    }
    if (flag == '权限管理') {
      if (this.data.c_activeTab != 2) {
        this.setData({
          c_activeTab: 2,
        }, () => {
          this.inittMenuTree()
        })
      }
    }
  },

  // 删除列表数据
  handleDelete(evt) {
    const _this = this
    const id = evt?.currentTarget.dataset.id
    const params = {
      [u_roleapidel.id]: id
    }
    byGet(`${getApp().data.k1swUrl}${u_roleapidel.URL}`, params).then(allRes => {
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
  // 处理权限数据
  convertMenuData(originalData) {
    const convertNode = (node) => {
      // if (node.isdelete === 1) return null;
      const converted = {
        id: node.id,
        name: node.name,
        checked: node?.checked,
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
    byGet(getApp().data.k1swUrl + u_getMenuTree.URL, {
      roleId: this.data.id || ''
    }).then(response => {
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
  // 新增人员
  handleJumpInfo() {
    this.setData({
      c_send_key_show_momal: true
    })
  },
  // 取消弹窗
  handleHideSengKeyModal() {
    this.setData({
      c_send_key_show_momal: false,
      user_text: '新增',
      g_uesr_details: {}
    })
  },

  // 获取角色列表
  initGetRole(evt) {
    console.log(evt)
    byGet(`${getApp().data.k1swUrl}${u_GetRole.URL}`, { roleName: evt, isAutoCreate: 1 }).then(response => {
      if (response.data.code == 1000) {

        this.setData({
          id: response.data.content.id
        }, () => {
          this.inittMenuTree()
          this.initList()
        })
      }
    })
  },
  // 确认新增
  handleFormSubmit(evt) {
    console.log(evt.detail.value)
    const params = {
      roleId: this.data.id,
      ...evt.detail.value,
      id: this.data?.g_uesr_details?.id || ''
    }
    byPost(
      `${getApp().data.k1swUrl}${u_addOrUpdateChildUser.URL}`, params,
      (response) => {
        console.log(response)
        if (response.data.code == 1000) {
          this.setData({ c_send_key_show_momal: false }, () => {
            this.initList()
          })
        } else {
          showToast(response?.data.msg)
        }
      },
      (error) => { }
    );
  },
  onLoad(options) {
    if (options.type) {
      this.setData({
        title_info: {
          name: options?.name,
          type: options?.type
        }
      })
    }
    if (options?.name) {
      this.initGetRole(options?.name || '车务人员')
    } else {
      this.initGetRole(options?.name || '车务人员')
    }
  },
  onShow() {
    this.initialiImageBaseConversion()

  },
})