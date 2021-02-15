const nicknamePattern = /减重|说车|讲车|估车|房产|百货|训练营|团购|装修|男装|((?!任何).)*公司|女装|童装|西服|服装|珠宝|剧场|电视|迷剧|扒剧|扒电影|粉丝团|电影|電影|剪辑|剪剧|影视|剧社|剪刀|影剪|侃剧|明星|看剧|追剧|撩剧|撩大片|手游|综艺|剪影|商贸|配音|娱乐|PM|追星|影院|编程|说大片|整形|观影|渣剪|网红|说剧|贸易/
const customVerify = /娱乐|^((?!三农).)*自媒体|贸易|明星|观影/
const descPattern = /男装|工作室|女装|剧场|剪辑|带货|观影/


try {
  let body = $response.body.replace(/\"room_id\":(\d{2,})/g,'"room_id":"$1"');
  let obj = JSON.parse(body);
  if (obj.data) obj.data = filter_data(obj.data);
  if (obj.aweme_list) obj.aweme_list = filter_list(obj.aweme_list);
  if (obj.aweme_detail) obj.aweme_detail = filter_detail(obj.aweme_detail);
  if (obj.aweme_details) obj.aweme_details = filter_details(obj.aweme_details);
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`douyin.js: ${e.message}, ${e.stack}`)
  $done($response.body);
}

function is_block_content(aweme) {
  let author = aweme.author
  if (!author) {
    return false
  }

  if (author.nickname && nicknamePattern.test(author.nickname)) {
    console.log(`Nickname: ${author.nickname}`)
    return true
  }
  
  if (author.signature && nicknamePattern.test(author.signature)) {
    console.log(`Signature: ${author.signature}`)
    return true
  }

  if (author.custom_verify && customVerify.test(author.custom_verify)) {
    console.log(`Custom verify: ${author.custom_verify}`)
    return true
  }
  
  if (aweme.desc && descPattern.test(aweme.desc)) {
    console.log(`Desc: ${aweme.desc}`)
    return true
  }

  return false
}

function filter_data(data) {
  for (var i = data.length - 1; i >= 0; i--) {
    if (data[i].aweme_info) {
      if (data[i].aweme_info.is_ads === true) {
        data.splice(i, 1);
      } else if (data[i].aweme_info.video) {
        data[i].aweme_info.status.reviewed = 1;
        data[i].aweme_info.video_control.prevent_download_type = 0;
        data[i].aweme_info.video_control.allow_download = true;
        delete data[i].aweme_info.video.misc_download_addrs;
        let play = data[i].aweme_info.video.play_addr.url_list;
        data[i].aweme_info.video.download_addr.url_list = play;
        let download = data[i].aweme_info.video.download_addr;
        data[i].aweme_info.video.download_suffix_logo_addr = download;
      }
    }
    if (data[i].aweme) {
      data[i].aweme.video_control.allow_download = true;
      data[i].aweme.video_control.prevent_download_type = 0;
      data[i].aweme.status.reviewed = 1;
      delete data[i].aweme.video.misc_download_addrs;
      let play = data[i].aweme.video.play_addr.url_list;
      data[i].aweme.video.download_addr.url_list = play;
      let download = data[i].aweme.video.download_addr;
      data[i].aweme.video.download_suffix_logo_addr = download;

      data[i].aweme.anchor_info = {}
      data[i].aweme.commerce_info = {}
    }
  }
  return data;
}

function filter_list(list) {
  let total = list.length
  for (var i = list.length - 1; i >= 0; i--) {
    if (list[i].video && list[i].is_ads != true && !is_block_content(list[i])) {
      list[i].video_control.allow_download = true;
      list[i].video_control.prevent_download_type = 0;
      list[i].status.reviewed = 1;
      delete list[i].video.misc_download_addrs;
      let play = list[i].video.play_addr.url_list;
      list[i].video.download_addr.url_list = play;
      let download = list[i].video.download_addr;
      list[i].video.download_suffix_logo_addr = download;
      if (list[i].anchor_info) {
        list[i].anchor_info = {}
      }
    } else {
      list.splice(i, 1);
    }
  }
  console.log(`recommend feed: removed ${total - list.length}`)
  return list;
}

function filter_detail(detail) {
  detail.status.reviewed = 1;
  detail.video_control.allow_download = true;
  detail.video_control.prevent_download_type = 0;
  let play = detail.video.play_addr.url_list;
  detail.video.download_addr.url_list = play;
  let download = detail.video.download_addr;
  detail.video.download_suffix_logo_addr = download;
  return detail;
}

function filter_details(details) {
  for (var i = details.length - 1; i >= 0; i--) {
    details[i].status.reviewed = 1;
    details[i].video_control.allow_download = true;
    details[i].video_control.prevent_download_type = 0;
    let play = details[i].video.play_addr.url_list;
    details[i].video.download_addr.url_list = play;
    let download = details[i].video.download_addr;
    details[i].video.download_suffix_logo_addr = download;
  }
  return details;
}
