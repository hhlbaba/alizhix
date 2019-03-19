Page({
  data: {
    tickid: '',  //门票id
    ticket: '',  //门票信息
    baseurl: '',
    playtime: '',  //游玩时间
    endtime: '',  //日期筛选结束时间
    num: 1,   //门票数量
    userarr: [],  //所有游客
    onename: '',  //游客一信息
    onephone: '',//游客一信息
    oneidCard: '',//游客一信息
    thistime: '',  //当日时间
    orderid: '',   //订单号
    show: false,   //是否显示日历
    priceCalendar: [],   //价格日历
    calendarData: {},    //选中日期的价格日历数据
    maxCanBook: '', //可预订数
    minCanBook: 1, //最少预订,
    tickprice: '',
    sdata: '',
    dailyStock: '',
    supplierId: '',
    oftenlist: [],  //常用旅客
  },
  onLoad(options) {
    const app = getApp();
    this.setData({
      tickid: options.tickid,
      baseurl: app.globalData.baseurl,
      thistime: this.getNowFormatDate(),
      playtime: this.getNowFormatDate(),
      supplierId: app.globalData.supplierId
    })
    this.getoften();
  },
  onUnload() {
    clearInterval(this._timer);
  },
  onShow() {
    var openid = my.getStorageSync({ key: 'userid' }).data; // 缓存数据的key
    var that = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/auth/jwt/directSellinglogin',
      method: 'post',
      headers: { 'content-type': 'application/json;charset=UTF-8' },
      data: { 'wxopenid': openid, 'type': 3 },
      success(res) {
        if (res.data.code == 0) {
          my.setStorageSync({
            key: 'token',
            data: res.data.data
          });
          that.gettick(that.data.tickid);
          that.getdata();
          that.setData({
            userarr: []
          })
        }
      }
    });
  },
  //赋值手机号码
  initPhone() {
    var openid = my.getStorageSync({ key: 'userid' }).data; // 缓存数据的key
    my.httpRequest({
      url: this.data.baseurl + '/api/user/DSUser/getUserInfo?wxopenid=' + openid,
      headers: { 'content-type': 'application/json;charset=UTF-8' },
      success: (res) => {
        if (res.data.code === 0) {
          var newarr = this.data.userarr;
          newarr[0].mobile = res.data.data.phone;
          this.setData({
            userarr: newarr
          })
        }
      }
    });
  },
  getoften() {   //获取常用旅客
    var _self = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/order/direct/order/TopContactsList', // 目标服务器url
      headers: {
        'Authorization': my.getStorageSync({ key: 'token' }).data,
        'content-type': 'application/json;charset=UTF-8'
      },
      method: 'get',
      success: (res) => {
        if (res.data.code == 0) {
          if (res.data.data.length > 0) {
            for (var i = 0; i < res.data.data.length; i++) {
              res.data.data[i].ischoose = false
            }
          }
          _self.setData({
            oftenlist: res.data.data
          })
        }
      },
    });
  },
  oftenpeple(res) {
    if (res.target.dataset.list.ischoose) {
      this.data.oftenlist[res.target.dataset.index].ischoose = !this.data.oftenlist[res.target.dataset.index].ischoose; // 更新选中状态
      this.data.userarr[res.target.dataset.list.userlength].name = '';
      this.data.userarr[res.target.dataset.list.userlength].idCard = '';
      this.data.userarr[res.target.dataset.list.userlength].mobile = '';
      this.setData({
        oftenlist: this.data.oftenlist,
        userarr: this.data.userarr
      })
      return false;
    } else {
      if (this.data.userarr[0].idCard == '') {
        if (this.data.userarr[0].idCard == '' && this.data.userarr[0].mobile == '' && this.data.userarr[0].name == '') {
          this.data.userarr[0].name = res.target.dataset.list.name;
          this.data.userarr[0].idCard = res.target.dataset.list.idNumber;
          this.data.userarr[0].mobile = res.target.dataset.list.phone;
          this.data.oftenlist[res.target.dataset.index].ischoose = !this.data.oftenlist[res.target.dataset.index].ischoose; // 更新选中状态
          this.data.oftenlist[res.target.dataset.index].index = res.target.dataset.index;   //数组下标 传到数组
          this.data.oftenlist[res.target.dataset.index].userlength = 0;
        }
      } else if (this.data.userarr[0].mobile == '' && this.data.userarr[0].name == '') {
        this.data.userarr[0].name = res.target.dataset.list.name;
        this.data.userarr[0].mobile = res.target.dataset.list.phone;
        this.data.oftenlist[res.target.dataset.index].ischoose = !this.data.oftenlist[res.target.dataset.index].ischoose; // 更新选中状态
        this.data.oftenlist[res.target.dataset.index].index = res.target.dataset.index;   //数组下标 传到数组
        this.data.oftenlist[res.target.dataset.index].userlength = 0;
      }
      else {
        for (var j = 1; j < this.data.userarr.length; j++) {
          if (this.data.userarr[j].name == '' && this.data.userarr[j].idCard == '') {
            this.data.userarr[j].name = res.target.dataset.list.name;
            this.data.userarr[j].idCard = res.target.dataset.list.idNumber;
            this.data.oftenlist[res.target.dataset.index].userlength = j;
            this.data.oftenlist[res.target.dataset.index].ischoose = !this.data.oftenlist[res.target.dataset.index].ischoose; // 更新选中状态
            this.data.oftenlist[res.target.dataset.index].index = res.target.dataset.index;   //数组下标 传到数组
            this.setData({
              oftenlist: this.data.oftenlist,
              userarr: this.data.userarr
            })
            return
          }
        }
      }
    }
    this.setData({
      oftenlist: this.data.oftenlist,
      userarr: this.data.userarr
    })
  },
  //获取价格日历数据
  getCalendar() {
    let url = this.data.baseurl + '/api/product/ticketMobile/directSellingTicketPrice';
    let data = {
      ticketId: this.data.tickid
    };
    my.httpRequest({
      url: url,
      data: data,
      headers: {
        'Authorization': my.getStorageSync({ key: 'token' }).data,
        'content-type': 'application/json;charset=UTF-8'
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            priceCalendar: res.data.data,
          });
          for (let m of res.data.data) {
            if (m.dailyStock > 0 || m.dailyStock === -1) {
              this.setData({
                playtime: m.sellDate,
                dailyStock: m.dailyStock
              })
              break;
            }
          }
          let ndata = res.data.data;
          if (ndata.length !== 0) {
            this.setData({
              tickprice: ndata[0].marketAmount
            })
          }
          else {
            this.setData({
              tickprice: 0
            })
          }
        }
        // 显示最多可定张数
        if (this.data.dailyStock < this.data.sdata.maxBookNum && this.data.dailyStock !== -1 && this.data.sdata.maxBookNum !== 0) {
          this.setData({
            maxCanBook: this.data.dailyStock
          })
        } else if (this.data.dailyStock < this.data.sdata.maxBookNum && this.data.dailyStock === -1 && this.data.sdata.maxBookNum !== 0) {
          this.setData({
            maxCanBook: this.data.sdata.maxBookNum
          })
        } else if (this.data.dailyStock > this.data.sdata.maxBookNum && this.data.sdata.maxBookNum === 0) {
          this.setData({
            maxCanBook: this.data.dailyStock
          })
        } else if (this.data.dailyStock >= this.data.sdata.maxBookNum && this.data.sdata.maxBookNum !== 0) {
          this.setData({
            maxCanBook: this.data.sdata.maxBookNum
          })
        } else if (this.data.dailyStock < this.data.sdata.maxBookNum && this.data.sdata.maxBookNum === 0) {
          this.setData({
            maxCanBook: 0
          })
        }
      }
    })
  },
  getdata() {
    let url = this.data.baseurl + '/api/product/ticketMobile/directSellingTicketInfo';
    let data = {
      ticketId: this.data.tickid
    };
    my.httpRequest({
      url: url,
      data: data,
      success: (res) => {
        this.setData({
          sdata: res.data.data
        })
        this.setData({
          minCanBook: res.data.data.minBookNum //最少定
        })
        if (this.data.minCanBook > 1) {
          this.setData({
            num: this.data.minCanBook //最少定
          })
        }
        this.getCalendar();
        if (this.data.sdata.touristInfoType != 0) {
          this.data.userarr.unshift({ 'mobile': '', 'name': '', 'idCard': '' });
        } else {
          this.data.userarr.unshift({ 'mobile': '', 'name': '' });
        }

        this.setData({
          userarr: this.data.userarr
        })
        this.initPhone()
      }
    })
  },
  //控制价格日历打开关闭
  triggerCalendar: function () {
    this.setData({
      show: !this.data.show
    })
  },
  //选中价格日历成功后的回调函数
  onGetDate(data) {
    if (data && data.dailyStock >= -1) {
      this.setData({
        playtime: data.sellDate,
        tickprice: data.marketAmount
      })
      if (data.dailyStock !== -1 && this.data.sdata.maxBookNum !== 0) {    //获取最多可订张数
        this.setData({
          maxCanBook: Math.min(data.dailyStock, this.data.sdata.maxBookNum)
        })
      } else if (data.dailyStock !== -1 && this.data.sdata.maxBookNum === 0) {
        this.setData({
          maxCanBook: data.dailyStock
        })
      } else if (data.dailyStock === -1 && this.data.sdata.maxBookNum === 0) {
        this.setData({
          maxCanBook: 0
        })
      } else if (data.dailyStock === -1 && this.data.sdata.maxBookNum !== 0) {
        this.setData({
          maxCanBook: this.data.sdata.maxBookNum
        })
      } else {
        this.setData({
          maxCanBook: this.data.sdata.maxBookNum
        })
      }
      if (this.data.minCanBook > 1) {
        this.num = Math.min(this.data.minCanBook, this.data.maxCanBook);
      }
      this.setData({
        dailyStock: data.dailyStock,
      })
      this.triggerCalendar();
    }
  },
  buynow() {
    var _self = this;

    if (this.data.sdata.dailyStock === 0) {          //总库存为0
      var r = confirm("该票已售罄，无法下单，去看看其他门票？")
      if (r == true) {
        my.navigateTo({
          url: "../index/index"
        });
      }
      return false;
    }

    if (this.data.minCanBook > this.data.dailyStock && this.data.dailyStock !== -1) {          //总库存小于每日可定
      var r = confirm("当天库存不足，无法下单，去看看其他产品？")
      if (r == true) {
        my.navigateTo({
          url: "../index/index"
        });
      }
      return false;
    }
    this.data.userarr[0].name = '支付宝用户';
    //游客验证
    for (var y = 0; y < this.data.userarr.length; y++) {
      var obj = this.data.userarr[y];
      if (!this.checkName({ num: y, val: obj.name })) return false;

      if (this.data.sdata.touristInfoType === 0) {
        //无需填写
        if (!this.checkPhone({ num: y, val: obj.mobile })) return false;
      }
      if (this.data.sdata.touristInfoType === 1) {
        //只需要输入一个客人资料
        if (!this.checkPhone({ num: y, val: obj.mobile })) return false;
        if (!this.checkId({ num: y, val: obj.idCard })) return false;
      }
      if (this.data.sdata.touristInfoType === 2) {
        //要求输入每个客人资料
        if (y === 0) {
          if (!this.checkPhone({ num: y, val: obj.mobile })) return false;
        }
        if (!this.checkId({ num: y, val: obj.idCard })) return false;
      }
    }

    if (!this.checkIdRepeat(this.data.userarr)) return false;
    my.showLoading({
      content: '下单中请稍后',
    });
    my.httpRequest({
      url: this.data.baseurl + '/api/order/direct/order/create', // 目标服务器url
      data: { 'saleChannels': 3, 'departDate': this.data.playtime, 'productId': this.data.tickid, 'productNum': this.data.num, 'touristInfo': this.data.userarr },
      headers: { 'Authorization': my.getStorageSync({ key: 'token' }).data, 'content-type': 'application/json;charset=UTF-8' },
      method: "POST",
      success: (res) => {
        if (res.data.code == 0) {
          _self.setData({
            orderid: res.data.data.id
          })
          _self.getpayorder();
        } else {
          my.hideLoading();
          my.alert({
            title: '出问题啦',
            content: res.data.msg,
            buttonText: '我知道了',
          });
        }
      },
    });
  },
  //验证姓名
  checkName({ num, val }) {
    if (!val) {
      my.showToast({
        content: '姓名不得为空',
        duration: 2000,
      });
      return false;
    }

    var regname = /^([\u4e00-\u9fa5]){2,7}$/;
    if (!regname.test(val)) {
      my.showToast({
        content: '请输入2-8字以内的姓名',
        duration: 2000,
      });
      return false;
    }

    return true
  },
  //验证手机
  checkPhone({ num, val }) {
    var regphone = /^1(3|4|5|7|8)\d{9}$/;
    if (!regphone.test(val)) {
      my.showToast({
        content: '游客' + (num + 1) + '的手机号错误',
        duration: 2000,
      });
      return false;
    }

    return true
  },
  //验证身份证
  checkId({ num, val }) {
    if (!val) {
      my.showToast({
        content: '游客' + (num + 1) + '身份证号不得为空',
        duration: 2000,
      });
      return false;
    }

    var regidCard = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
    if (!regidCard.test(val)) {
      my.showToast({
        content: '游客' + (num + 1) + '身份证号错误',
        duration: 2000,
      });
      return false;
    }

    return true
  },
  //身份证重复
  checkIdRepeat(arr) {
    let repeatIdArr = [];//重复的id数组
    let repeatContactsArr = [];//重复的联系人数组

    //联系人两两比较
    for (let i = 0; i < arr.length; i++) {
      const prevObj = arr[i];//前一个联系人
      prevObj.num = i + 1;//序号
      if (repeatIdArr.indexOf(prevObj.idCard) > -1) {
        //当前联系人的id已经存在于 重复的id数组
        continue
      }

      let tempArr = [prevObj];//临时数组,存放本次循环重复的联系人
      for (let j = i + 1; j < arr.length; j++) {
        const nextObj = arr[j];//下一个联系人
        nextObj.num = j + 1;//序号
        if (prevObj.idCard === nextObj.idCard) {
          repeatIdArr.push(nextObj.idCard);//重复的id保存
          tempArr.push(nextObj)
        }
      }

      if (tempArr.length > 1) {
        //有重复的,保存repeatContactsArr重复的联系人数组
        tempArr.forEach(function (item) {
          repeatContactsArr.push(item)
        })
      }
    }

    if (repeatContactsArr.length > 0) {
      let nameStr = '';
      repeatContactsArr.forEach(function (item) {
        nameStr += '游客' + item.num + '，'
      });
      my.showToast({
        content: nameStr.slice(0, -1) + '身份证号重复',
        duration: 2000,
      });
      return false
    } else {
      return true
    }
  },
  getpayorder() {
    var _self = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/order/directSelling/aliCreateTrade',
      data: { 'orderId': this.data.orderid, 'buyerId': my.getStorageSync({ key: 'userid' }).data, 'merchantId': this.data.supplierId },
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      method: 'post',
      success: function (res) {
        my.hideLoading();
        if (res.data.code == 0) {
          my.tradePay({
            tradeNO: res.data.data,
            success: (res) => {
              if (res.resultCode == '9000') {
                my.showLoading({
                  content: '出票中请稍后',
                });
                //获取支付结果,1s一次,页面离开时销毁
                _self._timer = setInterval(function () {
                  _self.getcasemsg(_self.data.orderid)
                }, 1000)
              }
            }
          })
        }
      }
    })
  },
  getcasemsg(caseid) {
    var _self = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/order/directSelling/orderDetail', // 目标服务器url
      headers: { 'Authorization': my.getStorageSync({ key: 'token' }).data },
      data: { 'orderId': caseid },
      success: (res) => {
        if (res.data.code == 0) {
          if (res.data.data.orderStatus == 3) {
            my.hideLoading();
            my.redirectTo({
              url: '../order/order?orderid=' + caseid
            });
          }
        }
      },
    });
  },
  onename(res) {
    this.data.userarr[0].name = res.detail.value;
    this.setData({
      onename: res.detail.value,
      userarr: this.data.userarr
    })
  },
  onephone(res) {
    this.data.userarr[0].mobile = res.detail.value;
    this.setData({
      onephone: res.detail.value,
      userarr: this.data.userarr
    })
  },
  oneidCard(res) {
    this.data.userarr[0].idCard = res.detail.value;
    this.setData({
      oneidCard: res.detail.value,
      userarr: this.data.userarr
    })
  },
  gettick(id) {
    var _self = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/product/ticketMobile/directTicketDetail',
      data: { 'ticketId': this.data.tickid },
      success: (res) => {
        if (res.data.code == 0) {
          _self.setData({
            ticket: res.data.data
          })
        }
      },
    });
  },
  getNowFormatDate() {   //获取当前日期
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    this.setData({
      endtime: parseInt(date.getFullYear()) + 2 + seperator1 + month + seperator1 + strDate
    })
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
  },
  moretime() {   //更多日期按钮
    var _self = this;
    my.datePicker({
      format: 'yyyy-MM-dd',
      startDate: this.data.thistime,
      endDate: this.data.endtime,
      success: (res) => {
        _self.setData({
          playtime: res.date
        })
      }
    });
  },
  numodd() {
    if (this.data.num > this.data.minCanBook) {
      this.setData({
        num: this.data.num - 1,
        //userarr : this.data.userarr.
      })
      if (this.data.sdata.touristInfoType == 2) {
        this.data.userarr.pop()
        this.setData({
          userarr: this.data.userarr
        })
      }
    }
  },
  numadd() {
    if (this.data.num < this.data.maxCanBook || this.data.maxCanBook === 0) {
      this.setData({
        num: this.data.num + 1,
      })
      if (this.data.sdata.touristInfoType == 2) {
        this.data.userarr.push({ 'name': '', 'idCard': '' })
        this.setData({
          userarr: this.data.userarr
        })
      }
    }
  },
  idCardipt(num) {
    var oindex = num.target.dataset.index;
    this.data.userarr[oindex].idCard = num.detail.value;
    this.setData({
      userarr: this.data.userarr
    })
  },
  nameipt(num) {
    var oindex = num.target.dataset.index;
    this.data.userarr[oindex].name = num.detail.value;
    this.setData({
      userarr: this.data.userarr
    })
  }
});
