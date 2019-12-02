/**
 * @supported 00D3992C8F27 8B87B7345981
 */

let body = $response.body
body = JSON.parse(body)
let cnt = 0;

for (let i = body.data.length - 1; i >= 0; --i) {
    let e = body.data[i];
    if(e['id'].startsWith('AD_') || e['card_type'] == 'slot_event_card' ) {      
       body.data.splice(i,1)
       ++cnt
    } else if (e.common_card && e.common_card.feed_content && e.common_card.feed_content.source_line
              && e.common_card.feed_content.source_line.elements) {
       let elements = e.common_card.feed_content.source_line.elements
       for (let k = 0; k < elements.length; ++k) {
           let ee = elements[i]
           if (ee.text && ee.text.panel_text.indexOf('盐选推荐') >= 0) {
               body.data.splice(i,1)
               ++cnt
           }
       }
    }
}

let m = "remvoved " + cnt;
$notify("zhihu", "ads 2", m);

body=JSON.stringify(body)
$done(body)
