const {
  u_getQrcodeImg,
  u_navlist20,
  u_updateUserName,
  u_mylist
} = require('../../utils/request/home')
const {
  byGet,
  byPost,
  isLogin
} = require('../../utils/request/http')
Page({
  data: {
    // 底部tabbar高度
    tabBarHeight: 80,
    // 当前选中的底部tabbar索引
    currentTab: 2,
    // 原始链接
    c_link: 'https://k1sw.wiselink.net.cn/',
    // 咨询入群弹窗状态
    join_the_group_modal: false,
    // 底部tab数据（网络图片）
    tabList: [],
    // 增设账号弹窗
    create_an_account_modal: false,
    // 增设密码踢脚线信息
    account_info: {
    },
    // 增设密码提交后错误信息
    account_errorMsg: '',
    // 目录功能区
    contentList: [
    ]


  },
  // 获取系统头部各区域高度
  initSystemInfo() {
    const { statusBarHeight: s } = wx.getWindowInfo()
    const m = wx.getMenuButtonBoundingClientRect()
    if (!m) return
    const n = m.height + (m.top - s) * 2
    const c = wx.getWindowInfo().screenWidth - m.right
    this.setData({
      height_from_head: s,
      head_height: s + n,
      capsule_distance_to_the_right: c
    })
  },
  // 获取当前登录状态
  initLoginStatus() {
    wx.getStorage({
      key: 'userKey', // 替换为你的缓存键值
      success: res => {
        this.setData({
          account: res?.data?.companyName || res?.data?.username
        })
      },
      fail(err) {
        console.error("获取失败", err); // 失败时的错误信息
      }
    });
  },
  // 请求入群码
  initQrCode() {
    byGet(this.data.c_link + u_getQrcodeImg.URL, {}).then(response => {
      if (response.statusCode == 200) {
        this.setData({
          personal_qr_code: response.data.content.img
        })
      }
    })
  },
  // 获取底部导航数据
  initBottomDirectory() {
    byGet(this.data.c_link + u_navlist20.URL, {}).then(response => {
      if (response.statusCode == 200) {
        this.setData({
          tabList: response.data.content
        })
      }
    })
  },
  // 获取目录结构数据
  initDirectoryStructure() {
    byGet(this.data.c_link + u_mylist.URL, {}).then(response => {
      console.log(response)
      if (response.statusCode == 200) {
        this.setData({
          contentList: response.data.content
        })
      }
    })
  },

  onLoad() {
    getApp().data.funAreaId = '';
    // 请求底部导航数据
    this.initBottomDirectory()
    // 获取目录结构数据
    this.initDirectoryStructure()
  },
  onShow() {
    // 获取系统头部各区域高度
    this.initSystemInfo()
  },
  onReady() {
    // 获取登录状态
    this.initLoginStatus()
    // 获取入群二维码
    this.initQrCode()
  },


  // 点击“咨询” 显示入群二维码
  handleShowContact() {
    this.setData({ join_the_group_modal: true })
  },
  // 点击关闭咨询&群二维码
  handleQRClose() {
    this.setData({
      join_the_group_modal: false
    })
  },
  // 预览图片使其放大
  handleQRShowImageMask() {
    wx.previewMedia({
      sources: [{
        url: this.data.personal_qr_code, // 图片路径
        type: 'image',
      },],
    });
  },
  // 切换底部导航
  handleSwitchTabNavigation(evt) {
    const { currentTarget: { dataset: { index: idx = null } = {} } = {} } = evt ?? {};
    if (idx === null) return;
    const { tabList = [] } = this.data;
    const { pagePath: targetUrl } = tabList[idx] ?? {};
    if (!targetUrl) return;
    const [currentPage] = getCurrentPages().slice(-1);
    const { route: currentPath } = currentPage ?? {};
    if (!currentPath) return;
    const targetPurePath = targetUrl.split('?')[0];
    console.log(currentPath, targetPurePath);
    currentPath !== targetPurePath && wx.redirectTo({ url: `/${targetUrl}` });
  },
  // 返回上一页面
  handleBackHome() {
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  // 点击工具执行
  handleFunExe(evt) {
    const info = evt?.currentTarget?.dataset?.info;
    if (!info || !info.pagePath) return;
    const { pagePath } = info;
    if (pagePath == '退出登录') {
      wx.showModal({
        title: '提示',
        content: '确定要退出吗？',
        showCancel: true,
        cancelText: '取消',
        confirmText: '确定',
        success: (res) => {
          if (res.confirm) {
            const app = getApp();
            if (app?.data) app.data.userInfo = ''; // 安全修改全局数据
            try {
              wx.clearStorageSync();
            } catch (e) {
              console.error('清除存储失败', e);
            }
            wx.redirectTo({ url: '/pages/index/index' });
          }
        }
      });
      return;
    }
    if (pagePath === '增设登录账号') {
      const accountInfo = { ...this.data.account_info };
      accountInfo.mobile = getApp()?.data?.userInfo?.mobile || '';
      this.setData({
        create_an_account_modal: true,
        account_info: accountInfo
      });
      return
    }
    wx.navigateTo({
      url: `/${pagePath}`,
    });
  },
  // 关闭增设登录弹窗
  handleHideAnAccountModal() {
    this.setData({
      create_an_account_modal: false,
    })
  },
  // 增设密码输入回调
  handleInputCallback(evt) {
    const flag = evt?.currentTarget?.dataset?.flag
    const value = evt?.detail?.value
    const account_info = this.data.account_info
    account_info[flag] = value
    this.setData({
      account_info
    })
  },
  // 增设登录账号密码提交
  handleSubmitAnAccount() {
    const { newUserName, newPassword, confirmPassword } = this.data.account_info
    console.log(this.data.account_info)
    if (newUserName.length < 6) {
      this.setData({
        account_errorMsg: '账号长度不能小于6位'
      })
      return
    }

    if (confirmPassword.length < 6) {
      this.setData({
        account_errorMsg: '密码长度不能小于6位'
      })
      return
    }
    if (newPassword != confirmPassword) {
      this.setData({
        account_errorMsg: '密码两次输入不一致'
      })
      return
    }
    const params = {
      [u_updateUserName.newUserName]: newUserName,
      [u_updateUserName.newPassword]: confirmPassword,
      [u_updateUserName.userId]: getApp().data.userInfo.id
    }
    byPost(getApp().data.k1swUrl + u_updateUserName.URL, params, (res) => {
      const data = res.data;
      if (data.code == 1000) {
        showToast('修改成功')
        this.setData({
          create_an_account_modal: false,
          account_info: {},
          account_errorMsg: ''
        })
      } else {
        this.setData({
          account_errorMsg: data?.msg
        })
      }
    });

  },


})