try {
    let obj = JSON.parse($response.body);
    if (obj.data) {
        obj.data.asp_ad_list = []
        obj.data.banner_list = []

    }
    $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`tieba-getPbData.js: ${e.message}, ${e.stack}`)
  $done({});
}
