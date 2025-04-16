const {
  _handleWindowInfo,
  _handleDeviceInfo
} = require('../../utils/public').default
const {
  u_inquirySheet
} = require('../../utils/request/data_info')
const {
  byGet
} = require('../../utils/request/http')
Page({
  data: {
    c_screen_height: _handleWindowInfo.screenHeight || 0, //全高度
    c_statusBarHeight: _handleWindowInfo.statusBarHeight || 0, // 状态栏高度
    c_navBarHeight: _handleDeviceInfo.platform == 'ios' ? 49 : 44, // 导航栏高度，默认值
    s_platform_height: _handleDeviceInfo.platform == "ios" || _handleDeviceInfo.platform == "devtools" ? 95 : 60, //判断系统获取底部高度
    s_background_picture_of_the_front_page: '', //背景
    currentIndex: 0,
    scrollLeft: 0,
    tabs: [],
    ladder: false
  },

  // 切换tab
  handleSwitchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentIndex: index,
      scrollLeft: (index - 2) * 120,
      ladder: false
    });
  },
  // 阶梯价格显示和隐藏
  handleTabLadder() {
    const ladder = this.data.ladder
    this.setData({
      ladder: !ladder
    })
  },
  // 全图背景
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
  // 获取询价单
  handleuInquirySheet() {
    byGet(getApp().data.k1swUrl + u_inquirySheet.URL, {}).then(response => {
      const rspns = response.data.content
      const default_coll = [{
          producttypeName: '产品类别'
        },
        {
          deviceversionName: '硬件版号'
        },
        {
          hardwareprice: '硬件价格'
        },
        {
          stairsList: '阶梯价格'
        },
        {
          countryName: '国家'
        },
        {
          currency: '币种'
        },
        {
          serviceprice: '服务费价格(年)'
        },
        {
          useprice: '使用费'
        },
        {
          firstRecharge: '首次充值'
        },
        {
          cloudprice: '云端费(月)'
        },
        {
          otaprice: 'OTA对接(月)'
        },
        {
          rentPrice: '月租'
        },
        {
          deposit: '押金'
        },
        {
          installprice: '安装费'
        },
        {
          withkeyprice: '配钥匙价格-1'
        },
        {
          withkeyprice2: '配钥匙价格-2'
        },
        {
          withkeyprice3: '配钥匙价格-3'
        },
        {
          takecarepricel: '原车钥匙组装费'
        },
        {
          transportpricel: '拆除运输检验费'
        },
        {
          servicecommission: '渠道服务费'
        },
        {
          hardwarecommission: '硬件佣金'
        },
        {
          promotion1: '直销内部J23非首次绩效(%)'
        },
        {
          channelpromotionl: '渠道内部T23非首次绩效(%)'
        },
        {
          testStartDate: '体验开始时间'
        },
        {
          testStartDate: '体验结束时间'
        },
        {
          testDeposit: '体验押金'
        },
        {
          sns: '体验SN'
        },
        {
          priority: '价格优先级'
        }
      ]

      const default_list = rspns.map((ele, index) => {
        let temp = {
          title: ele.devicetypeName,
          list: default_coll.map(item => {
            const key = Object.keys(item)[0];
            return {
              key,
              label: item[key],
              value: ele[key]
            };
          })
        }
        return temp
      })

      console.log(default_list)
      this.setData({
        tabs: default_list,
        aggregate: rspns
      })
    })
  },
  onLoad(options) {},


  onReady() {

  },

  onShow() {
    this.initialiImageBaseConversion()
    this.handleuInquirySheet()
  },


  onHide() {

  },
})