try {
  if (!$response.body) {
    $done({});
  } else {
    const body = JSON.parse($response.body);
    const result = body && body.data && body.data.result;

    if (result && Array.isArray(result.flyAdList)) {
      result.flyAdList = [];
      $done({ body: JSON.stringify(body) });
    } else {
      $done({});
    }
  }
} catch (e) {
  console.log(`cainiao-flyad.js: ${e.message}`);
  $done({});
}
