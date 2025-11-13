Page({
  data: {

    // 底部tabbar高度
    tabBarHeight: 120,
    // 轮播图数据（网络图片）
    bannerList: [
      'https://picsum.photos/750/300?random=10',
      'https://picsum.photos/750/300?random=11',
      'https://picsum.photos/750/300?random=12'
    ],

    // 公告数据
    noticeList: [
      '欢迎使用本小程序，新用户注册即送优惠券',
      '本周特惠活动：全场商品8折起',
      '会员专享福利，积分可兑换精美礼品'
    ],

    // 专区入口数据（网络图片）
    zoneList: [
      { img: 'https://picsum.photos/350/240?random=20', name: '精选商品' },
      { img: 'https://picsum.photos/350/240?random=21', name: '限时抢购' },
      { img: 'https://picsum.photos/350/240?random=22', name: '新品上市' },
      { img: 'https://picsum.photos/350/240?random=23', name: '品牌专区' }
    ],

    // 全宽轮播图数据（网络图片）
    fullBannerList: [
      'https://picsum.photos/750/200?random=30',
      'https://picsum.photos/750/200?random=31'
    ],

    // 海报图片（网络图片）
    posterImg: 'https://picsum.photos/750/400?random=40',

    // 底部tab数据（网络图片）
    tabList: [
      { icon: 'https://picsum.photos/50/50?random=50', name: '首页' },
      { icon: 'https://picsum.photos/50/50?random=51', name: '分类' },
      { icon: 'https://picsum.photos/50/50?random=53', name: '我的' }
    ],

    // 当前选中的tab索引
    currentTab: 0,
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
  // 转换背景图base64
  initialiImageBaseConversion() {
    const [o, l] = [this, [{ path: "/assets/images/index/bg.png", key: "s_background_picture_of_the_front_page" }]];
    (new class {
      constructor(t) {
        this.t = t;
        this.p = wx.getFileSystemManager();
        this.run();
      }
      run() {
        Promise.all(this.t.map((i, _, a) => new Promise((r, j) => this.p.readFile({
          filePath: i.path,
          encoding: 'base64',
          success: (d) => r({ [i.key]: `data:image/png;base64,${d.data}` })
        })))).then((s) => this.t[0] && o.setData(s.reduce((_, c) => ({ ..._, ...c }), {})));
      }
    }(l));
  },
  onLoad() {
    this.initialiImageBaseConversion()
  },
  onShow() {
    this.initSystemInfo()
  }

})