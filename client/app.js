const api = require('utils/apiCloud.js');

App({
  globalData: {
    openid: '',
    session_key: '',
    userInfo: '',
    opt: '',
    enterGId: '', //程序启动时获取的群ID
    windowHeight: '',
    statusBarHeight: '',
    islogin: false, //是否登录
  },
  onLaunch: function(opt) {
    if (!wx.cloud) {
      wx.showToast({
        title: '您的微信版本太低',
        icon: 'none',
        duration: 3000
      })
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'mybase-sun',
        traceUser: true,
      })
    }
    wx.getSystemInfo({
      success: e => {
        this.globalData.windowHeight = e.windowHeight;
        this.globalData.statusBarHeight = e.statusBarHeight;
      }
    })
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function(res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经上线啦~，为了获得更好的体验，建议立即更新',
              showCancel: false,
              confirmColor: "#5677FC",
              success: function(res) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            })
          })
          updateManager.onUpdateFailed(function() {
            // 新的版本下载失败
            wx.showModal({
              title: '更新失败',
              content: '新版本更新失败，为了获得更好的体验，请您删除当前小程序，重新搜索打开',
              confirmColor: "#5677FC",
              showCancel: false
            })
          })
        }
      })
    } else {
      // 当前微信版本过低，无法使用该功能
    }
    //获取用户是否登录
    this.login();
  },
  onShow(opt) {
    this.globalData.opt = opt;
    this.getGId().then(this.gIdCallback)
    this.globalData.islogin = false;
  },
  login: function() {
    const that = this;
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
        that.getUserInfo(); //获取用户信息
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        that.getUserInfo(); //用户授权，并存储用户信息
      }
    })
  },

  getGId: function(res) {
    const that = this;
    return new Promise((resolve, reject) => {
      if (that.noticeOpenIdReadyCallback) { //群通知页面定义app.noticeOpenIdReadyCallback实现回调
        that.noticeOpenIdReadyCallback()
      }
      if (that.globalData.opt.scene == '1044') { //获取转发的GID
        wx.getShareInfo({ /*小程序群里打开获取群信息模块 */
          shareTicket: that.globalData.opt.shareTicket,
          success: (res) => {
            api.getopenid({
              data: {
                weRunData: wx.cloud.CloudID(res.cloudID), // 这个 CloudID 值到云函数端会被替换
                obj: {
                  shareInfo: wx.cloud.CloudID(res.cloudID), // 非顶层字段的 CloudID 不会被替换，会原样字符串展示
                }
              },
              success: res => {
                resolve(res)
              }
            })
          }
        })
      }
    })
  },

  gIdCallback: function(res) {
    const that = this;
    let GId = res.result.event.weRunData.data.openGId;
    that.globalData.enterGId = GId;
    that.globalData.openid = res.result.openid;
    if (that.noticeGIdReadyCallback) {
      that.noticeGIdReadyCallback(GId)
    }
  },

  getUserInfo: function(cb) {
    const that = this;
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: (res) => {
          this.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(this.globalData.userInfo)
          let data = new Date();
          let todayDate = data.getFullYear() + '' + (data.getMonth() + 1) + '' + data.getDate();
          let storageday = wx.getStorageSync('loginDate')
          if (todayDate != storageday) {
            that.storeuserInfo(); //更新用户信息
          }
          that.storeuserInfo(); //更新用户信息
        },
        fail: () => {
          this.getAuthorize();
        }
      })
    }
  },

  getAuthorize: function() { //打开设置，让用户进行授权
    wx.showToast({
      title: '您还没有登录！！',
      icon: 'none',
      duration: 2000
    })
  },
  storeuserInfo: function() { //将登陆的用户详情信息存储到数据库
    let userInfo = this.globalData.userInfo;
    api.addUser({
      data: {
        avatarUrl: userInfo.avatarUrl, //用户信息：图像
        city: userInfo.city, //用户信息：所在城市
        gender: userInfo.gender, //用户信息：性别。0:未知，1：男，2：女
        language: userInfo.language, //用户信息：语言
        nickName: userInfo.nickName, //用户信息：姓名
        province: userInfo.province, //用户信息：省份
      },
      success: (res) => {
        let data = new Date();
        let todayDate = data.getFullYear() + '' + (data.getMonth() + 1) + '' + data.getDate();
        wx.setStorageSync('loginDate', todayDate)
      }
    })
  },
})