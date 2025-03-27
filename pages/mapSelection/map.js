Page({
  data: {
    latitude: 39.90469, // 默认纬度（北京）
    longitude: 116.40717, // 默认经度（北京）
    markers: [], // 标记点数组
    addressList: [],
    selectId: 0,
    initial_height: '50vh',
    the_previous_id: 0,
    the_previous_name: ''
  },

  // 监听输入框内容变化
  onInput(e) {
    const _this = this
    const key = e.detail.value
    wx.request({
      url: 'https://apis.map.qq.com/ws/place/v1/suggestion',
      data: {
        keyWord: encodeURIComponent(key),
        key: 'W66BZ-ADBC3-COB3F-YWZG4-MAVRO-IJBIM' // 替换为你的腾讯地图 API Key
      },
      success: (res) => {
        _this.setData({
          addressList: res.data.data
        })

      },
      fail: (err) => {
        wx.showToast({
          title: '请求失败，请重试',
          icon: 'none'
        });
      }
    });
  },
  handleSelectAddress(e) {
    const parameter = e.currentTarget.dataset.items
    this.setData({
      latitude: parameter.location.lat,
      longitude: parameter.location.lng,
      markers: {
        id: 1,
        latitude: parameter.location.lat,
        longitude: parameter.location.lng,
        name: parameter.title,
        iconPath: '/assets/images/home/map.png', // 标记点图标路径
        width: 30, // 图标宽度
        height: 30, // 图标高度
        callout: {
          content: parameter.title,
          color: '#ffffff',
          fontSize: 14,
          borderRadius: 10,
          bgColor: '#000000',
          padding: 5,
          display: 'ALWAYS'
        }
      },
      selectId: parameter.id
    });
  },
  handleBindFocus() {
    this.setData({
      initial_height: '30vh'
    })
  },
  handleBindBlur() {
    this.setData({
      initial_height: '50vh'
    })
  },
  handleConfirm(e) {
    const cacheKey = this.data.the_previous_id;
    const previousName = this.data.the_previous_name;
    const markers = this.data.markers;
    wx.getStorage({
      key: cacheKey,
      success: (res) => {
        let myObject = res.data || {};
        updateAndSaveObject(myObject, previousName, markers);
      },
      fail: () => {
        let myObject = {};
        updateAndSaveObject(myObject, previousName, markers);
      }
    });
  
    function updateAndSaveObject(obj, name, markers) {
      obj[name] = markers;
      wx.setStorage({
        key: cacheKey,
        data: obj,
        success: () => {
          wx.navigateBack({ delta: 1 });
        },
        fail: (error) => {
          console.error('Failed to save data to storage:', error);
          // 这里可以添加额外的错误处理逻辑，比如显示一个错误提示给用户
        }
      });
    }
  },
  onLoad: function (e) {
    this.setData({
      the_previous_id: e.id,
      the_previous_name: e.name
    })
  },
});