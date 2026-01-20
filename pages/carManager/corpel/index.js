const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  u_vehBindCarManager,
  u_carManagerapi_del
} = require('../../../utils/request/car')
const {
  byPost,
  byGet
} = require('../../../utils/request/http')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
const {
  u_GetRole, u_carManagerList, u_vehUnBindCarManager
} = require('../../../utils/request/data_info')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 70, // 搜索框高度，默认值
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_page: 1, //当前页码
    g_comParam: '', //输入框内容
    g_items: [], //列表数据
    g_triggered: false, //下拉刷新是否开启
    g_total: 0, //列表总数
    type: 1,
    roleName: ''
  },

  onLoad: function (options) {
    if (!options?.type) {
      this.setData({
        type: 0,
        title_name: options?.name
      })
    } else {
      this.setData({
        title_name: options?.name
      })
    }
    this.initCarryParams(options)
  },
  onShow() {
    if (this.data.roleName) {
      this.initGetRole({ name: this.data.roleName })
    }
  },
  onReady: function () {
    this.initialiImageBaseConversion()
  },
  // 解绑车辆
  handleUnbind(e) {
    wx.showModal({
      title: '重要提示',
      content: '确定要解绑吗？',
      confirmText: '解绑',
      confirmColor: '#d9534f',
      success: ({ confirm, cancel }) => {
        if (confirm) {
          const all = e?.currentTarget?.dataset?.all
          const flag = e?.currentTarget?.dataset?.item
          const userId = e?.currentTarget?.dataset?.id

          const vehIds = all ? flag?.map(ele => {
            return ele?.id
          }).join(',') : flag?.id

          let param = {
            userId: userId,
            vehIds: vehIds
          }
          byPost(`${getApp().data.k1swUrl}${u_vehUnBindCarManager.URL}`, param,
            (response) => {
              if (response.data.code == 1000) {
                showToast(response?.data?.msg)
                this.initGetRole({ name: this.data.roleName })
              } else {
                showToast(response?.data?.msg)
              }
            });
        }
      }
    })
  },
  // 获取角色列表
  initGetRole(evt) {
    byGet(`${getApp().data.k1swUrl}${u_GetRole.URL}`, { roleName: evt?.name || "", isAutoCreate: 1 }).then(response => {
      if (response.data.code == 1000) {
        this.setData({
          id: response.data.content.id,
          roleName: evt?.name || ''
        }, () => {
          this.getCarList()
        })
      }
    })
  },
  initCarryParams(evt) {
    console.log(evt)
    if (evt?.info && evt?.black) {
      let param = {
        userId: JSON.parse(evt?.info)?.id,
        vehIds: evt?.black
      }
      // 开始执行绑定，然后刷新当前页面
      byPost(`${getApp().data.k1swUrl}${u_vehBindCarManager.URL}`, param,
        (response) => {
          if (response.data.code == 1000) {
            this.setData({
              g_items: [],
              g_page: 1,
              type: 1,
            }, () => {
              this.initGetRole(evt)
            })
            showToast(response.data.msg)
          } else {
            showToast(response.data.msg)
          }

        });
    } else { this.initGetRole(evt) }
  },
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
  getCarList(evt) {
    console.log(evt)
    byGet(`${getApp().data.k1swUrl}${u_carManagerList.URL}`, { roleId: this.data.id }).then(response => {
      if (response.data.code == 1000) {
        this.setData({
          g_items: response.data.content,
          g_total: Number(response.data.count || 0).toLocaleString()
        });
      }
    })
  },
  handleLower() {
    this.setData({
      g_page: this.data.g_page + 1
    }, () => {
      this.getCarList();
    });
  },
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => {
      this.getCarList();
    });
  },
  handleSelectJump(evt) {
    let temp = {
      id: evt?.currentTarget?.dataset?.item?.id,
    }
    wx.navigateTo({
      url: `/pages/carManager/carList/carList?source=/pages/carManager/corpel/index&flagMulti=1&info=${JSON.stringify(temp)}&type=${this.data.type}&name=${this.data.title_name}&desc=${JSON.stringify(evt?.currentTarget?.dataset?.item)}`
    })
  },
  handleBlur(e) {
    const resp = e.detail.value
    if (resp == this.data.g_comParam) {
      return
    }
    this.setData({
      g_comParam: e.detail.value,
      g_page: 1,
      g_items: []
    }, () => {
      this.getCarList();
    })
  },
  handleJumpBack() {
    wx.navigateBack({
      delta: 1,
    });
  },
  handleJumpInfo() {
    wx.navigateTo({
      url: `/pages/system/roleSeparation/index?type=${this.data.id}&name=${this.data.roleName}`,
    })
  },
  handleView(evt) {
    const item = evt.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/carManager/carListAdd/index?flag=' + 'see&item=' + JSON.stringify(item),
    })
  },
  handleEdit(evt) {
    const item = evt.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/carManager/corpelAdd/index?flag=' + 'edit&item=' + JSON.stringify(item),
    })
  },
  // 删除
  handleDelete(evt) {
    const item = evt.currentTarget.dataset.item
    const index = evt.currentTarget.dataset.index
    const g_items = this.data.g_items
    const param = {
      [u_carManagerapi_del.id]: item?.id,
    };
    byGet(getApp().data.k1swUrl + u_carManagerapi_del.URL, param).then(response => {
      hideLoading()
      if (response.statusCode == 200) {
        this.setData({
          g_items: g_items.filter((_, i) => i != index)
        }, () => {
          showToast(response?.data?.msg);
        })
      } else {
        showToast('请求失败，请稍后再试');
      }
    })
  },
})