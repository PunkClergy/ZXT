//工具
const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
const bleManager = require('../../../utils/ble-manager.js');
//腾讯地图微信小程序支持包
const QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
var qqmapsdk;
var mapCtx;
var that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度

    mapHeight: 0,
    //当前位置信息
    latitude: '39.915077',
    longitude: '116.403838',
    markers: [],
    includePoints: [],
    polyline: [],
    mapId: 'map',
    scale: 16,
    //腾讯移动端key(日调用量：1万次 / Key , 5次 / key / 秒)
    key: 'W66BZ-ADBC3-COB3F-YWZG4-MAVRO-IJBIM',
    arcImage: '../../assets/images/control_up_bg.png',
    arcHeight: 49,
    coverHeight: 230,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    cellData: {},
    currentSn: '',

    showModal: false,
    carStatus: {},
    //默认网络控车
    currentSelectControlType: -4,
    networkControlId: -4,
    bluetoothControlId: -5,
  },

  handleChildEvent(evt) {
    this.setData({
      cellData: evt?.detail?.info
    })
  },
  handleJumpCarList() {
    wx.redirectTo({
      url: '/pages/carManager/carList/carList?source=' + '/pages/riskControl/GPSTrajectory/index',
    })
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;


    if (options?.datails) {
      var carItem = JSON.parse(options.datails);
      console.log(options, 'Attached2')
      that.setData({
        cellData: carItem,
      })
    }



    console.log(that.data.cellData.platenumber);
    that.nowTime();
    that.initMap();
    // that.getCarPostion();
    that.requestAllCarPosition();
  },

  requestAllCarPosition: function () {

    appUtil.showLoading('获取车辆位置');
    var markerList = []; //所有marker
    var includePointsList = []; //所有点
    var showCarsList = []; //所有车辆信息



    var param = {};
    // "http://localhost:8689/carapi/getAllCarPoisiton"
    // getApp().data.k1swUrl + urlUtil.RequestCarList2.REQUEST_API
    const requestCarLocation = appUtil.byGet(getApp().data.k1swUrl + urlUtil.RequestCarList2.REQUEST_API, param, function (res) {
      appUtil.hideLoading();
      var firstCarInfo;
      var index = -1;
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == 1000) {
          //数据返回成功
          var cars = data.content;
          for (var index in cars) {
            var car = cars[index];

            that.saveControlPwd(car.sn, car.blueKey); //保存蓝牙密码
            // that.showCarView(true);
            var carInfo = that.generateShowCarInfo(car);
            showCarsList.push(carInfo);
            var point = that.generatePoint(car.tlatitude, car.tlongitude);
            includePointsList.push(point);
            //划线
            // var fromPosition = that.generatePoint(that.data.latitude, that.data.longitude);
            // var toPosition = that.generatePoint(car.tlatitude, car.tlongitude);
            // that.requestPointLine(0, fromPosition, toPosition);
            //设置当前车辆信息

            // that.setData({
            //   type:car.type,
            //   disabled:1,
            //   kefuTel:car.keTel,//客服电话
            //   openId:car.openId,
            //   lastClickMarkerId: 0,
            //   reLunch: true,
            //   controlPower:car.controlPower,
            //   carimg1:car.uploadImgUrl,
            //   carimg2:car.uploadImgUrlTwo,
            // });
            // if(that.data.type == 2)
            // {
            //   that.getWork();
            // }
            // if(that.data.type == 0)
            // {
            //   that.setData({
            //     rentTimeInfo:car.startDate + " 至 " + car.endDate,
            //     isShowRentView:false,
            //   });
            // }
            // firstCarInfo = carInfo;

          }
          //设置选中车辆信息
          // if (carInfo.sn && that.data.selectSn && carInfo.sn.indexOf(that.data.selectSn) != -1) {
          //   firstCarInfo = carInfo;
          //   that.setData({
          //     selectSn: ''
          //   });
          //   index = i;
          //   that.setData({
          //     lastClickMarkerId: index
          //   });
          // }

          //}

          // if (index == -1) {
          //   index = 0;
          //   app.data.operationSn = ''
          // }

          for (var i = 0; i < showCarsList.length; i++) {
            // markerList.push(that.generateMarker(i == index ? that.data.selectedCarImageUrl : that.data.carImageUrl, i, showCarsList[i].latitude, showCarsList[i].longitude));

            var s = false;
            if (that.data.cellData.sn == showCarsList[i].sn) {
              s = true;
            } else {
              s = false;
            }


            markerList.push(that.generateMarker2("../../../assets/images/startPoint.png", i, showCarsList[i].latitude, showCarsList[i].longitude, showCarsList[i].address, showCarsList[i].showtime, s));
            // var content = showCarsList[i];
            // console.log("lat="+content.latitude)
            // console.log("lng="+content.longitude)
            // markerList.push(that.generateMarker("../../../assets/images/startPoint.png",content.latitude, content.longitude,"content.address","content.showtime"));
          }
          that.setData({
            markers: markerList
          });
          that.setData({
            includePoints: includePointsList
          });
          that.setData({
            showCars: showCarsList
          });
          // if (firstCarInfo) {
          //   that.initCarInfo(index, firstCarInfo);
          // }
        } else {
          that.setData({
            code: ''
          });
          that.finishDes();
          appUtil.showModal(data.msg, false, function () {});
        }
      } else {
        appUtil.showModal('请求车辆位置失败,重新获取？', true, function (reRequest) {
          if (reRequest) {
            that.requestAllCarPosition(that.data.latitude, that.data.longitude);
          }
        });
      }
    });
  },

  saveControlPwd: function (key, value) {
    // var data = value + "," + (new Date().getTime());
    console.log('---------------save data------' + key + '--' + value);
    appUtil.setStorage(key, value, function () {});
  },

  /**
   * 点击marker触发
   */
  markertap: function (res) {
    var markerId = res.markerId;
    if (markerId >= 0) {
      console.log("markerId=" + markerId)
      var carInfo = that.data.showCars[markerId];
      console.log("platenumber=" + carInfo.platenumber)
      console.log("sn=" + carInfo.sn)
      var markers = that.data.markers;
      // markers[markerId + 1].iconPath = that.data.selectedCarImageUrl;
      var lastMarkerId = that.data.lastClickMarkerId;
      console.log("that.data.lastClickMarkerId=" + that.data.lastClickMarkerId);
      // if (that.data.lastClickMarkerId != -1 && that.data.lastClickMarkerId != markerId) {
      //   markers[that.data.lastClickMarkerId + 1].iconPath = that.data.carImageUrl;
      // }

      const mm = this.data.markers.map(marker => {
        if (marker.id === markerId) {
          marker.callout.display = 'ALWAYS'; // 显示当前气泡
        } else {
          marker.callout.display = 'BYCLICK'; // 隐藏其他气泡
        }
        return marker;
      });
      this.setData({
        markers: mm
      });




      that.setData({
        // lastClickMarkerId: markerId,
        // markers: markers,
        // selectSn:carInfo.sn,
        cellData: {
          'vin': carInfo.vin,
          'platenumber': carInfo.platenumber,
          'vehicleSerialName': carInfo.vehicleSerialName,
          'vehicleModeName': carInfo.vehicleSerialName,
          'sn': carInfo.sn,
          'idc': carInfo.idc,

        }
      });

      // that.initCarInfo(markerId, carInfo);
      // var fromPosition = that.generatePoint(that.data.latitude, that.data.longitude);
      // var toPosition = that.generatePoint(carInfo.latitude, carInfo.longitude);
      // that.requestPointLine(markerId, fromPosition, toPosition);
    }
  },

  generateShowCarInfo: function (car) {
    var showCar = {};
    showCar.carNum = car.plateNumber; //车牌
    showCar.sn = car.sn;
    showCar.idc = car.idc;
    showCar.vehicleModeName = car.vehicleModeName;
    showCar.vehicleSerialName = car.vehicleSerialName;
    showCar.vin = car.vin;
    showCar.xsgw = car.xsgw;
    showCar.platenumber = car.plateNumber;
    showCar.categoryName = car.vehicleModeName; //车型
    showCar.categoryImg = car.categoryImg; //车图片
    showCar.latitude = car.tlatitude;
    showCar.longitude = car.tlongitude;
    showCar.distance = car.distance;
    showCar.id = car.id;
    showCar.kmprice = car.kmprice;
    showCar.address = car.address;
    showCar.showtime = car.showtime;
    return showCar;
  },

  nowTime: function () { //当前日期
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    // var mytime=date.toLocaleTimeString();     //获取当前时间
    var sd = year + "-" + month + "-" + day;

    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var st = h + ":" + m + ":" + s;

    console.log(st);

    that.setData({
      startDate: sd,
      startTime: '00:00:00',
      endDate: sd,
      endTime: st
    })
  },

  initMap: function () {
    qqmapsdk = new QQMapWX({
      key: that.data.key // 必填
    });

    // 使用 wx.createMapContext 获取 map 上下文
    mapCtx = wx.createMapContext(that.data.mapId);
    //自动算地图的高度
    appUtil.getSystemInfoComplete(function (res) {
        //   that.setData({
        //     showPhoneHeight: res.windowHeight
        //   });
        //   that.setData({
        //     showPhoneWidth: res.windowWidth
        //   });
        that.setData({
          mapHeight: res.windowHeight - res.windowWidth / 750 * that.data.coverHeight
        });
        that.setData({
          arcHeight: res.windowWidth / 720 * 45
        });
      },
      function () {

      });


  },

  getCarPostion: function () {
    var param = {};
    param[urlUtil.getCarPoisiton.sn] = that.data.cellData.sn;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.fin3Url + urlUtil.getCarPoisiton.URL, param, function (res) {
      appUtil.hideLoading();
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == 1000) {

          var markerList = [];
          var content = data.content;
          markerList.push(that.generateMarker("../../../assets/images/startPoint.png", content.tlatitude, content.tlongitude, content.address, content.showtime));

          that.setData({
            latitude: data.content.tlatitude,
            longitude: data.content.tlongitude,
            markers: markerList
          })

        }
      }

    });
  },



  getMyPosition: function () {
    appUtil.getAuthState(appUtil.SCOPE_TYPE.SCOPE_LOCATION, function (auth) {
      if (auth) {
        appUtil.getWXLocation(function (res) {
          if (!appUtil.isEmpty(res.latitude) && !appUtil.isEmpty(res.longitude)) {

            that.setData({
              latitude: res.latitude,
              longitude: res.longitude,
            });
          }

        });
      }
    });
  },





  /**
   * 生成一个marker
   */
  generateMarker: function (iconPath, latitude, longitude, address, showtime) {
    var marker = {};
    marker.id = 1;
    marker.width = 25;
    marker.height = 37;
    marker.iconPath = iconPath;
    marker.latitude = latitude;
    marker.longitude = longitude;
    marker.callout = {
      content: "当前位置：" + address + "\r\n定位时间：" + showtime,
      display: 'ALWAYS',
      padding: 8
    };
    return marker;
  },

  generateMarker2: function (iconPath, id, latitude, longitude, address, showtime, s) {
    var marker = {};
    marker.iconPath = iconPath;
    marker.id = Number(id);
    marker.width = 25;
    marker.height = 37;
    marker.latitude = latitude;
    marker.longitude = longitude;
    if (s) {
      marker.callout = {
        content: "当前位置：" + address + "\r\n定位时间：" + showtime,
        display: 'ALWAYS',
        padding: 8
      }
    } else {
      marker.callout = {
        content: "当前位置：" + address + "\r\n定位时间：" + showtime,
        display: 'BYCLICK',
        padding: 8
      }
    };
    // marker.width = 18;
    // marker.height = 35;
    return marker;
  },

  /**
   * 生成一个坐标点
   */
  generatePoint: function (latitude, longitude) {
    var point = {};
    point.latitude = latitude;
    point.longitude = longitude;
    return point;
  },

  warnButtonTap: function () {
    wx.navigateTo({
      url: '../carWarnList/carWarnList?sn=' + that.data.cellData.sn,
    })
  },
  travleButtonTap: function () {
    wx.navigateTo({
      url: '../travelingtrack/travelingtrack?sn=' + that.data.cellData.sn + "&lat=" + that.data.latitude + "&lng=" + that.data.longitude,
    })

  },

  operationBtnTap: function (e) {
    if (appUtil.isEmpty(that.data.cellData.sn)) {
      appUtil.showToast("请先选择车辆");
      return;
    }
    var controlType = e.currentTarget.id;
    if (that.isNetworkControl()) {
      that.networkControl(controlType);
    } else {
      that.bluetoothControl(controlType)
    }



  },

  networkControl: function (controlType) {
    appUtil.showLoading('正在控制...');
    var param = {};
    param[urlUtil.operation.sn] = that.data.cellData.sn;
    param[urlUtil.operation.code] = that.data.cellData.code;
    param[urlUtil.operation.operationType] = controlType;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.operation.URL, param, function (res) {
      appUtil.hideLoading();
      if (res.statusCode == 200) {
        if (res.data.code != 1000) {
          appUtil.showModal(res.data.msg, false, function () {});
        } else
        if (controlType == 5) {
          appUtil.showModal('寻车成功，请注意附近鸣笛车辆!', false, function () {});
        } else {
          appUtil.showModal('控制成功!', false, function () {});
        }

      } else {
        appUtil.showModal('网络异常!', false, function () {});
      }
    });
  },

  stautsBtnTap: function () {

    appUtil.showLoading('加载中...');
    var param = {};
    param[urlUtil.getCarStatus.sn] = that.data.cellData.sn;
    // getApp().data.k1swUrl + urlUtil.getCarStatus.URL
    // param[urlUtil.getCarStatus.sn] = '640019899';
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.getCarStatus.URL, param, function (res) {
      appUtil.hideLoading();
      if (res.statusCode == 200) {
        if (res.data.code != 1000) {
          appUtil.showModal(res.data.msg, false, function () {});
        } else
          that.setData({
            carStatus: res.data.content,
            showModal: true
          })

      } else {
        appUtil.showModal('网络异常!', false, function () {});
      }
    });

  },

  sureButtonTap: function () {
    that.setData({
      showModal: false
    })
  },

  controlTap: function (res) {

    var controlId = res.target.id;
    if (controlId == that.data.networkControlId) {
      if (controlId != that.data.currentSelectControlType) {
        //网络控制
        appUtil.showToast('已经切换成网络控车模式');
        that.setData({
          currentSelectControlType: controlId
        });

      }
      bleManager.releaseBle();
    } else if (controlId == that.data.bluetoothControlId) {
      if (controlId != that.data.currentSelectControlType) {
        //蓝牙控制
        appUtil.showToast('已经切换成蓝牙控车模式');
        that.setData({
          currentSelectControlType: controlId
        });
        // that.dealControlPwd(that.data.showCar.sn, function() {});
      }
      //}
    }


  },

  handleJumpHome() {
    wx.switchTab({
      url: '/pages/desk/desk',
    })
  },

  //蓝牙部分start

  /**
   * 处理控制密码
   */
  dealControlPwd: function (sn, controlPwd) {
    that.getControlPwd(sn, function (value) {
      if (value) {
        controlPwd(value);
      }
    });

  },

  getControlPwd: function (key, data) {
    appUtil.getStorage(key, function (value) {
      data(value);
    });
  },

  /**
   * 蓝牙控制
   */
  bluetoothControl: function (controlType) {
    that.dealControlPwd(that.data.cellData.sn, function (pwd) {
      console.log(that.data.cellData.sn);
      console.log(controlType);
      if (pwd) {
        if (controlType == 5) {
          //远程寻车
          that.sendData(bleManager.DEFAULT_CMD_TYPE.CONTROL_REMOTE_LOOK_FOR_CAR_TYPE, pwd);
        } else if (controlType == 1) {
          //锁门
          that.sendData(bleManager.DEFAULT_CMD_TYPE.CONTROL_CLOSE_DOOR_TYPE, pwd);
        } else if (controlType == 3) {
          //开门
          that.sendData(bleManager.DEFAULT_CMD_TYPE.CONTROL_OPEN_DOOR_TYPE, pwd);
        }
      } else {
        appUtil.showModal('控制密码不正确!', false, function () {});
      }
    });
  },


  sendData: function (sendType, pwd) {
    console.log("--------------send-data-idc:" + that.data.cellData.idc + "--" + pwd);
    bleManager.sendData(that.data.cellData.idc, pwd, sendType, function (state) {
      // bleManager.sendData('19747000130', "EC6280F81AF34E8B", sendType, function (state) {
      if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE == state) {
        //显示加载框
        appUtil.showLoading('加载中...');
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR == state) {
        //异常取消加载框
        appUtil.hideLoading();
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE == state) {
        //蓝牙不可用
        appUtil.showModal('请打开蓝牙', false, function (confirm) {});
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND == state) {
        //没有扫描到设备信息
        that.isAndroid6(function (res) {
          if (res) {
            appUtil.showModal('没有发现设备,请确定已经打开手机定位和微信定位权限!', false, function (confirm) {});
          } else {
            appUtil.showModal('没有发现设备,请重试!', false, function (confirm) {});
          }
        });
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED == state) {
        //连接失败
        // appUtil.showModal('蓝牙连接失败,请重试!', false, function(confirm) {});
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED == state) {
        //不支持ble
        appUtil.showModal('您的手机不支持低功耗蓝牙', false, function (confirm) {});
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED == state) {
        //发送失败
        appUtil.showModal('数据发送失败,请重试!', false, function (confirm) {});
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE == state) {
        //无响应
        appUtil.showModal('设备超时无响应,请重试!', false, function (confirm) {});
      }
    }, function (data) {
      //隐藏加载框
      appUtil.hideLoading();
      if (data.controlType == 4) {
        //解析控制
        appUtil.showToast(data.result);
        if (data.result.indexOf("控制成功") != -1) {
          //控制成功,通知服务器
          // var param = {};
          // param[urlUtil.ControlCar.SN] = that.data.showCar.sn;
          // param[urlUtil.ControlCar.TYPE] = that.data.currentControlType;
          // param[urlUtil.ControlCar.TELPHONE] = app.data.userInfo.username;
          // param[urlUtil.ControlCar.ISBLUETOOTH] = 1;
          // param[urlUtil.ControlCar.CODE] = 123456;
          // console.log('------------蓝牙控制后通知服务器---------' + that.data.currentControlType + ";" + that.data.showCar.sn);
          // appUtil.byPost(getApp().data.k1swUrl + urlUtil.ControlCar.CONTROL_CAR_URL, param, function(res) {

          // });
        }
      }
    });
  },

  isNetworkControl: function () {
    return that.data.currentSelectControlType == that.data.networkControlId;
  },
  //蓝牙部分end

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.initialiImageBaseConversion()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})