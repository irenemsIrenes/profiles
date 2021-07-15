var modifiedHeaders = $request.headers;
if (!modifiedHeaders['Referer']) {
  modifiedHeaders['Referer'] = 'https://mo.fish/?class_id=%E5%85%A8%E9%83%A8&hot_id=1065'
}

$done({path: $request.path, headers : modifiedHeaders});
