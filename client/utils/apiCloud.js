const wxRequest = (params, url, tip) => {
  if (tip) {
    wx.showLoading({
      title: tip,
    })
  }
  Math.ceil(Math.random() * 10) == 1 ? wx.showNavigationBarLoading() : ''
  wx.cloud.callFunction({
    // 要调用的云函数名称
    name: url,
    data: params.data || {},
    success: res => {
      params.success && params.success(res)
    },
    fail: err => {
      params.fail && params.fail(err)
    },
    complete: c => {
      params.complete && params.complete(c)
      wx.hideLoading()
      wx.hideNavigationBarLoading()
    }
  })
}


/**用户信息 */
const getopenid = (params) => {
  params.data ? params.data.NODEJS = 'getOpenid' : params.data = {
    NODEJS: 'getOpenid'
  }
  wxRequest(params, 'userInfo')
}
const addUser = (params) => {
  params.data ? params.data.NODEJS = 'addUser' : params.data = {
    NODEJS: 'addUser'
  }
  wxRequest(params, 'userInfo')
}
/*结束 */


/**群通知接口 */
const myView = (params) => {
  params.data ? params.data.NODEJS = 'myView' : params.data = {
    NODEJS: 'myView'
  }
  wxRequest(params, 'notice')
}

const myCreate = (params) => {
  params.data ? params.data.NODEJS = 'myCreate' : params.data = {
    NODEJS: 'myCreate'
  }
  wxRequest(params, 'notice')
}
const createNoticeTask = (params) => {
  params.data ? params.data.NODEJS = 'createNoticeTask' : params.data = {
    NODEJS: 'createNoticeTask'
  }
  wxRequest(params, 'notice')
}

const getAllViewer = (params) => {
  params.data ? params.data.NODEJS = 'getAllViewer' : params.data = {
    NODEJS: 'getAllViewer'
  }
  wxRequest(params, 'notice')
}

const getGIDTask = (params) => {
  params.data ? params.data.NODEJS = 'getGIDTask' : params.data = {
    NODEJS: 'getGIDTask'
  }
  wxRequest(params, 'notice')
}

const getNoticeTask = (params) => {
  params.data ? params.data.NODEJS = 'getNoticeTask' : params.data = {
    NODEJS: 'getNoticeTask'
  }
  wxRequest(params, 'notice')
}


const storeNoticeGId = (params) => {
  params.data ? params.data.NODEJS = 'storeNoticeGId' : params.data = {
    NODEJS: 'storeNoticeGId'
  }
  wxRequest(params, 'notice')
}

const storeViewerInfor = (params) => {
  params.data ? params.data.NODEJS = 'storeViewerInfor' : params.data = {
    NODEJS: 'storeViewerInfor'
  }
  wxRequest(params, 'notice')
}

const notice_task_count = (params) => {
  params.data ? params.data.NODEJS = 'notice_task_count' : params.data = {
    NODEJS: 'notice_task_count'
  }
  wxRequest(params, 'notice')
}

/*结束 */


/**群投票 */
const createVoteTask = (params) => {
  params.data ? params.data.NODEJS = 'createVoteTask' : params.data = {
    NODEJS: 'createVoteTask'
  }
  wxRequest(params, 'vote')
}

const getGIDTask_vote = (params) => {
  params.data ? params.data.NODEJS = 'getGIDTask' : params.data = {
    NODEJS: 'getGIDTask'
  }
  wxRequest(params, 'vote')
}
const getQRCode = (params) => {
  params.data ? params.data.NODEJS = 'getQRCode' : params.data = {
    NODEJS: 'getQRCode'
  }
  wxRequest(params, 'vote')
}

const getVoteTask = (params) => {
  params.data ? params.data.NODEJS = 'getVoteTask' : params.data = {
    NODEJS: 'getVoteTask'
  }
  wxRequest(params, 'vote')
}

const myCreate_vote = (params) => {
  params.data ? params.data.NODEJS = 'myCreate' : params.data = {
    NODEJS: 'myCreate'
  }
  wxRequest(params, 'vote')
}

const myJoin = (params) => {
  params.data ? params.data.NODEJS = 'myJoin' : params.data = {
    NODEJS: 'myJoin'
  }
  wxRequest(params, 'vote')
}


const storeVoteGId = (params) => {
  params.data ? params.data.NODEJS = 'storeVoteGId' : params.data = {
    NODEJS: 'storeVoteGId'
  }
  wxRequest(params, 'vote')
}

const storeVoteOne = (params) => {
  params.data ? params.data.NODEJS = 'storeVoteOne' : params.data = {
    NODEJS: 'storeVoteOne'
  }
  wxRequest(params, 'vote')
}
/**结束 */



/**群活动 */

const link_creatjielongtask = (params) => {
  params.data ? params.data.NODEJS = 'creatjielongtask' : params.data = {
    NODEJS: 'creatjielongtask'
  }
  wxRequest(params, 'link')
}
const link_getGIDTask = (params) => {
  params.data ? params.data.NODEJS = 'getGIDTask' : params.data = {
    NODEJS: 'getGIDTask'
  }
  wxRequest(params, 'link')
}
const link_getTaskJoiner = (params) => {
  params.data ? params.data.NODEJS = 'getTaskJoiner' : params.data = {
    NODEJS: 'getTaskJoiner'
  }
  wxRequest(params, 'link')
}
const link_getjielongtask = (params) => {
  params.data ? params.data.NODEJS = 'getjielongtask' : params.data = {
    NODEJS: 'getjielongtask'
  }
  wxRequest(params, 'link')
}
const link_isEnrolled = (params) => {
  params.data ? params.data.NODEJS = 'isEnrolled' : params.data = {
    NODEJS: 'isEnrolled'
  }
  wxRequest(params, 'link')
}
const link_joinjielongtask = (params) => {
  params.data ? params.data.NODEJS = 'joinjielongtask' : params.data = {
    NODEJS: 'joinjielongtask'
  }
  wxRequest(params, 'link')
}
const link_myCreate = (params) => {
  params.data ? params.data.NODEJS = 'myCreate' : params.data = {
    NODEJS: 'myCreate'
  }
  wxRequest(params, 'link')
}
const link_storeGId = (params) => {
  params.data ? params.data.NODEJS = 'storeGId' : params.data = {
    NODEJS: 'storeGId'
  }
  wxRequest(params, 'link')
}
const link_viewjielongtask = (params) => {
  params.data ? params.data.NODEJS = 'viewjielongtask' : params.data = {
    NODEJS: 'viewjielongtask'
  }
  wxRequest(params, 'link')
}
const link_myJoin = (params) => {
  params.data ? params.data.NODEJS = 'myJoin' : params.data = {
    NODEJS: 'myJoin'
  }
  wxRequest(params, 'link')
}

/**结束 */
module.exports = {
  getopenid,
  addUser,
  myView,
  myCreate,
  createNoticeTask,
  notice_task_count,
  getAllViewer,
  getGIDTask,
  getNoticeTask,
  storeNoticeGId,
  storeViewerInfor,
  createVoteTask,
  getGIDTask_vote,
  getQRCode,
  getVoteTask,
  myCreate_vote,
  myJoin,
  storeVoteGId,
  storeVoteOne,
  link_creatjielongtask,
  link_getGIDTask,
  link_getTaskJoiner,
  link_getjielongtask,
  link_isEnrolled,
  link_joinjielongtask,
  link_myCreate,
  link_storeGId,
  link_viewjielongtask,
  link_myJoin
}