/**
 * @supported 00D3992C8F27
 */

let body = $response.body
body = JSON.parse(body)
let cnt = 0
body['data'].forEach((element, index)=> {

    if(element['id'].startsWith('AD_') || element['card_type'] == 'slot_event_card' ) {      
       body['data'].splice(index,1)
       ++cnt
    }
})

$notify("zhihu", "ads", "remvoved " + cnt);

body=JSON.stringify(body)
$done(body)
