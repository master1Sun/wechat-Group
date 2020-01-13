// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'mybase-sun'
})

const db = cloud.database()
const $ = db.command.aggregate
const _ = db.command


//生成日期格式
const formatTimeDay = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

let time = new Date()
time.setHours(time.getHours() + 8);
let ft = formatTimeDay(time);

let myDate = new Date();
myDate.setDate(myDate.getDate() - 7);
let nightDay = formatTimeDay(myDate);//获取7天前日期

// 云函数入口函数
exports.main = async(event, context) => {
  if (event.NODEJS == 'createVoteTask') {
    return await createVoteTask(event);
  } else if (event.NODEJS == "getGIDTask") {
    return await getGIDTask(event);
  } else if (event.NODEJS == "getQRCode") {
    return await getQRCode(event);
  } else if (event.NODEJS == "getVoteTask") {
    return await getVoteTask(event);
  } else if (event.NODEJS == "myCreate") {
    return await myCreate(event);
  } else if (event.NODEJS == "myJoin") {
    return await myJoin(event)
  } else if (event.NODEJS == "storeVoteGId") {
    return await storeVoteGId(event);
  } else if (event.NODEJS == "storeVoteOne") {
    return await storeVoteOne(event);
  }
}

async function createVoteTask(event) {
  const wxContext = cloud.getWXContext()
  return await db.collection('vote_task').add({
    data: {
      openid: wxContext.OPENID,
      voteid: event.voteid,
      title: event.title,
      description: event.description,
      optionData: event.optionData,
      date: event.date,
      time: event.time,
      noName: event.noName,
      radio: event.radio,
      createTime: ft
    }
  })
}

async function getGIDTask(event) {
  let data = await db.collection('vote_chatgroup').aggregate()
    .lookup({
      from: "vote_task",
      localField: "voteid",
      foreignField: "voteid",
      as: "noticeList",
    })
    .match({
      groupid: event.groupid,
      createTime: _.gte(nightDay)
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$noticeList', 0]), '$$ROOT'])
    })
    .project({
      noticeList: 0
    })
    .end()
  return data;
}

async function getQRCode(event) {

}

async function getVoteTask(event) {
  return await db.collection('vote_task').where({
    voteid: event.voteid,
    createTime: _.gte(nightDay)
  }).get()
}

async function myCreate() {
  const wxContext = cloud.getWXContext()
  return await db.collection('vote_task').where({
    openid: wxContext.OPENID,
    createTime: _.gte(nightDay)
  }).get()
}

async function myJoin() {
  const wxContext = cloud.getWXContext()
  let data = await db.collection('vote_user').aggregate()
    .lookup({
      from: "vote_task",
      localField: "voteid",
      foreignField: "voteid",
      as: "noticeList",
    })
    .match({
      openid: wxContext.OPENID,
      createTime: _.gte(nightDay)
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$noticeList', 0]), '$$ROOT'])
    })
    .project({
      noticeList: 0
    })
    .end()
  return data;
}

async function storeVoteGId(event) {
  let data = await db.collection('vote_chatgroup').where({
    voteid: event.voteid,
    groupid: event.groupid
  }).get()
  if (data.data.length <= 0) {
    await db.collection('vote_chatgroup').add({
      data: {
        voteid: event.voteid,
        groupid: event.groupid,
        createTime: ft
      }
    })
    return 'voteid加入群ID成功'
  } else {
    return 'voteid没加入群ID数据'
  }
}


async function storeVoteOne(event) {
  const wxContext = cloud.getWXContext()
  let data = await db.collection('vote_task').where({
    voteid: event.voteid
  }).update({
    data: {
      optionData: event.optionData,
      updateTime: ft
    }
  })
  let data1 = await db.collection('vote_user').add({
    data: {
      voteid: event.voteid,
      openid: wxContext.OPENID,
      createTime: ft
    }
  })
  if (data && data1) {
    return 'success'
  } else {
    return 'fail'
  }
}