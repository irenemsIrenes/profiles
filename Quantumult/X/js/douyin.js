const nicknamePattern = /培训|吃货|公司|工艺品|文化传媒|探房|机械制造|健身|健康|购物车|游戏|卖衣服|团建|服务商|乐园$|微影|豪车|相亲会|减重|求婚策划|策划师|穿搭|格斗|车饰|说车|讲车|估车|房产|百货|训练营|团购|装修|男装|女装|童装|西服|服装|珠宝|剧场|电视[^台]*$|迷剧|扒剧|扒电影|粉丝团|电影|電影|剪辑|剪剧|影视|剧社|剪刀|影剪|侃剧|明星|看剧|追剧|撩剧|撩大片|手游|综艺|剪影|商贸|配音|娱乐|PM|追星|影院|编程|说大片|整形|观影|渣剪|网红|说剧|贸易/
const customVerify = /娱乐|^((?!三农).)*自媒体|贸易|明星|观影|机械制造|维修/
const descPattern = /娱乐圈|男装|电视剧|工作室|女装|剧场|剪辑|带货|观影|影视/
const signaturePattern = /剪辑|明星视频|西装/


const enabled_live = false; // 开启直播推荐，默认关闭

try {
  let body = $response.body.replace(/\"room_id\":(\d{2,})/g,'"room_id":"$1"');
  let obj = JSON.parse(body);
  if (obj.data) obj.data = filter_data(obj.data);
  if (obj.aweme_list) obj.aweme_list = filter_aweme_list(obj.aweme_list);
  if (obj.aweme_detail) obj.aweme_detail = filter_aweme_detail(obj.aweme_detail);
  $done({ body: JSON.stringify(obj) });
} catch (error) {
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
  
  if (author.signature && signaturePattern.test(author.signature)) {
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
  if (data && data.length > 0) {
    let i = data.length;
    while (i--) {
      let element = data[i].aweme;
      if (element.images) filter_images(element.images);
      if (element.video) filter_videos(element);
    }
  }
  return data;
}

function filter_aweme_list(aweme_list) {
  if (aweme_list && aweme_list.length > 0) {
    let i = aweme_list.length;
    while (i--) {
      let element = aweme_list[i];
      if (element.is_ads == true || is_block_content(element)) {
        aweme_list.splice(i, 1);
      } else if (element.images) {
        filter_images(element.images);
      } else if (element.video) {
        filter_videos(element);
      } else {
        if (!enabled_live) aweme_list.splice(i, 1);
      }
    }
  }
  return aweme_list;
}

function filter_aweme_detail(aweme_detail) {
  if (aweme_detail.images) filter_images(aweme_detail.images);
  if (aweme_detail.video) filter_videos(aweme_detail);
  return aweme_detail;
}

function filter_images(images) {
  let j = images.length;
  while (j--) {
    images[j].download_url_list = images[j].url_list;
  }
  return images;
}

function filter_videos(videos) {
  videos.status.reviewed = 1;
  videos.video_control.allow_download = true;
  videos.video_control.prevent_download_type = 0;
  delete videos.video.misc_download_addrs;
  const play_url = videos.video.play_addr;
  videos.video.download_addr = play_url;
  videos.video.download_suffix_logo_addr = play_url;
  return videos;
}
