const api = require('../../../utils/apiCloud.js');
var app = getApp()
var p = new Promise(function(resolve, reject) { //创建promise，确保页面加载数据前已经加载了openid!
  wx.login({
    success: function(res) {
      if (res.code) {
        api.getopenid({
          success: res => {
            app.globalData.openid = res.result.openid;
            resolve();
          }
        })
      } else {
        console.log('获取用户登录态失败！' + res.errMsg)
      }
    }
  });
})

Page({
  data: {
    taskid: '',
    taskData: '', //任务详细数据，如标题，发起人等
    joinerData: '', //参与活动的人员详情列表数据
    viewerData: '', //访问了该任务的人员全部数据
    viewerNumber: '', //访问了该任务的人员数量
    joinerNumber: '', //参与了该任务的人员数量
    okWord: '立即报名',
    isSignUp: false, //报名按钮
    enrollToast: false,
    joinerName: '',
    joinerTel: '',
    joinerRemark: '',
  },
  onLoad: function(opt) {
    wx.showShareMenu({
      withShareTicket: true
    })
    wx.hideShareMenu()
    var that = this;
    that.setData({
      taskid: opt.taskid,
    })
    if (opt.isbool == 'true') {
      if (app.globalData.enterGId && app.globalData.enterGId != '') {
        this.storeLinkGId(app.globalData.enterGId);
      }
    }
    wx.showLoading({
      title: '加载中...',
    })
    let ispeople = false;
    let istourist = false;
    api.link_getjielongtask({
      data: {
        taskid: opt.taskid,
      },
      success: function(res) {
        wx.hideLoading();
        var data0 = res.result.data[0]
        if (data0.noName) {
          ispeople = true
          if (data0.openid == app.globalData.openid) {
            istourist = true
          }
        } else {
          if (data0.openid == app.globalData.openid) {
            ispeople = true
            istourist = true
          }
        }
        that.setData({
          taskData: data0
        })
        if (app.globalData.openid) {
          that.getviewjielongtask(that, opt)
        } else {
          p.then(function() {
            that.getviewjielongtask(that, opt)
          })
        }
        if (ispeople) {
          api.link_getTaskJoiner({
            data: {
              taskid: opt.taskid,
            },
            success: function(res) {
              var data0 = res.result.joinerList;
              var data1 = res.result.viewerList;
              that.setData({
                joinerData: data0
              })
              if (istourist) {
                that.setData({
                  viewerData: data1
                })
              }
            }
          })
        }
      }
    })
  },
  islogin() {
    let that = this;
    wx.checkSession({
      success() {
        wx.getUserInfo({
          fail: () => {
            app.globalData.islogin = true
            wx.switchTab({
              url: '../../notice/index/index',
            })
          }
        })
      },
      fail() {
        app.globalData.islogin = true
        wx.switchTab({
          url: '../../notice/index/index',
        })
      }
    })
  },
  getviewjielongtask(that, opt) {
    api.link_viewjielongtask({
      data: {
        taskid: opt.taskid,
      },
      success: function(res) {
        var data0 = res.result.data;
        var joinerNumber0 = 0;
        for (var i = 0; i < data0.length; i++) { //计算有多少参与者
          if (data0[i].userid) {
            joinerNumber0++
          }
        }
        that.setData({
          viewerNumber: data0.length,
          joinerNumber: joinerNumber0,
        })
        var enroll = function(data) { //定义立即报名状态判定模块
          var enrolledResult = false;
          for (var i = 0; i < data.length; i++) {
            if (data[i].userid == app.globalData.openid) {
              enrolledResult = true;
              break;
            }
          }
          if (enrolledResult) {
            that.setData({
              okWord: '修改报名信息',
              joinerName: app.globalData.userInfo.nickName,
              isSignUp: true
            })
          } else {
            let ncum = Number(that.data.taskData.peopleNumber) == 0 ? 9999 : Number(that.data.taskData.peopleNumber)
            if (ncum > that.data.joinerNumber) {
              that.setData({
                okWord: '立即报名',
                joinerName: app.globalData.userInfo.nickName,
                isSignUp: true
              })
            }
          }
        }
        enroll(data0); //获取立即报名按钮状态
      }
    })
  },
  storeLinkGId: function(gid) {
    var that = this;
    api.link_storeGId({
      data: {
        groupid: gid,
        taskid: that.data.taskid,
      },
      success: function(res) {}
    })
  },
  onShareAppMessage: function(res) {
    var that = this;
    return {
      title: '我发布了一个活动，参加的快来报名啦！！',
      path: `/pages/link/enroll/enroll?taskid=${that.data.taskid}&isbool=true`,
    }
  },
  ok: function() {
    this.islogin() //判断是否登录
    var that = this;
    that.setData({
      enrollToast: true,
    })
  },
  cancel: function() {
    var that = this;
    that.setData({
      enrollToast: false,
    })
  },
  bindJoinerNameInput: function(e) {
    var that = this;
    that.setData({
      joinerName: e.detail.value,
    });
  },
  bindJoinerTelInput: function(e) {
    var that = this;
    that.setData({
      joinerTel: e.detail.value,
    });
  },
  bindJoinerRemarkInput: function(e) {
    var that = this;
    that.setData({
      joinerRemark: e.detail.value,
    });
  },
  join: function() {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    api.link_joinjielongtask({
      data: {
        taskid: that.data.taskid,
        joinerName: that.data.joinerName,
        joinerTel: that.data.joinerTel,
        joinerRemark: that.data.joinerRemark,
      },
      success: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '报名成功',
          icon: 'success',
          duration: 2000
        });
        that.setData({
          okWord: '已报名',
          joinerNumber: Number(that.data.joinerNumber) + 1,
          enrollToast: false,
        });
        wx.redirectTo({ //刷新页面
          url: '../enroll/enroll?taskid=' + that.data.taskid
        })
      }
    })
  },
})