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
  u_carList
} = require('../../utils/request/car')
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
  provinceOptionList
} from 'z-utility';

Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_screen_width: _handleWindowInfo.windowWidth || 0,
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0,
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44,
    s_background_tabs_1: '',
    s_background_tabs_2: '',
    s_background_tabs_active_1: '',
    s_background_tabs_active_2: '',
    searchBarHeight: 80,
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44),
    g_page: 1,
    g_items: [],
    g_triggered: false,
    c_activeTab: 1,
    params: {},
    id: '',
    user_text: '新增',
    add_type: 1,
    batterylift: 1,
    startdate: '19:00',
    enddate: '19:00',
    longitude: 116.4074,
    latitude: 39.9042,
    temp: {},
    map_type: 3,
    scale: 14,
    radius: 100,
    circles: [],
    polygons: [{
      points: [],
      strokeWidth: 3,
      strokeColor: '#FF0000FF',
      fillColor: '#FF000033'
    }],
    radius_array: [100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000],
    radius_array_index: 0,
    multiArray: [],
    multiIndex: [0, 0],
    selectedCode: '',
    provinceCityData: [],
    province_temp: '',
    city_temp: '',
    searchKey: '',

    // 绑定车辆弹窗
    showBindCarModal: false,
    currentFenceId: '',
    currentFenceVehIds: [],
    carList: [],
    carSearchKey: '',
    checkedCarIds: [],
    allCarChecked: false,

    // 【新增】查看已绑定车辆弹窗
    showViewBoundCarModal: false,
    currentViewFenceId: '',
    boundCarList: []
  },

  // ================== 绑定车辆弹窗 ==================
  openBindCarModal(e) {
    const fenceItem = e.currentTarget.dataset.item
    const fenceId = fenceItem.id
    const boundIds = (fenceItem.vehList || []).map(i => i.cusid || i.id)
    this.setData({
      showBindCarModal: true,
      currentFenceId: fenceId,
      currentFenceVehIds: boundIds,
      carSearchKey: '',
      checkedCarIds: []
    }, () => {
      this.loadCarList()
    })
  },
  closeBindCarModal() {
    this.setData({
      showBindCarModal: false,
      carList: [],
      checkedCarIds: []
    })
  },
  loadCarList() {
    showLoading()
    byGet(getApp().data.k1swUrl + u_carList.URL, {
      page: 1,
      pageSize: 1000,
      comParam: this.data.carSearchKey || ''
    }).then(res => {
      hideLoading()
      if (res.data.code === 1000) {
        let list = res.data.content || []
        const {
          currentFenceVehIds
        } = this.data
        list = list.map(i => ({
          ...i,
          checked: currentFenceVehIds.includes(i.id)
        }))
        const ids = list.filter(i => i.checked).map(i => i.id)
        const allChecked = list.length > 0 && list.every(i => i.checked)
        this.setData({
          carList: list,
          checkedCarIds: ids,
          allCarChecked: allChecked
        })
      }
    }).catch(() => {
      hideLoading()
    })
  },
  onCarSearchInput(e) {
    this.setData({
      carSearchKey: e.detail.value
    }, () => {
      this.loadCarList()
    })
  },
  handleCarCheckChange(e) {
    const item = e.currentTarget.dataset.item
    const {
      carList
    } = this.data
    const newList = carList.map(i => {
      if (i.id === item.id) i.checked = !i.checked
      return i
    })
    const ids = newList.filter(i => i.checked).map(i => i.id)
    const allChecked = newList.length > 0 && newList.every(i => i.checked)
    this.setData({
      carList: newList,
      checkedCarIds: ids,
      allCarChecked: allChecked
    })
  },
  handleCarAllCheck() {
    const {
      carList,
      allCarChecked
    } = this.data
    const target = !allCarChecked
    const newList = carList.map(i => ({
      ...i,
      checked: target
    }))
    const ids = target ? newList.map(i => i.id) : []
    this.setData({
      carList: newList,
      checkedCarIds: ids,
      allCarChecked: target
    })
  },
  confirmBindCar() {
    const {
      currentFenceId,
      checkedCarIds
    } = this.data
    if (checkedCarIds.length === 0) {
      showToast('请选择车辆')
      return
    }
    showLoading()
    let param = {
      eid: currentFenceId,
      vehIds: checkedCarIds.join(',')
    }
    byPost(`${getApp().data.k1swUrl}${u_efenceBindVeh.URL}`, param, (response) => {
      hideLoading()
      if (response.data.code == 1000) {
        this.closeBindCarModal()
        this._refreshList()
        showToast('绑定成功')
      } else {
        showToast(response.data.msg || '绑定失败')
      }
    });
  },

  // ================== 【新增】查看已绑定车辆弹窗 ==================
  openViewBoundCarModal(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      showViewBoundCarModal: true,
      currentViewFenceId: item.id,
      boundCarList: item.vehList || []
    })
  },
  closeViewBoundCarModal() {
    this.setData({
      showViewBoundCarModal: false,
      boundCarList: []
    })
  },
  unbindSingleFromViewModal(e) {
    const car = e.currentTarget.dataset.item
    const fenceId = e.currentTarget.dataset.fenceid
    wx.showModal({
      title: '提示',
      content: '确定要解绑该车辆吗？',
      success: (res) => {
        if (res.confirm) {
          showLoading()
          byPost(`${getApp().data.k1swUrl}${u_efenceUnbindVeh.URL}`, {
            eid: fenceId,
            vehIds: car.cusid || car.id
          }, (resp) => {
            hideLoading()
            if (resp.data.code == 1000) {
              showToast('解绑成功')
              this._refreshList()
              this.closeViewBoundCarModal()
            } else {
              showToast(resp.data.msg || '解绑失败')
            }
          })
        }
      }
    })
  },

  // ================== 原有方法 ==================
  onSearchInput(e) {
    const searchKey = e.detail.value.trim()
    this.setData({
      searchKey
    }, () => {
      this.initList()
    })
  },
  handlePickerChangeRadius(evt) {
    this.setData({
      radius_array_index: evt.detail.value,
      radius: this.data.radius_array[evt.detail.value]
    }, () => {
      if (this.data.circles.length > 0) {
        this.initCircle();
      }
    })
  },
  handleMapType(evt) {
    const map_type = evt?.currentTarget?.dataset?.item
    this.setData({
      map_type
    })
  },
  handleCurrentDate() {
    const formatTime = (date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    };
    const now = new Date();
    const currentTime = formatTime(now);
    this.setData({
      startdate: currentTime,
      enddate: currentTime
    });
  },
  bindTimeChange(evt) {
    const category = evt.currentTarget.dataset.index
    const value = evt.detail.value
    this.setData({
      [category]: value
    })
  },
  initialiImageBaseConversion() {
    const _this = this;
    const imageMap = [{
        path: '/assets/images/home/car-bg.png',
        key: 's_background_picture_of_the_front_page'
      },
      {
        path: '/assets/images/home/1-1.png',
        key: 's_background_tabs_1'
      },
      {
        path: '/assets/images/home/2-1.png',
        key: 's_background_tabs_active_1'
      },
      {
        path: '/assets/images/home/1-2.png',
        key: 's_background_tabs_2'
      },
      {
        path: '/assets/images/home/2-2.png',
        key: 's_background_tabs_active_2'
      },
    ];
    const promises = imageMap.map(item =>
      new Promise((resolve) => {
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
    Promise.all(promises).then(results => {
      const dataToUpdate = results.reduce((acc, curr) => ({
        ...acc,
        ...curr
      }), {});
      _this.setData(dataToUpdate);
    });
  },
  initList() {
    byGet(`${getApp().data.k1swUrl}${u_efenceList.URL}`, {
      page: this.data.g_page,
      efencename: this.data.searchKey
    }).then(response => {
      if (response.data.code == 1000) {
        this.setData({
          g_items: response.data.content || [],
          g_total: Number(response.data.count || 0).toLocaleString()
        });
      }
    })
  },
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
  handleBatterylift(evt) {
    const batterylift = evt.currentTarget.dataset.item
    this.setData({
      batterylift
    })
  },
  handleSwitchChange(evt) {
    const id = evt?.currentTarget?.dataset?.item?.id
    const isenable = evt?.currentTarget?.dataset?.item?.isenable
    const efencename = evt?.currentTarget?.dataset?.item?.efencename
    byPost(
      `${getApp().data.k1swUrl}${u_saveOrUpdateEfence.URL}`, {
        eid: id,
        isenable: isenable == 1 ? 0 : 1,
        efencename
      }, (response) => {
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
      });
  },
  handleSubmit() {
    const {
      params,
      id,
      startdate,
      enddate,
      batterylift
    } = this.data;
    wx.showLoading({
      title: '提交中...',
      mask: true
    });
    const postData = {
      ...params,
      eid: id,
      startdate,
      enddate,
      alarmtype: batterylift
    };
    byPost(
      `${getApp().data.k1swUrl}${u_saveOrUpdateEfence.URL}`, postData, (response) => {
        wx.hideLoading();
        if (response?.data?.code !== 1000) {
          wx.showToast({
            title: response?.msg || '操作失败',
            icon: 'none'
          });
          return;
        }
        wx.showToast({
          title: response.data.msg || '操作成功',
          icon: 'none'
        });
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
      }, (error) => {
        wx.hideLoading();
        wx.showToast({
          title: '提交失败，请稍后重试',
          icon: 'none'
        });
      }
    );
  },
  handleEdit(evt) {
    const info = evt.currentTarget.dataset.item
    this.setData({
      c_activeTab: 2,
      id: info?.id,
      params: info,
      startdate: info?.startdate,
      enddate: info?.enddate,
      batterylift: info?.alarmtype
    })
  },
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
          c_activeTab: 2
        })
      }
    }
  },
  handleDelete(evt) {
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
        this.setData({
          g_page: 1,
          g_items: []
        }, () => {
          this.initList()
        })
      }
    );
  },
  handleUnbind(evt, isUnbindAll = false) {
    const item = evt?.currentTarget.dataset?.item;
    const params = {
      eid: item?.id
    };
    if (!isUnbindAll) {
      const gitem = evt?.currentTarget.dataset?.gitem;
      params.vehIds = gitem?.cusid;
    }
    this._sendUnbindRequest(params);
  },
  handleUnbindAll(evt) {
    this.handleUnbind(evt, true);
  },
  _sendUnbindRequest(params) {
    const url = `${getApp().data.k1swUrl}${u_efenceUnbindVeh.URL}`;
    showLoading();
    byPost(url, params, (response) => {
      hideLoading();
      const resData = response?.data || {};
      const msg = resData.msg || response?.msg;
      if (resData.code !== 1000) {
        showToast(msg || '操作失败');
        return;
      }
      showToast(msg || '操作成功');
      this._refreshList();
    }, (error) => {
      hideLoading();
      showToast('提交失败，请稍后重试');
    });
  },
  _refreshList() {
    this.setData({
      g_page: 1,
      g_items: []
    }, () => {
      this.initList();
    });
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
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        });
      }
    });
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
    const {
      map_type
    } = this.data;
    let pointsData;
    if (map_type === 3) {
      const formatPolygonPoints = (points = []) => {
        if (points.length < 3) return null;
        return points.map(p => `${parseFloat(p.longitude)},${parseFloat(p.latitude)}`).join('|');
      };
      const {
        polygons = []
      } = this.data;
      const validPointsList = polygons.map(p => formatPolygonPoints(p?.points)).filter(Boolean);
      pointsData = validPointsList.join('&');
    } else {
      const circles = this.data.circles;
      pointsData = circles.length >= 1 ? `${circles[0].longitude},${circles[0].latitude}|${circles[0].radius}` : null;
    }
    wx.showLoading({
      title: '提交中...',
      mask: true
    });
    const requestData = {
      ...this.data.temp,
      efencetype: this.data.map_type,
      efencepoints: pointsData,
      province: this.data.map_type == 1 ? '' : this.data.province_temp || (this.data.multiArray[0]?.[this.data.multiIndex[0]]),
      city: this.data.map_type == 1 ? '' : this.data.city_temp || (this.data.multiArray[1]?.[this.data.multiIndex[1]])
    };
    byPost(
      `${getApp().data.k1swUrl}${u_saveOrUpdateEfence.URL}`, requestData, (res) => {
        wx.hideLoading();
        if (res?.data?.code !== 1000) {
          wx.showToast({
            title: res?.msg || '操作失败',
            icon: 'none'
          });
          return;
        }
        wx.showToast({
          title: res.data.msg || '操作成功',
          icon: 'none'
        });
        this.updateListState();
      }, (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '提交失败，请稍后重试',
          icon: 'none'
        });
      }
    );
  },
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
      id: evt?.currentTarget?.dataset?.item?.id
    }
    wx.navigateTo({
      url: `/pages/carManager/carList/carList?source=/pages/electronicFence/index&flagMulti=1&info=${JSON.stringify(temp)}`
    })
  },
  initCarryParams(evt) {
    if (evt?.info && evt?.black) {
      let param = {
        eid: JSON.parse(evt?.info)?.id,
        vehIds: evt?.black
      }
      byPost(`${getApp().data.k1swUrl}${u_efenceBindVeh.URL}`, param, (response) => {
        if (response.data.code == 1000) {
          this.setData({
            g_items: [],
            g_page: 1
          }, () => {
            this.initList()
          })
          showToast(response.data.msg)
        } else {
          showToast(response.data.msg)
        }
      });
    } else {
      this.initList()
    }
  },
  handleMapTap(e) {
    const {
      latitude,
      longitude
    } = e.detail;
    this.setData({
      latitude,
      longitude
    }, () => {
      this.initCircle();
    });
  },
  initCircle() {
    const circle = {
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      radius: this.data.radius,
      color: '#FF0000AA',
      strokeWidth: 2,
      strokeColor: '#FF0000FF'
    };
    this.setData({
      circles: [circle]
    });
  },
  onLoad(options) {
    this.setData({
      provinceCityData: provinceOptionList
    }, () => {
      this.initPickerData();
    })
    this.initCarryParams(options)
    this.getLocation();
  },
  onShow() {
    this.initialiImageBaseConversion()
    this.handleCurrentDate()
  },
  initPickerData() {
    const provinceNames = this.data.provinceCityData.map(item => item.name);
    const firstCityNames = this.data.provinceCityData[0].cities.map(item => item.name);
    this.setData({
      multiArray: [provinceNames, firstCityNames]
    });
  },
  bindMultiPickerColumnChange(e) {
    const columnIndex = e.detail.column;
    const rowIndex = e.detail.value;
    if (columnIndex === 0) {
      const currentProvince = this.data.provinceCityData[rowIndex];
      const cityNames = currentProvince.cities.map(item => item.name);
      this.setData({
        multiIndex: [rowIndex, 0],
        multiArray: [this.data.multiArray[0], cityNames],
        selectedCode: currentProvince.cities[0].code
      });
    } else {
      const provinceIndex = this.data.multiIndex[0];
      const currentCity = this.data.provinceCityData[provinceIndex].cities[rowIndex];
      const newMultiIndex = [...this.data.multiIndex];
      newMultiIndex[column] = rowIndex;
      this.setData({
        multiIndex: newMultiIndex,
        selectedCode: currentCity.code
      });
    }
  },
  bindMultiPickerChange(e) {
    const [provinceIdx, cityIdx] = e.detail.value;
    const {
      multiArray,
      provinceCityData
    } = this.data;
    const {
      code: provinceCode,
      cities: {
        [cityIdx]: {
          code: selectedCode,
          name: cityName
        }
      }
    } = provinceCityData[provinceIdx];
    const provinceName = multiArray[0][provinceIdx];
    this.setData({
      province_temp: provinceName,
      city_temp: cityName,
      selectedProvince: provinceName,
      selectedCity: cityName,
      selectedCode,
      provinceCode
    });
    this.handleRetrievePoint(selectedCode);
  },
  convertTencentPolygonToPoints(polygonData) {
    let rawPolygon = [];
    if (Array.isArray(polygonData)) {
      rawPolygon = polygonData;
    } else if (polygonData && polygonData.result && Array.isArray(polygonData.result) && polygonData.result[0] && polygonData.result[0][0] && Array.isArray(polygonData.result[0][0].polygon)) {
      rawPolygon = polygonData.result[0][0].polygon;
    } else {
      return [];
    }
    if (!rawPolygon.length) return [];
    const allPoints = [];
    for (const coreCoordinates of rawPolygon) {
      if (!Array.isArray(coreCoordinates)) continue;
      for (let i = 0; i < coreCoordinates.length; i += 2) {
        const longitude = coreCoordinates[i];
        const latitude = coreCoordinates[i + 1];
        if (typeof longitude === 'number' && typeof latitude === 'number') {
          allPoints.push({
            longitude,
            latitude
          });
        }
      }
    }
    if (allPoints.length >= 1) {
      const firstPoint = allPoints[0];
      const lastPoint = allPoints[allPoints.length - 1];
      if (firstPoint.longitude !== lastPoint.longitude || firstPoint.latitude !== lastPoint.latitude) {
        allPoints.push({
          longitude: firstPoint.longitude,
          latitude: firstPoint.latitude
        });
      }
    }
    return allPoints;
  },
  handleRetrievePoint(evt) {
    wx.request({
      url: 'https://apis.map.qq.com/ws/district/v1/search',
      data: {
        keyword: evt.trim(),
        get_polygon: 1,
        level: 'province',
        key: 'K76BZ-TR46T-ACQXY-LSLAP-S3JUO-WFFKD'
      },
      success: res => {
        if (res.data.status === 0) {
          const polygon = res.data.result[0][0].polygon;
          this.setData({
            polygons: (polygon || []).map(item => ({
              strokeWidth: 1,
              strokeColor: '#FF0000FF',
              fillColor: '#FF000033',
              points: this.convertTencentPolygonToPoints([item])
            })),
            latitude: res?.data?.result?.[0]?.[0]?.location?.lat || this.data.latitude,
            longitude: res?.data?.result?.[0]?.[0]?.location?.lng || this.data.longitude
          });
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('请求失败：', err);
        wx.showToast({
          title: '边界数据获取失败',
          icon: 'none'
        });
      }
    });
  },
})