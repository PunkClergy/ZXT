const appUtil = require('../../utils/app-util.js');
const {
  SHOW_TYPE
} = require('../../utils/Inspect/constant')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const bleManager = require('../../utils/ble-manager.js');
const {
  u_getCarStatus,
  u_operation,
  u_getCarPoisiton,
  u_getTrackPlayback,
  u_RequestCarList,
  u_getAllCarPoisiton
} = require('../../utils/request/map')
const {
  byPost,
  byGet
} = require('../../utils/request/http')
Component({

  properties: {
    // 车辆详情
    cellData: {
      type: Object,
      value: null
    },
    // 车辆SN  当前所有的sn都为模拟数据
    sn: {
      type: String,
      value: null
    },
    // 父级来源
    source: {
      type: String,
      value: null
    }
  },
  lifetimes: {
    ready() {
      try {
        const {
          sn,
          source
        } = this.data;
        if (!sn) {
          this.handleLocation()
          return;
        }

        const sourceHandlers = {
          desk: {
            method: 'handleSearchLink',
            description: '首页桌面入口处理'
          },
          sending: {
            method: 'handleGetCarPostion',
            description: '租车人发送电子钥匙'
          },
          carDetail: {
            method: 'handleCarDetail',
            description: '车辆风控处理'
          }
        };

        const handlerConfig = sourceHandlers[source];
        if (handlerConfig) {

          if (typeof this[handlerConfig.method] === 'function') {
            this[handlerConfig.method](sn);
          }
        }
      } catch (error) {
        showToast('初始化失败，请刷新重试');
      }
    }
  },
  data: {
    scale: 16,
    polyline: [],
    includePoints: [],
    currentSelectControlType: '-4', //当前选择网络或蓝牙
    showModalState: false, //车辆状态弹窗显隐
    statusInfo: {}, //车辆状态数据
    s_trajectory_show: false, //历史轨迹弹窗状态
    startDate: '2025-03-20', //历史轨迹查询时间
    startTime: '19:00', //历史轨迹查询时间
    endDate: '2025-03-20', //历史轨迹查询时间
    endTime: '19:00', //历史轨迹查询时间
    requestPointLineUrl: 'https://apis.map.qq.com/ws/direction/v1/walking',
    key: 'W66BZ-ADBC3-COB3F-YWZG4-MAVRO-IJBIM', //腾讯地图KEY
    routeColor: '#3893F9',
    a_deputy_latitude: null, //当前手机所在位置
    a_deputy_longitude: null, //当前手机所在位置
    latitude: null, //当前车辆所在位置
    longitude: null, //当前车辆在位置
    g_leaseTime: null,
    c_k1sw_link: 'https://k1sw.wiselink.net.cn/', //域名
    c_fin3_link: 'https://fin3.wiselink.net.cn/fin/'

  },

  methods: {
    // 获取当前硬件设备定位
    handleLocation() {
      const _this = this
      wx.getLocation({
        type: 'gcj02', // 返回可以用于wx.openLocation的经纬度
        success(res) {
          const latitude = res.latitude
          const longitude = res.longitude
          const markerList = [{
            id: 0,
            longitude,
            latitude,
            iconPath: '/assets/images/startPoint1.png', // 用户位置图标
            width: 25,
            height: 37,
            title: '我的位置',
          }]
          _this.setData({
            latitude: latitude,
            longitude: longitude,
            markers: markerList
          });
        }
      })
    },
    // 当前位置
    handleCurrentLocation() {
      try {
        const {
          markers,
          latitude,
          longitude
        } = this.data;
        const updatedMarkers = markers.map(marker => ({
          ...marker,
          callout: {
            ...(marker.callout || {}),
            display: marker.id === 0 ? 'ALWAYS' : 'BYCLICK'
          }
        }));
        const updateData = {
          markers: updatedMarkers
        };
        this.setData({
          ...updateData,
          latitude,
          longitude
        });
      } catch (error) {
        showToast('状态更新失败');
      }
    },
    // 车辆风控查询多辆车位置
    handleCarDetail(evt) {
      if (!!evt) {
        const _this = this;
        let isLoadingCompleted = false;
        const handleError = (errorMsg) => {
          showToast(errorMsg);
          safeHideLoading();
        };
        const safeHideLoading = () => {
          if (!isLoadingCompleted) {
            hideLoading();
            isLoadingCompleted = true;
          }
        };
        showLoading("加载中...");
        byPost(this.data.c_k1sw_link + u_getCarPoisiton.URL, {
          [u_getCarPoisiton.sn]: evt
          // [u_getCarPoisiton.sn]: '640019899'
        }, (currentResponse) => {
          if (currentResponse?.data.code !== 1000) {
            return handleError('主车辆数据获取失败');
          }
          const mainCar = currentResponse.data?.content || {};
          const mainMarker = {
            id: 0,
            width: 18,
            height: 35,
            iconPath: "/assets/images/startPoint.png",
            latitude: mainCar?.tlatitude || 0,
            longitude: mainCar?.tlongitude || 0,
            sn: evt,
            callout: {
              content: `当前位置：${mainCar?.address || '未知'}\n定位时间：${mainCar?.showtime || '未知'}`,
              display: 'ALWAYS',
              padding: 8
            }
          };
          byGet(this.data.c_k1sw_link + u_getAllCarPoisiton.URL, {}).then(allCarsResponse => {
            if (allCarsResponse?.statusCode !== 200) {
              return handleError('周边车辆数据获取失败');
            }
            const allCars = allCarsResponse.data?.content || [];
            const otherMarkers = allCars.map((car, index) => ({
              id: index + 1,
              longitude: car?.tlongitude || 0,
              latitude: car?.tlatitude || 0,
              iconPath: '/assets/images/startPoint.png',
              width: 18,
              height: 35,
              sn: car.sn,
              callout: {
                content: `当前位置：${car?.address || '未知'}\n定位时间：${car?.showtime || '未知'}`,
                display: 'BYCLICK',
                padding: 8
              }
            }));
            _this.setData({
              a_deputy_latitude: mainCar.tlatitude || 0,
              a_deputy_longitude: mainCar.tlongitude || 0,
              latitude: mainCar.tlatitude || 0,
              longitude: mainCar.tlongitude || 0,
              markers: [mainMarker, ...otherMarkers]
            });
            safeHideLoading();
          });
        });
        setTimeout(safeHideLoading, 10000);
      }
    },
    // 点击标记点
    handleOnMarkerTap(evt) {
      if (this.data.source == 'carDetail') {
        try {
          const {
            markerId
          } = evt.detail;
          const {
            markers
          } = this.data;
          const updatedMarkers = markers.map(marker => {
            const callout = {
              ...(marker.callout || {})
            };
            callout.display = marker.id === markerId ? 'ALWAYS' : 'BYCLICK';
            return {
              ...marker,
              callout,
            };
          });
          if (JSON.stringify(this.data.markers) !== JSON.stringify(updatedMarkers)) {
            this.setData({
              markers: updatedMarkers,
              showModalState: false
            });
          }
        } catch (error) {
          showToast('操作失败，请重试');
        }
      }
    },
    // 切换蓝牙和网络模式
    handleControl(evt) {
      const control_id = evt.currentTarget.id;
      const _this = this;
      if (control_id == _this.data.currentSelectControlType) return;
      const showToastAndSetData = (message, newControlType) => {
        showToast(message);
        _this.setData({
          currentSelectControlType: newControlType
        });
      };
      switch (control_id) {
        case '-4':
          showToastAndSetData('已经切换成网络控车模式', control_id);
          bleManager.releaseBle();
          break;
        case '-5':
          showToastAndSetData('已经切换成蓝牙控车模式', control_id);
          break;
        default:
      }
    },
    // 点击查看车辆状态
    handleCarStatus() {
      const {
        markers = [], showModalState
      } = this.data;
      if (showModalState) {
        this.setData({
          showModalState: false
        });
        return;
      }
      const targetMarker = markers.find(marker => marker?.callout?.display === 'ALWAYS');
      const sn = targetMarker?.sn ?? '';
      if (!sn) {
        showToast('未找到车辆信息');
        return;
      }
      showLoading('加载中...');
      const requestParam = {
        [u_getCarStatus.sn]: sn
      };
      const apiUrl = `${this.data.c_k1sw_link}${u_getCarStatus.URL}`;
      byPost(apiUrl, requestParam, (response) => {
        if (response.data.code !== 1000) {
          showToast(response.data.msg);
          return
        }
        this.setData({
          statusInfo: response.data.content,
          showModalState: true
        });
      }, (error) => {
        showToast('获取信息失败，请重试');
      }, () => {
        hideLoading();
      });
    },
    // 点击关闭车辆状态弹窗
    handleHideShowModal() {
      this.setData({
        showModalState: false
      })
    },
    //底部操作
    handleFooterBtn(evt) {
      const showLoadingWithFallback = () => {
        try {
          showLoading('正在控制...');
          return true;
        } catch (e) {
          console.error('加载状态异常:', e);
          return false;
        }
      };
      const handleError = (error) => {
        console.error('控制操作失败:', error);
        showToast(error.message || '控制请求异常');
      };
      const safeHideLoading = () => {
        try {
          hideLoading();
        } catch (e) {
          console.warn('隐藏加载状态失败:', e);
        }
      };
      try {
        if (!showLoadingWithFallback()) return;
        const {
          markers = []
        } = this.data;
        const targetMarker = markers.find(marker =>
          marker?.callout?.display === 'ALWAYS'
        );
        const sn = targetMarker?.sn?.trim() ?? '';
        if (!sn) {
          showToast('未找到有效设备标识');
          return safeHideLoading();
        }
        const controlType = Number(evt?.currentTarget?.id) || 0;
        if (![1, 2, 3, 4, 5].includes(controlType)) {
          showToast('无效的控制类型');
          return safeHideLoading();
        }
        const requestParam = {
          [u_operation.sn]: sn,
          [u_operation.operationType]: controlType,
          _timestamp: Date.now()
        };
        byPost(
          `${this.data.c_k1sw_link}${u_operation.URL}`,
          requestParam,
          (response) => {
            safeHideLoading();
            try {
              if (!response) {
                throw new Error('空响应数据');
              }
              if (response.statusCode !== 200) {
                throw new Error(`网络异常[${response.statusCode}]`);
              }
              if (response.data?.code !== 1000) {
                const errorMsg = response.data?.msg || '未知业务错误';
                throw new Error(`[${response.data.code}]${errorMsg}`);
              }
              const successMessage = controlType === 5 ?
                '寻车成功，请注意附近鸣笛车辆!' :
                '控制成功!';
              showToast(successMessage);
            } catch (error) {
              handleError(error);
            }
          }
        );
      } catch (error) {
        handleError(error);
        safeHideLoading();
      }
    },
    // 获取当前位置
    handleGetCarPostion(evt) {
      const _this = this;
      showLoading("加载中...");
      const param = {
        [u_getCarPoisiton.sn]: evt
        // [u_getCarPoisiton.sn]: '640019899'
      };
      byPost(this.data.c_fin3_link + u_getCarPoisiton.URL, param, (response) => {
        hideLoading();
        const content = response?.data?.content;
        const markerList = [{
          id: 1,
          width: 18,
          height: 35,
          sn: evt,
          iconPath: "/assets/images/startPoint.png",
          latitude: content?.tlatitude,
          longitude: content?.tlongitude,
          callout: {
            content: `当前位置：${content?.address}\r\n定位时间：${content?.showtime}`, // 使用模板字符串提升可读性
            display: 'ALWAYS',
            padding: 8
          }
        }];
        if (_this.data.source == 'desk') {
          wx.getLocation({
            type: 'gcj02', // 返回可以用于wx.openLocation的经纬度
            success(res) {

              const latitude = res.latitude
              const longitude = res.longitude
              markerList.push({
                id: 0,
                longitude,
                latitude,
                iconPath: '/assets/images/startPoint1.png', // 用户位置图标
                width: 25,
                height: 37,
                title: '我的位置',
              })
              _this.setData({
                a_deputy_latitude: latitude,
                a_deputy_longitude: longitude,
                latitude: content?.tlatitude || latitude,
                longitude: content?.tlongitude || longitude,
                markers: markerList
              }, () => {
                _this.handleGetWalkingRoute()
              });
            }
          })
        } else {
          _this.setData({
            a_deputy_latitude: content?.tlatitude,
            a_deputy_longitude: content?.tlongitude,
            latitude: content?.tlatitude,
            longitude: content?.tlongitude,
            markers: markerList
          });
        }
      });
    },
    // 历史轨迹显示
    handleTrajectory() {
      this.setData({
        s_trajectory_show: true
      })
    },
    // 历史轨迹关闭
    handleHideTrajectory() {
      this.setData({
        s_trajectory_show: false
      })
    },
    // 选择日期
    bindTimeChange(evt) {
      const category = evt.currentTarget.dataset.index
      const value = evt.detail.value
      this.setData({
        [category]: value
      })

    },
    // 确认查询历史轨迹
    handleFormSubmit() {
      showLoading();
      const {
        startDate,
        startTime,
        endDate,
        endTime,
        markers = []
      } = this.data;
      const targetMarker = markers.find(marker => marker?.callout?.display === 'ALWAYS');
      const sn = targetMarker?.sn ?? '';
      const url = this.data.c_fin3_link + u_getTrackPlayback.URL;
      const params = {
        [u_getTrackPlayback.sn]: sn,
        [u_getTrackPlayback.startDate]: `${startDate} ${startTime || '00:00:00'}`,
        [u_getTrackPlayback.endDate]: `${endDate} ${endTime || '23:59:59'}`
      };
      byPost(url, params, response => {
        hideLoading();
        if (response.data?.code == 1000) {
          const {
            content = []
          } = response.data;
          const markers = [];
          const includePoints = [];
          const points = [];

          content.forEach((item, index) => {
            if (index === 0 || index === content.length - 1) {
              markers.push({
                id: index,
                width: 25,
                height: 37,
                iconPath: index === 0 ?
                  "/assets/images/startPoint.png" : "/assets/images/endPoint.png",
                latitude: item.latitude,
                longitude: item.longitude
              });
            }
            const point = {
              latitude: item.latitude,
              longitude: item.longitude
            };
            points.push(point);
            includePoints.push(point);
          });
          this.setData({
            s_trajectory_show: false,
            markers,
            includePoints,
            polyline: [{
              points,
              color: '#3893F9',
              width: 5,
              arrowLine: true
            }]
          });
        } else {
          showToast(response.data.msg)
        }
      });
    },
    // 根据链接找寻车辆位置
    handleSearchLink(evt) {
      const param = {
        [u_RequestCarList.CODE]: evt
      }
      byPost(this.data.c_fin3_link + u_RequestCarList.REQUEST_API, param, (response) => {
        hideLoading();
        if (response?.data?.code == 1000) {
          this.setData({
            g_leaseTime: {
              startDate: response.data.content.startDate.slice(0, 16),
              endDate: response.data.content.endDate.slice(0, 16)
            }
          }, () => {
            this.handleGetCarPostion(response?.data?.content?.sn)
          })
        } else {
          showToast(response?.data?.msg || '请求失败')
          this.handleLocation()
        }
      });
    },
    // 点击按钮回到当前车辆位置
    handleReturnToVehicle() {
      this.setData({
        latitude: this.data.latitude,
        longitude: this.data.longitude,
      });
    },
    // 开始导航
    handleStartNavigation() {
      wx.openLocation({
        latitude: Number(this.data.latitude),
        longitude: Number(this.data.longitude),
        scale: 18
      })
    },
    // 规划步行路线
    handleGetWalkingRoute() {
      const {
        a_deputy_latitude,
        a_deputy_longitude,
        latitude,
        longitude,
        key,
        requestPointLineUrl,
        routeColor,
        routeWidth
      } = this.data;
      const startPoint = {
        latitude: a_deputy_latitude,
        longitude: a_deputy_longitude
      };
      const endPoint = {
        latitude,
        longitude
      };
      const trajectoryPoints = [];
      const routeLines = [];

      const requestParams = {
        from: `${startPoint.latitude},${startPoint.longitude}`,
        to: `${endPoint.latitude},${endPoint.longitude}`,
        key,
      };

      showLoading('获取到达车辆路线');

      appUtil.byGet(requestPointLineUrl, requestParams, (response) => {
        hideLoading();

        if (response.statusCode !== 200 || !response.data || response.data.status !== 0 || !Array.isArray(response.data.result?.routes) || response.data.result.routes.length === 0) {
          return;
        }

        const polylineData = response.data.result.routes[0].polyline;
        if (!Array.isArray(polylineData) || polylineData.length < 2) {
          appUtil.showModal('路线数据无效', false, () => {});
          return;
        }

        trajectoryPoints.push({
          latitude: polylineData[0],
          longitude: polylineData[1]
        });

        for (let i = 2; i < polylineData.length; i++) {
          polylineData[i] = polylineData[i - 2] + polylineData[i] / 1000000;
          if (i % 2 !== 0) {
            trajectoryPoints.push({
              latitude: polylineData[i - 1],
              longitude: polylineData[i]
            });
          }
        }

        routeLines.push({
          points: trajectoryPoints,
          color: routeColor,
          width: routeWidth,
        });

        this.setData({
          polyline: routeLines
        });
      });
    },
    // 归还车辆
    handleReturningVehicles() {
      wx.navigateTo({
        url: `/pages/upload-img/upload-img?type=${SHOW_TYPE?.DRIVINGCARD_TYPE}&code=${this.data.sn}`
      })
    }
  }
})