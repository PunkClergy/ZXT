Component({
  properties: {
    visible: {
      type: Boolean,
      value: true
    }
  },
  data: {
    start_years: [],
    start_year: new Date().getFullYear(),
    start_months: [],
    start_month: new Date().getMonth() + 1,
    start_days: [],

    start_day: new Date().getDate(),
    start_hours: [],
    start_hour: '00', // 默认为'00'
    start_minutes: [],
    start_minute: '00', // 默认为'00'
    start_value: [2025, 0, 0, 0, 0], // 初始值索引，根据实际情况调整

    end_years: [],
    end_year: new Date().getFullYear(),
    end_months: [],
    end_month: new Date().getMonth() + 1,
    end_days: [],
    end_day: new Date().getDate(),
    end_hours: [],
    end_hour: '00', // 默认为'00'
    end_minutes: [],
    end_minute: '00', // 默认为'00'
    end_value: [2025, 0, 0, 0, 0], // 初始值索引，根据实际情况调整
  },
  observers: {
    'start_year, start_month': function (year, month) {
      this.generateDays('start', year, month);
    },
    'end_year, end_month': function (year, month) {
      this.generateDays('end', year, month);
    }
  },
  ready() {
    const date = new Date();
    const currentYear = date.getFullYear();

    // 初始化年份
    const years = Array.from({
      length: currentYear - 2000 + 1
    }, (_, i) => 2000 + i);

    // 初始化月份
    const months = Array.from({
      length: 12
    }, (_, i) => i + 1);

    // 初始化小时和分钟
    const hours = Array.from({
      length: 24
    }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({
      length: 60
    }, (_, i) => i.toString().padStart(2, '0'));

    // 设置初始数据
    this.setData({
      start_years: years,
      start_months: months,
      start_hours: hours,
      start_minutes: minutes,
      start_hour: date.getHours().toString().padStart(2, '0'),
      start_minute: date.getMinutes().toString().padStart(2, '0'),

      end_years: years,
      end_months: months,
      end_hours: hours,
      end_minutes: minutes,
      end_hour: date.getHours().toString().padStart(2, '0'),
      end_minute: date.getMinutes().toString().padStart(2, '0')
    });

    // 初始化起始时间和结束时间的天数
    this.generateDays('start', this.data.start_year, this.data.start_month);
    this.generateDays('end', this.data.end_year, this.data.end_month);
  },
  methods: {
    generateDays(type, year, month) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const days = Array.from({
        length: daysInMonth
      }, (_, i) => i + 1);
      this.setData({
        [`${type}_days`]: days
      });
    },
    bindChange(e, type) {
      const val = e.detail.value;
      const selectedYear = this.data[`${type}_years`][val[0]];
      const selectedMonth = this.data[`${type}_months`][val[1]];
      const selectedDay = this.data[`${type}_days`][val[2]];
      const selectedHour = this.data[`${type}_hours`][val[3]];
      const selectedMinute = this.data[`${type}_minutes`][val[4]];

      this.setData({
        [`${type}_year`]: selectedYear,
        [`${type}_month`]: selectedMonth,
        [`${type}_day`]: selectedDay,
        [`${type}_hour`]: selectedHour,
        [`${type}_minute`]: selectedMinute,
        [`${type}_value`]: val
      });

      this.triggerEvent('change', {
        year: selectedYear,
        month: selectedMonth,
        day: selectedDay,
        hour: selectedHour,
        minute: selectedMinute,
        type: type
      });
    },
    onCancel() {
      this.triggerEvent('cancel');
    },
    onConfirm() {
      const startDateTime = `${this.data.start_year}-${this.data.start_month.toString().padStart(2, '0')}-${this.data.start_day.toString().padStart(2, '0')} ${this.data.start_hour}:${this.data.start_minute}`;
      const endDateTime = `${this.data.end_year}-${this.data.end_month.toString().padStart(2, '0')}-${this.data.end_day.toString().padStart(2, '0')} ${this.data.end_hour}:${this.data.end_minute}`;

      this.triggerEvent('confirm', {
        startDateTime: startDateTime,
        endDateTime: endDateTime
      });
    },
    handleSubmitMask() {
      this.setData({
        visible: false
      });
      this.triggerEvent('submit', {
        info: this.data
      });
    },
    bindStartChange(e) {
      console.log(e)
      this.setData({ start_value: e.detail.value });
    },
  
    bindEndChange(e) {
      this.setData({ end_value: e.detail.value });
    },
  }
});