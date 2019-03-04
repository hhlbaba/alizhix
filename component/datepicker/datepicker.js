Component({
  mixins: [],
  data: {
    currentDay: 1,
    currentMonth: 1,
    currentYear: 2000,
    currentWeek: 1,
    days: [],
  },
  props: {
    hhl: '',
    show: false,
    priceCalendar: [],
    onGetDate: () => { },
  },
  didMount() { },
  didUpdate() {
    this.initData(this.props.priceCalendar[0].sellDate.substr(0,7));
  },
  didUnmount() { },
  methods: {
    initData(cur) {
      var date;
      if (cur) {
        date = new Date(cur);
      } else {
        var now = new Date();
        var d = new Date(this.formatDate(now.getFullYear(), now.getMonth() + 1, 1));
        d.setDate(35);
        date = new Date(this.formatDate(d.getFullYear(), d.getMonth() + 1, 1));
      }

      this.setData({
        currentDay: date.getDate(),
        currentYear: date.getFullYear(),
        currentMonth: date.getMonth() + 1,
      })

      this.currentWeek = date.getDay(); // 1...6,0
      if (this.currentWeek == 0) {
        this.currentWeek = 7;
      }
      var str = this.formatDate(this.data.currentYear, this.data.currentMonth, this.data.currentDay);
      this.data.days.length = 0;
      // 今天是周日，放在第一行第7个位置，前面6个
      //初始化本周
      for (var i = this.currentWeek - 1; i >= 0; i--) {
        var d = new Date(str);
        d.setDate(d.getDate() - i);
        var dayobject = {}; //用一个对象包装Date对象  以便为以后预订功能添加属性
        dayobject.day = d;
        this.data.days.push(dayobject);//将日期放入data 中的days数组 供页面渲染使用
      }
      //其他周
      for (var i = 1; i <= 42 - this.currentWeek; i++) {
        var d = new Date(str);
        d.setDate(d.getDate() + i);
        var dayobject = {};
        dayobject.day = d;
        this.data.days.push(dayobject);
      }

      for (let m of this.data.days) {
        m.date = m.day.getDate();
        m.month = m.day.getMonth() + 1;
      }

      let that = this;
      this.data.days.forEach(function (i) {
        i.hhlday = i.day.getFullYear() + '-' + that.formatNum(i.day.getMonth() + 1) + '-' + that.formatNum(i.day.getDate());
      });
      for (var m of that.data.days) {
        for (var n of that.props.priceCalendar) {
          if (m.hhlday === n.sellDate) {
            m.marketAmount = n.marketAmount;
            m.dailyStock = n.dailyStock;
            m.hhlData = n;
          }
        }
      }
      this.setData({
        days: this.data.days
      })
    },

    //格式化日期
    formatDate: function (year, month, day) {
      var y = year;
      var m = month;
      if (m < 10) m = "0" + m;
      var d = day;
      if (d < 10) d = "0" + d;
      return y + "-" + m + "-" + d
    },

    formatNum: function (val) {
      if (val < 10) {
        return '0' + val;
      } else {
        return val;
      }
    },

    //选择月
    pickPre() {
      // setDate(0); 上月最后一天
      // setDate(-1); 上月倒数第二天
      // setDate(dx) 参数dx为 上月最后一天的前后dx天
      var d = new Date(this.formatDate(this.data.currentYear, this.data.currentMonth, 1));
      d.setDate(0);
      this.initData(this.formatDate(d.getFullYear(), d.getMonth() + 1, 1));
    },

    pickNext() {
      var d = new Date(this.formatDate(this.data.currentYear, this.data.currentMonth, 1));
      d.setDate(35);
      this.initData(this.formatDate(d.getFullYear(), d.getMonth() + 1, 1));
    },

    getDate(event) {
      if (event.target.dataset.hhlData) {
        this.props.onGetDate(event.target.dataset.hhlData);
      }
    }
  },
});
