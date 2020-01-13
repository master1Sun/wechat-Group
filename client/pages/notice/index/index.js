const api = require('../../../utils/apiCloud.js');
var app = getApp()
Page({
  data: {
    currentTab: 0,
    joinData: '',
    createData: '',
    groupData: '',
    showDialog: false,
    statusBarHeight: app.globalData.statusBarHeight < 50 ? 50 : app.globalData.statusBarHeight,
    scrollHeight: app.globalData.windowHeight - (app.globalData.statusBarHeight < 50 ? 50 : app.globalData.statusBarHeight),
    scrollTop: 0,
    enterGId: ''
  },
  onGotUserInfo(e) {
    if (e.detail.errMsg == "getUserInfo:ok") {
      app.getUserInfo()
      this.closeDialog()
      app.globalData.islogin = false
    }
  },
  onLoad: function(opt) {
    if (app.globalData.enterGId) {
      this.getGIdData(app.globalData.enterGId);
      this.setData({
        enterGId: app.globalData.enterGId
      })
    } else {
      app.noticeGIdReadyCallback = (gid) => {
        this.getGIdData(gid);
      }
    }
  },
  onShow: function() {
    if (app.globalData.islogin == true) {
      this.islogin()
    }
    this.getOpenIdData();
    if (app.globalData.enterGId) {
      this.getGIdData(app.globalData.enterGId);
      this.setData({
        enterGId: app.globalData.enterGId
      })
    }
  },
  openDialog: function() {
    this.setData({
      istrue: true
    })
  },
  closeDialog: function() {
    this.setData({
      istrue: false
    })
  },
  islogin() {
    let that = this;
    wx.checkSession({
      success() {
        wx.getUserInfo({
          success: () => {
            that.closeDialog()
          },
          fail: () => {
            that.openDialog()
          }
        })
      },
      fail() {
        that.openDialog()
      }
    })
  },
  getOpenIdData: function(openid) {
    var that = this;
    api.myView({
      success: function(res) {
        wx.hideLoading();
        if (res.result.list.length > 0) {
          that.setData({
            joinData: res.result.list.reverse()
          })
        }
      }
    })
    api.myCreate({
      success: function(res) {
        if (res.result.data.length > 0) {
          that.setData({
            createData: res.result.data.reverse()
          })
        }
      }
    })
  },
  getGIdData: function(gid) {
    var that = this;
    if (gid != '') {
      api.getGIDTask({
        data: {
          groupid: gid,
        },
        success: function(res) {
          wx.hideLoading();
          if (res.result.list.length > 0) {
            that.setData({
              groupData: res.result.list.reverse()
            })
          }
        }
      })
    }
  },
  swichNav: function(e) {
    var that = this;
    that.setData({
      currentTab: e.target.dataset.current,
      scrollTop: 0
    })
  },
  creat: function() {
    var that = this;
    wx.navigateTo({
      url: '../create/create'
    })
  },
  gotoEnroll: function(e) {
    var that = this;
    wx.navigateTo({
      url: '../noticeDetail/noticeDetail?noticeid=' + e.currentTarget.dataset.noticeid + '&isbool=false'
    })
  }
})