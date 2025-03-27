// pages/oilList/rent/rentCom.js
const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
const byteutils = require("../../../utils/byte-util.js");
const controlCmds = require('../../../utils/device-control-cmds.js');
const bleManager = require('../../../utils/oiltestutil.js');
const computeUtil = require('../../../utils/compute.js')
var that;
var app = getApp();
Component({
  options: {
    addGlobalClass: true
  },
    /**
     * 组件的属性列表
     */
    properties: {

    },

    lifetimes: {
        attached: function() {
          that = this;

          if(that.data.intervalCount==0){
            that.data.pageInterval=setInterval(() => {
              var connectstate=bleManager.getBLEConnectionState()==true?"已连接":"未连接";
              that.setData({intervalCount:1,msg2:connectstate+",定时器开,个数"+that.data.intervalCount});
              if(
                //bleManager.getBLEConnectionState()==false && 
                that.data.needRetry==true){
                that.setData({needRetry:false});
                that.NetSettingExec();
              }
              else{
      
              }
            }, 200);
          }
        },
        detached: function() {

          clearInterval(that.data.pageInterval);
          that.setData({intervalCount:0,msg2:"定时器关--------------------"});
          // 在组件实例被从页面节点树移除时执行
        },
      },

    /**
     * 组件的初始数据
     */
    data: {
        
        items: [], // 数据列表
        showModal:false,
        page:1,
        triggered:false,
        isErcodeOpen:false,
        oilItems : [],
        isShowOilSheet:true,
        selectedCellIndex:'',
        realCost:'',

        selectedCarIndex:'',
        oilShowModal:false,
        snitems:[],
        selectedSn:'',

        sendcansetting:[],
        numofSetting:0,
        currentRun:{},
        currentSetting:0,
        needRetry:false,
        intervalCount:0,
        pageInterval:0,
        msg2:'',

        selectedOilPrice:'',

    },

    /**
     * 组件的方法列表
     */
    methods: {

      lower(e) {
        // console.log(e);
        that.setData({
          page:that.data.page + 1

        });
        that.getRentingAndHistory(that.data.searchText);
      },

      refresh(e) {
        that.clearItems();
        that.getRentingAndHistory(that.data.searchText);
      },
      clearItems:function()
      {
        that.setData({
          triggered:false,
          items:[]
        })
        that.setData({
          page:1
        });
      },

      radioChange(e) {
        console.log('radio发生change事件，携带value值为：', e.detail.value)
        that.setData({
          selectedSn:e.detail.value
        })
      },
      getRentingAndHistory: function(searchText) {
        var param = {};
        param[urlUtil.getRentingAndHistory.companyId] = app.data.userInfo.fin3CompanyId;
        param[urlUtil.getRentingAndHistory.status] = 0;//在租
        if(!appUtil.isEmpty(searchText))
        {
          param[urlUtil.getRentingAndHistory.comParam] = searchText;
          that.setData({
            searchText:searchText
          })
        }
        else
        {
          that.setData({
            searchText:''
          })
        }
        param[urlUtil.getRentingAndHistory.page] = that.data.page;
        appUtil.showLoading("加载中...")
        appUtil.byPost(getApp().data.k1swUrl + urlUtil.getRentingAndHistory.URL, param, function(res) {
          appUtil.hideLoading();
          if (res) {
            var data = res.data;
            if (data.code == 1000) {
              data.content.forEach((r)=>{
                r.tui = null,
                r.cost = null
              })
              if(that.data.page > 1 &&  data.content.length == 0)
              {
                appUtil.showToast("已加载全部数据")
              }
              that.setData({
                items:that.data.items.concat(data.content)
              })
            }
            else
            {
              appUtil.showModal(data.msg, false, function() {});
            }
          }
          else
          {
            appUtil.showModal("请求发生错误，请检查网络！", false, function() {});
          }
    
        });
        },
          endRentButtonTap: function(e) {
            var id = e.currentTarget.id;
            var item = that.data.items[id];
            that.triggerEvent('endRent',item)
          },
          photo: function(e) {
            var cellIndex = e.currentTarget.id;
            wx.navigateTo({
              url: '../camera-paper/camera?view=2&cellIndex='+cellIndex,
            })
          }, 
          updateCellEndPhoto: function(cellIndex,endPhotoPath) {
          //  var photoStatus = "items["+cellIndex+"].photoStatus";
            var endPhoto = "items["+cellIndex+"].panelendimg";
           that.setData({
           // [photoStatus]: '已拍照',
            [endPhoto]:endPhotoPath,
           })
          },

        
          getOilButtonTap: function(e) {
           
            appUtil.showModal("检测步骤：\r\n 1.插入设备,等待设备滴声响起\r\n2.将车辆启动\r\n3.读取油量,此油量仅供参考", true, function(res) {
               if(res)
               {
                that.setData({
                  selectedCellIndex : e.currentTarget.id
                })
               that.getOilPriceList();
               
                var cellIndex = e.currentTarget.id;
                var item = that.data.items[cellIndex];
                that.getSetting(item.vehicleSerialName)
              }
            });
            
           // that.getOilAddress(cellIndex,item.sn)
          },
          getOilAddress: function(cellIndex,item,oilPrice) {
            var param = {};
            param[urlUtil.getEndOilAddress.id] = item.id;
            param[urlUtil.getEndOilAddress.sn] = item.sn;
            param[urlUtil.getEndOilAddress.oilPrice] = oilPrice;
            appUtil.showLoading("加载中...")
            appUtil.byPost(getApp().data.k1swUrl + urlUtil.getEndOilAddress.URL, param, function(res) {
              appUtil.hideLoading();
              if (res) {
                var data = res.data;
                if (data.code == 1000) {
                  var content = data.content;
                  console.log(content.oil)
                  that.updateCellOilAddress(cellIndex,content.oil,content.address,content.tui,content.bu,oilPrice);
                }
                else
                {
                  appUtil.showModal(data.msg, false, function() {});
                }
              }
              else
              {
                appUtil.showModal("请求发生错误，请检查网络！", false, function() {});
              }
        
            });
      },
      updateCellOilAddress: function(cellIndex,oil,address,tui,cost,oilPrice) {
        var oilKey = "items["+cellIndex+"].endoil";
        var addressKey = "items["+cellIndex+"].endposition";
        var tuiKey = "items["+cellIndex+"].tui";
        var buKey = "items["+cellIndex+"].cost";
        var oilPriceKey = "items["+cellIndex+"].oilPrice";
       that.setData({
        [oilKey]: oil,
        [addressKey]:address,
        [tuiKey]:tui+"元",
        [buKey]:cost+"元",
        [oilPriceKey]:oilPrice,
        isShowOilSheet:true
       })

      },
      actionSheetChange:function()
      {
        that.setData({
          isShowOilSheet:true
        })
      },
      getOilPriceList:function(){
        var param = {};
            param[urlUtil.getOilPriceList.companyId] = app.data.userInfo.fin3CompanyId;;
            appUtil.showLoading("加载中...")
            appUtil.byPost(getApp().data.k1swUrl + urlUtil.getOilPriceList.URL, param, function(res) {
              appUtil.hideLoading();
              if (res) {
                var data = res.data;
                if (data.code == 1000) {
                  var content = data.content;
                  that.setData({
                    oilItems:content,
                    isShowOilSheet:false
                  })
                }
                else
                {
                  appUtil.showModal(data.msg, false, function() {});
                }
              }
              else
              {
                appUtil.showModal("请求发生错误，请检查网络！", false, function() {});
              }
        
            });
      },

      sheetTap:function(e)
      {
        console.log(e.currentTarget.id)
        var oilPrice = e.currentTarget.id;
        var cellIndex = that.data.selectedCellIndex;
        var item = that.data.items[cellIndex];

        that.setData({
          selectedOilPrice:oilPrice
        })

        if(appUtil.isEmpty(item.sn))
        {
              that.getOilDeviceList();
              that.setData({
                oilShowModal:true,
                selectedCarIndex:cellIndex
              });
        }
        else
        {
          that.getOilAddress(cellIndex,item,oilPrice)
        }
        
      },

      getOilDeviceList: function() {
        var param = {};
        param[urlUtil.getOilDeviceList.companyId] = app.data.userInfo.fin3CompanyId;
        appUtil.showLoading("加载中...")
        appUtil.byPost(getApp().data.k1swUrl + urlUtil.getOilDeviceList.URL, param, function(res) {
          appUtil.hideLoading();
          if (res) {
            var data = res.data;
            if (data.code == 1000) {
              that.setData({
                snitems:data.content
              })
            }
            else
            {
              appUtil.showModal(data.msg, false, function() {});
            }
          }
          else
          {
            appUtil.showModal("请求发生错误，请检查网络！", false, function() {});
          }
    
        });
  },

      realCostTap:function(e)
      {
        that.setData({
          showModal:true,
          selectedCellIndex : e.currentTarget.id
        })

      },
      oilCancelButttonTap:function()
      {
        that.setData({
          oilShowModal:false
        })

      },
      oilSureButtonTap:function()
      {
        if(appUtil.isEmpty(that.data.selectedSn))
        {
          appUtil.showToast("请选择设备")
        }
        else
        {
        //  that.NetSettingExec();
        that.hasShowOil(that.data.selectedSn);
        }
      },
      cancelButttonTap:function()
      {
        that.setData({
          showModal:false
        })

      },
      sureButtonTap:function()
      {

        var realCostKey = "items["+that.data.selectedCellIndex+"].realcost";
        that.setData({
          showModal:false,
          [realCostKey]:that.data.realCost
        })
      },
      realCostInput: function (e) {
        that.setData({
          realCost: e.detail.value
        })
      },
      detailTap:function(e)
      {
            var id = e.currentTarget.id;
            var item = that.data.items[id];
            that.triggerEvent('rentingDetail',item)
      },
      hasShowOil: function(sn) {
        var param = {};
        param[urlUtil.hasShowOil.sn] = sn;
        param[urlUtil.hasShowOil.companyId] = app.data.userInfo.fin3CompanyId;;
        appUtil.showLoading("加载中...")
        appUtil.byPost(getApp().data.k1swUrl + urlUtil.hasShowOil.URL, param, function(res) {
          appUtil.hideLoading();
          if (res) {
            var data = res.data;
            if (data.code == 1000) {
              // var oil = "50%";
              // var item = that.data.items[that.data.selectedCarIndex];
              // that.getBlueEndOil(item.id,that.data.selectedSn,oil,that.data.selectedOilPrice);
             that.NetSettingExec();
            }
            else
            {
              appUtil.showModal(data.msg, false, function() {});
            }
          }
          else
          {
            appUtil.showModal("请求发生错误，请检查网络！", false, function() {});
          }
    
        });
      },
      NetSettingExec: function(){
        if(that.data.currentSetting==0){
          that.setData({
            numofSetting:that.data.sendcansetting.length,
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
        console.log(that.data.msg+"\r\n第"+(that.data.currentSetting+1)+"次开始\r\n");
      
        that.sendData(bleManager.DEFAULT_CMD_TYPE.DEBUG_CMD);
      },
  
      sendData: function (sendType) {
        bleManager.sendData(that.data.selectedSn, '', sendType, function (state) {
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
            else if(errFlag==true){appUtil.showModal(errMsg,false, function (confirm){ });bleManager.releaseBle();
            }
          }
    
        }, function (data) {
          //隐藏加载框
          console.log("777777777777777777")
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
                // wx.showModal({
                //   title: '获取成功',
                //   content: recvParse.msg,
                //   showCancel: false,
                //   success: function (res) {}
                // })
                that.setData({
                  numofSetting:0,
                  currentSetting:0, 
                });
                //获取成功关闭蓝牙
                bleManager.releaseBle();
                //成功一次就可以进行网络通知
                //that.resultNotify(true);
  
                var oil = recvParse.msg;
                var item = that.data.items[that.data.selectedCarIndex];
                that.getBlueEndOil(item.id,that.data.selectedSn,oil,that.data.selectedOilPrice);
              }
              else{
                console.log("currentSetting + 1")
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
      console.log("oilResult="+oilResult)
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

    getBlueEndOil: function(id,oilDeviceIdc,oil,oilPrice) {
      var param = {};
      param[urlUtil.getBlueEndOil.oilDeviceIdc] = oilDeviceIdc;
      param[urlUtil.getBlueEndOil.id] = id;
      param[urlUtil.getBlueEndOil.oil] = oil;
      param[urlUtil.getBlueEndOil.oilPrice] = oilPrice;
      appUtil.showLoading("加载中...")
      appUtil.byPost(getApp().data.k1swUrl + urlUtil.getBlueEndOil.URL, param, function(res) {
        appUtil.hideLoading();
        if (res) {
          var data = res.data;
          if (data.code == 1000) {
            appUtil.showModal(data.msg, false, function() {

              var content = data.content;
              that.updateCellOilAddress(that.data.selectedCarIndex,content.oil,'',content.tui,content.bu,oilPrice);
              that.setData({
                oilShowModal: false,
              })

              
            });
            
          }
          else
          {
            appUtil.showModal(data.msg, false, function() {});
          }
        }
        else
        {
          appUtil.showModal("请求发生错误，请检查网络！", false, function() {});
        }
  
      });
    },

    getSetting: function(carSerialName){
      console.log(carSerialName)
      var param = {};
      param['carSerialName'] = carSerialName
      var url="https://k3a.wiselink.net.cn/api/getOilCmd";
      var paramTmp="carSerialName="+param.carSerialName;
      console.log(paramTmp);
      appUtil.showLoading("获取配置中...");
      appUtil.byPost(url, paramTmp, function(res) {
        appUtil.hideLoading();
        if (res.statusCode == 200 && res.data.code == 1000) {
        
          var tmpSetting=[];
          tmpSetting=tmpSetting.concat(res.data.content.sendcansetting);      
          console.log("tmpSetting:"+tmpSetting.length)       
          that.setData({
            sendcansetting:tmpSetting,
          });
        }
        else{
          appUtil.showModal("获取配置失败", false, function (confirm) { });
          
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


    console.log("firstSemiColon="+firstSemiColon);
    console.log("secondSemiColon="+secondSemiColon);
    console.log("parseInfoLen="+parseInfoLen);
    console.log("computeStr="+computeStr);
    console.log("computeVar="+computeVar);
    console.log(unit);

    //var ary=[0x41,0x2f,0x33];
    
    var computeVarObj=JSON.parse(computeVar);
    Object.keys(computeVarObj).forEach(key => {
      console.log(key + ": " + computeVarObj[key]);
      if(computeVarObj[key]>resultAry.length-1){
        return "LenError";
      }
      else{
        computeVarObj[key]=resultAry[computeVarObj[key]];
      }
      console.log(key + ": " + computeVarObj[key]);
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

    }
    
})
