
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  u_deleteEfence,
  u_saveOrUpdateEfence,
  u_efenceList,
  u_efenceBindVeh,
  u_efenceUnbindVeh

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
import {
  ProvinceBoundary,
  provinceOptionList
} from 'z-utility';
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
    add_type: 1,//新增类型 1新增文本数据 2新增地图数据
    batterylift: 1,//控制类型
    startdate: '19:00', //开始时间
    enddata: '19:00', //结束时间
    longitude: 116.4074, // 初始中心经度（北京）
    latitude: 39.9042,   // 初始中心纬度
    temp: {},//基础内容
    map_type: 2,
    scale: 14,             // 地图缩放级别
    radius: 100,          // 默认半径（米）
    circles: [],         // 圆形区域数组
    polygons: [{
      points: [],
      strokeWidth: 3,
      strokeColor: '#FF0000FF',
      fillColor: '#FF000033'
    }],
    radius_array: [100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000],
    radius_array_index: 0
  },
  // 更改围栏半径
  handlePickerChangeRadius(evt) {
    this.setData({
      radius_array_index: evt.detail.value,
      radius: this.data.radius_array[evt.detail.value]
    }, () => {
      if (this.data.circles.length > 0) {
        this.initCircle(); // 更新圆形半径
      }
    })
  },
  // 地图类型
  handleMapType(evt) {
    const map_type = evt?.currentTarget?.dataset?.item
    this.setData({
      map_type: map_type
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
    const currentTime = formatTime(now);

    this.setData({
      startdate: currentTime,
      enddate: currentTime
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
  // 围栏列表
  initList() {
    byGet(`${getApp().data.k1swUrl}${u_efenceList.URL}`, { page: this.data.g_page }).then(response => {
      if (response.data.code == 1000) {
        this.setData({
          g_items: response.data.content || [],
          g_total: Number(response.data.count || 0).toLocaleString()
        });
      }
    })
    return
  },
  // 输入内容回调
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
  // 选择控制类型
  handleBatterylift(evt) {
    const batterylift = evt.currentTarget.dataset.item
    this.setData({
      batterylift
    })
  },
  // 修改状态
  handleSwitchChange(evt) {
    const id = evt?.currentTarget?.dataset?.item?.id
    const isenable = evt?.currentTarget?.dataset?.item?.isenable
    const efencename = evt?.currentTarget?.dataset?.item?.efencename
    byPost(
      `${getApp().data.k1swUrl}${u_saveOrUpdateEfence.URL}`, {
      eid: id,
      isenable: isenable == 1 ? 0 : 1,
      efencename
    },
      (response) => {
        hideLoading();
        if (response?.data?.code != 1000) {
          showToast(response?.msg);
          return;
        }
        showToast(response?.data?.msg);
        this.setData({
          g_items: [],
          g_page: 1
        }, () => {
          this.initList()
        })
      },
      (error) => {
      }
    );
  },

  //提交内容-第一步
  handleSubmit() {
    const { params, id, startdate, enddate, batterylift } = this.data;
    wx.showLoading({ title: '提交中...', mask: true });
    const postData = {
      ...params,
      eid: id,
      startdate,
      enddate,
      alarmtype: batterylift
    };
    byPost(
      `${getApp().data.k1swUrl}${u_saveOrUpdateEfence.URL}`,
      postData,
      (response) => {
        wx.hideLoading();
        if (id && params?.efencepoints) {
          const points = params.efencepoints;
          const type = params.efencetype;

          if (type == 2) { // 矩形
            const polygon = {
              points: points.split(',').map(pair => {
                const [longitude, latitude] = pair.split('|');
                return { latitude: +latitude, longitude: +longitude };
              }),
              strokeWidth: 3,
              strokeColor: '#FF0000FF',
              fillColor: '#FF000033'
            };

            this.setData({
              polygons: [polygon],
              map_type: type,

            }, () => {
              this.getProvinceBoundaryByTencentMap()

              // 此处初始化省份
              // this.setData({
              //   currentProvince: ''
              // })
            });
          } else { // 圆形
            const [coords, radiusStr] = points.split('|');
            const [longitude, latitude] = coords.split(',');
            const radius = +radiusStr;

            const circle = {
              latitude: +latitude,
              longitude: +longitude,
              radius,
              color: '#FF0000AA',
              strokeWidth: 2,
              strokeColor: '#FF0000FF'
            };
            this.setData({
              circles: [circle],
              radius,
              map_type: type
            });
          }
        }
        if (response?.data?.code !== 1000) {
          wx.showToast({ title: response?.msg || '操作失败', icon: 'none' });
          return;
        }

        wx.showToast({ title: response.data.msg || '操作成功', icon: 'none' });

        this.setData({
          add_type: 2,
          g_items: [],
          g_page: 1,
          temp: {
            ...params,
            eid: id || response?.data.content?.id,
            startdate,
            enddate,
            alarmtype: batterylift
          }
        }, this.initList);
      },
      (error) => {
        wx.hideLoading();
        wx.showToast({ title: '提交失败，请稍后重试', icon: 'none' });
      }
    );
  },
  // 修改管控
  handleEdit(evt) {
    const info = evt.currentTarget.dataset.item
    this.setData({
      c_activeTab: 2,
      id: info?.id,
      params: info,
      startdate: info?.startdate,
      enddate: info?.enddate
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
        id: '',
        circles: [],
        polygons: [],
        add_type: 1
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
      eid: id
    }
    byPost(
      `${getApp().data.k1swUrl}${u_deleteEfence.URL}`, params, (response) => {
        if (response?.data?.code != 1000) {
          showToast(response?.msg);
          return;
        }
        showToast(response?.data?.msg);
        _this.setData({
          g_page: 1,
          g_items: []
        }, () => {
          _this.initList()
        })
      },
      (error) => {
        hideLoading();
        showToast('提交失败，请稍后重试');
      }
    );
  },
  // 解绑车辆（支持单个和全部解绑）
  handleUnbind(evt, isUnbindAll = false) {
    const item = evt?.currentTarget?.dataset?.item;
    const params = { eid: item?.id };

    // 如果不是全部解绑，则添加车辆ID参数
    if (!isUnbindAll) {
      const gitem = evt?.currentTarget?.dataset?.gitem;
      params.vehIds = gitem?.cusid;
    }

    // 统一处理请求
    this._sendUnbindRequest(params);
  },

  // 全部解绑车辆 (复用核心逻辑)
  handleUnbindAll(evt) {
    this.handleUnbind(evt, true);
  },

  // 封装解绑请求公共逻辑
  _sendUnbindRequest(params) {
    const url = `${getApp().data.k1swUrl}${u_efenceUnbindVeh.URL}`;
    const _this = this;

    showLoading(); // 添加加载提示提升用户体验

    byPost(
      url,
      params,
      (response) => {
        hideLoading();

        // 统一处理响应格式
        const resData = response?.data || {};
        const msg = resData.msg || response?.msg;

        if (resData.code !== 1000) {
          showToast(msg || '操作失败');
          return;
        }

        showToast(msg || '操作成功');
        _this._refreshList();
      },
      (error) => {
        hideLoading();
        showToast('提交失败，请稍后重试');
        console.error('解绑请求失败:', error); // 添加错误日志
      }
    );
  },

  // 刷新列表公共方法
  _refreshList() {
    this.setData({
      g_page: 1,
      g_items: []
    }, () => {
      this.initList();
    });
  },
  // 获取位置
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


  // 清除围栏标记点
  handleClear() {
    this.updatePolygon([]);
  },
  // 设置围栏点
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
  // 提交围栏点
  handleSumit() {
    const { map_type } = this.data;
    let pointsData, validation;

    if (map_type == 2) {
      // 多边形处理逻辑
      const points = this.data?.polygons[0]?.points || [];
      validation = points.length >= 3;
      pointsData = validation
        ? points.map(c => `${parseFloat(c.longitude)}|${parseFloat(c.latitude)}`).join()
        : null;
    } else {
      // 圆形处理逻辑
      const circles = this.data.circles;
      validation = circles.length >= 1;
      pointsData = validation
        ? `${circles[0].longitude},${circles[0].latitude}|${circles[0].radius}`
        : null;
    }

    // 验证数据
    if (!validation) {
      return wx.showModal({
        title: '提示',
        content: '请先从地图选点圈定围栏',
      });
    }

    wx.showLoading({ title: '提交中...', mask: true });

    // 构造请求参数
    const requestData = {
      ...this.data.temp,
      efencetype: this.data.map_type,
      efencepoints: pointsData
    };

    // 统一请求处理
    byPost(
      `${getApp().data.k1swUrl}${u_saveOrUpdateEfence.URL}`,
      requestData,
      (res) => {
        wx.hideLoading();
        if (res?.data?.code !== 1000) {
          wx.showToast({ title: res?.msg || '操作失败', icon: 'none' });
          return;
        }

        wx.showToast({ title: res.data.msg || '操作成功', icon: 'none' });
        this.updateListState();
      },
      (err) => {
        wx.hideLoading();
        wx.showToast({ title: '提交失败，请稍后重试', icon: 'none' });
      }
    );
  },

  // 新增的状态更新方法
  updateListState() {
    this.setData({
      add_type: 1,
      c_activeTab: 1,
      g_items: [],
      g_page: 1
    }, this.initList);
  },

  handleSelectJump(evt) {
    let temp = {
      id: evt?.currentTarget?.dataset?.item?.id,
    }
    wx.navigateTo({
      url: `/pages/carManager/carList/carList?source=/pages/electronicFence/index&flagMulti=1&info=${JSON.stringify(temp)}`
    })
  },
  // 绑定车辆
  initCarryParams(evt) {
    console.log(evt)
    if (evt?.info && evt?.black) {
      let param = {
        eid: JSON.parse(evt?.info)?.id,
        vehIds: evt?.black
      }
      // 开始执行绑定，然后刷新当前页面
      byPost(`${getApp().data.k1swUrl}${u_efenceBindVeh.URL}`, param,
        (response) => {
          if (response.data.code == 1000) {
            this.setData({
              g_items: [],
              g_page: 1,
            }, () => {
              this.initList()
            })
            showToast(response.data.msg)
          } else {
            showToast(response.data.msg)
          }

        });
    } else { this.initList() }
  },


  // 点击地图事件
  handleMapTap(e) {
    const { latitude, longitude } = e.detail;
    this.setData({
      latitude,
      longitude
    }, () => {
      this.initCircle(); // 更新圆形位置
    });
  },
  // 初始化圆形区域
  initCircle() {
    const circle = {
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      radius: this.data.radius,
      color: '#FF0000AA',     // 填充颜色（带透明度）
      strokeWidth: 2,          // 描边宽度
      strokeColor: '#FF0000FF' // 描边颜色
    };
    this.setData({ circles: [circle] });
  },
  // 选择省份点
  handleOnProvinceChange(evt) {
    const value = this.data.provinceOptionList[evt?.detail?.value]?.value
    const aggregate = this.data.ProvinceBoundary[value]?.points
    const centerPoint = this.data.ProvinceBoundary[value]?.center
    this.setData({
      latitude: centerPoint?.latitude,
      longitude: centerPoint?.longitude,
      currentProvince: this.data.ProvinceBoundary[value]?.name
    }, () => {
      this.updatePolygon(aggregate)
    })
  },
  onLoad(options) {
    // 获取外部封装数据
    this.setData({ ProvinceBoundary, provinceOptionList })
    this.initCarryParams(options)
    this.getLocation();
    // this.getProvinceBoundaryByTencentMap()
  },
  onShow() {
    this.initialiImageBaseConversion()
    this.handleCurrentDate()
  },
  getProvinceBoundaryByTencentMap() {
    const ProvinceBoundary = this.data.ProvinceBoundary
    const allPointsArray = Object.values(ProvinceBoundary).map(province => province.points);
    const pointStr = this.data.params.efencepoints
    const pointArray = pointStr
      .split(',')
      .map(item => {
        const [lonStr, latStr] = item.split('|');
        return {
          latitude: Number(latStr), 
          longitude: Number(lonStr) 
        };
      });
    let matchIndex = -1; 

    for (let arrIndex = 0; arrIndex < allPointsArray.length; arrIndex++) {
      const currentPoints = allPointsArray[arrIndex]; 
      let isMatch = true; 

      if (currentPoints.length !== pointArray.length) {
        isMatch = false;
        continue; 
      }
      for (let pointIndex = 0; pointIndex < currentPoints.length; pointIndex++) {
        const p1 = currentPoints[pointIndex];
        const p2 = pointArray[pointIndex];
        const latDiff = Math.abs(p1.latitude - p2.latitude);
        const lonDiff = Math.abs(p1.longitude - p2.longitude);
        if (latDiff > 1e-6 || lonDiff > 1e-6) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        matchIndex = arrIndex;
        break;
      }
    }
    let provinceName = ""; 
    if (matchIndex !== -1) {
      const provinceObjectsArray = Object.values(ProvinceBoundary);
      const matchedProvinceObj = provinceObjectsArray[matchIndex];
      provinceName = matchedProvinceObj?.name || "未获取到省市名称";
    }
    this.setData({ currentProvince: provinceName })
  }

})
