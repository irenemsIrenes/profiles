/**
 * @supported 00D3992C8F27
 * The above random generated device ID can be found at the bottom of Quantumult X additional menu, and may be changed when system restored.
 * Indicate what device are supported by the file. This is necessary when the file is not loaded from local("On My iPhone - Quantumult X - Scripts").
 */

let body = $response.body
body=JSON.parse(body)
body['data'].forEach((element, index)=> {
    if(element['id'].startsWith('AD_')){      
       body['data'].splice(index,1)  
    }
})
body=JSON.stringify(body)
$done(body)
