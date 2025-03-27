//工具
const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
//腾讯地图微信小程序支持包
const QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var mapCtx;
var that;

Page({

    /**
     * 页面的初始数据
     */
    data: {
    mapHeight: 0,
    //当前位置信息
    latitude: '',
    longitude: '',
    markers: [],
    includePoints:[],
    polyline:[],
    mapId: 'map',
    scale: 16,
    //腾讯移动端key(日调用量：1万次 / Key , 5次 / key / 秒)
    key: 'W66BZ-ADBC3-COB3F-YWZG4-MAVRO-IJBIM',
    arcImage: '../../assets/images/control_up_bg.png',
    arcHeight: 49,
    coverHeight: 350,

    startDate:'',
        startTime:'',
        endDate:'',
        endTime:'',
        items:[],
        currentSn:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        that =this;
        that.setData({
          currentSn:options.sn,
          latitude:options.lat,
          longitude:options.lng
        })
        that.nowTime();
        that.initMap();

       // that.getMyPosition();
        // that.getMyCars();
    },

    nowTime:function() { //当前日期
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        // var mytime=date.toLocaleTimeString();     //获取当前时间
        var sd = year + "-" + month + "-" + day;

        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();
        var st = h +":" + m + ":" + s;

        console.log(st);

        that.setData({
            startDate:sd,
            startTime:'00:00:00',
            endDate:sd,
            endTime:st
        })
      },

    initMap:function()
    {
        qqmapsdk = new QQMapWX({
            key: that.data.key // 必填
          });

           // 使用 wx.createMapContext 获取 map 上下文
    mapCtx = wx.createMapContext(that.data.mapId);
    //自动算地图的高度
    appUtil.getSystemInfoComplete(function(res) {
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
    function() {
      
        }); 
    
    
    },

    getMyCars: function() {
        var param = {};
        param[urlUtil.myCarList.EMPLOYEEID] = getApp().data.managerInfo.id;
        // param[urlUtil.useCarList.PAGE] = that.data.page;
        appUtil.showLoading("加载中...")
        appUtil.byPost(getApp().data.fin3Url + urlUtil.myCarList.URL, param, function(res) {
          appUtil.hideLoading();
          if (res.statusCode == 200) {
            var data = res.data;
            if (data.code == 1000) {
                if(data.content.length > 0)
                {
                    that.setData({
                        items: data.content,
                        currentSn:data.content[0].sn
                     })
                }
            }
          }
    
        });
      },

      radioChange(e) {
        console.log('radio发生change事件，携带value值为：', e.detail.value);
        that.setData({
            currentSn:e.detail.value
         })

      },

    getMyPosition:function()
  {
    appUtil.getAuthState(appUtil.SCOPE_TYPE.SCOPE_LOCATION, function(auth) {
      if (auth) {
        appUtil.getWXLocation(function(res) {
          if(!appUtil.isEmpty(res.latitude) && !appUtil.isEmpty(res.longitude))
          {
            that.setData({
              latitude:res.latitude,
              longitude:res.longitude,
            });
          }
          
        });
    }
});
  },

  
  bindStartDateChange: function(e) {
    this.setData({
      startDate: e.detail.value
    })
  },

  bindStartTimeChange: function(e) {
    this.setData({
      startTime: e.detail.value
    })
  },

  bindEndDateChange: function(e) {
    this.setData({
      endDate: e.detail.value
    })
  },

  bindEndTimeChange: function(e) {
    this.setData({
      endTime: e.detail.value
    })
  },

  selectTap:function(e)
  {
    if (appUtil.isEmpty(that.data.startDate)) {
        appUtil.showToast('请选择开始日期');
        return;
    }
    if (appUtil.isEmpty(that.data.startTime)) {
        appUtil.showToast('请选择开始时间');
        return;
    }
    if (appUtil.isEmpty(that.data.endDate)) {
        appUtil.showToast('请选择结束日期');
        return;
    }
    if (appUtil.isEmpty(that.data.endTime)) {
        appUtil.showToast('请选择结束时间');
        return;
    }

    
    appUtil.showLoading('加载中...');
    var param = {};
    // param[urlUtil.getTrackPlayback.SN] = that.data.currentSn;
    param[urlUtil.getTrackPlayback.SN] = '640019899';
    param[urlUtil.getTrackPlayback.STARTDATE] = that.data.startDate + " " +that.data.startTime;
    param[urlUtil.getTrackPlayback.ENDDATE] = that.data.endDate + " " +that.data.endTime;
    appUtil.byPost(getApp().data.fin3Url + urlUtil.getTrackPlayback.URL , param , function(res) {
        appUtil.hideLoading();
        if(res)
        {
        var data = res.data;
        if (data.code == 1000) {
            var contentArr = data.content;
            var markerList = [];
            var includePointsList = [];
            var polylineList = [];
            for(var i=0 ; i< contentArr.length;i++ )
            {
                
                var content = contentArr[i];
                if(i == 0)
                {
                    markerList.push(that.generateMarker("../../../assets/images/startPoint.png",content.latitude, content.longitude));
                }
                else if(i == contentArr.length - 1)
                {
                    markerList.push(that.generateMarker("../../../assets/images/endPoint.png",content.latitude, content.longitude));
                }
                includePointsList.push(that.generatePoint(content.latitude, content.longitude));
                polylineList.push(that.generatePoint(content.latitude, content.longitude));
            }

            var line = {};
            line.points = polylineList;
            line.color = '#3893F9';
            line.width = 5;
            line.arrowLine = true;
             
            var pointLine = [];
            pointLine.push(line);
            that.setData({
              markers: markerList,
              includePoints:includePointsList,
              polyline:pointLine
            });
        }
        else{
            appUtil.showModal(res.data.msg, false, function() {});
        };
    }
    else
    {
        appUtil.showModal("请求超时，请检查网络！", false, function() {});
    }
    });

  },

   /**
   * 生成一个marker
   */
  generateMarker: function(iconPath, latitude, longitude) {
    var marker = {};
    marker.width = 25;
    marker.height = 37;
    // marker.title = "1111";
    marker.iconPath = iconPath;
    marker.latitude = latitude;
    marker.longitude = longitude;
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
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

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