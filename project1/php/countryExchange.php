<?php

header('Content-Type: application/json');
$executionStartTime = microtime(true);

$apiKey = urlencode($_REQUEST['apiKey']);
$currencyCode = urlencode($_REQUEST['currencyCode']);
$url = "https://v6.exchangerate-api.com/v6/{$apiKey}/latest/{$currencyCode}";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);

if (!$result) {
    $error_msg = curl_error($ch);
    curl_close($ch);
    echo json_encode(['error' => 'CURL error: ' . $error_msg]);
    exit;
}

curl_close($ch);

$decodedResult = json_decode($result, true);
if (isset($decodedResult['error'])) {
    echo json_encode(['error' => $decodedResult['error']]);
    exit;
}

$countryCodes = array_keys($decodedResult['conversion_rates'] ?? []);
$executionEndTime = microtime(true);
$executionTime = $executionEndTime - $executionStartTime;

echo json_encode([
    'countryCodes' => $countryCodes,
    'data' => $decodedResult,
    'executionTime' => $executionTime
]);
?>
