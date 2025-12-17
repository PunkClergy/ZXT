const {
  u_getQrcodeImg,
  u_navlist20,
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
    contentList: []


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
          tabList: response.data.content,
          currentTab: (response?.data?.content)?.length - 1
        })
      }
    })
  },
  handleOnExistingAccountTap() {
    (0, wx.navigateTo)({ url: '/pages/system/managerLoginView/loginView' })
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
    console.log(evt)
    const info = evt?.currentTarget?.dataset?.info;
    if (!info || !info.pagePath) return;
    const { pagePath } = info;
    wx.navigateTo({
      url: `/${pagePath}`,
    });
  },
})