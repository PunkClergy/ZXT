// 工具引入
const appUtil = require('../../utils/app-util.js');
const urlUtil = require('../../utils/url-util.js');
const bleManager = require('../../utils/ble-manager.js');
const { _handleWindowInfo, _handleDeviceInfo } = require('../../utils/public').default;
// 页面定义
Page({
  /**
   * 页面的初始数据
   */
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_screen_width: _handleWindowInfo.windowWidth || 0,
    statusBarHeight: _handleWindowInfo.statusBarHeight || 0,
    navBarHeight: _handleDeviceInfo.platform === 'ios' ? 49 : 44,
    searchBarHeight: 80,
    totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform === 'ios' ? 49 : 44),

    mapHeight: 0,
    latitude: '39.915077',
    longitude: '116.403838',
    markers: [],
    includePoints: [],
    polyline: [],
    mapId: 'map',
    scale: 16,
    key: 'W66BZ-ADBC3-COB3F-YWZG4-MAVRO-IJBIM',
    arcImage: '../../assets/images/control_up_bg.png',
    arcHeight: 49,
    coverHeight: 230,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    cellData: {},
    currentSn: '',
    showModal: false,
    carStatus: {},
    currentSelectControlType: -4,
    networkControlId: -4,
    bluetoothControlId: -5,

    // 动态图片 base64
    s_background_picture_of_the_front_page: ''
  },

  // 自定义事件接收子组件数据
  handleChildEvent(evt) {
    const info = evt?.detail?.info;
    if (info) {
      this.setData({ cellData: info });
    }
  },

  /**
   * 图片转 base64（用于特殊场景）
   */
  initialiImageBaseConversion() {
    const imageMap = [{
      path: '/assets/images/home/car-bg.png',
      key: 's_background_picture_of_the_front_page'
    }];

    const promises = imageMap.map(item =>
      new Promise(resolve => {
        wx.getFileSystemManager().readFile({
          filePath: item.path,
          encoding: 'base64',
          success: res => resolve({ [item.key]: `data:image/png;base64,${res.data}` }),
          fail: () => resolve({}) // 失败不中断
        });
      })
    );

    Promise.all(promises).then(results => {
      const dataToUpdate = Object.assign({}, ...results);
      this.setData(dataToUpdate);
    });
  },

  /**
   * 页面加载
   */
  onLoad(options) {
    const self = this;

    // 修复拼写：datails → details
    if (options?.details) {
      try {
        const carItem = JSON.parse(options.details);
        self.setData({ cellData: carItem });
      } catch (e) {
        console.error('解析车辆信息失败', e);
      }
    }

    self.nowTime();
    self.initMap();
  },

  /**
   * 初始化地图
   */
  initMap() {
    const self = this;
    wx.getSystemInfo({
      success: (res) => {
        const isIOS = res.platform === 'ios';
        self.setData({
          c_screen_height: res.screenHeight,
          c_screen_width: res.windowWidth,
          statusBarHeight: res.statusBarHeight,
          navBarHeight: isIOS ? 49 : 44,
          totalNavHeight: (res.statusBarHeight || 0) + (isIOS ? 49 : 44),
          mapHeight: res.windowHeight - (res.windowWidth / 750) * self.data.coverHeight,
          arcHeight: (res.windowWidth / 720) * 45
        });
      },
      fail: () => console.warn('获取系统信息失败')
    });
  },

  /**
   * 获取当前时间
   */
  nowTime() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');

    const today = `${year}-${month}-${day}`;
    const nowTimeStr = `${h}:${m}:${s}`;

    this.setData({
      startDate: today,
      startTime: '00:00:00',
      endDate: today,
      endTime: nowTimeStr
    });
  },



  /**
   * 保存控制密码
   */
  saveControlPwd(key, value) {
    console.log('保存密码:', key, value);
    appUtil.setStorage(key, value, () => { });
  },



  /**
   * 生成车辆信息对象
   */
  generateShowCarInfo(car) {
    return {
      carNum: car.plateNumber,
      sn: car.sn,
      idc: car.idc,
      vehicleModeName: car.vehicleModeName,
      vehicleSerialName: car.vehicleSerialName,
      vin: car.vin,
      xsgw: car.xsgw,
      platenumber: car.plateNumber,
      categoryName: car.vehicleModeName,
      categoryImg: car.categoryImg,
      latitude: car.tlatitude,
      longitude: car.tlongitude,
      distance: car.distance,
      id: car.id,
      kmprice: car.kmprice,
      address: car.address,
      showtime: car.showtime
    };
  },

  /**
   * 生成坐标点
   */
  generatePoint(lat, lng) {
    return { latitude: lat, longitude: lng };
  },

  /**
   * 生成 marker（带选中状态）
   */
  generateMarker2(iconPath, id, lat, lng, address, showtime, isSelected) {
    return {
      id: Number(id),
      iconPath,
      width: 25,
      height: 37,
      latitude: lat,
      longitude: lng,
      callout: {
        content: `当前位置：${address}\r\n定位时间：${showtime}`,
        display: isSelected ? 'ALWAYS' : 'BYCLICK',
        padding: 8
      }
    };
  },



  /**
   * 控车按钮点击
   */
  operationBtnTap(e) {
    const self = this;
    const sn = self.data.cellData?.sn;
    if (!sn) {
      appUtil.showToast("请先选择车辆");
      return;
    }

    const controlType = Number(e.currentTarget.id);
    self.isNetworkControl()
      ? self.networkControl(controlType)
      : self.bluetoothControl(controlType);
  },

  /**
   * 网络控车
   */
  networkControl(controlType) {
    const self = this;
    appUtil.showLoading('正在控制...');

    const param = {
      [urlUtil.operation.sn]: self.data.cellData.sn,
      [urlUtil.operation.code]: self.data.cellData.code,
      [urlUtil.operation.operationType]: controlType
    };

    appUtil.byPost(getApp().data.k1swUrl + urlUtil.operation.URL, param, (res) => {
      appUtil.hideLoading();
      if (res.statusCode !== 200) {
        appUtil.showModal('网络异常!', false);
        return;
      }

      const data = res.data;
      if (data.code !== 1000) {
        appUtil.showModal(data.msg, false);
      } else {
        const msg = controlType === 5 ? '寻车成功，请注意附近鸣笛车辆!' : '控制成功!';
        appUtil.showModal(msg, false);
      }
    });
  },

  /**
   * 蓝牙控车
   */
  bluetoothControl(controlType) {
    const self = this;
    self.dealControlPwd(self.data.cellData.sn, (pwd) => {
      if (!pwd) {
        appUtil.showModal('控制密码不正确!', false);
        return;
      }
      self.sendData(
        controlType === 5
          ? bleManager.DEFAULT_CMD_TYPE.CONTROL_REMOTE_LOOK_FOR_CAR_TYPE
          : controlType === 1
            ? bleManager.DEFAULT_CMD_TYPE.CONTROL_CLOSE_DOOR_TYPE
            : controlType === 3
              ? bleManager.DEFAULT_CMD_TYPE.CONTROL_OPEN_DOOR_TYPE
              : null,
        pwd
      );
    });
  },

  /**
   * 获取控制密码
   */
  dealControlPwd(sn, callback) {
    appUtil.getStorage(sn, (value) => {
      callback(value);
    });
  },

  /**
   * 发送蓝牙指令
   */
  sendData(sendType, pwd) {
    const self = this;
    if (!sendType) return;
    console.log("发送蓝牙指令:", sendType, "IDC:", self.data.cellData.idc);
    bleManager.sendData(self.data.cellData.idc, pwd, sendType, (state) => {
      switch (state) {
        case bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE:
          appUtil.showLoading('指令发送中...');
          break;
        case bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR:
        case bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED:
          appUtil.hideLoading();
          break;
        case bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE:
          appUtil.showModal('请打开蓝牙', false);
          break;
        case bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND:
          self.isAndroid6((isAndroid6) => {
            const msg = isAndroid6
              ? '未发现设备，请开启定位权限'
              : '未发现设备，请重试';
            appUtil.showModal(msg, false);
          });
          break;
        case bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED:
          appUtil.showModal('手机不支持低功耗蓝牙', false);
          break;
        case bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED:
          appUtil.showModal('数据发送失败，请重试', false);
          break;
        case bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE:
          appUtil.showModal('设备无响应，请重试', false);
          break;
        default:
          break;
      }
    }, (data) => {
      appUtil.hideLoading();
      if (data?.result) appUtil.showToast(data.result);
    });
  },



  /**
   * 判断是否为网络控车
   */
  isNetworkControl() {
    return this.data.currentSelectControlType === this.data.networkControlId;
  },

  /**
   * 获取车辆状态
   */
  stautsBtnTap() {
    const self = this;
    appUtil.showLoading('加载中...');
    const param = { [urlUtil.getCarStatus.sn]: self.data.cellData.sn };

    appUtil.byPost(getApp().data.k1swUrl + urlUtil.getCarStatus.URL, param, (res) => {
      appUtil.hideLoading();
      if (res.statusCode === 200 && res.data.code === 1000) {
        self.setData({ carStatus: res.data.content, showModal: true });
      } else {
        appUtil.showModal('网络异常或获取失败!', false);
      }
    });
  },

  /**
   * 关闭弹窗
   */
  sureButtonTap() {
    this.setData({ showModal: false });
  },

  /**
   * 页面初次渲染完成
   */
  onReady() {
    this.initialiImageBaseConversion();
  }
});