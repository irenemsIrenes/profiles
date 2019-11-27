/**
 * @supported 00D3992C8F27
 */

let body = $response.body
body = JSON.parse(body)
let cnt = 0
body['data'].forEach((element, index)=> {
    let footer = element['footer']

    if(element['id'].startsWith('AD_') || (footer && ["Live 讲座","电子书"].indexOf(footer['label']) != -1) ) {      
       body['data'].splice(index,1)
       ++cnt
    }
})

if (removed) {
    $notify("zhihu", "ads", "remvoved " + cnt);
}

body=JSON.stringify(body)
$done(body)
