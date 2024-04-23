<?php

header('Content-Type: application/json');

$executionStartTime = microtime(true);

$ch = curl_init();

$url = 'http://api.geonames.org/searchJSON?country=' . urlencode($_REQUEST['countryCode']) . '&cities=cities15000&username=dkamran&maxRows=10';

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);

if (!$result) {
    echo json_encode(['error' => 'CURL error: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$decoded = json_decode($result, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'Failed to parse JSON']);
    exit;
}

echo json_encode($decoded);

?>
