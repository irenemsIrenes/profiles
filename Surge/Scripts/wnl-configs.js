try {
  if (!$response.body) {
    $done({});
  } else {
    const body = JSON.parse($response.body);

    if (body && typeof body === "object" && !Array.isArray(body)) {
      body.msg = {};
      $done({ body: JSON.stringify(body) });
    } else {
      $done({});
    }
  }
} catch (e) {
  console.log(`wnl-configs.js: ${e.message}`);
  $done({});
}
