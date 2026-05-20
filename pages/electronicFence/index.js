
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
    map_type: 3,
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
    radius_array_index: 0,
    // 省市二维数组（第一列省，第二列对应市）
    multiArray: [],
    // 选中的索引（默认选第一个）
    multiIndex: [0, 0],
    // 选中的行政区划代码
    selectedCode: '',
    // 原始省市数据（包含行政区划代码）
    provinceCityData: [],
    province_temp: '',
    city_temp: '',
    searchKey:''
  },
  onSearchInput(e) {
    const searchKey = e.detail.value.trim()
      this.setData({
        searchKey:searchKey
      },()=>{
        this.initList()
      })

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
    byGet(`${getApp().data.k1swUrl}${u_efenceList.URL}`, { page: this.data.g_page,efencename:this.data.searchKey }).then(response => {
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
    console.log(this.data.multiArray[0]?.[this.data.multiIndex[0]])
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
          const groupArray = points.split('&');
          const type = params.efencetype;

          // 定义多边形样式常量，便于统一维护
          const POLYGON_STYLE = {
            strokeWidth: 3,
            strokeColor: '#FF0000FF',
            fillColor: '#FF000033'
          };

          // 定义坐标解析函数，避免重复代码
          const parsePoints = (pointStr) => {
            return pointStr.split('|').map(pair => {
              const [longitude, latitude] = pair.split(',');
              // 增加类型转换的容错处理
              return {
                latitude: Number(latitude) || 0,
                longitude: Number(longitude) || 0
              };
            });
          };

          if (type == 3) { // 矩形/多边形
            // 遍历所有分组，动态生成多边形数组（支持任意数量）
            const polygons = groupArray.map(pointGroup => ({
              ...POLYGON_STYLE,
              points: parsePoints(pointGroup)
            }));

            this.setData({
              polygons, // 直接赋值动态生成的数组
              map_type: type,
              province_temp: response?.data?.content?.province,
              city_temp: response?.data?.content?.city
            });
          } else { // 圆形
            // 增加容错处理，避免解构赋值时报错
            const [coords = '', radiusStr = '0'] = points.split('|') || [];
            const [longitude = '0', latitude = '0'] = coords.split(',') || [];
            const radius = Number(radiusStr) || 0;

            const circle = {
              latitude: Number(latitude) || 0,
              longitude: Number(longitude) || 0,
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
        console.log('123', params?.efencepoints)
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
    console.log(info)
    this.setData({
      c_activeTab: 2,
      id: info?.id,
      params: info,
      startdate: info?.startdate,
      enddate: info?.enddate,
      batterylift:info?.alarmtype
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
    if (map_type === 3) {
      const formatPolygonPoints = (points = []) => {
        if (points.length < 3) return null;
        return points
          .map(point => `${parseFloat(point.longitude)},${parseFloat(point.latitude)}`)
          .join('|');
      };


      // 安全获取多边形数组，默认空数组避免报错
      const { polygons = [] } = this.data || {};


      const validPointsList = polygons
        .map(polygon => formatPolygonPoints(polygon?.points))
        .filter(Boolean);


      pointsData = validPointsList.join('&');


      console.log('多多边形坐标拼接结果：', pointsData);
    } else {
      // 圆形处理逻辑
      const circles = this.data.circles;
      validation = circles.length >= 1;
      pointsData = validation
        ? `${circles[0].longitude},${circles[0].latitude}|${circles[0].radius}`
        : null;
    }


    wx.showLoading({ title: '提交中...', mask: true });


    // 构造请求参数
    const requestData = {
      ...this.data.temp,
      efencetype: this.data.map_type,
      efencepoints: pointsData,
      province: this.data.province_temp||(this.data.multiArray[0]?.[this.data.multiIndex[0]]),
      city: this.data.city_temp||(this.data.multiArray[1]?.[this.data.multiIndex[1]])
    };
    console.log(requestData)

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
    // 提取所有省份名称
    const provinceNames = this.data.provinceCityData.map(item => item.name);
    // 默认加载第一个省份的城市名称
    const firstCityNames = this.data.provinceCityData[0].cities.map(item => item.name);
    // 更新数据
    this.setData({
      multiArray: [provinceNames, firstCityNames],
    });
  },


  bindMultiPickerColumnChange(e) {
    const columnIndex = e.detail.column; // 改变的列索引（0=省，1=市）
    const rowIndex = e.detail.value;     // 选中的行索引

    // 只有切换省份列（第0列）时，才更新城市列表
    if (columnIndex === 0) {
      // 获取当前选中的省份数据
      const currentProvince = this.data.provinceCityData[rowIndex];
      // 提取当前省份的城市名称
      const cityNames = currentProvince.cities.map(item => item.name);
      // 更新选中索引、城市列表和默认代码
      this.setData({
        multiIndex: [rowIndex, 0], // 省份切换后，城市默认选第一个
        multiArray: [this.data.multiArray[0], cityNames],
        selectedCode: currentProvince.cities[0].code
      });
    } else {
      // 切换城市列时，更新选中的代码
      const provinceIndex = this.data.multiIndex[0];
      const currentCity = this.data.provinceCityData[provinceIndex].cities[rowIndex];
      // 更新选中索引和代码
      const newMultiIndex = [...this.data.multiIndex];
      newMultiIndex[columnIndex] = rowIndex;
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

    // 解构获取选中项信息
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

    // 一次性设置所有相关数据
    this.setData({
      province_temp: provinceName,
      city_temp: cityName,
      selectedProvince: provinceName,
      selectedCity: cityName,
      selectedCode,
      provinceCode
    });

    // 调用后续处理函数
    this.handleRetrievePoint(selectedCode);
  },
  // 1
  convertTencentPolygonToPoints(polygonData) {
    // 步骤1：提取原始polygon二维数组（兼容两种入参格式）
    let rawPolygon = [];
    if (Array.isArray(polygonData)) {
      // 入参是直接传入的polygon原始数组
      rawPolygon = polygonData;
    } else if (
      polygonData &&
      polygonData.result &&
      Array.isArray(polygonData.result) &&
      polygonData.result[0] &&
      polygonData.result[0][0] &&
      Array.isArray(polygonData.result[0][0].polygon)
    ) {
      // 入参是接口返回的完整响应数据，提取核心polygon数组
      rawPolygon = polygonData.result[0][0].polygon;
    } else {
      console.error("入参格式错误，无法提取polygon数据");
      return [];
    }

    // 步骤2：处理空数据边界情况
    if (!rawPolygon.length) {
      console.warn("polygon数据为空，返回空数组");
      return [];
    }

    // 步骤3：转换为{ longitude, latitude }格式（处理所有项并合并为一维数组）
    const allPoints = []; // 存储所有解析后的坐标点（一维数组）

    // 遍历rawPolygon中的每一项
    for (const coreCoordinates of rawPolygon) {
      // 跳过非数组的无效项
      if (!Array.isArray(coreCoordinates)) {
        console.warn("发现非数组格式的坐标项，已跳过");
        continue;
      }

      // 解析当前项的一维坐标数组 [lng1, lat1, lng2, lat2, ...]
      for (let i = 0; i < coreCoordinates.length; i += 2) {
        const longitude = coreCoordinates[i];
        const latitude = coreCoordinates[i + 1];

        // 过滤无效坐标（避免NaN等异常值）
        if (typeof longitude === 'number' && typeof latitude === 'number') {
          allPoints.push({
            longitude: longitude,
            latitude: latitude
          });
        }
      }
    }

    // 步骤4：为合并后的整个数组补充闭合点（如果首尾坐标不一致）
    if (allPoints.length >= 1) {
      const firstPoint = allPoints[0];
      const lastPoint = allPoints[allPoints.length - 1];
      if (
        firstPoint.longitude !== lastPoint.longitude ||
        firstPoint.latitude !== lastPoint.latitude
      ) {
        allPoints.push({
          longitude: firstPoint.longitude,
          latitude: firstPoint.latitude
        });
      }
    }

    // 步骤5：返回合并后的一维数组
    return allPoints;
  },
  // 2


  handleRetrievePoint(evt) {
    wx.request({
      url: 'https://apis.map.qq.com/ws/district/v1/search',
      data: {
        keyword: evt.trim(),
        get_polygon: 1,
        level: 'province',
        key: 'W66BZ-ADBC3-COB3F-YWZG4-MAVRO-IJBIM'
      },
      success: res => {
        // 做改变
        if (res.data.status === 0) {
          const polygon = res.data.result[0][0].polygon;
          // 提取多边形公共样式配置，便于统一修改
          const POLYGON_STYLE = {
            strokeWidth: 1,
            strokeColor: '#FF0000FF',
            fillColor: '#FF000033'
          };

          // 重构后的核心逻辑
          this.setData({
            // 遍历polygon数组生成多边形配置，彻底消除重复代码
            polygons: (polygon || []).map(item => ({
              ...POLYGON_STYLE, // 复用公共样式
              points: this.convertTencentPolygonToPoints([item])
            })),
            // 增加空值兜底，避免坐标缺失导致地图异常
            latitude: res?.data?.result?.[0]?.[0]?.location?.lat || this.data.latitude,
            longitude: res?.data?.result?.[0]?.[0]?.location?.lng || this.data.longitude
          });
        } else {
          wx.showToast({ title: res.data.message, icon: 'none' });
        }
      },
      fail: err => {
        console.error('请求失败：', err);
        wx.showToast({ title: '边界数据获取失败', icon: 'none' });
      }
    });
  },


})
