// 仅外部引入 u_operation
const {
  u_operation
} = require('../../../utils/request/map')
const {
  byGet,
  byPost
} = require('../../../utils/request/http')

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
    selectedImageList: [],
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
    c_k1sw_link: 'https://k1sw.wiselink.net.cn/', //域名
  },

  // 统一校验：判断是否满足提交条件
  checkCanSubmit() {
    const { networkTestStatus, isDeviceBound, isImageUploaded } = this.data
    const { lockStatus, unlockStatus, findCarStatus, riskStatus, cancelRiskStatus } = networkTestStatus

    // 五项检测全部完成
    const allTestFinish = lockStatus === 'success'
      && unlockStatus === 'success'
      && findCarStatus === 'success'
      && riskStatus === 'success'
      && cancelRiskStatus === 'success'

    this.setData({
      isNetworkTestFinished: allTestFinish
    })

    // 全部条件满足：绑定 + 传图 + 检测完成
    const canSubmit = isDeviceBound && isImageUploaded && allTestFinish
    this.setData({
      canSubmitFinalCheck: canSubmit
    })

    if (allTestFinish) {
      this.appendTestLog('🎉 网络模式全部检测完成！可提交检测')
    }
  },

  inputIdc(e) {
    this.setData({
      'checkForm.idc': e.detail.value
    })
  },

  inputCode(e) {
    this.setData({
      'checkForm.code': e.detail.value
    })
  },

  validateBeforeOperate() {
    const {
      checkForm,
      isDeviceBound,
      isImageUploaded
    } = this.data
    if (!checkForm.idc || !checkForm.code) {
      wx.showToast({
        title: '请先输入设备号和检验码',
        icon: 'none'
      })
      return false
    }
    if (!isDeviceBound) {
      wx.showToast({
        title: '请先绑定设备',
        icon: 'none'
      })
      return false
    }
    if (!isImageUploaded) {
      wx.showToast({
        title: '请先上传现场图片',
        icon: 'none'
      })
      return false
    }
    return true
  },

  /**
   * 设备绑定接口：本地内部实现，不外部引入
   */
  async handleDeviceBind() {
    const userInfo = wx.getStorageSync('userKey') || {}
    const token = userInfo.token || ''
    const {
      checkForm
    } = this.data
    if (!checkForm.idc || !checkForm.code) {
      wx.showToast({
        title: '请输入完整的设备号和检验码',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '设备绑定中...'
    })
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://k1sw.wiselink.net.cn/rentKeyApi/getBluetoothKey',
          method: 'GET',
          data: {
            sn: checkForm.idc,
            code: checkForm.code
          },
          header: {
            'token': token
          },
          success: res => resolve(res.data),
          fail: err => reject(err)
        })
      })
      if (res.code === 1000) {
        this.setData({
          isDeviceBound: true,
          deviceInfo: res.content || {}
        })
        // 绑定完成后重新校验提交状态
        this.checkCanSubmit()
        this.appendTestLog('✅ 设备绑定成功，可进行图片上传')
        wx.showToast({
          title: '绑定成功',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: res.msg || '设备绑定失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('设备绑定接口异常：', error)
      wx.showToast({
        title: '绑定请求异常',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  handleChooseImage() {
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          selectedImageList: res.tempFilePaths
        })
      },
      fail: (err) => {
        console.log('选择图片取消或失败：', err)
      }
    })
  },

  async handleBatchUploadImages() {
    const {
      selectedImageList,
      deviceInfo
    } = this.data
    if (selectedImageList.length < 4) {
      wx.showToast({
        title: '至少上传4张现场图片',
        icon: 'none'
      })
      return
    }
    if (!deviceInfo?.sn) {
      wx.showToast({
        title: '设备信息异常，请重新绑定',
        icon: 'none'
      })
      return
    }

    this.setData({
      isUploading: true
    })
    wx.showLoading({
      title: '开始上传图片...'
    })

    try {
      const total = selectedImageList.length
      for (let i = 0; i < total; i++) {
        wx.showLoading({
          title: `正在上传第 ${i + 1}/${total} 张`
        })
        await this.uploadSingleImage(selectedImageList[i])
      }
      this.setData({
        isImageUploaded: true
      })
      // 图片上传完成后重新校验提交状态
      this.checkCanSubmit()
      this.appendTestLog('✅ 图片全部上传成功！可开始功能检测')
      wx.showToast({
        title: '上传成功',
        icon: 'none'
      })
    } catch (error) {
      this.appendTestLog(`❌ 图片上传失败：${error}`)
      wx.showToast({
        title: '上传失败，请重试',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
      this.setData({
        isUploading: false
      })
    }
  },

  uploadSingleImage(filePath) {
    return new Promise((resolve, reject) => {
      const userInfo = wx.getStorageSync('userKey') || {}
      const token = userInfo.token || ''
      wx.uploadFile({
        url: 'https://k1sw.wiselink.net.cn/k7Api/uploadInstallImg',
        filePath,
        name: 'installImgs',
        header: {
          token
        },
        formData: {
          sn: this.data.deviceInfo.sn
        },
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data)
            if (data.code === 1000) resolve()
            else reject(data.msg || '上传失败')
          } catch (e) {
            reject('数据解析异常')
          }
        },
        fail: () => reject('网络异常')
      })
    })
  },

  handleNetworkTest(e) {
    if (!this.validateBeforeOperate()) return
    const testType = e.currentTarget.dataset.type
    const commandMap = {
      lock: 3,
      unlock: 1,
      findCar: 5,
      risk: 8,
      cancelRisk: 6
    }
    const command = commandMap[testType]
    if (!command) return
    this.executeNetworkTestAction(command, testType)
  },

  /**
   * 执行网络测试指令（增强版：带Loading + 超时提示）
   * @param {Number} command 指令码
   * @param {String} testType 操作类型
   */
  executeNetworkTestAction(command, testType) {
    const { deviceInfo, checkForm, c_k1sw_link } = this.data
    const actionName = this.getTestActionText(command)

    if (!deviceInfo?.sn) {
      this.appendTestLog(`❌【网络】${actionName} 失败：设备信息缺失`)
      return
    }

    this.setTestStatus(command, 'testing')
    this.appendTestLog(`🚗【网络】开始${actionName} → 设备号：${checkForm.idc}`)
    wx.showLoading({ title: '指令执行中...' })

    const reqUrl = `${c_k1sw_link}${u_operation.URL}`
    const reqData = {
      sn: deviceInfo.sn,
      operationType: command,
      code: deviceInfo.code,
      _timestamp: Date.now()
    }

    byPost(reqUrl, reqData, (response) => {
      wx.hideLoading()
      try {
        const resData = response.data || {}
        if (resData.code === 1000) {
          this.setTestStatus(command, 'success')
          this.appendTestLog(`✅【网络】${actionName} 成功`)
        } else {
          this.setTestStatus(command, 'fail')
          this.appendTestLog(`❌【网络】${actionName} 失败：${resData.msg || '未知原因'}`)
        }
      } catch (error) {
        console.error('指令执行解析异常：', error)
        this.setTestStatus(command, 'fail')
        this.appendTestLog(`❌【网络】${actionName} 数据解析异常`)
      }
    })

    // 超时兜底
    setTimeout(() => {
      wx.hideLoading()
    }, 8000)
  },

  setTestStatus(command, status) {
    const statusKeyMap = {
      3: 'lockStatus',
      1: 'unlockStatus',
      5: 'findCarStatus',
      8: 'riskStatus',
      6: 'cancelRiskStatus'
    }
    const key = statusKeyMap[command]
    if (key) {
      let update = {}
      update[`networkTestStatus.${key}`] = status
      this.setData(update)
      // 每次状态更新后，主动校验提交条件
      this.checkCanSubmit()
    }
  },

  async handleSubmitFinalCheck() {
    const { checkForm } = this.data
    const idc = checkForm.idc
    const checkType = 1
    const checkState = 1
    // 从缓存 userKey 读取 token
    const userInfo = wx.getStorageSync('userKey') || {}
    const token = userInfo.token || ''
  
    wx.showLoading({
      title: '提交检测结果中...'
    })
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://fin3.wiselink.net.cn/fin/deviceTest/saveResult',
          method: 'GET',
          data: {
            idc,
            checkType,
            checkState
          },
          header: {
            token: token
          },
          success: resolve,
          fail: reject
        })
      })
  
      // 解析接口返回数据
      const resData = res?.data || {}
      if (resData.code === 1000) {
        wx.showModal({
          title: '提交成功',
          content: '设备全流程检测已完成！',
          showCancel: false,
          success: () => {
            wx.redirectTo({
              url: '/pages/index/index'
            })
          }
        })
      } else {
        // 接口返回业务失败
        wx.showToast({
          title: resData.msg || '提交失败',
          icon: 'none'
        })
        this.appendTestLog(`❌ 提交失败：${resData.msg || '未知错误'}`)
      }
    } catch (err) {
      console.error('提交检测结果失败：', err)
      wx.showToast({
        title: '请求异常，请重试',
        icon: 'none'
      })
      this.appendTestLog('❌ 检测结果提交失败：网络或接口异常')
    } finally {
      wx.hideLoading()
    }
  },

  getTestStatusText(status) {
    const map = {
      testing: '测试中',
      success: '成功',
      fail: '失败'
    }
    return map[status] || ''
  },

  getTestActionText(command) {
    const map = {
      3: '开锁',
      1: '关锁',
      5: '寻车',
      8: '风控拦截',
      6: '取消拦截'
    }
    return map[command] || command
  },

  appendTestLog(content) {
    const time = new Date().toLocaleTimeString()
    const logList = [`[${time}] ${content}`, ...this.data.testLogList]
    this.setData({
      testLogList: logList
    })
  }
})