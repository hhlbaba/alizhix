Page({
  data: {
    adrs: [
      { 'src': '../images/timg.jpg', 'title': '产品产品名称名称产品名称产品产品名称名称产品名称产品产品名称名称产品名称', 'price': '88', 'oldprice': '99', 'iconshow': true },
      { 'src': '../images/timg.jpg', 'title': '产品产品名称名称产品名称产品产品名称名称产品名称产品产品名称名称产品名称', 'price': '88', 'oldprice': '99', 'iconshow': false },
      { 'src': '../images/timg.jpg', 'title': '产品产品名称名称产品名称产品产品名称名称产品名称产品产品名称名称产品名称', 'price': '88', 'oldprice': '99', 'iconshow': true },
    ],
    canIUseAuthButton: true,
    baseurl: '',
    pages: 1,
    adrlist: '',   //门票列表
    supplierId: '',
    swiperlist: '',  //轮播图
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    chooseicon: '',
    pagetitle: '',   //
  },
  onLoad() {
    const app = getApp();
    this.setData({
      baseurl: app.globalData.baseurl,
      supplierId: app.globalData.supplierId
    })
    var url = this.baseUrl + '/api/product/shop/selectShopDetail';
    my.httpRequest({
      url: url,
      data: {
        'Authorization': my.getStorageSync({ key: 'token' }).data,
        'id': app.globalData.supplierId

      },
      success: (res) => {
        if (res.data.code === 0 && res.data.data.state === 2) {
          my.navigateTo({
            url: "../shopClose/shopClose"
          });
        } else {
          //店铺没有关闭获取列表
          this.getList();
        }
      }
    })
  },

  getList() {
    my.httpRequest({
      url: this.data.baseurl + '/api/product/ticketMobile/shopimg/' + this.data.supplierId,
      data: { 'Authorization': my.getStorageSync({ key: 'token' }).data },
      method: 'get',
      success: (res) => {
        if (res.data.code == 0) {
          this.setData({
            swiperlist: res.data.data
          })
        }
      },
    });
  },

  clickicon(res) {
    this.setData({
      chooseicon: res.target.dataset.csid,
      pages: 1
    })
    this.getlist();
  },
  getswiper() {
    console.log('调')
  },
  getlist() {
    // my.showLoading({
    //   content: '数据加载中',
    // });
    var _self = this;
    my.httpRequest({
      url: this.data.baseurl + '/api/product/ticketMobile/ticketDirect/' + this.data.supplierId, // 目标服务器url
      data: { 'page': this.data.pages, 'Authorization': my.getStorageSync({ key: 'token' }).data, 'type': 3, tickettype: this.data.chooseicon },
      method: 'get',
      success: (res) => {
        if (res.data.code == 0) {
          // my.hideLoading();
          var ar = res.data.data.pullTicketMobileDirectInfoRespDTO;
          for (var i = 0; i < ar.length; i++) {
            ar[i].imagePath = JSON.parse(ar[i].imagePath)
          }
          if (_self.data.pages == 1) {
            _self.setData({
              adrlist: ar
            })
          } else {
            for (var j = 0; j < ar.length; j++) {
              _self.data.adrlist.push(ar[j])
            }
            _self.setData({
              adrlist: _self.data.adrlist
            })
          }
          //修改title
          my.setNavigationBar({
            title: res.data.data.shopName,
          });
        }
      },
    });
  },
  onShow() {
    // 页面显示
    this.getlist();
  },
  goadr(e) {
    // const app = getApp();
    // app.getuserinfo();
    my.navigateTo({
      url: "../adrlist/adrlist?id=" + e.target.dataset.id
    });
  },
  onPageScroll(e) {
    if (e.scrollTop > 3502 * this.data.pages) {
      this.setData({
        pages: this.data.pages + 1
      })
      this.getlist()
    }
  }
})