// pages/debug/debug.js
//ble管理类
const bleKeyManager = require('../../utils/BleKeyFun-utils.js');
//工具
const appUtil = require('../../utils/app-util.js');
const byteUtil = require('../../utils/byte-util.js');

var that;
var i=0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    idc:'',
    data:'',
    msg:'',
    consolemsg:'',
    deviceIDC:"51CarKey932505100319",
    isOwner:false,

    //scrollTop:0,
    scrollTo:"hiddenview",
    scrollTo2:"hiddenview2",

    connectionState:"未连接",
    connectionID:"",
    connectionDisplay:"未连接",

    parseLen:0,

    pageInterval:0,


  },

  /**
   * 获取发送框数据
   */
  dataInput: function (e) {
    var data = e.detail.value;
    that.setData({ data: data });
  },

  btn0: function(){
    i++;
    // var height = wx.getSystemInfoSync().windowHeight;
    that.setData({
      msg: that.data.msg + i + "\n",
      // scrollTop: height*200
    })
    that.setData({
      scrollTo: "hiddenview"
    })
  },


  auth_encrypt:function(passwordSource,random){
    var passwordEncrypt=[0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00];
    for(var i = 0;i < 6;i++){
      passwordEncrypt[i] = passwordSource[i]^random[i];
      passwordEncrypt[i]^=0xFF;
    }
    return passwordEncrypt;
  },

  btnCmdSend: function(type,data){
    switch (type){
      case 0x10:
        var orgKey=[0x33,0x69,0x45,0x22,0x83,0x78];
        var retKey=that.auth_encrypt(orgKey,data);
        that.PackAndSend(type,8,retKey);        
        break;
      case 0x03://开锁
        that.PackAndSend(type,8,[0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
        break;
      case 0x04://锁车
        that.PackAndSend(type,8,[0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
        break;
      case 0x05://尾箱
        that.PackAndSend(type,8,[0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
        break;
      case 0x06://寻车
        that.PackAndSend(type,8,[0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
        break;
      case 0x22://配对
        that.PackAndSend(type,8,data);
        break;
      default:
        break;
    }
  },

  PackAndSend: function(type,len,data){
    var header=[0x24];
    var end=[0x24];
    var packet=header.concat(type).concat(len).concat(data).concat(end);
    that.consoleOut("send:"+byteUtil.buf2hex(packet)+"\r\n");
    bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
    return;
  },
  arrayToArrayBuffer: function (array, elementSize = 1) {
    const typedArray = new Uint8Array(array.length * elementSize);
    for (let i = 0; i < array.length; i++) {
      typedArray[i * elementSize] = array[i]; 
      // 如果需要处理多字节元素，请在这里添加额外的逻辑
    }
    return typedArray.buffer;
  },
  btnStartConnect: function(){
    if(that.data.connectionID=="")
    {
    bleKeyManager.connectBLE(that.data.deviceIDC,function(state){
      if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE == state) {
        //显示加载框
        //appUtil.showLoading('加载中...');
      } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR == state) {
        //异常取消加载框
        appUtil.hideLoading();
      } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE == state) {
        //蓝牙不可用
        appUtil.showModal('请打开蓝牙', false, function (confirm) { });
      } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND == state) {
        //没有扫描到设备信息
        appUtil.showModal('没有发现设备', false, function (confirm) { });
      } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED == state) {
        //连接失败
        //appUtil.showModal('蓝牙连接失败', false, function (confirm) { });
      } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED == state) {
        //不支持ble
        appUtil.showModal('您的手机不支持低功耗蓝牙', false, function (confirm) { });
      } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED == state) {
        //发送失败
        appUtil.showModal('数据发送失败', false, function (confirm) { });
      } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE == state) {
        //无响应
        appUtil.showModal('设备超时无响应', false, function (confirm) { });
      } else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_SUCESS == state){
        appUtil.hideLoading();
      }
    },function(type,arrayData,hexData,hexTextData){
      if(type==0){//校验
        // console.log(arrayData);
        // console.log(hexData);
        that.btnCmdSend(0x10,arrayData);          
      }
      else{//正常数据
        //that.btnParseRecv();
      }

      that.setData({
        msg: that.data.msg + "receive: type:" + type + ",data:" + hexTextData + "\r\n",
 
      })

      that.setData({
        scrollTo: "hiddenview"
      })
    })
    }
    else
      appUtil.showModal('已连接蓝牙', false, function (confirm) { });
  },

  btnEndConnect: function(){
    bleKeyManager.releaseBle();
  },


  /**
   * 指令接收
   */  
  btnParseRecv: function(){
    if(that.data.msg.indexOf("WRONG",that.data.parseLen)!=-1){
      appUtil.hideLoading();
      appUtil.showModal('车型选择错误', false, function (confirm) { });
      that.setData({parseLen:that.data.msg.length});
    }
    else if(that.data.msg.indexOf("CANERROR",that.data.parseLen)!=-1){
      appUtil.hideLoading();
      appUtil.showModal('总线错误', false, function (confirm) { });
      that.setData({
        parseLen:that.data.msg.length,
    
        runStep:0,
        ONsta:"关",
        HOODsta:"关",
        VIN:"",
        OPENsta:0,

   

      });
    }
    else if(that.data.msg.indexOf("END",that.data.parseLen)!=-1){
      appUtil.hideLoading();
      that.setData({parseLen:that.data.msg.length});
    }
    else if(that.data.msg.indexOf("SYSTEM START",that.data.parseLen)!=-1){
      that.consoleOut("设备重启,重新执行");
      that.setData({
        parseLen:that.data.msg.length,

        multiArray: [['车系','北汽'], ['车型','BJ30'], ['年份','2025']],
        multiIndex: [1, 1, 1],
    
        runStep:0,
        softVerb:"",
        ONsta:"关",
        HOODsta:"关",
        VIN:"",
        OPENsta:0,

      });
    }
  },

  btnUnlock: function(){
      that.btnCmdSend(0x03,"");
    
  },
  btnLock: function(){
    that.btnCmdSend(0x04,"");
  },
  btnTrunk: function(){
    that.btnCmdSend(0x05,"");
  },
  btnFind: function(){
    that.btnCmdSend(0x06,"");
  },
  btnPair: function(){
    const deviceInfo = wx.getDeviceInfo()
    console.log(deviceInfo);
    if(deviceInfo.system.toLowerCase().indexOf('android')!=-1){
      that.btnCmdSend(0x22,[0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
      setTimeout(() => {
        bleKeyManager.makePair();
      }, 200);      
    }
    else{
      that.btnCmdSend(0x22,[0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
      setTimeout(() => {
        that.btnCmdSend(0x22,[0x02,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
        setTimeout(() => {
          that.btnEndConnect();
          var pairInteval=setInterval(() => {
            if(bleKeyManager.getBLEConnectionState()==false){
              clearInterval(pairInteval);
              setTimeout(() => {
                that.btnStartConnect();
              }, 500);
            }
          }, 500);
          setTimeout(() => {
            clearInterval(pairInteval);
          }, 3000);
        }, 200);
      }, 200);      
    }
  },

  btnConnected: function(){
    bleKeyManager.connectedDevice();
  },

  /**
   * 小程序LOG打印
   */
  consoleOut: function (e) {
    that.setData({
      consolemsg:that.data.consolemsg+"\r\n"+e,
      scrollTo2: "hiddenview2",
    })
  },

    /**
   * 清空接收
   */
  btnLogClear: function () {
    that.setData({
      msg: "",
      consolemsg:"",
      parseLen:0,
    });
  },  


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("debug page load")
    that = this;
      that.btnStartConnect();     



    that.data.pageInterval=setInterval(() => {
      if(bleKeyManager.getBLEConnectionState()==true){
        that.setData({ 
          connectionState: "已连接",
          connectionID:bleKeyManager.getBLEConnectionID(),
          connectionDisplay:that.data.connectionID,
        });
      }
      else{
        that.setData({ 
          connectionState: "未连接",
          connectionID:"",
          connectionDisplay:"未连接",

         });
      }
    }, 200);
    that.setData({
      msg: "",
      consolemsg:"",
      parseLen:0,
    });
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },

 



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("debug page hide")
    if(that.data.connectionState=="已连接"){
      setTimeout(function (){
        bleKeyManager.releaseBle();
      },1500)
    }
    clearInterval(that.data.pageInterval);
    wx.setKeepScreenOn({
      keepScreenOn: false
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("debug page unload")
  
    setTimeout(function (){
      bleKeyManager.releaseBle();
    },500)
    clearInterval(that.data.pageInterval);
    wx.setKeepScreenOn({
      keepScreenOn: false
    })
  },

 




})