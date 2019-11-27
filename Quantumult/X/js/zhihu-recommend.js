/**
 * @supported 00D3992C8F27
 */

let body = $response.body
body = JSON.parse(body)
let cnt = 0;

for (let i = body.data.length - 1; i >= 0; --i) {
    let e = body.data[i];
    if(e['id'].startsWith('AD_') || e['card_type'] == 'slot_event_card' ) {      
       body.data.splice(i,1)
       ++cnt
    }
}

let m = "remvoved " + cnt;
$notify("zhihu", "ads 2", m);

body=JSON.stringify(body)
$done(body)
