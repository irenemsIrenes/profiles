/**
 * @supported 00D3992C8F27
 */

let body = $response.body
body=JSON.parse(body)
body['data'].forEach((element, index)=> {
    if(element['id'].startsWith('AD_')){      
       body['data'].splice(index,1)
       $notify("zhihu", "ads", "remvoved");
    }
})
body=JSON.stringify(body)
$done(body)
