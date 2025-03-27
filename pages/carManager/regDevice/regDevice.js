const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
const md5 = require('../../../utils/md5.js');
var that;
var currentTime = 60;
var interval;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:"",
    sn: "",
    code: "",
    getverbtnstatus: false,
    getverbtntitle: "获取验证码",
    clickClose: false,
    openId:'',
    serialIndex:0,
    modelIndex:0,
    carSerialArray: [],
    carModelArray: [],
    sncodeDisabled:false,

    productNo:'',
    vehicleSerialName:'',
    vehicleSerialCode:'',//车系编码
    vehicleModeName:'',
    vehicleModeCode:'',//车型编码
    faultType:'',//车系代码
    carModelCode:'',//车型代码
    platenumber:'',
    vin:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    that.setData({
      id:options.id,
      sn:options.sn,
      code:options.code,
      vehicleSerialCode:options.vehicleSerialCode,
      faultType:options.faultType,
      vehicleModeCode:options.vehicleModeCode,
      carModelCode:options.carModelCode,
      platenumber:options.platenumber,
      vin:options.vin
    });
    if(!appUtil.isEmpty(that.data.sn) && !appUtil.isEmpty(that.data.code))
    {
        wx.setNavigationBarTitle({
            title: "编辑车辆"
        })
        that.setData({
            sncodeDisabled:true
        })
        that.getProductNo();
    }
    else
    {
        wx.setNavigationBarTitle({
            title: "注册车辆"
        })
    }
    console.log("sn="+that.data.sn)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },

  
  snInput: function(e) {
    that.setData({
      sn: e.detail.value
    })
  },


  codeInput: function(e) {
    that.setData({
      code: e.detail.value
    })
  },
  vinInput: function(e) {
    that.setData({
        vin: e.detail.value
    })
  },
  platenumberInput: function(e) {
    that.setData({
        platenumber: e.detail.value
    })
  },
  

  codeInputBlur:function(e) {
      console.log(e.detail.value);
      if(e.detail.value !='')
      {
        that.getProductNo();
      }
      
  },

 

  getProductNo: function() {
    var param = {};
    param[urlUtil.getProductNo.SN] = that.data.sn;
    param[urlUtil.getProductNo.CODE] = that.data.code;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.getProductNo.URL, param, function(res) {

        if(res.data.code == '100000')
        {
            var productNo = res.data.data.haredWare_Number;
            console.log(res.data.data.haredWare_Number)
            that.setData({
                productNo:productNo
            })
            that.getCarSerial(productNo)
        }
        else
        {
            console.log(res.data.message)
            appUtil.showModal(res.data.message, false, function() {  });
        }
      
    });
  },
  getCarSerial: function(productNo) {
    var param = {};
    param[urlUtil.getCarSerial.PRODUCTNO] =productNo;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.getCarSerial.URL, param, function(res) {
        var s = res.data;
         s.unshift({id:'-1',carTypeName:'请选择车系',carType:'1',carTypeCode:'4f'})
        that.setData({
            carSerialArray:s
         })

         //编辑时回显
         if(!appUtil.isEmpty(that.data.vehicleSerialCode) && !appUtil.isEmpty(that.data.faultType))
            {
                for(var i=0;i<that.data.carSerialArray.length;i++)
                {
                    var carSerial = that.data.carSerialArray[i];
                    var temId = that.data.vehicleSerialCode+","+that.data.faultType;
                    if(carSerial.id == temId)
                    {
                        that.setData({
                            serialIndex:i,
                            vehicleSerialName:that.data.carSerialArray[i].carTypeName,
                        })
                        that.getCarModel(carSerial.id);
                        break;
                    }
                }
            }
    });
  },

  getCarModel: function(vehicleSerialId) {
    var param = {};
    param[urlUtil.getVehicleModelsBySerialId.productNo] = that.data.productNo;
    param[urlUtil.getVehicleModelsBySerialId.vehicleSerialId] =   vehicleSerialId;
    appUtil.byPost(getApp().data.k1swUrl + urlUtil.getVehicleModelsBySerialId.URL, param, function(res) {
        var s = res.data;
        s.unshift({id:'-1',carModelName:'请选择车型',comboFields:'-1'})
        that.setData({
            carModelArray:s
        })

        //编辑时回显
        if(!appUtil.isEmpty(that.data.vehicleModeCode) && !appUtil.isEmpty(that.data.carModelCode))
        {
            for(var i=0;i<that.data.carModelArray.length;i++)
            {
                var carModel = that.data.carModelArray[i];
                var temId = that.data.vehicleModeCode+"|"+that.data.carModelCode;
                if(carModel.comboFields == temId)
                {
                    that.setData({
                        modelIndex:i,
                        vehicleModeName:that.data.carModelArray[i].carModelName,
                    })
                    break;
                }
            }
        }
    });
  },


  regBtnTap: function() {

    if (appUtil.isEmpty(that.data.sn)) {
      appUtil.showToast('请输入SN');
      return;
    }
    if (appUtil.isEmpty(that.data.code)) {
        appUtil.showToast('请输入CODE');
        return;
    }
    if (appUtil.isEmpty(that.data.vehicleSerialCode)) {
        appUtil.showToast('请选择车系');
        return;
    }
    if (appUtil.isEmpty(that.data.vehicleModeCode)) {
        appUtil.showToast('请选择车型');
        return;
    }
    if (appUtil.isEmpty(that.data.platenumber)) {
        appUtil.showToast('请输入车牌号');
        return;
    }
    var param = {};
    var url = urlUtil.regOrUpdateDevice.URL;
    if(appUtil.isEmpty(that.data.id))
    {
        url += "addVehicle";
    } 
    else
    {
        param[urlUtil.regOrUpdateDevice.id] =that.data.id;
        url += "editVehicle";
    }
    param[urlUtil.regOrUpdateDevice.sn] =that.data.sn;
    param[urlUtil.regOrUpdateDevice.code] =that.data.code;
    param[urlUtil.regOrUpdateDevice.vehicleSerialCode] =that.data.vehicleSerialCode;
    param[urlUtil.regOrUpdateDevice.vehicleModeCode] =that.data.vehicleModeCode;
    param[urlUtil.regOrUpdateDevice.faultType] =that.data.faultType;
    param[urlUtil.regOrUpdateDevice.carModelCode] =that.data.carModelCode;
    param[urlUtil.regOrUpdateDevice.platenumber] =that.data.platenumber;
    param[urlUtil.regOrUpdateDevice.vin] =that.data.vin;
    param[urlUtil.regOrUpdateDevice.vehicleModeName] =that.data.vehicleModeName;
    param[urlUtil.regOrUpdateDevice.vehicleSerialName] =that.data.vehicleSerialName;
    param[urlUtil.regOrUpdateDevice.isAppReg] = 1;
    param[urlUtil.regOrUpdateDevice.companyid] = getApp().data.userInfo.fin3CompanyId;
    appUtil.showLoading("处理中...")
    appUtil.byPost(url, param, function(res) {
        appUtil.hideLoading();
        var result = res.data;
        if (result == 0) {
            appUtil.showModal('操作失败!', false, function(res) {});
        }  else if (result == 4) {
            appUtil.showModal('车牌号已存在!', false, function(res) {});
        } else if (result == 5) {
            appUtil.showModal('SN已被注册!', false, function(res) {});
        } else if (result == 1) {
            appUtil.showModal('操作成功!', false, function(res) {
                console.log("res="+res);
                if(res)
                {
                  let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
                  let prevPage = pages[pages.length - 2];
                  prevPage.restResult();
                  prevPage.getCarList();

                  wx.navigateBack({
                            delta: 1
                        })
                   
                }
            });
            
        }
         console.log(result);
    });

   
  },








  carSerialPickerChange: function(e) {
    var serialId = that.data.carSerialArray[e.detail.value].id;
    if(serialId != '-1')
    {
        that.setData({
            vehicleSerialName:that.data.carSerialArray[e.detail.value].carTypeName,
            vehicleSerialCode:serialId.split(",")[0],
            faultType:serialId.split(",")[1],
        });
        that.getCarModel(that.data.vehicleSerialCode);
    }
    else
    {
        that.setData({
            vehicleSerialName:'',
            vehicleSerialCode:'',
            faultType:'',
        });
    }
    this.setData({
        serialIndex: e.detail.value
      })
    console.log(that.data.serialIndex);
    console.log('picker发送选择改变，携带值为', that.data.carSerialArray[e.detail.value].id)
   
  },
  carModelPickerChange: function(e) {
    var modelId = that.data.carModelArray[e.detail.value].comboFields;
    this.setData({
        modelIndex: e.detail.value
      })
    if(modelId != '-1')
    {
        that.setData({
            vehicleModeName:that.data.carModelArray[e.detail.value].carModelName,
            vehicleModeCode:modelId.split("|")[0],
            carModelCode:modelId.split("|")[1],
        })
    }
    else
    {
        that.setData({
            vehicleModeName:'',
            vehicleModeCode:'',
            carModelCode:''
        })
    }
    console.log('picker发送选择改变，携带值为', that.data.carModelArray[e.detail.value].id)
  
  },

 

})