
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  u_roleapidel,
  u_roleapiaddOrUpdate,
  u_childUserList,

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
    c_activeTab: 1, // 默认选中的Tab索引
    params: {}, //新增管控数据部分字段
    id: '', //修改标志
    user_text: '新增',
    startDate: '2025-03-20', //开始日期
    startTime: '19:00', //开始时间
    endDate: '2025-03-20', //结束日期
    endTime: '19:00', //结束时间
    longitude: 116.4074, // 初始中心经度（北京）
    latitude: 39.9042,   // 初始中心纬度
    polygons: [{
      points: [],
      strokeWidth: 3,
      strokeColor: '#FF0000FF',
      fillColor: '#FF000033'
    }],
    
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
    const tomorrowDate = formatDate(tomorrow);
    const currentTime = formatTime(now);

    this.setData({
      oilendDate: currentDate,
      oilendTime: currentTime,
      startDate: currentDate, // 今天作为开始日期
      endDate: tomorrowDate, // 明天作为结束日期
      startTime: currentTime,
      endTime: currentTime
    });
  },
  // 确认设置时间
  bindTimeChange(evt) {
    const category = evt.currentTarget.dataset.index
    const value = evt.detail.value
    this.setData({
      [category]: value
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
    byGet(`${getApp().data.k1swUrl}${u_childUserList.URL}`, { roleId: this.data.id }).then(response => {
      if (response.data.code == 1000) {
        this.setData({
          g_items: response.data.content || [],
          g_total: Number(response.data.count || 0).toLocaleString()
        });
      }
    })
    return
  },

  //提交内容
  handleSubmit() {
    const {
      params,
      id
    } = this.data;
    showLoading();
    byPost(
      `${getApp().data.k1swUrl}${u_roleapiaddOrUpdate.URL}`, {
      ...params,
      id
    },
      (response) => {
        hideLoading();
        if (response?.data?.code != 1000) {
          showToast(response?.msg);
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
          // 设置权限
          this.handleSetMenuTree(response?.data?.content?.id)
        })
      },
      (error) => {
        hideLoading();
        showToast('提交失败，请稍后重试');
      }
    );
  },
  // 修改管控
  handleEdit(evt) {
    const info = evt.currentTarget.dataset.item
    this.setData({
      c_activeTab: 2,
      id: info?.id,
      params: info
    })
  },
  // 切换tabs标签
  handleSwitchTab(e) {
    const flag = e._relatedInfo.anchorTargetText
    if (flag == '围栏列表') {
      this.setData({
        c_activeTab: 1,
        btnState: '新增',
        params: {},
        id: ''
      })
    }
    if (flag == '新增围栏') {
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
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        });
      },
      fail: () => {
        wx.showToast({ title: '获取位置失败', icon: 'none' });
      }
    });
  },
  onMapTap(e) {
    const { latitude, longitude } = e.detail;
    const newPoint = { latitude, longitude };
    const updatedPoints = [...this.data.polygons[0].points, newPoint];

    if (updatedPoints.length < 3) {
      wx.showToast({
        title: `请再点击 ${3 - updatedPoints.length} 个点`,
        icon: 'none'
      });
    }

    this.updatePolygon(updatedPoints);
  },

  handleEliminate() {
    const points = [...this.data.polygons[0].points];
    points.pop();
    this.updatePolygon(points);
  },

  handleClear() {
    this.updatePolygon([]);
  },

  updatePolygon(points) {
    this.setData({
      polygons: [{
        points,
        strokeWidth: 3,
        strokeColor: '#FF0000FF',
        fillColor: '#FF000033'
      }]
    });
  },
  handleSumit() {
    const points = this.data?.polygons[0]?.points
    console.log(points)
    if (points?.length < 3) {
      wx.showModal({
        title: '提示',
        content: '请先从地图选点圈定围栏',
      })
    }
  },
  onLoad(options) {
    this.initList()
    this.mapCtx = wx.createMapContext('map');
    this.getLocation();
  },
  onShow() {
    this.initialiImageBaseConversion()
    this.handleCurrentDate()
  },
})

// Page({
//   data: {
//     longitude: 116.4074, // 初始中心经度（北京）
//     latitude: 39.9042,   // 初始中心纬度
//     polygons: [{
//       points: [],
//       strokeWidth: 3,
//       strokeColor: '#FF0000FF',
//       fillColor: '#FF000033'
//     }],
//     markers: [],         // 点击添加的标记
//     locationHistory: [],
//     lastTapPoint: null   // 最后点击的坐标点
//   },

//   onLoad() {
//     this.mapCtx = wx.createMapContext('map');
//     this.getLocation();
//   },

//   getLocation() {
//     wx.getLocation({
//       type: 'gcj02',
//       success: (res) => {
//         this.setData({
//           longitude: res.longitude,
//           latitude: res.latitude
//         });
//       },
//       fail: () => {
//         wx.showToast({ title: '获取位置失败', icon: 'none' });
//       }
//     });
//   },

//   onMapTap(e) {
//     const { latitude, longitude } = e.detail;
//     const newPoint = { latitude, longitude };
//     const updatedPoints = [...this.data.polygons[0].points, newPoint];

//     if (updatedPoints.length < 3) {
//       wx.showToast({
//         title: `请再点击 ${3 - updatedPoints.length} 个点`,
//         icon: 'none'
//       });
//     }

//     this.updatePolygon(updatedPoints);
//   },

//   handleEliminate() {
//     const points = [...this.data.polygons[0].points];
//     points.pop();
//     this.updatePolygon(points);
//   },

//   handleClear() {
//     this.updatePolygon([]);
//   },

//   updatePolygon(points) {
//     this.setData({
//       polygons: [{
//         points,
//         strokeWidth: 3,
//         strokeColor: '#FF0000FF',
//         fillColor: '#FF000033'
//       }]
//     });
//   },
//   handleSumit() {
//     const points = this.data?.polygons[0]?.points
//     console.log(points)
//     if (points?.length < 3) {
//       wx.showModal({
//         title: '提示',
//         content: '请先从地图选点圈定围栏',
//       })
//     }
//   }
// });