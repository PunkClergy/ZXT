const {
  u_operation
} = require('../../../utils/request/map')
const {
  byGet,
  byPost
} = require('../../../utils/request/http')

const MAX_LOG_COUNT = 50;

Page({
  data: {
    checkForm: {
      idc: '',
      code: ''
    },
    isDeviceBound: false,
    deviceInfo: {
      sn: '',
      code: ''
    },
    // 修复：7个独立分组，一一对应7张必填图片，不再共用other
    imageGroups: {
      namePlate: [],       // 1.车辆铭牌 vehicle_nameplate
      acc: [],              // 2.钥匙焊接图 key_welding_diagram
      constant: [],         // 3.风控线束图 risk_control_wiring
      ground: [],           // 4.回避器图 avoider_diagram
      accWiring: [],        // 5.ACC接线图 acc_wiring_diagram
      constantPower: [],    // 6.常火接线图 constant_power_wiring
      emergencyArea: []     // 7.应急感应区域 emergency_sensing_area
    },
    allRequiredImgReady: false,
    isImageUploaded: false,
    isUploading: false,
    networkTestStatus: {
      lockStatus: '',
      unlockStatus: '',
      findCarStatus: '',
      riskStatus: '',
      cancelRiskStatus: ''
    },
    testLogList: [],
    isNetworkTestFinished: false,
    canSubmitFinalCheck: false,
    c_k1sw_link: 'https://k1sw.wiselink.net.cn/',
    isShowDemo: false,
    isSubmitting: false
  },

  // ---------- 示例图片 ----------
  toggleDemo() {
    this.setData({
      isShowDemo: !this.data.isShowDemo
    })
  },
  previewDemoImg(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({
      urls: [src]
    })
  },
  previewUploadImg(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: [url],
      current: url
    })
  },

  // ---------- 删除图片 ----------
  deleteImage(e) {
    const {
      group,
      index
    } = e.currentTarget.dataset;
    const currentList = this.data.imageGroups[group];
    const newList = currentList.filter((_, i) => i !== index);
    this.setData({
      [`imageGroups.${group}`]: newList
    }, () => {
      this.updateImgReadyState();
      // 如果已经标记为上传完成，删除后重置
      if (this.data.isImageUploaded) {
        this.setData({
          isImageUploaded: false
        });
      }
      this.checkCanSubmit();
    });
  },

  // ---------- 图片分组管理【关键修复：7组全部校验不为空】 ----------
  updateImgReadyState() {
    const {
      imageGroups
    } = this.data;
    // 7个分类每一组必须至少有一张图片才满足必填条件
    const ready = imageGroups.namePlate.length > 0 &&
      imageGroups.acc.length > 0 &&
      imageGroups.constant.length > 0 &&
      imageGroups.ground.length > 0 &&
      imageGroups.accWiring.length > 0 &&
      imageGroups.constantPower.length > 0 &&
      imageGroups.emergencyArea.length > 0;
    this.setData({
      allRequiredImgReady: ready
    });
  },

  chooseGroupImage(e) {
    const {
      group,
      max
    } = e.currentTarget.dataset;
    const current = this.data.imageGroups[group];
    const remain = max - current.length;
    if (remain <= 0) {
      wx.showToast({
        title: `该分类最多上传${max}张`,
        icon: 'none'
      })
      return;
    }
    wx.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newList = [...current, ...res.tempFilePaths];
        this.setData({
          [`imageGroups.${group}`]: newList
        }, () => {
          this.updateImgReadyState();
          if (this.data.isImageUploaded) {
            this.setData({
              isImageUploaded: false
            });
          }
        });
      }
    })
  },

  // ---------- 批量上传（字段名自定义） ----------
  async handleBatchUploadImages() {
    const {
      imageGroups,
      deviceInfo
    } = this.data;
    if (!this.checkAllRequiredImages()) {
      wx.showToast({
        title: '7类图片每类至少上传一张',
        icon: 'none'
      })
      return;
    }
    if (!deviceInfo?.sn) {
      wx.showToast({
        title: '设备信息异常，请重新绑定',
        icon: 'none'
      })
      return;
    }

    this.setData({
      isUploading: true
    });
    wx.showLoading({
      title: '开始上传图片...'
    });

    try {
      // 修复：收集顺序和customNames数组严格一一对应7个必填项
      const allImages = [
        ...imageGroups.namePlate,
        ...imageGroups.acc,
        ...imageGroups.constant,
        ...imageGroups.ground,
        ...imageGroups.accWiring,
        ...imageGroups.constantPower,
        ...imageGroups.emergencyArea
      ];
      const total = allImages.length;

      for (let i = 0; i < total; i++) {
        wx.showLoading({
          title: `正在上传第 ${i + 1}/${total} 张`
        });
        await this.uploadSingleImage(allImages[i], i);
      }

      this.setData({
        isImageUploaded: true
      }, () => {
        this.updateImgReadyState();
        this.checkCanSubmit();
      });
      this.appendTestLog('✅ 图片全部上传成功！可开始功能检测');
      wx.showToast({
        title: '上传成功',
        icon: 'none'
      });
    } catch (error) {
      this.appendTestLog(`❌ 图片上传失败：${error}`);
      wx.showToast({
        title: '上传失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
      this.setData({
        isUploading: false
      });
    }
  },

  // ---------- 单张上传（字段名可自由定制） ----------
  uploadSingleImage(filePath, index) {
    return new Promise((resolve, reject) => {
      const userInfo = wx.getStorageSync('userKey') || {};
      const token = userInfo.token || '';
      // 7个字段与页面7个分类顺序完全匹配
      const customNames = [
        'vehicle_nameplate',
        'key_welding_diagram',
        'risk_control_wiring',
        'avoider_diagram',
        'acc_wiring_diagram',
        'constant_power_wiring',
        'emergency_sensing_area'
      ];
      const fieldName = customNames[index] || `installImgs${index}`;
      wx.uploadFile({
        url: 'https://k1sw.wiselink.net.cn/k7Api/uploadInstallImg',
        filePath: filePath,
        name: fieldName,
        header: {
          token
        },
        formData: {
          sn: this.data.deviceInfo.sn
        },
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data);
            if (data.code === 1000) resolve();
            else reject(data.msg || '上传失败');
          } catch (e) {
            reject('数据解析异常');
          }
        },
        fail: () => reject('网络异常')
      });
    });
  },

  // ---------- 以下原有逻辑无修改 ----------
  checkAllRequiredImages() {
    return this.data.allRequiredImgReady;
  },
  checkCanSubmit() {
    const {
      networkTestStatus,
      isDeviceBound,
      isImageUploaded
    } = this.data;
    const {
      lockStatus,
      unlockStatus,
      findCarStatus,
      riskStatus,
      cancelRiskStatus
    } = networkTestStatus;
    const allTestFinish = lockStatus === 'success' && unlockStatus === 'success' &&
      findCarStatus === 'success' && riskStatus === 'success' &&
      cancelRiskStatus === 'success';
    this.setData({
      isNetworkTestFinished: allTestFinish
    });
    const canSubmit = isDeviceBound && isImageUploaded && allTestFinish;
    this.setData({
      canSubmitFinalCheck: canSubmit
    });
    if (allTestFinish) {
      this.appendTestLog('🎉 网络模式全部检测完成！可提交检测');
    }
  },
  inputIdc(e) {
    this.setData({
      'checkForm.idc': e.detail.value
    });
  },
  inputCode(e) {
    this.setData({
      'checkForm.code': e.detail.value
    });
  },
  validateBeforeOperate() {
    const {
      checkForm,
      isDeviceBound,
      isImageUploaded
    } = this.data;
    if (!checkForm.idc || !checkForm.code) {
      wx.showToast({
        title: '请先输入设备号和检验码',
        icon: 'none'
      });
      return false;
    }
    if (!isDeviceBound) {
      wx.showToast({
        title: '请先绑定设备',
        icon: 'none'
      });
      return false;
    }
    if (!isImageUploaded) {
      wx.showToast({
        title: '请先上传现场图片',
        icon: 'none'
      });
      return false;
    }
    return true;
  },
  async handleDeviceBind() {
    const CHECK_URL = 'https://k1sw.wiselink.net.cn/k7Api/isIdcCheck';
    const BIND_URL = 'https://k1sw.wiselink.net.cn/k7Api/getBluetoothKey';

    const {
      isSubmitting,
      checkForm
    } = this.data;
    if (isSubmitting) return;
    this.setData({
      isSubmitting: true
    });

    try {
      const userInfo = wx.getStorageSync('userKey') || {};
      const token = userInfo.token || '';
      const {
        idc,
        code
      } = checkForm || {};

      if (!idc || !code) {
        wx.showToast({
          title: '请输入完整的设备号和检验码',
          icon: 'none'
        });
        return;
      }

      const checkRes = await new Promise((resolve, reject) => {
        wx.request({
          url: CHECK_URL,
          method: 'GET',
          data: {
            idc
          },
          header: {
            token
          },
          success: res => resolve(res),
          fail: err => reject(err)
        });
      });

      if (checkRes?.data?.code === 1000) {
        wx.showModal({
          title: '结果',
          content: checkRes?.data?.msg || '校验返回1000，终止绑定流程',
          showCancel: false
        });
        return;
      }

      wx.showLoading({
        title: '设备绑定中...',
        mask: true
      });

      const bindResult = await new Promise((resolve, reject) => {
        wx.request({
          url: BIND_URL,
          method: 'GET',
          data: {
            sn: idc,
            code
          },
          header: {
            token
          },
          success: res => resolve(res.data),
          fail: err => reject(err)
        });
      });

      if (bindResult.code === 1000) {
        this.setData({
          isDeviceBound: true,
          deviceInfo: bindResult.content || {}
        }, () => {
          this.updateImgReadyState();
          this.checkCanSubmit();
        });
        this.appendTestLog('✅ 设备绑定成功，可进行图片上传');
        wx.showModal({
          title: '结果',
          content: bindResult?.msg,
          showCancel: false
        });
      } else {
        wx.showModal({
          title: '结果',
          content: bindResult.msg || '设备绑定失败',
          showCancel: false
        });
      }
    } catch (error) {
      console.error('设备绑定全流程异常：', error);
      wx.showModal({
        title: '结果',
        content: '绑定请求异常，请检查网络后重试',
        showCancel: false
      });
    } finally {
      wx.hideLoading();
      this.setData({
        isSubmitting: false
      });
    }
  },
  handleNetworkTest(e) {
    if (!this.validateBeforeOperate()) return;
    const testType = e.currentTarget.dataset.type;
    const commandMap = {
      lock: 3,
      unlock: 1,
      findCar: 5,
      risk: 8,
      cancelRisk: 6
    };
    const command = commandMap[testType];
    if (!command) return;
    this.executeNetworkTestAction(command, testType);
  },
  executeNetworkTestAction(command, testType) {
    const {
      deviceInfo,
      checkForm,
      c_k1sw_link
    } = this.data;
    const actionName = this.getTestActionText(command);
    if (!deviceInfo?.sn) {
      this.appendTestLog(`❌【网络】${actionName} 失败：设备信息缺失`);
      return;
    }
    this.setTestStatus(command, 'testing');
    this.appendTestLog(`🚗【网络】开始${actionName} → 设备号：${checkForm.idc}`);
    wx.showLoading({
      title: '指令执行中...'
    });

    const reqUrl = `${c_k1sw_link}${u_operation.URL}`;
    const reqData = {
      sn: deviceInfo.sn,
      operationType: command,
      code: deviceInfo.code,
      _timestamp: Date.now()
    };

    byPost(reqUrl, reqData, (response) => {
      wx.hideLoading();
      try {
        const resData = response.data || {};
        if (resData.code === 1000) {
          this.setTestStatus(command, 'success');
          this.appendTestLog(`✅【网络】${actionName} 成功`);
        } else {
          this.setTestStatus(command, 'fail');
          this.appendTestLog(`❌【网络】${actionName} 失败：${resData.msg || '未知原因'}`);
        }
      } catch (error) {
        console.error('指令执行解析异常：', error);
        this.setTestStatus(command, 'fail');
        this.appendTestLog(`❌【网络】${actionName} 数据解析异常`);
      }
    });

    setTimeout(() => {
      wx.hideLoading();
    }, 8000);
  },
  setTestStatus(command, status) {
    const statusKeyMap = {
      3: 'lockStatus',
      1: 'unlockStatus',
      5: 'findCarStatus',
      8: 'riskStatus',
      6: 'cancelRiskStatus'
    };
    const key = statusKeyMap[command];
    if (key) {
      let update = {};
      update[`networkTestStatus.${key}`] = status;
      this.setData(update);
      this.checkCanSubmit();
    }
  },
  async handleSubmitFinalCheck() {
    const {
      checkForm
    } = this.data;
    const idc = checkForm.idc;
    const checkType = 1,
      checkState = 1;
    const userInfo = wx.getStorageSync('userKey') || {};
    const token = userInfo.token || '';

    wx.showLoading({
      title: '提交检测结果中...'
    });
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://fin3.wiselink.net.cn/fin/deviceTest/saveResult',
          method: 'GET',
          data: {
            idc,
            checkType,
            checkState,
            test: 'wiselink'
          },
          header: {
            token
          },
          success: resolve,
          fail: reject
        });
      });
      const resData = res?.data || {};
      if (resData.code === 1000) {
        wx.showModal({
          title: '提交成功',
          content: '设备全流程检测已完成！',
          showCancel: false,
          success: () => {
            wx.redirectTo({
              url: '/pages/index/index'
            });
          }
        });
      } else {
        wx.showToast({
          title: resData.msg || '提交失败',
          icon: 'none'
        });
        this.appendTestLog(`❌ 提交失败：${resData.msg || '未知错误'}`);
      }
    } catch (err) {
      console.error('提交检测结果失败：', err);
      wx.showToast({
        title: '请求异常，请重试',
        icon: 'none'
      });
      this.appendTestLog('❌ 检测结果提交失败：网络或接口异常');
    } finally {
      wx.hideLoading();
    }
  },
  getTestStatusText(status) {
    const map = {
      testing: '测试中',
      success: '成功',
      fail: '失败'
    };
    return map[status] || '';
  },
  getTestActionText(command) {
    const map = {
      3: '开锁',
      1: '关锁',
      5: '寻车',
      8: '风控拦截',
      6: '取消拦截'
    };
    return map[command] || command;
  },
  appendTestLog(content) {
    const time = new Date().toLocaleTimeString();
    let logList = [`[${time}] ${content}`, ...this.data.testLogList];
    if (logList.length > MAX_LOG_COUNT) {
      logList = logList.slice(0, MAX_LOG_COUNT);
    }
    this.setData({
      testLogList: logList
    }, () => {
      wx.createSelectorQuery().select('#logScroll').node().exec(res => {
        const scrollView = res[0]?.node;
        if (scrollView) scrollView.scrollTo(0, 0);
      });
    });
  }
})