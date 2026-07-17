try {
  if (!$response.body) {
    $done({});
  } else {
    const body = JSON.parse($response.body);

    if (body && Array.isArray(body.data)) {
      body.data = [];
      $done({ body: JSON.stringify(body) });
    } else {
      $done({});
    }
  }
} catch (e) {
  console.log(`wnl-feed-ads-posids.js: ${e.message}`);
  $done({});
}
