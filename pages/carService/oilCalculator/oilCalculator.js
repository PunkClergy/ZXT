// pages/oilList/rent/rentCom.js
const appUtil = require('../../../utils/app-util.js');
const urlUtil = require('../../../utils/url-util.js');
const byteutils = require("../../../utils/byte-util.js");
const controlCmds = require('../../../utils/device-control-cmds.js');
const bleManager = require('../../../utils/oiltestutil.js');
const computeUtil = require('../../../utils/compute.js');
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
import u_url from '../../../utils/request/oil';
import {
  byGet
} from '../../../utils/request/http';
var that;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    s_background_picture_of_the_front_page: '',
    c_screen_height: _handleWindowInfo.windowHeight || 0, //屏幕高度
    c_screen_width: _handleWindowInfo.windowWidth || 0, //屏幕宽度
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    searchBarHeight: 80, // 搜索框高度，默认值
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_total: 0,
    oidStatusMod: false,
    markStatusMod: false,
    charging: 1,
    charging_value: '',
    markildId: '',
    winWidth: '',
    winHeight: '',
    scrollHihgt: '',
    mobilemode: '',
    searchText: '',

    items: [], // 数据列表
    page: 1,
    triggered: false,
    showModal: false,
    snitems: [],
    selectedCarIndex: '',
    selectedSn: '',

    sendcansetting: [],
    numofSetting: 0,
    currentRun: {},
    currentSetting: 0,
    needRetry: false,
    intervalCount: 0,
    pageInterval: 0,
    msg: '',
    msg2: '',
    carItem: '',

    oilShowModal: false,
    oilInfo: '',
    currentOil: '',
    qzOrderitems: [],
    selectedQzOrder: '',

    isShowOilSheet: true,
    oilItems: '',
    oilPercent: '',
    continueSum: [],
    progress: 50, // 初始进度（百分比）

  },
  drawProgressCircle(progress) {
    const query = wx.createSelectorQuery();
    query.select('#progressCanvas')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        const centerX = res[0].width / 2;
        const centerY = res[0].height / 2;
        const radius = Math.min(centerX, centerY) - 10; // 圆环的半径
        const lineWidth = 10; // 圆环的宽度

        // 绘制背景圆环
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = '#eaeaea';
        ctx.stroke();

        // 创建渐变色
        const gradient = ctx.createLinearGradient(
          centerX - radius, centerY, // 起点
          centerX + radius, centerY // 终点
        );
        gradient.addColorStop(0, '#feb47b'); // 渐变起始颜色
        gradient.addColorStop(1, '#ff7e5f'); // 渐变结束颜色

        // 绘制渐变色进度圆环
        const endAngle = (progress / 100) * 2 * Math.PI - Math.PI / 2; // 根据进度计算结束角度
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = gradient; // 使用渐变色
        ctx.lineCap = 'round'; // 圆角线条
        ctx.stroke();
      });
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
        console.log(dataToUpdate)
        _this.setData(dataToUpdate);
      });
  },
  getOilList: function (evt, ele) {
    const _this = this
    const {
      carItem
    } = _this.data
    if (carItem) {
      appUtil.showLoading("加载中...")
      const page = this.data.page;
      const url = getApp().data.k1swUrl + u_url.u_dipsticHistory.URL;
      const param = {
        [u_url.u_dipsticHistory.page]: page,
        [u_url.u_dipsticHistory.vehId]: carItem.id,
        ...evt,
        ...ele
      };

      byGet(url, param).then(response => {
        appUtil.hideLoading();
        const {
          code,
          count,
          content: rspns
        } = response.data;

        if (code !== 1000) {
          appUtil.showModal(response.data.msg || "请求失败", false, () => {});
          return;
        }

        if (page > 1 && !rspns.length) {
          appUtil.showToast(`已加载全部数据：共${this.data.items.length}条`);
          return;
        }

        this.setData({
          g_total: count,
          items: this.data.items.concat(rspns)
        });
      }).catch(error => {
        console.error("Error fetching oil list:", error);
        appUtil.showModal("网络错误，请稍后再试", false, () => {});
      });
    }
  },
  handleLower() {
    this.setData({
      page: this.data.page + 1
    });
    this.getOilList();
  },
  handleJumpCarList() {
    wx.navigateTo({
      url: '/pages/carManager/carList/carList?source=' + '/pages/carService/oilCalculator/oilCalculator',
    })
  },
  handleJumpHome() {
    wx.switchTab({
      url: '/pages/desk/desk',
    })
  },
  initDetailsJump(evt) {
    const pagms = evt?.datails
    if (pagms) {
      console.log(JSON.parse(pagms))
      this.setData({
        vehicle_info: JSON.parse(pagms)
      })
    }
  },
  handleMarkStatus(evt) {
    const info = evt.currentTarget.dataset.item
    this.setData({
      markStatusMod: true,
      markildId: info.id
    })
  },
  handleRadioChange(e) {
    this.setData({
      charging: e.detail.value
    })
  },
  handleBindinput(e) {
    this.setData({
      charging_value: e.detail.value
    })
  },
  handleMarkCance() {
    this.setData({
      markStatusMod: false
    })
  },
  handleMarkSubmit() {
    const _this = this
    const {
      charging,
      charging_value,
      markildId,
    } = this.data
    if (charging == 1 && charging_value == '') {
      wx.showModal({
        content: '请输入实收金额',
        complete: (res) => {}
      })
    } else {
      const url = getApp().data.k1swUrl + u_url.u_setChargeStatus.URL;
      const param = {
        [u_url.u_setChargeStatus.oilRecordId]: markildId,
        [u_url.u_setChargeStatus.chargeStatus]: charging,
        [u_url.u_setChargeStatus.realCost]: charging_value,
      };

      byGet(url, param).then(response => {
        if (response.data.code) {

          _this.setData({
            charging: 1,
            charging_value: '',
            markildId: '',
            markStatusMod: false,
            items: []
          })
          _this.getOilList()
        }


      }).catch(error => {
        console.error("Error fetching oil list:", error);
        appUtil.showModal("网络错误，请稍后再试", false, () => {});
      });
    }

  },
  handleOilStatus() {
    this.setData({
      oidStatusMod: true
    })
  },
  handleOidMarkSubmit() {
    this.setData({
      oidStatusMod: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    that = this;
    this.initialiImageBaseConversion()
    if (options.datails) {
      var carItem = JSON.parse(options.datails);
      console.log(options)
      that.setData({
        carItem: carItem,
      })
      this.getOilList()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.drawProgressCircle(this.data.progress);
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          mobilemode: res.model,
          scrollHihgt: res.windowHeight - 162
        });
      }
    });

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (that.data.intervalCount == 0) {
      that.data.pageInterval = setInterval(() => {
        var connectstate = bleManager.getBLEConnectionState() == true ? "已连接" : "未连接";
        that.setData({
          intervalCount: 1,
          msg2: connectstate + ",定时器开,个数" + that.data.intervalCount
        });
        if (
          //bleManager.getBLEConnectionState()==false && 
          that.data.needRetry == true) {
          that.setData({
            needRetry: false
          });
          that.NetSettingExec();
        } else {

        }
      }, 200);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

    console.log("detached")
    clearInterval(that.data.pageInterval);
    that.setData({
      intervalCount: 0,
      msg2: "定时器关--------------------"
    });
    // 在组件实例被从页面节点树移除时执行

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  lower(e) {
    // console.log(e);
    that.setData({
      page: that.data.page + 1

    });
    that.getRentingAndHistory(that.data.searchText);
  },

  refresh(e) {
    that.clearItems();
    that.getRentingAndHistory(that.data.searchText);
  },

  clearItems: function () {
    that.setData({
      triggered: false,
      items: []
    })
    that.setData({
      page: 1
    });
  },

  getRentReadyCarList: function (searchText) {
    var param = {};
    param[urlUtil.getRentReadyCarList.companyId] = app.data.userInfo.fin3CompanyId;
    if (!appUtil.isEmpty(searchText)) {
      param[urlUtil.getRentReadyCarList.comParam] = searchText;
      that.setData({
        searchText: searchText
      })
    } else {
      that.setData({
        searchText: ''
      })
    }
    param[urlUtil.getRentReadyCarList.page] = that.data.page;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.fin3Url + urlUtil.getRentReadyCarList.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {
          data.content.forEach((r) => {
            r.photoStatus = '未拍照',
              r.startPhotoPath = ''
          })
          if (that.data.page > 1 && data.content.length == 0) {
            appUtil.showToast("已加载全部数据")
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


  getOilDeviceList: function () {
    var param = {};
    param[urlUtil.getOilDeviceList.companyId] = app.data.userInfo.fin3CompanyId;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.fin3Url + urlUtil.getOilDeviceList.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {
          that.setData({
            snitems: data.content
          })
        } else {
          appUtil.showModal(data.msg, false, function () {});
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },

  getOilAddress: function (cellIndex, sn) {
    var param = {};
    param[urlUtil.getOilAddress.sn] = sn;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.fin3Url + urlUtil.getOilAddress.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {
          var content = data.content;
          console.log(content.oil)
          // that.updateCellOilAddress(cellIndex,content.oil,content.address);
          that.setData({
            showModal: false,
            oilShowModal: true,
            oilInfo: "当前油量" + content.oil + "L",
            currentOil: content.oil,
            selectedSn: '',
          })
        } else {
          appUtil.showModal(data.msg, false, function () {});
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },

  getOilButtonTap: function (e) {

    // var cellIndex = e.currentTarget.id;
    var item = that.data.carItem;


    // if(appUtil.isEmpty(item.sn))
    // {

    appUtil.showModal("检测步骤：\r\n 1.插入设备,等待设备滴声响起\r\n2.将车辆启动\r\n3.读取油量,此油量仅供参考", true, function (res) {
      if (res) {
        that.getSetting(item.vehicleSerialName)
        that.getOilDeviceList();
        that.setData({
          showModal: true,

        });
      }
    });

    // }
    // else
    // {
    //   that.getOilAddress(cellIndex,item.sn)
    // }


  },

  getSetting: function (carSerialName) {
    console.log(carSerialName)
    var param = {};
    param['carSerialName'] = carSerialName
    var url = "https://k3a.wiselink.net.cn/api/getOilCmd";
    var paramTmp = "carSerialName=" + param.carSerialName;
    console.log(paramTmp);
    appUtil.showLoading("获取配置中...");
    appUtil.byPost(url, paramTmp, function (res) {
      appUtil.hideLoading();
      if (res.statusCode == 200 && res.data.code == 1000) {

        var tmpSetting = [];
        tmpSetting = tmpSetting.concat(res.data.content.sendcansetting);
        console.log("tmpSetting:" + tmpSetting.length)
        that.setData({
          sendcansetting: tmpSetting,
        });



      } else {
        appUtil.showModal("获取配置失败", false, function (confirm) {});

      }
    });
  },

  NetSettingExec: function () {
    if (that.data.currentSetting == 0) {
      that.setData({
        numofSetting: that.data.sendcansetting.length,
      });
      console.log(that.data.numofSetting);
    }

    //每次执行前动作
    if (that.data.currentSetting < that.data.numofSetting) {
      that.setData({
        currentRun: that.data.sendcansetting[that.data.currentSetting],
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
    debugPara = byteutils.hexStringToArray(that.data.currentRun.canSID1, true);
    console.log(debugPara);
    debugPara = debugPara.concat(byteutils.hexStringToArray(that.data.currentRun.canSID2, true));
    console.log(debugPara);
    debugPara = debugPara.concat(byteutils.shortToSingleBytes(that.data.currentRun.sLen, true));
    console.log(debugPara);
    debugPara = debugPara.concat(byteutils.hexStringToArray(that.data.currentRun.sData, true));
    console.log(debugPara);
    debugPara = debugPara.concat(byteutils.hexStringToArray(that.data.currentRun.canRID, true));
    console.log(debugPara);
    debugPara = debugPara.concat(byteutils.shortToSingleBytes(that.data.currentRun.rType, true));
    console.log(debugPara);
    console.log(debugPara.length);
    controlCmds.setDebugType(0xf0);
    controlCmds.setDebugLen(debugPara.length);
    controlCmds.setDebugPara(debugPara);
    console.log(that.data.msg + "\r\n第" + (that.data.currentSetting + 1) + "次开始\r\n");

    that.sendData(bleManager.DEFAULT_CMD_TYPE.DEBUG_CMD);
  },

  sendData: function (sendType) {
    bleManager.sendData(that.data.selectedSn, '', sendType, function (state) {
      if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE == state) {
        //显示加载框
        appUtil.showLoading('油量读取执行中(' + (that.data.currentSetting + 1) + '/' + that.data.numofSetting + ')');
      } else {

        var errFlag = false;
        var errMsg = '';
        if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR == state) {
          //异常取消加载框
          appUtil.hideLoading();
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_DEVICES_DISCOVERY_FAILD == state) {
          //蓝牙不可用
          //appUtil.showModal('蓝牙搜索错误', false, function (confirm) { });
          errMsg = '蓝牙搜索错误';
          errFlag = true;
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE == state) {
          //蓝牙不可用
          //appUtil.showModal('请打开蓝牙', false, function (confirm) { });
          errMsg = '请打开蓝牙';
          errFlag = true;
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND == state) {
          //没有扫描到设备信息
          //appUtil.showModal('没有发现设备', false, function (confirm) { });
          errMsg = '没有发现设备';
          errFlag = true;
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED == state) {
          //连接失败
          //appUtil.showModal('蓝牙连接失败', false, function (confirm) { });
          if (that.data.currentSetting < that.data.numofSetting) {
            errMsg = '蓝牙连接异常';
            errFlag = true;
          }
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED == state) {
          //不支持ble
          //appUtil.showModal('您的手机不支持低功耗蓝牙', false, function (confirm) { });
          errMsg = '您的手机不支持低功耗蓝牙';
          errFlag = true;
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED == state) {
          //发送失败
          //appUtil.showModal('数据发送失败', false, function (confirm) { });
          errMsg = '数据发送失败';
          errFlag = true;
        } else if (bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE == state) {
          //无响应
          //appUtil.showModal('设备超时无响应', false, function (confirm) { });
          errMsg = '设备超时无响应';
          errFlag = true;
        }

        if (errFlag == true && bleManager.getBLEConnectionState() == true) {
          appUtil.showModal(errMsg + ',是否重试?', true, function (confirm) {
            if (res.confirm) {
              that.setData({
                needRetry: true
              });
            } else {
              that.setData({
                numofSetting: 0,
                currentSetting: 0,
              });
              bleManager.releaseBle();
            }
          });
        } else if (errFlag == true) {
          appUtil.showModal(errMsg, false, function (confirm) {});
          bleManager.releaseBle();
        }
      }

    }, function (data) {
      //隐藏加载框
      console.log("777777777777777777")
      appUtil.hideLoading();
      if (data.controlType == 7) {
        //7 debug响应
        if (data.result) {
          var recvParse = that.ParseRecv(data.result);
          that.setData({
            msg: that.data.msg +
              "收到数据：\n" + "{" +
              "\n(指令序号)=" + (that.data.currentSetting + 1) + '/' + that.data.numofSetting +
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
          if (recvParse.code == 0) {
            // wx.showModal({
            //   title: '获取成功',
            //   content: recvParse.msg,
            //   showCancel: false,
            //   success: function (res) {}
            // })
            console.log("oil获取成功:" + recvParse.msg);
            that.setData({
              numofSetting: 0,
              currentSetting: 0,
            });
            //获取成功关闭蓝牙
            bleManager.releaseBle();
            //成功一次就可以进行网络通知
            //that.resultNotify(true);

            var oil = recvParse.msg;
            var item = that.data.carItem;
            // if(oil.indexOf("%")!= -1)
            // {
            //   that.setData({
            //     oilPercent:oil
            //   })
            // }
            // else if(oil.indexOf("L")!= -1)
            // {
            //   oil = oil.replace("L","");
            //   that.setData({
            //     oilPercent: (oil * 1)/(that.data.xsgw * 1)
            //   })
            // }
            that.isShowOil(item.id, that.data.selectedSn, oil);

            that.saveOilLog();
          } else {
            console.log("currentSetting + 1")
            that.setData({
              currentSetting: that.data.currentSetting + 1
            });
            if (that.data.currentSetting < that.data.numofSetting) {
              that.setData({
                needRetry: true
              });
            } else {
              wx.showModal({
                title: '获取失败',
                content: recvParse.msg,
                showCancel: false,
                success: function (res) {}
              })
              that.setData({
                numofSetting: 0,
                currentSetting: 0,
              });
              //全部失败关闭蓝牙
              bleManager.releaseBle();
              //全部失败进行网络通知
              //that.resultNotify(false);
              that.saveOilLog();
            }
          }
        } else {
          that.setData({
            msg: "数据解析错误"
          });
        }
      }
    });
  },

  //实际项目使用
  ParseRecv: function (result) {
    //var ret={code:1,msg:"未知错误"};

    if (result.DebugRes == "失败") {
      return {
        code: 1,
        msg: "CAN通信错误,检查是否车辆启动或是否设备连接牢固!"
      };
    }
    // if(result.DebugSType!=that.data.currentRun.sType){
    //   return {code:1,msg:"发送配置与回复配置不符!"};      
    // }
    if (result.DebugRID != that.data.currentRun.canRID.toUpperCase()) {
      if (that.data.currentRun.canRID.toUpperCase() != "18DAF1FF" &&
        that.data.currentRun.canRID.toUpperCase() != "000007FF") {
        return {
          code: 1,
          msg: "回复ID与期望ID不符!"
        };
      }
    }

    var oilResult = that.parseParam(result.DebugRDataArray);
    if (oilResult.indexOf("InitError") != -1) {
      return {
        code: 1,
        msg: "计算方法初始化错误,舍弃!"
      };
    } else if (oilResult.indexOf("LenError") != -1) {
      return {
        code: 1,
        msg: "原车数据长度不足,舍弃!"
      };
    } else if (oilResult.indexOf("ComputeError") != -1) {
      return {
        code: 1,
        msg: "计算过程错误,舍弃!"
      };
    } else if (oilResult.indexOf("ZeroError") != -1) {
      return {
        code: 1,
        msg: "计算结果为0,舍弃!"
      };
    } else if (oilResult.indexOf("ResultError") != -1) {
      return {
        code: 1,
        msg: "计算结果过大,舍弃!"
      };
    } else if (oilResult.indexOf("NeedMoreData") != -1) {
      return {
        code: 1,
        msg: "多条计算未结束,继续执行!"
      };
    } else {
      return {
        code: 0,
        msg: oilResult
      };
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
  startRentButtonTap: function (e) {
    var id = e.currentTarget.id;
    var item = that.data.items[id];
    console.log("oil=" + item.id)
    that.triggerEvent('startRent', item)
  },

  photo: function (e) {
    var cellIndex = e.currentTarget.id;
    console.log(cellIndex);
    wx.navigateTo({
      url: '../camera-paper/camera?view=1&cellIndex=' + cellIndex,
    })
  },

  updateCellStartPhoto: function (cellIndex, startPhotoPath) {
    var photoStatus = "items[" + cellIndex + "].photoStatus";
    var startPhoto = "items[" + cellIndex + "].startPhotoPath";
    that.setData({
      [photoStatus]: '已拍照',
      [startPhoto]: startPhotoPath,
    })
  },
  updateCellOilAddress: function (cellIndex, oil, address) {
    var oilKey = "items[" + cellIndex + "].oil";
    var addressKey = "items[" + cellIndex + "].address";
    that.setData({
      [oilKey]: oil,
      [addressKey]: address,
    })
  },
  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    that.setData({
      selectedSn: e.detail.value
    })
  },
  orderRadioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    that.setData({
      selectedQzOrder: e.detail.value
    })
  },
  cancelButttonTap: function () {
    that.setData({
      showModal: false,
    })
  },
  sureButtonTap: function () {
    if (appUtil.isEmpty(that.data.selectedSn)) {
      appUtil.showToast("请选择设备")
    } else {
      //  that.NetSettingExec();
      that.hasShowOil(that.data.selectedSn);
    }
  },

  isShowOil: function (vehId, oilDeviceIdc, oil) {
    var param = {};
    param[urlUtil.isShowOil.oilDeviceIdc] = oilDeviceIdc;
    param[urlUtil.isShowOil.companyId] = app.data.userInfo.fin3CompanyId;;
    param[urlUtil.isShowOil.vehId] = vehId;
    param[urlUtil.isShowOil.oil] = oil;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.fin3Url + urlUtil.isShowOil.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {

          that.setData({
            showModal: false,
            oilShowModal: true,
            oilInfo: data.msg,
            currentOil: data.content,
            selectedSn: '',
          })


          // appUtil.showModal(data.msg, false, function() {

          //   that.setData({
          //     showModal: false,
          //   })
          // });

        } else {
          appUtil.showModal(data.msg, false, function () {});
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },

  hasShowOil: function (oilDeviceIdc) {
    var param = {};
    param[urlUtil.hasShowOil.oilDeviceIdc] = oilDeviceIdc;
    param[urlUtil.hasShowOil.companyId] = app.data.userInfo.fin3CompanyId;;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.fin3Url + urlUtil.hasShowOil.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {
          // var oil = "50%";
          // var item = that.data.carItem;
          // that.isShowOil(item.id,that.data.selectedSn,oil);
          that.NetSettingExec();
        } else {
          appUtil.showModal(data.msg, false, function () {});
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },

  btnNetSettingExec: function () {

    //第一次进来需要初始化
    if (that.data.currentSetting == 0) {
      //接口获取配置后,储存本地
      that.getSetting(function (res) {
        if (res == true) {
          that.NetSettingExec();
        } else {

        }
      });
    } else {
      that.NetSettingExec();
    }

  },

  //实际项目使用
  parseParam: function (resultAry) {
    try {
      var firstSemiColon = that.data.currentRun.parseInfo.indexOf(";");
      var secondSemiColon = that.data.currentRun.parseInfo.indexOf(";", firstSemiColon + 1);
      var parseInfoLen = that.data.currentRun.parseInfo.length;

      var computeStr = that.data.currentRun.parseInfo.substr(0, firstSemiColon);
      var computeVar = that.data.currentRun.parseInfo.substr(firstSemiColon + 1, secondSemiColon - (firstSemiColon + 1));
      var unit = that.data.currentRun.parseInfo.substr(secondSemiColon + 1, parseInfoLen - secondSemiColon);
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



    var computeVarObj = JSON.parse(computeVar);
    Object.keys(computeVarObj).forEach(key => {
      //console.log(key + ": " + computeVarObj[key]);
      if (computeVarObj[key] > resultAry.length - 1) {
        return "LenError";
      } else {
        computeVarObj[key] = resultAry[computeVarObj[key]];
      }
      //console.log(key + ": " + computeVarObj[key]);
    });

    try {
      var resultNum = computeUtil.compute(computeStr, computeVarObj).toFixed(2);

      console.log(resultNum);
      if (resultNum == 0) {
        return "ZeroError";
      }
      if (resultNum > 100) {
        return "ResultError";
      }

      //多条累加特殊计算
      if (unit.length == 2) {
        if (unit.indexOf('S') != -1) {
          that.setData({
            continueSum: []
          });
          that.data.continueSum.push(resultNum);
          return "NeedMoreData";
        } else if (unit.indexOf('F') != -1) {
          var tmpSum = 0;
          that.data.continueSum.push(resultNum);
          for (var i = 0; i < that.data.continueSum.length; i++) {
            tmpSum += parseFloat(that.data.continueSum[i]);
          }
          that.setData({
            continueSum: []
          });
          tmpSum = tmpSum.toFixed(2);
          var resultOil = tmpSum + unit.substr(1, 1);
          console.log(resultOil);
          return resultOil;
        } else {
          that.data.continueSum.push(resultNum);
          return "NeedMoreData";
        }
      } else {
        that.setData({
          continueSum: []
        });
        var resultOil = resultNum + unit;
        console.log(resultOil);
        return resultOil;
      }



    } catch (error) {
      return "ComputeError";
    }
    // var resultOil=computeUtil.compute(computeStr,computeVarObj).toFixed(2)+unit;
    // console.log(resultOil);

    // return resultOil;
  },

  getRentingAndHistory: function (searchText) {
    var param = {};
    param[urlUtil.getRentingAndHistory.companyId] = app.data.userInfo.fin3CompanyId;
    param[urlUtil.getRentingAndHistory.vehId] = that.data.carItem.id;
    // param[urlUtil.getRentingAndHistory.status] = 1;//在租

    param[urlUtil.getRentingAndHistory.page] = that.data.page;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.fin3Url + urlUtil.getRentingAndHistory.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {

          if (that.data.page > 1 && data.content.length == 0) {
            appUtil.showToast("已加载全部数据")
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


  getRentingOrder: function () {
    var param = {};
    param[urlUtil.getRentingAndHistory.companyId] = app.data.userInfo.fin3CompanyId;
    param[urlUtil.getRentingAndHistory.vehId] = that.data.carItem.id;
    param[urlUtil.getRentingAndHistory.status] = 0; //在租
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.fin3Url + urlUtil.getRentingAndHistory.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {
          that.setData({
            qzOrderitems: data.content
          })
        } else {
          appUtil.showModal(data.msg, false, function () {});
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },

  startRent: function () {
    var cellData = that.data.carItem;
    var param = {};
    param[urlUtil.rentStart.vehId] = cellData.id;
    param[urlUtil.rentStart.sn] = that.data.selectedSn;
    param[urlUtil.rentStart.renterName] = ''; //对话框内容
    param[urlUtil.rentStart.checkerName] = getApp().data.userInfo.realname
    // checkerName = getApp().data.userInfo.realname
    param[urlUtil.rentStart.oil] = that.data.currentOil;
    appUtil.showLoading("加载中...")
    appUtil.uploadFile2(getApp().data.fin3Url + urlUtil.rentStart.URL, urlUtil.rentStart.panelStartImg, cellData.startPhotoPath, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (!appUtil.isEmpty(cellData.startPhotoPath)) {
          data = JSON.parse(data);
        }
        appUtil.showModal(data.msg, false, function () {});
        if (data.code == 1000) {
          that.refresh();
          that.setData({
            oilShowModal: false,
          })
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },
  rentEnd: function () {
    that.getRentingOrder();
    that.setData({
      oilShowModal: false,
      orderShowModal: true,
    })
  },
  oilcancelButttonTap: function () {
    that.setData({
      oilShowModal: false,
    })
  },
  zhijieRentEnd: function () {
    that.endRentSure(null, null);
  },
  qizhuRentEnd: function () {

    if (appUtil.isEmpty(that.data.selectedQzOrder)) {
      appUtil.showToast("请选择设备");
      return;
    } else {
      that.getOilPriceList();

    }
  },
  rentEndCancel: function () {
    that.setData({
      orderShowModal: false,
    })
  },

  endRentSure: function (oilId, oilprice) {
    var param = {};
    if (!appUtil.isEmpty(oilId)) {
      param[urlUtil.rentEnd.id] = oilId;
      param[urlUtil.rentEnd.oilPrice] = oilprice;
    }
    param[urlUtil.rentStart.sn] = that.data.selectedSn;
    param[urlUtil.rentStart.checkerName] = getApp().data.userInfo.realname
    param[urlUtil.rentEnd.oil] = that.data.currentOil;
    param[urlUtil.rentEnd.vehId] = that.data.carItem.id;
    appUtil.showLoading("加载中...")
    appUtil.uploadFile2(getApp().data.fin3Url + urlUtil.rentEnd.URL, urlUtil.rentEnd.panelEndImg, null, param, function (res) {
      appUtil.hideLoading();
      if (res) {

        if (res.statusCode == 200) {
          var data = res.data;

          appUtil.showModal(data.msg, false, function () {});
          if (data.code == 1000) {

            that.setData({
              orderShowModal: false,
              isShowOilSheet: true,
            })
            that.refresh();

          }
        } else {
          appUtil.showModal("请求发生错误", false, function () {});
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },

  actionSheetChange: function () {
    that.setData({
      isShowOilSheet: true
    })
  },
  getOilPriceList: function () {
    var param = {};
    param[urlUtil.getOilPriceList.companyId] = app.data.userInfo.fin3CompanyId;;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.fin3Url + urlUtil.getOilPriceList.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {
          var content = data.content;
          that.setData({
            oilItems: content,
            isShowOilSheet: false
          })
        } else {
          appUtil.showModal(data.msg, false, function () {
            wx.navigateTo({
              url: '../oilPriceSet/oilPriceSet',
            })

          });
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },

  sheetTap: function (e) {
    console.log(e.currentTarget.id)
    var oilPrice = e.currentTarget.id;

    that.setData({
      selectedOilPrice: oilPrice
    })

    that.endRentSure(that.data.selectedQzOrder, oilPrice)
  },

  saveOilLog: function () {
    var param = {};
    param[urlUtil.saveOilLog.idc] = that.data.selectedSn;
    param[urlUtil.saveOilLog.mobilemode] = that.data.mobilemode;
    param[urlUtil.saveOilLog.vehid] = that.data.carItem.id;
    param[urlUtil.saveOilLog.msg] = that.data.msg
    appUtil.byPost(getApp().data.fin3Url + urlUtil.saveOilLog.URL, param, function (res) {
      console.log("日志上传成功")
    });
  }
})