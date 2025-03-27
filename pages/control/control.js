//工具
const appUtil = require('../../utils/app-util.js');
const urlUtil = require('../../utils/url-util.js');
//ble管理类
const bleManager = require('../../utils/ble-manager.js');
//腾讯地图微信小程序支持包
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var mapCtx;
var that;
var releaseBleTask;
const app = getApp();
Page({
  data: { // 参与页面渲染的数据
    //屏幕高度
    mapHeight: 0,
    carInfo: '',
    addressInfo: '',
    //当前车辆
    showCar: {},
    carUrl: '',
    //当前位置信息
    latitude: '',
    longitude: '',
    mapId: 'map',
    scale: 16,
    //所有车信息的集合
    showCars: [],
    //所有marker点的集合
    includePoints: [],
    //所有的marker的集合
    markers: [],
    //每条路线的所有的点的集合
    polyline: [],
    //缓存路线的点
    polylineArray: [],
    //路线颜色
    routeColor: '#3893F9',
    //路线宽度
    routeWidth: 5,
    //我的位置的图片
    myPositionImgUrl: "../../assets/images/me.png",
    //车辆图片的url
    // carImageUrl: "../../assets/images/car.png",
    carImageUrl: "../../assets/images/selected_car.png",
    //选中车辆图标
    selectedCarImageUrl: '../../assets/images/selected_car.png',
    //腾讯移动端key(日调用量：1万次 / Key , 5次 / key / 秒)
    key: 'W66BZ-ADBC3-COB3F-YWZG4-MAVRO-IJBIM',
    //请求步行点轨迹点
    requestPointLineUrl: 'https://apis.map.qq.com/ws/direction/v1/walking',
    coverHeight: 255,
    coverHeightHidden: false,
    coverHeight2: 120,
    coverHeightHidden2: true,
    controls: [],
    arcImage: '../../assets/images/control_up_bg.png',
    arcHeight: 49,
    //定位id
    positionId: -3,
    positionUrl: '../../assets/images/position.png',
    positionWidth: 100,
    positionHeight: 100,
    networkControlOpenUrl: '../../assets/images/network_open.png',
    networkControlCloseUrl: '../../assets/images/network_close.png',
    networkControlId: -4,
    bluetoothControlOpenUrl: '../../assets/images/bluetooth_open.png',
    bluetoothControlCloseUrl: '../../assets/images/bluetooth_close.png',
    bluetoothControlId: -5,
    controlSwitchImageWidth: 104,
    controlSwitchImageHeight: 100,
    //默认网络控车
    currentSelectControlType: -4,
    //19小时（毫秒）
    expireTime: 3600 * 1000 * 19,
    //网络是否可用
    isNetworkAvailable: false,
    navigationUrl: '../../assets/images/navigation.png',
    //导航id
    navigationId: -6,
    //上次点击的markerid
    lastClickMarkerId: -1,
    systemType: '',
    systemVersion: '',
    showPhoneHeight: '',
    showPhoneWidth: '',
    telephone: '',
    currentControlType: '',
    hasShow: false, //是否显示介绍页面
    hasMapInit: false, //防止部分手机缩放失败
    helpUrl: '../../assets/images/help.png',
    helpUrlId: -7,
    selectSn: '',
    userInfoUrl: '../../assets/images/user3.png',
    userInfoId: -8,
    reLunch: true,
    isAutoControl: false,

    networkControlImg:'',
    bluetoothControlImg:'',
    code:'',//二维码中的code
    type:-1,//二维码中的type 0 一级租车人1 彩蛋租车人 2 车务 3 员工和司机
    kefuControlId:-2,
    kefuTel:'',
    disabled:0,//是否登录成功且code有效
    openId:'',
    rentTimeInfo:'',
    isShowRentView:false,
    rentButtonName:'租车',
    finishDeposit:0,
    controlPower:'',
    work:'',
    carimg1:'',
    carimg2:'',
    carimg3:'',
    plateNumber:'',
    hasUsedCar:false, //员工使用已有使用的车辆
    isErcodeOpen:false,//是否是通过二维码分享打开

  },

  getOpenId:function()
  {
    wx.login({
      success (res) {
        if (res.code) {
          appUtil.showLoading('加载中...');
          var param = {};
          param[urlUtil.getOpenIdUrl.CODE] = res.code;
          param[urlUtil.getOpenIdUrl.APP] = 2;
          appUtil.byPost(getApp().data.k1swUrl + urlUtil.getOpenIdUrl.URL,param,function (res) {
          appUtil.hideLoading();
          if(res)
          { 
            if(res.data.code == 1000)
            {
              that.setData({
                openId:res.data.content
              })
             
              console.log('获取openid成功')
            }
            else{
              appUtil.showModal(res.data.msg, false, function() {});
            }
          }
          else
          {
            appUtil.showModal('获得OPENID失败请重试', true, function(relocation) {
              if (relocation) {
                that.getOpenId();
              }
            });
          }
          
        })
          
         
        } else {
          console.log('获取wxcode失败')
        }
      }
    })
  },

    /**
   * 页面渲染后 执行
   */
  onLoad: function(options) {

   that = this;
   console.log("code="+that.data.code);
   this.init();

   var url = decodeURIComponent(options.scene);//二维码打开
   if (url == null || url == '' || url.length == 0 || url == 'undefined')
   {
     url = options.query;//短信打开
   }
   console.log("-----------"+url);
   that.setData({ 
     networkControlImg: that.data.networkControlOpenUrl,
     bluetoothControlImg: that.data.bluetoothControlCloseUrl,
  });

  if(url == null || url == '' || url.length == 0|| url == 'undefined')
    {
      // appUtil.showModal('请通过链接或二维码打开小程序', false, function() { });
      return;
    }
    else
    {
    //   that.setData({ 
    //     isErcodeOpen:true,
    //  });
    getApp().data.isErcodeOpen = true;
    }
    that.setData({ 
      code:url,
   });

  },

  init:function(){
    //获得OPENID
    that.getOpenId();
    //加载租车人登录信息
  //  appUtil.getStorage(getApp().data.userKey, function(data) {
  //   if (data) {
  //     getApp().data.userInfo = data;
  //     }
  //  });

   //加载车务人员登录信息
   appUtil.getStorage(getApp().data.managerKey, function(data) {
    if (data) {
      getApp().data.managerInfo = data;
      }
   });

    getApp().data.controlCode = that.data.code;
    appUtil.onNetworkStatusChange(function(res) {
      //监听当前网络状态
      that.setData({
        isNetworkAvailable: res.isConnected
      });
    });

    // 实例化腾讯地图API核心类
    qqmapsdk = new QQMapWX({
      key: that.data.key // 必填
    });
  },

  onReady: function(res) {
    // 使用 wx.createMapContext 获取 map 上下文
    mapCtx = wx.createMapContext(that.data.mapId);
    //自动算地图的高度
    appUtil.getSystemInfoComplete(function(res) {
      that.setData({
        showPhoneHeight: res.windowHeight
      });
      that.setData({
        showPhoneWidth: res.windowWidth
      });
      that.setData({
        mapHeight: res.windowHeight - res.windowWidth / 750 * that.data.coverHeight
      });
      that.setData({
        arcHeight: res.windowWidth / 720 * 45
      });
    }, 
    function() {
      appUtil.getNetworkType(function(isOk) {
        that.setData({
          isNetworkAvailable: isOk
        });
        if (!isOk) {
          appUtil.showModal('请打开网络连接!', false, function() {});
        }
        
      }); 
    });

    //已获得定位不再重复获得
    if(appUtil.isEmpty(that.data.latitude) || appUtil.isEmpty(that.data.longitude))
    {
      that.getMyPosition();
    }
    
  },

  requestUserProgressOrder: function() {
    var param = {};
    param[urlUtil.findUserProgressOrder.USERID] = getApp().data.userInfo.id;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.findUserProgressOrder.URL, param, function(res) {

      if (res.statusCode == 200) {
        var data = res.data;
        getApp().data.orderInfo = data.content
        if (data.code == 1000) {
          if(data.content.orderstatus == 30)
          {
            that.setData({
              isShowRentView:true,
              rentButtonName:'还车',
              rentTimeInfo:'您已还车，租金' + data.content.ordercost+"元，点击支付",
            })
          }
          else
          {
            that.initRentCarView(1);
          }
        }
        else
        {
          that.initRentCarView(0);
        }
      }

    });
  },

  /**
   * 是否租车了 r 0 未租  1 已租
   * @param {*} r 
   */
  initRentCarView:function(r)
  {
     if(r == 0)
     {
      that.setData({
        rentButtonName:'租车',
        isShowRentView:false,
      })
      getApp().data.orderInfo = '';
     }
     else if(r == 1)
     {
      that.setData({
        isShowRentView:true,
        rentButtonName:'还车',
        rentTimeInfo:getApp().data.orderInfo.chargingstartdate +' 开始租车',
      })
     }
  },

  /**
   * 请求单个车辆位置
   */
  requestCarPosition: function(latitude, longitude) {

    if(appUtil.isEmpty(that.data.code))
    {
      console.log("code空位，终止执行");
      return;
    }
    console.log('------------请求车辆位置');
    appUtil.showLoading('获取车辆位置');
    var markerList = []; //所有marker
    var includePointsList = []; //所有点
    var showCarsList = []; //所有车辆信息
    var myPosition; //我的位置
    //将我的位置添加到marker集合
    markerList.push(that.generateMarker(that.data.myPositionImgUrl, -1, latitude, longitude));
    //初始化我的位置
    myPosition = that.generatePoint(latitude, longitude);
    includePointsList.push(myPosition);
    var param = {};
    param[urlUtil.RequestCarList.CODE] = that.data.code;
    param[urlUtil.RequestCarList.OPENID] = that.data.openId;
    param[urlUtil.RequestCarList.MANAGERID] = getApp().data.managerInfo.id;
    const requestCarLocation = appUtil.byPost(getApp().data.k1swUrl + urlUtil.RequestCarList.REQUEST_API, param, function(res) {
      appUtil.hideLoading();
      var firstCarInfo;
      var index = -1;
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == 1000) {
              //数据返回成功
              var car = data.content;
              getApp().data.companyId = car.companyId;
              getApp().data.deposit = car.deposit;
              that.saveControlPwd(car.sn, car.blueKey);//保存蓝牙密码
              // that.showCarView(true);
              var carInfo = that.generateShowCarInfo(car);
              showCarsList.push(carInfo);
              var point = that.generatePoint(car.tlatitude, car.tlongitude);
              includePointsList.push(point);
              //划线
              var fromPosition = that.generatePoint(that.data.latitude, that.data.longitude);
              var toPosition = that.generatePoint(car.tlatitude, car.tlongitude);
              that.requestPointLine(0, fromPosition, toPosition);
              //设置当前车辆信息
             
                that.setData({
                  type:car.type,
                  disabled:1,
                  kefuTel:car.keTel,//客服电话
                  openId:car.openId,
                  lastClickMarkerId: 0,
                  reLunch: true,
                  controlPower:car.controlPower,
                  carimg1:car.uploadImgUrl,
                  carimg2:car.uploadImgUrlTwo,
                  carimg3:car.uploadImgUrlThree,
                });
                if(that.data.type == 2)
                {
                  that.getWork();
                }
                if(that.data.type == 1)
                {
                  that.setData({
                    rentTimeInfo:car.startDate + " 至 " + car.endDate,
                    isShowRentView:true,
                  });
                }
                firstCarInfo = carInfo;
              

              //设置选中车辆信息
              if (carInfo.sn && that.data.selectSn && carInfo.sn.indexOf(that.data.selectSn) != -1) {
                firstCarInfo = carInfo;
                // that.setData({
                //   selectSn: ''
                // });
                index = i;
                that.setData({
                  lastClickMarkerId: index
                });
              }

            //}

            if (index == -1) {
              index = 0;
              app.data.operationSn = ''
            }

            for (var i = 0; i < showCarsList.length; i++) {
              markerList.push(that.generateMarker(i == index ? that.data.selectedCarImageUrl : that.data.carImageUrl, i, showCarsList[i].latitude, showCarsList[i].longitude));
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
          if (firstCarInfo) {
            // that.initCarInfo(0, firstCarInfo);
            that.initCarInfo(index, firstCarInfo);
          }

        } else {
          that.setData({
            code: '',
            isShowRentView:false,
          });
          that.finishDes();
          appUtil.showModal(data.msg, false, function() {});
        }
      } else {
        appUtil.showModal('请求车辆位置失败,重新获取？', true, function(reRequest) {
          if (reRequest) {
            that.requestCarPosition(that.data.latitude, that.data.longitude);
          }
        });
      }
    });
  },

  /**
   * 请求所有车辆位置
   */
  requestAllCarPosition: function(latitude, longitude) {
    
    appUtil.showLoading('获取车辆位置');
    var markerList = []; //所有marker
    var includePointsList = []; //所有点
    var showCarsList = []; //所有车辆信息
    var myPosition; //我的位置
    //将我的位置添加到marker集合
    markerList.push(that.generateMarker(that.data.myPositionImgUrl, -1, latitude, longitude));
    //初始化我的位置
    myPosition = that.generatePoint(latitude, longitude);
    includePointsList.push(myPosition);
    var param = {};
    param[urlUtil.RequestCarList2.COMPANYID] = getApp().data.managerInfo.companyid;
    param[urlUtil.RequestCarList2.USERID] = getApp().data.managerInfo.id;
    param[urlUtil.RequestCarList2.NODEID] = getApp().data.managerInfo.nodeid;
    const requestCarLocation = appUtil.byPost(getApp().data.k1swUrl + urlUtil.RequestCarList2.REQUEST_API, param, function(res) {
      appUtil.hideLoading();
      var firstCarInfo;
      var index = -1;
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == 1000) {
              //数据返回成功
              var cars = data.content;
              for(var index in cars)
              {
                var car = cars[index];
                 // getApp().data.companyId = car.companyId;
             // getApp().data.deposit = car.deposit;
              // that.saveControlPwd(car.sn, car.blueKey);//保存蓝牙密码
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
              markerList.push(that.generateMarker(that.data.carImageUrl, i, showCarsList[i].latitude, showCarsList[i].longitude));
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
          // appUtil.showModal(data.msg+"，是否去添加车辆？", true, function(res) {
          //       if(res)
          //       {
          //         appUtil.navigateTo('../system/regDevice/regDevice');
          //       }
          // });
        }
      } else {
        appUtil.showModal('请求车辆位置失败,重新获取？', true, function(reRequest) {
          if (reRequest) {
            that.requestAllCarPosition(that.data.latitude, that.data.longitude);
          }
        });
      }
    });
  },

  /**
   * 点击marker触发
   */
  markertap: function(res) {
    var markerId = res.markerId;
    if (markerId >= 0) {
      var carInfo = that.data.showCars[markerId];
      var markers = that.data.markers;
      markers[markerId + 1].iconPath = that.data.selectedCarImageUrl;
      var lastMarkerId = that.data.lastClickMarkerId;
      console.log("that.data.lastClickMarkerId="+that.data.lastClickMarkerId);
      if (that.data.lastClickMarkerId != -1 && that.data.lastClickMarkerId != markerId) {
        markers[that.data.lastClickMarkerId + 1].iconPath = that.data.carImageUrl;
      }

      that.setData({
        lastClickMarkerId: markerId,
        markers: markers,
        selectSn:carInfo.sn,
      });
      console.log(that.data.selectSn);
      that.initCarInfo(markerId, carInfo);
      var fromPosition = that.generatePoint(that.data.latitude, that.data.longitude);
      var toPosition = that.generatePoint(carInfo.latitude, carInfo.longitude);
      that.requestPointLine(markerId, fromPosition, toPosition);
    }
  },

  /**
   * 点击覆盖物
   */
  controlTap: function(res) {

    // if(that.data.disabled == 0)
    // {
    //   appUtil.showModal('链接或二维码无效，请重试！', false, function() {});
    //   return;
    // }
    
    var controlId = res.target.id;
    if (controlId == that.data.kefuControlId) {
      if(that.data.kefuTel == '')
      {
        appUtil.showModal('无客服电话', false, function() {});
      }
      else
      {
        wx.makePhoneCall({
          phoneNumber: that.data.kefuTel,
        })
      }
      
    }
    else if (controlId == that.data.positionId) {
      that.authLocation();
    } else if (controlId == that.data.networkControlId) {
        if (controlId != that.data.currentSelectControlType) {
          //网络控制
          appUtil.showToast('已经切换成网络控车模式');
          that.setData({
            currentSelectControlType: controlId
          });
          //var controls = that.data.controls;
          //var controlNetwork = controls[2];
         // var controlBluetooth = controls[3];
          //if (true && true) {
           // controlNetwork.iconPath = that.data.networkControlOpenUrl;
           // controlBluetooth.iconPath = that.data.bluetoothControlCloseUrl;

           
            that.setData({
             // controls: controls
            networkControlImg: that.data.networkControlOpenUrl,
            bluetoothControlImg: that.data.bluetoothControlCloseUrl
            });
         // }
        }
        bleManager.releaseBle();
    } else if (controlId == that.data.bluetoothControlId) {
        if (controlId != that.data.currentSelectControlType) {
          //蓝牙控制
          appUtil.showToast('已经切换成蓝牙控车模式');
          that.setData({
            currentSelectControlType: controlId
          });
          //var controls = that.data.controls;
         // var controlNetwork = controls[2];
         // var controlBluetooth = controls[3];
          //if (controlNetwork && controlBluetooth) {
          //  controlNetwork.iconPath = that.data.networkControlCloseUrl;
          //  controlBluetooth.iconPath = that.data.bluetoothControlOpenUrl;
            that.setData({
              //controls: controls
              networkControlImg: that.data.networkControlCloseUrl,
              bluetoothControlImg: that.data.bluetoothControlOpenUrl
            });
          //}
          that.dealControlPwd(that.data.showCar.sn, function() {});
        }
      //}
    } else if (controlId == that.data.navigationId) {
      //导航
      if (!that.data.showCar.sn) {
        appUtil.showModal('暂无车辆信息', false, function() {});
      } else {
        // var lng = Number(that.data.showCar.longitude) * 2 - Number(that.data.longitude);
        // var lat = Number(that.data.showCar.latitude) * 2 - Number(that.data.latitude);
        // var maxLng = Number(lng) > Number(that.data.longitude) ? lng : that.data.longitude;
        // var minLng = Number(lng) > Number(that.data.longitude) ? that.data.longitude : lng;
        // var maxLat = Number(lat) > Number(that.data.latitude) ? lat : that.data.latitude;
        // var minLat = Number(lat) > Number(that.data.latitude) ? that.data.latitude : lat;
        // console.log("----------------" + maxLng + ";" + minLng + ";" + maxLat + ";" + minLat);
        // var zoom = that.getZoom(maxLng, minLng, maxLat, minLat);
        // console.log('--------------zoom:'+zoom);
        appUtil.openLocation(Number(that.data.showCar.latitude), Number(that.data.showCar.longitude), 18);
      }
    } else if (controlId == that.data.helpUrlId) {
      //帮助
      //wx.navigateTo({
      //  url: '../help/help',
      //})
    } else if (controlId == that.data.userInfoId) {
      //个人中心
      that.dealLogin();
    }
  },

  //根据经纬极值计算绽放级别。  
  getZoom: function(maxLng, minLng, maxLat, minLat) {
    var zoom = ["50", "100", "200", "500", "1000", "2000", "5000", "10000", "20000", "25000", "50000", "100000", "200000", "500000", "1000000", "2000000"] //级别18到3。  
    var distance = that.GetShortDistance(maxLng, maxLat, minLng, minLat).toFixed(1); //获取两点距离,保留小数点后两位  
    for (var i = 0, zoomLen = zoom.length; i < zoomLen; i++) {
      if (zoom[i] - distance > 0) {

        return 18 - i + 1; //之所以会多3，是因为地图范围常常是比例尺距离的10倍以上。所以级别会增加3。  

      }
    };
  },
  GetShortDistance: function(lon1, lat1, lon2, lat2) {
    var DEF_PI = 3.14159265359; // PI
    var DEF_2PI = 6.28318530712; // 2*PI
    var DEF_PI180 = 0.01745329252; // PI/180.0
    var DEF_R = 6370693.5; // radius of earth
    var ew1, ns1, ew2, ns2;
    var dx, dy, dew;
    var distance;
    // 角度转换为弧度
    ew1 = lon1 * DEF_PI180;
    ns1 = lat1 * DEF_PI180;
    ew2 = lon2 * DEF_PI180;
    ns2 = lat2 * DEF_PI180;
    // 经度差
    dew = ew1 - ew2;
    // 若跨东经和西经180 度，进行调整
    if (dew > DEF_PI)
      dew = DEF_2PI - dew;
    else if (dew < -DEF_PI)
      dew = DEF_2PI + dew;
    dx = DEF_R * Math.cos(ns1) * dew; // 东西方向长度(在纬度圈上的投影长度)
    dy = DEF_R * (ns1 - ns2); // 南北方向长度(在经度圈上的投影长度)
    // 勾股定理求斜边长
    distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
  },

  /**
   * 获取控制密码
   */
  requestControlPwd: function(sn, controlPwd) {
    console.log('---------------获取控制密码-------------');
    var param = {};
    param[urlUtil.RequestControlPwd.SN] = sn;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.RequestControlPwd.REQUEST_CONTROL_PWD_UR, param, function(res) {
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == '10000') {
          //请求成功
          var pwd = data.data.password;
          //保存
          controlPwd(pwd);
          that.saveControlPwd(sn, pwd);
        }
      }
      // else{
      //   var pwd = 'D8128CABFE232879';
      //     //保存
      //     controlPwd(pwd);
      //     that.saveControlPwd('640001241', pwd);
      // }

    });
  },

  /**
   * 处理控制密码
   */
  dealControlPwd: function(sn, controlPwd) {
    that.getControlPwd(sn, function(value) {
      if (value) {
        controlPwd(value);
      }
    });

  },

  /**
   * 保存控制密码
   * value:不包含时间戳
   */
  saveControlPwd: function(key, value) {
    // var data = value + "," + (new Date().getTime());
    console.log('---------------save data------' + key + '--' + value);
    appUtil.setStorage(key, value, function() {});
  },

  /**
   * 获取控制密码
   */
  getControlPwd: function(key, data) {
    appUtil.getStorage(key, function(value) {
      data(value);
    });
  },

  /**
   * 初始化车辆信息
   */
  initCarInfo: function(index, carInfo) {
    if(that.data.type == 1)
      {
        that.setData({
          // carInfo:  carInfo.categoryName + " " + carInfo.carNum + " " + carInfo.kmprice+"元/公里"
          carInfo:  carInfo.categoryName + " " + carInfo.carNum 
        });
      }
      else
      {
        that.setData({
          carInfo:  carInfo.categoryName + " " + carInfo.carNum 
        });
      }
   
    // that.setData({
    //   carUrl: carInfo.categoryImg
    // });
    that.setData({
      showCar: carInfo
    });

    if (carInfo.addressInfo) {
      that.setData({
        addressInfo: carInfo.addressInfo
      });
    } else {
      that.dealGeocoderData(index, carInfo);
    }
    //that.dealControlPwd(carInfo.sn, function() {});
  },

  /**
   * 处理逆地理编码的一些数据
   */
  dealGeocoderData: function(index, carInfo) {
    that.reverseGeocoder(carInfo, function(res) {
      if (res.status == 0) {
        carInfo.addressInfo = res.result.address_component.city + " " + res.result.address_component.district + " " + res.result.address_component.street
        that.setData({
          addressInfo: carInfo.addressInfo
        });
        var showCarsList = that.data.showCars;
        showCarsList[index] = carInfo;
        console.log('---------逆地理成功-----------');
        that.setData({
          showCars: showCarsList
        });
        that.setData({
          showCar: carInfo
        });
      } else {
        //逆地理错误
        console.log('--------逆地理错误-----------');
      }
    });
  },

  /**
   * 生成一个marker
   */
  generateMarker: function(iconPath, id, latitude, longitude) {
    var marker = {};
    marker.iconPath = iconPath;
    marker.id = Number(id);
    marker.latitude = latitude;
    marker.longitude = longitude;
    // marker.width = 18;
    // marker.height = 35;
    return marker;
  },

  /**
   * 生成一个坐标点
   */
  generatePoint: function(latitude, longitude) {
    var point = {};
    point.latitude = latitude;
    point.longitude = longitude;
    return point;
  },

  /**
   * 生成一个car信息
   */
  generateShowCarInfo: function(car) {
    var showCar = {};
    showCar.carNum = car.plateNumber; //车牌
    showCar.sn = car.sn;
    showCar.idc = car.idc;
    showCar.categoryName = car.vehicleModeName; //车型
    showCar.categoryImg = car.categoryImg; //车图片
    showCar.latitude = car.tlatitude;
    showCar.longitude = car.tlongitude;
    showCar.distance = car.distance;
    showCar.id = car.id;
    showCar.kmprice = car.kmprice;
    return showCar;
  },

  /**
   * 判断起始点和终点的经纬度是否变化了
   */
  isPositionChanged: function(fromPosition1, fromPosition2, toPosition1, toPosition2) {
    var isChanged = true;
    if (fromPosition1.latitude == fromPosition2.latitude &&
      fromPosition1.longitude == fromPosition2.longitude &&
      toPosition1.latitude == toPosition1.latitude &&
      toPosition2.longitude == toPosition2.longitude) {
      isChanged = false;
    }
    return isChanged;
  },

  /**
   * 请求轨迹点，规划路径
   * index : 等于marker的id
   */
  requestPointLine: function(index, fromPosition, toPosition) {
    var points = []; //我的位置和最近车位置的所有轨迹点
    var pointLine = []; //我的位置和最近车位置连线
    var param = {};
    param.from = fromPosition.latitude + ',' + fromPosition.longitude;
    param.to = toPosition.latitude + "," + toPosition.longitude;
    param.key = that.data.key;
    appUtil.showLoading('获取到达车辆路线');
    const requestPointLine = appUtil.byGet(that.data.requestPointLineUrl, param, function(res) {
      if (res.statusCode == 200) {
        appUtil.hideLoading();
        var requestData = res.data;
        if (requestData.status == 0) {
          var result = requestData.result;
          var routes = result.routes;
          if (routes.length > 0) {
            var polylineData = routes[0].polyline; //经过压缩，需要解压
            var length = polylineData.length;
            if (length > 1) {
              points.push(that.generatePoint(polylineData[0], polylineData[1]));
            }
            //解压坐标点
            for (var i = 2; i < length; i++) {
              polylineData[i] = polylineData[i - 2] + polylineData[i] / 1000000;
              if (i % 2 != 0) {
                points.push(that.generatePoint(polylineData[i - 1], polylineData[i]));
              }
            }
            var line = {};
            line.points = points;
            line.color = that.data.routeColor;
            line.width = that.data.routeWidth;
            pointLine.push(line);
            that.setData({
              'polyline': pointLine
            });

            //缓存
            var polylineArray = that.data.polylineArray;
            var cachePointLine = {};
            var position = {};
            position.from = fromPosition;
            position.to = toPosition;
            cachePointLine.position = position;
            cachePointLine.polyline = pointLine;
            polylineArray[index] = cachePointLine;
            that.setData({
              polylineArray: polylineArray
            });

          }
        } else {
          console.log("from：" + fromPosition.latitude + ',' + fromPosition.longitude);
          console.log("to：" + toPosition.latitude + "," + toPosition.longitude);
          console.log("规划路线发生错误：" + requestData.message);
          // appUtil.showModal(requestData.message, false, function() {});
        }
      } else {
        appUtil.showModal('请求轨迹失败', false, function() {});
      }
    });
  },

  /**
   * 切换有车和没有车的布局
   */
  showCarView: function(hasCar) {
    if (!hasCar) {
      //清空数据
      that.setData({
        showCar: ''
      });
    }
    that.setData({
      coverHeightHidden: !hasCar
    });
    that.setData({
      coverHeightHidden2: hasCar
    });
    if (that.data.showPhoneHeight && that.data.showPhoneWidth) {
      that.setData({
        mapHeight: that.data.showPhoneHeight - that.data.showPhoneWidth / 750 * (hasCar ? that.data.coverHeight : that.data.coverHeight2)
      });
      //弧形覆盖物更改位置
      var control = that.data.controls;
      if (control.length > 0) {
        control[0].position.top = that.data.mapHeight - that.data.arcHeight + 2;
        that.setData({
          controls: control
        });
      }
    } else {
      appUtil.getSystemInfo(function(res) {
        that.setData({
          showPhoneHeight: res.windowHeight
        });
        that.setData({
          showPhoneWidth: res.windowWidth
        });
        that.setData({
          mapHeight: that.data.showPhoneHeight - that.data.showPhoneWidth / 750 * (hasCar ? that.data.coverHeight : that.data.coverHeight2)
        });
        //弧形覆盖物更改位置
        var control = that.data.controls;
        if (control.length > 0) {
          control[0].position.top = that.data.mapHeight - that.data.arcHeight + 2;
          that.setData({
            controls: control
          });
        }
      });
    }
  },

  

  /**
   * 逆地理编码
   */
  reverseGeocoder: function(location, reverseGeocoder) {
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      success: function(res) {
        reverseGeocoder(res);
      },
      fail: function(res) {
        reverseGeocoder(res);
      }
    });
  },

  /**
   * 添加一个覆盖物
   */
  addCoverView(id, iconPath, top, left, width, height, clickable) {
    var control = that.data.controls;
    var arcView = {};
    var position = {};
    arcView.id = id;
    arcView.clickable = clickable;
    arcView.iconPath = iconPath;
    position.top = top;
    position.left = left;
    position.width = width;
    position.height = height;
    arcView.position = position;
    control.push(arcView);
    that.setData({
      controls: control
    });
  },

  /**
   * 显示定位弹框
   */
  showLocationStateDialog: function(res) {
    if (res) {
      appUtil.showModal('定位失败,请确定已经打开手机定位和微信定位权限!', false, function() {});
    } else {
      appUtil.showModal('定位失败,无法获取当前位置!重新定位？', true, function(relocation) {
        if (relocation) {
          that.getLocation();
        }
      });
    }
  },

  /**
   * 获取手机型号和版本
   */
  initSystemInfo: function(doNext) {
    if (that.data.systemType && that.data.systemVersion) {
      doNext();
    } else {
      appUtil.getSystemInfoComplete(function(res) {
        that.setData({
          showPhoneHeight: res.windowHeight
        });
        that.setData({
          showPhoneWidth: res.windowWidth
        });
        var system = res.system;
        var blankIndex = system.indexOf(' ');
        var pointIndex = system.indexOf('.');
        if (blankIndex != -1 && pointIndex != -1) {
          that.setData({
            systemType: system.substring(0, blankIndex)
          });
          that.setData({
            systemVersion: system.substring(blankIndex + 1, pointIndex + 2)
          });
        }
      }, function() {
        doNext();
      });
    }
  },

  /**
   * 获取当前位置
   */
  getLocation: function() {
    //获取当前的位置信息
    appUtil.showLoading('获取当前位置');
    appUtil.getWXLocation(function(res) {
    appUtil.hideLoading();
      console.log('---------当前位置1:' + res.latitude + ";" + res.longitude);
      
      if (appUtil.isEmpty(res.latitude) || appUtil.isEmpty(res.longitude)) {
        if(appUtil.isEmpty(that.data.latitude) || appUtil.isEmpty(that.data.longitude))
        {
            //定位失败
          that.isAndroid6(function(res) {
            that.showLocationStateDialog(res);
          });
        }
        else
        {
        //   if(that.data.type == 3 && that.data.code == '')
        //   {
        //     that.requestAllCarPosition(that.data.latitude,that.data.longitude);
        //   }
        //  else
        //  {
          that.requestCarPosition(that.data.latitude,that.data.longitude);
        //  }
        }
        
      } else {
        that.setData({
          latitude: res.latitude
        });
        that.setData({
          longitude: res.longitude
        });
        // if(that.data.type == 3 && that.data.code == '')
        //   {
        // that.requestAllCarPosition(res.latitude, res.longitude);
        // }
        // else
        // {
        that.requestCarPosition(res.latitude, res.longitude);
        // }
      }
    });
  },


  /**
   * 授权获取位置
   */
  authLocation: function() {
    appUtil.getAuthState(appUtil.SCOPE_TYPE.SCOPE_LOCATION, function(auth) {
      if (auth) {
        console.log('--------------获取位置已授权----------');
        //获取当前位置
        that.getLocation();
      } else {
        //去授权
        appUtil.authorize(appUtil.SCOPE_TYPE.SCOPE_LOCATION, function(success) {
          if (success) {
            that.getLocation();
          } else {
            //授权失败
            console.log('----------------获取位置 未授权-------------------');
            appUtil.showModal('请打开定位权限!', true, function(res) {
              if (res) {
                wx.openSetting({
                  success(res) {}
                })
              }
            });
          }
        });
      }
    });
  },

 

  /**
   * 获取地图缩放级别
   */
  getScale: function(scale) {
    mapCtx.getScale({
      success: function(res) {
        scale(res.scale)
      }
    })
  },

  /**
   * 设置缩放级别
   * 缩放级别，取值范围为5-18
   */
  setScale: function(scale) {
    that.setData({
      scale: scale
    });
  },

  /**
   * 设置下一级缩放级别
   */
  setNextScale: function() {
    that.getScale(function(scale) {
      if (scale == 18) {
        //不能再放大了
      } else {
        that.setScale(scale + 1);
      }
    });
  },

  /**
   * 设置上一级缩放级别
   */
  setPreScale: function() {
    that.getScale(function(scale) {
      if (scale == 5) {
        //不能再放大了
      } else {
        that.setScale(scale - 1);
      }
    });
  },

  /**
   * 下载app
   */
  downloadApp: function() {
    wx.navigateTo({
      url: '../download-web/download-web',
    })
  },

  /**
   * 开锁
   */
  openLock: function() {

    if(that.data.controlPower == 1)
    {
      appUtil.showToast('无开门权限!');
      return;
    }

    if(!that.isControlCar())
    {
      return;
    }

    that.setData({
      currentControlType: 3
    });
    that.control(3);

/* 
    if (!appUtil.isEmpty(app.data.userInfo)) {
      that.getUserInfo(app.data.userInfo, function(res) {
        //判断是否已经上传身份证
        // if (!res.data.identityCardBackUrl || !res.data.identityCardUrl) {
        //   //去认证身份证
        //   appUtil.navigateTo('../upload-img/upload-img?type=' + appUtil.SHOW_TYPE.IDCARD_TYPE);
        // } else {
        that.setData({
          currentControlType: 3
        });
        that.control(3);
        // }
      });

      // that.setData({
      //   currentControlType: 3
      // });
      // that.control(3);
    } else {
      //未登录，跳转登录
      wx.navigateTo({
        url: '../system/loginView/loginView',
      })
    }
  */
  },

  /**
   * 关锁
   */
  closeLock: function() {

    if(that.data.controlPower == 1)
    {
      appUtil.showToast('无关锁权限!');
      return;
    }

    if(!that.isControlCar())
    {
      return;
    }
    that.setData({
      currentControlType: 1
    });
    that.control(1);
   
   
   /*
    if (!appUtil.isEmpty(app.data.userInfo)) {
      that.getUserInfo(app.data.userInfo, function(res) {
        that.setData({
          currentControlType: 1
        });
        that.control(1);
      });
    } else {
      //未登录，跳转登录
      wx.navigateTo({
        url: '../system/loginView/loginView',
      })
    }
*/
  },

  /**
   * 寻车
   */
  lookForCar: function() {

    if(!that.isControlCar())
    {
      console.log("禁止寻车")
      return;
    }
  
    that.setData({
      currentControlType: 5
    });
    that.control(5);

/*
    if (!appUtil.isEmpty(app.data.userInfo)) {
      that.getUserInfo(app.data.userInfo, function(res) {
        that.setData({
          currentControlType: 5
        });
        that.control(5);
      });
    } else {
      //未登录，跳转登录
      wx.navigateTo({
        url: '../system/loginView/loginView',
      })
    }
*/
  },
  uploadImg: function() {
    appUtil.navigateTo('../upload-img/upload-img?type=' + appUtil.SHOW_TYPE.DRIVINGCARD_TYPE+"&code="+that.data.code);
  },
  /**
   * 试驾
   */
  testDriving: function() {
    if (!appUtil.isEmpty(app.data.userInfo)) {
      //已经登录
      that.getUserInfo(app.data.userInfo, function(res) {
        if (!res.data.identityCardBackUrl && !res.data.identityCardUrl && !res.data.drivinglicenceurl) {
          //认证
          appUtil.navigateTo('../upload-img/upload-img?type=' + appUtil.SHOW_TYPE.ALL_TYPE);
        } else if (!res.data.identityCardBackUrl || !res.data.identityCardUrl) {
          //去认证身份证
          appUtil.navigateTo('../upload-img/upload-img?type=' + appUtil.SHOW_TYPE.IDCARD_TYPE);
        } else if (!res.data.drivinglicenceurl) {
          //去认证驾驶证
          appUtil.navigateTo('../upload-img/upload-img?type=' + appUtil.SHOW_TYPE.DRIVINGCARD_TYPE);
        } else {
          if (!appUtil.isEmpty(res.data.protocolUrl)) {
            wx.navigateTo({
              url: '../trial-driving-agreement/trial-driving-agreement?url=' + res.data.protocolUrl,
            })
          }
        }
      });
    } else {
      that.jumpLoginView();
    }
  },

  /**
   * 我的
   */
  dealLogin: function() {

    if (!appUtil.isEmpty(app.data.userInfo)) {
      wx.navigateTo({
        url: '../userinfo/userinfo',
      })
    }
   else if (!appUtil.isEmpty(app.data.managerInfo)) {
      wx.navigateTo({
        url: '../managerInfo/userinfo',
      })
    }
    else {
      that.jumpLoginView();
    }

  },

  jumpLoginView:function()
  {
    wx.navigateTo({
      url: '../system/managerLoginView/loginView?openId='+that.data.openId,
    })
  },

  /**
   * 网络控制
   */
  networkControl: function(controlType) {

    /**
     * 判断网络状态
     */
    if (!that.data.isNetworkAvailable) {
      appUtil.showModal('请检查网络状态！', false, function() {});
      return;
    }

    appUtil.showLoading('正在控制...');
   
    console.log('------------control---------' + controlType + ";" + that.data.showCar.sn);
    var CONTROLTYPE;
    if(controlType == 3) CONTROLTYPE = '500';
    else if (controlType == 1) CONTROLTYPE = '501';
    else if (controlType == 5) CONTROLTYPE = '400';

    var param = {};
    param[urlUtil.ControlCar.CODE] = that.data.code;
    param[urlUtil.ControlCar.OPERATIONYPE] = CONTROLTYPE;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.ControlCar.CONTROL_CAR_URL, param, function(res) {
      appUtil.hideLoading();
      if (res.statusCode == 200) {
        if (res.data.code != 1000) {
          appUtil.showModal(res.data.msg, false, function() {});
        } else
          if (controlType == 5) {
            appUtil.showModal('寻车成功，请注意附近鸣笛车辆!', false, function() {});
          } else {
            appUtil.showModal('控制成功!', false, function() {});
          }
          /*
        } else if (res.data.code == -1) {
          appUtil.showModal('车辆没有要取消的订单!', false, function() {});
        } else if (res.data.code == -2) {
          //车辆如果有任务，不能控制
          appUtil.showModal('请点击定位按钮重新获取当前可用车辆！', false, function() {});
        } else {
          appUtil.showModal(res.data, false, function() {});
        }*/
      } else {
        appUtil.showModal('网络异常!', false, function() {});
      }
    });
  },

  /**
   * 5-寻车 1-锁门 3-开门
   */
  control: function(controlType) {

    // if (that.isNetworkControl() && controlType != 3) {
    /*if (that.isNetworkControl()) {
      if (controlType == 5 && that.data.showCar.distance > 5000) {
        appUtil.showModal('请在5公里内寻车', false, function() {
          console.log('-------------请在5公里内寻车-----------' + that.data.showCar.distance);
        });
        return;
      }

      if ((controlType == 1 || controlType == 3) && that.data.showCar.distance > 1000) {
        appUtil.showModal('请在1公里内开关车门', false, function() {
          console.log('-------------请在1公里内开关车门-----------' + that.data.showCar.distance);
        });
        return;
      }
    }*/

    /**
     * 判断网络状态
     */
    // if (!that.data.isNetworkAvailable) {
    //   appUtil.showModal('请检查网络状态！', false, function() {});
    //   return;
    // }


    //寻车最大100m,控车最大50m
    // if (that.isNetworkControl() && controlType != 3) { //开锁必须蓝牙
      if (that.isNetworkControl()) {
      that.networkControl(controlType);
    } else {
      //蓝牙控制
      that.bluetoothControl(controlType);
      // if (controlType == 3) {
      //   appUtil.showModal('请确认在车辆附近开门体验！', true, function(res) {
      //     if (res) {
      //       that.bluetoothControl(controlType);
      //     } else {
      //       app.data.operationSn = '';
      //     }
      //   });
      // } else {
      //   that.bluetoothControl(controlType);
      // }
    }
  },

  /**
   * 蓝牙控制
   */
  bluetoothControl: function(controlType) {
    that.dealControlPwd(that.data.showCar.sn, function(pwd) {
      console.log(that.data.showCar.sn);
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
        appUtil.showModal('控制密码不正确!', false, function() {});
      }
    });
  },

  /**
   * 判断是是网络控制还是蓝牙控制
   */
  isNetworkControl: function() {
    return that.data.currentSelectControlType == that.data.networkControlId;
  },

  /**
   * 是否是android6.0及以上
   */
  isAndroid6: function(result) {
    that.initSystemInfo(function() {
      result(that.data.systemType && that.data.systemVersion && that.data.systemType.toLowerCase() == 'android' && that.data.systemVersion >= 6.0);
    });
  },

  /**
   * 发送数据
   * sendType:发送类型
   * pwd:控制密码
   * createBLEConnection:连接状态
   * onReceiveValue:接收到数据
   */
  sendData: function(sendType, pwd) {
    console.log("--------------send-data-idc:" + that.data.showCar.idc + "--" + pwd);
    bleManager.sendData(that.data.showCar.idc, pwd, sendType, function(state) {
      // bleManager.sendData('19747000130', "EC6280F81AF34E8B", sendType, function (state) {
      if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE == state) {
        //显示加载框
        appUtil.showLoading('加载中...');
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR == state) {
        //异常取消加载框
        appUtil.hideLoading();
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE == state) {
        //蓝牙不可用
        appUtil.showModal('请打开蓝牙', false, function(confirm) {});
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND == state) {
        //没有扫描到设备信息
        that.isAndroid6(function(res) {
          if (res) {
            appUtil.showModal('没有发现设备,请确定已经打开手机定位和微信定位权限!', false, function(confirm) {});
          } else {
            appUtil.showModal('没有发现设备,请重试!', false, function(confirm) {});
          }
        });
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED == state) {
        //连接失败
        // appUtil.showModal('蓝牙连接失败,请重试!', false, function(confirm) {});
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED == state) {
        //不支持ble
        appUtil.showModal('您的手机不支持低功耗蓝牙', false, function(confirm) {});
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED == state) {
        //发送失败
        appUtil.showModal('数据发送失败,请重试!', false, function(confirm) {});
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE == state) {
        //无响应
        appUtil.showModal('设备超时无响应,请重试!', false, function(confirm) {});
      }
    }, function(data) {
      //隐藏加载框
      appUtil.hideLoading();
      if (data.controlType == 4) {
        //解析控制
        appUtil.showToast(data.result);
        if (data.result.indexOf("控制成功") != -1) {
          //控制成功,通知服务器
          var param = {};
          param[urlUtil.ControlCar.SN] = that.data.showCar.sn;
          param[urlUtil.ControlCar.TYPE] = that.data.currentControlType;
          param[urlUtil.ControlCar.TELPHONE] = app.data.userInfo.username;
          param[urlUtil.ControlCar.ISBLUETOOTH] = 1;
          param[urlUtil.ControlCar.CODE] = 123456;
          console.log('------------蓝牙控制后通知服务器---------' + that.data.currentControlType + ";" + that.data.showCar.sn);
          // appUtil.byPost(getApp().data.k1swUrl + urlUtil.ControlCar.CONTROL_CAR_URL, param, function(res) {

          // });
        }
      }
    });
  },

  getUser:function()
  {
    var param = {};
    param[urlUtil.getUser.USERID] = getApp().data.userInfo.id;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.getUser.URL, param, function(res) {
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == 1000) {
          appUtil.setStorage(getApp().data.userKey, res.data.content, function(success) {
          getApp().data.userInfo = res.data.content;
          });
        }
      }
    })
  },

  
  delay:function (milSec) {
 
    return new Promise(resolve => {
   
      setTimeout(resolve, milSec)
   
    })
   
  },
  onShow: function() {
    console.log('------------------onUnload');
    if (typeof that.getTabBar === 'function' &&
      that.getTabBar()) {
        console.log('------------------onUnload');
        that.getTabBar().setData({
        selected: 0  //当前页面索引，取值 0、1、2、3...
      })
    }

    if(getApp().data.isErcodeOpen)
    {
      that.authLocation();
    }
    else
    {
    appUtil.getStorage(getApp().data.managerKey, function(data) {
      if (data) {//登录情况下
        getApp().data.managerInfo = data;
          if(data.nodeid == 1 || data.nodeid == 2)
          { 
            that.setData({
              type:3 //员工 和 司机 type 都是 3
            })

            var param = {};
            param[urlUtil.getUserUseingCar.EMPLOYEEID] = data.id
            appUtil.byPost(getApp().data.k1swUrl + urlUtil.getUserUseingCar.URL, param, function(res) {
              if (res.statusCode == 200) {
                var data = res.data;
                if (data.code == 1000) {
                  var content = data.content;
                  that.setData({
                    code : content.controlcode,
                    plateNumber : content.platenumber,
                    rentTimeInfo : content.startdate,
                    selectSn : content.sn,
                    hasUsedCar : true
                  })
                  that.authLocation();
               }
               else
               {
                appUtil.showModal("您还未添加车辆，是否去添加？", true, function(res) {
                  if(res)
                  {
                    appUtil.navigateTo('../system/regDevice/regDevice');
                  }
                });
               
               }
        }
      });
    }
    
    }
    // else//未登录情况
    // {
    //   if(!appUtil.isEmpty(that.data.code))
    //   {
    //     that.authLocation();
    //   }
    // }
  }); 
}
    //  appUtil.showLoading('请稍后...');
    //  while(!isloadManager)
    //  {
    //   this.delay(1);
    //  }
    //  appUtil.hideLoading();
    // var type = that.data.type;
    // 租车人 转租人 车务 code为空 
    // if((type == -1 || type == 0 || type == 1 || type == 2) && appUtil.isEmpty(that.data.code))
    // {
    //   return;
    // }
    
    // if(that.data.reLunch)//是否重新执行定位
    // {
    //   if(appUtil.isEmpty(getApp().data.managerInfo))
    //   {
    //     that.authLocation();
    //   }
    // }
    // if(that.data.type == 2) //车务人员刷新当前任务
    // {
    //   this.getWork();
    // }

    //  appUtil.getStorage(app.data.userKey, function(res) {
    //     if (res) {
    //       that.getUser();
    //       if(that.data.type == 1)
    //       {
    //         that.requestUserProgressOrder();
    //       }
    //     } else {
          
    //         //设置地图等级
    //         //1.判断是否定位成功
    //         if (that.data.latitude != '' && (that.data.latitude + '').indexOf('undefined') == -1 && that.data.longitude != '' && (that.data.longitude + '').indexOf('undefined') == -1 && that.data.latitude && that.data.longitude) {
    //           //已经定位,车辆位置是否请求成功
    //           if (that.data.includePoints.length == 0) {
    //             //请求车辆不成功，请求车辆
    //             // that.requestAllCarPosition(that.data.latitude, that.data.longitude);
    //           } else {
    //             that.setData({
    //               includePoints: that.data.includePoints
    //             });
    //           }
    //         } else {
    //           //没有定位
    //           // appUtil.showModal('没有定位', false, function() {});
            
    //         }
            
    //     }
    //   });
    
  },



  /**
   * 当小程序后台运行或跳转到其他页面时
   */
  onHide: function() {
    //释放资源
    //   console.log('------------------onHide');
    //  releaseBleTask =  setTimeout(function(){
    //     bleManager.releaseBle();
    //     releaseBleTask='';
    //   },60*1000);
  },

  onUnload: function() {
    //释放资源
    console.log('------------------onUnload');
    // if (releaseBleTask){
    //   clearTimeout(releaseBleTask);
    //   releaseBleTask='';
    // }
    bleManager.releaseBle();
  },


  /**
   * 获取用户信息
   */
  getUserInfo: function(user, result) {

    /**
     * 判断网络状态
     */
    if (!that.data.isNetworkAvailable) {
      appUtil.showModal('请检查网络状态！', false, function() {});
      return;
    }
    appUtil.showLoading('请稍后...');
    var param = {};
    param[urlUtil.MemberManagementInfoPar.ID] = user.id;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.MemberManagementInfoPar.MEMBER_MANAGERMENT_API, param, function(res) {
      appUtil.hideLoading();
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == '10000') {
          //请求成功
          result(data);
        } else {
          appUtil.showToast(data.message);
        }
      } else {
        appUtil.showToast('网络异常！');
      }
    });
  },

  /**
   * 申请试驾
   */
  requestTestDriving: function() {
    var param = {};
    param[urlUtil.TestDriving.ID] = app.data.userInfo.id;
    param[urlUtil.TestDriving.VEHICLE_ID] = that.data.showCar.id;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.TestDriving.REQUEST_TEST_DRIVING, param, function(res) {
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == '10000') {
          //请求成功
          appUtil.showModal(data.message, false, function() {});
        } else {
          appUtil.showModal(data.message, false, function() {});
        }
      } else {
        appUtil.showToast('网络异常！');
      }
    });
  },
  getWork: function() {
    var param = {};
    param[urlUtil.getWork.CONTROLCODE] = that.data.code;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.getWork.URL, param, function(res) {
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == 1000) {
          that.setData({
            work:data.content
          })
        } else {
         // appUtil.showModal(data.msg, false, function() {});
          that.finishDes() 
        }
      } else {
        appUtil.showToast('网络异常！');
      }
    });
  },
  finishTap: function() {
   
    if(that.data.type ==0 )
    {
      that.returnCarTap();

    }
    else  if(that.data.type ==2 )
    {
      that.carManagerFinish();
    }
  },
  
  carManagerFinish : function(){
    var param = {};
    param[urlUtil.finishWork.CONTROLCODE] = that.data.code;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.finishWork.URL, param, function(res) {
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == 1000) {
          //请求成功
          that.finishDes();
          
          appUtil.showModal(data.msg, false, function() {});
        } else {
          appUtil.showModal(data.msg, false, function() {});
        }
      } else {
        appUtil.showToast('网络异常！');
      }
    });
  },

  //任务完成后做的清理工作
  finishDes:function() {
    that.setData({
      // type:-1,
      code:'',
      polyline: [],//删除划线
      markers:[],//删除车
      carInfo:'',
      addressInfo:'',
      carimg1:'',
      carimg2:'',
      hasUsedCar:false,
      plateNumber : '',
      rentTimeInfo : '',
      lastClickMarkerId: -1,
        //showCars: []
    });

    if(getApp().data.managerInfo == '')
    {
      that.setData({
        type:-1,
      })
    }

  },
  subletTap: function() {
    if(appUtil.isEmpty(getApp().data.managerInfo) || that.data.type != 3)
    {
      appUtil.showToast('您无权分享车辆!');
      return;
    }
    if(appUtil.isEmpty(that.data.selectSn))
    {
      appUtil.showToast('请先选中也要分享的车辆!');
      return;
    }
    wx.navigateTo({
      // url: '../sublet/sublet?code='+that.data.code+"&userId="+getApp().data.managerInfo.id,
      url: '../sublet/sublet?sn='+that.data.selectSn+"&userId="+getApp().data.managerInfo.id,
    })

  },

  rentalTap: function() {
          var user =  getApp().data.userInfo;
            if(user ==  null || user == '')
            {
                //去登陆
                that.jumpLoginView();
            }
            else if(that.data.rentButtonName =='租车')
            {
              if(user.identityapprove == 0 || user.identityapprove == 0)
              {
                appUtil.showToast('您还未认证，请到个人中心认证');
                return;
              }
              else if(user.identityapprove == 3)
              {
                appUtil.showToast('认证审核中，请耐心等待');
                return;
              }
              // else if(user.paidMemberFee <= 0)
              // {
              //   appUtil.showToast('押金不足，请先支付押金');
              //   return;
              // }
              else
              {
                appUtil.showLoading('请稍后...');
                  var param = {};
                  param[urlUtil.isControlCodeExpire.CONTROLCODE] = that.data.code;
                  appUtil.byPost(getApp().data.k1swUrl + urlUtil.isControlCodeExpire.URL , param , function(res) {
                    appUtil.hideLoading();
                      if (res.data.code == 1000) {
                        wx.navigateTo({
                          url: '../agreement/agreement',
                        })
                      }
                      else
                      {
                          appUtil.showToast(res.data.msg);
                      }
                  });
              }
             
            }
            else if(that.data.rentButtonName =='还车')
            {
              appUtil.showModal("确定要还车吗？", true, function(res) {
                if(res)
                {
                  appUtil.showLoading('请稍后...');
                  var param = {};
                  param[urlUtil.returnVehicle.ORDERID] = getApp().data.orderInfo.id;
                  param[urlUtil.returnVehicle.CONTROLCODE] = that.data.code;
                  appUtil.byPost(getApp().data.k1swUrl + urlUtil.returnVehicle.URL , param , function(res) {
                     appUtil.hideLoading();
                      if (res.data.code == 1000) {
                          // appUtil.showToast("还车成功");
                          that.initRentCarView(0);
                          appUtil.showModal("还车成功，租车费用" + res.data.content +"元已从押金中扣除", false, function(res) {});
                          // appUtil.navigateTo('../order/orderList');
                      }
                      else{
                        appUtil.showToast(res.data.msg);
                      }
                  });
                }
              });
            }

  },

  rentalCar: function() {

    console.log("------"+ that.data.finishDeposit);
                 appUtil.showLoading('请稍后...');
                  var param = {};
                  param[urlUtil.createOrderUrl.CONTROLCODE] = that.data.code;
                  param[urlUtil.createOrderUrl.USERID] = getApp().data.userInfo.id;
                  param[urlUtil.createOrderUrl.DEPOSIT] = that.data.finishDeposit;
                  appUtil.byPost(getApp().data.k1swUrl + urlUtil.createOrderUrl.URL , param , function(res) {
                    appUtil.hideLoading();
                      if (res.data.code == 1000) {
                          appUtil.showToast('租车成功');
                          getApp().data.orderInfo = res.data.content;
                          that.setData({
                            isShowRentView:true,
                            rentButtonName:'还车',
                            finishDeposit:0,
                            rentTimeInfo:res.data.content.chargingstartdate +' 开始租车',
                          })
                          
                      }
                      else
                      {
                          appUtil.showToast(res.data.msg);
                      }
                  });
  },

  rentViewTap : function()
  {
    appUtil.navigateTo('../order/orderList');
  },

  /**
   * 是否可以控车
   */
  isControlCar:function()
  {
     if(that.data.type == 0 || that.data.type == 1 || that.data.type == 2 )
     {
       if(that.data.code != '')
       {
        return true;
       }
       else
       {
        appUtil.showToast('无权控制车辆!');
       }
     }
     else if(that.data.type == 3)
     {
      if(that.data.code != '')
      {
       return true;
      }
      else
      {
       appUtil.showToast('请先使用车辆!');
      }
     }
     else
     {
      appUtil.showToast('无权使用!!');
      return false;
     }
     
  },
  showCarImg:function()
    {
      if(appUtil.isEmpty(that.data.code))
      {
        appUtil.showToast('未获得到车辆数据!');
        return;
      }
      var imgs =[];
      if(!appUtil.isEmpty(that.data.carimg1))
      {
        imgs.push(getApp().data.k1swUrl + urlUtil.fin3plusUrl + that.data.carimg1.replace(/\\/g,"/"));
      }
      if(!appUtil.isEmpty(that.data.carimg2))
      {
        imgs.push(getApp().data.k1swUrl + urlUtil.fin3plusUrl + that.data.carimg2.replace(/\\/g,"/"));
      }
      if(!appUtil.isEmpty(that.data.carimg3))
      {
        imgs.push(getApp().data.k1swUrl + urlUtil.fin3plusUrl + that.data.carimg3.replace(/\\/g,"/"));
      }
      if(imgs.length >0)
      {
        wx.previewImage({
          urls:imgs // 需要预览的图片http链接列表
        });
        that.setData({
          reLunch:false,
        });
      }
      else
      {
        appUtil.showToast('此车没有照片!');
      }
    },

    /**
     * 使用车辆
     */
  useCarTap:function()
  {
    var param = {};
    param[urlUtil.useCar.EMPLOYEEID] = getApp().data.managerInfo.id;
    param[urlUtil.useCar.SN] = that.data.selectSn;
    appUtil.showLoading('加载中...');
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.useCar.URL, param, function(res) {
    appUtil.hideLoading();
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == 1000) {
          var content = data.content;
          
          that.setData({
            code : content.controlcode,
            plateNumber : content.platenumber,
            rentTimeInfo : content.startdate,
            hasUsedCar:true
          })
          appUtil.showToast(data.msg);
        }
        else
        {
          appUtil.showToast(data.msg);
        }
      }
    })
  },
  returnCarTap:function()
  {
    var param = {};
    param[urlUtil.returnCar.CONTROLCODE] = that.data.code;
    appUtil.showLoading('加载中...');
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.returnCar.URL, param, function(res) {
    appUtil.hideLoading();
      if (res.statusCode == 200) {
        var data = res.data;
        if (data.code == 1000) {
          that.setData({
            code : '',
            plateNumber : '',
            rentTimeInfo : '',
            carInfo: '',
            addressInfo: '',
            lastClickMarkerId: -1,
            polyline: [],//删除划线
            markers:[],//删除车
            hasUsedCar:false,
            selectSn:'',
            isShowRentView:false
          })
          appUtil.showToast(data.msg);
          that.authLocation();
        }
        else
        {
          appUtil.showToast(data.msg);
        }
      }
    })
  },
  getMyPosition:function()
  {
    appUtil.getAuthState(appUtil.SCOPE_TYPE.SCOPE_LOCATION, function(auth) {
      if (auth) {
        
        appUtil.getWXLocation(function(res) {
          console.log('---------当前位置2:' + res.latitude + ";" + res.longitude);
          if(!appUtil.isEmpty(res.latitude) && !appUtil.isEmpty(res.longitude))
          {
            console.log('---------getMyPosition:' + res.latitude + ";" + res.longitude);
            var markerList = []
            markerList.push(that.generateMarker(that.data.myPositionImgUrl, -1, res.latitude, res.longitude));
            that.setData({
              latitude:res.latitude,
              longitude:res.longitude,
              markers: markerList
            });
          }
          
        });
        
      } else {
        //去授权
        appUtil.authorize(appUtil.SCOPE_TYPE.SCOPE_LOCATION, function(success) {
          if (success) {

            appUtil.getWXLocation(function(res) {
              console.log('---------当前位置2:' + res.latitude + ";" + res.longitude);
              if(!appUtil.isEmpty(res.latitude) && !appUtil.isEmpty(res.longitude))
              {
                console.log('---------getMyPosition:' + res.latitude + ";" + res.longitude);
                var markerList = []
                markerList.push(that.generateMarker(that.data.myPositionImgUrl, -1, res.latitude, res.longitude));
                that.setData({ 
                  latitude:res.latitude,
                  longitude:res.longitude,
                  markers: markerList
                });
              }
              
            });
            
          } else {
            //授权失败
            appUtil.showModal('请打开定位权限!', true, function(res) {
              if (res) {
                wx.openSetting({
                  success(res) {}
                })
              }
            });
          }
        });
      }
    });
  }

})