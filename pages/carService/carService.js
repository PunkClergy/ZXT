const appUtil = require('../../utils/app-util.js');
const urlUtil = require('../../utils/url-util.js');
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
import {
  byGet,
  byPost
} from '../../utils/request/http';
import u_url from '../../utils/request/oil';
const {
  u_getCarStatus,
} = require('../../utils/request/map')
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
Page({
  data: {
    s_background_picture_of_the_front_page: '',
    c_screen_height: _handleWindowInfo.screenHeight || 0, //屏幕高度
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
    carItem: '', //车辆数据

    oilShowModal: false, //油量检测弹窗
    oilInfo: '',
    currentOil: '',
    qzOrderitems: [],
    selectedQzOrder: '',

    isShowOilSheet: true,
    oilItems: '',
    oilPercent: '',
    continueSum: [],
    progress: 50, // 初始进度（百分比）


    remaining_oil_quantity: 0, //剩余油量
    total_oil_quantity: 0, //总油量
  },
  // 全屏背景图
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
  // 请求列表
  getOilList(evt, ele) {
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
  // 跳转车辆列表
  handleJumpCarList() {
    wx.navigateTo({
      url: '/pages/carManager/carList/carList?source=' + '/pages/carService/carService',
    })
  },
  // 圆形图绘制
  drawProgressCircle(progress) {
    console.log(progress)
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
  // 检测油量
  getOilButtonTap() {
    showLoading('加载中...');
    const requestParam = {
      [u_getCarStatus.sn]: this.data.carItem.sn
    };
    const url = getApp().data.k1swUrl + u_getCarStatus.URL;
    byPost(url, requestParam, (response) => {

      hideLoading()
      const info = response.data.content
      if (response.data.code !== 1000) {
        showToast(response.data.msg);
        return
      }
      console.log(this.data.carItem.xsgw)
      this.setData({
        remaining_oil_quantity: info?.typeOfReMailOil == 1 ? Number(this.data.carItem.xsgw) * Number(info?.confirmOilRemainA / 100) : info?.confirmOilRemainA,
        oilShowModal: true,
        progress: info?.typeOfReMailOil == 1 ? info?.confirmOilRemainA : ((info?.confirmOilRemainA / this.data.carItem.xsgw) * 100).toFixed(2)
      }, () => {
        this.drawProgressCircle(this.data.progress)
      });
    }, (error) => {
      showToast('获取信息失败，请重试');
    }, () => {
      hideLoading();
    });
  },
  // 起租
  startRent: function () {
    const _this = this
    var cellData = _this.data.carItem;
    var param = {};
    param[urlUtil.rentStart.vehId] = _this.data.carItem.id;
    param[urlUtil.rentStart.sn] = _this.data.carItem.sn;
    param[urlUtil.rentStart.renterName] = ''; //对话框内容
    param[urlUtil.rentStart.checkerName] = getApp().data.userInfo.realname
    param[urlUtil.rentStart.oil] = _this.data.remaining_oil_quantity;
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
          _this.setData({
            oilShowModal: false,
            items: [], // 数据列表
            page: 1,
          }, () => {
            _this.getOilList()
          })
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }
    });
  },
  // 还租
  rentEnd: function () {

    this.getRentingOrder();
    this.setData({
      oilShowModal: false,
      orderShowModal: true,
    })
  },
  getRentingOrder: function () {
    const _this = this
    var param = {};
    param[urlUtil.getRentingAndHistory.companyId] = getApp().data.userInfo.fin3CompanyId;
    param[urlUtil.getRentingAndHistory.vehId] = this.data.carItem.id;
    param[urlUtil.getRentingAndHistory.status] = 0; //在租
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.fin3Url + urlUtil.getRentingAndHistory.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {
          _this.setData({
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
  orderRadioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      selectedQzOrder: e.detail.value
    })
  },
  zhijieRentEnd: function () {
    this.endRentSure(null, null);
  },
  endRentSure: function (oilId, oilprice) {
    const _this = this
    var param = {};
    if (!appUtil.isEmpty(oilId)) {
      param[urlUtil.rentEnd.id] = oilId;
      param[urlUtil.rentEnd.oilPrice] = oilprice;
    }
    param[urlUtil.rentStart.sn] = _this.data.selectedSn;
    param[urlUtil.rentStart.checkerName] = getApp().data.userInfo.realname
    param[urlUtil.rentEnd.oil] = _this.data.remaining_oil_quantity;
    param[urlUtil.rentEnd.vehId] = _this.data.carItem.id;
    appUtil.showLoading("加载中...")
    appUtil.uploadFile2(getApp().data.fin3Url + urlUtil.rentEnd.URL, urlUtil.rentEnd.panelEndImg, null, param, function (res) {
      appUtil.hideLoading();
      if (res) {

        if (res.statusCode == 200) {
          var data = res.data;

          appUtil.showModal(data.msg, false, function () {});
          if (data.code == 1000) {

            _this.setData({
              orderShowModal: false,
              isShowOilSheet: true,
            })

          }
        } else {
          appUtil.showModal("请求发生错误", false, function () {});
        }
      } else {
        appUtil.showModal("请求发生错误，请检查网络！", false, function () {});
      }

    });
  },
  rentEndCancel: function () {
    this.setData({
      orderShowModal: false,
    })
  },
  qizhuRentEnd: function () {

    if (appUtil.isEmpty(this.data.selectedQzOrder)) {
      appUtil.showToast("请选择设备");
      return;
    } else {
      this.getOilPriceList();

    }
  },
  getOilPriceList: function () {
    const _this = this
    var param = {};
    param[urlUtil.getOilPriceList.companyId] = getApp().data.userInfo.fin3CompanyId;;
    appUtil.showLoading("加载中...")
    appUtil.byPost(getApp().data.fin3Url + urlUtil.getOilPriceList.URL, param, function (res) {
      appUtil.hideLoading();
      if (res) {
        var data = res.data;
        if (data.code == 1000) {
          var content = data.content;
          _this.setData({
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
    var oilPrice = e.currentTarget.id;

    this.setData({
      selectedOilPrice: oilPrice
    })

    this.endRentSure(this.data.selectedQzOrder, oilPrice)
  },
  onLoad: function (options) {
    if (options.datails) {
      var carItem = JSON.parse(options.datails);
      this.setData({
        carItem: carItem,
      }, () => {
        this.getOilList()
      })
    }
  },
  onShow() {
    this.initialiImageBaseConversion()
  },
  onReady: function () {
    // this.drawProgressCircle(this.data.progress);
  },
  oilcancelButttonTap() {
    this.setData({
      oilShowModal: false
    })
  },

})