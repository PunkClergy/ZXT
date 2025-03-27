const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
const bleManager = require('../../../utils/ble-manager.js');

const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  u_carList
} = require('../../../utils/request/car')
const {
  byPost
} = require('../../../utils/request/http')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
Page({

  /**
   * 页面的初始数据
   */
  data: {
    c_screen_height: _handleWindowInfo.windowHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 70, // 搜索框高度，默认值
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度

    scale: 16,
    polyline: [],
    includePoints: [],
    markers: [],
    latitude: '39.915077',
    longitude: '116.403838',
    currentSelectControlType: -4,


    dataSet: {},
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    page: 1,
    items: [], // 数据列表
    tabs: [{
        name: '电子钥匙'
      },
      {
        name: '数据及风控'
      }
    ],
    isShow: false,
    activeTab: 0 // 默认选中的Tab索引
  },
  handleJumpCarList() {
    wx.navigateTo({
      url: '/pages/carManager/carList/carList?source=' + '/pages/rentKeySend/sending/sending',
    })
  },
  getCarPostion: function () {
    const that = this
    var param = {};
    param[urlUtil.getCarPoisiton.sn] = '640019994';
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
  controlTap: function (res) {
    const that = this
    var controlId = res.target.id;
    if (controlId == -4) {
      if (controlId != that.data.currentSelectControlType) {
        //网络控制
        appUtil.showToast('已经切换成网络控车模式');
        that.setData({
          currentSelectControlType: controlId
        });

      }
      bleManager.releaseBle();
    } else if (controlId == -5) {
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
  stautsBtnTap: function () {
    const that = this

    appUtil.showLoading('加载中...');
    var param = {};
    param[urlUtil.getCarStatus.sn] = '640019899';
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
    const that = this
    that.setData({
      showModal: false
    })
  },
  travleButtonTap: function () {
    const that = this
    wx.navigateTo({

      url: '/pages/riskControl/travelingtrack/travelingtrack?sn=' + '640019899' + "&lat=" + that.data.latitude + "&lng=" + that.data.longitude,
    })

  },
  operationBtnTap: function (e) {
    const that = this
    var controlType = e.currentTarget.id;
    that.networkControl(controlType);

  },
  networkControl: function (controlType) {
    const that = this
    appUtil.showLoading('正在控制...');
    var param = {};
    param[urlUtil.operation.sn] = '640019899';
    param[urlUtil.operation.code] = '000000';
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


  handleSwitchTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      activeTab: index
    })
  },
  openPopup() {
    this.setData({
      isShow: true
    });
  },
  canclPopup() {
    this.setData({
      isShow: false
    });
  },
  closePopup() {
    this.setData({
      isShow: false
    });
  },
  bindTimeChange: function (e) {
    const index = e.currentTarget.dataset.index;
    const fieldMap = {
      startDate: 'startDate',
      startTime: 'startTime',
      endDate: 'endDate',
      endTime: 'endTime'
    };

    if (fieldMap.hasOwnProperty(index)) {
      this.setData({
        [fieldMap[index]]: e.detail.value
      });
    }
  },
  formSubmit(e) {
    const obj = {
      ...e.detail.value,
      ...this.data
    }
    const param = {
      vehId: obj.vehId,
      startDate: obj.startDate + obj.startTime,
      endDate: obj.endDate + obj.endTime,
      personName: obj.personName,
      mobile: obj.mobile,
    }
    // 请求接口
    appUtil.byGet(getApp().data.k1swUrl + urlUtil.sendRentKey.URL, param, function (res) {
      console.log(res.data)
      if (res.data.code == 1000) {
        wx.navigateTo({
          url: '/pages/rentKeySend/rentKeySend',
        })
      }
    })
  },
  getCarList: function (e) {
    const that = this
    var param = {};
    param[urlUtil.rentRecord.vehId] = e;


    param[urlUtil.rentRecord.page] = that.data.page;
    appUtil.showLoading("加载中...")
    appUtil.byGet(getApp().data.k1swUrl + urlUtil.rentRecord.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {

          if (that.data.page > 1 && data.content.length == 0) {
            appUtil.showToast("已加载全部数据：共" + that.data.items.length + "条")
          }
          that.setData({
            items: that.data.items.concat(data.content)
          })
        } else {
          appUtil.showModal(data.msg, false, function () {});
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },
  lower(e) {
    const that = this
    that.setData({
      page: that.data.page + 1
    });
    that.getCarList(that.data.vehId);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this
    if (options?.datails) {
      console.log(JSON.parse(options.datails))
      var carItem = JSON.parse(options.datails);
      _this.setData({
        cellData: carItem,
        vehId: JSON.parse(options.datails).id
      })
      _this.getCarList(JSON.parse(options.datails).id);
    }


    _this.getCarPostion();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    const that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          scrollHihgt: res.windowHeight - getApp().data.tabBarHeight - 170
        });
      }
    });
  },

})