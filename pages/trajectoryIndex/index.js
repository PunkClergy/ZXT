const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const {
  u_getTrackPlayback,
} = require('../../utils/request/map')
const {
  byPost
} = require('../../utils/request/http')

Page({
  data: {
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    c_k1sw_link: 'https://k1sw.wiselink.net.cn/', //域名
    c_fin3_link: 'https://fin3.wiselink.net.cn/fin/',
    // 地图基础配置 - 初始位置改为空，后续通过获取当前位置设置
    centerLat: '',
    centerLng: '',
    mapScale: 12,
    // 轨迹线样式 - 关键修改：线条宽度调小（width从12改为4，borderWidth从4改为1）
    polyline: [
      {
        id: 1,
        points: [],
        color: '#00C48C',
        width: 6, // 原12 → 改细
        borderColor: '#FFFFFF',
        borderWidth: 1, // 原4 → 改细
        arrowLine: true,
        lineCap: 'round',
        lineJoin: 'round'
      },
      {
        id: 2,
        points: [],
        color: '#2563EB',
        width: 6, // 原12 → 改细
        borderColor: '#FFFFFF',
        borderWidth: 1, // 原4 → 改细
        arrowLine: false,
        lineCap: 'round',
        lineJoin: 'round'
      }
    ],
    // 车辆标记
    markers: [],
    // 核心状态
    trackPointsWithFixedTime: [], // 现在从接口获取数据
    drawnPoints: [],
    undrawnPoints: [],
    isPlaying: false,
    sliderValue: 0,
    animationTimer: null,
    currentAddress: '',
    lastValidAddress: '', // 新增：存储上一次解析成功的地址
    totalTrackDistance: 0, // 轨迹总距离（公里）
    // 播放速度配置 - 关键修改：更新为要求的速度选项
    speedOptions: [ // 速度值配置：1秒/X公里
      { label: 'x1', value: 2 },
      { label: 'x2', value: 5 },
      { label: 'x3', value: 10 },
      // { label: '1秒/20公里', value: 20 }
    ],
    speedLabels: ['x1', 'x2', 'x3'], // 同步更新标签列表
    selectedSpeed: 2, // 默认选中1秒/2公里
    selectedSpeedLabel: 'x1', // 显示用的标签
    // 新增：轨迹查询相关
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    s_trajectory_show: false,
    // 新增：地址解析节流控制
    lastAddressRequestTime: 0, // 上一次请求地址解析的时间戳
    addressRequestTimer: null // 防抖定时器
  },

  onLoad(options) {
    if (options?.datails) {
      var carItem = JSON.parse(options.datails);
      console.log(options, 'Attached2');
      this.setData({
        cellData: carItem,
      });
    }
    // 关键修改：页面加载时获取当前位置
    this.getLocation();
  },

  // 新增方法：获取当前位置
  getLocation() {
    wx.getLocation({
      type: 'gcj02', // 国测局坐标系，适配微信小程序地图
      success: (res) => {
        this.setData({
          centerLat: res.latitude,
          centerLng: res.longitude
        });
        console.log('获取当前位置成功：', res.latitude, res.longitude);
      },
      fail: (err) => {
        console.error('获取当前位置失败：', err);
        // 失败时使用默认位置兜底
        this.setData({
          centerLat: 39.914885,
          centerLng: 116.403875
        });
        showToast('获取当前位置失败，使用默认位置');
      }
    });
  },
  // 选择日期
  bindTimeChange(evt) {
    const category = evt.currentTarget.dataset.index
    const value = evt.detail.value
    this.setData({
      [category]: value
    })

  },
  handleTrajectory() {
    this.setData({
      s_trajectory_show: true
    }, () => {
      this.handleCurrentDate()
    })
  },

  handleJumpCarList() {
    wx.redirectTo({
      url: '/pages/carManager/carList/carList?source=' + '/pages/trajectoryIndex/index',
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
    // 1. 原逻辑是获取明天，现在改为获取昨天
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1); // 核心修改：日期减1天

    // 2. 重新赋值：昨天作为开始日期，今天作为结束日期
    const yesterdayDate = formatDate(yesterday); // 昨天的日期
    const currentDate = formatDate(now); // 今天的日期
    const currentTime = formatTime(now);

    this.setData({
      startDate: yesterdayDate, // 改为昨天
      endDate: currentDate,     // 改为今天
      startTime: currentTime,
      endTime: currentTime
    });
  },

  // 历史轨迹关闭
  handleHideTrajectory() {
    this.setData({
      s_trajectory_show: false
    })
  },

  // 确认查询历史轨迹
  handleFormSubmit() {
    showLoading();
    const {
      startDate,
      startTime,
      endDate,
      endTime
    } = this.data;
    const sn = this.data.cellData?.sn;
    const url = this.data.c_fin3_link + u_getTrackPlayback.URL;
    const params = {
      [u_getTrackPlayback.sn]: sn,
      [u_getTrackPlayback.startDate]: `${startDate} ${startTime || '00:00:00'}`,
      [u_getTrackPlayback.endDate]: `${endDate} ${endTime || '23:59:59'}`
    };

    if (!sn) {
      hideLoading();
      showToast('请选择车辆');
      return;
    }

    byPost(url, params, response => {
      hideLoading();
      if (response.data?.code == 1000) {
        const { content = [] } = response.data;

        // 空数据处理
        if (content.length === 0) {
          showToast('暂无轨迹数据');
          this.setData({
            trackPointsWithFixedTime: [],
            totalTrackDistance: 0, // 确保空数据时距离为0，避免NaN
            drawnPoints: [],
            undrawnPoints: [],
            polyline: [
              { ...this.data.polyline[0], points: [] },
              { ...this.data.polyline[1], points: [] }
            ]
          });
          return;
        }

        // 处理接口返回的数据，适配原有轨迹播放逻辑
        const trackPointsWithFixedTime = content.map((item, index) => {
          // 确保有时间字段（如果接口返回的item有time字段，直接用；没有则生成）
          let timeStr = item.gpstime || '';
          if (!timeStr) {
            // 如果接口没有返回时间，基于查询时间生成
            const baseTime = new Date(`${startDate} ${startTime}`).getTime();
            const currentTime = new Date(baseTime + index * 1000);
            timeStr = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')} ${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}`;
          }

          return {
            latitude: item.latitude,
            longitude: item.longitude,
            time: timeStr,
            // 保留接口返回的其他字段
            ...item
          };
        });

        // 设置核心轨迹数据
        this.setData({
          trackPointsWithFixedTime,
          s_trajectory_show: false
        }, () => {
          // 初始化轨迹相关计算和渲染
          this.calcTotalTrackDistance(); // 计算总距离
          this.splitTrackPoints(); // 分割已绘制/未绘制点
          this.updatePolyline(); // 更新轨迹线
          this.getAddressByLatLngImmediate(trackPointsWithFixedTime[0]); // 解析初始地址

          // 设置起点终点标记（核心修改：替换为车辆图标）
          const markers = [];
          const includePoints = [];
          trackPointsWithFixedTime.forEach((item, index) => {
            if (index === 0 || index === trackPointsWithFixedTime.length - 1) {
              markers.push({
                id: index,
                width: index === 0 ? 30 : 40, // 调整为和车辆标记一致的尺寸
                height: index === 0 ? 30 : 40,
                // 核心修改：替换起点/终点图标为车辆相关图标
                iconPath: index === 0 ?
                  // 起点车辆图标（绿色）
                  '/assets/images/startPoint1.png' :
                  // 终点车辆图标（红色）
                  'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/car.png',
                latitude: item.latitude,
                longitude: item.longitude,
                anchor: { x: 0.5, y: 0.5 } // 图标锚点居中
              });
            }
            includePoints.push({
              latitude: item.latitude,
              longitude: item.longitude
            });
          });

          // 更新车辆标记（初始位置）和地图视野
          this.setData({
            markers: [
              ...markers,
            ],
            includePoints,
            // 轨迹加载后，地图中心切换到轨迹起点（保留原有逻辑）
            centerLat: trackPointsWithFixedTime[0].latitude,
            centerLng: trackPointsWithFixedTime[0].longitude
          });
        });
      } else {
        showToast(response.data?.msg || '查询失败');
      }
    }, (error) => {
      hideLoading();
      showToast('网络异常，查询失败');
      console.error('轨迹查询接口报错：', error);
    });
  },

  /**
   * 计算两点之间的球面距离（米）
   */
  calcDistance(p1, p2) {
    // 增加参数合法性校验，避免计算NaN
    if (!p1 || !p2 || isNaN(p1.latitude) || isNaN(p1.longitude) || isNaN(p2.latitude) || isNaN(p2.longitude)) {
      return 0;
    }
    const R = 6371000; // 地球半径（米）
    const lat1 = (Math.PI / 180) * p1.latitude;
    const lat2 = (Math.PI / 180) * p2.latitude;
    const lng1 = (Math.PI / 180) * p1.longitude;
    const lng2 = (Math.PI / 180) * p2.longitude;
    const d = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)) * R;
    // 确保计算结果不是NaN
    return isNaN(d) ? 0 : d;
  },

  /**
   * 计算轨迹总距离（公里）
   */
  calcTotalTrackDistance() {
    const { trackPointsWithFixedTime } = this.data;
    if (trackPointsWithFixedTime.length < 2) {
      this.setData({ totalTrackDistance: 0 });
      return;
    }
    let totalDistance = 0;
    for (let i = 0; i < trackPointsWithFixedTime.length - 1; i++) {
      const p1 = trackPointsWithFixedTime[i];
      const p2 = trackPointsWithFixedTime[i + 1];
      totalDistance += this.calcDistance(p1, p2);
    }
    // 关键修改：处理NaN情况，确保结果为数字
    const totalKm = isNaN(totalDistance) ? 0 : (totalDistance / 1000).toFixed(2);
    this.setData({ totalTrackDistance: parseFloat(totalKm) || 0 }); // 转为数字，避免字符串NaN
    console.log(`轨迹总距离计算完成：${this.data.totalTrackDistance} 公里`);
  },

  /**
   * 立即解析初始地址
   */
  getAddressByLatLngImmediate(point) {
    if (!point) return;
    const { latitude, longitude } = point;
    // 增加坐标合法性校验
    if (isNaN(latitude) || isNaN(longitude)) return;
    
    const key = 'W66BZ-ADBC3-COB3F-YWZG4-MAVRO-IJBIM'; // 替换为你的key
    const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${key}&output=json`;
    wx.request({
      url,
      method: 'GET',
      success: (res) => {
        if (res.data.status === 0) {
          // 解析成功：同时更新当前地址和上一次有效地址
          this.setData({
            currentAddress: res.data.result.address,
            lastValidAddress: res.data.result.address
          });
        } else {
          // 解析失败：不更新currentAddress，仅打印日志
          console.error('地址解析失败：', res.data.message);
          // 如果有上一次有效地址，优先使用；否则显示提示
          if (this.data.lastValidAddress) {
            this.setData({
              currentAddress: this.data.lastValidAddress
            });
          } else {
            this.setData({
              currentAddress: '地址解析失败'
            });
          }
        }
      },
      fail: () => {
        // 请求失败：不更新currentAddress，仅打印日志
        console.error('地址解析请求失败');
        // 如果有上一次有效地址，优先使用；否则显示提示
        if (this.data.lastValidAddress) {
          this.setData({
            currentAddress: this.data.lastValidAddress
          });
        } else {
          this.setData({
            currentAddress: '网络异常，解析失败'
          });
        }
      }
    });
  },

  /**
   * 实时地址解析：增加节流控制，每3秒仅请求一次
   */
  getAddressByLatLng(point) {
    if (!point) return;
    const { latitude, longitude } = point;
    // 增加坐标合法性校验
    if (isNaN(latitude) || isNaN(longitude)) return;
    
    const now = Date.now();
    const { lastAddressRequestTime } = this.data;
    
    // 节流控制：距离上次请求不足3秒则不请求
    if (now - lastAddressRequestTime < 1500) {
      return;
    }

    // 更新最后请求时间
    this.setData({ lastAddressRequestTime: now });
    
    const key = 'W66BZ-ADBC3-COB3F-YWZG4-MAVRO-IJBIM';
    const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${key}&output=json`;
    wx.request({
      url,
      method: 'GET',
      success: (res) => {
        if (res.data.status === 0) {
          // 解析成功：同时更新当前地址和上一次有效地址
          this.setData({
            currentAddress: res.data.result.address,
            lastValidAddress: res.data.result.address
          });
        } else {
          // 解析失败：不修改currentAddress，仅打印错误日志
          console.error('地址解析失败：', res.data.message);
        }
      },
      fail: () => {
        // 请求失败：不修改currentAddress，仅打印错误日志
        console.error('地址解析请求失败');
      }
    });
  },

  /**
   * 切换播放速度（适配新的速度选项）
   */
  onSpeedChange(e) {
    // 获取选中的下标
    const selectedIndex = e.detail.value;
    // 根据下标获取对应的速度配置
    const selectedItem = this.data.speedOptions[selectedIndex];
    // 更新选中的速度
    this.setData({
      selectedSpeed: selectedItem.value,
      selectedSpeedLabel: selectedItem.label
    });
    // 如果正在播放，暂停后重新播放（应用新速度）
    if (this.data.isPlaying) {
      clearInterval(this.data.animationTimer);
      this.togglePlayPause(); // 重新触发播放，使用新速度
    }
    console.log(`播放速度切换为：${selectedItem.label}`);
  },

  splitTrackPoints() {
    const { trackPointsWithFixedTime } = this.data;
    if (trackPointsWithFixedTime.length === 0) return;
    this.setData({
      drawnPoints: [trackPointsWithFixedTime[0]],
      undrawnPoints: trackPointsWithFixedTime.slice(1)
    });
  },

  updatePolyline() {
    const { drawnPoints, undrawnPoints } = this.data;
    this.setData({
      'polyline[0].points': drawnPoints,
      'polyline[1].points': undrawnPoints
    });
  },

  /**
   * 核心：根据新的速度规则（1秒/X公里）计算播放时长
   * 播放时长 = 总公里数 / 速度值（X公里/秒）× 1000（转毫秒）
   */
  togglePlayPause() {
    if (this.data.animationTimer) clearInterval(this.data.animationTimer);
    if (this.data.isPlaying) {
      this.setData({ isPlaying: false });
      return;
    }

    const { totalTrackDistance, selectedSpeed, trackPointsWithFixedTime } = this.data;
    // 核心修改：处理totalTrackDistance为0或NaN的情况
    const safeTotalDistance = totalTrackDistance || 0;
    // 核心修改：速度规则变为「1秒/X公里」，总时长 = 总公里数 / X × 1000
    // 例如：100公里 ÷ 5公里/秒 = 20秒 = 20000ms
    const totalPlayTime = (safeTotalDistance / selectedSpeed) * 1000;
    const pointCount = trackPointsWithFixedTime.length;

    // 边界处理
    if (pointCount < 2) {
      wx.showToast({ title: '轨迹点数量不足', icon: 'none' });
      return;
    }

    this.setData({ isPlaying: true });
    // 计算每帧间隔（最小10ms，避免卡顿）
    const frameInterval = Math.max(10, Math.floor(totalPlayTime / pointCount));
    console.log(`播放配置：总时长${totalPlayTime.toFixed(0)}ms | 帧间隔${frameInterval}ms | 速度${selectedSpeed}公里/秒`);

    this.data.animationTimer = setInterval(() => {
      const { undrawnPoints, drawnPoints } = this.data;
      if (undrawnPoints.length === 0) {
        clearInterval(this.data.animationTimer);
        this.setData({ isPlaying: false });
        wx.showToast({
          title: `轨迹播放完成！总耗时${(totalPlayTime / 1000).toFixed(1)}秒`,
          icon: 'none'
        });
        return;
      }
      const nextPoint = undrawnPoints.shift();
      const newDrawn = [...drawnPoints, nextPoint];
      const rotateAngle = newDrawn.length > 1 ? this.calcCarRotateAngle(newDrawn[newDrawn.length - 2], nextPoint) : 0;
      this.setData({
        drawnPoints: newDrawn,
        undrawnPoints: undrawnPoints,
        sliderValue: (newDrawn.length / trackPointsWithFixedTime.length) * 100,
        'markers[1].latitude': nextPoint.latitude, // 修正车辆标记id
        'markers[1].longitude': nextPoint.longitude,
        'markers[1].rotate': rotateAngle,
        centerLat: nextPoint.latitude,
        centerLng: nextPoint.longitude
      }, () => {
        this.updatePolyline();
        this.getAddressByLatLng(nextPoint); // 实时更新地址
      });
    }, frameInterval);
  },

  calcCarRotateAngle(p1, p2) {
    if (!p1 || !p2) return 0;
    // 增加参数合法性校验
    if (isNaN(p1.latitude) || isNaN(p1.longitude) || isNaN(p2.latitude) || isNaN(p2.longitude)) {
      return 0;
    }
    const deltaLng = p2.longitude - p1.longitude;
    const deltaLat = p2.latitude - p1.latitude;
    const radian = Math.atan2(deltaLng, deltaLat);
    return (radian * 180 / Math.PI + 360) % 360;
  },

  onSliderChange(e) {
    const { trackPointsWithFixedTime } = this.data;
    const targetValue = e.detail.value;
    const targetIndex = Math.floor((targetValue / 100) * trackPointsWithFixedTime.length);
    const safeIndex = Math.max(0, Math.min(targetIndex, trackPointsWithFixedTime.length - 1));
    const targetPoint = trackPointsWithFixedTime[safeIndex];
    const newDrawn = trackPointsWithFixedTime.slice(0, safeIndex + 1);
    const newUndrawn = trackPointsWithFixedTime.slice(safeIndex + 1);
    const rotateAngle = newDrawn.length > 1 ? this.calcCarRotateAngle(newDrawn[newDrawn.length - 2], targetPoint) : 0;
    clearInterval(this.data.animationTimer);
    this.setData({
      sliderValue: targetValue,
      drawnPoints: newDrawn,
      undrawnPoints: newUndrawn,
      'markers[1].latitude': targetPoint.latitude, // 修正车辆标记id
      'markers[1].longitude': targetPoint.longitude,
      'markers[1].rotate': rotateAngle,
      centerLat: targetPoint.latitude,
      centerLng: targetPoint.longitude,
      isPlaying: false
    }, () => {
      this.updatePolyline();
      this.getAddressByLatLng(targetPoint);
    });
  },

  onUnload() {
    clearInterval(this.data.animationTimer);
    // 清理地址解析定时器
    if (this.data.addressRequestTimer) {
      clearTimeout(this.data.addressRequestTimer);
    }
  },

  onHide() {
    if (this.data.isPlaying) this.togglePlayPause();
  }
});