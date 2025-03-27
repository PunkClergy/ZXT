const appUtil = require('../../utils/app-util.js');
const urlUtil = require('../../utils/url-util.js');

var app = getApp()
var that;
var rentReadyComObj;
var rentingComObj;
var rentHistoryComObj;
Page({
  data: {
    imageHost : urlUtil.fin3plusImgUrl,
    startOilPhoto:'',
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    calcel:false,
    items: [], // 数据列表
    page:1,
    showModal: false,
    showHzModal: false,
    showDetailModal:false,
    cellData:'',
    searchText:'',
    nowDate:''
  },
  onLoad: function () {
     that = this;
    // that.requestUserOrderList();

    let t = this, sbar = this.selectComponent("#searchbar"),
    { hideInput } = sbar
    console.log(this.selectComponent("#searchbar"))

    // 重写
    Object.defineProperties(sbar.__proto__, {
      hideInput:{
        configurable: true,
        enumerable: true,
        writable: true,
        value(...p){
           // 加上这句，同时wxml需要加上bindcancel="cancel"
          this.triggerEvent('cancel', {})
          // 或者这里直接调用下面的cancel方法，那么wxml就不需要bindcancel
          // t.cancel()

          // 执行原方法，返回原方法结果
         // return hideInput.apply(sbar, p)
        }
      }
    })
    /** 
     * 获取系统信息 
     */
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },

  onReady: function () {
      rentingComObj = that.selectComponent("#renting");
      rentingComObj.getRentingAndHistory(that.data.searchText);

      rentReadyComObj = that.selectComponent("#rentReady");
      rentReadyComObj.getRentReadyCarList(that.data.searchText);
      
      rentHistoryComObj = that.selectComponent("#rentHistory");
      rentHistoryComObj.getRentingAndHistory(that.data.searchText);
  },
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {
   
    that.setData({ currentTab: e.detail.current });
    console.log(that.data.currentTab);
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },

  clearInput: function(){
    console.log("clear")
    that.setData({
      searchText : ''
    })
  },
  cancel: function(e){
   
    if(that.data.currentTab == 0)
    {
      rentingComObj.clearItems();
      rentingComObj.getRentingAndHistory(that.data.searchText);
    }
    else if(that.data.currentTab == 1)
    {
      rentReadyComObj.clearItems();
      rentReadyComObj.getRentReadyCarList(that.data.searchText);
    }
    else if(that.data.currentTab == 2)
    {
      rentHistoryComObj.clearItems();
      rentHistoryComObj.getRentingAndHistory(that.data.searchText);
    }
  },
  inputChange:function(e)
  {
    var t = e.target
    console.log(e.detail.value)
    that.setData({
      searchText : e.detail.value
    })
  },
  selectRes:function(e)
  {
    
    console.log(e.detail)
  },
  
  showStartRentDlg: function(e){
    that.setData({
      showModal: true,
      cellData:e.detail
    })
    
    
},

showRentingDetailDlg: function(e){
  var startOilPhoto = '';
  if(!appUtil.isEmpty(e.detail.panelstartimg))
  {
    startOilPhoto = that.data.imageHost + (e.detail.panelstartimg.replace(/\\/g, '/'));
  }
that.setData({
  cellData:e.detail,
  startOilPhoto:startOilPhoto,
  showDetailModal:true,
})
},

closeDetailDlg:function()
{
  that.setData({
    showDetailModal:false,
  })
},

showEndRentDlg: function(e){
  var startOilPhoto = '';
  if(!appUtil.isEmpty(e.detail.panelstartimg))
  {
    startOilPhoto = that.data.imageHost + (e.detail.panelstartimg.replace(/\\/g, '/'));
  }
  that.setData({
    showHzModal: true,
    cellData:e.detail,
    startOilPhoto:startOilPhoto,
    nowDate:appUtil.jsDateFormatter(new Date())
  })

  if(appUtil.isEmpty(that.data.cellData.realcost))
  {
    var realCose = "cellData.realcost";
    that.setData({
      [realCose]:0
    })
  }
},

updateStartPhoto :function(cellIndex,photoPath)
{
  rentReadyComObj.updateCellStartPhoto(cellIndex,photoPath);
},
updateEndPhoto :function(cellIndex,photoPath)
{
  rentingComObj.updateCellEndPhoto(cellIndex,photoPath);
},
imgTap:function(e)
{
  var img = e.target.id;
  if(img == undefined || img == '' )
  {
    return;
  }
  var urls = [img];
  wx.previewImage({
     current:img,   //当前图片地址
     urls:urls,        //所有要预览的图片的地址集合 数组形式
      })
    

},
cancelButttonTap:function()
{
  that.setData({
    showModal: false,
    showHzModal:false
  })
  //var d = appUtil.jsDateFormatter(new Date())
  //console.log(d);
},
startRentButtonTap:function()
{
  that.startRent();
},

startRent: function() {
  var  cellData = that.data.cellData;
  var param = {};
  param[urlUtil.rentStart.vehId] = cellData.id;
  param[urlUtil.rentStart.oil] = cellData.oil;
  appUtil.showLoading("加载中...")
  appUtil.uploadFile2(getApp().data.k1swUrl + urlUtil.rentStart.URL,urlUtil.rentStart.panelStartImg,cellData.startPhotoPath, param, function(res) {
    appUtil.hideLoading();
    if (res) {
      var data = res.data;
      if(!appUtil.isEmpty(cellData.startPhotoPath))
      {
        data = JSON.parse(data);
      }
      appUtil.showModal(data.msg, false, function() {});
      if (data.code == 1000) {
        rentReadyComObj.refresh();
        rentingComObj.refresh();
        that.setData({  
          showModal: false,
        })
      }
    }
    else
    {
      appUtil.showModal("请求发生错误，请检查网络！", false, function() {});
    }

  });
},
endRentButtonTap:function()
{
  that.endRent();
},

endRent: function() {
  var  cellData = that.data.cellData;
  var param = {};
  param[urlUtil.rentEnd.id] = cellData.id;
  param[urlUtil.rentEnd.oilPrice] = cellData.oilPrice;
  param[urlUtil.rentEnd.realcost] = cellData.realcost;
  param[urlUtil.rentEnd.oil] = cellData.endoil;
  appUtil.showLoading("加载中...")
  appUtil.uploadFile2(getApp().data.k1swUrl + urlUtil.rentEnd.URL,urlUtil.rentEnd.panelEndImg,cellData.panelendimg, param, function(res) {
    appUtil.hideLoading();
    console.log(11111)
    if (res) {

      if(res.statusCode == 200)
      {
      var data = res.data;
      if(!appUtil.isEmpty(cellData.panelendimg))
      {
        data = JSON.parse(data);
      }
      appUtil.showModal(data.msg, false, function() {});
      if (data.code == 1000) {
        
        that.setData({  
          showHzModal: false,
        })
        rentingComObj.refresh();
        rentReadyComObj.refresh();
        rentHistoryComObj.refresh();
      }
    }
    else
    {
      appUtil.showModal("请求发生错误", false, function() {});
    }
    }
    else
    {
      appUtil.showModal("请求发生错误，请检查网络！", false, function() {});
    }

  });
},
})