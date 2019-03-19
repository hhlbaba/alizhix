Page({
  data: {
    baseurl: '',
    caseid: '',
    showmsg: '',  //xinxi
    supplierId: '',
    payType: '' //支付方式
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
          var a;
          res.data.data.touristInfo = JSON.parse(res.data.data.touristInfo)
          switch (res.data.data.payType) {
            case (1):
              a = '信用账户'; break;
            case (2):
              a = '六码合一'; break;
            case (3):
              a = '西安银行'; break;
            case (4):
              a = '支付宝'; break;
            case (5):
              a = '微信'; break;
            case (6):
              a = '翼支付'; break;
            case (7):
              a = '银联支付'; break;
            case (8):
              a = '京东支付'; break;
            case (9):
              a = 'QQ钱包支付'; break;
            case (10):
              a = '银行卡支付'; break;
            case (11):
              a = '西安银行卡'; break;
            case (12):
              a = '微信支付'; break;
            case (13):
              a = '支付宝'; break;
            case (14):
              a = '银联在线快捷支付'; break;
            case (15):
              a = '银联二维码扫码'; break;
            case (16):
              a = '翼支付'; break;
            case (17):
              a = '支付宝小程序支付'; break;
            case (100):
              a = '聚合支付'; break;
            case (200):
              a = '大额支付'; break;
          }
          _self.setData({
            payType: a,
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
              if (res.resultCode == '9000') {
                my.showLoading({
                  content: '出票中请稍后',
                });
                _self.getpaycasemsg(coco.target.dataset.id)
              }
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
