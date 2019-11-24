/**
 * @supported 00D3992C8F27
 */

$notify("zhihu", "ads", "remvoved");

let body = $response.body
body=JSON.parse(body)
body['data'].forEach((element, index)=> {
    if(element['id'].startsWith('AD_')){      
       body['data'].splice(index,1)  
    }
})
body=JSON.stringify(body)
$done(body)
