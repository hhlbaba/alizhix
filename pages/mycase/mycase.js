Page({
  data: {
    tabs: [
      {
        title: '全部订单',
        // badgeType: 'text',
        // badgeText: '1',
      },
      {
        title: '待支付',
        // badgeType: 'text',
        // badgeText: '2',
      },
      {
        title: '待游玩',
        // badgeType: 'text',
        // badgeText: '3',
      },
      {
        title: '退款',
        // badgeType: 'text',
        // badgeText: '4',
      },
    ],
    activeTab: 0,
    showlist: [],   //列表
    pages: 1,  //页码
    baseurl: '',  //
    supplierId: '',
    qrbol: false,  //qrcode 展示
    qrimg: '',   //二维码链接
    qrcode: '',  //二维码
  },
  onLoad(res) {
    const app = getApp();
    this.setData({
      activeTab: parseInt(res.state),
      baseurl: app.globalData.baseurl,
      supplierId: app.globalData.supplierId
    });
    // this.getticks();
  },
  goTop(e) {
    console.log(e)
  },
  onPageScroll(e) {
    console.log(e)
    if (e.scrollTop > 3502 * this.data.pages) {
      this.setData({
        pages: this.data.pages + 1
      })
      this.getticks()
    }
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
          that.getticks();
        }
      }
    })
  },
  onPullDownRefresh() {   //下拉刷新
    this.getticks();
  },
  getticks() {
    var _self = this;
    my.showLoading({
      content: '数据加载中',
    });
    my.httpRequest({
      url: this.data.baseurl + '/api/order/direct/order/orderList', // 目标服务器url
      headers: { 'Authorization': my.getStorageSync({ key: 'token' }).data },
      data: { 'status': this.data.activeTab, 'page': this.data.pages, 'supplierId': this.data.supplierId },
      success: (res) => {
        if (res.data.code == 0) {
          var ar = res.data.data.list;
          this.getOrderState(ar);
          for (var i = 0; i < ar.length; i++) {
            ar[i].selldirectImgPath = JSON.parse(ar[i].selldirectImgPath)
          }
          if (_self.data.pages == 1) {
            _self.setData({
              showlist: ar
            })
          } else {
            for (var j = 0; j < ar.length; j++) {
              _self.data.showlist.push(ar[j])
            }
            _self.setData({
              showlist: _self.data.showlist
            })
          }
          my.hideLoading();
        }
      },
      fail: () => {
        console.log('fail')
      }
    });
  },
  getOrderState(arr) {
    for (let i of arr) {
      if (i.refundStatus === 0 || i.refundStatus === 5) {
        if (i.orderStatus === 1) {
          i.hhlState = 1;     //待支付
        } else if (i.orderStatus === 2) {
          i.hhlState = 2;     //已取消
        } else if (i.orderStatus === 3 || i.orderStatus === 4) {
          i.hhlState = 3;     //待游玩
        } else if (i.orderStatus === 5 || i.orderStatus === 6 || i.orderStatus === 7) {
          i.hhlState = 4;     //已完成
        }
      } else {
        if (i.refundStatus === 1 || i.refundStatus === 2) {
          i.hhlState = 5;     //退款中
        }
        else if (i.refundStatus === 3 || i.refundStatus === 4) {
          i.hhlState = 6;     //已退款
        }
      }
    }
  },
  oddcase(res) {
    if (!confirm('确定要取消订单吗?')) return;

    var _self = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/order/direct/order/cancel', // 目标服务器url
      method: 'post',
      headers: { 'Authorization': my.getStorageSync({ key: 'token' }).data },
      data: { 'orderSn': res.target.dataset.ordersn },
      success: (res) => {
        if (res.data.code == 0) {
          _self.getticks();
          my.showToast({
            type: 'success',
            content: '取消成功',
            duration: 2000,
          });
        }
      },
    });
  },
  pay(coco) {
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
                my.redirectTo({
                  url: '../order/order?orderid=' + res.target.dataset.id
                });
              }
            }
          })
        }
      }
    })
  },
  buyagain(e) {
    var id = e.target.dataset.id
    let url = this.data.baseurl + '/api/product/ticketMobile/getStatusByTicketId?ticketId=' + id;
    my.httpRequest({      //判断是否产品下架或删除
      url: url,
      success: (res) => {
        if (res.data.code === 0) {
          if (res.data.data === 1) {
            my.navigateTo({
              url: '../adrlist/adrlist?id=' + e.target.dataset.id
            });
          } else {
            my.navigateTo({
              url: '../nopro/nopro'
            });
          }
        }
      }
    })
  },
  msgagain(res) {
    if (res.target.dataset.smscount == 3) {
      my.showToast({
        content: '重发次数已用完',
        duration: 2000,
      });
      return
    }

    var r = confirm("一个订单最多可发3次, 确定要重发短信吗?")
    if (r) {
      my.httpRequest({
        url: this.data.baseurl + '/api/order/direct/order/resendMessage',
        headers: { 'Authorization': my.getStorageSync({ key: 'token' }).data, 'content-type': 'application/json;charset=UTF-8' },
        method: 'post',
        data: { 'orderSn': res.target.dataset.ordersn },
        success: function (res) {
          if (res.data.code == 0) {
            my.showToast({
              type: 'success',
              content: '发送成功',
              duration: 2000,
            });
          }
        }
      })
    }
  },
  backmoney(res) {
    console.log(res.target.dataset);
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
  qrcode(res) {
    this.setData({
      qrimg: res.target.dataset.qr,
      qrbol: true,
      qrcode: res.target.dataset.qcode
    })
  },
  closebol() {
    this.setData({
      qrbol: false
    })
  },
  handleTabClick({ index }) {
    this.setData({
      activeTab: index,
    })
    this.getticks()
    console.log(this.data.activeTab)
  },
  handleTabChange({ index }) {
    this.setData({
      activeTab: index,
    });
    console.log(this.data.activeTab)
  },
  casemsg(id) {     //和申请退款时间冲突了有bug没解决
    my.navigateTo({
      url: '../order/order?orderid=' + id.target.dataset.caseid
    });
  },
  quxiao() {
    my.navigateTo({
      url: '../postback/postback'
    });
  }
});