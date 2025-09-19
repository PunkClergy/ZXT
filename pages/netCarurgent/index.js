
const {
  showLoading,
  hideLoading,
  showToast
} = require('../../utils/Inspect/tips')
const bleManager = require('../../utils/ble-manager.js');
Page({
  data: {
    sn: '',
    blueKey: '', //蓝牙密码
    idc: '', //设备唯一标志
  },
  //底部 "按钮" 操作 
  handleFooterBtn(evt) {
    if (!this.data.sn) {
      showToast('无可用车辆')
      return
    }
    const controlType = Number(evt?.currentTarget?.id) || 0;
    // 蓝牙操作
    this.handleExecuteBluetooth(controlType)
    return
  },
  // 蓝牙控制车辆
  handleExecuteBluetooth(type) {
    console.log(this.data.idc, '000------')
    const COMMAND_MAPPING = {
      5: 5, // 远程寻车
      1: this?.data?.deviceType ? 4 : 3, // 锁门
      3: this?.data?.deviceType == 'F1' ? 1 : 2, // 开门
      6: 10,//取消拦截
      8: 11//风控拦截
    };

    const BLUETOOTH_HANDLERS = {
      [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE]: () => {
        showLoading('指令执行中...');
      },
      [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR]: () => {
        hideLoading();
      },
      [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE]: () => {
        showToast('请打开蓝牙', false);
        hideLoading();
      },
      [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND]: () => {
        // this.isAndroid6((isAndroid) => {
        //   const message = isAndroid ?
        //     '请确定已经打开手机定位和微信定位权限!' :
        //     '请重试!';
        //     showToast(`没有发现设备，${message}`, false);
        // });
        hideLoading();
      },
      [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED]: () => {
        showToast('蓝牙连接失败，请重试!', false);
        hideLoading();
      },
      [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED]: () => {
        showToast('您的手机不支持低功耗蓝牙', false);
        hideLoading();
      },
      [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED]: () => {
        showToast('数据发送失败，请重试!', false);
        hideLoading();
      },
      [bleManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE]: () => {
        showToast('设备超时无响应，请重试!', false);
        hideLoading();
      }
    };

    try {
      if (!COMMAND_MAPPING.hasOwnProperty(type)) return;
      const command = COMMAND_MAPPING[type];
      if (type == 5) {
        bleManager.sendData(
          this.data.idc,
          this.data.blueKey,
          command,
          state => BLUETOOTH_HANDLERS[state]?.(),
          data => {
            hideLoading()
            if (data.controlType === 4) {
              showToast(data.result);
              if (data.result.includes("控制成功")) {
                // 上传服务器逻辑
              }
            }
          }
        );
        return;
      }
      if (type == 8 || type == 6) {
        console.log(12323232323)
        bleManager.sendData(
          this.data.idc,
          this.data.blueKey,
          command,
          state => BLUETOOTH_HANDLERS[state]?.(),
          data => {
            hideLoading()
            if (data.controlType === 4) {
              showToast(data.result);
              if (data.result.includes("控制成功")) {
                // 上传服务器逻辑
              }
            }
          }
        );
        return;
      }
      if ([1, 3].includes(type)) {
        bleManager.sendData(this.data.idc, this.data.blueKey, command, state => BLUETOOTH_HANDLERS[state]?.(),
          data => {
            hideLoading();
            if (data.controlType === 4) {
              showToast(data.result);
              if (data.result.includes("控制成功")) {
                // 上传服务器逻辑
              }
            }
          });
      }
    } finally {
      //  统一清理 (如果需要)
    }
  },
  onLoad: function (options) {

  },

  onShow: function () {
    const networkBlue = wx.getStorageSync('networkBlue');
    console.log(networkBlue)
    this.setData({
      sn: networkBlue?.sn,
      blueKey: networkBlue?.blueKey,
      idc: networkBlue?.idc
    })
  },
  onUnload: function () {
  }
})