try {
  if (!$response.body) {
    $done({});
  } else {
    const body = JSON.parse($response.body);

    if (body && body.data && typeof body.data === "object" && !Array.isArray(body.data)) {
      let changed = false;

      Object.keys(body.data).forEach((key) => {
        if (Array.isArray(body.data[key])) {
          body.data[key] = [];
          changed = true;
        }
      });

      if (changed) {
        $done({ body: JSON.stringify(body) });
      } else {
        $done({});
      }
    } else {
      $done({});
    }
  }
} catch (e) {
  console.log(`cainiao-ads-batch-show.js: ${e.message}`);
  $done({});
}
