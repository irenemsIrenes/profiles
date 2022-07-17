try {
    let obj = JSON.parse($response.body);
    if (obj.adsAll) {
        obj.adsAll = {}

    }
     $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`zhidao-getqbcontent.js: ${e.message}, ${e.stack}`)
  $done({});
}
