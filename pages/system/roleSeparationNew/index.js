const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  u_delChildUser,
  u_childUserList,
  u_addOrUpdateChildUser,
  u_roleapiList,
} = require('../../../utils/request/data_info')
const {
  byGet,
  byPost
} = require('../../../utils/request/http')
const {
  showToast
} = require('../../../utils/Inspect/tips')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_page: 1, //列表页码
    g_items: [], //列表数据
    g_triggered: false, //下拉刷新状态
    c_activeTab: 1, // 默认选中的Tab索引
    params: {}, //新增管控数据部分字段
    btnState: '新增',
    id: '', //修改标志
    c_send_key_show_momal: false,
    g_uesr_details: {},
    user_text: '新增',
    new_role: {}
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

  // 全屏背景图
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
  // 人员列表
  initList() {
    byGet(`${getApp().data.k1swUrl}${u_childUserList.URL}`, {}).then(response => {
      if (response.data.code == 1000) {
        this.setData({
          g_items: response.data.content,
          g_total: Number(response.data.count || 0).toLocaleString()
        });
      }
    })
    return
  },

  // 修改人员
  handleEdit(evt) {
    const info = evt.currentTarget.dataset.item
    this.setData({
      c_send_key_show_momal: true,
      g_uesr_details: info,
      user_text: '修改',
      new_role: {
        id: info?.roleId,
        name: info?.roleName
      }
    })
  },

  // 删除列表数据
  handleDelete(evt) {
    const _this = this
    const id = evt?.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确认删除当前人员吗？',
      complete: (res) => {
        if (res.confirm) {
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
        }
      }
    })

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

  // 新增人员
  handleJumpInfo() {
    this.setData({
      c_send_key_show_momal: true,
    })
  },
  // 取消弹窗
  handleHideSengKeyModal() {
    this.setData({
      c_send_key_show_momal: false,
      user_text: '新增',
      g_uesr_details: {},
      new_role: {}
    })
  },
  // 提交用户数据的统一方法
  submitUserUpdate(params, successCallback = () => { }) {
    const url = `${getApp().data.k1swUrl}${u_addOrUpdateChildUser.URL}`;

    // 参数基础校验
    if (!params.realname && !this.data.new_role?.id) {
      showToast('用户信息不完整，无法保存');
      return;
    }

    byPost(
      url,
      params,
      (response) => {
        if (response?.data?.code === 1000) {
          // 成功回调
          successCallback(response);
        } else {
          const msg = response?.data?.msg || '操作失败，请重试';
          showToast(msg);
        }
      },
      (error) => {
        console.error('[User Update Error]', error);
        showToast('网络请求失败，请检查连接');
      }
    );
  },

  // 表单提交：新增或编辑用户
  handleFormSubmit(evt) {
    const formData = evt.detail.value;

    console.log('[Form Data]', formData);

    const params = {
      ...formData,
      id: this.data.g_uesr_details?.id || '', // 注意：字段名疑似拼写错误，应为 user_details？
      roleId: this.data.new_role?.id
    };

    // 调用统一提交方法
    this.submitUserUpdate(params, () => {
      this.setData({
        c_send_key_show_momal: false,
        g_uesr_details: {},
        new_role: {}
      }, () => {
        this.initList();
      });
    });
  },

  // 选择角色时更新用户角色
  handleBindPickerChange(evt) {
    const user = evt.currentTarget.dataset.item;
    const roleIndex = evt.detail.value;
    const role = this.data.roleArray[roleIndex];

    if (!role) {
      showToast('请选择有效的角色');
      return;
    }
    console.log(role)
    this.setData({
      new_role: role
    })
    // const params = {
    //   id: user.id,
    //   roleId: role.id,
    //   username: user.username,
    //   realname: user.realname,
    //   mobile: user.mobile,
    //   password: user.password // 注意：是否需要传密码？根据后端要求决定
    // };

    // 调用统一提交方法
    // this.submitUserUpdate(params, () => {
    //   this.setData({
    //     c_send_key_show_momal: false
    //   }, () => {
    //     this.initList();
    //   });
    // });
  },
  // 请求角色列表
  handleRole() {
    const param = {};
    byPost(
      `${getApp().data.k1swUrl}${u_roleapiList.URL}`, param,
      (response) => {
        if (response.data.code == 1000) {
          this.setData({
            roleArray: response.data.content,
          });
        }
      }
    );

  },
  onLoad(options) {
    this.initList()
  },
  onShow() {
    this.initialiImageBaseConversion()
    this.handleRole()
  },
})