Page({
  data: {
    baseurl: '',
    caseid: '',
    showmsg: '',  //xinxi
    supplierId: ''
  },
  onLoad(data) {
    const app = getApp();
    this.setData({
      baseurl: app.globalData.baseurl,
      caseid: data.orderid,
      supplierId: app.globalData.supplierId
    })
    this.getcasemsg();
  },
  gobackmsg() {
    my.navigateTo({
      url: '../backstate/backstate?id=' + this.data.caseid
    });
  },
  getcasemsg() {
    var _self = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/order/directSelling/orderDetail', // 目标服务器url
      headers: { 'Authorization': my.getStorageSync({ key: 'token' }).data },
      data: { 'orderId': this.data.caseid },
      success: (res) => {
        if (res.data.code == 0) {
          res.data.data.touristInfo = JSON.parse(res.data.data.touristInfo)
          _self.setData({
            showmsg: res.data.data
          })
        }
      },
    });
  },
  buyagain(res) {
    my.navigateTo({
      url: '../addorder/addorder?tickid=' + res.target.dataset.id
    });
  },
  backurl() {
    my.navigateTo({
      url: '../mycase/mycase?state=0'
    });
  },
  oddcase(res) {
    console.log(res)
    var _self = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/order/direct/order/cancel', // 目标服务器url
      method: 'post',
      headers: { 'Authorization': my.getStorageSync({ key: 'token' }).data },
      data: { 'orderSn': res.target.dataset.ordersn },
      success: (res) => {
        if (res.data.code == 0) {
          my.showToast({
            type: 'success',
            content: '取消成功',
            duration: 2000,
          });
          my.redirectTo({
            url: '../mycase/mycase?state=0',
          });
        }
      },
    });
  },
  pay(coco) {
    var _self = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/order/directSelling/aliCreateTrade',
      data: { 'orderId': coco.target.dataset.id, 'buyerId': my.getStorageSync({ key: 'userid' }).data, 'merchantId': this.data.supplierId },
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      method: 'post',
      success: function (res) {
        if (res.data.code == 0) {
          my.tradePay({
            tradeNO: res.data.data,
            success: (res) => {
              console.log(res)
              if (res.resultCode == '9000') {
                my.showLoading({
                  content: '出票中请稍后',
                });
                _self.getpaycasemsg(coco.target.dataset.id)
              }
            },
            fail: (res) => {
              console.log(res)
            }
          })
        }
      }
    })
  },
  getpaycasemsg(caseid) {
    var _self = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/order/directSelling/orderDetail', // 目标服务器url
      headers: { 'Authorization': my.getStorageSync({ key: 'token' }).data },
      data: { 'orderId': caseid },
      success: (res) => {
        if (res.data.code == 0) {
          if (res.data.data.orderStatus == 3) {
            my.hideLoading();
            _self.setData({
              showmsg: res.data.data
            })
          } else {
            setTimeout(function () {
              _self.getcasemsg(caseid)
            }, 1000)
          }
        }
      },
    });
  },
  backmoney(res) {
    if (res.target.dataset.isPartialRefund === 1 && res.target.dataset.verifyNum > 0) {
      my.showToast({
        content: '已有门票被使用，该订单不支持部分退款',
        duration: 2000,
      });
    } else {
      my.navigateTo({
        url: '../postback/postback?id=' + res.target.dataset.id + '&num=' + res.target.dataset.num + '&date=' + res.target.dataset.date + '&price=' + res.target.dataset.price + '&name=' + res.target.dataset.name
      })
    }
  },
});
