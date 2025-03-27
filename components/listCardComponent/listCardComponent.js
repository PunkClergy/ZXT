// components/listCardComponent/listCardComponent.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    // 字段数据
    items: {
      type: Object,
      value: {}
    },
    // 内容区域字段
    dataCollection: {
      type: Array,
      value: []
    },
    // 卡片类型
    // 【1：工单委托列表卡片；2：工单委托详情车辆信息卡片； 3：工单委托详情工单卡片；】
    listType: {
      type: Number,
      value: 0
    },
    // 头部左侧数据字段
    headDataSet: {
      type: Array,
      value: []
    },
    // 头部右侧数据字段
    stateCollection: {
      type: Array,
      value: []
    },
    // 额外字段
    dataAdditional:{
      type:Array,
      value:[]
    }

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handlecallParentMethod(e) {
      console.log(e)
      this.triggerEvent('handleCustomEvent', {
        info: e
      });
    }
  }
})