const {
  showLoading,
  hideLoading,
  showToast
} = require('../../../utils/Inspect/tips')
const {
  byGet,
  byPost,
  byPostJson
} = require('../../../utils/request/http')
const {
  u_nodeDetailList,
  u_nodeSubmit
} = require('../../../utils/request/dispatch')
const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../../utils/public').default
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0,
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    c_searchBarHeight: 70, // 搜索框高度，默认值
    c_bottom_seed: 80, //底部按钮高度
    c_totalNavHeight: (_handleWindowInfo.statusBarHeight || 0) + (_handleDeviceInfo.platform == 'ios' ? 49 : 44), // 总导航高度 = 状态栏高度 + 导航栏高度
    g_items: [],
    params: {},
    scrollBottom: 0,
    toView: ''
  },

  // 全屏背景
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
        _this.setData(dataToUpdate);
      });
  },
  // 查询列表
  getOrderList() {
    showLoading("加载中...");
    const param = {
      [u_nodeDetailList.companyId]: this.data.companyId,
      [u_nodeDetailList.read]: 1,

    };
    byGet(getApp().data.k1swUrl + u_nodeDetailList.URL, param).then(response => {
      hideLoading()
      if (response.statusCode == 200) {
        if (this.data.g_page > 1 && response.data.content.length === 0) {
          showToast(`已加载全部数据：共${this.data.g_items.length}条`);
        }
        this.setData({
          g_items: this.data.g_items.concat(response.data.content),
        }, () => {
          this.setData({
            toView: `msg${this.data.g_items.length - 1}`, // 滚动到最后一条消息
          });
        });
      } else {
        showToast('请求失败，请稍后再试');
      }
    })
  },
  // 内容输入回调
  handleBindinput(evt) {
    const {
      params
    } = this.data
    params[evt.currentTarget.dataset.item] = evt.detail.value
    this.setData({
      params: {
        ...params
      }
    })
  },
  // 发送
  handleSeed() {
    const {
      params,
      companyId
    } = this.data
    const requestParam = {
      companyId,
      content: params.content
    }
    byPost(getApp().data.k1swUrl + u_nodeSubmit.URL, requestParam, (response) => {
      this.setData({
        params: {}
      }, () => {
        this.getOrderList()
      })

    }, (error) => {
      showToast('获取信息失败，请重试');
    }, () => {
      hideLoading();
    });
  },
  onLoad(options) {
    this.setData({
      companyId: options?.id,
      g_items: []
    }, () => {
      this.getOrderList();
    })
  },


  onReady() {

  },


  onShow() {
    this.initialiImageBaseConversion()

  },

})