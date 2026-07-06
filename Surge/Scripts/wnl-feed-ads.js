try {
  if (!$response.body) {
    $done({});
  } else {
    const body = JSON.parse($response.body);

    if (body && body.data && Array.isArray(body.data.ads)) {
      body.data.ads = [];
      $done({ body: JSON.stringify(body) });
    } else {
      $done({});
    }
  }
} catch (e) {
  console.log(`wnl-feed-ads.js: ${e.message}`);
  $done({});
}
