App({
  globalData: {
    baseurl: 'https://api.zhiyousx.com',
    // baseurl : 'http://192.168.10.56:8765',
    // baseurl: 'https://beta.zhiyousx.com',
    supplierId: '',
  },
  onLaunch() {
    var app = getApp();
    if (my.getExtConfigSync()) {
      app.globalData.supplierId = my.getExtConfigSync().key;
    } else {
      app.globalData.supplierId = 192;
    }
    // this.getuserinfo()
  },
  onShow(options) {
    if (my.getStorageSync({ key: 'token' }).data) {
      my.httpRequest({
        url: this.globalData.baseurl + '/api/order/direct/order/orderList', // 目标服务器url
        headers: { 'Authorization': my.getStorageSync({ key: 'token' }).data },
        data: { 'status': 0, 'page': 1, 'supplierId': this.globalData.supplierId },
        success: (res) => {
          if (res.data.code == 40101) {
            my.removeStorageSync({ key: 'token' });
          }
        },
      });
    }
  },
  // getuserinfo() {
  //   my.getAuthCode({   //首次打开用户授权获取authCode
  //     scopes: 'auth_base',
  //     success: (res) => {
  //       my.setStorageSync({
  //         key: 'authcode',
  //         data: res.authCode,
  //       });
  //       my.getAuthUserInfo({    //获取头像和名字
  //         success: (userInfo) => {
  //           my.setStorageSync({
  //             key: 'nickName',
  //             data: userInfo.nickName,
  //           });
  //           my.setStorageSync({
  //             key: 'avatar',
  //             data: userInfo.avatar,
  //           });
  //         }
  //       });
  //     },
  //   });
  // },
  tabmine() {
  },
  islogin() {
    if (!my.getStorageSync({ key: 'token', }).data) {
      my.reLaunch({
        url: '../login/login'
      });
    }
  }
})