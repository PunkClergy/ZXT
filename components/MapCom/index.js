import {
  _getSourceStrategyMap,
  _validateVehicleSn,
  _showLoadingWithFallback,
  _getTargetMarkerSn,
  _buildControlRequestParams
} from 'z-utility';
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
  u_verifyControlcode,
  u_operation,
  u_getCarPoisiton,
  u_getTrackPlayback,
  u_RequestCarList,
  u_getAllCarPoisiton,
  u_getCarPoisitonDesk
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
    },
    // 是否显示底部
    isfooter: {
      type: Boolean,
      value: true
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
          const handlerMethod = {
            carDetail: 'handleCarDetail',
            sending: 'handleLocation',
            desk: 'handleLocation'
          }[source];
          this[handlerMethod]();
          return;
        }
        const SOURCE_HANDLERS = {
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

        const handlerConfig = SOURCE_HANDLERS[source];

        if (handlerConfig) {
          const {
            method
          } = handlerConfig;
          if (typeof this[method] === 'function') {
            this[method](sn);
          }
        }
      } catch (error) {
        showToast('初始化失败，请刷新重试');
      }

      this.handleCurrentDate()
    }
  },
  data: {
    scale: 16, //地图缩方比例
    polyline: [], //轨迹集合
    includePoints: [],
    currentSelectControlType: '-4', //当前选择网络或蓝牙
    showModalState: false, //车辆状态弹窗显隐
    infoShowModal: false,//公司信息弹出显示和隐藏
    statusInfo: {}, //车辆状态数据
    s_trajectory_show: false, //历史轨迹弹窗状态
    startDate: '2025-03-21', //历史轨迹查询时间
    startTime: '19:00', //历史轨迹查询时间
    endDate: '2025-03-20', //历史轨迹查询时间
    endTime: '19:00', //历史轨迹查询时间
    requestPointLineUrl: 'https://apis.map.qq.com/ws/direction/v1/walking', //路线规划API地址
    key: 'W66BZ-ADBC3-COB3F-YWZG4-MAVRO-IJBIM', //腾讯地图KEY
    routeColor: '#3893F9',
    a_deputy_latitude: null, //当前手机所在位置
    a_deputy_longitude: null, //当前手机所在位置
    latitude: null, //当前车辆所在位置
    longitude: null, //当前车辆在位置
    g_leaseTime: null, //当前车辆租用时间
    g_images: null, //当前车辆照片
    c_k1sw_link: 'https://k1sw.wiselink.net.cn/', //域名
    c_fin3_link: 'https://fin3.wiselink.net.cn/fin/',
    blueKey: '', //蓝牙密码
    idc: '', //设备唯一标志
    qu_num: 0,//点击问号展示
    companyInfo: {},//公司信息

  },

  methods: {
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
        startDate: currentDate, // 今天作为开始日期
        endDate: tomorrowDate, // 明天作为结束日期
        startTime: currentTime,
        endTime: currentTime
      });
    },
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

    // 点击 按钮 "当前位置" 执行方法
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
      const _this = this;
      let isLoadingCompleted = false;
      const loadingTimer = setTimeout(() => safeHideLoading(), 10000);
      const markerStyle = {
        common: {
          width: 18,
          height: 35,
          iconPath: "/assets/images/startPoint.png"
        },
        user: {
          width: 25,
          height: 37,
          iconPath: "/assets/images/startPoint1.png"
        }
      };
      const safeHideLoading = () => {
        if (!isLoadingCompleted) {
          clearTimeout(loadingTimer);
          hideLoading();
          isLoadingCompleted = true;
        }
      };
      const handleError = (msg) => {
        wx.showToast({
          title: msg,
          icon: 'none'
        });
        safeHideLoading();
      };
      const createCallout = (car) => {
        return `${car?.plateNumber || _this.data.g_plateNumber || ''}
    当前位置：${car?.address || '未知'}
    定位时间：${car?.showtime || '未知'}`;
      };
      showLoading('加载中...');
      byGet(`${this.data.c_k1sw_link}${u_getAllCarPoisiton.URL}`, {}).then(allRes => {
        if (allRes?.statusCode !== 200) {
          throw new Error('周边车辆获取失败');
        }

        const allCars = allRes.data?.content || [];
        console.log(allCars)
        const otherMarkers = allCars.map((car, index) => ({
          ...car,
          ...markerStyle.common,
          id: index + 1,
          latitude: car.tlatitude || 0,
          longitude: car.tlongitude || 0,
          sn: car.sn,
          callout: {
            content: createCallout(car),
            display: 'BYCLICK',
            padding: 8
          },
          deviceType: car?.deviceType
        }));

        const processMain = () => {
          if (evt) {
            byPost(
              `${_this.data.c_k1sw_link}${u_getCarPoisiton.URL}`, {
              [u_getCarPoisiton.sn]: evt
            },
              (mainRes) => {
                if (mainRes?.data.code !== 1000) {
                  return handleError('主车辆数据异常');
                }

                const mainCar = mainRes.data.content || {};
                const mainMarker = {
                  ...markerStyle.common,
                  id: 0,
                  latitude: mainCar.tlatitude || 0,
                  longitude: mainCar.tlongitude || 0,
                  sn: evt,
                  callout: {
                    content: createCallout(mainCar),
                    display: 'ALWAYS',
                    padding: 8
                  }
                };
                _this.setData({
                  a_deputy_latitude: mainCar.tlatitude,
                  a_deputy_longitude: mainCar.tlongitude,
                  latitude: mainCar.tlatitude,
                  longitude: mainCar.tlongitude,
                  blueKey: mainCar?.blueKey,
                  markers: [mainMarker, ...otherMarkers],
                  deviceType: mainCar?.deviceType
                });
                safeHideLoading();
              }
            );
          } else {
            wx.getLocation({
              type: 'gcj02',
              success: (res) => {
                const userMarker = {
                  ...markerStyle.user,
                  id: 0,
                  latitude: res.latitude,
                  longitude: res.longitude,
                  title: '我的位置'
                };
                _this.setData({
                  scale: 12,
                  latitude: res.latitude,
                  longitude: res.longitude,
                  markers: [userMarker, ...otherMarkers]
                });
                safeHideLoading();
              },
              fail: () => handleError('定位失败')
            });
          }
        };

        processMain();
      }).catch(err => handleError(err.message));
    },

    // 点击地图车辆标记点
    handleOnMarkerTap(evt) {
      console.log(evt)
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
          this.data.markers?.forEach((item) => {
            if (item?.id == markerId) {
              this.setData({
                markers: updatedMarkers,
                showModalState: false,
                idc: item?.idc,
                blueKey: item?.blueKey,
                deviceType: item?.deviceType
              }, () => {
                console.log(this.data)
                this.triggerEvent('myMethod', {
                  info: updatedMarkers.find(item => item?.callout?.display == 'ALWAYS')
                });
              });
            }
          })


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
    // 公司信息显示隐藏
    handleCarInfo() {
      this.setData({
        infoShowModal: true
      })
    },
    // 点击 按钮"车辆状态" 执行方法
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
        hideLoading()
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

    // 关闭车辆状态弹窗 执行方法
    handleHideShowModal() {
      console.log(this.data, '22222')
      this.setData({
        showModalState: false,
        infoShowModal: false
      })
    },

    // 底部 "按钮" 操作 //
    handleFooterBtn(evt) {
      const _safeHideLoading = () => {
        try {
          hideLoading();
        } catch (e) {
          console.warn('隐藏加载状态失败:', e);
        }
      };

      const _handleControlError = (error) => {
        showToast(error.message || '控制请求异常');
      };

      const _handleCoreControlLogic = (evt) => {
        // 显示加载状态，失败则直接返回
        if (!_showLoadingWithFallback(showLoading)) return;

        try {
          // 获取目标设备SN
          const sn = _getTargetMarkerSn(this.data.markers || []);
          if (!sn) {
            showToast('未找到有效设备标识');
            _safeHideLoading();
            return;
          }

          // 获取控制类型
          const controlType = Number(evt?.currentTarget?.id) || 0;

          // 蓝牙操作分支
          if (this.data.currentSelectControlType === '-5') {
            this.handleExecuteBluetooth(controlType);
            return;
          }

          // 网络操作分支（内联原_handleNetworkModeControl逻辑）
          if (this.data.currentSelectControlType === '-4') {
            const requestParams = _buildControlRequestParams(controlType, sn);
            byPost(
              `${this.data.c_k1sw_link}${u_operation.URL}`,
              requestParams,
              (response) => {
                _safeHideLoading();
                try {
                  if (response?.data?.code == 200) {
                    // 根据控制类型生成成功提示
                    const successMsg = requestParams[u_operation.operationType] === 5
                      ? '寻车成功，请注意附近鸣笛车辆!'
                      : '控制成功!';
                    showToast(successMsg);
                  } else {
                    showToast(response?.data?.msg);
                  }

                } catch (error) {
                  _handleControlError(error);
                }
              }
            );
          }
        } catch (error) {
          _handleControlError(error);
          _safeHideLoading();
        }
      };

      const handleDeskSource = () => {
        byPost(
          `${this.data.c_k1sw_link}${u_verifyControlcode.URL}`,
          { code: this?.data?.sn || '' },
          (response) => {
            if (response?.data?.code === 1000) {
              _handleCoreControlLogic(evt);
            } else {
              showToast(response?.data?.msg);
            }
          }
        );
      };

      const handleNormalSource = () => {
        _handleCoreControlLogic(evt);
      };

      if (!_validateVehicleSn(this.data.sn, showToast)) return;
      const source = this.data.source;
      const strategyMap = _getSourceStrategyMap(handleDeskSource, handleNormalSource);
      const strategy = strategyMap[source] || strategyMap.normal;
      strategy?.call(this);
    },
    // 蓝牙控制车辆
    handleExecuteBluetooth(type) {
      console.log(this.data.idc || `19${this.data.sn}`, this.data.blueKey, '蓝牙设备号和密钥', this?.data?.deviceType)
      const COMMAND_MAPPING = {
        5: 5, // 远程寻车
        1: (this?.data?.deviceType == 'F1' || this?.data?.deviceType == 'F0') ? 4 : 3, // 锁门
        3: this?.data?.deviceType == 'F1' ? 1 : 2, // 开门
        6: 10,//取消拦截
        8: 11//风控拦截
      };

      const BLUETOOTH_HANDLERS = {
        [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE]: () => {
          showLoading('指令执行中...');
        },
        [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR]: () => {
          hideLoading();
        },
        [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE]: () => {
          showToast('请打开蓝牙', false);
          hideLoading();
        },
        [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND]: () => {
          // this.isAndroid6((isAndroid) => {
          //   const message = isAndroid ?
          //     '请确定已经打开手机定位和微信定位权限!' :
          //     '请重试!';
          //     showToast(`没有发现设备，${message}`, false);
          // });
          hideLoading();
        },
        [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED]: () => {
          showToast('蓝牙连接失败，请重试!', false);
          hideLoading();
        },
        [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED]: () => {
          showToast('您的手机不支持低功耗蓝牙', false);
          hideLoading();
        },
        [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED]: () => {
          showToast('数据发送失败，请重试!', false);
          hideLoading();
        },
        [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE]: () => {
          showToast('设备超时无响应，请重试!', false);
          hideLoading();
        }
      };

      try {
        if (!COMMAND_MAPPING.hasOwnProperty(type)) return;
        const command = COMMAND_MAPPING[type];
        if (type == 5) {
          bleManager.sendData(
            this.data.idc || `19${this.data.sn}`,
            this.data.blueKey,
            command,
            state => BLUETOOTH_HANDLERS[state]?.(),
            data => {
              hideLoading()
              if (data.controlType === 4) {
                showToast(data.result);
                if (data.result.includes("控制成功")) {
                  // 上传服务器逻辑
                }
              }
            }
          );
          return;
        }
        if (type == 8 || type == 6) {
          console.log(12323232323)
          bleManager.sendData(
            this.data.idc || `19${this.data.sn}`,
            this.data.blueKey,
            command,
            state => BLUETOOTH_HANDLERS[state]?.(),
            data => {
              hideLoading()
              if (data.controlType === 4) {
                showToast(data.result);
                if (data.result.includes("控制成功")) {
                  // 上传服务器逻辑
                }
              }
            }
          );
          return;
        }
        if ([1, 3].includes(type)) {
          bleManager.sendData(this.data.idc || `19${this.data.sn}`, this.data.blueKey, command, state => BLUETOOTH_HANDLERS[state]?.(), data => {
            hideLoading();
            if (data.controlType === 4) {
              showToast(data.result);
              if (data.result.includes("控制成功")) {
                // 上传服务器逻辑
              }
            }
          });
        }
      } finally {
        //  统一清理 (如果需要)
      }
    },
    // 租车人电子钥匙功能执行方法
    handleGetCarPostion(evt) {
      const _this = this;
      showLoading("加载中...");
      const param = {
        [u_getCarPoisitonDesk.sn]: evt
      };
      byPost(this.data.c_fin3_link + u_getCarPoisitonDesk.URL, param, (response) => {
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
            content: `${content?.plateNumber || _this.data.g_plateNumber || ''}\n当前位置：${content?.address}\r\n定位时间：${content?.showtime}`, // 使用模板字符串提升可读性
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
      }, () => {
        this.handleCurrentDate()
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
      if (!sn) {
        showToast('请选择车辆')
        return
      }
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
      if (evt.length < 6) {
        this.handleLocation()
        return
      }

      byPost(this.data.c_k1sw_link + u_RequestCarList.REQUEST_API, param, (response) => {
        hideLoading();
        const resn = response?.data?.content

        if (response?.data?.code == 1000) {
          this.setData({
            g_leaseTime: {
              startDate: response.data.content.startDate.slice(0, 16),
              endDate: response.data.content.endDate.slice(0, 16),
            },
            g_images: [
              resn?.uploadImgUrl,
              resn?.uploadImgUrlFive,
              resn?.uploadImgUrlFour,
              resn?.uploadImgUrlThree,
              resn?.uploadImgUrlTwo
            ],
            g_plateNumber: resn.plateNumber,
            blueKey: resn?.blueKey,
            idc: resn.idc,
            deviceType: resn.deviceType,
            companyInfo: resn?.rentCompany,//车辆所属公司
          }, () => {
            this.handleGetCarPostion(response?.data?.content?.sn)
            if (response?.data?.content?.sn) {
              wx.setStorageSync('networkBlue', response?.data?.content)
            }
          })
        } else {
          evt.length > 6 && showToast(response?.data?.msg || '请求失败')
          wx.removeStorage({
            key: 'scene',
          });
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
      console.log()
      if (!this.data.sn) {
        return
      }
      console.log(this.data.latitude, this.data.longitude)
      wx.openLocation({
        latitude: Number(this.data.cellData.latitude || this.data.latitude),
        longitude: Number(this.data.cellData.longitude || this.data.longitude),
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
          appUtil.showModal('路线数据无效', false, () => { });
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
      if (!this.data.sn) {
        showToast('无可用车辆')
        return
      }
      wx.navigateTo({
        url: `/pages/upload-img/upload-img?type=${SHOW_TYPE?.DRIVINGCARD_TYPE}&code=${this.data.sn}`
      })
    },
    // 查看照片
    handleViewPhotos() {
      console.log(this.data)
      if (!this.data.sn) {
        showToast('无可用车辆')
        return
      }
      console.log()
      const images = this.data.g_images.map(ele => {
        let temp = this.data.c_fin3_link + ele.replace(/\\/g, "/")
        console.log(temp)
        return temp
      })
      wx.previewImage({
        urls: images // 需要预览的图片http链接列表
      });
    },
    // 归还车辆父页面需要调用的方法
    childMethod() {
      this.setData({
        g_leaseTime: false,
        markers: null,
        sn: null,
        polyline: []
      }, () => {
        this.handleLocation()
      })
    },
    // 点击问号执行事件
    handleQuestionMark(evt) {
      const num = evt?.currentTarget?.dataset?.num;
      if (!num) return;

      // 清除之前的定时器
      if (this.questionMarkTimer) {
        clearTimeout(this.questionMarkTimer);
      }

      this.setData({ qu_num: num }, () => {
        this.questionMarkTimer = setTimeout(() => {
          this.setData({ qu_num: 0 });
          this.questionMarkTimer = null;
        }, 3000);
      });
    }
  }
})