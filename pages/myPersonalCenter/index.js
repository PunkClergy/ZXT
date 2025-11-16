const {
  u_bannerlist,
  u_midMenulist,
  u_menulist,
  u_rightMenulist,
  u_termialList,
  u_logo,
  u_getUserinfo,
  u_updateUserName,
  u_getQrcodeImg,
  u_getNotHaveMidMenulist,
  u_applyMenus,
  u_forceLogin
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
    tabList: [
      { icon: 'https://picsum.photos/50/50?random=50', name: '首页', path: '/pages/index/index' },
      { icon: 'https://picsum.photos/50/50?random=51', name: '采购下单', path: '/pages/orderList/orderList' },
      { icon: 'https://picsum.photos/50/50?random=53', name: '我的', path: '' }
    ],
    contentList: [
      { icon: 'https://picsum.photos/50/50?random=50', name: '我的专属客服', path: '' },
      { icon: 'https://picsum.photos/50/50?random=51', name: '分享朋友', path: '' },
      { icon: 'https://picsum.photos/50/50?random=53', name: '增设登录账号', path: '' },
      { icon: 'https://picsum.photos/50/50?random=51', name: '退出登录', path: '' },

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



  onLoad() {

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
    const idx = evt?.currentTarget?.dataset?.index;
    const targetUrl = this.data.tabList[idx]?.path;
    if (!targetUrl) return;
    const currentPage = getCurrentPages().slice(-1)[0];
    const currentPath = currentPage.route;
    const targetPurePath = targetUrl.split('?')[0];
    if (`/${currentPath}` !== targetPurePath) {
      wx.navigateTo({ url: targetUrl });
    }
  },
  // 返回上一页面
  handleBackHome() {
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },


})