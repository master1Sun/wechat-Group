const api = require('../../../utils/apiCloud.js');
var app = getApp()
Page({
  data: {
    noticeid: '',
    baseData: '',
    year: '',
    viewer: '',
  },
  onLoad: function(opt) {
    wx.showShareMenu({
      withShareTicket: true
    })
    wx.hideShareMenu()
    let that = this;
    that.setData({
      noticeid: opt.noticeid
    })
    api.getNoticeTask({
      data: {
        noticeid: opt.noticeid
      },
      success: (res) => {
        if (res.result.data) {
          that.setData({
            noticeid: opt.noticeid,
            baseData: res.result.data[0],
            year: res.result.data[0].date.substring(0, 4)
          })
          that.storeViewer(opt.noticeid);
        }
      }
    })
    if (opt.isbool == 'true') {
      if (app.globalData.enterGId && app.globalData.enterGId != '') {
        this.storeNoticeGId(app.globalData.enterGId);
      }
    }
  },
  storeNoticeGId: function(gid) {
    var that = this;
    api.storeNoticeGId({
      data: {
        groupid: gid,
        noticeid: that.data.noticeid,
      },
      success: function(res) {}
    })
  },
  onShareAppMessage: function(res) {
    var that = this;
    return {
      title: '紧急通知',
      path: '/pages/notice/noticeDetail/noticeDetail?noticeid=' + that.data.noticeid + '&isbool=true',
    }
  },
  storeViewer: function(noticeid) {
    let that = this;
    api.storeViewerInfor({
      data: {
        noticeid
      },
      success: (res) => {
        that.getAllViewer(noticeid)
      }
    })
  },
  getAllViewer: function(noticeid) {
    let that = this;
    api.getAllViewer({
      data: {
        noticeid,
      },
      success: (res) => {
        that.setData({
          viewer: res.result.list
        })
      }
    })
  },
})