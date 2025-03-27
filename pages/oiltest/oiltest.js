// pages/debug/debug.js
//ble管理类
const debugManager = require('../../oiltestUtils/debug-util.js');
const bleManager = require('../../oiltestUtils/oiltestutil.js');
//获取控制命令类
const controlCmds = require('../../oiltestUtils/device-control-cmds.js');
//工具
const appUtil = require('../../oiltestUtils/app-util.js');
const byteutils = require("../../oiltestUtils/byte-util.js");
const md5Util = require('../../oiltestUtils/md5.js');
const computeUtil = require('../../oiltestUtils/compute.js')

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
    msg2:'',
    //scrollTop:0,
    scrollTo:"hiddenview",
    scrollTo2:"hiddenview2",
    
    //connectionState:"未连接",
    //connectionID:"",

    pageInterval:0,
    intervalCount:0,

    array: ['默认'],
    index: 0,
    sendcansetting:[
      // {"sType":0,"canSID1":"000007df","canSID2":"000007e0","sLen":8,"sData":"02012F0000000000","canRID":"000007ff","rType":0},
      // {"sType":0,"canSID1":"18DB33F1","canSID2":"18DAF110","sLen":8,"sData":"02012F0000000000","canRID":"18DAF1FF","rType":0},
      //TP IDIDIDID IDIDIDID LL DATADATADATADATA IDIDIDID TP DDDDDDDD CCCC
      ],
    // sendcansettingDefault:[
    //   {"sType":0,"canSID1":"000007df","canSID2":"000007e0","sLen":8,"sData":"02012F0000000000","canRID":"000007ff","rType":0},
    //   {"sType":0,"canSID1":"18DB33F1","canSID2":"18DAF110","sLen":8,"sData":"02012F0000000000","canRID":"18DAF1FF","rType":0},
    //   //TPTP IDIDIDID IDIDIDID LL DATADATADATADATA IDIDIDID TP DDDDDDDD CCCC
    //   ],
    // sendcansettingVW:[
    //   {"sType":1,"canSID1":"00000714","canSID2":"00000714","sLen":8,"sData":"032222B000000000","canRID":"0000077e","rType":1},
    //   {"sType":1,"canSID1":"000007df","canSID2":"000007e0","sLen":8,"sData":"02012F0000000000","canRID":"000007ff","rType":0},
    //   {"sType":1,"canSID1":"18DB33F1","canSID2":"18DAF110","sLen":8,"sData":"02012F0000000000","canRID":"18DAF1FF","rType":0},
    //   //TPTP IDIDIDID IDIDIDID LL DATADATADATADATA IDIDIDID TP DDDDDDDD CCCC
    //   ],
    numofSetting:0,
    currentRun:{},
    currentSetting:0,
    needRetry:false,
    //oilData:"",

    //以下是测试相关
    //localcansetting:{"sType":0,"canSID1":"000007df","canSID2":"000007e0","sLen":8,"sData":"02012F0000000000","canRID":"000007ff","rType":0},
    sType:65535,
    canSID1:'000007DF',
    canSID2:'000007E0',
    sLen:8,
    sData:'02012F0000000000',
    canRID:'000007FF',
    rType:0,

    transmitID:'000007FF',
  },

  /**
   * 保存idc
   */
  idcInput: function (e) {
    var idc = e.detail.value;
    that.setData({ idc: idc });
    wx.setStorage({
      key: 'idcble',
      data: idc,
    })
  },

    /**
   * 保存idc
   */
  dataInput: function (e) {
    var data = e.detail.value;
    that.setData({ data: data });
    wx.setStorage({
      key: 'data',
      data: data,
    })
  },

  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
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

  btn1: function(){
    debugManager.dispatcherSend(that.data.data);
  },

  btn2: function(){
    debugManager.connectBLE(that.data.idc,function(state){
      if (debugManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE == state) {
        //显示加载框
        appUtil.showLoading('加载中...');
      } else if (debugManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR == state) {
        //异常取消加载框
        appUtil.hideLoading();
      } else if (debugManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE == state) {
        //蓝牙不可用
        appUtil.showModal('请打开蓝牙', false, function (confirm) { });
      } else if (debugManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND == state) {
        //没有扫描到设备信息
        appUtil.showModal('没有发现设备', false, function (confirm) { });
      } else if (debugManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED == state) {
        //连接失败
        appUtil.showModal('蓝牙连接失败', false, function (confirm) { });
      } else if (debugManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED == state) {
        //不支持ble
        appUtil.showModal('您的手机不支持低功耗蓝牙', false, function (confirm) { });
      } else if (debugManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED == state) {
        //发送失败
        appUtil.showModal('数据发送失败', false, function (confirm) { });
      } else if (debugManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE == state) {
        //无响应
        appUtil.showModal('设备超时无响应', false, function (confirm) { });
      } else if (debugManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_SUCESS == state){
        appUtil.hideLoading();
      }


    },function(data){
      // var height = wx.getSystemInfoSync().windowHeight;
      that.setData({
        msg: that.data.msg + data,
        // scrollTop: height*400
      })
      // console.log(that.data.msg.lastIndexOf('\n'));
      // console.log(that.data.msg.length);
      // if(that.data.msg.lastIndexOf('\n') != that.data.msg.length-1)
      //   that.setData({ msg: that.data.msg + '\n'})
      if(that.data.msg.substring(that.data.msg.length-1)!='\n')
        that.setData({ msg: that.data.msg + '\n'})
      that.setData({
        scrollTo: "hiddenview"
      })
    })
  },

  //实际使用
  sendData: function (sendType) {
    bleManager.sendData(that.data.idc, that.data.pwd, sendType, function (state) {
      if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE == state) {
        //显示加载框
        appUtil.showLoading('油量读取执行中(' + (that.data.currentSetting+1) + '/' + that.data.numofSetting + ')');
      }
      else{
        var errFlag=false;
        var errMsg='';
        if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR == state) {
          //异常取消加载框
          appUtil.hideLoading();
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_DEVICES_DISCOVERY_FAILD == state) {
          //蓝牙不可用
          //appUtil.showModal('蓝牙搜索错误', false, function (confirm) { });
          errMsg='蓝牙搜索错误';
          errFlag=true;          
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE == state) {
          //蓝牙不可用
          //appUtil.showModal('请打开蓝牙', false, function (confirm) { });
          errMsg='请打开蓝牙';
          errFlag=true;
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND == state) {
          //没有扫描到设备信息
          //appUtil.showModal('没有发现设备', false, function (confirm) { });
          errMsg='没有发现设备';
          errFlag=true;
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED == state) {
          //连接失败
          //appUtil.showModal('蓝牙连接失败', false, function (confirm) { });
          if(that.data.currentSetting<that.data.numofSetting){
            errMsg='蓝牙连接异常';
            errFlag=true;
          }
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED == state) {
          //不支持ble
          //appUtil.showModal('您的手机不支持低功耗蓝牙', false, function (confirm) { });
          errMsg='您的手机不支持低功耗蓝牙';
          errFlag=true;
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED == state) {
          //发送失败
          //appUtil.showModal('数据发送失败', false, function (confirm) { });
          errMsg='数据发送失败';
          errFlag=true;
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE == state) {
          //无响应
          //appUtil.showModal('设备超时无响应', false, function (confirm) { });
          errMsg='设备超时无响应';
          errFlag=true;
        }

        if(errFlag==true && bleManager.getBLEConnectionState()==true){
          appUtil.showModal(errMsg+',是否重试?', true, function (confirm) { 
            if (res.confirm) {
              that.setData({needRetry:true});
            }
            else{
              that.setData({
                numofSetting:0,
                currentSetting:0,
              });
              bleManager.releaseBle();
            }
          });
        }
      }

    }, function (data) {
      //隐藏加载框
      appUtil.hideLoading();
      if (data.controlType == 7) {
        //7 debug响应
        if (data.result){
          var recvParse=that.ParseRecv(data.result);
          that.setData({
            msg: that.data.msg +
            "收到数据：\n" + "{" +
            "\n(指令序号)=" + (that.data.currentSetting+1) + '/' + that.data.numofSetting +
            ", \n(指令类型)=" + data.result.DebugType +
            ", \n(指令结果)=" + data.result.DebugRes +
            ", \n(发送配置ID)=" + that.data.currentRun.id +
            ", \n(接收数据长度)=" + data.result.DebugRLen +
            ", \n(接收数据ID)=" + data.result.DebugRID +
            ", \n(指令数据内容)=" + data.result.DebugRData +
            ", \n(指令数据解析)=" + recvParse.msg +
            '\n}'
          });
          console.log(data.result.DebugRIDArray);
          console.log(data.result.DebugRDataArray);
          if(recvParse.code==0){
            wx.showModal({
              title: '获取成功',
              content: recvParse.msg,
              showCancel: false,
              success: function (res) {}
            })
            that.setData({
              numofSetting:0,
              currentSetting:0,
            });
            //获取成功关闭蓝牙
            bleManager.releaseBle();
            //成功一次就可以进行网络通知
            //that.resultNotify(true);
          }
          else{
            that.setData({currentSetting:that.data.currentSetting+1});
            if(that.data.currentSetting<that.data.numofSetting){
              that.setData({needRetry:true});
            }
            else{
              wx.showModal({
                title: '获取失败',
                content: recvParse.msg,
                showCancel: false,
                success: function (res) {}
              })
              that.setData({
                numofSetting:0,
                currentSetting:0,
              });
              //全部失败关闭蓝牙
              bleManager.releaseBle();
              //全部失败进行网络通知
              //that.resultNotify(false);
            }
          }
        }else{
          that.setData({ msg: "数据解析错误" });
        }
      }
    });
  },

  getSettingList: function(){
    var param = {};
    //param['SN'] =that.data.idc.substr(2,9);
    param['carSerialName'] = "";

    var url="https://k3a.wiselink.net.cn/api/getCarSerialList";
    
    var paramTmp="carSerialName="+param.carSerialName;
    console.log(paramTmp);
       
    appUtil.showLoading("获取配置中...");
    appUtil.byPost(url, paramTmp, function(res) {
      appUtil.hideLoading();
      if (res.statusCode == 200 && res.data.code == 1000) {
        console.log(0);
        console.log(res);
        // var tmpSetting=[];
        // tmpSetting=tmpSetting.concat(res.data.content.sendcansettingDefault);
        // console.log(tmpSetting);
        // //{"sType":0,"canSID1":"000007df","canSID2":"000007e0","sLen":8,"sData":"02012F0000000000","canRID":"000007e8","rType":0},
        // var tmpmsg="";
        // for(var i =0;i<res.data.count;i++)
        //   tmpmsg+=JSON.stringify(tmpSetting[i]);
        that.setData({
          index:0,
          array:res.data.content,
        });
        //appUtil.showModal("获取清单成功", false, function (confirm) { });
      }
      else{
        appUtil.showModal("获取清单失败", false, function (confirm) { });
      }
    });
  },

  getSettingTest: function(){
    var param = {};
    //param['SN'] =that.data.idc.substr(2,9);
    param['carSerialName'] = that.data.array[that.data.index];

    var url="https://k3a.wiselink.net.cn/api/getOilCmd";
    
    var paramTmp="carSerialName="+param.carSerialName;
    console.log(paramTmp);
       
    appUtil.showLoading("获取配置中...");
    appUtil.byPost(url, paramTmp, function(res) {
      appUtil.hideLoading();
      if (res.statusCode == 200 && res.data.code == 1000) {
        console.log(0);
        console.log(res);
        var tmpSetting=[];
        tmpSetting=tmpSetting.concat(res.data.content.sendcansetting);
        console.log(tmpSetting);
        //{"sType":0,"canSID1":"000007df","canSID2":"000007e0","sLen":8,"sData":"02012F0000000000","canRID":"000007e8","rType":0},
        var tmpmsg="";
        for(var i =0;i<res.data.count;i++)
          tmpmsg+=JSON.stringify(tmpSetting[i]);
        that.setData({
          msg:"网络配置:\r\n"+tmpmsg,
        });
      }
      else{
        appUtil.showModal("获取配置失败", false, function (confirm) { });
      }
    });
  },

  //实际项目使用
  getSetting: function(result){
    var param = {};
    //param['SN'] =that.data.idc.substr(2,9);
    param['carSerialName'] = that.data.array[that.data.index];

    var url="https://k3a.wiselink.net.cn/api/getOilCmd";
    
    var paramTmp="carSerialName="+param.carSerialName;
    console.log(paramTmp);
       
    appUtil.showLoading("获取配置中...");
    appUtil.byPost(url, paramTmp, function(res) {
      appUtil.hideLoading();
      if (res.statusCode == 200 && res.data.code == 1000) {
        console.log(0);
        console.log(res);
        var tmpSetting=[];
        tmpSetting=tmpSetting.concat(res.data.content.sendcansetting);
        console.log(tmpSetting);
        //{"sType":0,"canSID1":"000007df","canSID2":"000007e0","sLen":8,"sData":"02012F0000000000","canRID":"000007e8","rType":0},
        // var tmpSetting={};
        // tmpSetting.sType=res.data.sType,
        // tmpSetting.canSID1=res.data.canSID1,
        // tmpSetting.canSID2=res.data.canSID2,
        // tmpSetting.sLen=res.data.sLen,
        // tmpSetting.sData=res.data.sData,
        // tmpSetting.canRID=res.data.canRID,
        // tmpSetting.rType=res.data.rType,
        var tmpmsg="";
        for(var i =0;i<res.data.count;i++)
          tmpmsg+=JSON.stringify(tmpSetting[i]);
        that.setData({
          sendcansetting:tmpSetting,
          msg:"网络配置:\r\n"+tmpmsg,
        });
        result(true);
      }
      else{
        appUtil.showModal("获取配置失败", false, function (confirm) { });
        result(false);
      }
    });
  },

  //实际项目使用
  parseParam: function(resultAry){
    try {
      var firstSemiColon=that.data.currentRun.parseInfo.indexOf(";");
      var secondSemiColon=that.data.currentRun.parseInfo.indexOf(";",firstSemiColon+1);
      var parseInfoLen=that.data.currentRun.parseInfo.length;
  
      var computeStr=that.data.currentRun.parseInfo.substr(0,firstSemiColon);
      var computeVar=that.data.currentRun.parseInfo.substr(firstSemiColon+1,secondSemiColon-(firstSemiColon+1));
      var unit=that.data.currentRun.parseInfo.substr(secondSemiColon+1,parseInfoLen-secondSemiColon);     
    } catch (error) {
      return "InitError";
    }


    // console.log(firstSemiColon);
    // console.log(secondSemiColon);
    // console.log(parseInfoLen);
    // console.log(computeStr);
    // console.log(computeVar);
    // console.log(unit);

    //var ary=[0x41,0x2f,0x33];
    
    var computeVarObj=JSON.parse(computeVar);
    Object.keys(computeVarObj).forEach(key => {
      //console.log(key + ": " + computeVarObj[key]);
      if(computeVarObj[key]>resultAry.length-1){
        return "LenError";
      }
      else{
        computeVarObj[key]=resultAry[computeVarObj[key]];
      }
      //console.log(key + ": " + computeVarObj[key]);
    });

    try {
      var resultNum=computeUtil.compute(computeStr,computeVarObj).toFixed(2);
      
      console.log(resultOil); 
      if(resultNum==0){
        return "ZeroError";
      }
      if(resultNum>100){
        return "ResultError";
      }

      var resultOil=resultNum+unit;
      return resultOil;    

    } catch (error) {
      return "ComputeError";
    }
    // var resultOil=computeUtil.compute(computeStr,computeVarObj).toFixed(2)+unit;
    // console.log(resultOil);

    // return resultOil;
  },

  //实际项目使用
  ParseRecv: function(result){
    //var ret={code:1,msg:"未知错误"};

    if(result.DebugRes=="失败"){
      return {code:1,msg:"CAN通信错误,检查是否车辆启动或是否设备连接牢固!"};
    }
    // if(result.DebugSType!=that.data.currentRun.sType){
    //   return {code:1,msg:"发送配置与回复配置不符!"};      
    // }
    if(result.DebugRID!=that.data.currentRun.canRID.toUpperCase()){
      if(that.data.currentRun.canRID.toUpperCase()!="18DAF1FF"
      && that.data.currentRun.canRID.toUpperCase()!="000007FF"){
        return {code:1,msg:"回复ID与期望ID不符!"}; 
      }
    } 

    var oilResult=that.parseParam(result.DebugRDataArray);
    console.log("oilResult="+oilResult);
    if(oilResult.indexOf("InitError")!=-1){
      return {code:1,msg:"计算方法初始化错误,舍弃!"}; 
    }
    else if(oilResult.indexOf("LenError")!=-1){
      return {code:1,msg:"原车数据长度不足,舍弃!"}; 
    }     
    else if(oilResult.indexOf("ComputeError")!=-1){
      return {code:1,msg:"计算过程错误,舍弃!"}; 
    }
    else if(oilResult.indexOf("ZeroError")!=-1){
      return {code:1,msg:"计算结果为0,舍弃!"}; 
    }
    else if(oilResult.indexOf("ResultError")!=-1){
      return {code:1,msg:"计算结果过大,舍弃!"}; 
    }
    else{
      return {code:0,msg:oilResult};
    }    


    //重点关注3个数据 
    //1: result.DebugSType 根据这个去找对应解析方法
    //2: result.DebugRLen 根据这个去使用数据
    //3: result.DebugRData 这个在上位机要将string转成byte之后计算
    // var param = {};
    // param['SN'] =that.data.idc.substr(2,9);
    // param['PlateNum'] = "京A88888";
    // param['SendType'] = result.DebugSType;
    // param['RunNum'] = that.data.currentSetting;
    // param['RecvLen'] = result.DebugRLen;
    // param['RecvData'] = result.DebugRData;

    // var url="https://zxtapi.wiselink.net.cn/GetOilParse.ashx";
    
    // var paramTmp="SN="+param.SN+"&PlateNum="+param.PlateNum+"&SendType="+param.SendType+"&RunNum="+param.RunNum+"&RecvLen="+param.RecvLen+"&RecvData="+param.RecvData;
    // console.log(paramTmp);
       
    // appUtil.showLoading("计算中...");
    // appUtil.byPost(url, paramTmp, function(res) {
    //   appUtil.hideLoading();
    //   if (res.statusCode == 200) {
    //     console.log(0);
    //     console.log(res);
    //     that.setData({
    //       oilData=res.data.oilData,
    //     });
    //   }
    //   else  appUtil.showModal("获取油量失败", false, function (confirm) { })
    // });


    //此处为接口在本地的模拟实现
    // switch(param.SendType){
    //   case 0://默认
    //     switch(param.RunNum){
    //       case 0:
    //         return {code:0,msg:(result.DebugRDataArray[2]*100/255).toFixed(2)+"%"};
    //       case 1:
    //         return {code:0,msg:(result.DebugRDataArray[2]*100/255).toFixed(2)+"%"};
    //     }
    //   case 1://大众
    //     switch(param.RunNum){
    //       case 0:
    //         return {code:0,msg:((result.DebugRDataArray[37]<<8|result.DebugRDataArray[38])*100/1000).toFixed(2)+"L"};
    //       case 1:
    //         return {code:0,msg:(result.DebugRDataArray[2]*100/255).toFixed(2)+"%"};
    //       case 2:
    //         return {code:0,msg:(result.DebugRDataArray[2]*100/255).toFixed(2)+"%"};
    //     }
    //   default:
    //     return {code:1,msg:"未知错误"};
    // }
    // switch(that.data.currentRun.id){
    //   case 6://默认标准帧
    //     return {code:0,msg:(result.DebugRDataArray[2]*100/255).toFixed(2)+"%"};
    //   case 8://默认扩展帧
    //     return {code:0,msg:(result.DebugRDataArray[2]*100/255).toFixed(2)+"%"};
    //   case 16:
    //     return {code:0,msg:((result.DebugRDataArray[37]<<8|result.DebugRDataArray[38])*100/1000).toFixed(2)+"L"};
    //   case 18://默认标准帧
    //     return {code:0,msg:(result.DebugRDataArray[2]*100/255).toFixed(2)+"%"};
    //   case 20://默认扩展帧
    //     return {code:0,msg:(result.DebugRDataArray[2]*100/255).toFixed(2)+"%"};
    //   default:
    //     return {code:1,msg:"未知错误"};
    // }
  },

  //实际项目使用
  NetSettingExec: function(){
    if(that.data.currentSetting==0){
      that.setData({
        numofSetting:that.data.sendcansetting.length,
        msg:"",
      });
      console.log(that.data.numofSetting);
    }

    //每次执行前动作
    if(that.data.currentSetting<that.data.numofSetting){
      that.setData({
        currentRun:that.data.sendcansetting[that.data.currentSetting],
      });
    }
    // else{
    //   that.setData({
    //     numofSetting:0,
    //     currentSetting:0,
    //   });
    //   return;
    // }

    var debugPara;
    //{"sType":0,"canSID1":"000007df","canSID2":"000007e0","sLen":8,"sData":"02012F0000000000","canRID":"000007e8","rType":0},
    //{"sType":0,"canSID1":"18DB33F1","canSID2":"18DAF110","sLen":8,"sData":"02012F0000000000","canRID":"18DAF1FF","rType":0},
    // debugPara=byteutils.shortToBytes(that.data.currentRun.sType,true); 
    // console.log(debugPara);
    debugPara=byteutils.hexStringToArray(that.data.currentRun.canSID1,true); 
    console.log(debugPara);
    debugPara=debugPara.concat(byteutils.hexStringToArray(that.data.currentRun.canSID2,true)); 
    console.log(debugPara);
    debugPara=debugPara.concat(byteutils.shortToSingleBytes(that.data.currentRun.sLen,true)); 
    console.log(debugPara);
    debugPara=debugPara.concat(byteutils.hexStringToArray(that.data.currentRun.sData,true)); 
    console.log(debugPara);
    debugPara=debugPara.concat(byteutils.hexStringToArray(that.data.currentRun.canRID,true)); 
    console.log(debugPara);
    debugPara=debugPara.concat(byteutils.shortToSingleBytes(that.data.currentRun.rType,true)); 
    console.log(debugPara);
    console.log(debugPara.length);
    controlCmds.setDebugType(0xf0);
    controlCmds.setDebugLen(debugPara.length);
    controlCmds.setDebugPara(debugPara);
    that.setData({
      msg:that.data.msg+"\r\n第"+(that.data.currentSetting+1)+"次开始\r\n"
    });
    that.sendData(bleManager.DEFAULT_CMD_TYPE.DEBUG_CMD);
  },

  //实际项目使用
  btnNetSettingExec: function(){
    
    //第一次进来需要初始化
    if(that.data.currentSetting==0){
      //接口获取配置后,储存本地
      that.getSetting(function(res){
        if(res==true){
          that.NetSettingExec();
        }
        else{

        }
      });

      //本地模拟
      // if(that.data.index==0){
      //   that.setData({
      //     sendcansetting:that.data.sendcansettingDefault,
      //   });
      // }
      // else if(that.data.index==1){
      //   that.setData({
      //     sendcansetting:that.data.sendcansettingVW,
      //   });        
      // }
    }
    else{
      that.NetSettingExec();
    }
    // if(that.data.currentSetting==0){
    //   that.setData({
    //     numofSetting:that.data.sendcansetting.length,
    //     msg:"",
    //   });
    //   console.log(that.data.numofSetting);
    // }

    // //每次执行前动作
    // if(that.data.currentSetting<that.data.numofSetting){
    //   that.setData({
    //     currentRun:that.data.sendcansetting[that.data.currentSetting],
    //   });
    // }
    // // else{
    // //   that.setData({
    // //     numofSetting:0,
    // //     currentSetting:0,
    // //   });
    // //   return;
    // // }

    // var debugPara;
    // //{"sType":0,"canSID1":"000007df","canSID2":"000007e0","sLen":8,"sData":"02012F0000000000","canRID":"000007e8","rType":0},
    // //{"sType":0,"canSID1":"18DB33F1","canSID2":"18DAF110","sLen":8,"sData":"02012F0000000000","canRID":"18DAF1FF","rType":0},
    // debugPara=byteutils.shortToBytes(that.data.currentRun.sType,true); 
    // console.log(debugPara);
    // debugPara=debugPara.concat(byteutils.hexStringToArray(that.data.currentRun.canSID1,true)); 
    // console.log(debugPara);
    // debugPara=debugPara.concat(byteutils.hexStringToArray(that.data.currentRun.canSID2,true)); 
    // console.log(debugPara);
    // debugPara=debugPara.concat(byteutils.shortToSingleBytes(that.data.currentRun.sLen,true)); 
    // console.log(debugPara);
    // debugPara=debugPara.concat(byteutils.hexStringToArray(that.data.currentRun.sData,true)); 
    // console.log(debugPara);
    // debugPara=debugPara.concat(byteutils.hexStringToArray(that.data.currentRun.canRID,true)); 
    // console.log(debugPara);
    // debugPara=debugPara.concat(byteutils.shortToSingleBytes(that.data.currentRun.rType,true)); 
    // console.log(debugPara);
    // console.log(debugPara.length);
    // controlCmds.setDebugType(0xf0);
    // controlCmds.setDebugLen(debugPara.length);
    // controlCmds.setDebugPara(debugPara);
    // that.setData({
    //   msg:that.data.msg+"\r\n第"+(that.data.currentSetting+1)+"次开始\r\n"
    // });
    // that.sendData(bleManager.DEFAULT_CMD_TYPE.DEBUG_CMD);
  },

  btnNetSettingInfo:function(){
    appUtil.showModal(
      "<网络配置说明>\r\n"
      +"1.请拔除OBD上其他设备,并将开通头插上原车OBD,启动车辆\r\n\r\n"
      +"2.通用配置会读取标准OBD油量方法\r\n"
      +"2.1.先使用标准ID,再使用扩展ID\r\n\r\n"
      +"3.个性化配置会使用个性化油量方法\r\n"
      +"3.1.先使用个性化,再使用标准OBD(其中先标准ID再扩展ID)\r\n\r\n"
      +"<!!!请在专业指导下操作!!!>\r\n"
     , false, function (confirm) { });
  },

  sendDataLocal: function (sendType) {
    bleManager.sendData(that.data.idc, that.data.pwd, sendType, function (state) {
      if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE == state) {
        //显示加载框
        appUtil.showLoading('加载中...');
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR == state) {
        //异常取消加载框
        appUtil.hideLoading();
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE == state) {
        //蓝牙不可用
        appUtil.showModal('请打开蓝牙', false, function (confirm) { });
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND == state) {
        //没有扫描到设备信息
        appUtil.showModal('没有发现设备', false, function (confirm) { });
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED == state) {
        //连接失败
        appUtil.showModal('蓝牙连接失败', false, function (confirm) { });
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED == state) {
        //不支持ble
        appUtil.showModal('您的手机不支持低功耗蓝牙', false, function (confirm) { });
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED == state) {
        //发送失败
        appUtil.showModal('数据发送失败', false, function (confirm) { });
      } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE == state) {
        //无响应
        appUtil.showModal('设备超时无响应', false, function (confirm) { });
      }
    }, function (data) {
      //隐藏加载框
      appUtil.hideLoading();
      if (data.controlType == 7) {
        //7 debug响应
        if (data.result){
          var recvParse=that.ParseRecvLocal(data.result);
          that.setData({
            msg: that.data.msg +
            "收到数据：\n" + "{" +
            "\n(指令类型)=" + data.result.DebugType +
            ", \n(指令结果)=" + data.result.DebugRes +
            ", \n(发送配置类型)=" + that.data.sType +
            ", \n(接收数据长度)=" + data.result.DebugRLen +
            ", \n(接收数据ID)=" + data.result.DebugRID +
            ", \n(指令数据内容)=" + data.result.DebugRData +
            ", \n(指令数据解析)=" + recvParse.msg +
            '\n}'
          });
          console.log(data.result.DebugRIDArray);
          console.log(data.result.DebugRDataArray);
          if(recvParse.code==0){
            wx.showModal({
              title: '获取成功',
              content: recvParse.msg,
              showCancel: false,
              success: function (res) {}
            })
          }
          else{
            wx.showModal({
              title: '获取失败',
              content: recvParse.msg,
              showCancel: false,
              success: function (res) {}
            })
          }
        }else{
          that.setData({ msg: "数据解析错误" });
        }
      }
    });
  },

  ParseRecvLocal: function(result){
    if(result.DebugRes=="失败"){
      return {code:1,msg:"CAN通信错误,检查是否车辆启动或是否设备连接牢固!"};
    }
    // if(result.DebugSType!=that.data.sType){
    //   return {code:1,msg:"发送配置与回复配置不符!"};      
    // }
    if(result.DebugRID!=that.data.canRID.toUpperCase()){
      if(that.data.canRID.toUpperCase()!="18DAF1FF"
      && that.data.canRID.toUpperCase()!="000007FF"){
        return {code:1,msg:"回复ID与期望ID不符!"}; 
      }
    } 

    //重点关注3个数据 
    //1: result.DebugSType 根据这个去找对应解析方法
    //2: result.DebugRLen 根据这个去使用数据
    //3: result.DebugRData 这个在上位机要将string转成byte之后计算
    var param = {};
    param['SN'] =that.data.idc.substr(2,9);
    param['PlateNum'] = "京A88888";
    param['SendType'] = result.DebugSType;
    param['RunNum'] = that.data.currentSetting;
    param['RecvLen'] = result.DebugRLen;
    param['RecvData'] = result.DebugRData;

    var url="https://zxtapi.wiselink.net.cn/GetOilParse.ashx";
    
    var paramTmp="SN="+param.SN+"&PlateNum="+param.PlateNum+"&SendType="+param.SendType+"&RunNum="+param.RunNum+"&RecvLen="+param.RecvLen+"&RecvData="+param.RecvData;
    console.log(paramTmp);
       
    // appUtil.showLoading("计算中...");
    // appUtil.byPost(url, paramTmp, function(res) {
    //   appUtil.hideLoading();
    //   if (res.statusCode == 200) {
    //     console.log(0);
    //     console.log(res);
    //     that.setData({
    //       oilData=res.data.oilData,
    //     });
    //   }
    //   else  appUtil.showModal("获取油量失败", false, function (confirm) { })
    // });


    //此处为接口在本地的模拟实现
    console.log(that.data.rType);
    if(that.data.rType!=15){
      if(that.data.rType==0){
        return {code:0,msg:"自测(标准OBD自行解析)"};//{code:0,msg:(result.DebugRDataArray[2]*100/255).toFixed(2)+"%"};
      }
      else if(that.data.rType==1){
        return {code:0,msg:"自测(UDS自行解析)"};
      }
    }
    else
      return {code:0,msg:"自测(自定义发送自行解析)"};
    // switch(param.SendType){
    //   case 0://默认
    //     switch(param.RunNum){
    //       case 0:
    //         return {code:0,msg:(result.DebugRDataArray[2]*100/255).toFixed(2)+"%"};
    //       case 1:
    //         return {code:0,msg:(result.DebugRDataArray[2]*100/255).toFixed(2)+"%"};
    //     }
    //   case 65535:
    //     console.log(that.data.rType);
    //     if(that.data.rType!=15){
    //       if(that.data.rType==0){
    //         return {code:0,msg:(result.DebugRDataArray[2]*100/255).toFixed(2)+"%"};
    //       }
    //       else if(that.data.rType==1){
    //         return {code:0,msg:"UDS自行解析"};
    //       }
    //     }
    //     else
    //       return {code:0,msg:"自定义发送自行解析"};
    //   default:
    //     return {code:1,msg:"未知错误"};
    // }
  },

  btnLocalSettingExec: function(){
    that.setData({
      msg:"",
    });
    var debugPara;
    //{"sType":0,"canSID1":"000007df","canSID2":"000007e0","sLen":8,"sData":"02012F0000000000","canRID":"000007e8","rType":0},
    // debugPara=byteutils.shortToBytes(that.data.sType,true); 
    // console.log(debugPara);
    debugPara=byteutils.hexStringToArray(that.data.canSID1,true); 
    console.log(debugPara);
    debugPara=debugPara.concat(byteutils.hexStringToArray(that.data.canSID2,true)); 
    console.log(debugPara);
    debugPara=debugPara.concat(byteutils.shortToSingleBytes(that.data.sLen,true)); 
    console.log(debugPara);
    debugPara=debugPara.concat(byteutils.hexStringToArray(that.data.sData,true)); 
    console.log(debugPara);
    debugPara=debugPara.concat(byteutils.hexStringToArray(that.data.canRID,true)); 
    console.log(debugPara);
    debugPara=debugPara.concat(byteutils.shortToSingleBytes(that.data.rType,true)); 
    console.log(debugPara);
    console.log(debugPara.length);
    controlCmds.setDebugType(0xf0);
    controlCmds.setDebugLen(debugPara.length);
    controlCmds.setDebugPara(debugPara);
    that.sendDataLocal(bleManager.DEFAULT_CMD_TYPE.DEBUG_CMD);
  },

  btnLocalSettingInfo:function(){
    appUtil.showModal(
      "<本地配置说明>\r\n"
      +"1.请拔除OBD上其他设备,并将开通头插上原车OBD,启动车辆\r\n\r\n"
      +"2.配置方法\r\n"
      +"2.1.发送ID1:8位CANID\r\n"
      +"2.2.发送ID2:8位CANID(当多帧回复0x30时使用)\r\n"
      +"2.3.发送长度:数据长度\r\n"
      +"2.4.发送数据:实际数据\r\n"
      +"2.5.接收ID:8位CANID(需要滤波并接收的ID)\r\n"
      +"2.5.1.说明:设置7FF为对应范围内(700-7FF)全部接收\r\n"
      +"2.5.2.说明:设置18DAF1FF为对应范围内(18DAF100-18DAF1FF)全部接收\r\n"
      +"2.5.3.说明:设置其他ID则只接收该ID\r\n"
      +"2.6.接收方法:针对原车返回的格式判断0/1/15\r\n"
      +"2.6.1.说明:0-标准OBD格式/1-UDS格式/15-不判断返回格式\r\n\r\n"
      +"<!!!请在专业指导下操作!!!>\r\n"
     , false, function (confirm) { });
  },

  parseParamTest: function(){

    that.getSetting(function(res){
      if(res==true){
        that.data.currentRun=that.data.sendcansetting[0];
        try {
          var firstSemiColon=that.data.currentRun.parseInfo.indexOf(";");
          var secondSemiColon=that.data.currentRun.parseInfo.indexOf(";",firstSemiColon+1);
          var parseInfoLen=that.data.currentRun.parseInfo.length;
      
          var computeStr=that.data.currentRun.parseInfo.substr(0,firstSemiColon);
          var computeVar=that.data.currentRun.parseInfo.substr(firstSemiColon+1,secondSemiColon-(firstSemiColon+1));
          var unit=that.data.currentRun.parseInfo.substr(secondSemiColon+1,parseInfoLen-secondSemiColon);          
        } catch (error) {
          console.log("InitError");
        }

    
        console.log(firstSemiColon);
        console.log(secondSemiColon);
        console.log(parseInfoLen);
        console.log(computeStr);
        console.log(computeVar);
        console.log(unit);

        var ary=[0x41,0x2f,0x33];
        var computeVarObj=JSON.parse(computeVar);
        Object.keys(computeVarObj).forEach(key => {
          console.log(key + ": " + computeVarObj[key]);
          if(computeVarObj[key]>ary.length-1){
            console.log("LenError");
          }
          else{
            computeVarObj[key]=ary[computeVarObj[key]];
          }
          console.log(key + ": " + computeVarObj[key]);
        });
        //console.log(computeUtil.compute(computeStr,computeVarObj).toFixed(2)+unit);

        computeStr="{a}";
        try {
          var resultOil=computeUtil.compute(computeStr,computeVarObj).toFixed(2)+unit;
          console.log(resultOil); 
          return resultOil;     
        } catch (error) {
          console.log("ComputeError");
        }
      }
    });



  },

  btnTest: function(){
    that.parseParamTest();
    // var tmp=[0,0,7,232];

    // console.log(tmp);
    // var ID=byteutils.buf2hex(tmp);
    // console.log(ID);
    // var computeStr="{a}*256*100/1000+{b}*100/1000";
    // var computeVar='{"a":37,"b":38}';
    // console.log(JSON.parse(computeVar));
    // var obj=JSON.parse(computeVar);
    // Object.keys(obj).forEach(key => {
    //   console.log(key + ": " + obj[key]);
    // });
    // console.log(JSON.parse(computeVar).a);
    // var str2="{a}*100/255";//几个变量?,变量是哪一位?,单位?
    // var unit="L";
    // result.DebugRDataArray[computeVar[i]];
    // console.log(computeUtil.compute(str1,{a:0x02,b:0x3a}).toFixed(2)+unit);
    //console.log(eval("10+{tmp[3]}"));
  },

  btn5: function(){
    debugManager.releaseBle();
  },

  /**
   * 清空IDC
   */
  btn25: function () {
    that.setData({
      idc: "",
    });
  },  

    /**
   * 清空发送
   */
  btn26: function () {
    that.setData({
      data: "",
    });
  },  

    /**
   * 清空接收
   */
  btn27: function () {
    that.setData({
      msg: "",
    });
  },  


  canSID1Input: function (e) {
    var canSID1 = e.detail.value;
    that.setData({ canSID1: canSID1 });
  },
  btnClearcansID1: function () {
    that.setData({
      canSID1: "",
    });
  },  

  canSID2Input: function (e) {
    var canSID2 = e.detail.value;
    that.setData({ canSID2: canSID2 });
  },
  btnClearcanSID2: function () {
    that.setData({
      canSID2: "",
    });
  },  

  sLenInput: function (e) {
    var sLen = e.detail.value;
    that.setData({ sLen: sLen });
  },
  btnClearsLen: function () {
    that.setData({
      sLen: 0,
    });
  },  

  sDataInput: function (e) {
    var sData = e.detail.value;
    that.setData({ sData: sData });
  },
  btnClearsData: function () {
    that.setData({
      sData: "",
    });
  },  

  canRIDInput: function (e) {
    var canRID = e.detail.value;
    that.setData({ canRID: canRID });
  },
  btnClearcanRID: function () {
    that.setData({
      canRID: "",
    });
  },  

  rTypeInput: function (e) {
    var rType = e.detail.value;
    that.setData({ rType: rType });
  },
  btnClearrType: function () {
    that.setData({
      rType: 0,
    });
  },  


  //以下是透传功能
  transmitIDInput: function (e) {
    var transmitID = e.detail.value;
    that.setData({ transmitID: transmitID });
  },
  btnCleartransmitID: function () {
    that.setData({
      transmitID: '',
    });
  },  

  btnStartTransmit: function(){
    var tmpIDArray=byteutils.hexStringToArray(that.data.transmitID,true);
    var tmpID=byteutils.bytesToInt(tmpIDArray[0],tmpIDArray[1],tmpIDArray[2],tmpIDArray[3]);
    var tmpIDString=byteutils.buf2hex(byteutils.hexStringToArray(that.data.transmitID,true));
    var tmpResult=0;
    console.log(tmpID);
    console.log(tmpIDString);
    if(tmpID>0x7ff && tmpID!=0xfff){
      console.log("ExtID");
      tmpResult=that.NetControl("7"+tmpIDString.substr(0,4),function(res){
        if(res==1){
          tmpResult=that.NetControl("9"+tmpIDString.substr(4,4),function(res2){
            if(res2==1){
              appUtil.showModal("控制成功", false, function (confirm) { });
            }
            else{
              appUtil.showModal("控制失败", false, function (confirm) { });
            }
          });
        }
        else{
          appUtil.showModal("控制失败", false, function (confirm) { });
        }
      });
    }
    else{
      console.log("StdID");
      tmpResult=that.NetControl("6"+tmpIDString.substr(4,4),function(res){
        if(res==1){
          appUtil.showModal("控制成功", false, function (confirm) { });
        }
        else{
          appUtil.showModal("控制失败", false, function (confirm) { });
        }
      });
      // if(tmpResult==1){
      //   appUtil.showModal("控制成功", false, function (confirm) { });
      // }
      // else{
      //   appUtil.showModal("控制失败", false, function (confirm) { });
      // }
    }
  },

  btnStopTransmit: function(){
    var tmpResult=that.NetControl("60000",function(res){
      if(res==1){
        appUtil.showModal("控制成功", false, function (confirm) { });
      }
      else{
        appUtil.showModal("控制失败", false, function (confirm) { });
      }
    });
  },

  NetControl: function(NetcontrolType,resultHandler){

      if(that.data.idc.length!=11) {
        appUtil.showModal("IDC输入错误", false, function (confirm) { });
        return;
      }
      var param = {};
      param['SN'] =that.data.idc.substr(2,9);
      param['Code'] = "123456";
      param['Value'] = NetcontrolType;
      param['TimeStamp'] = Date.parse(new Date());
      param['CustomerFlag'] = "1800";
      
      if(that.data.isZXTNet=="r1")
        var url="https://zxtapi.wiselink.net.cn/RemoteControlCarsNew.ashx";
      else
        var url="https://jsapi.wiselink.net.cn/RemoteControlCarsNew.ashx";

      var paramTmp="SN="+param.SN+"&Code="+param.Code+"&Value="+param.Value+"&TimeStamp="+param.TimeStamp+"&CustomerFlag="+param.CustomerFlag;
      var md5Tmp=md5Util.hex_md5(paramTmp+"1170tsywzc");
      paramTmp=paramTmp+"&CheckInfo="+md5Tmp;
      
      appUtil.showLoading("加载中...")
      appUtil.byPost(url, paramTmp, function(res) {
        appUtil.hideLoading();
        if (res.statusCode == 200) {
          console.log("control");
          console.log(res);
          var result = res.data.result;
          if(result!=1) {
            //appUtil.showModal("控制失败,错误代码:"+result, false, function (confirm) { });
            resultHandler(0xff);
          }
          else {
            //appUtil.showModal("控制成功", false, function (confirm) { });
            resultHandler(1);
          }
            
        }
      });

  },

  btnTransmitInfo:function(){
    appUtil.showModal(
      "<透传配置说明>\r\n"
      +"1.请拔除OBD上其他设备,并将开通头插上原车OBD,启动车辆\r\n\r\n"
      +"2.配置方法\r\n"
      +"2.1.透传ID1:8位CANID(必须补足)\r\n"
      +"2.1.1.说明:设置7FF为对应范围内(700-7FF)全部接收\r\n"
      +"2.1.2.说明:设置18DAF1FF为对应范围内(18DAF100-18DAF1FF)全部接收\r\n"
      +"2.1.3.说明:设置FFF为标准帧全部接收\r\n"
      +"2.1.4.说明:设置1FFFFFFF为扩展帧全部接收\r\n"
      +"2.1.5.说明:设置其他ID则只接收该ID\r\n\r\n"
      +"<!!!请在专业指导下操作!!!>\r\n"
     , false, function (confirm) { });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("debug page load")
    that = this;
    that.data.needRetry=false;
    that.data.msg='';
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.getStorage({
      key: 'idcble',
      success: function (res) {
        console.log("---------本地取出idc:" + res.data);
        that.setData({ idc: res.data });
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
    that.getSettingList();
    if(that.data.intervalCount==0){
      that.data.pageInterval=setInterval(() => {
        var connectstate=bleManager.getBLEConnectionState()==true?"已连接":"未连接";
        that.setData({intervalCount:1,msg2:connectstate+",定时器开,个数"+that.data.intervalCount});
        if(
          //bleManager.getBLEConnectionState()==false && 
          that.data.needRetry==true){
          that.setData({needRetry:false});
          that.btnNetSettingExec();
        }
        else{

        }
      }, 200);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("debug page hide")
    // if(that.data.connectionState=="已连接"){
    //   that.btn4();
    //   setTimeout(function (){
    //     debugManager.releaseBle();
    //   },1500)
    // }
    clearInterval(that.data.pageInterval);
    that.setData({intervalCount:0,msg2:"定时器关--------------------"});
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("debug page unload")
    // if(that.data.connectionState=="已连接"){
    //   that.btn4();
    //   setTimeout(function (){
    //     debugManager.releaseBle();
    //   },1500)
    // }
    clearInterval(that.data.pageInterval);
    that.setData({intervalCount:0,msg2:"定时器关--------------------"});
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