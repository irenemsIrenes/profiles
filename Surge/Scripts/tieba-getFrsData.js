try {
    let obj = JSON.parse($response.body);
    if (obj.data) {
        obj.data.ads_position_info = []
        obj.data.banner_list = []

    }
     $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`tieba-getFrsData.js: ${e.message}, ${e.stack}`)
  $done({});
}
