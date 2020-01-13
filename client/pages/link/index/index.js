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
  onShow: function() {
    var that = this;
    that.updateData();
  },
  updateData: function() {
    var that = this;
    api.link_myJoin({
      success: function(res) {
        wx.hideLoading();
        if (res.result.list.length > 0) {
          that.setData({
            joinData: res.result.list.reverse()
          })
        }
      }
    })
    api.link_myCreate({
      success: function(res) {
        wx.hideLoading();
        if (res.result.data.length > 0) {
          that.setData({
            createData: res.result.data.reverse()
          })
        }
      }
    })
    if (app.globalData.enterGId) {
      this.setData({
        enterGId: app.globalData.enterGId
      })
      api.link_getGIDTask({
        data: {
          groupid: app.globalData.enterGId,
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
      url: '../enroll/enroll?taskid=' + e.currentTarget.dataset.taskid + '&isbool=false'
    })
  }
})