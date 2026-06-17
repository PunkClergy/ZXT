const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  u_vehBindCarManager,
  u_carManagerapi_del,
  u_carList
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
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0,
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44,
    c_searchBarHeight: 70,
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44),
    g_page: 1,
    g_comParam: '',
    g_items: [],
    g_triggered: false,
    g_total: 0,
    type: 1,
    roleName: '',
    // 查看已绑定车辆弹窗
    showCarPopup: false,
    currentUserInfo: {},
    currentVehList: [],
    // 绑定车辆多选弹窗
    showBindCarPopup: false,
    bindTargetUser: {},
    allCarList: [],
    selectedCarIds: [] // 内部全部为 Number 数字
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

  // 打开查看已绑定车辆弹窗
  openCarPopup(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      showCarPopup: true,
      currentUserInfo: item,
      currentVehList: item.vehList || []
    })
  },
  closeCarPopup() {
    this.setData({
      showCarPopup: false,
      currentUserInfo: {},
      currentVehList: []
    })
  },

  // 解绑车辆（查看弹窗内）
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
          const vehIds = all ? flag?.map(ele => ele.id).join(',') : flag.id
          let param = {
            userId: userId,
            vehIds: vehIds
          }
          byPost(`${getApp().data.k1swUrl}${u_vehUnBindCarManager.URL}`, param,
            (response) => {
              if (response.data.code == 1000) {
                showToast(response?.data?.msg)
                this.closeCarPopup()
                this.initGetRole({ name: this.data.roleName })
              } else {
                showToast(response?.data?.msg)
              }
            });
        }
      }
    })
  },

  // 打开绑定车辆多选弹窗
  openBindCarPopup(e) {
    const userItem = e.currentTarget.dataset.item
    // 已绑定车辆id转为数字存入selectedCarIds
    const bindedIds = (userItem.vehList || []).map(car => Number(car.id))
    this.setData({
      showBindCarPopup: true,
      bindTargetUser: userItem,
      selectedCarIds: bindedIds
    }, () => {
      this.getAllCarList()
    })
  },
  // 关闭绑定弹窗
  closeBindCarPopup() {
    this.setData({
      showBindCarPopup: false,
      allCarList: [],
      selectedCarIds: [],
      bindTargetUser: {}
    })
  },

  // ★ 获取全部车辆，并为每项添加 checked 属性
  getAllCarList() {
    showLoading()
    byGet(`${getApp().data.k1swUrl}${u_carList.URL}`, {}).then(res => {
      hideLoading()
      if (res.data.code === 1000) {
        const list = (res.data.content || []).map(car => {
          const id = Number(car.id)
          return {
            ...car,
            id: id,
            checked: this.data.selectedCarIds.includes(id)  // 根据当前选中数组设置
          }
        })
        this.setData({ allCarList: list })
      } else {
        showToast(res.data.msg || '获取车辆失败')
      }
    })
  },

  // ★ 切换复选框选中状态，同步更新 allCarList 和 selectedCarIds
  toggleCarCheck(e) {
    const carId = Number(e.currentTarget.dataset.id)
    // 更新选中数组
    let selected = [...this.data.selectedCarIds]
    const idx = selected.indexOf(carId)
    if (idx > -1) {
      selected.splice(idx, 1)
    } else {
      selected.push(carId)
    }

    // 更新 allCarList 中对应项的 checked
    const allList = this.data.allCarList.map(car => {
      if (car.id === carId) {
        return { ...car, checked: !car.checked } // 取反
      }
      return car
    })

    this.setData({
      selectedCarIds: selected,
      allCarList: allList
    })
  },

  // 确认绑定车辆
  confirmBindCar() {
    const { bindTargetUser, selectedCarIds } = this.data
    if (!selectedCarIds.length) {
      showToast('请至少选择一辆车辆')
      return
    }
    const vehIds = selectedCarIds.join(',')
    const param = {
      userId: bindTargetUser.id,
      vehIds: vehIds
    }
    showLoading()
    byPost(`${getApp().data.k1swUrl}${u_vehBindCarManager.URL}`, param, (res) => {
      hideLoading()
      if (res.data.code === 1000) {
        showToast(res.data.msg)
        this.closeBindCarPopup()
        this.initGetRole({ name: this.data.roleName })
      } else {
        showToast(res.data.msg)
      }
    })
  },

  // 获取角色人员列表
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
    } else {
      this.initGetRole(evt)
    }
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
        const dataToUpdate = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
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
    this.setData({ g_page: this.data.g_page + 1 }, () => this.getCarList());
  },
  handleRefresh() {
    this.setData({
      g_triggered: false,
      g_page: 1,
      g_items: []
    }, () => this.getCarList());
  },
  handleSelectJump(evt) {
    let temp = { id: evt?.currentTarget?.dataset?.item?.id, }
    wx.navigateTo({
      url: `/pages/carManager/carList/carList?source=/pages/carManager/corpel/index&flagMulti=1&info=${JSON.stringify(temp)}&type=${this.data.type}&name=${this.data.title_name}&desc=${JSON.stringify(evt?.currentTarget?.dataset?.item)}`
    })
  },
  handleBlur(e) {
    const resp = e.detail.value
    if (resp == this.data.g_comParam) return
    this.setData({
      g_comParam: e.detail.value,
      g_page: 1,
      g_items: []
    }, () => this.getCarList());
  },
  handleJumpBack() {
    wx.navigateBack({ delta: 1 });
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
  handleDelete(evt) {
    const item = evt.currentTarget.dataset.item
    const index = evt.currentTarget.dataset.index
    const g_items = this.data.g_items
    const param = { [u_carManagerapi_del.id]: item?.id, };
    byGet(getApp().data.k1swUrl + u_carManagerapi_del.URL, param).then(response => {
      hideLoading()
      if (response.statusCode == 200) {
        this.setData({
          g_items: g_items.filter((_, i) => i != index)
        }, () => showToast(response?.data?.msg));
      } else {
        showToast('请求失败，请稍后再试');
      }
    })
  },
})