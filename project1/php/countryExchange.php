<?php

$executionStartTime = microtime(true) / 1000;

$ch = curl_init();
$url = 'https://v6.exchangerate-api.com/v6/' . $_REQUEST['apiKey'] . '/latest/' . $_REQUEST['currencyCode'];

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$resp = curl_exec($ch);

if ($resp === false) {
    $error = curl_error($ch);
    echo json_encode(['error' => $error]);
} else {
    $decoded = json_decode($resp, true);
    $countryCodes = array_keys($decoded['conversion_rates']); 

 
    echo json_encode(['countryCodes' => $countryCodes, 'data' => $decoded]);
}

curl_close($ch);

$executionEndTime = microtime(true) / 1000;
$executionTime = ($executionEndTime - $executionStartTime) . ' seconds';
?>
