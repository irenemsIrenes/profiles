/**
 * @supported 00D3992C8F27 8B87B7345981
 */


var obj = JSON.parse($response.body);
if (obj.feeds) {
	let cnt = 0;
  for (var i = obj.feeds.length - 1; i >= 0; i--) {
    let feed = obj.feeds[i];
    if (feed.style1) {
    	let style1 = feed.style1;
    	if (style1.ad_card || (style1.header && style1.header.relation == "广告")) {
    		obj.feeds.splice(i, 1);
    		++cnt;
    	}
    }
  }
  obj.new = obj.new - cnt;
  obj.count = obj.count - cnt;
  console.log(`removed ${cnt}`)
}
$done({ body: JSON.stringify(obj) });
