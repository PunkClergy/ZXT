const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  u_childUserList,
  u_delChildUser,
  u_getMenuTree,
  u_roleapiList,
  u_addOrUpdateChildUser
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
        name: '账号列表',
        value: '1'
      },
      {
        name: '新增账号',
        value: '2'
      }
    ], //tabs切换签
    c_activeTab: 1, // 默认选中的Tab索引
    params: {}, //新增管控数据部分字段
    btnState: '新增',
    g_roleList: [],
    g_roleList_index: null,
    id: '', //修改标志
  },


  // 所属行业变化回到
  handleIndustryType(evt) {
    this.setData({
      g_roleList_index: evt.detail.value
    })
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
          hideLoading();
        });
      } else {
        showToast('请求失败，请稍后再试');
        hideLoading();
      }
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
      g_items: []
    }, () => {
      this.initList();
    });
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

  //提交内容
  handleSubmit() {
    const {
      params,
      id,
      g_roleList,
      g_roleList_index,
    } = this.data;
    const requiredFields = [{
        key: 'username',
        message: '请输入账号'
      },
      {
        key: 'realname',
        message: '请输入姓名'
      },
      {
        key: 'password',
        message: '请输入密码'
      },
      {
        key: 'mobile',
        message: '请输入手机号'
      }
    ];

    // 检查必填字段
    for (const {
        key,
        message
      } of requiredFields) {
      if (!params?.[key]) {
        showToast(message);
        return;
      }
    }
    if (g_roleList_index == null) {
      showToast('请选择角色');
      return
    }

    // 验证用户名长度
    if (params.username.length < 6) {
      showToast('账号不能小于6位');
      return;
    }

    // 验证手机号长度
    if (params.mobile.length !== 11) {
      showToast('手机号必须是11位');
      return;
    }

    showLoading();
    byPost(
      `${getApp().data.k1swUrl}${u_addOrUpdateChildUser.URL}`, {
        ...params,
        id,
        roleId: g_roleList[g_roleList_index]?.id
      },
      (response) => {
        hideLoading()
        if (response?.data?.code != 1000) {
          showToast(response?.data?.msg);
          return;
        }
        showToast('添加成功');
        this.setData({
          c_activeTab: 1,
          params: {},
          btnState: '新增',
          g_triggered: false,
          g_page: 1,
          g_items: []
        }, () => {
          this.initList()
        })
      },
      (error) => {
        hideLoading();
        showToast('提交失败，请稍后重试');
      }
    );
  },
  initRole() {
    byPost(
      `${getApp().data.k1swUrl}${u_roleapiList.URL}`, {},
      (response) => {
        console.log(response)
        this.setData({
          g_roleList: response.data.content
        })
      },
      (error) => {
        hideLoading();
      }
    );
  },
  // 修改管控
  handleEdit(evt) {
    const info = evt.currentTarget.dataset.item
    this.setData({
      ...info,
      c_activeTab: 2,
      btnState: '修改',
      id: info?.id,
      params: {
        password: info.password,
        username: info.username,
        realname: info.realname,
        mobile: info.mobile,
      }
    }, () => {
      const index = this.data.g_roleList.findIndex(item => item.id === info?.roleId);
      this.setData({
        g_roleList_index: index
      })
    })
  },
  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    console.log(flag)
    if (flag == '人员列表') {
      this.setData({
        c_activeTab: 1,
        btnState: '新增'
      })
    }
    if (flag == '新增人员' || flag == '修改人员') {
      if (this.data.c_activeTab != 2) {
        this.setData({
          c_activeTab: 2,
        }, () => {
          this.initRole()
        })
      }
    }
  },
  // 删除列表数据
  handleDelete(evt) {
    const _this = this
    const id = evt?.currentTarget.dataset.id
    const params = {
      [u_delChildUser.id]: id
    }
    byGet(`${getApp().data.k1swUrl}${u_delChildUser.URL}`, params).then(allRes => {
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
    if (options.status) {
      this.setData({
        c_activeTab: 2
      })
    }
    this.initList()
  },
  onShow() {
    this.initialiImageBaseConversion()
    this.initRole()
  },
})